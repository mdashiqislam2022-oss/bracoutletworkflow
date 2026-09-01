import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  AdminAccount,
  BRACBankOutlet,
  WorkSubmission,
  AuditLog,
  UserPreferences,
  SubmissionStatus,
  AdminPermission,
  StationMailMessage,
  StationNotification,
  ChequeCardEntry,
  ChequeBookRecord,
  DebitCardRecord,
  ChequeLeafCount,
  LoanAccountRecord,
  LoanStatus,
  PasswordResetRequest,
  PortalGovernanceSettings,
  AfoTransferRecord
} from '../types';
import {
  SupabaseService,
  mapDbToChequeCardEntry,
  mapDbToLoanRecord,
  mapDbToSubmission
} from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

export interface ToastData {
  message: string;
  text?: string;
  type: 'success' | 'error' | 'info';
}

export interface AppContextType {
  currentUser: UserProfile | null;
    currentUser: UserProfile | null;
  isCloudDataLoaded: boolean;
  currentAdmin: AdminAccount | null;
  authMode: 'NONE' | 'USER' | 'ADMIN';
  outlets: BRACBankOutlet[];
  users: UserProfile[];
  admins: AdminAccount[];
  submissions: WorkSubmission[];
  userSubmissions: WorkSubmission[];
  auditLogs: AuditLog[];
  userPreferences: UserPreferences;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  
  // Cheque & Debit Card Registry
  chequeCardEntries: ChequeCardEntry[];
  addChequeBookEntry: (data: {
    accountTitle: string;
    accountNumber: string;
    mobileNumber: string;
    receivedDate: string;
    leafCount: ChequeLeafCount;
    startCchNumber: string;
    endCchNumber: string;
    notes?: string;
  }) => ChequeBookRecord;
  addDebitCardEntry: (data: {
    cardName: string;
    accountNumber: string;
    mobileNumber: string;
    receivedDate: string;
    cardType?: string;
    notes?: string;
  }) => DebitCardRecord;
  updateChequeCardEntry: (entry: ChequeCardEntry) => void;
  updateChequeCardStatus: (
    id: string,
    status: 'RECEIVED' | 'DELIVERED_TO_CUSTOMER' | 'RETURNED' | 'DESTROYED_EXPIRED',
    deliveryDate?: string,
    notes?: string,
    destructionData?: { destroyedAt?: string; destructionReason?: string }
  ) => void;
  deleteChequeCardEntry: (id: string) => void;

  // Loan Account Registry
  loanRecords: LoanAccountRecord[];
  loanAccounts?: LoanAccountRecord[];
  addLoanRecord: (data: {
    accountTitle: string;
    customerName: string;
    mobileNumber: string;
    loanAccountNumber: string;
    loanAmount: number;
    monthlyInstallment: number;
    disbursementDate: string;
    interestRate: number;
    loanTenureYears: number;
    loanStatus?: LoanStatus;
    notes?: string;
  }) => LoanAccountRecord;
  updateLoanRecord: (record: LoanAccountRecord) => void;
  deleteLoanRecord: (id: string) => void;

  // Add/Edit Entry Modal controls
  isAddEntryModalOpen: boolean;
  setIsAddEntryModalOpen: (open: boolean) => void;
  initialAddEntryType: 'CHOICE' | 'CHEQUE' | 'CARD';
  editingChequeCardEntry: ChequeCardEntry | null;
  openAddEntryModal: (type?: 'CHOICE' | 'CHEQUE' | 'CARD') => void;
  openEditEntryModal: (entry: ChequeCardEntry) => void;
  closeAddEntryModal: () => void;

  // Mail & Messages
  mailMessages: StationMailMessage[];
  unreadMailCount: number;
  sendMailMessage: (msg: {
    recipientUserId?: string;
    recipientOutletId?: string;
    subject: string;
    content: string;
    priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
    category?: 'CIRCULAR' | 'OPERATION_UPDATE' | 'AUDIT_NOTICE' | 'DIRECT_MEMO';
  }) => void;
  sendStationMail?: (msg: {
    recipientUserId?: string;
    recipientOutletId?: string;
    subject: string;
    content: string;
    priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
    category?: 'CIRCULAR' | 'OPERATION_UPDATE' | 'AUDIT_NOTICE' | 'DIRECT_MEMO';
  }) => void;
  markMailAsRead: (id: string) => void;
  markAllMailAsRead: () => void;
  deleteMailMessage: (id: string) => void;

  // Notifications
  notifications: StationNotification[];
  unreadNotificationsCount: number;
  sendNotificationNote: (note: {
    title: string;
    message: string;
    type?: 'ADMIN_NOTE' | 'APPROVAL' | 'SYNC' | 'ALERT' | 'INFO';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    targetUserId?: string;
    targetOutletId?: string;
    targetAudience?: 'ADMIN_ONLY' | 'USER_ONLY' | 'ALL';
    linkTab?: string;
  }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  
  // Password Reset Requests (Admin & User)
  passwordResetRequests: PasswordResetRequest[];
  requestPasswordResetFromAdmin: (data: {
    fullName: string;
    emailOrPhone: string;
    outletId?: string;
    outletName?: string;
    outletCode?: string;
    userNote?: string;
  }) => { success: boolean; requestId: string; message: string };
  resolvePasswordResetRequest: (
    requestId: string,
    updates: {
      username?: string;
      password: string;
      avatarUrl?: string;
      adminNote?: string;
    }
  ) => { success: boolean; message: string };
  rejectPasswordResetRequest: (requestId: string, adminNote?: string) => { success: boolean; message: string };
  cancelPasswordResetRequest: (requestId: string, adminNote?: string) => { success: boolean; message: string };
  reopenPasswordResetRequest: (requestId: string) => { success: boolean; message: string; request?: PasswordResetRequest };
  adminUpdateUserProfile: (userId: string, updates: Partial<UserProfile>) => { success: boolean; message: string };

  // Governance & Admin Profile Management
  governanceSettings: PortalGovernanceSettings;
  updateGovernanceSettings: (updates: Partial<PortalGovernanceSettings>) => void;
  updateAdminProfileAndCredentials: (updates: {
    username?: string;
    password?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  }) => { success: boolean; message?: string };

  // Auth methods & Aliases
    loginUserWithCredentials: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; needsSignup?: boolean; message?: string }>;
  loginUser: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; needsSignup?: boolean; message?: string }>;
  loginUserByEmail: (email: string) => Promise<{ success: boolean; needsSignup?: boolean; message?: string }>;
  loginWithGoogle: (email: string) => Promise<{ success: boolean; needsSignup?: boolean; message?: string }>;
    signUpUser: (data: { email: string; fullName: string; phone: string; outletId?: string; outletName?: string; outletCode?: string; district?: string; username?: string; password?: string; avatarUrl?: string; autoLogin?: boolean }) => { success: boolean; message?: string; user?: UserProfile };
  signupWithGoogle: (data: { email: string; fullName: string; phone: string; outletId?: string; outletName?: string; outletCode?: string; username?: string; password?: string; avatarUrl?: string; autoLogin?: boolean }) => { success: boolean; message?: string; user?: UserProfile };
  resetUserCredentials: (
    identifier: string,
    data: { newPassword: string; newUsername?: string; avatarUrl?: string } | string
  ) => { success: boolean; message?: string; username?: string };
  resetAdminCredentials: (
    identifier: string,
    data: { newPassword: string; newUsername?: string; avatarUrl?: string } | string
  ) => { success: boolean; message?: string; username?: string };
    loginAdminByPin: (username?: string, pin?: string) => Promise<{ success: boolean; message?: string }>;
  loginAdminWithPin: (username?: string, pin?: string) => { success: boolean; message?: string };
  loginAdminDirectly: () => { success: boolean; message?: string };
  setupFirstTimeAdmin: (data: { email: string; fullName: string; username: string; pin: string }) => { success: boolean; message?: string };
  setupAdminWithPin: (data: { email: string; fullName: string; username: string; pin: string }) => { success: boolean; message?: string };
  logout: () => void;
  
  // User operations
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  createNewSubmission: (submissionData: any) => WorkSubmission;
  submitWorkData: (submissionData: any) => WorkSubmission;
  updateSubmissionStatus: (id: string, status: SubmissionStatus, notes?: string) => void;
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  
  // Admin operations
  deletedOutlets: BRACBankOutlet[];
  updateAdminProfile: (updates: Partial<AdminAccount>) => void;
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED') => void;
  updateUserOutletAssignment: (userId: string, outletId: string) => void;
  transferAfoToOutlet: (
    userId: string,
    targetOutletId: string,
    options?: { revokePreviousOutletAccess?: boolean; adminNote?: string }
  ) => { success: boolean; message: string };
  delegateAdminAccess: (data: { email: string; fullName: string; username: string; pin: string; permissions: AdminPermission[] }) => { success: boolean; message?: string };
  revokeAdminDelegation: (adminId: string) => void;
  addOutlet: (outlet: Omit<BRACBankOutlet, 'id'>) => void;
  addNewOutlet: (outlet: Omit<BRACBankOutlet, 'id'>) => void;
  updateOutlet: (outletId: string, updates: Partial<BRACBankOutlet>) => { success: boolean; message: string };
  deleteOutlet: (outletId: string, purgeData?: boolean) => void;
  suspendOutlet: (outletId: string, reason?: string) => void;
  reactivateOutlet: (outletId: string) => void;
  restoreDeletedOutlet: (outletId: string) => void;
  permanentlyPurgeDeletedOutlet: (outletId: string) => void;
  toggleOutletStatus: (outletId: string) => void;
  adminCreateAFO: (data: {
    fullName: string;
    email: string;
    phone: string;
    outletId: string;
    username?: string;
    password?: string;
    designation?: string;
    employeeId?: string;
    avatarUrl?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    bio?: string;
  }) => { success: boolean; message: string; user?: UserProfile };
  deleteUser: (userId: string) => void;

  // Cross-Navigation between AFO and Outlets
  selectedOutletIdForNav: string | null;
  setSelectedOutletIdForNav: (id: string | null) => void;
  selectedUserIdForNav: string | null;
  setSelectedUserIdForNav: (id: string | null) => void;
  selectedAfoForTransfer: string | null;
  setSelectedAfoForTransfer: (id: string | null) => void;
  afoTransfers: AfoTransferRecord[];
  afoTransferResetTrigger: number;
  triggerAfoTransferReset: () => void;
  outletSubView: 'LIST' | 'DETAILS' | 'EDIT';
  setOutletSubView: (view: 'LIST' | 'DETAILS' | 'EDIT') => void;
  afoSubView: 'LIST' | 'DETAILS' | 'EDIT';
  setAfoSubView: (view: 'LIST' | 'DETAILS' | 'EDIT') => void;
  navigateToOutlet: (outletId: string, view?: 'DETAILS' | 'EDIT') => void;
  navigateToAfo: (userId: string, view?: 'DETAILS' | 'EDIT') => void;
  navigateToTransfer: (userId?: string) => void;
  refreshLiveMetrics: () => void;
  
  // Utils
  addAuditEntry: (action: string, details: string, outletName?: string) => void;
  resetAllDemoData: () => void;
  resetDemoData: () => void;
  toastMessage: ToastData | null;
  setToast: (msg: ToastData | { text: string; type: 'success' | 'error' | 'info' } | null) => void;
  showToast: (msg: string | ToastData | { text: string; type: 'success' | 'error' | 'info' } | null, type?: 'success' | 'error' | 'info') => void;
  addToast: (msg: string | ToastData | { text: string; type: 'success' | 'error' | 'info' } | null, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

const defaultGovernanceSettings: PortalGovernanceSettings = {
  allowSelfRegistration: true,
  requirePinAuth: true,
  allowOfficerProfileEdit: true,
  requireOutletOnSignup: true,
  systemBroadcastNotice: 'Welcome to BRAC Bank Field Officer Central Workflow System.',
  systemBroadcastType: 'INFO',
  enableBroadcastBanner: true,
};

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  emailNotifications: true,
  smsAlerts: true,
  soundEffects: true,
  compactView: false,
};

