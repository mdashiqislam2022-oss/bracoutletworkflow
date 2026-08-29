import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Database,
  UserCircle,
  Settings,
  Bell,
  Mail,
  Plus,
  LogOut,
  KeyRound,
  ShieldCheck,
  Building2,
  Globe,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  SlidersHorizontal,
  Code2,
  CreditCard,
  ArrowRightLeft,
  RefreshCw
} from 'lucide-react';
import { t } from '../../utils/translations';
import { MailModal } from './MailModal';
import { NotificationModal } from './NotificationModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentAdmin,
    authMode,
    activeNavTab,
    setActiveNavTab,
    logout,
    userPreferences,
    updateUserPreferences,
    isSidebarOpen,
    setIsSidebarOpen,
    unreadMailCount,
    unreadNotificationsCount,
    openAddEntryModal,
    triggerAfoTransferReset,
    refreshLiveMetrics
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const currentLang = userPreferences.language || 'en';
  const langText = t[currentLang] || t.en;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeaderRefresh = () => {
    setIsRefreshing(true);
    refreshLiveMetrics();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const toggleTheme = () => {
    updateUserPreferences({ theme: isDark ? 'light' : 'dark' });
  };

  const toggleLanguage = () => {
    updateUserPreferences({ language: currentLang === 'en' ? 'bn' : 'en' });
  };

  // Nav pills based on auth mode
  const userPills = [
    { id: 'dashboard', label: langText.dashboard, icon: LayoutDashboard }
  ];

  const adminPills = [
    { id: 'dashboard', label: langText.dashboard, icon: LayoutDashboard },
    { id: 'users', label: langText.userDirectory, icon: Users },
    { id: 'afo_transfer', label: langText.afoTransfer || 'AFO Transfer', icon: ArrowRightLeft },
    { id: 'delegation', label: langText.delegation, icon: KeyRound },
    { id: 'system_settings', label: langText.settings, icon: SlidersHorizontal },
    { id: 'sql_schema', label: langText.sqlSchema, icon: Code2 }
  ];

  const pills = authMode === 'ADMIN' ? adminPills : userPills;

  // Profile data
  const displayName = currentUser?.fullName || currentAdmin?.fullName || 'Officer';
  const displayDesignation = currentUser?.designation || (currentAdmin?.isMainAdmin ? 'Master Administrator' : 'Delegated Admin');
  const displayOutlet = currentUser?.outletName || 'BRAC Bank Central HQ';
  const avatarUrl = currentUser?.avatarUrl || currentAdmin?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

  const handleEditProfileClick = () => {
    setIsProfileMenuOpen(false);
    if (authMode === 'USER') {
      setActiveNavTab('profile');
    } else {
      setActiveNavTab('system_settings');
    }
  };

  const handleLogoutClick = () => {
    setIsProfileMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const isStickyNavOnly = authMode === 'USER' && (activeNavTab === 'cheque_cards' || activeNavTab === 'loan_accounts');

  return (
    <header className={`${
      isStickyNavOnly
        ? 'flex flex-col gap-3 pb-3 pt-1.5 -mt-1 select-none transition-all'
        : `sticky top-0 z-40 flex flex-col gap-3 pb-3 pt-1.5 -mt-1 select-none backdrop-blur-md transition-all ${
            isDark ? 'bg-[#131B2A]/80 border-b border-slate-800/50' : 'bg-[#F7F9FB]/80 border-b border-slate-200/50'
          }`
    }`}>
      {/* Top Row: Permanent Brand (Left) & Utilities + Profile (Right) */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left: Permanent Triangle Brand Mark + Name 'Outlet Workflow' */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveNavTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
            title="Outlet Workflow"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black text-[#D4F63D] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 22h20L12 2zm0 5.5l5.5 11h-11L12 7.5z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Outlet Workflow
              </span>
                           <span className={`text-[10px] font-semibold tracking-wide uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {authMode === 'ADMIN'
                  ? 'Control Center'
                  : `${currentUser?.outletName || 'Field Operations'}${currentUser?.outletCode ? ` · ${currentUser.outletCode}` : ''}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Refresh + Theme Switcher + Language Switcher + Notifications + Mail + Profile Block */}
        <div className="flex items-center justify-end gap-2 shrink-0 flex-wrap sm:flex-nowrap">

          {/* Shifted Refresh Button - Left side of Theme toggle */}
          <button
            id="header-refresh-btn"
            onClick={handleHeaderRefresh}
            type="button"
            aria-label={currentLang === 'bn' ? 'ড্যাশবোর্ড ও মেট্রিক রিফ্রেশ করুন' : 'Refresh Dashboard & Metrics'}
            title={currentLang === 'bn' ? 'ড্যাশবোর্ড ও লাইভ ডাটা রিফ্রেশ করুন' : 'Refresh Dashboard & Live Metrics'}
            className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-300 transform active:scale-90 select-none ${
              isRefreshing
                ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 shadow-sm hover:shadow-emerald-500/10'
                : 'bg-white hover:bg-slate-50 text-emerald-600 border-slate-200/80 shadow-2xs hover:shadow-xs'
            }`}
          >
            <RefreshCw className={`w-4 h-4 transition-all duration-500 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
          </button>

          {/* Theme Switcher Button - Smooth Morphing Sun/Moon Animation */}
          <button
            id="header-theme-toggle-btn"
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? (currentLang === 'bn' ? 'লাইট মোডে পরিবর্তন করুন' : 'Switch to Light Mode') : (currentLang === 'bn' ? 'ডার্ক মোডে পরিবর্তন করুন' : 'Switch to Dark Mode')}
            title={isDark ? (currentLang === 'bn' ? 'লাইট মোড অন করুন' : 'Switch to Light Theme') : (currentLang === 'bn' ? 'ডার্ক মোড অন করুন' : 'Switch to Dark Theme')}
            className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-300 transform active:scale-90 select-none ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 shadow-sm hover:shadow-amber-500/10'
                : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200/80 shadow-2xs hover:shadow-xs'
            }`}
          >
            {/* Morphing Sun/Moon icon with smooth rotation & scale animation */}
            <div className="relative w-4 h-4 flex items-center justify-center">
              <Sun
                className={`w-4 h-4 text-amber-400 absolute transition-all duration-300 ease-out transform ${
                  isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0 pointer-events-none'
                }`}
              />
              <Moon
                className={`w-4 h-4 text-slate-700 absolute transition-all duration-300 ease-out transform ${
                  isDark ? '-rotate-90 scale-0 opacity-0 pointer-events-none' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
            </div>
          </button>

          {/* Language Switcher Button (English / বাংলা) */}
          <button
            onClick={toggleLanguage}
            title={currentLang === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
            className={`px-3 h-9 rounded-full border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>{currentLang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Circular Notification Bell */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-all cursor-pointer relative ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80'
            } ${unreadNotificationsCount > 0 ? 'ring-2 ring-emerald-500/30' : ''}`}
            title={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} Unread Notifications` : 'Notifications'}
          >
            <Bell className={`w-4 h-4 ${unreadNotificationsCount > 0 ? 'animate-bell-shake text-emerald-500' : ''}`} />
            {unreadNotificationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-1.5 ring-white dark:ring-slate-900 shadow-2xs animate-pulse" />
            )}
          </button>

          {/* Circular Mail Icon */}
          <button
            onClick={() => setIsMailModalOpen(true)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-all cursor-pointer relative ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80'
            } ${unreadMailCount > 0 ? 'ring-2 ring-emerald-500/30' : ''}`}
            title={unreadMailCount > 0 ? `${unreadMailCount} Unread Mails` : 'Messages / Mail'}
          >
            <Mail className={`w-4 h-4 ${unreadMailCount > 0 ? 'animate-mail-pulse text-emerald-500' : ''}`} />
            {unreadMailCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-1.5 ring-white dark:ring-slate-900 shadow-2xs animate-pulse" />
            )}
          </button>

          {/* Profile Card Block: Name + Designation + Outlet (Left) & Avatar Dropdown (Right) */}
          <div className="relative" ref={profileMenuRef}>
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center gap-3 pl-3 pr-2 py-1 rounded-full border cursor-pointer transition-all ${
                isDark
                  ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-900 shadow-2xs'
              }`}
            >
              {/* Officer Details on Left of Avatar */}
              <div className="text-right hidden sm:block max-w-[170px]">
                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {displayName}
                </div>
                <div className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {displayDesignation} • {displayOutlet}
                </div>
              </div>

              {/* Profile Avatar */}
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white"></span>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180 text-emerald-500' : (isDark ? 'text-slate-400' : 'text-slate-400')
              }`} />
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className={`absolute right-0 top-12 mt-1 w-56 rounded-2xl p-2 shadow-xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isDark
                  ? 'bg-[#1E293B] border-slate-700 text-white'
                  : 'bg-white border-slate-100 text-slate-800'
              }`}>
                {/* Mobile Profile Details */}
                <div className={`p-2.5 border-b mb-1 block sm:hidden ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{displayDesignation}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">{displayOutlet}</div>
                </div>

                {/* Action 1: Edit Profile */}
                <button
                  onClick={handleEditProfileClick}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isDark
                      ? 'hover:bg-slate-800 text-slate-200 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <UserCircle className="w-4 h-4 text-emerald-500" />
                  <span>{langText.editProfile}</span>
                </button>

                {/* Action 2: Settings */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveNavTab(authMode === 'USER' ? 'settings' : 'system_settings');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isDark
                      ? 'hover:bg-slate-800 text-slate-200 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-4 h-4 text-sky-500" />
                  <span>{langText.preferences}</span>
                </button>

                <div className={`my-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />

                {/* Action 3: Logout */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{langText.logout}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Row: Navigation Tabs (One step below the Top Bar) */}
      <div className={`flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-1 border-t ${
        isDark ? 'border-slate-800/80' : 'border-slate-200/60'
      }`}>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {pills.map((pill) => {
            const Icon = pill.icon;
            const isActive = activeNavTab === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  if (pill.id === 'afo_transfer') {
                    triggerAfoTransferReset();
                  }
                  setActiveNavTab(pill.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-[#18181B] text-white shadow-sm'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                      : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (isDark ? 'text-slate-900' : 'text-white') : (isDark ? 'text-slate-400' : 'text-slate-400')}`} />
                <span>{pill.label}</span>
              </button>
            );
          })}

          {/* Add Entry Button next to Dashboard Button for User Panel */}
          {authMode === 'USER' && (
            <button
              onClick={() => openAddEntryModal('CHOICE')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>{langText.addEntry}</span>
            </button>
          )}

          {/* Add Manager Action for Admin */}
          {authMode === 'ADMIN' && (
            <button
              onClick={() => setActiveNavTab('delegation')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                activeNavTab === 'delegation'
                  ? isDark
                    ? 'bg-white text-slate-900 shadow-sm border-white'
                    : 'bg-[#18181B] text-white shadow-sm border-black'
                  : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>{langText.addManager}</span>
            </button>
          )}
        </div>

        {/* Subtle Developer Attribution */}
        <div className="hidden sm:flex items-center gap-1.5 pr-1 select-none opacity-40 hover:opacity-80 transition-opacity">
          <span className="text-[9px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
            developed by <span className="font-semibold text-slate-500 dark:text-slate-400">Ashiq</span>
          </span>
        </div>
      </div>

      {/* Official Mail & Memo Modal */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <MailModal
            isOpen={isMailModalOpen}
            onClose={() => setIsMailModalOpen(false)}
          />
          <NotificationModal
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
          />
          <LogoutConfirmModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={logout}
          />
        </>,
        document.body
      )}
    </header>
  );
};
