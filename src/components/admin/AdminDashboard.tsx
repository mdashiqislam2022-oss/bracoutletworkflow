import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  SlidersHorizontal,
  Calendar,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  KeyRound,
  FileSpreadsheet,
  X,
  CreditCard,
  Landmark,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  Sparkles,
  Send,
  Lock,
  MessageSquare,
  Activity,
  User,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  Layers,
  Zap,
  CornerDownLeft,
  Command,
  Hash,
  RefreshCw
} from 'lucide-react';
import { UserProfile, PasswordResetRequest, ChequeCardEntry, LoanAccountRecord } from '../../types';
import { t } from '../../utils/translations';

export const AdminDashboard: React.FC = () => {
  const {
    currentAdmin,
    users = [],
    outlets = [],
    submissions = [],
    chequeCardEntries = [],
    loanRecords = [],
    passwordResetRequests = [],
    auditLogs = [],
    admins = [],
    setActiveNavTab,
    updateUserStatus,
    updateUserOutletAssignment,
    adminUpdateUserProfile,
    sendMailMessage,
    sendStationMail,
    sendNotificationNote,
    showToast,
    userPreferences
  } = useApp();

  const safeUsers = users || [];
  const safeOutlets = outlets || [];
  const safeSubmissions = submissions || [];
  const safeCheques = chequeCardEntries || [];
  const safeLoans = loanRecords || [];
  const safeResetRequests = passwordResetRequests || [];
  const safeAuditLogs = auditLogs || [];

  const isDark = userPreferences?.theme === 'dark';
  const currentLang = userPreferences?.language || 'en';
  const langText = t[currentLang] || t.en;

  // Search, Filter & Tab State
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'RESETS'>('ALL');
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('ALL');
  
  // Global Quick Find Search Bar State
  const [quickFindQuery, setQuickFindQuery] = useState('');
  const [isQuickFindOpen, setIsQuickFindOpen] = useState(false);
  const [selectedQuickFindIndex, setSelectedQuickFindIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const quickFindInputRef = useRef<HTMLInputElement>(null);
  const quickFindContainerRef = useRef<HTMLDivElement>(null);

  const handleRefreshDashboard = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast({
        message: 'Dashboard and live metric cache refreshed successfully!',
        type: 'success'
      });
    }, 450);
  };

  // Keyboard shortcut listener: Cmd+K, Ctrl+K, or '/' to trigger Quick Find
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        quickFindInputRef.current?.focus();
        setIsQuickFindOpen(true);
        return;
      }
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        quickFindInputRef.current?.focus();
        setIsQuickFindOpen(true);
      }
      if (e.key === 'Escape' && isQuickFindOpen) {
        setIsQuickFindOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickFindOpen]);

  // Click outside listener for Quick Find dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        quickFindContainerRef.current &&
        !quickFindContainerRef.current.contains(event.target as Node)
      ) {
        setIsQuickFindOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Find matched officers
  const quickFindResults = useMemo(() => {
    const q = quickFindQuery.trim().toLowerCase();
    if (!q) {
      // Return top priority officers when query is empty (first 6)
      return safeUsers.slice(0, 6);
    }
    return safeUsers.filter((u) => {
      const name = (u.fullName || '').toLowerCase();
      const empId = (u.employeeId || '').toLowerCase();
      const id = (u.id || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const outletName = (u.outletName || '').toLowerCase();
      const outletCode = (u.outletCode || '').toLowerCase();
      const designation = (u.designation || '').toLowerCase();

      return (
        name.includes(q) ||
        empId.includes(q) ||
        id.includes(q) ||
        username.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        outletName.includes(q) ||
        outletCode.includes(q) ||
        designation.includes(q)
      );
    });
  }, [safeUsers, quickFindQuery]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedQuickFindIndex(0);
  }, [quickFindQuery]);

  // Handler for jumping to user from Quick Find
  const handleSelectQuickFindUser = (user: UserProfile) => {
    setIsQuickFindOpen(false);
    handleOpenInspectUser(user);
    showToast({
      message: `Profile loaded for ${user.fullName} (${user.employeeId})`,
      type: 'info'
    });
  };

  // Keyboard navigation within Quick Find input
  const handleQuickFindKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isQuickFindOpen || quickFindResults.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsQuickFindOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedQuickFindIndex((prev) => (prev + 1) % quickFindResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedQuickFindIndex((prev) => (prev - 1 + quickFindResults.length) % quickFindResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = quickFindResults[selectedQuickFindIndex] || quickFindResults[0];
      if (selected) {
        handleSelectQuickFindUser(selected);
      }
    }
  };
  
  // Selected User Modal for In-Depth Inspector
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'OVERVIEW' | 'SUBMISSIONS' | 'SECURITY' | 'COMMUNICATION'>('OVERVIEW');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  // Quick edit inside modal
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editOutletId, setEditOutletId] = useState('');

  // Quick memo state
  const [memoSubject, setMemoSubject] = useState('');
  const [memoMessage, setMemoMessage] = useState('');
  const [memoPriority, setMemoPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [isSendingMemo, setIsSendingMemo] = useState(false);

  if (!currentAdmin) return null;

  // Key Counting Statistics
  const totalUsers = safeUsers.length;
  const activeUsersCount = safeUsers.filter((u) => u.status === 'ACTIVE').length;
  const suspendedUsersCount = safeUsers.filter((u) => u.status === 'SUSPENDED').length;
  const pendingUsersCount = safeUsers.filter((u) => u.status === 'PENDING').length;
  const pendingResetRequests = safeResetRequests.filter((r) => r.status === 'PENDING');
  const totalOutlets = safeOutlets.length;
  const totalSubmissions = safeSubmissions.length + safeCheques.length + safeLoans.length;

  // Active Today / Recently logged in users (within last 48 hours or with valid login)
  const recentlyActiveUsers = useMemo(() => {
    const now = new Date().getTime();
    return safeUsers.filter((u) => {
      if (!u.lastLoginAt) return false;
      const loginTime = new Date(u.lastLoginAt).getTime();
      return (now - loginTime) < (48 * 60 * 60 * 1000); // 48 hrs
    });
  }, [safeUsers]);

  // Unique Districts
  const districts = useMemo(() => {
    return Array.from(new Set(safeOutlets.map((o) => o.district).filter(Boolean)));
  }, [safeOutlets]);

  // Filtered Users List for the Overview
  const filteredUsers = useMemo(() => {
    return safeUsers.filter((u) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
        (u.outletName && u.outletName.toLowerCase().includes(q));

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') matchesStatus = u.status === 'ACTIVE';
      else if (statusFilter === 'SUSPENDED') matchesStatus = u.status === 'SUSPENDED';
      else if (statusFilter === 'PENDING') matchesStatus = u.status === 'PENDING';
      else if (statusFilter === 'RESETS') {
        const hasPendingReset = pendingResetRequests.some(
          (r) =>
            r.userId === u.id ||
            (r.emailOrPhone && u.email && r.emailOrPhone.toLowerCase() === u.email.toLowerCase()) ||
            (u.phone && r.emailOrPhone && r.emailOrPhone.includes(u.phone))
        );
        matchesStatus = hasPendingReset;
      }

      // District & Outlet
      const userOutlet = safeOutlets.find((o) => o.id === u.outletId);
      const matchesDistrict = districtFilter === 'ALL' || userOutlet?.district === districtFilter;
      const matchesOutlet = selectedOutletFilter === 'ALL' || u.outletId === selectedOutletFilter;

      return matchesSearch && matchesStatus && matchesDistrict && matchesOutlet;
    });
  }, [safeUsers, searchTerm, statusFilter, districtFilter, selectedOutletFilter, safeOutlets, pendingResetRequests]);

  // Submissions associated with the currently inspected user
  const inspectedUserSubmissions = useMemo(() => {
    if (!inspectingUser) return { cheques: [], cards: [], loans: [] };
    const userCheques = safeCheques.filter(
      (e) => e.type === 'CHEQUE' && (e.userId === inspectingUser.id || e.userName === inspectingUser.fullName || e.outletId === inspectingUser.outletId)
    );
    const userCards = safeCheques.filter(
      (e) => e.type === 'CARD' && (e.userId === inspectingUser.id || e.userName === inspectingUser.fullName || e.outletId === inspectingUser.outletId)
    );
    const userLoans = safeLoans.filter(
      (l) => l.userId === inspectingUser.id || l.userName === inspectingUser.fullName || l.outletId === inspectingUser.outletId
    );
    return { cheques: userCheques, cards: userCards, loans: userLoans };
  }, [inspectingUser, safeCheques, safeLoans]);

  // Reset requests submitted by the inspected user
  const inspectedUserResets = useMemo(() => {
    if (!inspectingUser) return [];
    return safeResetRequests.filter(
      (r) =>
        r.userId === inspectingUser.id ||
        (r.emailOrPhone && inspectingUser.email && r.emailOrPhone.toLowerCase() === inspectingUser.email.toLowerCase()) ||
        (inspectingUser.phone && r.emailOrPhone && r.emailOrPhone.includes(inspectingUser.phone))
    );
  }, [inspectingUser, safeResetRequests]);

  // Open modal handler
  const handleOpenInspectUser = (user: UserProfile) => {
    setInspectingUser(user);
    setInspectorTab('OVERVIEW');
    setShowPasswordInModal(false);
    setIsEditingInModal(false);
    setEditUsername(user.username || (user.email ? user.email.split('@')[0] : 'user'));
    setEditPassword(user.password || '1234');
    setEditPhone(user.phone || '');
    setEditOutletId(user.outletId || safeOutlets[0]?.id || '');
  };

  // Save quick edits inside modal
  const handleSaveModalEdit = () => {
    if (!inspectingUser) return;
    const targetOutlet = safeOutlets.find((o) => o.id === editOutletId);
    
    adminUpdateUserProfile(inspectingUser.id, {
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
      phone: editPhone.trim(),
      outletId: editOutletId,
      outletName: targetOutlet ? targetOutlet.name : inspectingUser.outletName,
      outletLocation: targetOutlet ? targetOutlet.address : inspectingUser.outletLocation
    });

    const updatedUser: UserProfile = {
      ...inspectingUser,
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
      phone: editPhone.trim(),
      outletId: editOutletId,
      outletName: targetOutlet ? targetOutlet.name : inspectingUser.outletName,
      outletLocation: targetOutlet ? targetOutlet.address : inspectingUser.outletLocation
    };

    setInspectingUser(updatedUser);
    setIsEditingInModal(false);
    showToast({ message: `Updated credentials and info for ${updatedUser.fullName}.`, type: 'success' });
  };

  // Quick user status toggle
  const handleToggleUserStatus = (user: UserProfile) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateUserStatus(user.id, nextStatus);
    if (inspectingUser && inspectingUser.id === user.id) {
      setInspectingUser({ ...inspectingUser, status: nextStatus });
    }
  };

  // Send Direct Memo to Inspected User
  const handleSendDirectMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingUser || !memoSubject.trim() || !memoMessage.trim()) return;

    setIsSendingMemo(true);
    const dispatchFn = sendStationMail || sendMailMessage;
    if (dispatchFn) {
      dispatchFn({
        recipientUserId: inspectingUser.id,
        recipientOutletId: inspectingUser.outletId,
        subject: memoSubject.trim(),
        content: memoMessage.trim(),
        priority: memoPriority,
        category: 'DIRECT_MEMO'
      });
    }

    sendNotificationNote({
      title: `📨 Official Memo: ${memoSubject.trim()}`,
      message: memoMessage.trim(),
      type: 'ADMIN_NOTE',
      priority: memoPriority === 'URGENT' ? 'HIGH' : 'MEDIUM',
      targetUserId: inspectingUser.id,
      targetAudience: 'USER_ONLY',
      linkTab: 'dashboard'
    });

    setTimeout(() => {
      setIsSendingMemo(false);
      setMemoSubject('');
      setMemoMessage('');
      showToast({ message: `Direct memo dispatched to ${inspectingUser.fullName}.`, type: 'success' });
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. GLOBAL 'QUICK FIND' OFFICER SEARCH BAR CONSOLE        */}
      {/* ======================================================== */}
      <div
        ref={quickFindContainerRef}
        id="admin-global-quick-find-container"
        className={`relative z-30 p-4 sm:p-5 rounded-[26px] border transition-all ${
          isDark
            ? 'bg-slate-900/95 border-emerald-500/40 shadow-xl shadow-black/20'
            : 'bg-white border-emerald-500/30 shadow-md shadow-slate-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                  {currentLang === 'bn' ? 'গ্লোবাল কুইক ফাইন্ড' : 'Global Quick Find'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {currentLang === 'bn' ? 'তাৎক্ষণিক প্রোফাইল জাম্প' : 'Instant Profile Jump'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'bn'
                  ? 'নাম, এমপ্লয়ি আইডি (যেমন EMP-1001), ইউজারনেম বা আউটলেট দিয়ে তাৎক্ষণিক যেকোনো কর্মকর্তার ফাইল খুলুন।'
                  : 'Search any officer nationwide by Name, Employee ID (e.g. EMP-1001), username, or outlet to open their complete file.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 self-end md:self-auto">
            <div className="hidden sm:flex items-center gap-2">
              <span>{currentLang === 'bn' ? 'শর্টকাট:' : 'Shortcut:'}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                ⌘K / Ctrl+K
              </kbd>
              <span className="text-slate-300 dark:text-slate-600">{currentLang === 'bn' ? 'বা' : 'or'}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* The Main Input Bar */}
        <div className="relative">
          <div
            className={`flex items-center w-full rounded-2xl px-4 py-3 border transition-all ${
              isQuickFindOpen
                ? isDark
                  ? 'bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                : isDark
                ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Search className={`w-5 h-5 mr-3 shrink-0 transition-colors ${
              isQuickFindOpen ? 'text-emerald-500' : 'text-slate-400'
            }`} />
            
            <input
              ref={quickFindInputRef}
              id="admin-global-quick-find-input"
              type="text"
              value={quickFindQuery}
              onChange={(e) => {
                setQuickFindQuery(e.target.value);
                setIsQuickFindOpen(true);
              }}
              onFocus={() => setIsQuickFindOpen(true)}
              onKeyDown={handleQuickFindKeyDown}
              placeholder="Quick Find: Type officer name, Employee ID (e.g. EMP-1001), username, or outlet..."
              className="w-full bg-transparent text-sm font-semibold focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
            />

            <div className="flex items-center gap-2 shrink-0">
              {quickFindQuery && (
                <button
                  onClick={() => {
                    setQuickFindQuery('');
                    quickFindInputRef.current?.focus();
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                quickFindResults.length > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                {quickFindQuery ? `${quickFindResults.length} match${quickFindResults.length === 1 ? '' : 'es'}` : `${safeUsers.length} Officers`}
              </span>
            </div>
          </div>

          {/* Autocomplete Dropdown Menu */}
          {isQuickFindOpen && (
            <div
              id="admin-quick-find-dropdown"
              className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden max-h-96 z-50 flex flex-col ${
                isDark ? 'bg-slate-900 border-slate-700/90 text-white shadow-black/60' : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
              }`}
            >
              {/* Dropdown Header Bar */}
              <div className={`px-4 py-2.5 border-b text-[11px] font-bold flex items-center justify-between ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
              }`}>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {quickFindQuery
                      ? `Officer search results for "${quickFindQuery}"`
                      : 'All Registered Officers (Click or press Enter to jump)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-normal text-slate-400">
                  <span>Use <strong className="font-mono font-bold">↑ ↓</strong> to navigate</span>
                  <span><strong className="font-mono font-bold">Enter ↵</strong> to jump</span>
                  <span><strong className="font-mono font-bold">Esc</strong> to close</span>
                </div>
              </div>

              {/* Matches List */}
              <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5">
                {quickFindResults.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <Users className="w-8 h-8 mx-auto text-slate-400/50 mb-2" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      No officers found matching "{quickFindQuery}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try searching by Employee ID (e.g. EMP-1001), exact name, username, or outlet name.
                    </p>
                  </div>
                ) : (
                  quickFindResults.map((user, idx) => {
                    const isSelected = idx === selectedQuickFindIndex;
                    const userSubCount = safeCheques.filter((e) => e.userId === user.id || e.outletId === user.outletId).length +
                                         safeLoans.filter((l) => l.userId === user.id || l.outletId === user.outletId).length;
                    const hasPendingReset = pendingResetRequests.some(
                      (r) => r.userId === user.id || (r.emailOrPhone && user.email && r.emailOrPhone.toLowerCase() === user.email.toLowerCase())
                    );

                    return (
                      <div
                        key={user.id}
                        id={`quick-find-item-${user.id}`}
                        onClick={() => handleSelectQuickFindUser(user)}
                        onMouseEnter={() => setSelectedQuickFindIndex(idx)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? isDark
                              ? 'bg-slate-800/90 ring-1 ring-emerald-500'
                              : 'bg-emerald-50/70 ring-1 ring-emerald-400'
                            : isDark
                            ? 'hover:bg-slate-800/50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Left: Avatar & Officer Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-500/40 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                              }}
                            />
                                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                              isDark ? 'border-slate-900' : 'border-white'
                            } ${user.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-black tracking-tight truncate ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}>
                                {user.fullName}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                {user.employeeId}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                @{user.username || user.email.split('@')[0]}
                              </span>
                              {hasPendingReset && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 shrink-0 animate-pulse">
                                  RESET REQ
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 truncate">
                              <span className="flex items-center gap-1 shrink-0 font-medium text-slate-500 dark:text-slate-300">
                                <Building2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span className="truncate max-w-[160px]">{user.outletName}</span>
                              </span>
                              <span className="hidden sm:inline text-slate-400">•</span>
                              <span className="hidden sm:inline font-mono">{user.phone || user.email}</span>
                              <span className="hidden sm:inline text-slate-400">•</span>
                              <span className="hidden md:inline font-medium text-slate-400">{user.designation}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Quick Action Button & Stats */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="hidden lg:inline text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            {userSubCount} logs
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectQuickFindUser(user);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                                : isDark
                                ? 'bg-slate-800 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700'
                                : 'bg-slate-100 text-slate-800 hover:bg-emerald-500 hover:text-white'
                            }`}
                          >
                            <span>Inspect Profile</span>
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className={`px-4 py-2 border-t text-[10px] flex items-center justify-between ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
              }`}>
                <span>Total Registered Field Officers: <strong className="font-bold text-slate-700 dark:text-slate-300">{safeUsers.length}</strong></span>
                <span className="text-emerald-500 font-bold">1-Click Full File Inspector</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Pick Officers Chips */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto text-xs pb-0.5">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Picks:
          </span>
          {safeUsers.slice(0, 5).map((user) => (
            <button
              key={`quick-pick-${user.id}`}
              onClick={() => handleSelectQuickFindUser(user)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shrink-0 border ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 border-slate-700/80 text-slate-300'
                  : 'bg-slate-100 hover:bg-emerald-500 hover:text-white border-slate-200 text-slate-700'
              }`}
            >
              <span className="font-mono text-emerald-500 font-extrabold">{user.employeeId}</span>
              <span className="truncate max-w-[120px]">{user.fullName.split(' ')[0]}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
          {pendingResetRequests.length > 0 && (
            <button
              onClick={() => {
                setStatusFilter('RESETS');
                showToast({ message: `Filtered by ${pendingResetRequests.length} pending reset request(s).`, type: 'info' });
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer shrink-0"
            >
              <KeyRound className="w-3 h-3" />
              <span>{pendingResetRequests.length} Pending Resets</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. USER INTELLIGENCE & AUTH COUNT METRICS GRID           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Total Registered Users */}
        <div
          id="metric-card-total-officers"
          onClick={() => setActiveNavTab('users')}
          className={`group p-4 rounded-[22px] border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-indigo-500/60 shadow-md hover:shadow-indigo-500/10' 
              : 'bg-white hover:bg-indigo-50/40 border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs'
          }`}
          title="Click to open full AFO Directory & User Management"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-indigo-400 transition-colors">
              {currentLang === 'bn' ? 'মোট কর্মকর্তা' : 'Total Officers'}
            </span>
            <div className="w-7 h-7 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalUsers}
            </div>
            <div className="text-[10px] font-bold text-indigo-500 flex items-center justify-between mt-0.5">
              <span>{currentLang === 'bn' ? 'AFO ডিরেক্টরি' : 'AFO Directory'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Metric 2: Active Accounts */}
        <div
          id="metric-card-active-officers"
          onClick={() => setActiveNavTab('users')}
          className={`group p-4 rounded-[22px] border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/60 shadow-md hover:shadow-emerald-500/10' 
              : 'bg-white hover:bg-emerald-50/40 border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
          }`}
          title="Click to view Active Officers list"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">
              {currentLang === 'bn' ? 'সক্রিয় টিম' : 'Active'}
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeUsersCount}
            </div>
            <div className="text-[10px] font-bold text-emerald-500 flex items-center justify-between mt-0.5">
              <span>{Math.round((activeUsersCount / (totalUsers || 1)) * 100)}% {currentLang === 'bn' ? 'সক্রিয়' : 'active team'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Metric 3: Recently Active (Last 48h) */}
        <div
          id="metric-card-active-logins"
          onClick={() => setActiveNavTab('users')}
          className={`group p-4 rounded-[22px] border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-teal-500/60 shadow-md hover:shadow-teal-500/10' 
              : 'bg-white hover:bg-teal-50/40 border-slate-200/90 hover:border-teal-300 shadow-2xs hover:shadow-xs'
          }`}
          title="Click to view recent login activity"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-teal-400 transition-colors">
              {currentLang === 'bn' ? 'সাম্প্রতিক লগইন' : 'Active Logins'}
            </span>
            <div className="w-7 h-7 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {recentlyActiveUsers.length}
            </div>
            <div className="text-[10px] font-bold text-teal-500 flex items-center justify-between mt-0.5">
              <span>{currentLang === 'bn' ? 'সাম্প্রতিক সেশন' : 'Recent Sessions'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Metric 4: Password Reset Requests */}
        <div
          id="metric-card-reset-requests"
          onClick={() => setActiveNavTab('users')}
          className={`group p-4 rounded-[22px] border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
            pendingResetRequests.length > 0
              ? isDark
                ? 'bg-amber-500/15 hover:bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-amber-50/90 hover:bg-amber-100/80 border-amber-300 shadow-2xs'
              : isDark
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-amber-500/60 shadow-md'
                : 'bg-white hover:bg-amber-50/40 border-slate-200/90 hover:border-amber-300 shadow-2xs'
          }`}
          title="Click to view and resolve Password Reset Requests"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
              {currentLang === 'bn' ? 'রিসেট অনুরোধ' : 'Reset Requests'}
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
              {pendingResetRequests.length}
            </div>
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between gap-1 mt-0.5">
              <span>{pendingResetRequests.length > 0 ? (currentLang === 'bn' ? 'ডিরেক্টরি থেকে সমাধান করুন' : 'Resolve In Directory') : (currentLang === 'bn' ? 'সব ক্লিয়ার' : 'All Cleared')}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Metric 5: Outlets Active */}
        <div
          id="metric-card-outlets"
          onClick={() => setActiveNavTab('outlets')}
          className={`group p-4 rounded-[22px] border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-blue-500/60 shadow-md hover:shadow-blue-500/10' 
              : 'bg-white hover:bg-blue-50/40 border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs'
          }`}
          title="Click to view and manage all BRAC Bank Outlets"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
              {currentLang === 'bn' ? 'আউটলেটসমূহ' : 'Outlets'}
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalOutlets}
            </div>
            <div className="text-[10px] font-bold text-blue-500 flex items-center justify-between mt-0.5">
              <span>{districts.length} {currentLang === 'bn' ? 'জেলা রেজিস্ট্রি' : 'Districts Registry'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Metric 6: Total Activity Records */}
        <div
          id="metric-card-total-entries"
          onClick={() => setActiveNavTab('master_data')}
          className={`group p-4 rounded-[22px] border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-purple-500/60 shadow-md hover:shadow-purple-500/10' 
              : 'bg-white hover:bg-purple-50/40 border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-xs'
          }`}
          title="Click to inspect all Cheque, Card, and Loan entries in Master Data"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-purple-400 transition-colors">
              {currentLang === 'bn' ? 'মোট এন্ট্রি' : 'Total Entries'}
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalSubmissions}
            </div>
            <div className="text-[10px] font-bold text-purple-500 flex items-center justify-between mt-0.5">
              <span>{currentLang === 'bn' ? 'মাস্টার ডেটা টেবিল' : 'Master Data Table'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. USER MANAGEMENT & DETAILS OVERVIEW SECTION            */}
      {/* ======================================================== */}
      <div className={`rounded-[26px] border p-5 sm:p-6 transition-all ${
        isDark ? 'bg-slate-800/90 border-slate-700 shadow-md' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        {/* Section Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentLang === 'bn' ? 'নিবন্ধিত কর্মকর্তাদের ইন্টেলিজেন্স তালিকা' : 'Registered Officers Intelligence Roster'}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'
              }`}>
                {filteredUsers.length} {currentLang === 'bn' ? 'প্রদর্শিত' : 'shown'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentLang === 'bn'
                ? 'যেকোনো কর্মকর্তার কার্ডে ক্লিক করে সম্পূর্ণ প্রোফাইল, ক্রেডেনশিয়াল, আউটলেট এবং অ্যাক্টিভিটি হিস্ট্রি দেখুন।'
                : 'Click any officer card or button to inspect complete profile, login credentials, assigned outlet, and all activity records.'}
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className={`flex items-center rounded-full px-3 py-1.5 border text-xs w-full sm:w-64 ${
              isDark ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={currentLang === 'bn' ? 'নাম, ইউজারনেম, আউটলেট, আইডি...' : 'Search name, username, outlet, ID...'}
                className="w-full bg-transparent focus:outline-none text-xs placeholder:text-slate-400"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* District Filter Dropdown */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              aria-label="Filter by district"
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold focus:outline-none cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">{currentLang === 'bn' ? 'সকল জেলা' : 'All Districts'}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Status Filter Tabs */}
            <div className={`flex items-center rounded-full p-0.5 border ${
              isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? isDark ? 'bg-white text-slate-900 shadow-xs' : 'bg-[#18181B] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {currentLang === 'bn' ? 'সকল' : 'All'} ({totalUsers})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-emerald-500'
                }`}
              >
                {currentLang === 'bn' ? 'সক্রিয়' : 'Active'} ({activeUsersCount})
              </button>
              <button
                onClick={() => setStatusFilter('SUSPENDED')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'SUSPENDED'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-red-400'
                }`}
              >
                {currentLang === 'bn' ? 'স্থগিত' : 'Suspended'} ({suspendedUsersCount})
              </button>
            </div>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-5">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-400/50 mb-2" />
              <p className="text-sm font-semibold">{currentLang === 'bn' ? 'ফিল্টারের সাথে কোনো কর্মকর্তা পাওয়া যায়নি।' : 'No registered officers found matching the filter criteria.'}</p>
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setDistrictFilter('ALL'); }}
                className="mt-2 text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
              >
                {currentLang === 'bn' ? 'সব ফিল্টার রিসেট করুন' : 'Reset all filters'}
              </button>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const userSubCount = safeCheques.filter((e) => e.userId === user.id || e.outletId === user.outletId).length +
                                   safeLoans.filter((l) => l.userId === user.id || l.outletId === user.outletId).length;
              const hasPendingReset = pendingResetRequests.some(
                (r) => r.userId === user.id || (r.emailOrPhone && user.email && r.emailOrPhone.toLowerCase() === user.email.toLowerCase())
              );

              return (
                <div
                  key={user.id}
                  id={`admin-user-card-${user.id}`}
                  onClick={() => handleOpenInspectUser(user)}
                  className={`group relative p-4 rounded-[22px] border transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-pointer flex flex-col justify-between ${
                    hasPendingReset
                      ? 'bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20'
                      : isDark
                        ? 'bg-slate-900/70 border-slate-700/80 hover:border-slate-500 text-white'
                        : 'bg-[#F8FAFC] border-slate-200/80 hover:border-slate-400 text-slate-900'
                  }`}
                >
                  {/* Top Row: User Avatar, Name, Role & Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={user.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                            isDark ? 'border-slate-900' : 'border-white'
                          } ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className={`text-sm font-extrabold tracking-tight group-hover:text-emerald-500 transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {user.fullName}
                            </h3>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">
                            @{user.username || user.email.split('@')[0]} • {user.employeeId}
                          </p>
                          <span className="inline-block text-[10px] font-bold text-slate-500">
                            {user.designation || 'Assistant Field Officer (AFO)'}
                          </span>
                        </div>
                      </div>

                      {/* Status / Reset Badge */}
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          {user.status}
                        </span>
                        {hasPendingReset && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                            RESET REQ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Outlet & Contact Snapshot */}
                    <div className={`mt-3.5 p-2.5 rounded-xl text-xs space-y-1.5 border ${
                      isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200/60'
                    }`}>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-bold truncate">{user.outletName}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">({user.outletCode || 'OUT-101'})</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[130px]">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats & Click to Inspect Action */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600 dark:text-slate-300">{userSubCount}</span> entries logged
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInspectUser(user);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                          : 'bg-slate-200 hover:bg-emerald-500 hover:text-white text-slate-800'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME AUDIT STREAM & NETWORK STATUS               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-time Audit Trail */}
        <div className={`lg:col-span-8 rounded-[26px] border p-5 sm:p-6 transition-all ${
          isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Live Officer Activity & Security Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Nationwide events, logins, updates, and registrations
              </p>
            </div>
            <button
              onClick={() => setActiveNavTab('master_data')}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Master Logs
            </button>
          </div>

          <div className="space-y-2.5">
            {safeAuditLogs.slice(0, 6).map((log, idx) => (
              <div
                key={`${log.id}-${idx}`}
                className={`p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-500 font-mono text-[11px]">{log.action}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                        {log.outletName}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] text-slate-400 block">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Outlet Health Matrix */}
        <div className={`lg:col-span-4 rounded-[26px] border p-5 sm:p-6 flex flex-col justify-between transition-all ${
          isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Outlet Distribution
              </h3>
              <span className="text-[11px] font-bold text-emerald-500">{safeOutlets.length} active nodes</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Overview of deployed Field Officers per regional division
            </p>

            <div className="space-y-3">
              {safeOutlets.slice(0, 5).map((outlet) => {
                const assignedCount = safeUsers.filter((u) => u.outletId === outlet.id).length;
                return (
                  <div
                    key={outlet.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{outlet.name}</span>
                      <span className="text-[10px] text-slate-400">{outlet.district}, {outlet.division}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-500">{assignedCount} AFOs</span>
                      <span className="text-[10px] text-slate-400 block">{outlet.code}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveNavTab('users')}
            className={`w-full py-2.5 mt-4 rounded-full text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
            }`}
          >
            <span>Manage All Outlets & Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. IN-DEPTH USER INSPECTOR MODAL (DEEP DIVE DETAILS)      */}
      {/* ======================================================== */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-4xl max-h-[92vh] rounded-[28px] border shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4">
                <img
                  src={inspectingUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={inspectingUser.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight">{inspectingUser.fullName}</h2>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      inspectingUser.status === 'ACTIVE' ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
                    }`}>
                      {inspectingUser.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {inspectingUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    @{inspectingUser.username || inspectingUser.email.split('@')[0]} • Employee ID: <strong className="font-mono text-emerald-400">{inspectingUser.employeeId}</strong> • {inspectingUser.designation}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setInspectingUser(null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs Inside Modal */}
            <div className={`flex items-center gap-2 px-6 pt-3 border-b text-xs font-bold overflow-x-auto ${
              isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
            }`}>
              <button
                onClick={() => setInspectorTab('OVERVIEW')}
                className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'OVERVIEW'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Account & Profile Details</span>
              </button>

              <button
                onClick={() => setInspectorTab('SUBMISSIONS')}
                className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'SUBMISSIONS'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Activity & Submissions ({inspectedUserSubmissions.cheques.length + inspectedUserSubmissions.cards.length + inspectedUserSubmissions.loans.length})</span>
              </button>

              <button
                onClick={() => setInspectorTab('SECURITY')}
                className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'SECURITY'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Security & Password Resets ({inspectedUserResets.length})</span>
              </button>

              <button
                onClick={() => setInspectorTab('COMMUNICATION')}
                className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'COMMUNICATION'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct Admin Memo</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(92vh-180px)]">
              {/* TAB 1: OVERVIEW */}
              {inspectorTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Edit Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      User Credentials & Operational Information
                    </span>
                    <button
                      onClick={() => setIsEditingInModal(!isEditingInModal)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                        isEditingInModal
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                      }`}
                    >
                      {isEditingInModal ? 'Cancel Edit' : 'Edit Credentials / Outlet'}
                    </button>
                  </div>

                  {/* If Editing Mode is Active */}
                  {isEditingInModal ? (
                    <div className={`p-4 rounded-2xl border space-y-4 ${
                      isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div>
                          <label className="font-bold text-slate-400 block mb-1">Username</label>
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-400 block mb-1">Password / 4-Digit PIN</label>
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-mono ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-400 block mb-1">Contact Phone</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-400 block mb-1">Assign Outlet</label>
                          <select
                            value={editOutletId}
                            onChange={(e) => setEditOutletId(e.target.value)}
                            aria-label="Assign outlet"
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          >
                            {safeOutlets.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name} ({o.district})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={handleSaveModalEdit}
                          className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read-Only Grid Display */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      {/* Box 1: Auth & Login Snapshot */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold uppercase text-slate-400 text-[10px]">Auth Credentials</span>
                          <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block">Login Username:</span>
                          <span className="font-bold text-sm text-emerald-400 font-mono">@{inspectingUser.username || inspectingUser.email.split('@')[0]}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block">Password / PIN:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">
                              {showPasswordInModal ? (inspectingUser.password || '1234') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              {showPasswordInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Assigned Outlet Snapshot */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold uppercase text-slate-400 text-[10px]">Station Node</span>
                          <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Assigned Outlet:</span>
                          <span className="font-bold text-sm block">{inspectingUser.outletName}</span>
                          <span className="text-[10px] text-slate-400 block">{inspectingUser.outletLocation || 'Dhaka Metro Hub'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Supervisor:</span>
                          <span className="font-semibold">{inspectingUser.supervisorName || 'Regional Operations Manager'}</span>
                        </div>
                      </div>

                      {/* Box 3: Contact & Personal Info */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold uppercase text-slate-400 text-[10px]">Contact Info</span>
                          <Phone className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Phone & WhatsApp:</span>
                          <span className="font-bold font-mono">{inspectingUser.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Official Email:</span>
                          <span className="font-medium truncate block">{inspectingUser.email}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System & Login Timeline */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/70 border-slate-200'
                  }`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Account Timelines</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Registered On:</span>
                        <span className="font-bold">
                          {inspectingUser.createdAt ? new Date(inspectingUser.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Last Login Activity:</span>
                        <span className="font-bold text-emerald-400">
                          {inspectingUser.lastLoginAt ? new Date(inspectingUser.lastLoginAt).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Years of Service:</span>
                        <span className="font-bold">{inspectingUser.yearsOfService || 1} Year(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar Inside Modal */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleToggleUserStatus(inspectingUser)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                        inspectingUser.status === 'ACTIVE'
                          ? 'bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                      }`}
                    >
                      {inspectingUser.status === 'ACTIVE' ? 'Suspend User Account' : 'Activate User Account'}
                    </button>

                    <button
                      onClick={() => {
                        setInspectingUser(null);
                        setActiveNavTab('users');
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
                      }`}
                    >
                      Open in Full User Directory
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SUBMISSIONS & ACTIVITY */}
              {inspectorTab === 'SUBMISSIONS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      All Registered Records by {inspectingUser.fullName}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-500">
                      {inspectedUserSubmissions.cheques.length} Cheques • {inspectedUserSubmissions.cards.length} Debit Cards • {inspectedUserSubmissions.loans.length} Loans
                    </span>
                  </div>

                  {inspectedUserSubmissions.cheques.length === 0 &&
                   inspectedUserSubmissions.cards.length === 0 &&
                   inspectedUserSubmissions.loans.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No customer submissions logged yet by this officer.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Cheques list */}
                      {inspectedUserSubmissions.cheques.map((c) => (
                        <div
                          key={c.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                            isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold block">{c.accountTitle} ({c.leafCount} Leaves)</span>
                              <span className="text-[10px] text-slate-400 font-mono">A/C: {c.accountNumber} • Range: {c.startCchNumber} - {c.endCchNumber}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                              {c.status}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{c.receivedDate}</span>
                          </div>
                        </div>
                      ))}

                      {/* Cards list */}
                      {inspectedUserSubmissions.cards.map((card) => (
                        <div
                          key={card.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                            isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold block">{card.cardName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">A/C: {card.accountNumber} • Mobile: {card.mobileNumber}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">
                              {card.status}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{card.receivedDate}</span>
                          </div>
                        </div>
                      ))}

                      {/* Loans list */}
                      {inspectedUserSubmissions.loans.map((loan) => (
                        <div
                          key={loan.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                            isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold">
                              <Landmark className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold block">{loan.customerName} - {loan.accountTitle}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Loan A/C: {loan.loanAccountNumber} • ৳{loan.loanAmount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/30">
                              {loan.loanStatus}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{loan.disbursementDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SECURITY & RESET REQUESTS */}
              {inspectorTab === 'SECURITY' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Password Reset Requests History
                  </span>

                  {inspectedUserResets.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No password reset requests submitted by this officer.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inspectedUserResets.map((req) => (
                        <div
                          key={req.id}
                          className={`p-4 rounded-2xl border space-y-2 text-xs ${
                            req.status === 'PENDING'
                              ? 'bg-amber-500/10 border-amber-500/40 text-slate-200'
                              : isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-500">Ticket: {req.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              req.status === 'PENDING' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Officer Note:</span>
                            <p className="italic text-slate-300">"{req.userNote || 'Forgot password request'}"</p>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-1">
                            Requested at: {new Date(req.requestedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DIRECT ADMIN MEMO */}
              {inspectorTab === 'COMMUNICATION' && (
                <form onSubmit={handleSendDirectMemo} className="space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Dispatch Official Station Memo / Notification
                    </h4>
                    <p className="text-xs text-slate-400">
                      This communication will be routed exclusively to {inspectingUser.fullName}'s private notification center and mailbox.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Memo Subject *</label>
                      <input
                        type="text"
                        required
                        value={memoSubject}
                        onChange={(e) => setMemoSubject(e.target.value)}
                        placeholder="e.g. Clearance regarding KYC documents verification"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Memo Message Body *</label>
                      <textarea
                        required
                        rows={4}
                        value={memoMessage}
                        onChange={(e) => setMemoMessage(e.target.value)}
                        placeholder="Type instructions or official administrative notification here..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium leading-relaxed ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Priority:</span>
                        <select
                          value={memoPriority}
                          onChange={(e) => setMemoPriority(e.target.value as any)}
                          aria-label="Memo priority"
                          className={`px-3 py-1 rounded-full border text-xs font-bold ${
                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <option value="NORMAL">Normal</option>
                          <option value="IMPORTANT">Important</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingMemo}
                        className="px-5 py-2.5 rounded-full text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingMemo ? 'Sending...' : 'Send Memo to Officer'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