// Global unique id counter
let globalIdSequence = 0;
const createUniqueId = (prefix: string) => {
  globalIdSequence += 1;
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${time}-${globalIdSequence}-${rand}`;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master Cloud State (Clean Slate - Supabase Exclusive Cloud Persistence)
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [outlets, setOutlets] = useState<BRACBankOutlet[]>([]);
  const [deletedOutlets, setDeletedOutlets] = useState<BRACBankOutlet[]>([]);
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
  const [mailMessages, setMailMessages] = useState<StationMailMessage[]>([]);
  const [notifications, setNotifications] = useState<StationNotification[]>([]);
  const [chequeCardEntries, setChequeCardEntries] = useState<ChequeCardEntry[]>([]);
  const [loanRecords, setLoanRecords] = useState<LoanAccountRecord[]>([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);
  const [governanceSettings, setGovernanceSettings] = useState<PortalGovernanceSettings>(defaultGovernanceSettings);
  const [afoTransfers, setAfoTransfers] = useState<AfoTransferRecord[]>([]);

  // Current session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCloudDataLoaded, setIsCloudDataLoaded] = useState<boolean>(!SupabaseService.isAvailable());
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [authMode, setAuthMode] = useState<'NONE' | 'USER' | 'ADMIN'>('NONE');
  
  // Navigation & UI
  const [activeNavTab, setActiveNavTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<ToastData | null>(null);

  // Cross-Navigation & Sub-views between AFO, Outlets, and Transfers
  const [selectedOutletIdForNav, setSelectedOutletIdForNav] = useState<string | null>(null);
  const [selectedUserIdForNav, setSelectedUserIdForNav] = useState<string | null>(null);
  const [selectedAfoForTransfer, setSelectedAfoForTransfer] = useState<string | null>(null);
  const [outletSubView, setOutletSubView] = useState<'LIST' | 'DETAILS' | 'EDIT'>('LIST');
  const [afoSubView, setAfoSubView] = useState<'LIST' | 'DETAILS' | 'EDIT'>('LIST');

  const [afoTransferResetTrigger, setAfoTransferResetTrigger] = useState<number>(0);

  const triggerAfoTransferReset = () => {
    setSelectedAfoForTransfer(null);
    setAfoTransferResetTrigger((prev) => prev + 1);
  };

  const refreshLiveMetrics = () => {
    // Re-fetch fresh live data from Supabase
    if (SupabaseService.isAvailable()) {
      SupabaseService.fetchAllData().then((cloudData) => {
        if (cloudData) {
          if (cloudData.outlets) setOutlets(cloudData.outlets);
          if (cloudData.users) setUsers(cloudData.users);
          if (cloudData.admins) setAdmins(cloudData.admins);
          if (cloudData.submissions) setSubmissions(cloudData.submissions);
          if (cloudData.chequeCardEntries) setChequeCardEntries(cloudData.chequeCardEntries);
          if (cloudData.loanRecords) setLoanRecords(cloudData.loanRecords);
          if (cloudData.mailMessages) setMailMessages(cloudData.mailMessages);
          if (cloudData.notifications) setNotifications(cloudData.notifications);
          if (cloudData.passwordResetRequests) setPasswordResetRequests(cloudData.passwordResetRequests);
          if (cloudData.afoTransfers) setAfoTransfers(cloudData.afoTransfers);
          if (cloudData.auditLogs) setAuditLogs(cloudData.auditLogs);
          if (cloudData.governanceSettings) setGovernanceSettings(cloudData.governanceSettings);
        }
      }).catch((err) => console.warn('Refresh error:', err));
    }
    showToast({
      message: 'Dashboard and live metric cache refreshed from Supabase!',
      type: 'success'
    });
  };

  const navigateToOutlet = (outletId: string, view: 'DETAILS' | 'EDIT' = 'DETAILS') => {
    setSelectedOutletIdForNav(outletId);
    setOutletSubView(view);
    setActiveNavTab('outlets');
  };

  const navigateToAfo = (userId: string, view: 'DETAILS' | 'EDIT' = 'DETAILS') => {
    setSelectedUserIdForNav(userId);
    setAfoSubView(view);
    setActiveNavTab('users');
  };

  const navigateToTransfer = (userId?: string) => {
    if (userId) {
      setSelectedAfoForTransfer(userId);
    } else {
      triggerAfoTransferReset();
    }
    setActiveNavTab('afo_transfer');
  };

  // Add/Edit Entry Modal state
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState<boolean>(false);
  const [initialAddEntryType, setInitialAddEntryType] = useState<'CHOICE' | 'CHEQUE' | 'CARD'>('CHOICE');
  const [editingChequeCardEntry, setEditingChequeCardEntry] = useState<ChequeCardEntry | null>(null);

  const openAddEntryModal = (type: 'CHOICE' | 'CHEQUE' | 'CARD' = 'CHOICE') => {
    setEditingChequeCardEntry(null);
    setInitialAddEntryType(type);
    setIsAddEntryModalOpen(true);
  };

  const openEditEntryModal = (entry: ChequeCardEntry) => {
    setEditingChequeCardEntry(entry);
    setInitialAddEntryType(entry.type);
    setIsAddEntryModalOpen(true);
  };

  const closeAddEntryModal = () => {
    setIsAddEntryModalOpen(false);
    setEditingChequeCardEntry(null);
  };

  // 1. Initial Load & Real-Time Sync from Supabase Cloud Database
  useEffect(() => {
    let isMounted = true;

    const loadCloudData = async () => {
      if (SupabaseService.isAvailable()) {
        try {
          const cloudData = await SupabaseService.fetchAllData();
          if (cloudData && isMounted) {
            if (cloudData.outlets) setOutlets(cloudData.outlets);
            if (cloudData.users) setUsers(cloudData.users);
            if (cloudData.admins) setAdmins(cloudData.admins);
            if (cloudData.submissions) setSubmissions(cloudData.submissions);
            if (cloudData.chequeCardEntries) setChequeCardEntries(cloudData.chequeCardEntries);
            if (cloudData.loanRecords) setLoanRecords(cloudData.loanRecords);
            if (cloudData.mailMessages) setMailMessages(cloudData.mailMessages);
            if (cloudData.notifications) setNotifications(cloudData.notifications);
            if (cloudData.passwordResetRequests) setPasswordResetRequests(cloudData.passwordResetRequests);
            if (cloudData.afoTransfers) setAfoTransfers(cloudData.afoTransfers);
            if (cloudData.auditLogs) setAuditLogs(cloudData.auditLogs);
                        if (cloudData.governanceSettings) setGovernanceSettings(cloudData.governanceSettings);

            // Restore admin login session after refresh (if a valid Supabase Auth session exists)
            if (SupabaseService.isAvailable() && supabase) {
              const { data: sessionData } = await supabase.auth.getSession();
              const sessionEmail = sessionData?.session?.user?.email;
              if (sessionEmail && cloudData.admins) {
                const restoredAdmin = cloudData.admins.find(
                  (a: AdminAccount) => a.email.toLowerCase() === sessionEmail.toLowerCase()
                );
                if (restoredAdmin && isMounted) {
                  setCurrentAdmin(restoredAdmin);
                  setAuthMode('ADMIN');
                }
              }
            }
                    }
        } catch (err) {
          console.warn('Supabase initial fetch error:', err);
        } finally {
          if (isMounted) setIsCloudDataLoaded(true);
        }
      }
    };

    loadCloudData();

    // Supabase Real-Time Listeners
    const unsubscribe = SupabaseService.subscribeToChanges({
      onChequeCardChange: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const entry = mapDbToChequeCardEntry(payload.new);
          setChequeCardEntries((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const entry = mapDbToChequeCardEntry(payload.new);
          setChequeCardEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setChequeCardEntries((prev) => prev.filter((e) => e.id !== payload.old.id));
        }
      },
      onLoanChange: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const record = mapDbToLoanRecord(payload.new);
          setLoanRecords((prev) => [record, ...prev.filter((r) => r.id !== record.id)]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const record = mapDbToLoanRecord(payload.new);
          setLoanRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setLoanRecords((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      },
            onSubmissionChange: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const sub = mapDbToSubmission(payload.new);
          setSubmissions((prev) => [sub, ...prev.filter((s) => s.id !== sub.id)]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const sub = mapDbToSubmission(payload.new);
          setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setSubmissions((prev) => prev.filter((s) => s.id !== payload.old.id));
        }
      },
            onUserChange: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const u = payload.new;
          const mappedUser = {
            id: u.id,
            email: u.email,
            username: u.username,
            password: u.password,
            fullName: u.full_name,
            phone: u.phone,
            avatarUrl: u.avatar_url,
            outletId: u.outlet_id,
            outletName: u.outlet_name,
            outletCode: u.outlet_code,
            outletLocation: u.outlet_location,
            employeeId: u.employee_id,
            designation: u.designation,
            yearsOfService: Number(u.years_of_service || 0),
            bio: u.bio,
            bloodGroup: u.blood_group,
            emergencyContact: u.emergency_contact,
            supervisorName: u.supervisor_name,
            role: u.role || 'USER',
            status: u.status || 'ACTIVE',
            needsResetLoginNotice: u.needs_reset_login_notice || false,
            createdAt: u.created_at,
            lastLoginAt: u.last_login_at,
                        isOnline: u.is_online || false,
            lastSeenAt: u.last_seen_at
          };
          setUsers((prev) => [mappedUser, ...prev.filter((x) => x.id !== mappedUser.id)]);
                } else if (payload.eventType === 'UPDATE' && payload.new) {
          const u = payload.new;
          setUsers((prev) =>
            prev.map((x) =>
              x.id === u.id
                                ? {
                    ...x,
                                                      username: u.username,
                    password: u.password,
                    fullName: u.full_name,
                    phone: u.phone,
                    avatarUrl: u.avatar_url,
                    outletId: u.outlet_id,
                    outletName: u.outlet_name,
                    outletCode: u.outlet_code,
                    outletLocation: u.outlet_location,
                    employeeId: u.employee_id,
                    designation: u.designation,
                    supervisorName: u.supervisor_name,
                    role: u.role || 'USER',
                    status: u.status,
                    needsResetLoginNotice: u.needs_reset_login_notice || false,
                    isOnline: u.is_online || false,
                    lastSeenAt: u.last_seen_at,
                    lastLoginAt: u.last_login_at
                  }
                : x
            )
          );
        }
      },
      onNotificationChange: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const n = payload.new;
          const notif = {
            id: n.id,
            title: n.title || '',
            message: n.message || '',
            type: n.type || 'INFO',
            priority: n.priority || 'MEDIUM',
            targetUserId: n.target_user_id || 'ALL',
            targetOutletId: n.target_outlet_id || 'ALL',
            targetAudience: n.target_audience || 'ALL',
            linkTab: n.link_tab || 'dashboard',
            isRead: n.is_read || false,
            timestamp: n.created_at || new Date().toISOString()
          };
          setNotifications((prev) => [notif, ...prev.filter((x) => x.id !== notif.id)]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const n = payload.new;
          setNotifications((prev) =>
            prev.map((x) => (x.id === n.id ? { ...x, isRead: n.is_read || false } : x))
          );
        }
      },
      onResetRequestChange: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const r = payload.new;
          const req = {
            id: r.id,
            userId: r.user_id,
            fullName: r.full_name,
            emailOrPhone: r.email_or_phone,
            outletId: r.outlet_id,
            outletName: r.outlet_name,
            outletCode: r.outlet_code,
            userNote: r.user_note,
            requestedAt: r.requested_at,
            status: r.status,
            resolvedAt: r.resolved_at,
            resolvedBy: r.resolved_by,
            adminNote: r.admin_note
          };
          setPasswordResetRequests((prev) => [req, ...prev.filter((x) => x.id !== req.id)]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const r = payload.new;
          setPasswordResetRequests((prev) =>
            prev.map((x) =>
              x.id === r.id
                ? {
                    ...x,
                    status: r.status,
                    resolvedAt: r.resolved_at,
                    resolvedBy: r.resolved_by,
                    adminNote: r.admin_note
                  }
                : x
            )
          );
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);
    // Real-time Outlet Sync: Admin AFO ke onno outlet e transfer korle, AFO er nijer active session e shathe shathe update hobe
  useEffect(() => {
    if (!currentUser) return;
    const latest = users.find((u) => u.id === currentUser.id);
    if (!latest) return;

    // Credential Security: Admin username/password change korle shathe shathe force logout
    if (latest.password !== currentUser.password || latest.username !== currentUser.username) {
      showToast({ message: 'Your login credentials were updated by Admin. Please log in again with your new username and password.', type: 'info' });
      try {
  sessionStorage.removeItem('brac_afo_active_user_id');
} catch {
  // Ignore sessionStorage errors.
}
      setCurrentUser(null);
      setAuthMode('NONE');
      setActiveNavTab('dashboard');
      return;
    }

    if (
      latest.outletId !== currentUser.outletId ||
      latest.outletName !== currentUser.outletName ||
      latest.outletCode !== currentUser.outletCode ||
      latest.status !== currentUser.status
    ) {
      setCurrentUser(latest);
    }
  }, [users, currentUser]);
    // Heartbeat: AFO's tab open thakle proti 20 second por "still active" signal pathabe
  useEffect(() => {
    if (authMode !== 'USER' || !currentUser) return;

    SupabaseService.updateHeartbeat(currentUser.id);
    const heartbeatInterval = setInterval(() => {
      SupabaseService.updateHeartbeat(currentUser.id);
    }, 20000);

    return () => clearInterval(heartbeatInterval);
  }, [authMode, currentUser?.id]);
    // Tab ba browser close hole sathe sathe AFO ke OFFLINE mark kora
  useEffect(() => {
    if (authMode !== 'USER' || !currentUser) return;
    const presenceUserId = currentUser.id;

    const markOfflineNow = () => {
      SupabaseService.setUserOfflineBeacon(presenceUserId);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        SupabaseService.updateHeartbeat(presenceUserId);
      }
    };

    window.addEventListener('pagehide', markOfflineNow);
    window.addEventListener('beforeunload', markOfflineNow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', markOfflineNow);
      window.removeEventListener('beforeunload', markOfflineNow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authMode, currentUser?.id]);

  // Toast auto-clear
  const showToast = (
    msg: string | ToastData | { text: string; type: 'success' | 'error' | 'info' } | null,
    type?: 'success' | 'error' | 'info'
  ) => {
    if (!msg) {
      setToastMessage(null);
      return;
    }
    let message = '';
    let toastType: 'success' | 'error' | 'info' = type || 'info';

    if (typeof msg === 'string') {
      message = msg;
      if (type) toastType = type;
    } else {
      message = 'message' in msg ? msg.message : msg.text || '';
      toastType = msg.type || type || 'info';
    }

    const formatted: ToastData = {
      message,
      text: message,
      type: toastType
    };
    setToastMessage(formatted);
    setTimeout(() => {
      setToastMessage((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  const addAuditEntry = (action: string, details: string, outletName?: string) => {
    const actorEmail = currentAdmin?.email || currentUser?.email || 'system@bracbank.com';
    const actorName = currentAdmin?.fullName || currentUser?.fullName || 'System Event';
    const actorRole = currentAdmin ? (currentAdmin.isMainAdmin ? 'ADMIN' : 'DELEGATED_ADMIN') : (currentUser ? 'USER' : 'USER');
    
    const newLog: AuditLog = {
      id: createUniqueId('LOG'),
      actorEmail,
      actorName,
      actorRole,
      action,
      details,
      outletName: outletName || currentUser?.outletName || 'Headquarters Control',
      ipAddress: '103.114.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10),
      timestamp: new Date().toISOString()
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // User Credential Login (Username / Gmail and Password)
    const loginUserWithCredentials = async (usernameOrEmail: string, password?: string) => {
     const rawIdentifier = (usernameOrEmail || '').trim(); const cleanIdentifier = rawIdentifier.toLowerCase();
    if (!cleanIdentifier) {
      return { success: false, message: 'Please enter your username or Gmail address.' };
    }

    const existingUser = users.find(
      (u) =>
        (u.username && u.username === rawIdentifier) ||
        u.email.toLowerCase() === cleanIdentifier ||
        u.phone.replace(/[\s-]/g, '') === cleanIdentifier.replace(/[\s-]/g, '')
    );

    if (!existingUser) {
      return { 
        success: false, 
        needsSignup: true, 
        message: 'No registered AFO account found with these credentials. Please check or sign up.' 
      };
    }

        if (existingUser.status === 'SUSPENDED') {
      showToast({ message: 'Access Suspended: Contact Head Office Administrator.', type: 'error' });
      return { success: false, message: 'Your account has been temporarily suspended by BRAC Bank Operations.' };
    }

       // Verify password server-side via RPC (never trust client-side password field)
    if (password) {
      const isValid = await SupabaseService.verifyUserPassword(rawIdentifier, password);
      if (!isValid) {
        return {
          success: false,
          message: 'Incorrect password. Please verify your 4-digit password and try again.'
        };
      }
    }

      // Same browser tab hard-refresh check.
// sessionStorage survives refresh but is isolated per browser tab.
let isSameTabAfterRefresh = false;

try {
  const refreshUserId = sessionStorage.getItem('brac_afo_active_user_id');
  isSameTabAfterRefresh = refreshUserId === existingUser.id;
} catch {
  // Ignore sessionStorage errors and keep normal login flow.
}

// If this is the same AFO returning immediately after a hard refresh,
// make sure the previous page's online flag is cleared before checking.
if (isSameTabAfterRefresh) {
  await SupabaseService.setUserOffline(existingUser.id);
}

// Real-time Single-Session Check: another browser/tab still active হলে login block
const sessionStatus = await SupabaseService.checkUserActiveSession(existingUser.id);

if (sessionStatus.isActive) {
  return {
    success: false,
    message: `Already logged in: ${existingUser.fullName}, this AFO account is currently active on another browser/tab. Please log out there first.`
  };
}

        const hasPendingResetNotice = !!existingUser.needsResetLoginNotice;

    const updatedUser: UserProfile = {
      ...existingUser,
      needsResetLoginNotice: false,
      lastLoginAt: new Date().toISOString(),
      isOnline: true
    };

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    SupabaseService.saveUserProfile(updatedUser);
    setCurrentUser(updatedUser);
    setCurrentAdmin(null);
    setAuthMode('USER');
      
     try {
  // Keep this only for the current browser tab.
  // It survives refresh, but is removed when the tab/browser is closed.
  sessionStorage.setItem('brac_afo_active_user_id', updatedUser.id);
} catch {
  // Ignore sessionStorage errors.
}
    setActiveNavTab('dashboard');
    addAuditEntry('USER_LOGIN', `AFO ${updatedUser.fullName} logged into ${updatedUser.outletName} (${updatedUser.username || updatedUser.email})`, updatedUser.outletName);

    if (hasPendingResetNotice) {
      // User logged in using admin-reset credentials -> send celebratory welcome notification exclusively to this user!
      sendNotificationNote({
        title: '🎉 Congratulations! Login Successful',
        message: `Welcome back, ${updatedUser.fullName}! You have successfully logged in with your updated credentials provided by Central Admin. Your account is now fully active, verified, and secured.`,
        type: 'APPROVAL',
        priority: 'HIGH',
        targetUserId: updatedUser.id,
        targetAudience: 'USER_ONLY',
        linkTab: 'dashboard'
      });

      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {
        // safe fallback
      }
      showToast({ message: `🎉 Congratulations ${updatedUser.fullName}! Logged in with updated credentials.`, type: 'success' });
    } else {
      showToast({ message: `Welcome back, ${updatedUser.fullName}! (${updatedUser.outletName})`, type: 'success' });
    }

    return { success: true };
  };

  // User Google / Email Login Alias
  const loginUserByEmail = (email: string) => {
    return loginUserWithCredentials(email);
  };

  // User Sign Up with comprehensive details (Outlet, Name, Mobile, Gmail, Username, Password, OutletCode)
    const signUpUser = ({
    email,
    fullName,
    phone,
    outletId,
    outletName,
    outletCode,
    district,
    username,
    password,
    avatarUrl,
    autoLogin = false
  }: {
    email: string;
    fullName: string;
    phone: string;
    outletId?: string;
    outletName?: string;
    outletCode?: string;
    district?: string;
    username?: string;
    password?: string;
    avatarUrl?: string;
    autoLogin?: boolean;
  }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0] || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid Gmail / Email address.' };
    }

    if (!fullName || !fullName.trim()) {
      return { success: false, message: 'Please enter your full name.' };
    }

    if (!phone || !phone.trim()) {
      return { success: false, message: 'Please enter your mobile phone number.' };
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    
    // Determine outlet by typed name or ID
    const typedOutletName = (outletName || '').trim();
    let outlet = outlets.find((o) => o.id === outletId || (typedOutletName && o.name.toLowerCase() === typedOutletName.toLowerCase()));
    
    if (!outlet && typedOutletName) {
      // Create dynamic outlet object for user
      const newOutletId = `OUT-${Date.now()}`;
      outlet = {
        id: newOutletId,
        code: outletCode || `OUT-${Math.floor(100 + Math.random() * 900)}`,
        name: typedOutletName,
        district: 'Dhaka',
        division: 'Dhaka',
        zone: 'Operations Division',
        managerName: 'Branch Manager',
        managerPhone: '+880 1700-000000',
        contactEmail: 'outlet@bracbank.com',
        address: `${typedOutletName}, BRAC Bank Agent Banking`,
        isActive: true
      };
      setOutlets((prev) => [outlet!, ...prev]);
      SupabaseService.saveOutlet(outlet);
    } else if (!outlet) {
      outlet = outlets[0];
    }

    if (existingUser) {
      // If user is trying to register under their old revoked station
      if (existingUser.previousOutletIds?.some((prevId) => prevId === outlet!.id)) {
        return {
          success: false,
          message: `Station Access Restricted: You have been transferred from "${outlet!.name}". You cannot register for your former outlet. Please select your assigned station: "${existingUser.outletName}".`
        };
      }

      // If user was transferred and is activating under their new assigned station
      if (existingUser.outletId === outlet!.id || existingUser.previousOutletAccessRevoked) {
        const assignedOutlet = outlets.find((o) => o.id === existingUser.outletId) || outlet!;
        const updatedUser: UserProfile = {
          ...existingUser,
          outletId: assignedOutlet.id,
          outletName: assignedOutlet.name,
          outletCode: assignedOutlet.code,
          username: cleanUsername || existingUser.username,
          password: password || existingUser.password || '1234',
          fullName: fullName.trim() || existingUser.fullName,
          phone: phone.trim() || existingUser.phone,
          avatarUrl: avatarUrl || existingUser.avatarUrl,
          previousOutletAccessRevoked: false,
          lastLoginAt: new Date().toISOString()
        };

        setUsers((prev) => prev.map((u) => (u.id === existingUser.id ? updatedUser : u)));
        SupabaseService.saveUserProfile(updatedUser);

        if (autoLogin) {
          setCurrentUser(updatedUser);
          setCurrentAdmin(null);
          setAuthMode('USER');
          setActiveNavTab('dashboard');
        }

        addAuditEntry('USER_SIGNUP', `Transferred AFO ${updatedUser.fullName} activated new station credentials for ${assignedOutlet.name}`, assignedOutlet.name);
        showToast({ message: `Station credentials activated for ${assignedOutlet.name}!`, type: 'success' });
        return { success: true, user: updatedUser, message: 'Station credentials registered successfully.' };
      }

      return { success: false, message: 'An account with this email address already exists. Please login.' };
    }

    if (cleanUsername && users.some((u) => u.username && u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'This username is already taken. Please choose another username.' };
    }

    const finalOutletCode = outletCode || outlet.code || 'BBL-OUT-101';
    const generatedEmployeeId = `BBL-AFO-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser: UserProfile = {
      id: createUniqueId('USR-AFO'),
      email: cleanEmail,
      username: cleanUsername,
      password: password || '1234',
      fullName: fullName.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            outletId: outlet.id,
      outletName: outlet.name,
      outletCode: finalOutletCode,
      outletLocation: outlet.address,
      district: district || '',
      employeeId: generatedEmployeeId,
      designation: 'Assistant Field Officer (AFO)',
      yearsOfService: 0.1,
      bio: `Assistant Field Officer stationed at ${outlet.name} (${finalOutletCode}). Dedicated to customer KYC validation, card dispatches, and cheque book records.`,
      bloodGroup: 'B+',
      emergencyContact: '+880 1700-000000 (Family)',
      supervisorName: outlet.managerName,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setUsers((prev) => [newUser, ...prev]);
    SupabaseService.saveUserProfile(newUser);

    if (autoLogin) {
      setCurrentUser(newUser);
      setCurrentAdmin(null);
      setAuthMode('USER');
      setActiveNavTab('dashboard');
    }

    addAuditEntry('USER_SIGNUP', `New AFO registered: ${newUser.fullName} (@${newUser.username}, ${newUser.employeeId}) assigned to ${outlet.name}`, outlet.name);
    
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch {
      // safe fallback
    }

    showToast({ message: `Account created successfully! Welcome, ${newUser.fullName}.`, type: 'success' });
    return { success: true, user: newUser };
  };

  // Reset User Credentials (Password / Username / Avatar Recovery)
  const resetUserCredentials = (
    identifier: string,
    data: { newPassword: string; newUsername?: string; avatarUrl?: string } | string
  ) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanDigitsId = cleanId.replace(/[\s-+()]/g, '');

    const userIndex = users.findIndex(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanId) ||
        u.email.toLowerCase() === cleanId ||
        (u.phone && u.phone.replace(/[\s-+()]/g, '') === cleanDigitsId)
    );

    if (userIndex === -1) {
      return {
        success: false,
        message: 'No registered user found matching this Gmail or Phone number.'
      };
    }

    const matchedUser = users[userIndex];
    const newPass = typeof data === 'string' ? data : data.newPassword;
    const requestedUsername = typeof data === 'object' && data.newUsername ? data.newUsername.trim().toLowerCase() : matchedUser.username;
    const requestedAvatar = typeof data === 'object' && data.avatarUrl ? data.avatarUrl : matchedUser.avatarUrl;

    // Check if new username conflicts with another user
    if (requestedUsername && requestedUsername !== matchedUser.username) {
      const usernameExists = users.some((u, idx) => idx !== userIndex && u.username?.toLowerCase() === requestedUsername);
      if (usernameExists) {
        return {
          success: false,
          message: `The username "${requestedUsername}" is already in use by another account. Please choose a different username.`
        };
      }
    }

    const updatedUser: UserProfile = {
      ...matchedUser,
      username: requestedUsername || matchedUser.username,
      password: newPass,
      avatarUrl: requestedAvatar || matchedUser.avatarUrl
    };

    const newUsers = [...users];
    newUsers[userIndex] = updatedUser;
    setUsers(newUsers);

    addAuditEntry('USER_PASSWORD_RESET', `Profile credentials updated for AFO ${matchedUser.fullName} (@${updatedUser.username})`);
    showToast({ message: `Credentials updated successfully for ${matchedUser.fullName}. You can now login.`, type: 'success' });

    return {
      success: true,
      username: updatedUser.username || matchedUser.email,
      message: 'Account updated successfully! Your username is: ' + (updatedUser.username || matchedUser.email)
    };
  };

  // User submits a password reset request directly to Central Admin
  const requestPasswordResetFromAdmin = (data: {
    fullName: string;
    emailOrPhone: string;
    outletId?: string;
    outletName?: string;
    outletCode?: string;
    userNote?: string;
  }) => {
    const cleanEmailOrPhone = (data.emailOrPhone || '').trim();
    const cleanName = (data.fullName || '').trim();

    // Find if user already exists
    const cleanSearch = cleanEmailOrPhone.toLowerCase();
    const cleanDigits = cleanEmailOrPhone.replace(/[\s-+()]/g, '');
    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanSearch ||
        (u.username && u.username.toLowerCase() === cleanSearch) ||
        (u.phone && u.phone.replace(/[\s-+()]/g, '') === cleanDigits)
    );

    const newRequest: PasswordResetRequest = {
      id: createUniqueId('REQ-RST'),
      userId: matchedUser?.id,
      fullName: cleanName || matchedUser?.fullName || 'Station Officer',
      emailOrPhone: cleanEmailOrPhone,
      outletId: data.outletId || matchedUser?.outletId || outlets[0].id,
      outletName: data.outletName || matchedUser?.outletName || outlets[0].name,
      outletCode: data.outletCode || matchedUser?.outletCode || 'BBL-OUT-101',
      userNote: data.userNote || 'User forgot password/username and requested reset from Central Admin.',
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    setPasswordResetRequests((prev) => [newRequest, ...prev]);
    SupabaseService.savePasswordResetRequest(newRequest);

    // Send a station notification to Admin ONLY (will not appear in user notification list)
    sendNotificationNote({
      title: `🔑 Password Reset Request: ${newRequest.fullName}`,
      message: `${newRequest.fullName} (${newRequest.emailOrPhone}, Outlet: ${newRequest.outletName}) submitted a password reset request. Note: ${newRequest.userNote}`,
      type: 'ALERT',
      priority: 'HIGH',
      targetAudience: 'ADMIN_ONLY',
      linkTab: 'users'
    });

    addAuditEntry(
      'PASSWORD_RESET_REQUESTED',
      `Officer ${newRequest.fullName} (${newRequest.emailOrPhone}) submitted a reset request to Admin. Ticket: ${newRequest.id}`,
      newRequest.outletName
    );

    showToast({
      message: `Reset request submitted to Central Admin. Ticket #${newRequest.id}`,
      type: 'success'
    });

    return {
      success: true,
      requestId: newRequest.id,
      message: `Your reset request has been forwarded to the Central Admin desk. Ticket #${newRequest.id}`
    };
  };

  // Admin resolves user password reset request with custom username, PIN & photo
  const resolvePasswordResetRequest = (
    requestId: string,
    updates: {
      username?: string;
      password: string;
      avatarUrl?: string;
      adminNote?: string;
    }
  ) => {
    const requestIndex = passwordResetRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Password reset request not found.' };
    }

    const req = passwordResetRequests[requestIndex];
    const cleanSearch = req.emailOrPhone.toLowerCase();
    const cleanDigits = req.emailOrPhone.replace(/[\s-+()]/g, '');

    const userIndex = users.findIndex(
      (u) =>
        (req.userId && u.id === req.userId) ||
        u.email.toLowerCase() === cleanSearch ||
        (u.username && u.username.toLowerCase() === cleanSearch) ||
        (u.phone && u.phone.replace(/[\s-+()]/g, '') === cleanDigits)
    );

    let updatedTargetUser: UserProfile;

    if (userIndex !== -1) {
      const existing = users[userIndex];
      updatedTargetUser = {
        ...existing,
        username: updates.username?.trim().toLowerCase() || existing.username || existing.email.split('@')[0],
        password: updates.password.trim(),
        avatarUrl: updates.avatarUrl || existing.avatarUrl,
        needsResetLoginNotice: true
      };

      const newUsers = [...users];
      newUsers[userIndex] = updatedTargetUser;
      setUsers(newUsers);
    } else {
      // If user doesn't exist yet, create account for them
      const generatedEmployeeId = `BBL-AFO-${Math.floor(10000 + Math.random() * 90000)}`;
      updatedTargetUser = {
        id: req.userId || createUniqueId('USR-AFO'),
        email: req.emailOrPhone.includes('@') ? req.emailOrPhone.toLowerCase() : `${req.fullName.toLowerCase().replace(/\s+/g, '.')}@bracbank.com`,
        username: updates.username?.trim().toLowerCase() || req.fullName.toLowerCase().replace(/\s+/g, '_'),
        password: updates.password.trim(),
        fullName: req.fullName,
        phone: req.emailOrPhone.includes('@') ? '+880 1700-000000' : req.emailOrPhone,
        avatarUrl: updates.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        outletId: req.outletId || outlets[0].id,
        outletName: req.outletName || outlets[0].name,
        outletCode: req.outletCode || 'BBL-OUT-101',
        outletLocation: outlets[0].address,
        employeeId: generatedEmployeeId,
        designation: 'Assistant Field Officer (AFO)',
        yearsOfService: 0.5,
        bio: `Field Officer at ${req.outletName || outlets[0].name}.`,
        bloodGroup: 'B+',
        emergencyContact: '+880 1700-000000',
        supervisorName: 'Outlet Manager',
        role: 'USER',
        status: 'ACTIVE',
        needsResetLoginNotice: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setUsers((prev) => [updatedTargetUser, ...prev]);
    }
    SupabaseService.saveUserProfile(updatedTargetUser);

    const updatedRequest: PasswordResetRequest = {
      ...req,
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentAdmin ? `${currentAdmin.fullName} (Admin)` : 'Central Administrator',
      assignedUsername: updatedTargetUser.username,
      adminNote: updates.adminNote || `Password reset to 4-digit PIN by admin. Username: ${updatedTargetUser.username}`
    };

    const newReqs = [...passwordResetRequests];
    newReqs[requestIndex] = updatedRequest;
    setPasswordResetRequests(newReqs);
    SupabaseService.savePasswordResetRequest(updatedRequest);

    addAuditEntry(
      'PASSWORD_RESET_RESOLVED',
      `Admin resolved reset request #${requestId} for ${req.fullName}. New username: @${updatedTargetUser.username}, password updated.`,
      req.outletName
    );

    showToast({
      message: `Credentials updated for ${req.fullName}! Username: @${updatedTargetUser.username}`,
      type: 'success'
    });

    return {
      success: true,
      message: `Password reset successfully! User ${req.fullName} can now login with Username: "${updatedTargetUser.username}" and new PIN.`
    };
  };

  // Reject a password reset request
  const rejectPasswordResetRequest = (requestId: string, adminNote?: string) => {
    const requestIndex = passwordResetRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Request not found.' };
    }

    const req = passwordResetRequests[requestIndex];
    const updatedRequest: PasswordResetRequest = {
      ...req,
      status: 'REJECTED',
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentAdmin?.fullName || 'Central Administrator',
      adminNote: adminNote || 'Request rejected by Admin after verification.'
    };

    const newReqs = [...passwordResetRequests];
    newReqs[requestIndex] = updatedRequest;
    setPasswordResetRequests(newReqs);
    SupabaseService.savePasswordResetRequest(updatedRequest);

    addAuditEntry('PASSWORD_RESET_REJECTED', `Admin rejected reset request for ${req.fullName}`);
    showToast({ message: `Reset request for ${req.fullName} rejected.`, type: 'info' });

    return { success: true, message: 'Request marked as rejected.' };
  };

  // Cancel a password reset request
  const cancelPasswordResetRequest = (requestId: string, adminNote?: string) => {
    const requestIndex = passwordResetRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Request not found.' };
    }

    const req = passwordResetRequests[requestIndex];
    const updatedRequest: PasswordResetRequest = {
      ...req,
      status: 'CANCELLED',
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentAdmin?.fullName || 'Central Administrator',
      adminNote: adminNote || 'Request cancelled by Admin.'
    };

    const newReqs = [...passwordResetRequests];
    newReqs[requestIndex] = updatedRequest;
    setPasswordResetRequests(newReqs);
    SupabaseService.savePasswordResetRequest(updatedRequest);

    addAuditEntry('PASSWORD_RESET_CANCELLED', `Admin cancelled reset request for ${req.fullName}`);
    showToast({ message: `Reset request for ${req.fullName} cancelled.`, type: 'info' });

    return { success: true, message: 'Request cancelled successfully.' };
  };

  // Re-open / Retrieve a cancelled reset request
  const reopenPasswordResetRequest = (requestId: string) => {
    const requestIndex = passwordResetRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Request not found.' };
    }

    const req = passwordResetRequests[requestIndex];
    const updatedRequest: PasswordResetRequest = {
      ...req,
      status: 'PENDING',
      resolvedAt: undefined,
      resolvedBy: undefined,
      adminNote: undefined
    };

    const newReqs = [...passwordResetRequests];
    newReqs[requestIndex] = updatedRequest;
    setPasswordResetRequests(newReqs);
    SupabaseService.savePasswordResetRequest(updatedRequest);

    addAuditEntry('PASSWORD_RESET_REOPENED', `Admin retrieved and re-opened reset request for ${req.fullName}`);
    showToast({ message: `Reset request for ${req.fullName} retrieved and moved back to Pending!`, type: 'success' });

    return { success: true, message: 'Request retrieved successfully.', request: updatedRequest };
  };

  // Admin updates ANY user profile details (including avatar, password, username, outletCode)
  const adminUpdateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User account not found.' };
    }

    const targetUser = users[userIndex];
    const updatedUser: UserProfile = {
      ...targetUser,
      ...updates
    };

    const newUsers = [...users];
    newUsers[userIndex] = updatedUser;
    setUsers(newUsers);
    SupabaseService.saveUserProfile(updatedUser);

    // If currently logged in as this user, update session
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    addAuditEntry(
      'ADMIN_USER_PROFILE_UPDATED',
      `Admin updated profile & photo for ${targetUser.fullName} (@${updatedUser.username || targetUser.username})`,
      updatedUser.outletName
    );

    showToast({ message: `Profile & photo updated for ${targetUser.fullName}!`, type: 'success' });
    return { success: true, message: 'User profile updated successfully.' };
  };

  // Reset Admin Credentials (Password / Username / Avatar)
  const resetAdminCredentials = (
    identifier: string,
    data: { newPassword: string; newUsername?: string; avatarUrl?: string } | string
  ) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanDigitsId = cleanId.replace(/[\s-+()]/g, '');

    const adminIndex = admins.findIndex(
      (a) =>
        a.username.toLowerCase() === cleanId ||
        a.email.toLowerCase() === cleanId ||
        (a.phone && a.phone.replace(/[\s-+()]/g, '') === cleanDigitsId)
    );

    if (adminIndex === -1 && cleanId !== 'admin' && !cleanId.includes('admin')) {
      return {
        success: false,
        message: 'No admin account found matching this Gmail or Phone number.'
      };
    }

    const defaultMasterAdmin: AdminAccount = {
      id: 'ADM-CENTRAL-001',
      email: 'central.admin@bracbank.com',
      username: 'admin',
      pinHash: '2525',
      password: '2525',
      fullName: 'Master Administrator',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isMainAdmin: true,
      permissions: ['VIEW_ALL', 'MANAGE_USERS', 'DELEGATE_ADMINS', 'EXPORT_DATA', 'MODIFY_OUTLETS', 'AUDIT_LOGS', 'SYSTEM_CONFIG'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const targetIndex = adminIndex !== -1 ? adminIndex : 0;
    const targetAdmin = admins[targetIndex] || defaultMasterAdmin;
    const newPass = typeof data === 'string' ? data : data.newPassword;
    const requestedUsername = typeof data === 'object' && data.newUsername ? data.newUsername.trim().toLowerCase() : targetAdmin.username;
    const requestedAvatar = typeof data === 'object' && data.avatarUrl ? data.avatarUrl : targetAdmin.avatarUrl;

    const updatedAdmin: AdminAccount = {
      ...targetAdmin,
      username: requestedUsername || targetAdmin.username,
      password: newPass,
      pinHash: newPass,
      avatarUrl: requestedAvatar || targetAdmin.avatarUrl
    };

    const newAdmins = [...admins];
    if (adminIndex !== -1) {
      newAdmins[targetIndex] = updatedAdmin;
    } else {
      newAdmins.push(updatedAdmin);
    }
    setAdmins(newAdmins);
    SupabaseService.saveAdminAccount(updatedAdmin);

    addAuditEntry('ADMIN_PASSWORD_RESET', `Admin credentials updated for ${targetAdmin.fullName} (@${updatedAdmin.username})`);
    showToast({ message: `Admin credentials updated successfully. Username: ${updatedAdmin.username}`, type: 'success' });

    return {
      success: true,
      username: updatedAdmin.username,
      message: `Admin credentials updated successfully! Username: ${updatedAdmin.username}`
    };
  };

  // Direct 1-Click Admin Login (Protected)
  const loginAdminDirectly = () => {
    const defaultMasterAdmin: AdminAccount = {
      id: 'ADM-CENTRAL-001',
      email: 'central.admin@bracbank.com',
      username: 'admin',
      pinHash: '2525',
      password: '2525',
      fullName: 'Master Administrator',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isMainAdmin: true,
      permissions: ['VIEW_ALL', 'MANAGE_USERS', 'DELEGATE_ADMINS', 'EXPORT_DATA', 'MODIFY_OUTLETS', 'AUDIT_LOGS', 'SYSTEM_CONFIG'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const admin = admins[0] || defaultMasterAdmin;
    const updatedAdmin = {
      ...admin,
      lastLoginAt: new Date().toISOString()
    };

    SupabaseService.saveAdminAccount(updatedAdmin);

    setAdmins((prev) => {
      const exists = prev.some((a) => a.id === updatedAdmin.id);
      return exists ? prev.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a)) : [updatedAdmin, ...prev];
    });
    setCurrentAdmin(updatedAdmin);
    setCurrentUser(null);
    setAuthMode('ADMIN');
    setActiveNavTab('dashboard');
    addAuditEntry('ADMIN_LOGIN_SUCCESS', `Admin ${admin.fullName} logged into Master Control Center`);
    showToast({ message: `Authenticated as ${admin.fullName} (Master Administrator)`, type: 'success' });
    return { success: true };
  };

  // Admin PIN / Password Login (Strict: Username: admin, Password: 2525)
    const loginAdminByPin = async (username?: string, pin?: string) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPin = (pin || '').trim();

    // Find the admin record by username (password is now verified by Supabase Auth below)
    const matchingAdmin = admins.find((a) => a.username.toLowerCase() === cleanUser);

    if (!matchingAdmin) {
      addAuditEntry('ADMIN_AUTH_FAILED', `Failed admin login attempt with user: "${username}"`);
      return { 
        success: false, 
        message: 'Invalid admin credentials. Access denied.' 
      };
    }

    // Real security check: verify the password against Supabase Auth (not local plain-text data)
    const authResult = await SupabaseService.signInWithAuth(matchingAdmin.email, cleanPin);
    if (!authResult.success) {
      addAuditEntry('ADMIN_AUTH_FAILED', `Failed admin login attempt with user: "${username}"`);
      return {
        success: false,
        message: 'Invalid admin credentials. Access denied.'
      };
    }

    const admin = matchingAdmin;

    if (admin.status === 'SUSPENDED') {
      return { success: false, message: 'This Admin access has been revoked or suspended.' };
    }

    const updatedAdmin = {
      ...admin,
      lastLoginAt: new Date().toISOString()
    };

    SupabaseService.saveAdminAccount(updatedAdmin);

    setAdmins((prev) => {
      const exists = prev.some((a) => a.id === updatedAdmin.id);
      return exists ? prev.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a)) : [updatedAdmin, ...prev];
    });
    setCurrentAdmin(updatedAdmin);
    setCurrentUser(null);
    setAuthMode('ADMIN');
    setActiveNavTab('dashboard');
    addAuditEntry('ADMIN_LOGIN_SUCCESS', `Admin ${admin.fullName} logged into Master Control Center`);
    showToast({ message: `Authenticated as ${admin.fullName} (Master Admin)`, type: 'success' });
    return { success: true };
  };

  // First time Admin setup
  const setupFirstTimeAdmin = ({
    email,
    fullName,
    username,
    pin
  }: {
    email: string;
    fullName: string;
    username: string;
    pin: string;
  }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (admins.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Username is already taken. Choose another username.' };
    }

    const newAdmin: AdminAccount = {
      id: createUniqueId('ADM'),
      email: cleanEmail,
      username: cleanUsername,
      pinHash: pin,
      fullName: fullName.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isMainAdmin: admins.length === 0,
      permissions: ['VIEW_ALL', 'MANAGE_USERS', 'DELEGATE_ADMINS', 'EXPORT_DATA', 'MODIFY_OUTLETS', 'AUDIT_LOGS', 'SYSTEM_CONFIG'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setAdmins((prev) => [newAdmin, ...prev]);
    setCurrentAdmin(newAdmin);
    setCurrentUser(null);
    setAuthMode('ADMIN');
    setActiveNavTab('dashboard');
    addAuditEntry('ADMIN_SETUP', `New Admin configured: ${newAdmin.fullName} (@${newAdmin.username})`);
    showToast({ message: `Admin security setup complete! Welcome ${newAdmin.fullName}`, type: 'success' });
    return { success: true };
  };

    const logout = () => {
          try {
      if (currentUser) {
        sessionStorage.removeItem('brac_afo_active_user_id');
      }
    } catch {
      // Ignore sessionStorage errors.
    }
      
    if (currentUser) {
      addAuditEntry('USER_LOGOUT', `AFO ${currentUser.fullName} logged out.`);
      const offlineUser = { ...currentUser, isOnline: false };
      setUsers((prev) => prev.map((u) => (u.id === offlineUser.id ? offlineUser : u)));
      SupabaseService.saveUserProfile(offlineUser);
    } else if (currentAdmin) {
      addAuditEntry('ADMIN_LOGOUT', `Admin ${currentAdmin.fullName} logged out.`);
    }
    setCurrentUser(null);
    setCurrentAdmin(null);
    setAuthMode('NONE');
    setActiveNavTab('dashboard');
    showToast({ message: 'Logged out securely.', type: 'info' });
  };

  // User Profile Update
  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...updates
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    SupabaseService.saveUserProfile(updated);
    addAuditEntry('PROFILE_UPDATED', `AFO ${currentUser.fullName} updated profile personal information`, currentUser.outletName);
    showToast({ message: 'Banking profile updated successfully!', type: 'success' });
  };

  // Create Submission
  const createNewSubmission = (data: any): WorkSubmission => {
    if (!currentUser) throw new Error('Must be logged in as AFO to submit work data');

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newSubmission: WorkSubmission = {
      ...data,
      id: createUniqueId(`SUB-${new Date().getFullYear()}`),
      trackingNo: `BBL-TRK-${randomSuffix}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      employeeId: currentUser.employeeId,
      outletId: currentUser.outletId,
      outletName: currentUser.outletName,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processedBy: currentUser.fullName,
      deliveryAcknowledgmentSigned: Boolean(data.customerSignatureCaptured ?? true),
      priorityLevel: 'NORMAL'
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    SupabaseService.saveSubmission(newSubmission);
    addAuditEntry(
      'WORK_DATA_SUBMITTED',
      `Registered ${newSubmission.serviceCategory} for customer ${newSubmission.customerName} (Track: ${newSubmission.trackingNo})`,
      currentUser.outletName
    );

    try {
      confetti({ particleCount: 50, spread: 45, origin: { y: 0.8 } });
    } catch {
      // safe fallback
    }

    showToast({ message: `Entry recorded successfully! Tracking No: ${newSubmission.trackingNo}`, type: 'success' });
    return newSubmission;
  };

  // Update Submission Status
  const updateSubmissionStatus = (id: string, status: SubmissionStatus, notes?: string) => {
    const actorName = currentAdmin?.fullName || currentUser?.fullName || 'AFO';
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const updated = {
            ...sub,
            status,
            notes: notes ? `${sub.notes}\n[${new Date().toLocaleDateString()}] ${notes}` : sub.notes,
            updatedAt: new Date().toISOString(),
            processedBy: actorName
          };
          addAuditEntry(
            'SUBMISSION_STATUS_CHANGE',
            `Status of ${sub.trackingNo} changed to ${status} by ${actorName}`,
            sub.outletName
          );
          SupabaseService.saveSubmission(updated);
          return updated;
        }
        return sub;
      })
    );
    showToast({ message: `Tracking status updated to ${status.replace(/_/g, ' ')}`, type: 'success' });
  };

  // Admin Management Actions
  const updateUserStatus = (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addAuditEntry('USER_STATUS_CHANGE', `Admin changed ${u.fullName} status to ${status}`);
          const updated = { ...u, status };
          SupabaseService.saveUserProfile(updated);
          return updated;
        }
        return u;
      })
    );
    showToast({ message: `User account status updated to ${status}`, type: 'info' });
  };

  const updateUserOutletAssignment = (userId: string, outletId: string) => {
    const outlet = outlets.find((o) => o.id === outletId);
    if (!outlet) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addAuditEntry('OUTLET_REASSIGNED', `AFO ${u.fullName} transferred to outlet: ${outlet.name}`);
          const updated = {
            ...u,
            outletId: outlet.id,
            outletName: outlet.name,
            outletLocation: outlet.address,
            supervisorName: outlet.managerName
          };
          SupabaseService.saveUserProfile(updated);
          return updated;
        }
        return u;
      })
    );
    showToast({ message: `Outlet reassigned to ${outlet.name}`, type: 'success' });
  };

  // Delegate Admin Access
  const delegateAdminAccess = ({
    email,
    fullName,
    username,
    pin,
    permissions
  }: {
    email: string;
    fullName: string;
    username: string;
    pin: string;
    permissions: AdminPermission[];
  }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (admins.some((a) => a.username.toLowerCase() === cleanUsername || a.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An admin with this email or username already exists.' };
    }

    const newDelegatedAdmin: AdminAccount = {
      id: createUniqueId('ADM-DEL'),
      email: cleanEmail,
      username: cleanUsername,
      pinHash: pin,
      fullName: fullName.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isMainAdmin: false,
      delegatedBy: currentAdmin?.email || 'admin@bracbank.com',
      delegatedAt: new Date().toISOString(),
      permissions,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setAdmins((prev) => [newDelegatedAdmin, ...prev]);
    addAuditEntry(
      'ADMIN_DELEGATION_GRANTED',
      `Main Admin delegated ${permissions.length} permissions to ${newDelegatedAdmin.email} (@${newDelegatedAdmin.username})`
    );
    showToast({ message: `Admin delegation successfully granted to ${fullName}!`, type: 'success' });
    return { success: true };
  };

  const revokeAdminDelegation = (adminId: string) => {
    const target = admins.find((a) => a.id === adminId);
    if (!target) return;
    if (target.isMainAdmin) {
      showToast({ message: 'Cannot revoke Primary Master Administrator.', type: 'error' });
      return;
    }

    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    addAuditEntry('ADMIN_DELEGATION_REVOKED', `Revoked delegated admin credentials for ${target.fullName} (@${target.username})`);
    showToast({ message: `Admin delegation revoked for ${target.fullName}.`, type: 'info' });
  };

  const updateAdminProfile = (updates: Partial<AdminAccount>) => {
        setCurrentAdmin((prev) => {
      if (!prev) return prev;
      const updatedAdmin = { ...prev, ...updates };
      SupabaseService.saveAdminAccount(updatedAdmin);
      return updatedAdmin;
    });

    setAdmins((prev) =>
      prev.map((adm) => {
        if (adm.id === currentAdmin?.id || (adm.isMainAdmin && currentAdmin?.isMainAdmin)) {
          return { ...adm, ...updates };
        }
        return adm;
      })
    );

    // If currentUser exists, sync avatarUrl as well so header updates immediately
    if (updates.avatarUrl) {
      setCurrentUser((prev) => (prev ? { ...prev, avatarUrl: updates.avatarUrl! } : prev));
    }

    addAuditEntry(
      'ADMIN_PROFILE_UPDATED',
      `Master Administrator updated profile details (${updates.fullName || currentAdmin?.fullName || 'Admin'})`
    );
    showToast({ message: 'Admin profile updated successfully!', type: 'success' });
  };

  const addOutlet = (outletData: Omit<BRACBankOutlet, 'id'>) => {
    const newOutlet: BRACBankOutlet = {
      ...outletData,
      id: createUniqueId('OUT-CUSTOM')
    };
    setOutlets((prev) => [...prev, newOutlet]);
    SupabaseService.saveOutlet(newOutlet);
    addAuditEntry('OUTLET_CREATED', `Added new BRAC Bank outlet: ${newOutlet.name} (${newOutlet.code})`);
    showToast({ message: `Outlet "${newOutlet.name}" registered successfully!`, type: 'success' });
  };

  const updateOutlet = (outletId: string, updates: Partial<BRACBankOutlet>) => {
    const outletIndex = outlets.findIndex((o) => o.id === outletId);
    if (outletIndex === -1) {
      return { success: false, message: 'Outlet not found.' };
    }

    const oldOutlet = outlets[outletIndex];
    const updatedOutlet: BRACBankOutlet = {
      ...oldOutlet,
      ...updates
    };

    const newOutlets = [...outlets];
    newOutlets[outletIndex] = updatedOutlet;
    setOutlets(newOutlets);
    SupabaseService.saveOutlet(updatedOutlet);

    // Also update any users or submissions stationed at this outlet if name/code/location changed
    if (updates.name || updates.address || updates.code || updates.managerName) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.outletId !== outletId) return u;
          const updatedUser = {
            ...u,
            outletName: updates.name || u.outletName,
            outletCode: updates.code || u.outletCode,
            outletLocation: updates.address || u.outletLocation,
            supervisorName: updates.managerName || u.supervisorName
          };
          SupabaseService.saveUserProfile(updatedUser);
          return updatedUser;
        })
      );
    }

    addAuditEntry(
      'OUTLET_UPDATED',
      `Admin updated outlet profile: ${updatedOutlet.name} (${updatedOutlet.code})`
    );
    showToast({ message: `Outlet "${updatedOutlet.name}" updated successfully!`, type: 'success' });
    return { success: true, message: 'Outlet details updated successfully.' };
  };

  const suspendOutlet = (outletId: string, reason?: string) => {
    const target = outlets.find((o) => o.id === outletId);
    if (!target) return;

    const suspendReason = reason || 'Temporarily suspended by Central Administrator';
    const suspendedOutlet: BRACBankOutlet = {
      ...target,
      isActive: false,
      isSuspended: true,
      status: 'SUSPENDED',
      suspendedAt: new Date().toISOString(),
      suspendedReason: suspendReason
    };
    setOutlets((prev) =>
      prev.map((o) => (o.id === outletId ? suspendedOutlet : o))
    );
    SupabaseService.saveOutlet(suspendedOutlet);

    addAuditEntry(
      'OUTLET_SUSPENDED',
      `Admin suspended branch outlet: ${target.name} (${target.code}). Reason: ${suspendReason}`,
      target.name
    );
    showToast({ message: `Outlet "${target.name}" suspended. Operational node is now inactive.`, type: 'info' });
  };

  const reactivateOutlet = (outletId: string) => {
    const target = outlets.find((o) => o.id === outletId);
    if (!target) return;

    const reactivatedOutlet: BRACBankOutlet = {
      ...target,
      isActive: true,
      isSuspended: false,
      status: 'ACTIVE',
      suspendedAt: undefined,
      suspendedReason: undefined
    };
    setOutlets((prev) =>
      prev.map((o) => (o.id === outletId ? reactivatedOutlet : o))
    );
    SupabaseService.saveOutlet(reactivatedOutlet);

    addAuditEntry(
      'OUTLET_REACTIVATED',
      `Admin reactivated branch outlet: ${target.name} (${target.code})`,
      target.name
    );
    showToast({ message: `Outlet "${target.name}" reactivated! Operational node is online.`, type: 'success' });
  };

  const deleteOutlet = (outletId: string, purgeData: boolean = true) => {
    const target = outlets.find((o) => o.id === outletId);
    if (!target) return;

    const deletedRecord: BRACBankOutlet = {
      ...target,
      isActive: false,
      isSuspended: false,
      isDeleted: true,
      status: 'INACTIVE',
      deletedAt: new Date().toISOString(),
      deletedReason: 'Permanently removed from active stations by Administrator'
    };

    // Keep in deletedOutlets register for counting & audit/recovery
    setDeletedOutlets((prev) => [deletedRecord, ...prev.filter((d) => d.id !== outletId)]);

    // Remove from active outlets array
    setOutlets((prev) => prev.filter((o) => o.id !== outletId));
    SupabaseService.deleteOutlet(outletId);

    if (purgeData) {
      // Remove or unlink submissions for this deleted outlet
      setSubmissions((prev) => prev.filter((s) => s.outletId !== outletId));
      setChequeCardEntries((prev) => prev.filter((c) => c.outletId !== outletId));
      setLoanRecords((prev) => prev.filter((l) => l.outletId !== outletId));
    }

    // Update any users stationed at this deleted outlet
    const fallbackOutlet = outlets.find((o) => o.id !== outletId);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.outletId === outletId) {
          const updated = {
            ...u,
            outletId: fallbackOutlet?.id || 'OUT-UNASSIGNED',
            outletName: fallbackOutlet ? `${fallbackOutlet.name} (Station Reassigned)` : 'Unassigned (Station Deleted)',
            outletCode: fallbackOutlet?.code || 'UNASSIGNED',
            outletLocation: fallbackOutlet?.address || 'Pending Central Reassignment'
          };
          SupabaseService.saveUserProfile(updated);
          return updated;
        }
        return u;
      })
    );

    addAuditEntry('OUTLET_DELETED', `Admin deleted outlet: ${target.name} (${target.code})`, target.name);
    showToast({ message: `Outlet "${target.name}" deleted and purged from active stations.`, type: 'info' });
  };

  const restoreDeletedOutlet = (outletId: string) => {
    const target = deletedOutlets.find((d) => d.id === outletId);
    if (!target) return;

    const restoredOutlet: BRACBankOutlet = {
      ...target,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
      status: 'ACTIVE',
      deletedAt: undefined,
      deletedReason: undefined
    };

    setDeletedOutlets((prev) => prev.filter((d) => d.id !== outletId));
    setOutlets((prev) => [restoredOutlet, ...prev]);
    SupabaseService.saveOutlet(restoredOutlet);

    addAuditEntry('OUTLET_RESTORED', `Admin restored previously deleted outlet: ${target.name} (${target.code})`, target.name);
    showToast({ message: `Outlet "${target.name}" restored to active directory!`, type: 'success' });
  };

  const permanentlyPurgeDeletedOutlet = (outletId: string) => {
    setDeletedOutlets((prev) => prev.filter((d) => d.id !== outletId));
    showToast({ message: 'Deleted outlet record purged from archive.', type: 'info' });
  };

  const transferAfoToOutlet = (
    userId: string,
    targetOutletId: string,
    options?: { revokePreviousOutletAccess?: boolean; adminNote?: string }
  ) => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: 'User officer not found.' };
    }

    const targetOutlet = outlets.find((o) => o.id === targetOutletId);
    if (!targetOutlet) {
      return { success: false, message: 'Target outlet station not found.' };
    }

    const previousOutletId = user.outletId;
    const previousOutletName = user.outletName;
    const previousOutletCode = user.outletCode;

    const shouldRevoke = options?.revokePreviousOutletAccess ?? true;
    const adminNote = options?.adminNote?.trim() || 'Administrative station transfer & operational reassignment.';

    const transferRecord: AfoTransferRecord = {
      id: createUniqueId('TRF'),
      userId: user.id,
      userName: user.fullName,
      userEmployeeId: user.employeeId,
      userAvatarUrl: user.avatarUrl,
      userEmail: user.email,
      userPhone: user.phone,
      fromOutletId: previousOutletId,
      fromOutletName: previousOutletName,
      fromOutletCode: previousOutletCode,
      fromOutletAddress: user.outletLocation || '',
      toOutletId: targetOutlet.id,
      toOutletName: targetOutlet.name,
      toOutletCode: targetOutlet.code,
      toOutletAddress: targetOutlet.address,
      transferredAt: new Date().toISOString(),
      transferredBy: currentAdmin?.fullName || 'Central Administrator',
      revokePreviousOutletAccess: shouldRevoke,
      adminNote
    };

    setAfoTransfers((prev) => [transferRecord, ...prev]);

    const oldPrevList = user.previousOutletIds || [];
    const updatedPrevList = oldPrevList.includes(previousOutletId) ? oldPrevList : [...oldPrevList, previousOutletId];

    const updatedUser: UserProfile = {
      ...user,
      outletId: targetOutlet.id,
      outletName: targetOutlet.name,
      outletCode: targetOutlet.code,
      outletLocation: targetOutlet.address,
      supervisorName: targetOutlet.managerName,
      previousOutletIds: updatedPrevList,
      previousOutletAccessRevoked: shouldRevoke,
      lastTransferDate: new Date().toISOString(),
      transferHistory: [transferRecord, ...(user.transferHistory || [])]
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
        SupabaseService.saveUserProfile(updatedUser);

    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    // Send direct notification to AFO
    sendNotificationNote({
      title: '📋 Official Station Transfer Order',
      message: `You have been officially transferred to ${targetOutlet.name} (${targetOutlet.code}). All station workflows, delivery logs, and KYC registers are now connected to your new station. ${shouldRevoke ? 'Prior station credentials and access tokens have been securely revoked by Central Administration.' : ''}`,
      type: 'ADMIN_NOTE',
      priority: 'HIGH',
      targetUserId: user.id,
      targetOutletId: targetOutlet.id,
      targetAudience: 'USER_ONLY',
      linkTab: 'dashboard'
    });

    // Also send station mail memo
    sendMailMessage({
      recipientUserId: user.id,
      recipientOutletId: targetOutlet.id,
      subject: `OFFICIAL DIRECTIVE: Station Reassignment to ${targetOutlet.name}`,
      content: `Assalamu Alaikum ${user.fullName},\n\nThis is an official administrative directive from BRAC Bank Operations HQ. Your field deployment station has been transferred from "${previousOutletName}" to "${targetOutlet.name}" (${targetOutlet.code}).\n\nReporting Supervisor: ${targetOutlet.managerName}\nStation Address: ${targetOutlet.address}\n\nSecurity Directive: ${shouldRevoke ? 'Access to previous station ID has been permanently locked and revoked. You may continue to login using your existing credentials, with all permissions bound strictly to your new station.' : 'Station access updated.'}\n\nAdmin Remarks: ${adminNote}\n\nBest regards,\nHead of Branch Operations & Central Admin`,
      priority: 'URGENT',
      category: 'DIRECT_MEMO'
    });

    addAuditEntry(
      'AFO_STATION_TRANSFERRED',
      `Admin transferred AFO ${user.fullName} (${user.employeeId}) from ${previousOutletName} to ${targetOutlet.name}. Prior station access revoked: ${shouldRevoke ? 'YES' : 'NO'}.`,
      targetOutlet.name
    );

    showToast({
      message: `AFO ${user.fullName} transferred to ${targetOutlet.name}! ${shouldRevoke ? 'Previous outlet access restricted.' : ''}`,
      type: 'success'
    });

    return {
      success: true,
      message: `AFO officer ${user.fullName} transferred to ${targetOutlet.name} successfully.`
    };
  };

  const adminCreateAFO = (data: {
    fullName: string;
    email: string;
    phone: string;
    outletId: string;
    username?: string;
    password?: string;
    designation?: string;
    employeeId?: string;
    avatarUrl?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    bio?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = (data.username || data.fullName.toLowerCase().replace(/\s+/g, '_')).trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail || (u.username && u.username.toLowerCase() === cleanUsername))) {
      return { success: false, message: 'An officer with this email or username already exists.' };
    }

    const assignedOutlet = outlets.find((o) => o.id === data.outletId) || outlets[0];
    const generatedEmpId = data.employeeId || `EMP-BBL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOfficer: UserProfile = {
      id: createUniqueId('USR-AFO'),
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      username: cleanUsername,
      password: data.password?.trim() || '1234',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      outletId: assignedOutlet.id,
      outletName: assignedOutlet.name,
      outletCode: assignedOutlet.code,
      outletLocation: assignedOutlet.address,
      employeeId: generatedEmpId,
      designation: data.designation || 'Assistant Field Officer (AFO)',
      yearsOfService: 1,
      bio: data.bio || `Field Officer deployed at ${assignedOutlet.name}.`,
      bloodGroup: data.bloodGroup || 'B+',
      emergencyContact: data.emergencyContact || data.phone,
      supervisorName: assignedOutlet.managerName,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setUsers((prev) => [newOfficer, ...prev]);
    SupabaseService.saveUserProfile(newOfficer);
    addAuditEntry(
      'AFO_CREATED_BY_ADMIN',
      `Admin enrolled new officer: ${newOfficer.fullName} (${newOfficer.employeeId}) at ${assignedOutlet.name}`,
      assignedOutlet.name
    );
    showToast({ message: `AFO Officer ${newOfficer.fullName} registered successfully!`, type: 'success' });
    return { success: true, message: 'Officer enrolled successfully.', user: newOfficer };
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    SupabaseService.deleteUserProfile(userId);
    addAuditEntry('USER_DELETED', `Admin deleted AFO account: ${target.fullName} (${target.employeeId})`);
    showToast({ message: `AFO account "${target.fullName}" removed.`, type: 'info' });
  };

  const toggleOutletStatus = (outletId: string) => {
    setOutlets((prev) =>
      prev.map((o) => {
        if (o.id === outletId) {
          const updated = { ...o, isActive: !o.isActive };
          addAuditEntry('OUTLET_STATUS_TOGGLE', `Outlet ${o.name} status set to ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}`);
          return updated;
        }
        return o;
      })
    );
  };

  const updateGovernanceSettings = (updates: Partial<PortalGovernanceSettings>) => {
    setGovernanceSettings((prev) => {
      const next = { ...prev, ...updates };
      addAuditEntry('GOVERNANCE_SETTINGS_UPDATED', `Portal governance policies modified`);
      return next;
    });
    showToast({ message: 'Portal governance settings saved.', type: 'success' });
  };

  const updateAdminProfileAndCredentials = (updates: {
    username?: string;
    password?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  }) => {
    if (!currentAdmin) return { success: false, message: 'No active admin session.' };

    const cleanUsername = updates.username?.trim().toLowerCase();
    const cleanEmail = updates.email?.trim().toLowerCase();

    // Check duplicate username/email in other admins
    if (cleanUsername && admins.some((a) => a.id !== currentAdmin.id && a.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Username is already in use by another admin.' };
    }
    if (cleanEmail && admins.some((a) => a.id !== currentAdmin.id && a.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email is already in use by another admin.' };
    }

    const updatedAdmin: AdminAccount = {
      ...currentAdmin,
      username: cleanUsername || currentAdmin.username,
      password: updates.password?.trim() || currentAdmin.password,
      pinHash: updates.password?.trim() || currentAdmin.pinHash,
      fullName: updates.fullName?.trim() || currentAdmin.fullName,
      email: cleanEmail || currentAdmin.email,
      phone: updates.phone?.trim() || currentAdmin.phone,
      avatarUrl: updates.avatarUrl || currentAdmin.avatarUrl
    };

    setAdmins((prev) => prev.map((a) => (a.id === currentAdmin.id ? updatedAdmin : a)));
    setCurrentAdmin(updatedAdmin);
    addAuditEntry('ADMIN_PROFILE_UPDATED', `Admin credentials/profile updated for ${updatedAdmin.fullName} (@${updatedAdmin.username})`);
    showToast({ message: 'Admin profile & credentials updated successfully!', type: 'success' });
    return { success: true };
  };

  const updateUserPreferences = (updates: Partial<UserPreferences>) => {
    // If theme is changed, apply to documentElement immediately for instant response without frame lag
    if (updates.theme) {
      if (updates.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setUserPreferences((prev) => ({ ...prev, ...updates }));
    if (!updates.theme) {
      showToast({ message: 'Preferences saved successfully.', type: 'info' });
    }
  };

  // Mail & Messages logic
    const sendMailMessage = (msg: {
    recipientUserId?: string;
    recipientOutletId?: string;
    subject: string;
    content: string;
    priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
    category?: 'CIRCULAR' | 'OPERATION_UPDATE' | 'AUDIT_NOTICE' | 'DIRECT_MEMO';
  }) => {
    const senderName = currentAdmin?.fullName || currentUser?.fullName || 'Central Operations';
    const senderEmail = currentAdmin?.email || currentUser?.email || 'admin@bracbank.com';
    const senderRole = currentAdmin ? (currentAdmin.isMainAdmin ? 'ADMIN' : 'HEAD_OFFICE') : 'USER';
    
    const newMail: StationMailMessage = {
      id: createUniqueId('MAIL'),
      senderName,
      senderRole,
      senderEmail,
      recipientUserId: msg.recipientUserId || 'ALL',
      recipientOutletId: msg.recipientOutletId || 'ALL',
      subject: msg.subject,
      content: msg.content,
      priority: msg.priority || 'NORMAL',
      category: msg.category || 'DIRECT_MEMO',
      isRead: false,
      timestamp: new Date().toISOString()
    };

    setMailMessages((prev) => [newMail, ...prev]);
    SupabaseService.saveMailMessage(newMail);
    addAuditEntry('MAIL_DISPATCHED', `Sent message: "${msg.subject}"`);
    showToast({ message: 'Mail / Memo dispatched successfully!', type: 'success' });
  };

  const markMailAsRead = (id: string) => {
    setMailMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, isRead: true } : m));
      const target = updated.find((m) => m.id === id);
      if (target) SupabaseService.saveMailMessage(target);
      return updated;
    });
  };

  const markAllMailAsRead = () => {
    setMailMessages((prev) => {
      const updated = prev.map((m) => ({ ...m, isRead: true }));
      updated.forEach((m, idx) => {
        if (!prev[idx].isRead) SupabaseService.saveMailMessage(m);
      });
      return updated;
    });
    showToast({ message: 'All messages marked as read.', type: 'info' });
  };

  const deleteMailMessage = (id: string) => {
    setMailMessages((prev) => prev.filter((m) => m.id !== id));
    SupabaseService.deleteMailMessage(id);
    showToast({ message: 'Message removed from inbox.', type: 'info' });
  };

  // Notifications logic
  const sendNotificationNote = (note: {
    title: string;
    message: string;
    type?: 'ADMIN_NOTE' | 'APPROVAL' | 'SYNC' | 'ALERT' | 'INFO';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    targetUserId?: string;
    targetOutletId?: string;
    targetAudience?: 'ADMIN_ONLY' | 'USER_ONLY' | 'ALL';
    linkTab?: string;
  }) => {
    const newNotification: StationNotification = {
      id: createUniqueId('NOTIF'),
      title: note.title,
      message: note.message,
      type: note.type || 'ADMIN_NOTE',
      priority: note.priority || 'HIGH',
      targetUserId: note.targetUserId || 'ALL',
      targetOutletId: note.targetOutletId || 'ALL',
      targetAudience: note.targetAudience || 'ALL',
      isRead: false,
      timestamp: new Date().toISOString(),
      linkTab: note.linkTab || 'dashboard'
    };

    setNotifications((prev) => [newNotification, ...prev]);
    SupabaseService.saveNotification(newNotification);
    addAuditEntry('NOTIFICATION_BROADCAST', `Admin Note broadcasted: "${note.title}"`);
    showToast({ message: 'Broadcast note sent to station notifications!', type: 'success' });
  };

    const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const target = updated.find((n) => n.id === id);
      if (target) SupabaseService.saveNotification(target);
      return updated;
    });
  };

    const markAllNotificationsAsRead = () => {
    if (authMode === 'USER' && currentUser) {
      setNotifications((prev) => {
        const updated = prev.map((n) => {
          if (n.targetAudience === 'ADMIN_ONLY') return n;
          if (n.targetUserId && n.targetUserId !== 'ALL') {
            const isUserMatch =
              n.targetUserId === currentUser.id ||
              (currentUser.username && n.targetUserId.toLowerCase() === currentUser.username.toLowerCase()) ||
              (currentUser.email && n.targetUserId.toLowerCase() === currentUser.email.toLowerCase());
            if (isUserMatch) return { ...n, isRead: true };
            return n;
          }
          if (n.targetOutletId && n.targetOutletId !== 'ALL') {
            if (n.targetOutletId === currentUser.outletId) return { ...n, isRead: true };
            return n;
          }
          return { ...n, isRead: true };
        });
        updated.forEach((n, idx) => {
          if (n.isRead && !prev[idx].isRead) SupabaseService.saveNotification(n);
        });
        return updated;
      });
    } else {
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, isRead: true }));
        updated.forEach((n, idx) => {
          if (!prev[idx].isRead) SupabaseService.saveNotification(n);
        });
        return updated;
      });
    }
    showToast({ message: 'All notifications marked as read.', type: 'info' });
  };

    const clearNotifications = () => {
    if (authMode === 'USER' && currentUser) {
      setNotifications((prev) => {
        const remaining = prev.filter((n) => {
          if (n.targetAudience === 'ADMIN_ONLY') return true;
          if (n.targetUserId && n.targetUserId !== 'ALL') {
            const isUserMatch =
              n.targetUserId === currentUser.id ||
              (currentUser.username && n.targetUserId.toLowerCase() === currentUser.username.toLowerCase()) ||
              (currentUser.email && n.targetUserId.toLowerCase() === currentUser.email.toLowerCase());
            return !isUserMatch;
          }
          if (n.targetOutletId && n.targetOutletId !== 'ALL') {
            return n.targetOutletId !== currentUser.outletId;
          }
          return false;
        });
        const removedIds = new Set(remaining.map((n) => n.id));
        prev.forEach((n) => {
          if (!removedIds.has(n.id)) SupabaseService.deleteNotification(n.id);
        });
        return remaining;
      });
    } else {
      setNotifications((prev) => {
        prev.forEach((n) => SupabaseService.deleteNotification(n.id));
        return [];
      });
    }
    showToast({ message: 'Cleared notification center.', type: 'info' });
  };

    const unreadMailCount = useMemo(() => {
    return mailMessages.filter((m) => {
      if (m.isRead) return false;
      if (authMode === 'USER' && currentUser) {
        if (m.recipientUserId && m.recipientUserId !== 'ALL') {
          const isUserMatch =
            m.recipientUserId === currentUser.id ||
            (currentUser.username && m.recipientUserId.toLowerCase() === currentUser.username.toLowerCase()) ||
            (currentUser.email && m.recipientUserId.toLowerCase() === currentUser.email.toLowerCase());
          if (!isUserMatch) return false;
        }
        if (m.recipientOutletId && m.recipientOutletId !== 'ALL') {
          if (m.recipientOutletId !== currentUser.outletId) return false;
        }
        return true;
      }
      // Admin: only count mail actually sent TO the admin, matching MailModal's inbox filter.
      return m.senderRole === 'USER';
    }).length;
  }, [mailMessages, authMode, currentUser]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => {
      if (n.isRead) return false;
      if (authMode === 'USER' && currentUser) {
        // Admin-only notifications must never show to regular users
        if (n.targetAudience === 'ADMIN_ONLY') return false;

        // If targeted to a specific user, strictly only that user can see it
        if (n.targetUserId && n.targetUserId !== 'ALL') {
          const isUserMatch =
            n.targetUserId === currentUser.id ||
            (currentUser.username && n.targetUserId.toLowerCase() === currentUser.username.toLowerCase()) ||
            (currentUser.email && n.targetUserId.toLowerCase() === currentUser.email.toLowerCase());
          if (!isUserMatch) return false;
        }

        // If targeted to a specific outlet, strictly only users of that outlet can see it
        if (n.targetOutletId && n.targetOutletId !== 'ALL') {
          if (n.targetOutletId !== currentUser.outletId) return false;
        }

        return true;
      }
      if (authMode === 'ADMIN' && currentAdmin) {
        if (n.targetAudience === 'USER_ONLY') return false;
        return true;
      }
      return true;
    }).length;
  }, [notifications, authMode, currentUser, currentAdmin]);

  // Cheque & Debit Card Registry operations
  const addChequeBookEntry = (data: {
    accountTitle: string;
    accountNumber: string;
    mobileNumber: string;
    receivedDate: string;
    leafCount: ChequeLeafCount;
    startCchNumber: string;
    endCchNumber: string;
    notes?: string;
  }): ChequeBookRecord => {
    const user = currentUser || {
      id: 'USR-AFO-001',
      fullName: 'Mohammad Ashiqul Islam',
      email: 'mdashiqislam2022@gmail.com',
      employeeId: 'EMP-BBL-7491',
      outletId: 'OUT-DHK-001',
      outletName: 'Motijheel Commercial SME Outlet'
    };

    const newRecord: ChequeBookRecord = {
      id: createUniqueId('REG-CHQ'),
      type: 'CHEQUE',
      accountTitle: data.accountTitle.trim(),
      accountNumber: data.accountNumber.trim(),
      mobileNumber: data.mobileNumber.trim(),
      receivedDate: data.receivedDate,
      leafCount: data.leafCount,
      startCchNumber: data.startCchNumber.trim(),
      endCchNumber: data.endCchNumber.trim(),
      outletId: user.outletId || 'OUT-DHK-001',
      outletName: user.outletName || 'Motijheel Commercial SME Outlet',
      userId: user.id,
      userName: user.fullName,
      status: 'RECEIVED',
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    setChequeCardEntries((prev) => [newRecord, ...prev]);
    SupabaseService.saveChequeCardEntry(newRecord);

    // Also register in general submissions stream so dashboard syncs
    const newSubmission: WorkSubmission = {
      id: createUniqueId(`SUB-${new Date().getFullYear()}`),
      trackingNo: `BBL-CHQ-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      employeeId: user.employeeId || 'EMP-BBL-7491',
      outletId: user.outletId || 'OUT-DHK-001',
      outletName: user.outletName || 'Motijheel Commercial SME Outlet',
      customerName: data.accountTitle,
      customerPhone: data.mobileNumber,
      customerNid: 'Verified in Core',
      accountOrCardNumber: data.accountNumber,
      serviceCategory: 'CHEQUE_BOOK_DISPATCH',
      status: 'RECEIVED_AT_OUTLET',
      chequeLeafCount: data.leafCount,
      chequeSerialStart: data.startCchNumber,
      chequeSerialEnd: data.endCchNumber,
      deliveryAcknowledgmentSigned: false,
      priorityLevel: 'NORMAL',
      notes: `Cheque Book Received (${data.leafCount} Leaves, ${data.startCchNumber} - ${data.endCchNumber})`,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processedBy: user.fullName
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
    SupabaseService.saveSubmission(newSubmission);

    addAuditEntry(
      'CHEQUE_BOOK_REGISTERED',
      `Received Cheque Book (${data.leafCount} LVS): ${data.accountTitle} (Acc: ${data.accountNumber}, CCH: ${data.startCchNumber} to ${data.endCchNumber})`,
      user.outletName
    );

    try {
      confetti({ particleCount: 45, spread: 50, origin: { y: 0.8 } });
    } catch {}

    showToast({ message: `Cheque Book for "${data.accountTitle}" registered successfully!`, type: 'success' });
    return newRecord;
  };

  const addDebitCardEntry = (data: {
    cardName: string;
    accountNumber: string;
    mobileNumber: string;
    receivedDate: string;
    cardType?: string;
    notes?: string;
  }): DebitCardRecord => {
    const user = currentUser || {
      id: 'USR-AFO-001',
      fullName: 'Mohammad Ashiqul Islam',
      email: 'mdashiqislam2022@gmail.com',
      employeeId: 'EMP-BBL-7491',
      outletId: 'OUT-DHK-001',
      outletName: 'Motijheel Commercial SME Outlet'
    };

    const newRecord: DebitCardRecord = {
      id: createUniqueId('REG-CRD'),
      type: 'CARD',
      cardName: data.cardName.trim(),
      accountNumber: data.accountNumber.trim(),
      mobileNumber: data.mobileNumber.trim(),
      receivedDate: data.receivedDate,
      cardType: data.cardType || 'VISA Contactless Debit',
      outletId: user.outletId || 'OUT-DHK-001',
      outletName: user.outletName || 'Motijheel Commercial SME Outlet',
      userId: user.id,
      userName: user.fullName,
      status: 'RECEIVED',
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    setChequeCardEntries((prev) => [newRecord, ...prev]);
    SupabaseService.saveChequeCardEntry(newRecord);

    // Also register in general submissions stream
    const newSubmission: WorkSubmission = {
      id: createUniqueId(`SUB-${new Date().getFullYear()}`),
      trackingNo: `BBL-CRD-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      employeeId: user.employeeId || 'EMP-BBL-7491',
      outletId: user.outletId || 'OUT-DHK-001',
      outletName: user.outletName || 'Motijheel Commercial SME Outlet',
      customerName: data.cardName,
      customerPhone: data.mobileNumber,
      customerNid: 'Verified in Core',
      accountOrCardNumber: data.accountNumber,
      serviceCategory: 'DEBIT_CREDIT_CARD',
      status: 'RECEIVED_AT_OUTLET',
      deliveryAcknowledgmentSigned: false,
      priorityLevel: 'NORMAL',
      notes: `Debit Card Received for ${data.cardName} (Acc: ${data.accountNumber})`,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processedBy: user.fullName
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
    SupabaseService.saveSubmission(newSubmission);

    addAuditEntry(
      'DEBIT_CARD_REGISTERED',
      `Received Debit Card: ${data.cardName} (Acc: ${data.accountNumber}, Mobile: ${data.mobileNumber})`,
      user.outletName
    );

    try {
      confetti({ particleCount: 45, spread: 50, origin: { y: 0.8 } });
    } catch {}

    showToast({ message: `Debit Card for "${data.cardName}" recorded successfully!`, type: 'success' });
    return newRecord;
  };

  const updateChequeCardEntry = (updatedEntry: ChequeCardEntry) => {
    setChequeCardEntries((prev) =>
      prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item))
    );
    SupabaseService.saveChequeCardEntry(updatedEntry);
    addAuditEntry(
      'REGISTRY_ENTRY_UPDATED',
      `Updated details for ${updatedEntry.type === 'CHEQUE' ? 'Cheque Book' : 'Debit Card'} (${'accountTitle' in updatedEntry ? updatedEntry.accountTitle : updatedEntry.cardName})`
    );
    showToast({ message: 'Entry updated successfully!', type: 'success' });
  };

  const updateChequeCardStatus = (
    id: string,
    status: 'RECEIVED' | 'DELIVERED_TO_CUSTOMER' | 'RETURNED' | 'DESTROYED_EXPIRED',
    deliveryDate?: string,
    notes?: string,
    destructionData?: { destroyedAt?: string; destructionReason?: string }
  ) => {
    let updatedToSave: ChequeCardEntry | null = null;
    setChequeCardEntries((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            status,
            deliveredAt:
              status === 'DELIVERED_TO_CUSTOMER'
                ? (deliveryDate || new Date().toISOString().split('T')[0])
                : undefined,
            destroyedAt:
              status === 'DESTROYED_EXPIRED'
                ? (destructionData?.destroyedAt || new Date().toISOString().split('T')[0])
                : undefined,
            destructionReason:
              status === 'DESTROYED_EXPIRED'
                ? (destructionData?.destructionReason || 'Expired: 90+ days pending without customer collection')
                : undefined,
            notes: notes !== undefined ? notes : item.notes
          };
          updatedToSave = updated;
          addAuditEntry(
            'REGISTRY_STATUS_CHANGED',
            `${item.type === 'CHEQUE' ? 'Cheque Book' : 'Debit Card'} (${'accountTitle' in item ? item.accountTitle : item.cardName}) marked as ${status}${deliveryDate ? ` (Delivery Date: ${deliveryDate})` : ''}${destructionData?.destroyedAt ? ` (Destroyed Date: ${destructionData.destroyedAt})` : ''}`
          );
          return updated;
        }
        return item;
      })
    );
    if (updatedToSave) {
      SupabaseService.saveChequeCardEntry(updatedToSave);
    }
    showToast({
      message: `Status updated to ${
        status === 'DELIVERED_TO_CUSTOMER'
          ? 'Delivered'
          : status === 'RECEIVED'
          ? 'Pending in Vault'
          : status === 'DESTROYED_EXPIRED'
          ? 'Marked as Destroyed (90+ Days Expired)'
          : status
      }`,
      type: 'success'
    });
  };

  const deleteChequeCardEntry = (id: string) => {
    setChequeCardEntries((prev) => prev.filter((item) => item.id !== id));
    SupabaseService.deleteChequeCardEntry(id);
    showToast({ message: 'Entry removed from registry.', type: 'info' });
  };

  // Loan Account CRUD Operations
  const addLoanRecord = (data: {
    accountTitle: string;
    customerName: string;
    mobileNumber: string;
    loanAccountNumber: string;
    loanAmount: number;
    monthlyInstallment: number;
    disbursementDate: string;
    interestRate: number;
    loanTenureYears: number;
    loanStatus?: LoanStatus;
    notes?: string;
  }): LoanAccountRecord => {
    const user = currentUser || {
      id: 'USR-AFO-001',
      fullName: 'Mohammad Ashiqul Islam',
      email: 'mdashiqislam2022@gmail.com',
      employeeId: 'EMP-BBL-7491',
      outletId: 'OUT-DHK-001',
      outletName: 'Motijheel Commercial SME Outlet'
    };

    const newRecord: LoanAccountRecord = {
      id: createUniqueId('LN-REC'),
      accountTitle: data.accountTitle.trim(),
      customerName: data.customerName.trim(),
      mobileNumber: data.mobileNumber.trim(),
      loanAccountNumber: data.loanAccountNumber.trim(),
      loanAmount: Number(data.loanAmount),
      monthlyInstallment: Number(data.monthlyInstallment),
      disbursementDate: data.disbursementDate,
      interestRate: Number(data.interestRate),
      loanTenureYears: Number(data.loanTenureYears),
      loanStatus: data.loanStatus || 'ACTIVE',
      outletId: user.outletId || 'OUT-DHK-001',
      outletName: user.outletName || 'Motijheel Commercial SME Outlet',
      userId: user.id,
      userName: user.fullName,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    setLoanRecords((prev) => [newRecord, ...prev]);
    SupabaseService.saveLoanRecord(newRecord);

    addAuditEntry(
      'LOAN_ACCOUNT_REGISTERED',
      `Registered Loan Account: ${newRecord.accountTitle} (Loan Acc: ${newRecord.loanAccountNumber}, Amount: ৳${newRecord.loanAmount.toLocaleString()}, Tenure: ${newRecord.loanTenureYears}y @ ${newRecord.interestRate}%)`,
      user.outletName
    );

    try {
      confetti({ particleCount: 45, spread: 50, origin: { y: 0.8 } });
    } catch {}

    showToast({ message: `Loan Account for "${data.accountTitle}" registered successfully!`, type: 'success' });
    return newRecord;
  };

  const updateLoanRecord = (updatedRecord: LoanAccountRecord) => {
    setLoanRecords((prev) =>
      prev.map((item) => (item.id === updatedRecord.id ? { ...updatedRecord, updatedAt: new Date().toISOString() } : item))
    );
    SupabaseService.saveLoanRecord(updatedRecord);
    addAuditEntry(
      'LOAN_ACCOUNT_UPDATED',
      `Updated loan record details for ${updatedRecord.accountTitle} (Loan Acc: ${updatedRecord.loanAccountNumber})`
    );
    showToast({ message: 'Loan record updated successfully!', type: 'success' });
  };

  const deleteLoanRecord = (id: string) => {
    setLoanRecords((prev) => prev.filter((item) => item.id !== id));
    SupabaseService.deleteLoanRecord(id);
    showToast({ message: 'Loan account removed from registry.', type: 'info' });
  };

  const resetAllDemoData = () => {
    if (SupabaseService.isAvailable()) {
      SupabaseService.fetchAllData().then((cloudData) => {
        if (cloudData) {
          if (cloudData.outlets) setOutlets(cloudData.outlets);
          if (cloudData.users) setUsers(cloudData.users);
          if (cloudData.admins) setAdmins(cloudData.admins);
          if (cloudData.submissions) setSubmissions(cloudData.submissions);
          if (cloudData.chequeCardEntries) setChequeCardEntries(cloudData.chequeCardEntries);
          if (cloudData.loanRecords) setLoanRecords(cloudData.loanRecords);
          if (cloudData.mailMessages) setMailMessages(cloudData.mailMessages);
          if (cloudData.notifications) setNotifications(cloudData.notifications);
          if (cloudData.passwordResetRequests) setPasswordResetRequests(cloudData.passwordResetRequests);
          if (cloudData.afoTransfers) setAfoTransfers(cloudData.afoTransfers);
          if (cloudData.auditLogs) setAuditLogs(cloudData.auditLogs);
          if (cloudData.governanceSettings) setGovernanceSettings(cloudData.governanceSettings);
        }
      }).catch((e) => console.warn('Supabase sync error:', e));
    }
    showToast({ message: 'Synchronized with Supabase Cloud Database.', type: 'info' });
  };

  // Outlet-Based Data Scoping & Multi-Tenancy Architecture:
  // - For User Portal (AFO): Isolated by assigned Outlet ID/Name.
  //   Shared Outlet History: Automatically provides access to all past & current Cheques, Cards, Loans, and Work Submissions of the SAME outlet.
  // - For Admin Portal: Master global view across ALL outlets nationwide.
  const isUserPortal = authMode === 'USER' && !!currentUser && !currentAdmin;

  const scopedChequeCardEntries = useMemo(() => {
    if (isUserPortal && currentUser) {
      const userOutletId = (currentUser.outletId || '').trim().toLowerCase();
      const userOutletName = (currentUser.outletName || '').trim().toLowerCase();
      return chequeCardEntries.filter((e) => {
        const itemOutletId = (e.outletId || '').trim().toLowerCase();
        const itemOutletName = (e.outletName || '').trim().toLowerCase();
        return (
          (userOutletId && itemOutletId === userOutletId) ||
          (userOutletName && itemOutletName === userOutletName) ||
          (!itemOutletId && !userOutletId)
        );
      });
    }
    return chequeCardEntries;
  }, [chequeCardEntries, isUserPortal, currentUser]);

  const scopedLoanRecords = useMemo(() => {
    if (isUserPortal && currentUser) {
      const userOutletId = (currentUser.outletId || '').trim().toLowerCase();
      const userOutletName = (currentUser.outletName || '').trim().toLowerCase();
      return loanRecords.filter((e) => {
        const itemOutletId = (e.outletId || '').trim().toLowerCase();
        const itemOutletName = (e.outletName || '').trim().toLowerCase();
        return (
          (userOutletId && itemOutletId === userOutletId) ||
          (userOutletName && itemOutletName === userOutletName) ||
          (!itemOutletId && !userOutletId)
        );
      });
    }
    return loanRecords;
  }, [loanRecords, isUserPortal, currentUser]);

  const scopedSubmissions = useMemo(() => {
    if (isUserPortal && currentUser) {
      const userOutletId = (currentUser.outletId || '').trim().toLowerCase();
      const userOutletName = (currentUser.outletName || '').trim().toLowerCase();
      return submissions.filter((s) => {
        const itemOutletId = (s.outletId || '').trim().toLowerCase();
        const itemOutletName = (s.outletName || '').trim().toLowerCase();
        return (
          (userOutletId && itemOutletId === userOutletId) ||
          (userOutletName && itemOutletName === userOutletName) ||
          s.userId === currentUser.id
        );
      });
    }
    return submissions;
  }, [submissions, isUserPortal, currentUser]);

  // Filtered user submissions (Shared Outlet History for AFOs of the same outlet)
  const userSubmissions = useMemo(() => {
    if (!currentUser) return [];
    const userOutletId = (currentUser.outletId || '').trim().toLowerCase();
    const userOutletName = (currentUser.outletName || '').trim().toLowerCase();
    return submissions.filter((s) => {
      const itemOutletId = (s.outletId || '').trim().toLowerCase();
      const itemOutletName = (s.outletName || '').trim().toLowerCase();
      return (
        (userOutletId && itemOutletId === userOutletId) ||
        (userOutletName && itemOutletName === userOutletName) ||
        s.userId === currentUser.id
      );
    });
  }, [submissions, currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentAdmin,
        authMode,
        outlets,
        deletedOutlets,
        users,
        admins,
        submissions: scopedSubmissions,
        userSubmissions,
        auditLogs,
        userPreferences,
        activeNavTab,
        setActiveNavTab,
        isSidebarOpen,
        setIsSidebarOpen,

        // Cheque & Card Registry
        chequeCardEntries: scopedChequeCardEntries,
        addChequeBookEntry,
        addDebitCardEntry,
        updateChequeCardEntry,
        updateChequeCardStatus,
        deleteChequeCardEntry,

        // Loan Account Registry
        loanRecords: scopedLoanRecords,
        loanAccounts: scopedLoanRecords,
        addLoanRecord,
        updateLoanRecord,
        deleteLoanRecord,

        // Add/Edit Entry Modal controls
        isAddEntryModalOpen,
        setIsAddEntryModalOpen,
        initialAddEntryType,
        editingChequeCardEntry,
        openAddEntryModal,
        openEditEntryModal,
        closeAddEntryModal,
        
        // Mail & Notifications
        mailMessages,
        unreadMailCount,
        sendMailMessage,
        sendStationMail: sendMailMessage,
        markMailAsRead,
        markAllMailAsRead,
        deleteMailMessage,

        notifications,
        unreadNotificationsCount,
        sendNotificationNote,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        
        // Governance & Admin Profile Management
        governanceSettings,
        updateGovernanceSettings,
        updateAdminProfileAndCredentials,

        // Password Reset Requests (Admin & User)
        passwordResetRequests,
        requestPasswordResetFromAdmin,
        resolvePasswordResetRequest,
        rejectPasswordResetRequest,
        cancelPasswordResetRequest,
        reopenPasswordResetRequest,
        adminUpdateUserProfile,

        // Auth functions and aliases
        loginUserWithCredentials,
        loginUser: loginUserWithCredentials,
        loginUserByEmail,
        loginWithGoogle: loginUserByEmail,
        signUpUser,
        signupWithGoogle: signUpUser,
        resetUserCredentials,
        resetAdminCredentials,
        loginAdminByPin,
        loginAdminWithPin: loginAdminByPin,
        loginAdminDirectly,
        setupFirstTimeAdmin,
        setupAdminWithPin: setupFirstTimeAdmin,
        logout,
        
        // User operations and aliases
        updateCurrentUserProfile,
        createNewSubmission,
        submitWorkData: createNewSubmission,
        updateSubmissionStatus,
        updateUserPreferences,
        
        // Admin operations and aliases
        updateUserStatus,
        updateAdminProfile,
        updateUserOutletAssignment,
        transferAfoToOutlet,
        delegateAdminAccess,
        revokeAdminDelegation,
        addOutlet,
        addNewOutlet: addOutlet,
        updateOutlet,
        deleteOutlet,
        suspendOutlet,
        reactivateOutlet,
        restoreDeletedOutlet,
        permanentlyPurgeDeletedOutlet,
        toggleOutletStatus,
        adminCreateAFO,
        deleteUser,

        // Cross-Navigation between AFO, Outlets, and Transfers
        selectedOutletIdForNav,
        setSelectedOutletIdForNav,
        selectedUserIdForNav,
        setSelectedUserIdForNav,
        selectedAfoForTransfer,
        setSelectedAfoForTransfer,
        afoTransfers,
        afoTransferResetTrigger,
        triggerAfoTransferReset,
        outletSubView,
        setOutletSubView,
        afoSubView,
        setAfoSubView,
        navigateToOutlet,
        navigateToAfo,
        navigateToTransfer,
        refreshLiveMetrics,
        
        // Utils and aliases
        addAuditEntry,
        resetAllDemoData,
        resetDemoData: resetAllDemoData,
        toastMessage,
        setToast: showToast,
        showToast,
        addToast: showToast,
        clearToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
