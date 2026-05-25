import csv
import io
import os
import tempfile

import xlsxwriter
from fastapi import HTTPException

from lib.bi_helper import (
    bi_login,
    bi_logout,
    friendly_bi_error,
    get_bip_PublicReportService_url,
    get_dynamic_sql_report_path,
    run_bi_sql_in_session,
)


def safe_sheet_name(name: str, used_names: set[str]) -> str:
    """Ensure a safe sheet name (<=31 chars, no invalid chars, unique)."""
    safe = "".join(ch if ch not in '[]:*?/\\' else "_" for ch in name)[:31]
    candidate = safe or "Sheet"
    counter = 2
    while candidate in used_names:
        tail = f" ({counter})"
        candidate = f"{safe[:max(1, 31 - len(tail))]}{tail}"
        counter += 1
    used_names.add(candidate)
    return candidate


def _create_formats(workbook: xlsxwriter.Workbook) -> dict[str, xlsxwriter.format.Format]:
    return {
        "header": workbook.add_format(
            {
                "bold": True,
                "border": 1,
                "align": "center",
                "valign": "vcenter",
                "bg_color": "#E6F0FA",
            }
        ),
        "cell": workbook.add_format({"border": 1, "valign": "top"}),
        "title": workbook.add_format({"bold": True, "font_size": 14}),
        "link": workbook.add_format({"font_color": "blue", "underline": True}),
        "module_header": workbook.add_format({"bold": True, "font_size": 11}),
        "go_index": workbook.add_format(
            {"bold": True, "font_color": "blue", "underline": True}
        ),
        "error": workbook.add_format({"border": 1, "font_color": "red"}),
    }


def _build_sheet_plan(
    sql_items: list[tuple[str, str, str]]
) -> list[dict[str, str]]:
    used_sheet_names: set[str] = set()
    plan: list[dict[str, str]] = []

    for module, report_name, sql_query in sql_items:
        raw_sheet = str(report_name).strip()[:28]
        sheet_name = safe_sheet_name(raw_sheet, used_sheet_names)
        plan.append(
            {
                "module": str(module).strip() or "Misc",
                "report_name": str(report_name).strip() or "Untitled Report",
                "sql_query": sql_query,
                "sheet_name": sheet_name,
            }
        )

    return plan


def _write_index_sheet(
    workbook: xlsxwriter.Workbook,
    sheet_plan: list[dict[str, str]],
    formats: dict[str, xlsxwriter.format.Format],
) -> str:
    index_name = "Index"
    index_ws = workbook.add_worksheet(index_name)
    index_ws.write(0, 0, "Configuration Workbook - Index", formats["title"])

    row = 2
    current_module = None
    sequence = 1

    for entry in sheet_plan:
        module = entry["module"]
        if module != current_module:
            current_module = module
            sequence = 1
            index_ws.write(row, 0, f"Module: {module}", formats["module_header"])
            row += 1

        index_ws.write(row, 0, sequence)
        index_ws.write_url(
            row,
            1,
            f"internal:'{entry['sheet_name']}'!A1",
            formats["link"],
            string=entry["report_name"],
        )
        sequence += 1
        row += 1

    index_ws.set_column(0, 0, 10)
    index_ws.set_column(1, 1, 40)
    return index_name


def _write_csv_sheet(
    workbook: xlsxwriter.Workbook,
    entry: dict[str, str],
    csv_bytes: bytes | None,
    index_name: str,
    formats: dict[str, xlsxwriter.format.Format],
    error_message: str | None = None,
) -> None:
    worksheet = workbook.add_worksheet(entry["sheet_name"])
    worksheet.write_url(
        0,
        0,
        f"internal:'{index_name}'!A1",
        formats["go_index"],
        string="Go to Index",
    )
    worksheet.write(1, 0, entry["report_name"], formats["title"])

    data_row = 3
    if error_message:
        worksheet.write(data_row, 0, f"Execution failed: {error_message}", formats["error"])
        worksheet.set_column(0, 0, min(max(len(error_message) + 18, 30), 80))
        return

    if not csv_bytes:
        worksheet.write(data_row, 0, "(No data returned)", formats["cell"])
        worksheet.set_column(0, 0, 30)
        return

    buffer = io.BytesIO(csv_bytes)
    text_stream = io.TextIOWrapper(buffer, encoding="utf-8-sig", newline="")
    reader = csv.reader(text_stream)

    max_widths: list[int] = []
    wrote_row = False

    for row_index, row in enumerate(reader, start=data_row):
        wrote_row = True
        row_format = formats["header"] if row_index == data_row else formats["cell"]

        for column_index, value in enumerate(row):
            cell_text = value if value is not None else ""
            worksheet.write(row_index, column_index, cell_text, row_format)

            width = min(max(len(cell_text), 8), 60)
            if column_index >= len(max_widths):
                max_widths.append(width)
            else:
                max_widths[column_index] = min(max(max_widths[column_index], width), 60)

    if not wrote_row:
        worksheet.write(data_row, 0, "(No data returned)", formats["cell"])
        worksheet.set_column(0, 0, 30)
        return

    for column_index, width in enumerate(max_widths):
        worksheet.set_column(column_index, column_index, width + 2)


def run_sqls_config_generation(
    username: str,
    password: str,
    url: str,
    sql_items: list[tuple[str, str, str]],
) -> tuple[str, list[str]]:
    """
    Execute SQLs against Oracle BI and build the workbook directly on disk.
    This avoids holding the entire Oracle CSV payload and final Excel file in RAM.
    """
    if not sql_items:
        raise HTTPException(status_code=400, detail="No SQLs selected for execution.")

    dyn_report_path = get_dynamic_sql_report_path(username)
    dyn_template = "blank_en_US"
    sheet_plan = _build_sheet_plan(sql_items)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
    temp_path = temp_file.name
    temp_file.close()

    workbook = xlsxwriter.Workbook(temp_path, {"constant_memory": True})
    formats = _create_formats(workbook)
    index_name = _write_index_sheet(workbook, sheet_plan, formats)

    session_token = None
    http_session = None
    errors: list[str] = []
    generated_count = 0

    try:
        try:
            session_token, http_session = bi_login(url, username, password)
            soap_url = get_bip_PublicReportService_url(url)

            if not session_token:
                raise HTTPException(
                    status_code=400,
                    detail="Unable to login to Oracle BI. Please check credentials.",
                )
        except Exception as exc:
            user_msg = friendly_bi_error(exc)
            raise HTTPException(
                status_code=400, detail=f"Oracle BI Login Failed: {user_msg}"
            ) from exc

        for entry in sheet_plan:
            try:
                csv_bytes = run_bi_sql_in_session(
                    soap_url,
                    session_token,
                    dyn_report_path,
                    dyn_template,
                    entry["sql_query"],
                    http_session=http_session,
                )
                _write_csv_sheet(workbook, entry, csv_bytes, index_name, formats)
                generated_count += 1
            except Exception as exc:
                user_msg = friendly_bi_error(exc)
                errors.append(f"{entry['report_name']}: {user_msg}")
                _write_csv_sheet(
                    workbook,
                    entry,
                    None,
                    index_name,
                    formats,
                    error_message=user_msg,
                )
    finally:
        if session_token:
            try:
                bi_logout(url, session_token, http_session=http_session)
            except Exception:
                pass
        workbook.close()

    if generated_count == 0:
        try:
            os.remove(temp_path)
        except OSError:
            pass
        raise HTTPException(
            status_code=500,
            detail=f"All reports failed to generate. Errors: {', '.join(errors)}",
        )

    return temp_path, errors
