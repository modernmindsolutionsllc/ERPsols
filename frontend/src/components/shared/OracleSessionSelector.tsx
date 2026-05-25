import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Server,
  ChevronDown,
  Zap,
  UserPlus,
  Globe,
  Pencil,
  Users,
  Key,
  Trash2,
} from 'lucide-react';
import {
  EnvSetupModal,
  EditCredentialsModal,
  AddAccountModal,
  DeleteAllUsersModal,
} from './OracleSessionModals';
import { type OracleStatus, type OracleSessionResponse } from '@/services/api';

interface OracleSessionSelectorProps {
  activeEnv: OracleSessionResponse | null;
  savedSessions: OracleSessionResponse[];
  oracleStatus: OracleStatus | null;
  onSessionRefresh: (newActiveEnvName?: string) => Promise<void> | void;
  onSwitchEnv: (s: OracleSessionResponse) => void;
  onDeleteAll: () => Promise<void> | void;
}

export function OracleSessionSelector({
  activeEnv,
  savedSessions,
  oracleStatus,
  onSessionRefresh,
  onSwitchEnv,
  onDeleteAll,
}: OracleSessionSelectorProps) {
  const [isEnvSetupOpen, setIsEnvSetupOpen] = useState(false);
  const [isEditCredsOpen, setIsEditCredsOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const oracleConnected = oracleStatus?.connected === true;
  const triggerLabel = oracleConnected ? activeEnv?.env_name || 'Credentials Saved' : 'Connect';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={oracleConnected ? 'outline' : 'default'}
            className={
              oracleConnected
                ? 'gap-2 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                : 'gap-2 bg-[#185FA5] text-white hover:bg-[#124A82]'
            }
            size="lg"
          >
            <Server className="h-5 w-5" />
            {triggerLabel}
            <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px] dark:bg-[#0C1425] dark:border-white/10">
          <DropdownMenuLabel className="px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="size-8 rounded-lg flex items-center justify-center"
                style={{
                  background: oracleConnected
                    ? 'linear-gradient(135deg,#059669,#10B981)'
                    : 'linear-gradient(135deg,#475569,#64748B)',
                }}
              >
                <Server size={15} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate dark:text-white">
                  {oracleConnected ? 'Credentials Saved' : 'Not Connected'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {activeEnv ? activeEnv.env_name : 'Set up an environment to connect'}
                </p>
              </div>
              {oracleConnected && <Zap size={13} className="text-emerald-400 shrink-0" />}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => (savedSessions.length > 0 ? setIsAddAccountOpen(true) : setIsEnvSetupOpen(true))}
              className="gap-2.5 px-3 py-2 cursor-pointer"
            >
              {savedSessions.length > 0 ? (
                <UserPlus size={14} className="text-emerald-400" />
              ) : (
                <Globe size={14} className="text-blue-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {savedSessions.length > 0 ? 'Add More Account' : 'Add Account'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {savedSessions.length > 0 ? 'Add secondary credentials' : 'Connect to an Oracle environment'}
                </p>
              </div>
            </DropdownMenuItem>
            {savedSessions.length > 0 && (
              <DropdownMenuItem
                onSelect={() => setIsEditCredsOpen(true)}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <Pencil size={14} className="text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Edit Credentials</p>
                  <p className="text-[10px] text-muted-foreground">Modify active connection</p>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          {savedSessions.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2.5 px-3 py-2 cursor-pointer">
                  <Users size={14} className="text-purple-400" />
                  <span className="text-sm font-medium">Switch Account</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="dark:bg-[#0C1425] dark:border-white/10">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground px-3">
                    Available Accounts
                  </DropdownMenuLabel>
                  {savedSessions.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      className="gap-2.5 px-3 py-2 cursor-pointer"
                      onSelect={() => onSwitchEnv(s)}
                    >
                      <Key size={13} className={activeEnv?.id === s.id ? 'text-emerald-400' : 'text-muted-foreground'} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {s.env_name}
                          {activeEnv?.id === s.id && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              ACTIVE
                            </span>
                          )}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setIsDeleteAllOpen(true)}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <Trash2 size={14} />
                <span className="text-sm font-medium">Delete All Users</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EnvSetupModal
        open={isEnvSetupOpen}
        onOpenChange={setIsEnvSetupOpen}
        onSuccess={onSessionRefresh}
      />

      <EditCredentialsModal
        open={isEditCredsOpen}
        onOpenChange={setIsEditCredsOpen}
        currentUsername={activeEnv?.oracle_username || ''}
        currentEnvName={activeEnv?.env_name || ''}
        currentUrl={activeEnv?.oracle_url || ''}
        onSuccess={onSessionRefresh}
      />

      <AddAccountModal
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
        onSuccess={onSessionRefresh}
      />

      <DeleteAllUsersModal
        open={isDeleteAllOpen}
        onOpenChange={setIsDeleteAllOpen}
        onConfirm={onDeleteAll}
      />
    </>
  );
}
