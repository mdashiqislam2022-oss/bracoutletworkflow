import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Building2,
  Phone,
  Mail,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  UserX,
  UserCheck,
  KeyRound,
  RotateCcw,
  Camera,
  Upload,
  Check,
  AlertCircle,
  Clock,
  Edit3,
  ShieldCheck,
  Lock,
  AtSign,
  User,
  Sparkles,
  FileText,
  UserPlus,
  ArrowRight,
  ExternalLink,
  Trash2,
  HeartPulse,
  PhoneCall,
  Bell,
  BellRing,
  Send,
  SendHorizontal,
  MessageSquare,
  BadgeAlert,
  Radio,
  FileCheck2,
  Inbox,
  History,
  Calendar,
  Briefcase,
  Activity,
  CheckCheck,
  Info,
  ShieldAlert,
  Award
} from 'lucide-react';
import { UserProfile, PasswordResetRequest } from '../../types';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export const UserManagement: React.FC = () => {
  const {
    currentUser,
    authMode,
    users,
    outlets,
    submissions,
    updateUserStatus,
    updateUserOutletAssignment,
    transferAfoToOutlet,
    passwordResetRequests,
    resolvePasswordResetRequest,
    rejectPasswordResetRequest,
    cancelPasswordResetRequest,
    reopenPasswordResetRequest,
    adminUpdateUserProfile,
    adminCreateAFO,
    deleteUser,
    sendNotificationNote,
    sendMailMessage,
    notifications,
    showToast,
    userPreferences,
    selectedUserIdForNav,
    setSelectedUserIdForNav,
    afoSubView,
    setAfoSubView,
    navigateToOutlet
  } = useApp();

  const isDark = userPreferences?.theme === 'dark';

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'RESET_REQUESTS'>('DIRECTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [resetTabFilter, setResetTabFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'CANCELLED'>('PENDING');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [dossierTab, setDossierTab] = useState<'DOSSIER' | 'SEND_NOTE' | 'NOTE_HISTORY'>('DOSSIER');
  const [isReassigningOutlet, setIsReassigningOutlet] = useState(false);
  const [targetOutletId, setTargetOutletId] = useState('');
  const [targetOutletName, setTargetOutletName] = useState('');
  const [transferRevokeAccess, setTransferRevokeAccess] = useState(true);
  const [transferNoteInput, setTransferNoteInput] = useState('');

  // Note / Notification to specific AFO state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [notePriority, setNotePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [noteType, setNoteType] = useState<'ADMIN_NOTE' | 'ALERT' | 'INFO' | 'APPROVAL'>('ADMIN_NOTE');
  const [sendAsMailAlso, setSendAsMailAlso] = useState(true);
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [noteSuccessMsg, setNoteSuccessMsg] = useState<string | null>(null);

  // Note Sent Success Confirmation Modal
  const [noteSentModalOpen, setNoteSentModalOpen] = useState(false);
  const [lastSentNoteInfo, setLastSentNoteInfo] = useState<{
    title: string;
    type: string;
    priority: string;
    timestamp: string;
    recipientName: string;
    outletName: string;
  } | null>(null);

  // Note History Filter
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');

  // Admin Direct Profile Edit Modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    designation: '',
    employeeId: '',
    avatarUrl: '',
    outletId: '',
    outletName: '',
    bloodGroup: 'B+',
    emergencyPhone: '',
    bio: '',
    supervisor: 'Head of Branch Operations'
  });

  // Admin Create New AFO Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    fullName: '',
    username: '',
    password: '1234',
    phone: '01711-000000',
    email: '',
    designation: 'Assistant Field Officer (AFO)',
    employeeId: '',
    avatarUrl: PRESET_AVATARS[0],
    outletId: outlets[0]?.id || '',
    outletName: outlets[0] ? `${outlets[0].name} (${outlets[0].district}) - ${outlets[0].code}` : 'Central Outlet',
    bloodGroup: 'B+',
    emergencyPhone: '01811-000000',
    bio: 'Assigned to BRAC Bank Outlet for customer cheque, card, and SME loan verification.',
    supervisor: 'Head of Branch Operations'
  });

  // Reset Request Resolution Modal State
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [resolveUsername, setResolveUsername] = useState('');
  const [resolvePassword, setResolvePassword] = useState('1234');
  const [resolveAvatarUrl, setResolveAvatarUrl] = useState('');
  const [resolveAdminNote, setResolveAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Status/Feedback
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adminEditFileRef = useRef<HTMLInputElement>(null);
  const createOfficerFileRef = useRef<HTMLInputElement>(null);

  const districts = Array.from(new Set(outlets.map((o) => o.district)));
  const pendingRequestsCount = passwordResetRequests.filter((r) => r.status === 'PENDING').length;
  const resolvedRequestsCount = passwordResetRequests.filter((r) => r.status === 'RESOLVED').length;
  const cancelledRequestsCount = passwordResetRequests.filter((r) => r.status === 'CANCELLED' || r.status === 'REJECTED').length;

  // Real-time active status analysis for AFOs
  const isAfoOnline = (user: UserProfile | null | undefined) => {
    if (!user) return false;
    if (user.status === 'SUSPENDED') return false;
    return (
      authMode === 'USER' &&
      currentUser !== null &&
      (currentUser.id === user.id ||
        (Boolean(currentUser.email) && Boolean(user.email) && currentUser.email.toLowerCase() === user.email.toLowerCase()) ||
        (Boolean(currentUser.username) && Boolean(user.username) && currentUser.username.toLowerCase() === user.username.toLowerCase()))
    );
  };

  // Counts for the 4 AFO Metric Summary Cards
  const activeOfficersCount = users.filter((u) => u.status === 'ACTIVE' || !u.status).length;
  const inactiveOfficersCount = users.filter((u) => u.status === 'INACTIVE').length;
  const suspendedOfficersCount = users.filter((u) => u.status === 'SUSPENDED').length;
  const newRegisteredCount = users.filter((u) => u.status === 'PENDING').length + pendingRequestsCount;

  // React to cross-navigation requests from Outlet Details or Dashboard
  useEffect(() => {
    if (selectedUserIdForNav) {
      const targetUser = users.find((u) => u.id === selectedUserIdForNav);
      if (targetUser) {
        if (afoSubView === 'EDIT') {
          handleOpenEditUser(targetUser);
        } else {
          setSelectedUser(targetUser);
        }
      }
      setSelectedUserIdForNav(null);
    }
  }, [selectedUserIdForNav, afoSubView, users]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.outletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && (u.status === 'ACTIVE' || !u.status)) ||
      (statusFilter === 'INACTIVE' && u.status === 'INACTIVE') ||
      (statusFilter === 'SUSPENDED' && u.status === 'SUSPENDED') ||
      (statusFilter === 'PENDING' && u.status === 'PENDING');

    const userOutlet = outlets.find((o) => o.id === u.outletId);
    const matchesDistrict = districtFilter === 'ALL' || userOutlet?.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const filteredRequests = passwordResetRequests.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.emailOrPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.outletName && r.outletName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.outletCode && r.outletCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.assignedUsername && r.assignedUsername.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = true;
    if (resetTabFilter === 'PENDING') {
      matchesTab = r.status === 'PENDING';
    } else if (resetTabFilter === 'RESOLVED') {
      matchesTab = r.status === 'RESOLVED';
    } else if (resetTabFilter === 'CANCELLED') {
      matchesTab = r.status === 'CANCELLED' || r.status === 'REJECTED';
    }

    return matchesSearch && matchesTab;
  });

  const userSubmissions = selectedUser
    ? submissions.filter((s) => s.userId === selectedUser.id)
    : [];

  const handleReassignOutlet = () => {
    if (!selectedUser) return;
    const typed = targetOutletName.trim();
    const matchedOutlet = outlets.find(
      (o) =>
        o.id === targetOutletId ||
        `${o.name} (${o.district}) - ${o.code}`.toLowerCase() === typed.toLowerCase() ||
        o.name.toLowerCase() === typed.toLowerCase() ||
        o.code.toLowerCase() === typed.toLowerCase()
    );

    const finalId = matchedOutlet ? matchedOutlet.id : (targetOutletId || 'out_1');
    const finalName = matchedOutlet ? matchedOutlet.name : (typed || 'Central Outlet');
    const finalAddress = matchedOutlet ? matchedOutlet.address : 'Dhaka';

    transferAfoToOutlet(selectedUser.id, finalId, {
      revokePreviousOutletAccess: transferRevokeAccess,
      adminNote: transferNoteInput.trim() || undefined
    });

    setIsReassigningOutlet(false);
    setSelectedUser((prev) =>
      prev
        ? {
            ...prev,
            outletId: finalId,
            outletName: finalName,
            outletLocation: finalAddress,
            previousOutletIds: transferRevokeAccess
              ? Array.from(new Set([...(prev.previousOutletIds || []), prev.outletId]))
              : prev.previousOutletIds
          }
        : null
    );
    setActionSuccessMsg(`Officer ${selectedUser.fullName} successfully transferred to ${finalName}`);
    setTransferNoteInput('');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Dispatched notes timeline for selected AFO
  const officerDispatchedNotes = useMemo(() => {
    if (!selectedUser) return [];
    return (notifications || []).filter((n) => {
      if (n.targetUserId && n.targetUserId !== 'ALL') {
        return (
          n.targetUserId === selectedUser.id ||
          (selectedUser.username && n.targetUserId.toLowerCase() === selectedUser.username.toLowerCase()) ||
          (selectedUser.email && n.targetUserId.toLowerCase() === selectedUser.email.toLowerCase())
        );
      }
      return false;
    });
  }, [notifications, selectedUser]);

  // Send Direct Administrative Note / Notification to Officer
  const handleSendDirectNoteToOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!noteTitle.trim() || !noteMessage.trim()) {
      showToast({ message: 'Please enter both a title and message body for the note.', type: 'error' });
      return;
    }

    setIsSendingNote(true);

    const titleSent = noteTitle.trim();
    const msgSent = noteMessage.trim();
    const typeSent = noteType;
    const prioritySent = notePriority;

    // 1. Dispatch high-priority Station Notification specifically to this AFO's notification bar
    sendNotificationNote({
      title: titleSent,
      message: msgSent,
      type: typeSent,
      priority: prioritySent,
      targetUserId: selectedUser.id,
      targetOutletId: selectedUser.outletId,
      targetAudience: 'USER_ONLY',
      linkTab: 'dashboard'
    });

    // 2. Also dispatch as Station Mail message if toggled
    if (sendAsMailAlso) {
      sendMailMessage({
        recipientUserId: selectedUser.id,
        recipientOutletId: selectedUser.outletId,
        subject: titleSent,
        content: msgSent,
        priority: prioritySent === 'HIGH' ? 'URGENT' : prioritySent === 'MEDIUM' ? 'IMPORTANT' : 'NORMAL',
        category: 'DIRECT_MEMO'
      });
    }

    setIsSendingNote(false);
    setLastSentNoteInfo({
      title: titleSent,
      type: typeSent,
      priority: prioritySent,
      timestamp: new Date().toISOString(),
      recipientName: selectedUser.fullName,
      outletName: selectedUser.outletName
    });
    setNoteSentModalOpen(true);
    setNoteSuccessMsg(`Administrative note sent directly to ${selectedUser.fullName}'s notification bar & portal!`);
    setNoteTitle('');
    setNoteMessage('');

    setTimeout(() => {
      setNoteSuccessMsg(null);
    }, 4500);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: UserProfile) => {
    const currentOutlet = outlets.find((o) => o.id === user.outletId);
    const outletDisplay = currentOutlet
      ? `${currentOutlet.name} (${currentOutlet.district}) - ${currentOutlet.code}`
      : user.outletName || 'Satkhira Central Branch';

    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName || '',
      username: user.username || (user.email ? user.email.split('@')[0] : 'user'),
      password: user.password || '1234',
      phone: user.phone || '',
      email: user.email || '',
      designation: user.designation || 'Assistant Field Officer (AFO)',
      employeeId: user.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: user.avatarUrl || PRESET_AVATARS[0],
      outletId: user.outletId || outlets[0]?.id || '',
      outletName: outletDisplay,
      bloodGroup: user.bloodGroup || 'B+',
      emergencyPhone: user.emergencyPhone || '',
      bio: user.bio || '',
      supervisor: user.supervisor || 'Head of Branch Operations'
    });
  };

  // Save Direct User Profile Updates
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const typedOutlet = editFormData.outletName.trim();
    const matchedOutlet = outlets.find(
      (o) =>
        o.id === editFormData.outletId ||
        `${o.name} (${o.district}) - ${o.code}`.toLowerCase() === typedOutlet.toLowerCase() ||
        o.name.toLowerCase() === typedOutlet.toLowerCase() ||
        o.code.toLowerCase() === typedOutlet.toLowerCase()
    );

    const targetOutletId = matchedOutlet ? matchedOutlet.id : (editFormData.outletId || editingUser.outletId);
    const targetOutletName = matchedOutlet ? matchedOutlet.name : (typedOutlet || editingUser.outletName);
    const targetOutletLocation = matchedOutlet ? matchedOutlet.address : editingUser.outletLocation;

    const res = adminUpdateUserProfile(editingUser.id, {
      fullName: editFormData.fullName.trim(),
      username: editFormData.username.trim().toLowerCase(),
      password: editFormData.password.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim(),
      designation: editFormData.designation.trim(),
      employeeId: editFormData.employeeId.trim(),
      avatarUrl: editFormData.avatarUrl,
      outletId: targetOutletId,
      outletName: targetOutletName,
      outletLocation: targetOutletLocation,
      bloodGroup: editFormData.bloodGroup,
      emergencyPhone: editFormData.emergencyPhone.trim(),
      bio: editFormData.bio.trim(),
      supervisor: editFormData.supervisor.trim()
    });

    if (res.success) {
      if (selectedUser && selectedUser.id === editingUser.id) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                ...editFormData,
                outletId: targetOutletId,
                outletName: targetOutletName,
                outletLocation: targetOutletLocation
              }
            : null
        );
      }
      setActionSuccessMsg(`Profile and credentials saved for ${editFormData.fullName}!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
      setEditingUser(null);
    }
  };

  // Open Create Officer Modal
  const handleOpenCreateModal = () => {
    const nextEmpId = `EMP-${1000 + users.length + 1}`;
    const defaultOutlet = outlets[0];
    const defaultOutletDisplay = defaultOutlet
      ? `${defaultOutlet.name} (${defaultOutlet.district}) - ${defaultOutlet.code}`
      : 'Satkhira Branch (Dhaka) - BBL-OUT-101';

    setCreateFormData({
      fullName: '',
      username: '',
      password: '1234',
      phone: '01711-000000',
      email: '',
      designation: 'Assistant Field Officer (AFO)',
      employeeId: nextEmpId,
      avatarUrl: PRESET_AVATARS[0],
      outletId: defaultOutlet?.id || '',
      outletName: defaultOutletDisplay,
      bloodGroup: 'B+',
      emergencyPhone: '01811-000000',
      bio: 'Stationed AFO officer for customer verification and dispatch.',
      supervisor: 'Head of Branch Operations'
    });
    setIsCreateModalOpen(true);
  };

  // Save New Officer
  const handleSaveCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.fullName.trim() || !createFormData.username.trim() || !createFormData.email.trim()) return;

    const typedOutlet = createFormData.outletName.trim();
    const matchedOutlet = outlets.find(
      (o) =>
        o.id === createFormData.outletId ||
        `${o.name} (${o.district}) - ${o.code}`.toLowerCase() === typedOutlet.toLowerCase() ||
        o.name.toLowerCase() === typedOutlet.toLowerCase() ||
        o.code.toLowerCase() === typedOutlet.toLowerCase()
    );

    const targetOutletId = matchedOutlet ? matchedOutlet.id : (createFormData.outletId || outlets[0]?.id || 'out_1');
    const targetOutletName = matchedOutlet ? matchedOutlet.name : (typedOutlet || 'Central Outlet');
    const targetOutletLocation = matchedOutlet ? matchedOutlet.address : (matchedOutlet?.district || 'Dhaka');

    const newUser = adminCreateAFO({
      fullName: createFormData.fullName.trim(),
      username: createFormData.username.trim().toLowerCase(),
      password: createFormData.password.trim() || '1234',
      phone: createFormData.phone.trim(),
      email: createFormData.email.trim(),
      employeeId: createFormData.employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
      designation: createFormData.designation.trim(),
      outletId: targetOutletId,
      outletName: targetOutletName,
      outletLocation: targetOutletLocation,
      avatarUrl: createFormData.avatarUrl,
      bloodGroup: createFormData.bloodGroup,
      emergencyPhone: createFormData.emergencyPhone.trim(),
      bio: createFormData.bio.trim(),
      supervisor: createFormData.supervisor.trim()
    });

    setIsCreateModalOpen(false);
    setActionSuccessMsg(`New AFO Officer ${newUser.fullName} registered successfully!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Open Password Reset Resolution Modal
  const handleOpenResolveModal = (req: PasswordResetRequest) => {
    setSelectedRequest(req);
    setIsRejecting(false);
    setResolveUsername(req.requestedUsername || (req.emailOrPhone ? req.emailOrPhone.split('@')[0] : 'user'));
    setResolvePassword(req.requestedPassword || '1234');
    setResolveAvatarUrl(req.requestedAvatarUrl || PRESET_AVATARS[0]);
    setResolveAdminNote('Approved by Central Admin HQ with updated credentials.');
    setRejectReason('');
  };

  // Submit Password Reset Resolution
  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (isRejecting) {
      if (!rejectReason.trim()) {
        alert('Please specify a rejection reason.');
        return;
      }
      rejectPasswordResetRequest(selectedRequest.id, rejectReason.trim());
      setActionSuccessMsg(`Password reset request #${selectedRequest.id} rejected.`);
    } else {
      resolvePasswordResetRequest(selectedRequest.id, {
        username: resolveUsername.trim().toLowerCase(),
        password: resolvePassword.trim(),
        avatarUrl: resolveAvatarUrl,
        adminNote: resolveAdminNote.trim()
      });
      setActionSuccessMsg(`Password reset request #${selectedRequest.id} approved and resolved.`);
    }

    setTimeout(() => setActionSuccessMsg(null), 3500);
    setSelectedRequest(null);
  };

  // Cancel an AFO reset request
  const handleCancelRequest = (req: PasswordResetRequest) => {
    cancelPasswordResetRequest(req.id, 'Cancelled by Central Administration.');
    setActionSuccessMsg(`Reset request for officer ${req.fullName} cancelled.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Retrieve a cancelled reset request and immediately launch credential reset modal
  const handleRetrieveAndReset = (req: PasswordResetRequest) => {
    reopenPasswordResetRequest(req.id);
    handleOpenResolveModal({
      ...req,
      status: 'PENDING'
    });
    setActionSuccessMsg(`Retrieved reset request for ${req.fullName}. You can now assign new PIN & username.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Handle Photo Upload via Local File
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: 'RESOLVE' | 'EDIT' | 'CREATE') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (mode === 'RESOLVE') {
          setResolveAvatarUrl(result);
        } else if (mode === 'EDIT') {
          setEditFormData((prev) => ({ ...prev, avatarUrl: result }));
        } else {
          setCreateFormData((prev) => ({ ...prev, avatarUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentLang = userPreferences?.language || 'en';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
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
            {currentLang === 'bn' ? 'ফিল্ড পার্সোনেল তালিকা' : 'Field Personnel Roster'}
          </span>
          <h2 className={`text-xl sm:text-2xl font-extrabold mt-1 tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {currentLang === 'bn' ? 'AFO ডিরেক্টরি ও সিকিউরিটি কন্ট্রোল' : 'AFO Directory & Security Control'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentLang === 'bn'
              ? 'অ্যাডমিন নিয়ন্ত্রণ: ফিল্ড অফিসারদের প্রোফাইল ছবি, ৪-ডিজিটের পিন, ইউজারনেম ও নিযুক্ত ব্র্যাক ব্যাংক আউটলেট পরিবর্তন করুন।'
              : 'Admin oversight: update officer profile photos, 4-digit PINs, usernames, and stationed BRAC Bank outlet assignments.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{currentLang === 'bn' ? '+ নতুন AFO নিবন্ধন' : '+ Register New AFO'}</span>
          </button>

          {/* Tab Switcher */}
          <div className={`flex items-center gap-1.5 p-1 rounded-full border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F4F6F8] border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('DIRECTORY')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'DIRECTORY'
                  ? isDark ? 'bg-white text-slate-900 shadow-2xs' : 'bg-[#18181B] text-white shadow-2xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{currentLang === 'bn' ? 'AFO অফিসারবৃন্দ' : 'AFO Officers'} ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('RESET_REQUESTS')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'RESET_REQUESTS'
                  ? isDark ? 'bg-white text-slate-900 shadow-2xs' : 'bg-[#18181B] text-white shadow-2xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{currentLang === 'bn' ? 'রিসেট অনুরোধ' : 'Reset Requests'}</span>
              {pendingRequestsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Action Feedback Alert */}
      {actionSuccessMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 shadow-xs animate-fadeIn ${
          isDark
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: FIELD OFFICERS DIRECTORY                          */}
      {/* ======================================================== */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4 animate-fadeIn">
          {/* 4 AFO Metric Summary Cards (Live Counts & Click-to-Jump Filtering) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {/* Box 1: Active Officers */}
            <div
              id="afo-stat-active"
              onClick={() => {
                setActiveTab('DIRECTORY');
                setStatusFilter('ACTIVE');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === 'DIRECTORY' && statusFilter === 'ACTIVE'
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                  : isDark
                    ? 'bg-[#182338] hover:bg-slate-800/90 border-slate-700/80 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Officers</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-500 mt-1">{activeOfficersCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <span>Field Operational</span> • <span className="text-emerald-500 font-semibold underline">Filter active</span>
              </span>
            </div>

            {/* Box 2: Inactive Officers */}
            <div
              id="afo-stat-inactive"
              onClick={() => {
                setActiveTab('DIRECTORY');
                setStatusFilter('INACTIVE');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === 'DIRECTORY' && statusFilter === 'INACTIVE'
                  ? isDark
                    ? 'bg-slate-800/90 border-sky-500 ring-2 ring-sky-500/40 shadow-lg'
                    : 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                  : isDark
                    ? 'bg-[#182338] hover:bg-slate-800/90 border-slate-700/80 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Inactive Officers</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-black text-sky-400 mt-1">{inactiveOfficersCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <span>Off-Duty / Standby</span> • <span className="text-sky-400 font-semibold underline">Filter inactive</span>
              </span>
            </div>

            {/* Box 3: Suspended Officers */}
            <div
              id="afo-stat-suspended"
              onClick={() => {
                setActiveTab('DIRECTORY');
                setStatusFilter('SUSPENDED');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === 'DIRECTORY' && statusFilter === 'SUSPENDED'
                  ? isDark
                    ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 shadow-lg'
                    : 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                  : isDark
                    ? 'bg-[#182338] hover:bg-slate-800/90 border-slate-700/80 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Suspended Officers</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-500 mt-1">{suspendedOfficersCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <span>Access Restricted</span> • <span className="text-rose-500 font-semibold underline">Filter suspended</span>
              </span>
            </div>

            {/* Box 4: New Registrations / Credential Resets */}
            <div
              id="afo-stat-new"
              onClick={() => {
                setActiveTab('RESET_REQUESTS');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === 'RESET_REQUESTS'
                  ? isDark
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                  : isDark
                    ? 'bg-[#182338] hover:bg-slate-800/90 border-slate-700/80 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">New / Reset Queue</span>
                <RotateCcw className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 mt-1">{newRegisteredCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <span>{pendingRequestsCount} Pending Resets</span> • <span className="text-amber-400 font-semibold underline">Jump to queue</span>
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className={`p-4 rounded-[22px] border transition-all ${
            isDark
              ? 'bg-slate-900/85 border-slate-800 shadow-md text-white'
              : 'bg-white border-slate-100 shadow-xs text-slate-900'
          } flex flex-wrap items-center justify-between gap-3 text-xs`}>
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search AFO name, employee ID, username, email, or outlet..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-full border text-xs focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                aria-label="Filter by district"
                className={`px-3.5 py-2.5 rounded-full border font-medium focus:outline-none transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700/80 text-slate-200 focus:border-emerald-500'
                    : 'bg-[#F4F6F8] border-slate-200/60 text-slate-800'
                }`}
              >
                <option value="ALL">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className={`px-3.5 py-2.5 rounded-full border font-medium focus:outline-none transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700/80 text-slate-200 focus:border-emerald-500'
                    : 'bg-[#F4F6F8] border-slate-200/60 text-slate-800'
                }`}
              >
                <option value="ALL">All Statuses ({users.length})</option>
                <option value="ACTIVE">Active Only ({activeOfficersCount})</option>
                <option value="INACTIVE">Inactive Only ({inactiveOfficersCount})</option>
                <option value="SUSPENDED">Suspended Only ({suspendedOfficersCount})</option>
                <option value="PENDING">Pending / New ({users.filter((u) => u.status === 'PENDING').length})</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className={`rounded-[26px] p-6 border overflow-hidden transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
              : 'bg-white border-slate-100 shadow-xs text-slate-900'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`font-semibold border-b ${
                    isDark ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-100'
                  }`}>
                    <th className="pb-3 pl-2">AFO Officer & Photo</th>
                    <th className="pb-3">Username & 4-Digit PIN</th>
                    <th className="pb-3">Assigned BRAC Outlet</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Account Status</th>
                    <th className="pb-3 pr-2 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-100 text-slate-700'
                }`}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* AFO Profile & Avatar */}
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl || PRESET_AVATARS[0]}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-500/40 shadow-xs shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                <span>{user.fullName}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  {user.employeeId}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">{user.designation}</div>
                            </div>
                          </div>
                        </td>

                        {/* Username & PIN */}
                        <td className="py-3.5">
                          <div className="space-y-0.5">
                            <div className={`font-mono font-bold flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-slate-800'}`}>
                              <AtSign className="w-3 h-3 opacity-60" />
                              <span>{user.username || 'not_set'}</span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>PIN: {user.password || '1234'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Outlet Assignment with direct switch link */}
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div>
                              <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                {user.outletName}
                              </div>
                              <div className="text-[10px] text-slate-400">{user.outletLocation}</div>
                            </div>
                            <button
                              onClick={() => navigateToOutlet(user.outletId, 'DETAILS')}
                              title="Switch to Outlet Details"
                              className="p-1 rounded-md bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 font-mono text-[11px]">
                          <div className={isDark ? 'text-slate-200' : 'text-slate-800'}>{user.phone}</div>
                          <div className="text-slate-400 truncate max-w-[140px]">{user.email}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Details */}
                            <button
                              id={`view-user-btn-${user.id}`}
                              onClick={() => {
                                setSelectedUser(user);
                                setDossierTab('DOSSIER');
                              }}
                              title="View full AFO details"
                              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                                isDark
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                  : 'bg-[#F4F6F8] hover:bg-slate-200 text-slate-700 border-slate-200'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Direct Send Note / Notification */}
                            <button
                              id={`send-note-btn-${user.id}`}
                              onClick={() => {
                                setSelectedUser(user);
                                setDossierTab('SEND_NOTE');
                              }}
                              title="Send Note / Notification to Officer"
                              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                                isDark
                                  ? 'bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 border-amber-500/30'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                              }`}
                            >
                              <BellRing className="w-3.5 h-3.5" />
                            </button>

                            {/* Direct Edit Credentials */}
                            <button
                              id={`edit-user-btn-${user.id}`}
                              onClick={() => handleOpenEditUser(user)}
                              title="Edit Photo, Username & PIN"
                              className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Status Toggle */}
                            {user.status === 'ACTIVE' ? (
                              <button
                                onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                                title="Suspend Account"
                                className="p-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                                title="Reactivate Account"
                                className="p-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No field officers match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PASSWORD RESET REQUESTS (AUTHENTICATION OVERFLOW)  */}
      {/* ======================================================== */}
      {activeTab === 'RESET_REQUESTS' && (
        <div className="space-y-4 animate-fadeIn">
          {/* 3 Clickable Metric Counting Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {/* Box 1: Pending Reset Requests */}
            <div
              id="reset-stat-pending"
              onClick={() => setResetTabFilter('PENDING')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] ${
                resetTabFilter === 'PENDING'
                  ? isDark
                    ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                  : isDark
                    ? 'bg-[#182338] hover:bg-slate-800/90 border-slate-700/80 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending Reset Requests</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 mt-1">{pendingRequestsCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <span>Awaiting Admin Action</span> • <span className="text-amber-400 font-semibold underline">Show pending</span>
              </span>
            </div>

            {/* Box 2: Reset Completed */}
            <div
              id="reset-stat-resolved"
              onClick={() => setResetTabFilter('RESOLVED')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] ${
                resetTabFilter === 'RESOLVED'
                  ? isDark
                    ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                  : isDark
                    ? 'bg-[#182338] hover:bg-slate-800/90 border-slate-700/80 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reset Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-500 mt-1">{resolvedRequestsCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <span>Provisioned & Resolved</span> • <span className="text-emerald-500 font-semibold underline">Show completed</span>
              </span>
            </div>

            {/* Box 3: Cancelled Requests */}
            <div
              id="reset-stat-cancelled"
              onClick={() => setResetTabFilter('CANCELLED')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] ${
                resetTabFilter === 'CANCELLED'
                  ? isDark
                    ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/40 shadow-lg'
                    : 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                  : isDark
                    ? 'bg-[#182338] hover:bg-slate-800/90 border-slate-700/80 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cancelled Requests</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-500 mt-1">{cancelledRequestsCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <span>Declined / Cancelled Queue</span> • <span className="text-rose-500 font-semibold underline">Show cancelled</span>
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className={`p-4 rounded-[22px] border transition-all ${
            isDark
              ? 'bg-slate-900/85 border-slate-800 shadow-md text-white'
              : 'bg-white border-slate-100 shadow-xs text-slate-900'
          } flex flex-wrap items-center justify-between gap-3 text-xs`}>
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search officer name, username, outlet, or contact..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-full border text-xs focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={resetTabFilter}
                onChange={(e) => setResetTabFilter(e.target.value as any)}
                aria-label="Filter by request status"
                className={`px-3.5 py-2.5 rounded-full border font-medium focus:outline-none transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700/80 text-slate-200 focus:border-emerald-500'
                    : 'bg-[#F4F6F8] border-slate-200/60 text-slate-800'
                }`}
              >
                <option value="ALL">All Requests ({passwordResetRequests.length})</option>
                <option value="PENDING">Pending Only ({pendingRequestsCount})</option>
                <option value="RESOLVED">Resolved / Completed ({resolvedRequestsCount})</option>
                <option value="CANCELLED">Cancelled / Rejected ({cancelledRequestsCount})</option>
              </select>
            </div>
          </div>

          {/* Reset Requests Table */}
          <div className={`rounded-[26px] p-5 sm:p-6 border overflow-hidden transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
              : 'bg-white border-slate-100 shadow-xs text-slate-900'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`font-semibold border-b ${
                    isDark ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-100'
                  }`}>
                    <th className="pb-3 pl-2">Officer Profile</th>
                    <th className="pb-3">Stationed Outlet</th>
                    <th className="pb-3">Request Date & Time</th>
                    <th className="pb-3">Reason / User Note</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-100 text-slate-700'
                }`}>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req, idx) => {
                      const matchedUser = users.find((u) =>
                        (req.userId && u.id === req.userId) ||
                        (req.emailOrPhone && (u.email.toLowerCase() === req.emailOrPhone.toLowerCase() || u.phone.replace(/\D/g, '') === req.emailOrPhone.replace(/\D/g, ''))) ||
                        u.fullName.toLowerCase() === req.fullName.toLowerCase()
                      );

                      const userAvatar = req.requestedAvatarUrl || matchedUser?.avatarUrl || PRESET_AVATARS[0];
                      const userEmpId = matchedUser?.employeeId || req.id.slice(-6);
                      const userOutletName = req.outletName || matchedUser?.outletName || 'Central Outlet';
                      const userOutletCode = req.outletCode || matchedUser?.outletCode || 'BBL-OUT-101';

                      const reqDate = new Date(req.requestedAt);
                      const formattedDate = !isNaN(reqDate.getTime())
                        ? reqDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : req.requestedAt;
                      const formattedTime = !isNaN(reqDate.getTime())
                        ? reqDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '';

                      return (
                        <tr
                          key={`${req.id}-${idx}`}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* 1. Officer Profile Details */}
                          <td className="py-3.5 pl-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={userAvatar}
                                alt={req.fullName}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {req.fullName}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-mono">
                                  <span>{userEmpId}</span>
                                  <span>•</span>
                                  <span>{req.emailOrPhone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Outlet Name & Code */}
                          <td className="py-3.5">
                            <div className={`font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                              {userOutletName}
                            </div>
                            <div className="mt-0.5 inline-block px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold">
                              {userOutletCode}
                            </div>
                          </td>

                          {/* 3. Request Date & Time */}
                          <td className="py-3.5">
                            <div className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                              <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{formattedDate}</span>
                            </div>
                            {formattedTime && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{formattedTime}</span>
                              </div>
                            )}
                          </td>

                          {/* 4. Reason / User Note */}
                          <td className="py-3.5 max-w-xs text-slate-400 text-xs">
                            <span className="line-clamp-2">
                              {req.userNote || 'Forgot login PIN & requested credential assistance.'}
                            </span>
                          </td>

                          {/* 5. Status Badge */}
                          <td className="py-3.5">
                            {req.status === 'PENDING' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3" /> PENDING
                              </span>
                            )}
                            {req.status === 'RESOLVED' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> RESOLVED
                              </span>
                            )}
                            {(req.status === 'CANCELLED' || req.status === 'REJECTED') && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" /> CANCELLED
                              </span>
                            )}
                          </td>

                          {/* 6. Admin Actions (Reset Credentials, Cancel, Retrieve & Reset) */}
                          <td className="py-3.5 pr-2 text-right">
                            {req.status === 'PENDING' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  id={`resolve-reset-req-btn-${req.id}`}
                                  onClick={() => handleOpenResolveModal(req)}
                                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                  <span>Reset Credentials</span>
                                </button>

                                <button
                                  id={`cancel-reset-req-btn-${req.id}`}
                                  onClick={() => handleCancelRequest(req)}
                                  title="Cancel Request"
                                  className="px-2.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/25 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            )}

                            {(req.status === 'CANCELLED' || req.status === 'REJECTED') && (
                              <button
                                id={`retrieve-reset-req-btn-${req.id}`}
                                onClick={() => handleRetrieveAndReset(req)}
                                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer active:scale-95"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Retrieve & Reset</span>
                              </button>
                            )}

                            {req.status === 'RESOLVED' && (
                              <div className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{req.resolvedAt ? `Resolved on ${new Date(req.resolvedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'Completed'}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2 bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-xs text-slate-300 dark:text-slate-600">No reset requests found</p>
                        <p className="text-[11px] mt-0.5 text-slate-400 dark:text-slate-500">
                          {resetTabFilter === 'PENDING'
                            ? 'All AFO reset requests have been processed.'
                            : resetTabFilter === 'CANCELLED'
                            ? 'No cancelled reset requests in archive.'
                            : 'No requests match your selected filter.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: REGISTER NEW AFO OFFICER                        */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-2xl rounded-[28px] shadow-2xl border overflow-hidden max-h-[92vh] flex flex-col ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Register New Field Officer (AFO)
                  </h3>
                  <p className="text-xs text-slate-400">Provision official credentials, 4-digit PIN, and assign outlet station.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCreateOfficer} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Photo Upload & Presets */}
              <div>
                <label className={`block text-[11px] font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Officer Profile Photo
                </label>
                <div className="flex items-center gap-4 mb-2.5">
                  <img
                    src={createFormData.avatarUrl || PRESET_AVATARS[0]}
                    alt="Officer Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => createOfficerFileRef.current?.click()}
                      className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer text-[11px] ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Photo</span>
                    </button>
                    <input
                      ref={createOfficerFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'CREATE')}
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Select from library presets below or upload JPEG/PNG</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCreateFormData((prev) => ({ ...prev, avatarUrl: url }))}
                      className={`relative rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${
                        createFormData.avatarUrl === url ? 'ring-2 ring-emerald-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      {createFormData.avatarUrl === url && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariqul Islam"
                    value={createFormData.fullName}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={createFormData.employeeId}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, employeeId: e.target.value.toUpperCase() }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-emerald-400 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Login Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tariqul.afo"
                    value={createFormData.username}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>4-Digit PIN / Password *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="1234"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, password: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold tracking-widest focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-emerald-400 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Contact & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="01711-XXXXXX"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Official Gmail / Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="officer@bracbank.com"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Assigned Outlet */}
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Assigned BRAC Bank Outlet (Type or choose) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="create-outlet-suggestions"
                    placeholder="Type outlet name, district or code (e.g. Satkhira Branch, Dhaka)..."
                    value={createFormData.outletName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = outlets.find(
                        (o) =>
                          `${o.name} (${o.district}) - ${o.code}`.toLowerCase() === val.toLowerCase() ||
                          o.name.toLowerCase() === val.toLowerCase() ||
                          o.code.toLowerCase() === val.toLowerCase() ||
                          o.id === val
                      );
                      setCreateFormData((prev) => ({
                        ...prev,
                        outletName: val,
                        outletId: matched ? matched.id : prev.outletId
                      }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                    }`}
                  />
                  <datalist id="create-outlet-suggestions">
                    {outlets.map((o) => (
                      <option key={o.id} value={`${o.name} (${o.district}) - ${o.code}`}>
                        {o.address} • Manager: {o.managerName || 'Operations'}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Blood Group & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Blood Group</label>
                  <select
                    value={createFormData.bloodGroup}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none cursor-pointer ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Emergency Contact Phone</label>
                  <input
                    type="text"
                    placeholder="01811-XXXXXX"
                    value={createFormData.emergencyPhone}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`p-4 border-t flex items-center justify-end gap-2 pt-4 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  Register Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DIRECT ADMIN EDIT OFFICER PROFILE               */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-2xl rounded-[28px] shadow-2xl border overflow-hidden max-h-[92vh] flex flex-col ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-100 text-slate-900'
          }`}>
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Edit Officer Profile & Security
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifying profile for: <strong>{editingUser.fullName}</strong> ({editingUser.employeeId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUserEdit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Photo Upload & Presets */}
              <div>
                <label className={`block text-[11px] font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Officer Profile Photo
                </label>
                <div className="flex items-center gap-4 mb-2.5">
                  <img
                    src={editFormData.avatarUrl || PRESET_AVATARS[0]}
                    alt="Avatar Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => adminEditFileRef.current?.click()}
                      className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer text-[11px] ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Photo</span>
                    </button>
                    <input
                      ref={adminEditFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'EDIT')}
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Select from library presets below or upload JPEG/PNG</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditFormData((prev) => ({ ...prev, avatarUrl: url }))}
                      className={`relative rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${
                        editFormData.avatarUrl === url ? 'ring-2 ring-emerald-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      {editFormData.avatarUrl === url && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Designation</label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, designation: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Username & 4-Digit Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Login Username *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.username}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>4-Digit Password / PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    inputMode="numeric"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, password: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                    placeholder="4 digits"
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold tracking-widest focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-emerald-400 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Gmail / Email *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Assigned Outlet with Quick Switch to Outlet Edit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Assigned BRAC Bank Outlet (Type or choose) *
                  </label>
                  {editFormData.outletId && (
                    <button
                      type="button"
                      onClick={() => navigateToOutlet(editFormData.outletId, 'EDIT')}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jump to Edit Stationed Outlet</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="edit-outlet-suggestions"
                    placeholder="Type outlet name, district or code..."
                    value={editFormData.outletName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = outlets.find(
                        (o) =>
                          `${o.name} (${o.district}) - ${o.code}`.toLowerCase() === val.toLowerCase() ||
                          o.name.toLowerCase() === val.toLowerCase() ||
                          o.code.toLowerCase() === val.toLowerCase() ||
                          o.id === val
                      );
                      setEditFormData((prev) => ({
                        ...prev,
                        outletName: val,
                        outletId: matched ? matched.id : prev.outletId
                      }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                    }`}
                  />
                  <datalist id="edit-outlet-suggestions">
                    {outlets.map((o) => (
                      <option key={o.id} value={`${o.name} (${o.district}) - ${o.code}`}>
                        {o.address} • Manager: {o.managerName || 'Operations'}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Blood Group & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Blood Group</label>
                  <select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none cursor-pointer ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Emergency Phone</label>
                  <input
                    type="text"
                    value={editFormData.emergencyPhone}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`p-4 border-t flex items-center justify-end gap-2 pt-4 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Officer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RESOLVE / REJECT RESET REQUEST MODAL            */}
      {/* ======================================================== */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-xl rounded-[28px] shadow-2xl border overflow-hidden max-h-[92vh] flex flex-col ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-100 text-slate-900'
          }`}>
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Process Password Reset Request #{selectedRequest.id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Requested by: <strong>{selectedRequest.fullName}</strong> ({selectedRequest.outletName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitResolution} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* User Note Box */}
              <div className={`p-3.5 rounded-2xl border space-y-1 ${
                isDark
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-900'
              }`}>
                <span className="font-bold text-[11px] block">Officer Note / Reason:</span>
                <p className="text-xs italic leading-relaxed">
                  "{selectedRequest.userNote || 'Officer forgot 4-digit PIN and login username.'}"
                </p>
                <div className={`text-[10px] pt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Contact: <span className="font-mono font-bold">{selectedRequest.emailOrPhone}</span> | Outlet Code: <span className="font-mono font-bold">{selectedRequest.outletCode || 'BBL-OUT-101'}</span>
                </div>
              </div>

              {/* Mode Toggle: Approve/Resolve vs Reject */}
              <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    !isRejecting
                      ? 'bg-emerald-600 text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Approve & Reset Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setIsRejecting(true)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    isRejecting
                      ? 'bg-rose-600 text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Reject Request
                </button>
              </div>

              {!isRejecting ? (
                <>
                  {/* 1. Set Officer Profile Photo */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      1. Officer Profile Photo
                    </label>
                    <div className="flex items-center gap-3.5 mb-2.5">
                      <img
                        src={resolveAvatarUrl || PRESET_AVATARS[0]}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer text-[11px] ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 'RESOLVE')}
                          className="hidden"
                        />
                        <p className="text-[10px] text-slate-400">Select preset or upload an image</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setResolveAvatarUrl(url)}
                          className={`relative rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${
                            resolveAvatarUrl === url ? 'ring-2 ring-emerald-500 scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="preset" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                          {resolveAvatarUrl === url && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Set Login Username */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      2. New Login Username
                    </label>
                    <input
                      type="text"
                      required
                      value={resolveUsername}
                      onChange={(e) => setResolveUsername(e.target.value.toLowerCase())}
                      className={`w-full px-3 py-2 rounded-xl border font-mono font-medium focus:outline-none ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>

                  {/* 3. Set 4-Digit Password / PIN */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      3. New 4-Digit Security PIN
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      inputMode="numeric"
                      value={resolvePassword}
                      onChange={(e) => setResolvePassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="4 numeric digits"
                      className={`w-full px-3 py-2 rounded-xl border font-mono font-bold tracking-widest text-base focus:outline-none ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-700 text-emerald-400 focus:border-emerald-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>

                  {/* Admin Note */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      4. Admin Resolution Note
                    </label>
                    <input
                      type="text"
                      value={resolveAdminNote}
                      onChange={(e) => setResolveAdminNote(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-700 text-white focus:border-emerald-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                      }`}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Identity cannot be verified. Please contact branch supervisor directly."
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-rose-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-rose-400'
                    }`}
                  />
                </div>
              )}

              {/* Actions */}
              <div className={`p-4 border-t flex items-center justify-end gap-2 pt-4 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-full font-bold text-white cursor-pointer shadow-xs ${
                    isRejecting ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {isRejecting ? 'Confirm Rejection' : 'Save & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: AFO OFFICER DETAILS, SEND NOTE & NOTIFICATION HISTORY */}
      {/* ======================================================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-3xl rounded-[28px] shadow-2xl border overflow-hidden max-h-[94vh] flex flex-col ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-100 text-slate-900'
          }`}>
            {/* Header with Officer Identity & Tab Selector */}
            <div className={`p-4 sm:p-5 border-b ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
            }`}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={selectedUser.avatarUrl || PRESET_AVATARS[0]}
                      alt={selectedUser.fullName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                      isDark ? 'border-slate-900' : 'border-white'
                    } ${
                      selectedUser.status === 'SUSPENDED'
                        ? 'bg-rose-500'
                        : isAfoOnline(selectedUser)
                          ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-400/50'
                          : 'bg-slate-400'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-base font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedUser.fullName}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold font-mono tracking-wider">
                        {selectedUser.employeeId || 'BBL-AFO'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        selectedUser.status === 'SUSPENDED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isAfoOnline(selectedUser)
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {selectedUser.status === 'SUSPENDED'
                          ? 'SUSPENDED'
                          : isAfoOnline(selectedUser)
                            ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                                <span>ONLINE NOW</span>
                              </>
                            )
                            : 'OFFLINE'
                        }
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {selectedUser.designation || 'Assistant Field Officer (AFO)'} • {selectedUser.outletName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Top Corner Notification History Button with Live Badge */}
                  <button
                    id="top-corner-notif-history-btn"
                    onClick={() => setDossierTab('NOTE_HISTORY')}
                    title="View Sent Notification Notes History"
                    className={`relative p-2 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      dossierTab === 'NOTE_HISTORY'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : isDark
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border-slate-700'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    {officerDispatchedNotes.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                        {officerDispatchedNotes.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setIsReassigningOutlet(false);
                      setNoteSuccessMsg(null);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-2xs cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                        : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View Selector Tabs (3 Standard Tabs) */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/80 overflow-x-auto">
                <button
                  id="tab-afo-dossier"
                  onClick={() => setDossierTab('DOSSIER')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    dossierTab === 'DOSSIER'
                      ? isDark
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Officer Profile & Dossier</span>
                </button>

                <button
                  id="tab-afo-send-note"
                  onClick={() => setDossierTab('SEND_NOTE')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    dossierTab === 'SEND_NOTE'
                      ? isDark
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-700 text-white shadow-sm'
                      : isDark
                        ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30'
                        : 'text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-300'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Note</span>
                </button>

                <button
                  id="tab-afo-note-history"
                  onClick={() => setDossierTab('NOTE_HISTORY')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    dossierTab === 'NOTE_HISTORY'
                      ? isDark
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Sent Notes History</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    dossierTab === 'NOTE_HISTORY'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {officerDispatchedNotes.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Success Alert Banner */}
            {noteSuccessMsg && (
              <div className="px-6 py-3 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{noteSuccessMsg}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {dossierTab === 'DOSSIER' && (
                /* ======================== DOSSIER TAB (CATEGORIZED DETAILS) ======================== */
                <div className="space-y-5 animate-fadeIn">
                  {/* 1. Identity & Station Credentials */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-100 shadow-2xs'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                      <span className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Identity & Station Credentials
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Reg: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Staff'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Username</span>
                        <span className={`font-mono font-bold text-xs ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                          @{selectedUser.username || 'n/a'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Station PIN</span>
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 tracking-widest">
                          {selectedUser.password || '1234'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Employee ID</span>
                        <span className={`font-mono font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {selectedUser.employeeId || 'BBL-AFO-001'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Service Experience</span>
                        <span className={`font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {selectedUser.yearsOfService || 1} Year(s) Field Duty
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Contact & Communication */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-100 shadow-2xs'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                      <span className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                        <PhoneCall className="w-4 h-4 text-emerald-500" /> Contact & Communication Details
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Phone</span>
                          <span className={`font-mono font-bold text-xs truncate block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {selectedUser.phone || '01711-000000'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Gmail</span>
                          <span className={`font-semibold text-xs truncate block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {selectedUser.email || 'officer@bracbank.com'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-rose-500/15 text-rose-500 shrink-0">
                          <HeartPulse className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.2 rounded-md bg-rose-500 text-white font-extrabold text-[11px]">
                              {selectedUser.bloodGroup || 'B+'}
                            </span>
                            <span className="text-[11px] text-slate-400">Emergency</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Contact Phone</span>
                          <span className={`font-mono font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {selectedUser.emergencyPhone || '01811-000000'}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                          24/7 Verified
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Active Session</span>
                          <span className={`font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Active recently'}
                          </span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Outlet Station & Supervision */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-100 shadow-2xs'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                      <span className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                        <Building2 className="w-4 h-4 text-emerald-500" /> Outlet Assignment & Supervision
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            navigateToOutlet(selectedUser.outletId, 'DETAILS');
                          }}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Jump to Outlet Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        {!isReassigningOutlet && (
                          <button
                            onClick={() => {
                              setIsReassigningOutlet(true);
                              setTargetOutletId(selectedUser.outletId);
                            }}
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                              isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-[#18181B] hover:bg-black text-white'
                            }`}
                          >
                            Reassign Outlet
                          </button>
                        )}
                      </div>
                    </div>

                    {isReassigningOutlet ? (
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              list="reassign-outlet-suggestions"
                              placeholder="Type or select new outlet..."
                              value={targetOutletName}
                              onChange={(e) => {
                                const val = e.target.value;
                                const matched = outlets.find(
                                  (o) =>
                                    `${o.name} (${o.district}) - ${o.code}`.toLowerCase() === val.toLowerCase() ||
                                    o.name.toLowerCase() === val.toLowerCase() ||
                                    o.code.toLowerCase() === val.toLowerCase() ||
                                    o.id === val
                                );
                                setTargetOutletName(val);
                                if (matched) {
                                  setTargetOutletId(matched.id);
                                }
                              }}
                              className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                                isDark
                                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                              }`}
                            />
                            <datalist id="reassign-outlet-suggestions">
                              {outlets.map((o) => (
                                <option key={o.id} value={`${o.name} (${o.district}) - ${o.code}`}>
                                  {o.address} • Manager: {o.managerName || 'Operations'}
                                </option>
                              ))}
                            </datalist>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={handleReassignOutlet}
                              className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Transfer Now
                            </button>
                            <button
                              onClick={() => setIsReassigningOutlet(false)}
                              className={`px-3 py-2 rounded-full text-xs cursor-pointer ${
                                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        {/* Transfer Governance Options */}
                        <div className={`p-3 rounded-xl border space-y-2 ${
                          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold select-none">
                            <input
                              type="checkbox"
                              checked={transferRevokeAccess}
                              onChange={(e) => setTransferRevokeAccess(e.target.checked)}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              Revoke and restrict access to previous outlet records & node operations
                            </span>
                          </label>

                          <div>
                            <input
                              type="text"
                              value={transferNoteInput}
                              onChange={(e) => setTransferNoteInput(e.target.value)}
                              placeholder="Transfer Memo (optional, e.g. Operational rotation order #942)..."
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-[11px] focus:outline-none ${
                                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Outlet Station</span>
                          <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {selectedUser.outletName}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {selectedUser.outletLocation || 'Branch Location'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Reporting Supervisor</span>
                          <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {selectedUser.supervisor || 'Head of Branch Operations'}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Regional Branch Coordination Unit
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Remarks & Station Bio */}
                  {selectedUser.bio && (
                    <div className={`p-4 rounded-2xl border space-y-2 ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-100 shadow-2xs'
                    }`}>
                      <span className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                        <FileText className="w-4 h-4 text-emerald-500" /> Officer Remarks & Station Bio
                      </span>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedUser.bio}
                      </p>
                    </div>
                  )}

                  {/* 5. Submitted Work Activity Summary */}
                  <div>
                    <h4 className={`font-bold uppercase tracking-wider text-[11px] mb-2 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                      Submitted Work Activity ({userSubmissions.length} records)
                    </h4>
                    <div className={`border rounded-2xl overflow-hidden max-h-48 overflow-y-auto ${
                      isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'
                    }`}>
                      {userSubmissions.length > 0 ? (
                        <table className="w-full text-left text-xs">
                          <thead className={`sticky top-0 ${
                            isDark ? 'bg-slate-900 text-slate-400' : 'bg-[#F8FAFC] text-slate-500'
                          }`}>
                            <tr>
                              <th className="p-2.5">Tracking No</th>
                              <th className="p-2.5">Customer</th>
                              <th className="p-2.5">Status</th>
                              <th className="p-2.5">Date</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                            {userSubmissions.map((sub, idx) => (
                              <tr key={`${sub.id}-${idx}`}>
                                <td className={`p-2.5 font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>{sub.trackingNo}</td>
                                <td className="p-2.5 font-medium">{sub.customerName}</td>
                                <td className="p-2.5 text-emerald-400 font-semibold">{sub.status.replace(/_/g, ' ')}</td>
                                <td className="p-2.5 text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-6 text-center text-slate-400">
                          No field data entries submitted yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {dossierTab === 'SEND_NOTE' && (
                /* ======================== SEND DIRECT NOTE TAB (STREAMLINED) ======================== */
                <div className="space-y-5 animate-fadeIn">
                  {/* Target Officer Delivery Badge */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-200/80'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Compose Direct Note for {selectedUser.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Delivers immediately to {selectedUser.fullName}'s User Portal notification bar ({selectedUser.username || selectedUser.email}).
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      LIVE DIRECT CHANNEL
                    </span>
                  </div>

                  {/* Clean Direct Note Form */}
                  <form onSubmit={handleSendDirectNoteToOfficer} className="space-y-4">
                    {/* Note Title */}
                    <div>
                      <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Note / Notification Subject <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="e.g. Clearance Directive: Process Pending Cheque Books"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                        }`}
                      />
                    </div>

                    {/* Note Type & Priority Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Notification Category
                        </label>
                        <select
                          value={noteType}
                          onChange={(e) => setNoteType(e.target.value as any)}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                            isDark
                              ? 'bg-slate-950/80 border-slate-700 text-slate-200 focus:border-emerald-500'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="ADMIN_NOTE">📝 Official Administrative Note</option>
                          <option value="ALERT">🚨 Operational Alert</option>
                          <option value="INFO">ℹ️ General Information</option>
                          <option value="APPROVAL">✅ Approval / Verification Notice</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Priority Level
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setNotePriority(p)}
                              className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                                notePriority === p
                                  ? p === 'HIGH'
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                                    : p === 'MEDIUM'
                                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                      : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : isDark
                                    ? 'bg-slate-950/40 text-slate-400 border-slate-800 hover:bg-slate-800'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Note Message Body */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Detailed Instructions / Message Body <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {noteMessage.length} characters
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        required
                        value={noteMessage}
                        onChange={(e) => setNoteMessage(e.target.value)}
                        placeholder={`Write clear administrative instructions, operational memo, or notes for ${selectedUser.fullName}...`}
                        className={`w-full p-3 rounded-xl border text-xs font-normal focus:outline-none transition-colors leading-relaxed ${
                          isDark
                            ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                        }`}
                      />
                    </div>

                    {/* Extra Delivery Options */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="send-as-mail-checkbox"
                        checked={sendAsMailAlso}
                        onChange={(e) => setSendAsMailAlso(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label
                        htmlFor="send-as-mail-checkbox"
                        className={`text-xs select-none cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        Also deliver duplicate copy to officer's <strong>Station Mailbox (Inbox)</strong>
                      </label>
                    </div>

                    {/* Send Button - High Contrast & Minimalist */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSendingNote || !noteTitle.trim() || !noteMessage.trim()}
                        id="submit-afo-note-btn"
                        className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99] disabled:opacity-50 ${
                          isDark
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-900 hover:bg-black text-white'
                        }`}
                      >
                        {isSendingNote ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                            <span>Dispatching Note to Officer Portal...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Note to {selectedUser.fullName}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {dossierTab === 'NOTE_HISTORY' && (
                /* ======================== SENT NOTES HISTORY & READ/VIEW STATUS TAB ======================== */
                <div className="space-y-4 animate-fadeIn">
                  {/* Top Stats Summary Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Notes Sent</span>
                      <span className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {officerDispatchedNotes.length}
                      </span>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-emerald-50/50 border-emerald-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Read & Viewed</span>
                      <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {officerDispatchedNotes.filter(n => n.isRead).length}
                      </span>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-amber-50/50 border-amber-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Pending Officer View</span>
                      <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                        {officerDispatchedNotes.filter(n => !n.isRead).length}
                      </span>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setHistoryFilter('ALL')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          historyFilter === 'ALL'
                            ? isDark ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                            : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        All ({officerDispatchedNotes.length})
                      </button>

                      <button
                        onClick={() => setHistoryFilter('READ')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          historyFilter === 'READ'
                            ? 'bg-emerald-600 text-white'
                            : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Read / Viewed ({officerDispatchedNotes.filter(n => n.isRead).length})
                      </button>

                      <button
                        onClick={() => setHistoryFilter('UNREAD')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          historyFilter === 'UNREAD'
                            ? 'bg-amber-500 text-white'
                            : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Unread / Pending ({officerDispatchedNotes.filter(n => !n.isRead).length})
                      </button>
                    </div>

                    <button
                      onClick={() => setDossierTab('SEND_NOTE')}
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-black text-white'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>Compose New Note</span>
                    </button>
                  </div>

                  {/* Notes Feed */}
                  <div className="space-y-3 pt-1">
                    {officerDispatchedNotes
                      .filter(n => {
                        if (historyFilter === 'READ') return n.isRead;
                        if (historyFilter === 'UNREAD') return !n.isRead;
                        return true;
                      })
                      .map((notif) => {
                        const noteDate = notif.timestamp || (notif as any).createdAt;
                        let formattedDate = 'Recent';
                        try {
                          if (noteDate) {
                            formattedDate = new Date(noteDate).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          }
                        } catch {
                          formattedDate = 'Recent';
                        }

                        return (
                          <div
                            key={notif.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isDark
                                ? notif.isRead
                                  ? 'bg-slate-950/60 border-slate-800'
                                  : 'bg-slate-950/90 border-amber-500/30'
                                : notif.isRead
                                  ? 'bg-white border-slate-200'
                                  : 'bg-amber-50/40 border-amber-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {notif.title}
                                  </h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    notif.priority === 'HIGH'
                                      ? 'bg-rose-500 text-white'
                                      : notif.priority === 'MEDIUM'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-emerald-600 text-white'
                                  }`}>
                                    {notif.priority} PRIORITY
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {notif.type === 'ADMIN_NOTE' ? '📝 Admin Note' : notif.type === 'ALERT' ? '🚨 Alert' : notif.type === 'APPROVAL' ? '✅ Approval' : 'ℹ️ Info'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Dispatched: {formattedDate}</span>
                                </div>
                              </div>

                              {/* READ / VIEW STATUS BADGE */}
                              <div className="shrink-0 text-right">
                                {notif.isRead ? (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 font-bold text-[11px]">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Read / Viewed</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Unread (Pending View)</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {notif.message}
                            </p>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Delivered to: <strong>{selectedUser.fullName}</strong> ({selectedUser.outletName})</span>
                              <span>{notif.isRead ? '✓ Acknowledged in User Portal' : '⏳ Awaiting officer login/view'}</span>
                            </div>
                          </div>
                        );
                      })}

                    {officerDispatchedNotes.length === 0 && (
                      <div className={`p-8 text-center rounded-2xl border ${
                        isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <Inbox className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                        <div className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          No notes have been sent to {selectedUser.fullName} yet
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                          When you dispatch administrative notes or alerts from the "Send Direct Note" tab, they will be logged here with live read/view tracking.
                        </p>
                        <button
                          onClick={() => setDossierTab('SEND_NOTE')}
                          className="mt-3 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Compose First Note Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t flex items-center justify-between flex-wrap gap-2 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                {selectedUser.status === 'ACTIVE' ? (
                  <button
                    onClick={() => updateUserStatus(selectedUser.id, 'SUSPENDED')}
                    className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer"
                  >
                    Suspend Access
                  </button>
                ) : (
                  <button
                    onClick={() => updateUserStatus(selectedUser.id, 'ACTIVE')}
                    className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                  >
                    Reactivate Access
                  </button>
                )}

                <button
                  onClick={() => {
                    const u = selectedUser;
                    setSelectedUser(null);
                    handleOpenEditUser(u);
                  }}
                  className={`px-3.5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Officer Details & PIN</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {dossierTab === 'DOSSIER' ? (
                  <button
                    onClick={() => setDossierTab('SEND_NOTE')}
                    className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${
                      isDark
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-900 hover:bg-black text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Note to Officer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setDossierTab('DOSSIER')}
                    className={`px-3.5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                      isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Back to Officer Profile</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setNoteSuccessMsg(null);
                  }}
                  className={`px-4 py-2 rounded-full font-semibold text-xs cursor-pointer ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: NOTE SENT CONFIRMATION POPUP (REDIRECT TO PROFILE) */}
      {/* ======================================================== */}
      {noteSentModalOpen && lastSentNoteInfo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md rounded-[28px] shadow-2xl border p-6 text-center space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Note Dispatched Successfully!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Direct notification & alert successfully delivered to <strong>{lastSentNoteInfo.recipientName}</strong>'s User Portal notification bar.
              </p>
            </div>

            {/* Note Summary Card */}
            <div className={`p-3.5 rounded-2xl border text-left text-xs space-y-1.5 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Subject</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  lastSentNoteInfo.priority === 'HIGH'
                    ? 'bg-rose-500 text-white'
                    : lastSentNoteInfo.priority === 'MEDIUM'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                }`}>
                  {lastSentNoteInfo.priority} PRIORITY
                </span>
              </div>
              <div className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {lastSentNoteInfo.title}
              </div>
              <div className="text-[11px] text-slate-400">
                Recipient: <strong>{lastSentNoteInfo.recipientName}</strong> ({lastSentNoteInfo.outletName})
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                id="confirm-note-sent-back-btn"
                onClick={() => {
                  setNoteSentModalOpen(false);
                  setDossierTab('DOSSIER');
                }}
                className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
              >
                OK — View Officer Profile
              </button>

              <button
                onClick={() => {
                  setNoteSentModalOpen(false);
                  setDossierTab('NOTE_HISTORY');
                }}
                className={`px-4 py-2.5 rounded-full font-bold text-xs cursor-pointer transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                View History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
