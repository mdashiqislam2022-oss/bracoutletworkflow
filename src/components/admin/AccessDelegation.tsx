import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KeyRound,
  ShieldCheck,
  UserPlus,
  Mail,
  User,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { AdminPermission } from '../../types';

const ALL_PERMISSIONS: { id: AdminPermission; label: string; description: string }[] = [
  {
    id: 'VIEW_ALL',
    label: 'View Master Data & Submissions',
    description: 'Inspect live outlet logs, customer submissions, and stats'
  },
  {
    id: 'MANAGE_USERS',
    label: 'User Management & AFO Oversight',
    description: 'Activate, suspend, or reassign field officers across outlets'
  },
  {
    id: 'EXPORT_DATA',
    label: 'Data Export & Batch Download',
    description: 'Export nationwide work data to CSV / JSON reports'
  },
  {
    id: 'MODIFY_OUTLETS',
    label: 'Modify Outlets Registry',
    description: 'Add new BRAC Bank outlets or toggle operational status'
  },
  {
    id: 'AUDIT_LOGS',
    label: 'Security & Activity Audit Logs',
    description: 'Access full actor audit trail and security timestamp logs'
  },
  {
    id: 'DELEGATE_ADMINS',
    label: 'Delegate Secondary Admins',
    description: 'Grant or revoke sub-admin credentials'
  },
  {
    id: 'SYSTEM_CONFIG',
    label: 'System & Database Architecture',
    description: 'Access Supabase RLS and database configurations'
  }
];

export const AccessDelegation: React.FC = () => {
  const { admins, currentAdmin, delegateAdminAccess, revokeAdminDelegation, userPreferences } = useApp();

  const isDark = userPreferences.theme === 'dark';

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([
    'VIEW_ALL',
    'MANAGE_USERS',
    'EXPORT_DATA'
  ]);
  const [delegationMode, setDelegationMode] = useState<'LIMITED' | 'FULL'>('LIMITED');
  const [error, setError] = useState<string | null>(null);

  if (!currentAdmin) return null;

  const handleTogglePermission = (permId: AdminPermission) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleModeChange = (mode: 'LIMITED' | 'FULL') => {
    setDelegationMode(mode);
    if (mode === 'FULL') {
      setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id));
    } else {
      setSelectedPermissions(['VIEW_ALL', 'MANAGE_USERS', 'EXPORT_DATA']);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !fullName.trim() || !username.trim() || !pin.trim()) {
      setError('Please fill in all delegated admin parameters.');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('Security PIN must be exactly 4 numeric digits.');
      return;
    }

    if (pin !== confirmPin) {
      setError('PIN confirmations do not match.');
      return;
    }

    if (selectedPermissions.length === 0) {
      setError('At least one operational permission must be selected.');
      return;
    }

    const res = delegateAdminAccess({
      email,
      fullName,
      username,
      pin,
      permissions: selectedPermissions
    });

    if (res.success) {
      setEmail('');
      setFullName('');
      setUsername('');
      setPin('');
      setConfirmPin('');
      setError(null);
    } else {
      setError(res.message || 'Delegation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`rounded-[26px] p-6 border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
          : 'bg-white border-slate-100 shadow-xs text-slate-900'
      } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isDark
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-[#F4F6F8] text-slate-700 border border-slate-200'
          }`}>
            Access Control Protocol
          </span>
          <h2 className={`text-xl sm:text-2xl font-extrabold mt-1 tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Admin Access Delegation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grant secondary supervisory admin access with granular permission scoping and 4-Digit Security PINs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Delegation Form */}
        <div className={`lg:col-span-7 rounded-[28px] p-6 sm:p-7 border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
            : 'bg-white border-slate-100 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <UserPlus className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-slate-700'}`} />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Grant New Admin Authority
            </h3>
          </div>

          {error && (
            <div className={`mb-4 p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              isDark
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Officer Gmail Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="supervisor@bracbank.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Full Name & Designation *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shamsun Nahar"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Admin Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ops_supervisor_dhaka"
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 focus:border-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    4-Digit PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono text-center tracking-widest focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-emerald-400 focus:border-emerald-500'
                        : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Confirm PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono text-center tracking-widest focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-emerald-400 focus:border-emerald-500'
                        : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Granular Permission Checkboxes */}
            <div className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <label className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  Permission Scope:
                </label>
                <div className={`flex items-center gap-1.5 p-1 rounded-full border ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F4F6F8] border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => handleModeChange('LIMITED')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                      delegationMode === 'LIMITED'
                        ? isDark ? 'bg-emerald-600 text-white' : 'bg-[#18181B] text-white shadow-2xs'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    }`}
                  >
                    Limited
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('FULL')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      delegationMode === 'FULL'
                        ? isDark ? 'bg-emerald-600 text-white' : 'bg-[#18181B] text-white shadow-2xs'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    }`}
                  >
                    Full Access
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {ALL_PERMISSIONS.map((p) => {
                  const isChecked = selectedPermissions.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? isDark
                            ? 'bg-slate-950/90 border-emerald-500/50 text-white'
                            : 'bg-[#F8FAFC] border-slate-300'
                          : isDark
                            ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                            : 'bg-white border-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(p.id)}
                        className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                      <div>
                        <span className={`font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {p.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                Authorize & Issue Delegated PIN
              </button>
            </div>
          </form>
        </div>

        {/* Active Admins List */}
        <div className={`lg:col-span-5 rounded-[28px] p-6 sm:p-7 border transition-all flex flex-col justify-between ${
          isDark
            ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
            : 'bg-white border-slate-100 shadow-xs text-slate-900'
        }`}>
          <div>
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-slate-700'}`} />
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Active Admin Authorities
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F4F6F8] text-slate-600'
              }`}>
                {admins.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className={`p-4 rounded-2xl border space-y-2 text-xs transition-all ${
                    isDark
                      ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                      : 'bg-[#F8FAFC] border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {adm.fullName}
                        </span>
                        {adm.isMainAdmin ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white">
                            MASTER
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-200 text-slate-700'
                          }`}>
                            DELEGATED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        @{adm.username} • {adm.email}
                      </span>
                    </div>

                    {!adm.isMainAdmin && (
                      <button
                        onClick={() => revokeAdminDelegation(adm.id)}
                        className="p-1.5 rounded-full hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Revoke Admin Access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {adm.permissions.map((perm) => (
                      <span
                        key={perm}
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono border ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-300'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
