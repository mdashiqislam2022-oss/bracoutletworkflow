import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  UserCircle,
  Settings,
  Users,
  Building2,
  KeyRound,
  Database,
  SlidersHorizontal,
  Code2,
  Headphones,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
  Landmark,
  ShieldCheck,
  Zap,
  ArrowRightLeft,
  Calculator
} from 'lucide-react';
import { t } from '../../utils/translations';
import { SupportModal } from './SupportModal';

export const Sidebar: React.FC = () => {
  const {
    authMode,
        currentUser,
    activeNavTab,
    setActiveNavTab,
    userPreferences,
    isSidebarOpen,
    setIsSidebarOpen,
    triggerAfoTransferReset
  } = useApp();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const isDark = userPreferences.theme === 'dark';
  const currentLang = userPreferences.language || 'en';
  const langText = t[currentLang] || t.en;

  const isAdmin = authMode === 'ADMIN';

    // User Portal Navigation (grouped into MAIN / OPERATIONS / ACCOUNT sections)
  const userNavGroups = [
    {
      section: 'MAIN',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: langText.dashboard, isDashboard: true }
      ]
    },
    {
      section: 'OPERATIONS',
      items: [
        { id: 'cheque_cards', icon: CreditCard, label: langText.chequeCardRegistry },
        { id: 'loan_accounts', icon: Landmark, label: langText.loanAccounts }
      ]
    },
    {
      section: 'ACCOUNT',
      items: [
        { id: 'profile', icon: UserCircle, label: langText.profile },
        { id: 'settings', icon: Settings, label: langText.preferences }
      ]
    }
  ];

  // Admin Portal Navigation (Separated AFO and Outlets sections included)
  const adminNav = [
    { id: 'dashboard', icon: LayoutDashboard, label: langText.dashboard, isDashboard: true },
    { id: 'users', icon: Users, label: langText.userDirectory },
    { id: 'afo_transfer', icon: ArrowRightLeft, label: langText.afoTransfer || 'AFO Transfer' },
    { id: 'outlets', icon: Building2, label: langText.outlets || 'Outlet Details' },
    { id: 'delegation', icon: KeyRound, label: langText.delegation },
    { id: 'system_settings', icon: SlidersHorizontal, label: langText.settings },
    { id: 'sql_schema', icon: Code2, label: langText.sqlSchema }
  ];

    const navItems = adminNav;

  return (
    <aside
      className={`${
        isSidebarOpen ? 'w-48 sm:w-52 px-3' : 'w-14 sm:w-16 px-1.5'
      } shrink-0 flex flex-col justify-between py-4 select-none border rounded-[26px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] self-start sticky top-4 md:top-6 max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto scrollbar-none z-20 ${
        isAdmin
          ? isDark
            ? 'bg-gradient-to-b from-[#0c1426] via-[#09101f] to-[#070b16] text-white border-emerald-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.65)] ring-1 ring-emerald-500/10'
            : 'bg-white/95 text-slate-900 border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md'
          : isDark
            ? 'bg-[#182338]/95 text-white border-slate-700/70 shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
            : 'bg-white/95 text-slate-900 border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md'
      }`}
    >
      {/* Top Section: Header Badge + Toggle Button + Navigation Items */}
      <div className="flex flex-col gap-4 w-full">
        {/* Toggle Button / Header */}
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between px-1' : 'justify-center'} w-full`}>
          {isSidebarOpen && (
            <div className="flex items-center gap-1.5 transition-all duration-300 animate-fadeIn">
              {isAdmin ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300/80'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  HQ ADMIN
                </span>
              ) : (
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  User Menu
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Collapse Sidebar (Icons only)' : 'Expand Sidebar (Show names)'}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:outline-none ${
              isAdmin
                ? isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-emerald-300/60 shadow-2xs'
                : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
            }`}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className={`w-4 h-4 transition-transform duration-300 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            ) : (
              <PanelLeftOpen className={`w-4 h-4 transition-transform duration-300 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            )}
          </button>
        </div>

                {/* Navigation Items */}
        {isAdmin ? (
          <nav className="flex flex-col gap-1.5 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavTab === item.id;
              const isDashboard = item.id === 'dashboard';

              // Admin-specific distinct styling with responsive light/dark mode support
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    if (item.id === 'afo_transfer') {
                      triggerAfoTransferReset();
                    }
                    setActiveNavTab(item.id);
                  }}
                  title={item.label}
                  className={`flex items-center transition-all duration-200 cursor-pointer ${
                    isSidebarOpen
                      ? `w-full gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left ${
                          isActive
                            ? isDark
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400 font-extrabold'
                              : 'bg-emerald-600 text-white shadow-md font-bold ring-1 ring-emerald-500'
                            : isDashboard
                              ? isDark
                                ? 'bg-slate-800/60 text-emerald-400 border border-emerald-500/20 hover:bg-slate-800'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : isDark
                                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`
                      : `w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-xl justify-center ${
                          isActive
                            ? isDark
                              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                              : 'bg-emerald-600 text-white shadow-md'
                            : isDashboard
                              ? isDark
                                ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/20 hover:bg-slate-700'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : isDark
                                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? isDark
                          ? 'text-slate-950'
                          : 'text-white'
                        : isDashboard
                          ? isDark
                            ? 'text-emerald-400'
                            : 'text-emerald-700'
                          : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                    }`}
                  />
                  {isSidebarOpen && (
                    <span className="truncate whitespace-nowrap transition-all duration-300 ease-out">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="flex flex-col gap-3 w-full">
            {userNavGroups.map((group) => (
              <div key={group.section} className="flex flex-col gap-1.5 w-full">
                {isSidebarOpen && (
                  <span className={`px-3 text-[9px] font-bold uppercase tracking-widest ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {group.section}
                  </span>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNavTab === item.id;
                  const isDashboard = item.id === 'dashboard';

                  // User portal styling
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => setActiveNavTab(item.id)}
                      title={item.label}
                      className={`flex items-center transition-all duration-200 cursor-pointer ${
                        isSidebarOpen
                          ? `w-full gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold text-left ${
                              isActive
                                ? isDark
                                  ? 'bg-white text-slate-900 shadow-md font-bold'
                                  : 'bg-[#18181B] text-white shadow-md font-bold'
                                : isDashboard
                                  ? isDark
                                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 font-bold shadow-xs'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100 font-bold shadow-2xs'
                                  : isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`
                          : `w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full justify-center ${
                              isActive
                                ? isDark
                                  ? 'bg-white text-slate-900 shadow-md'
                                  : 'bg-[#18181B] text-white shadow-md'
                                : isDashboard
                                  ? isDark
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30 shadow-xs'
                                    : 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200 shadow-2xs'
                                  : isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/60'
                          }`
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? isDark
                              ? 'text-slate-900'
                              : 'text-white'
                            : isDashboard
                              ? isDark
                                ? 'text-indigo-400'
                                : 'text-indigo-600'
                              : isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        }`}
                      />
                      {isSidebarOpen && (
                        <span className="truncate whitespace-nowrap transition-all duration-300 ease-out">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Bottom Section */}
      <div className={`flex flex-col w-full gap-1 pt-2 border-t mt-auto ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        {/* Support Button (Strictly OMITTED for Admin, Present for User) */}
        {!isAdmin ? (
          <button
            id="sidebar-support-btn"
            onClick={() => setIsSupportModalOpen(true)}
            title="Direct Support (WhatsApp & Email)"
            className={`flex items-center transition-all cursor-pointer group ${
              isSidebarOpen
                ? `w-full gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left ${
                    isDark
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-2xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-2xs'
                  }`
                : `w-8 h-8 mx-auto rounded-xl justify-center ${
                    isDark
                      ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300 shadow-2xs'
                  }`
            }`}
          >
            <Headphones className="w-3.5 h-3.5 shrink-0 text-emerald-500 group-hover:scale-110 transition-transform" />
            {isSidebarOpen && (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="truncate whitespace-nowrap">
                  {currentLang === 'bn' ? 'সাপোর্ট' : 'Support'}
                </span>
                <span className="text-[8px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                  Help
                </span>
              </div>
            )}
          </button>
        ) : (
          /* Admin Node Status Indicator when expanded */
          isSidebarOpen && (
            <div className={`px-2 py-1 rounded-lg border flex items-center justify-between transition-all ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                CENTRAL SECURE
              </span>
              <span className="text-[8px] font-mono opacity-70">v2.4</span>
            </div>
          )
                )}

        {/* User Identity Card (Name + Outlet) */}
        {!isAdmin && currentUser && (
          <div className={`flex items-center mt-1 ${
            isSidebarOpen
              ? `gap-2 px-2.5 py-2 rounded-xl ${
                  isDark ? 'bg-slate-800/60 border border-slate-700/60' : 'bg-slate-100 border border-slate-200'
                }`
              : 'justify-center py-1'
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
              isDark
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
            }`}>
              {(currentUser.fullName || '?').trim().charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0 leading-tight">
                <span className={`text-[11px] font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {currentUser.fullName}
                </span>
                <span className={`text-[9px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {currentUser.outletName}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Subtle Developer Attribution Watermark */}
        {isSidebarOpen ? (
          <div className="px-1 text-center opacity-30 hover:opacity-70 transition-opacity mt-1">
            <span className="text-[8px] font-medium tracking-tight text-slate-400 dark:text-slate-500 select-none block">
              Developed by Ashiq
            </span>
          </div>
        ) : (
          <div className="text-center opacity-30 hover:opacity-70 transition-opacity mt-1" title="Developed by Ashiq">
            <span className="text-[7px] font-mono text-slate-400 dark:text-slate-600 select-none">
              Ashiq
            </span>
          </div>
        )}
      </div>

      {/* Support Center Modal (Only triggers in user mode) */}
      {!isAdmin && (
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />
      )}
    </aside>
  );
};
