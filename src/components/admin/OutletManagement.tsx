import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Phone,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowLeft,
  Eye,
  CreditCard,
  Landmark,
  FileCheck,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Camera,
  Trash2,
  Clock,
  Calendar,
  Layers,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Archive,
  ArrowRightLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { BRACBankOutlet, UserProfile } from '../../types';

const PRESET_OUTLET_IMAGES = [
  'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&auto=format&fit=crop&q=80',
];

const DIVISIONS = ['ALL', 'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

export const OutletManagement: React.FC = () => {
  const {
    outlets,
    deletedOutlets,
    users,
    submissions,
    chequeCardEntries,
    loanRecords,
    updateOutlet,
    deleteOutlet,
    suspendOutlet,
    reactivateOutlet,
    restoreDeletedOutlet,
    permanentlyPurgeDeletedOutlet,
    transferAfoToOutlet,
    addOutlet,
    toggleOutletStatus,
    userPreferences,
    selectedOutletIdForNav,
    setSelectedOutletIdForNav,
    outletSubView,
    setOutletSubView,
    navigateToAfo,
    navigateToTransfer
  } = useApp();

  const isDark = userPreferences.theme === 'dark';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'AFOS' | 'OPERATIONS'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Deletion & Suspension Confirmation Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReasonInput, setSuspendReasonInput] = useState('');

  // AFO Shift / Transfer Modal
  const [transferOfficerModal, setTransferOfficerModal] = useState<{
    isOpen: boolean;
    officer: UserProfile | null;
    destinationOutletId: string;
    revokePreviousAccess: boolean;
    transferNote: string;
  }>({
    isOpen: false,
    officer: null,
    destinationOutletId: '',
    revokePreviousAccess: true,
    transferNote: 'Administrative station reassignment & operational deployment'
  });

  // New Outlet Form State
  const [newOutletForm, setNewOutletForm] = useState({
    name: '',
    code: '',
    zone: 'Dhaka Central',
    district: 'Dhaka',
    division: 'Dhaka',
    managerName: '',
    contactNumber: '',
    address: '',
    imageUrl: PRESET_OUTLET_IMAGES[0],
    operatingHours: '9:00 AM - 5:00 PM (Sun-Thu)',
    establishedYear: '2021',
    notes: ''
  });

  // Edit Outlet Form State
  const [editFormData, setEditFormData] = useState<Partial<BRACBankOutlet>>({});

  // Active Outlet under inspection (for DETAILS and EDIT)
  const activeOutlet = useMemo(() => {
    if (!selectedOutletIdForNav) return outlets[0] || null;
    return outlets.find((o) => o.id === selectedOutletIdForNav) || outlets[0] || null;
  }, [outlets, selectedOutletIdForNav]);

  // Handle opening details
  const handleOpenDetails = (outlet: BRACBankOutlet) => {
    setSelectedOutletIdForNav(outlet.id);
    setOutletSubView('DETAILS');
  };

  // Handle opening edit
  const handleOpenEdit = (outlet: BRACBankOutlet) => {
    setSelectedOutletIdForNav(outlet.id);
    setEditFormData({
      name: outlet.name,
      code: outlet.code,
      zone: outlet.zone,
      district: outlet.district,
      division: outlet.division,
      managerName: outlet.managerName,
      contactNumber: outlet.contactNumber,
      address: outlet.address,
      imageUrl: outlet.imageUrl || PRESET_OUTLET_IMAGES[0],
      operatingHours: outlet.operatingHours || '9:00 AM - 5:00 PM (Sun-Thu)',
      establishedYear: outlet.establishedYear || '2021',
      notes: outlet.notes || '',
      isActive: outlet.isActive
    });
    setOutletSubView('EDIT');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOutlet) return;
    updateOutlet(activeOutlet.id, editFormData);
    setOutletSubView('DETAILS');
  };

  // Create New Outlet
  const handleCreateOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutletForm.name || !newOutletForm.code) return;

    addOutlet({
      name: newOutletForm.name.trim(),
      code: newOutletForm.code.trim().toUpperCase(),
      zone: newOutletForm.zone.trim(),
      district: newOutletForm.district.trim(),
      division: newOutletForm.division.trim(),
      managerName: newOutletForm.managerName.trim() || 'Assigned Branch Manager',
      contactNumber: newOutletForm.contactNumber.trim() || '+880 1700-000000',
      address: newOutletForm.address.trim() || 'BRAC Bank Branch Premise',
      isActive: true,
      imageUrl: newOutletForm.imageUrl || PRESET_OUTLET_IMAGES[0],
      operatingHours: newOutletForm.operatingHours,
      establishedYear: newOutletForm.establishedYear,
      notes: newOutletForm.notes
    });

    setIsAddModalOpen(false);
    setNewOutletForm({
      name: '',
      code: '',
      zone: 'Dhaka Central',
      district: 'Dhaka',
      division: 'Dhaka',
      managerName: '',
      contactNumber: '',
      address: '',
      imageUrl: PRESET_OUTLET_IMAGES[0],
      operatingHours: '9:00 AM - 5:00 PM (Sun-Thu)',
      establishedYear: '2021',
      notes: ''
    });
  };

  // Filter active/suspended outlets
  const filteredOutlets = useMemo(() => {
    return outlets.filter((o) => {
      const searchLower = searchTerm.toLowerCase();
      // Search matches name, code, district, division, address, manager, or assigned AFOs
      const matchesSearch =
        !searchTerm ||
        o.name.toLowerCase().includes(searchLower) ||
        o.code.toLowerCase().includes(searchLower) ||
        o.district.toLowerCase().includes(searchLower) ||
        o.division.toLowerCase().includes(searchLower) ||
        o.address.toLowerCase().includes(searchLower) ||
        o.managerName.toLowerCase().includes(searchLower) ||
        users.some((u) => u.outletId === o.id && u.fullName.toLowerCase().includes(searchLower));

      const matchesDivision = selectedDivision === 'ALL' || o.division === selectedDivision;
      
      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchesStatus = o.isActive && !o.isSuspended && o.status !== 'SUSPENDED';
      } else if (statusFilter === 'SUSPENDED') {
        matchesStatus = o.isSuspended || o.status === 'SUSPENDED';
      } else if (statusFilter === 'AFOS') {
        matchesStatus = users.some((u) => u.outletId === o.id);
      } else if (statusFilter === 'OPERATIONS') {
        matchesStatus = true;
      }

      return matchesSearch && matchesDivision && matchesStatus;
    });
  }, [outlets, searchTerm, selectedDivision, statusFilter, users]);

  // Filter deleted outlets archive
  const filteredDeletedOutlets = useMemo(() => {
    return (deletedOutlets || []).filter((o) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        o.name.toLowerCase().includes(searchLower) ||
        o.code.toLowerCase().includes(searchLower) ||
        o.district.toLowerCase().includes(searchLower) ||
        o.division.toLowerCase().includes(searchLower) ||
        (o.deletionReason && o.deletionReason.toLowerCase().includes(searchLower)) ||
        o.managerName.toLowerCase().includes(searchLower);

      const matchesDivision = selectedDivision === 'ALL' || o.division === selectedDivision;
      return matchesSearch && matchesDivision;
    });
  }, [deletedOutlets, searchTerm, selectedDivision]);

  // Calculate AFOs and Data input stats for an outlet
  const getOutletStats = (outletId: string) => {
    const assignedOfficers = users.filter((u) => u.outletId === outletId);
    const outletSubmissions = submissions.filter((s) => s.outletId === outletId);
    const cheques = chequeCardEntries.filter((c) => c.outletId === outletId && c.type === 'CHEQUE');
    const cards = chequeCardEntries.filter((c) => c.outletId === outletId && c.type === 'CARD');
    const loans = loanRecords.filter((l) => l.outletId === outletId);

    const totalVolume = cheques.length + cards.length + loans.length + outletSubmissions.length;
    const deliveredCount = chequeCardEntries.filter((c) => c.outletId === outletId && c.status === 'DELIVERED').length;
    const pendingCount = chequeCardEntries.filter((c) => c.outletId === outletId && (c.status === 'PENDING' || c.status === 'IN_BRANCH')).length;

    return {
      assignedOfficers,
      assignedOfficersCount: assignedOfficers.length,
      outletSubmissions,
      chequesCount: cheques.length,
      cardsCount: cards.length,
      loansCount: loans.length,
      totalVolume,
      deliveredCount,
      pendingCount
    };
  };

  // ----------------------------------------------------
  // SUB-VIEW: OUTLET DETAILS (SWIPE / DETAILED SCREEN)
  // ----------------------------------------------------
  if (outletSubView === 'DETAILS' && activeOutlet) {
    const stats = getOutletStats(activeOutlet.id);
    const outletImage = activeOutlet.imageUrl || PRESET_OUTLET_IMAGES[0];

    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setOutletSubView('LIST')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500" />
            Back to Outlets Directory
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEdit(activeOutlet)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Outlet Specs
            </button>
            <button
              onClick={() => toggleOutletStatus(activeOutlet.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeOutlet.isActive
                  ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
              }`}
            >
              {activeOutlet.isActive ? 'Deactivate Node' : 'Activate Node'}
            </button>
          </div>
        </div>

        {/* Hero Outlet Card */}
        <div
          className={`rounded-2xl border overflow-hidden transition-all ${
            isDark
              ? 'bg-[#182338]/90 border-slate-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Banner Image & Overlay */}
          <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-slate-900">
            <img
              src={outletImage}
              alt={activeOutlet.name}
              className="w-full h-full object-cover object-center opacity-75 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Badges on Hero */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 shadow-md">
                {activeOutlet.code}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                activeOutlet.isActive
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
              }`}>
                {activeOutlet.isActive ? 'OPERATIONAL NODE' : 'INACTIVE NODE'}
              </span>
            </div>

            {/* Bottom Title on Hero */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                {activeOutlet.division} Division • {activeOutlet.district} District
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white mt-1 drop-shadow-md">
                {activeOutlet.name}
              </h1>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className={`p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b ${
            isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/70'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Physical Location</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2">{activeOutlet.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Branch Manager</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">{activeOutlet.managerName}</span>
                <span className="text-[11px] text-slate-500">{activeOutlet.contactNumber}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Operating Hours</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate block">
                  {activeOutlet.operatingHours || '9:00 AM - 5:00 PM'}
                </span>
                <span className="text-[11px] text-slate-500">Established: {activeOutlet.establishedYear || '2021'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AFO Officers Stationed</span>
                <span className="text-sm font-black text-slate-800 dark:text-white block">{stats.assignedOfficersCount} Officers</span>
                <span className="text-[11px] text-emerald-500 font-semibold">{stats.totalVolume} Total Entries Input</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Input & Activity Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cheque Books</span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-2">{stats.chequesCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">Logged by stationed AFOs</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Debit Cards</span>
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-2">{stats.cardsCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">Issued & Received</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Loan Files</span>
              <Landmark className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-2">{stats.loansCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">SME & Retail Accounts</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dispatched / Delivered</span>
              <FileCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-emerald-500 mt-2">{stats.deliveredCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">{stats.pendingCount} in queue / transit</p>
          </div>
        </div>

        {/* Stationed AFO Officers Section with Direct Switch / Jump to AFO Edit */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Stationed AFO Officers ({stats.assignedOfficersCount})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All field officers deployed under {activeOutlet.name}. Click any officer to jump directly to their profile or edit mode.
              </p>
            </div>
          </div>

          {stats.assignedOfficers.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-xl border-slate-300 dark:border-slate-700">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No AFO Officers currently stationed at this outlet.</p>
              <p className="text-xs text-slate-400 mt-1">Assign an officer from the AFO Directory section.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.assignedOfficers.map((officer) => (
                <div
                  key={officer.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40'
                      : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={officer.avatarUrl}
                      alt={officer.fullName}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {officer.fullName}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          officer.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {officer.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{officer.designation || 'Field Officer'}</p>
                      <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{officer.employeeId}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {officer.phone}
                      </p>
                    </div>
                  </div>

                  {/* Direct Switch / Jump & Shift Station Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateToAfo(officer.id, 'DETAILS')}
                        className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all text-center cursor-pointer"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => navigateToAfo(officer.id, 'EDIT')}
                        className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/25 border border-emerald-500/30 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit AFO
                      </button>
                    </div>

                    <button
                      onClick={() => navigateToTransfer(officer.id)}
                      className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Shift / Transfer to Another Outlet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: OUTLET EDIT SCREEN
  // ----------------------------------------------------
  if (outletSubView === 'EDIT' && activeOutlet) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setOutletSubView('DETAILS')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500" />
            Back to Outlet Details
          </button>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
            Editing Outlet: {activeOutlet.code}
          </span>
        </div>

        {/* Edit Form Card */}
        <div className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#182338] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Modify Outlet Specifications</h2>
              <p className="text-xs text-slate-500">Update branch image, official name, address, contact phone, and assigned manager.</p>
            </div>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-6">
            {/* Image Preview and Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Outlet Banner & Image
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-900">
                  <img
                    src={editFormData.imageUrl || PRESET_OUTLET_IMAGES[0]}
                    alt="Outlet preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <span className="text-xs text-slate-500 block">Choose from bank branch presets or provide a custom image URL:</span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_OUTLET_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, imageUrl: img })}
                        className={`h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          editFormData.imageUrl === img
                            ? 'border-emerald-500 scale-105 shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={editFormData.imageUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                    placeholder="Or paste custom image URL (https://...)"
                    className={`w-full text-xs px-3 py-2 rounded-xl border transition-all mt-2 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Outlet Code (e.g. BBL-OUT-101) *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.code || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all font-mono uppercase ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Division *
                </label>
                <select
                  value={editFormData.division || 'Dhaka'}
                  onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {DIVISIONS.filter((d) => d !== 'ALL').map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.district || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Branch Manager / Supervisor *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.managerName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, managerName: e.target.value })}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.contactNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Physical Address *
              </label>
              <textarea
                rows={2}
                required
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Hours & Established */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={editFormData.operatingHours || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, operatingHours: e.target.value })}
                  placeholder="e.g. 9:00 AM - 5:00 PM (Sun-Thu)"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Established Year
                </label>
                <input
                  type="text"
                  value={editFormData.establishedYear || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, establishedYear: e.target.value })}
                  placeholder="e.g. 2019"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Direct Switch to Assigned AFOs */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  Assigned AFO Officers Cross-Switch
                </span>
                <span className="text-[10px] text-slate-400">Quick jump to AFO details</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {users.filter((u) => u.outletId === activeOutlet.id).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => navigateToAfo(u.id, 'EDIT')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    Switch to edit AFO: {u.fullName}
                  </button>
                ))}
              </div>
            </div>

            {/* Administrative Operational Controls: Suspend & Delete */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    Administrative Node Controls & Lifecycle
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeOutlet.isSuspended || activeOutlet.status === 'SUSPENDED'
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    : activeOutlet.isActive
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                }`}>
                  Current Status: {activeOutlet.isSuspended || activeOutlet.status === 'SUSPENDED' ? 'SUSPENDED' : activeOutlet.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Manage operational availability. Suspend node to temporarily halt activities, or delete node to remove outlet and station records from active portal.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {/* Suspend / Reactivate Button */}
                {activeOutlet.isSuspended || activeOutlet.status === 'SUSPENDED' ? (
                  <button
                    type="button"
                    onClick={() => {
                      reactivateOutlet(activeOutlet.id);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reactivate Outlet Node
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSuspendReasonInput('Administrative temporary suspension for operational review.');
                      setShowSuspendModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Suspend Outlet
                  </button>
                )}

                {/* Delete Outlet Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Outlet from Portal
                </button>
              </div>
            </div>

            {/* Submit / Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOutletSubView('DETAILS')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Outlet Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: OUTLET LIST (MAIN DIRECTORY & LIVE SEARCH)
  // ----------------------------------------------------
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Stat Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-500 shrink-0" />
            Outlet Details & Node Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore BRAC Bank branch outlets, examine stationed AFO officers, view input volumes, and edit specs.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register New Outlet
        </button>
      </div>

      {/* Network Stats Bar - 6 Interactive Counting Value Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Outlets */}
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10'
              : isDark
              ? 'bg-[#182338] border-slate-700/80 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Outlets</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">{outlets.length}</p>
          <span className="text-[10px] text-emerald-500 font-semibold mt-0.5 block truncate">Click to view all</span>
        </button>

        {/* Active Nodes */}
        <button
          type="button"
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10'
              : isDark
              ? 'bg-[#182338] border-slate-700/80 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Nodes</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-500 mt-1">
            {outlets.filter((o) => o.isActive && !o.isSuspended && o.status !== 'SUSPENDED').length}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Live operational</span>
        </button>

        {/* Suspended Outlets */}
        <button
          type="button"
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'SUSPENDED'
              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/10'
              : isDark
              ? 'bg-[#182338] border-slate-700/80 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Suspended</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
            {outlets.filter((o) => o.isSuspended || o.status === 'SUSPENDED').length}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Halted stations</span>
        </button>

        {/* Deleted Outlets */}
        <button
          type="button"
          onClick={() => setStatusFilter('DELETED')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'DELETED'
              ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-500/10'
              : isDark
              ? 'bg-[#182338] border-slate-700/80 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Deleted</span>
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">{deletedOutlets.length}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Archive & restore</span>
        </button>

        {/* Stationed AFOs */}
        <button
          type="button"
          onClick={() => setStatusFilter('AFOS')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'AFOS'
              ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/10'
              : isDark
              ? 'bg-[#182338] border-slate-700/80 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Stationed AFOs</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">{users.length}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Active personnel</span>
        </button>

        {/* Operations Volume */}
        <button
          type="button"
          onClick={() => setStatusFilter('OPERATIONS')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'OPERATIONS'
              ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-500/10'
              : isDark
              ? 'bg-[#182338] border-slate-700/80 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Op Volume</span>
            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
            {chequeCardEntries.length + loanRecords.length}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Logged entries</span>
        </button>
      </div>

      {/* Live Search & Filter Controls */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
        isDark ? 'bg-[#182338] border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        {/* Live Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Live search by outlet name, code (e.g. BBL-OUT-101), district, manager, or AFO name..."
            className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Division & Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className={`text-xs px-3 py-2.5 rounded-xl border font-semibold transition-all ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {DIVISIONS.map((div) => (
              <option key={div} value={div}>Division: {div}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`text-xs px-3 py-2.5 rounded-xl border font-semibold transition-all ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="ALL">View: All Outlets ({outlets.length})</option>
            <option value="ACTIVE">View: Active Nodes ({outlets.filter((o) => o.isActive && !o.isSuspended).length})</option>
            <option value="SUSPENDED">View: Suspended Outlets ({outlets.filter((o) => o.isSuspended || o.status === 'SUSPENDED').length})</option>
            <option value="DELETED">View: Deleted Outlets Archive ({deletedOutlets.length})</option>
            <option value="AFOS">View: Outlets with Stationed AFOs</option>
            <option value="OPERATIONS">View: Operational Outlets</option>
          </select>
        </div>
      </div>

      {/* VIEW CONDITIONAL 1: DELETED OUTLETS ARCHIVE */}
      {statusFilter === 'DELETED' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Deleted Outlets Archive ({filteredDeletedOutlets.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Outlets removed from active portal. You can restore them to active status or purge permanently.
            </span>
          </div>

          {filteredDeletedOutlets.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${
              isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <Trash2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No deleted outlets in archive</h3>
              <p className="text-xs text-slate-400 mt-1">When an outlet is deleted from edit mode, it will appear here for archival or restoration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDeletedOutlets.map((del) => (
                <div
                  key={del.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    isDark ? 'bg-[#182338] border-rose-500/30' : 'bg-white border-rose-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                          {del.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">{del.name}</h4>
                        <p className="text-xs text-slate-400">{del.division} • {del.district}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">DELETED</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 py-2 border-t border-b border-slate-200/60 dark:border-slate-800">
                      <p><span className="font-semibold text-slate-700 dark:text-slate-300">Manager:</span> {del.managerName}</p>
                      <p><span className="font-semibold text-slate-700 dark:text-slate-300">Address:</span> {del.address}</p>
                      <p><span className="font-semibold text-slate-700 dark:text-slate-300">Deleted At:</span> {del.deletedAt ? new Date(del.deletedAt).toLocaleString() : 'Recently'}</p>
                      {del.deletionReason && (
                        <p><span className="font-semibold text-slate-700 dark:text-slate-300">Reason:</span> {del.deletionReason}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => restoreDeletedOutlet(del.id)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore Outlet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Permanently purge ${del.name} (${del.code})? This cannot be undone.`)) {
                          permanentlyPurgeDeletedOutlet(del.id);
                        }
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="Permanently remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Purge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW CONDITIONAL 2: ACTIVE & SUSPENDED OUTLETS GRID */
        filteredOutlets.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${
            isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No outlets found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search keyword or filter settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOutlets.map((outlet) => {
              const stats = getOutletStats(outlet.id);
              const outletImg = outlet.imageUrl || PRESET_OUTLET_IMAGES[0];
              const isSuspended = outlet.isSuspended || outlet.status === 'SUSPENDED';

              return (
                <div
                  key={outlet.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all group ${
                    isSuspended
                      ? isDark
                        ? 'bg-[#182338] border-amber-500/40 shadow-sm'
                        : 'bg-white border-amber-300 shadow-2xs'
                      : isDark
                      ? 'bg-[#182338] border-slate-700/80 hover:border-emerald-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                      : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Card Image Banner */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src={outletImg}
                        alt={outlet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-sm">
                          {outlet.code}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : outlet.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isSuspended ? 'SUSPENDED' : outlet.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      {/* Bottom Title on Image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          {outlet.division} • {outlet.district}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate drop-shadow-sm">
                          {outlet.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content Info */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{outlet.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{outlet.managerName}</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{outlet.contactNumber}</span>
                      </div>

                      {/* Quick Stats Badges */}
                      <div className={`p-2.5 rounded-xl grid grid-cols-3 gap-2 text-center text-[10px] ${
                        isDark ? 'bg-slate-900/60' : 'bg-slate-50'
                      }`}>
                        <div>
                          <span className="text-slate-400 block font-bold">AFOs</span>
                          <span className="font-black text-indigo-400 text-xs">{stats.assignedOfficersCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold">Cheques</span>
                          <span className="font-black text-blue-400 text-xs">{stats.chequesCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold">Cards</span>
                          <span className="font-black text-emerald-500 text-xs">{stats.cardsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className={`p-3 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'
                  }`}>
                    <button
                      onClick={() => handleOpenDetails(outlet)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    {isSuspended ? (
                      <button
                        onClick={() => reactivateOutlet(outlet.id)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1 cursor-pointer font-black"
                        title="Reactivate Outlet"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenEdit(outlet)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                        title="Edit Outlet Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* REGISTER NEW OUTLET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-xl rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#182338] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Register New BRAC Bank Outlet Node
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOutlet} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold mb-1">Outlet Name *</label>
                <input
                  type="text"
                  required
                  value={newOutletForm.name}
                  onChange={(e) => setNewOutletForm({ ...newOutletForm, name: e.target.value })}
                  placeholder="e.g. Uttara Sector 11 Sub-Branch Outlet"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Outlet Code *</label>
                  <input
                    type="text"
                    required
                    value={newOutletForm.code}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BBL-OUT-105"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-mono uppercase ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Division *</label>
                  <select
                    value={newOutletForm.division}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, division: e.target.value })}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {DIVISIONS.filter((d) => d !== 'ALL').map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={newOutletForm.district}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, district: e.target.value })}
                    placeholder="e.g. Dhaka"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Branch Manager *</label>
                  <input
                    type="text"
                    required
                    value={newOutletForm.managerName}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, managerName: e.target.value })}
                    placeholder="e.g. Tanvir Ahmed"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={newOutletForm.contactNumber}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, contactNumber: e.target.value })}
                    placeholder="e.g. +880 1711-000000"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Zone</label>
                  <input
                    type="text"
                    value={newOutletForm.zone}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, zone: e.target.value })}
                    placeholder="e.g. Dhaka North"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Physical Address *</label>
                <textarea
                  rows={2}
                  required
                  value={newOutletForm.address}
                  onChange={(e) => setNewOutletForm({ ...newOutletForm, address: e.target.value })}
                  placeholder="Full road and building address..."
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                >
                  Confirm & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND OUTLET MODAL */}
      {showSuspendModal && activeOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 ${
            isDark ? 'bg-[#182338] border-amber-500/40 text-white' : 'bg-white border-amber-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Suspend Outlet Station</h3>
                <p className="text-xs text-slate-400">{activeOutlet.name} ({activeOutlet.code})</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-400">
                Suspending this outlet will temporarily pause node activities and flag it in the system. You can reactivate it anytime.
              </p>
              <div>
                <label className="block text-xs font-bold mb-1">Reason for Suspension</label>
                <textarea
                  rows={2}
                  value={suspendReasonInput}
                  onChange={(e) => setSuspendReasonInput(e.target.value)}
                  placeholder="e.g. Branch renovation, operational audit..."
                  className={`w-full text-xs p-3 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  suspendOutlet(activeOutlet.id, suspendReasonInput);
                  setShowSuspendModal(false);
                  setOutletSubView('DETAILS');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-sm"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE OUTLET CONFIRMATION MODAL */}
      {showDeleteModal && activeOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 ${
            isDark ? 'bg-[#182338] border-rose-500/40 text-white' : 'bg-white border-rose-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-500">Delete Outlet from Portal</h3>
                <p className="text-xs text-slate-400">{activeOutlet.name} ({activeOutlet.code})</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 space-y-1">
                <p className="font-bold">⚠️ Warning: Active Portal Removal</p>
                <p>
                  Deleting this outlet will remove all outlet specifications and station records from your active portal. The outlet will be moved to the Deleted Outlets Archive.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOutlet(activeOutlet.id, true);
                  setShowDeleteModal(false);
                  setOutletSubView('LIST');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-sm"
              >
                Confirm Delete Outlet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AFO SHIFT / TRANSFER MODAL */}
      {transferOfficerModal.isOpen && transferOfficerModal.officer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border p-6 ${
            isDark ? 'bg-[#182338] border-indigo-500/40 text-white' : 'bg-white border-indigo-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Shift / Transfer AFO to Another Outlet</h3>
                  <p className="text-xs text-slate-400">{transferOfficerModal.officer.fullName} ({transferOfficerModal.officer.employeeId})</p>
                </div>
              </div>
              <button
                onClick={() => setTransferOfficerModal({ ...transferOfficerModal, isOpen: false, officer: null })}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Current Station */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Outlet Station</span>
                  <span className="font-bold text-slate-200">{transferOfficerModal.officer.outletName}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">Current</span>
              </div>

              {/* Destination Outlet Selector */}
              <div>
                <label className="block font-bold mb-1 text-slate-300">Select Destination Branch Outlet *</label>
                <select
                  value={transferOfficerModal.destinationOutletId}
                  onChange={(e) => setTransferOfficerModal({ ...transferOfficerModal, destinationOutletId: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-semibold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.district}, {o.division}) - {o.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Revoke Previous Outlet Access Option */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transferOfficerModal.revokePreviousAccess}
                    onChange={(e) => setTransferOfficerModal({ ...transferOfficerModal, revokePreviousAccess: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">
                      Lock & Restrict Access to Previous Outlet Station
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      When enabled, the officer will strictly operate under the new destination outlet and cannot submit or access data for their previous station ({transferOfficerModal.officer.outletName}).
                    </span>
                  </div>
                </label>
              </div>

              {/* Transfer Note / Directive */}
              <div>
                <label className="block font-bold mb-1 text-slate-300">Transfer Directive / Note to Officer</label>
                <textarea
                  rows={2}
                  value={transferOfficerModal.transferNote}
                  onChange={(e) => setTransferOfficerModal({ ...transferOfficerModal, transferNote: e.target.value })}
                  placeholder="Directive explaining the station transfer..."
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTransferOfficerModal({ ...transferOfficerModal, isOpen: false, officer: null })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (transferOfficerModal.officer && transferOfficerModal.destinationOutletId) {
                    transferAfoToOutlet(transferOfficerModal.officer.id, transferOfficerModal.destinationOutletId, {
                      revokePreviousOutletAccess: transferOfficerModal.revokePreviousAccess,
                      adminNote: transferOfficerModal.transferNote
                    });
                    setTransferOfficerModal({ ...transferOfficerModal, isOpen: false, officer: null });
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Confirm Transfer Officer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
