import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRightLeft,
  Search,
  Building2,
  Users,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Clock,
  Filter,
  Eye,
  FileText,
  Printer,
  Download,
  X,
  History,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
  BadgeCheck,
  ChevronRight,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, BRACBankOutlet, AfoTransferRecord } from '../../types';
import { t } from '../../utils/translations';

type TransferFlowView = 'DASHBOARD' | 'OFFICER_REVIEW' | 'SELECT_DESTINATION' | 'SUCCESS_RECEIPT';

const DIVISIONS = ['ALL', 'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

export const AfoTransferManagement: React.FC = () => {
  const {
    users,
    outlets,
    afoTransfers,
    selectedAfoForTransfer,
    setSelectedAfoForTransfer,
    transferAfoToOutlet,
    navigateToOutlet,
    navigateToAfo,
    userPreferences,
    currentAdmin,
    setActiveNavTab,
    afoTransferResetTrigger
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const currentLang = userPreferences.language || 'en';
  const langText = t[currentLang] || t.en;

  // View state
  const [currentView, setCurrentView] = useState<TransferFlowView>('DASHBOARD');
  const [selectedOfficer, setSelectedOfficer] = useState<UserProfile | null>(null);
  const [selectedTargetOutlet, setSelectedTargetOutlet] = useState<BRACBankOutlet | null>(null);
  const [revokePreviousOutletAccess, setRevokePreviousOutletAccess] = useState<boolean>(true);
  const [transferNote, setTransferNote] = useState<string>('Administrative station rotation and operational reassignment.');
  const [lastExecutedRecord, setLastExecutedRecord] = useState<AfoTransferRecord | null>(null);

  // Filters on Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('ALL');
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('ALL');
  const [transferStatusFilter, setTransferStatusFilter] = useState<'ALL' | 'TRANSFERRED' | 'SINGLE_STATION'>('ALL');
  
  // Modals
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<AfoTransferRecord | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Search on Destination Selection View
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('');
  const [destinationDivisionFilter, setDestinationDivisionFilter] = useState('ALL');

  // Listen to AFO Transfer Reset Trigger from Sidebar or Header
  useEffect(() => {
    if (afoTransferResetTrigger > 0) {
      setCurrentView('DASHBOARD');
      setSelectedOfficer(null);
      setSelectedTargetOutlet(null);
      setLastExecutedRecord(null);
      setIsHistoryModalOpen(false);
      setIsConfirmModalOpen(false);
      setSearchQuery('');
      setSelectedDivisionFilter('ALL');
      setSelectedOutletFilter('ALL');
      setTransferStatusFilter('ALL');
    }
  }, [afoTransferResetTrigger]);

  // Handle cross-navigation from other views when selectedAfoForTransfer is set
  useEffect(() => {
    if (selectedAfoForTransfer) {
      const foundOfficer = users.find((u) => u.id === selectedAfoForTransfer);
      if (foundOfficer) {
        setSelectedOfficer(foundOfficer);
        setCurrentView('OFFICER_REVIEW');
      }
      setSelectedAfoForTransfer(null);
    }
  }, [selectedAfoForTransfer, users, setSelectedAfoForTransfer]);

  // Metric Computations
  const totalTransfersCount = afoTransfers.length;
  const totalAfosCount = users.length;
  const totalActiveOutletsCount = outlets.filter((o) => o.isActive).length;
  const transferredOfficersCount = users.filter((u) => (u.transferHistory && u.transferHistory.length > 0) || (u.previousOutletIds && u.previousOutletIds.length > 0)).length;

  // Filtered AFOs for Dashboard
  const filteredOfficers = useMemo(() => {
    return users.filter((officer) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        officer.fullName.toLowerCase().includes(query) ||
        (officer.employeeId && officer.employeeId.toLowerCase().includes(query)) ||
        officer.email.toLowerCase().includes(query) ||
        officer.phone.includes(query) ||
        officer.outletName.toLowerCase().includes(query) ||
        (officer.outletCode && officer.outletCode.toLowerCase().includes(query));

      const officerOutlet = outlets.find((o) => o.id === officer.outletId);
      const matchesDivision =
        selectedDivisionFilter === 'ALL' ||
        (officerOutlet && officerOutlet.division.toLowerCase() === selectedDivisionFilter.toLowerCase());

      const matchesOutlet =
        selectedOutletFilter === 'ALL' ||
        officer.outletId === selectedOutletFilter;

      const isTransferred = (officer.transferHistory && officer.transferHistory.length > 0) || (officer.previousOutletIds && officer.previousOutletIds.length > 0);
      const matchesStatus =
        transferStatusFilter === 'ALL' ||
        (transferStatusFilter === 'TRANSFERRED' && isTransferred) ||
        (transferStatusFilter === 'SINGLE_STATION' && !isTransferred);

      return matchesSearch && matchesDivision && matchesOutlet && matchesStatus;
    });
  }, [users, outlets, searchQuery, selectedDivisionFilter, selectedOutletFilter, transferStatusFilter]);

  // Filtered Outlets for Destination Selection
  const filteredDestinationOutlets = useMemo(() => {
    if (!selectedOfficer) return outlets;
    return outlets.filter((outlet) => {
      // Allow searching
      const q = destinationSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        outlet.name.toLowerCase().includes(q) ||
        outlet.code.toLowerCase().includes(q) ||
        outlet.district.toLowerCase().includes(q) ||
        outlet.division.toLowerCase().includes(q) ||
        outlet.managerName.toLowerCase().includes(q) ||
        outlet.address.toLowerCase().includes(q);

      const matchesDivision =
        destinationDivisionFilter === 'ALL' ||
        outlet.division.toLowerCase() === destinationDivisionFilter.toLowerCase();

      return matchesSearch && matchesDivision;
    });
  }, [outlets, selectedOfficer, destinationSearchQuery, destinationDivisionFilter]);

  // Filtered Transfer History Records for Modal
  const filteredHistoryRecords = useMemo(() => {
    return afoTransfers.filter((rec) => {
      const q = historySearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (rec.userName && rec.userName.toLowerCase().includes(q)) ||
        (rec.userEmployeeId && rec.userEmployeeId.toLowerCase().includes(q)) ||
        rec.fromOutletName.toLowerCase().includes(q) ||
        (rec.fromOutletCode && rec.fromOutletCode.toLowerCase().includes(q)) ||
        rec.toOutletName.toLowerCase().includes(q) ||
        (rec.toOutletCode && rec.toOutletCode.toLowerCase().includes(q)) ||
        (rec.adminNote && rec.adminNote.toLowerCase().includes(q)) ||
        rec.transferredBy.toLowerCase().includes(q)
      );
    });
  }, [afoTransfers, historySearchQuery]);

  // Handlers for switching views
  const handleStartTransferForOfficer = (officer: UserProfile) => {
    setSelectedOfficer(officer);
    setSelectedTargetOutlet(null);
    setTransferNote(`Operational station transfer for ${officer.fullName} to optimize branch workflow.`);
    setCurrentView('OFFICER_REVIEW');
  };

  const handleProceedToDestinationSelect = () => {
    if (!selectedOfficer) return;
    setCurrentView('SELECT_DESTINATION');
  };

  const handleSelectTargetOutlet = (outlet: BRACBankOutlet) => {
    if (selectedOfficer && outlet.id === selectedOfficer.outletId) {
      return; // Cannot transfer to same outlet
    }
    setSelectedTargetOutlet(outlet);
  };

  const handleOpenConfirmModal = () => {
    if (!selectedOfficer || !selectedTargetOutlet) return;
    setIsConfirmModalOpen(true);
  };

  const handleExecuteTransfer = () => {
    if (!selectedOfficer || !selectedTargetOutlet) return;

    const result = transferAfoToOutlet(selectedOfficer.id, selectedTargetOutlet.id, {
      revokePreviousOutletAccess,
      adminNote: transferNote
    });

    if (result.success) {
      // Find the latest transfer record
      const currentOfficerObj = users.find((u) => u.id === selectedOfficer.id);
      const newRecord: AfoTransferRecord = {
        id: `TRF-${Date.now()}`,
        userId: selectedOfficer.id,
        userName: selectedOfficer.fullName,
        userEmployeeId: selectedOfficer.employeeId,
        userAvatarUrl: selectedOfficer.avatarUrl,
        userEmail: selectedOfficer.email,
        userPhone: selectedOfficer.phone,
        fromOutletId: selectedOfficer.outletId,
        fromOutletName: selectedOfficer.outletName,
        fromOutletCode: selectedOfficer.outletCode,
        fromOutletAddress: selectedOfficer.outletLocation || '',
        toOutletId: selectedTargetOutlet.id,
        toOutletName: selectedTargetOutlet.name,
        toOutletCode: selectedTargetOutlet.code,
        toOutletAddress: selectedTargetOutlet.address,
        transferredAt: new Date().toISOString(),
        transferredBy: currentAdmin?.fullName || 'Central Administrator',
        revokePreviousOutletAccess,
        adminNote: transferNote
      };

      setLastExecutedRecord(newRecord);
      setIsConfirmModalOpen(false);
      setCurrentView('SUCCESS_RECEIPT');

      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // confetti fallback
      }
    }
  };

  const handleReturnToDashboard = () => {
    setSelectedOfficer(null);
    setSelectedTargetOutlet(null);
    setLastExecutedRecord(null);
    setCurrentView('DASHBOARD');
  };

  // -------------------------------------------------------------------------------------------------
  // VIEW: SUCCESS RECEIPT (Step 3: Transfer Receipt & Summary)
  // -------------------------------------------------------------------------------------------------
  if (currentView === 'SUCCESS_RECEIPT' && lastExecutedRecord) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
        {/* Top Success Banner */}
        <div className={`p-8 rounded-3xl border text-center shadow-lg transition-all ${
          isDark
            ? 'bg-gradient-to-b from-[#16233d] to-[#0f172a] border-emerald-500/40 text-white'
            : 'bg-gradient-to-b from-emerald-50/90 to-white border-emerald-300 text-slate-900'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 mb-2">
            <BadgeCheck className="w-4 h-4" />
            Official Station Transfer Confirmed & Executed
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            AFO Station Transfer Completed
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mt-2">
            Officer <strong className="text-slate-900 dark:text-white">{lastExecutedRecord.userName}</strong> has been officially reassigned to{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">{lastExecutedRecord.toOutletName}</strong>.
          </p>
        </div>

        {/* Before & After Station Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Previous Station Card */}
          <div className={`p-6 rounded-2xl border relative overflow-hidden ${
            isDark ? 'bg-[#151e2e] border-rose-500/30' : 'bg-rose-50/40 border-rose-200'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-200 dark:border-rose-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Previous Outlet Station
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                Access Revoked & Locked
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Outlet Name</span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100">{lastExecutedRecord.fromOutletName}</span>
              </div>

              {lastExecutedRecord.fromOutletCode && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Outlet Code</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{lastExecutedRecord.fromOutletCode}</span>
                </div>
              )}

              {lastExecutedRecord.fromOutletAddress && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Address</span>
                  <span className="text-slate-600 dark:text-slate-400">{lastExecutedRecord.fromOutletAddress}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/30 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>Officer credentials and prior session tokens have been revoked for this outlet. Officer cannot log into or submit entries for this station.</span>
            </div>
          </div>

          {/* New Assigned Station Card */}
          <div className={`p-6 rounded-2xl border relative overflow-hidden ${
            isDark ? 'bg-[#151e2e] border-emerald-500/40 shadow-md' : 'bg-emerald-50/50 border-emerald-300 shadow-sm'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Newly Assigned Station
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                Active Station Assignment
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Outlet Name</span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100">{lastExecutedRecord.toOutletName}</span>
              </div>

              {lastExecutedRecord.toOutletCode && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Outlet Code</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{lastExecutedRecord.toOutletCode}</span>
                </div>
              )}

              {lastExecutedRecord.toOutletAddress && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Physical Address</span>
                  <span className="text-slate-600 dark:text-slate-400">{lastExecutedRecord.toOutletAddress}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-900/30 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>All loan portfolios, cheque dispatches, debit card tracking, and daily KPI registers are now routed exclusively to this station.</span>
            </div>
          </div>
        </div>

        {/* Transfer Memo and Administrative Details */}
        <div className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-indigo-500" />
            Administrative Transfer Memorandum
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized By</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{lastExecutedRecord.transferredBy}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Execution Date & Time</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(lastExecutedRecord.transferredAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Officer Employee ID</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{lastExecutedRecord.userEmployeeId || 'N/A'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Administrative Note / Directives</span>
            <p className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              "{lastExecutedRecord.adminNote || 'Administrative station transfer completed.'}"
            </p>
          </div>
        </div>

        {/* Action Button to Return */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
            }`}
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Transfer Order Slip
          </button>

          <button
            onClick={handleReturnToDashboard}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            OK - Return to AFO Transfer Directory
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------------------------------
  // VIEW: SELECT DESTINATION OUTLET (Step 2: Full Outlet Selector & Search)
  // -------------------------------------------------------------------------------------------------
  if (currentView === 'SELECT_DESTINATION' && selectedOfficer) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-16">
        {/* Step Indicator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('OFFICER_REVIEW')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                  Step 2 of 2: Select Target Station
                </span>
                <span className="text-xs text-slate-400">Total {outlets.length} Outlets Available</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                Choose Destination Outlet for {selectedOfficer.fullName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReturnToDashboard}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Cancel Transfer
            </button>
          </div>
        </div>

        {/* Selected Officer Context Card */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark ? 'bg-[#16233d]/70 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200'
        }`}>
          <div className="flex items-center gap-3">
            <img
              src={selectedOfficer.avatarUrl}
              alt={selectedOfficer.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-indigo-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{selectedOfficer.fullName}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
                  {selectedOfficer.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Assigned Station: <strong className="text-slate-700 dark:text-slate-200">{selectedOfficer.outletName}</strong> ({selectedOfficer.outletCode})
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Designation</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedOfficer.designation || 'Area Field Officer'}</span>
          </div>
        </div>

        {/* Search & Division Filter Bar */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destinationSearchQuery}
              onChange={(e) => setDestinationSearchQuery(e.target.value)}
              placeholder="Search destination branch outlet by name, code, district, division, or manager name..."
              className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Division Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Division:</span>
            {DIVISIONS.map((div) => (
              <button
                key={div}
                type="button"
                onClick={() => setDestinationDivisionFilter(div)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  destinationDivisionFilter === div
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {div}
              </button>
            ))}
          </div>
        </div>

        {/* Outlets Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Target Outlets ({filteredDestinationOutlets.length})
            </h3>
            {selectedTargetOutlet && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {selectedTargetOutlet.name}
              </span>
            )}
          </div>

          {filteredDestinationOutlets.length === 0 ? (
            <div className={`p-12 rounded-2xl border text-center ${
              isDark ? 'bg-[#182338] border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-bold">No matching destination outlets found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search keywords or division filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDestinationOutlets.map((outlet) => {
                const isCurrentStation = outlet.id === selectedOfficer.outletId;
                const isSelected = selectedTargetOutlet?.id === outlet.id;
                const stationedCount = users.filter((u) => u.outletId === outlet.id).length;

                return (
                  <div
                    key={outlet.id}
                    onClick={() => !isCurrentStation && handleSelectTargetOutlet(outlet)}
                    className={`p-4 rounded-2xl border transition-all relative cursor-pointer ${
                      isCurrentStation
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800'
                        : isSelected
                        ? isDark
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/50'
                          : 'bg-indigo-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                        : isDark
                        ? 'bg-[#182338] hover:bg-[#1e2b45] border-slate-700/80 hover:border-slate-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    {/* Top Status & Code */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {outlet.code}
                      </span>

                      {isCurrentStation ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Current Station
                        </span>
                      ) : isSelected ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                          <Check className="w-3 h-3" /> Selected Target
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {outlet.division}
                        </span>
                      )}
                    </div>

                    {/* Outlet Name */}
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 mb-1">
                      {outlet.name}
                    </h4>

                    {/* Address */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                      <span>{outlet.address || `${outlet.district}, ${outlet.division}`}</span>
                    </p>

                    {/* Meta info: Manager & Capacity */}
                    <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <User className="w-3 h-3 text-slate-400" />
                        {outlet.managerName || 'Branch Manager'}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-500" />
                        {stationedCount} AFOs
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Security & Governance Options */}
        {selectedTargetOutlet && (
          <div className={`p-5 rounded-2xl border space-y-4 animate-fadeIn ${
            isDark ? 'bg-[#182338] border-indigo-500/30 shadow-md' : 'bg-white border-indigo-200 shadow-md'
          }`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Transfer Governance & Security Policies
              </h3>
            </div>

            {/* Revoke access checkbox */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                checked={revokePreviousOutletAccess}
                onChange={(e) => setRevokePreviousOutletAccess(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-white block">
                  Enforce Prior Station Access Lock & Revocation (Recommended)
                </span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                  When enabled, the officer’s previous station credentials are securely locked. The officer will not be able to log into or submit entries under <strong className="text-slate-700 dark:text-slate-300">{selectedOfficer.outletName}</strong>. All active workflows switch directly to <strong className="text-indigo-600 dark:text-indigo-400">{selectedTargetOutlet.name}</strong>.
                </span>
              </div>
            </label>

            {/* Directive Remark Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Transfer Directive / Administrative Note
              </label>
              <input
                type="text"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                placeholder="e.g. Operational rotation order #2026-BBL or Regional Expansion deployment"
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentView('OFFICER_REVIEW')}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
            }`}
          >
            Back to Officer Review
          </button>

          <button
            type="button"
            disabled={!selectedTargetOutlet}
            onClick={handleOpenConfirmModal}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              selectedTargetOutlet
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-slate-400 dark:bg-slate-800 text-slate-200 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Proceed to Confirm Transfer
          </button>
        </div>

        {/* Confirmation Modal */}
        {isConfirmModalOpen && selectedTargetOutlet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-[#182338] border-indigo-500/40 text-white' : 'bg-white border-indigo-200 text-slate-900'
            }`}>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Confirm Official Station Transfer</h3>
                  <p className="text-xs text-slate-400">Reassigning officer station in central banking directory</p>
                </div>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Officer:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedOfficer.fullName} ({selectedOfficer.employeeId})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-500 font-bold">From Current Station:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedOfficer.outletName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-500 font-bold">To Destination Station:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTargetOutlet.name} ({selectedTargetOutlet.code})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-slate-600 dark:text-slate-300">
                  <span className="font-bold block text-indigo-600 dark:text-indigo-400 mb-1">Security Directive Summary</span>
                  {revokePreviousOutletAccess ? (
                    <p>
                      ✓ Prior station credentials for <strong>{selectedOfficer.outletName}</strong> will be <strong>revoked</strong>. The officer must operate strictly under <strong>{selectedTargetOutlet.name}</strong>.
                    </p>
                  ) : (
                    <p>Station assignment will be updated without explicit credential revocation.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Execute Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------------------------------
  // VIEW: OFFICER REVIEW PROFILE (Step 1: Current Station & Past History)
  // -------------------------------------------------------------------------------------------------
  if (currentView === 'OFFICER_REVIEW' && selectedOfficer) {
    const officerOutlet = outlets.find((o) => o.id === selectedOfficer.outletId);
    const officerTransfers = afoTransfers.filter((t) => t.userId === selectedOfficer.id);

    return (
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-16">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentView('DASHBOARD')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-indigo-500" />
            Back to Transfer Directory
          </button>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
            Step 1 of 2: Officer Station Review
          </span>
        </div>

        {/* Officer Main Profile Card */}
        <div className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#182338] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={selectedOfficer.avatarUrl}
                alt={selectedOfficer.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedOfficer.fullName}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {selectedOfficer.employeeId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedOfficer.designation || 'Area Field Officer (AFO)'} • {selectedOfficer.email}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedOfficer.phone}</span>
                  {selectedOfficer.bloodGroup && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-500 font-bold text-[10px]">
                      {selectedOfficer.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToDestinationSelect}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transfer to Another Outlet
            </button>
          </div>

          {/* Current Assigned Station Details */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Current Station Deployment Snapshot
            </h3>

            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Outlet Station</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedOfficer.outletName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Outlet Code</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedOfficer.outletCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Manager</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOfficer.supervisorName || officerOutlet?.managerName || 'Branch Manager'}</span>
                </div>
              </div>

              {selectedOfficer.outletLocation && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedOfficer.outletLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Past Transfer History for this Officer */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-500" />
              Officer Station History ({officerTransfers.length} Recorded Transfers)
            </h3>

            {officerTransfers.length === 0 ? (
              <div className={`p-4 rounded-xl border text-center text-xs ${
                isDark ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                No prior transfers recorded for this officer. Currently stationed at initial deployment outlet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {officerTransfers.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{rec.fromOutletName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{rec.toOutletName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Authorized by {rec.transferredBy} • {new Date(rec.transferredAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 self-start sm:self-auto">
                      {rec.revokePreviousOutletAccess ? 'Prior Access Locked' : 'Transferred'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------------------------------
  // VIEW: DASHBOARD (Main AFO Transfer Dashboard & Directory)
  // -------------------------------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner Header */}
      <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
        isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-sm shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  AFO Station Transfer & Reassignment Center
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  Live Operations
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Reassign Field Officers across BRAC Bank outlet stations nationwide with automated credential locking and audit logs.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (users.length > 0) {
                handleStartTransferForOfficer(users[0]);
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Initiate Station Transfer
          </button>
        </div>
      </div>

      {/* Metric Stat Cards (Counting Transferred Users & clickable to view full details) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Transfers Executed (CLICKABLE FOR FULL DETAILS MODAL) */}
        <div
          id="transfer-stat-total"
          onClick={() => setIsHistoryModalOpen(true)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] shadow-sm select-none ${
            isDark
              ? 'bg-gradient-to-br from-[#1b263b] to-[#121c2e] border-indigo-500/40 hover:border-indigo-400 hover:shadow-indigo-500/10'
              : 'bg-gradient-to-br from-indigo-50/80 to-white border-indigo-300 hover:border-indigo-400 hover:shadow-indigo-500/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'মোট বদলির রেকর্ড' : 'Total Station Transfers'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {totalTransfersCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {currentLang === 'bn' ? 'কার্যক্রম সংরক্ষিত' : 'actions recorded'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-indigo-200 dark:border-indigo-900/50">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {currentLang === 'bn' ? 'লগ ও বিস্তারিত দেখুন' : 'Click to view audit logs'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Total Stationed AFOs (CLICKABLE TO SHOW ALL OFFICERS) */}
        <div
          id="transfer-stat-officers"
          onClick={() => {
            setTransferStatusFilter('ALL');
            setSearchQuery('');
            setSelectedDivisionFilter('ALL');
            setSelectedOutletFilter('ALL');
            const el = document.getElementById('afo-officers-directory-table');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] shadow-sm select-none ${
            transferStatusFilter === 'ALL'
              ? isDark
                ? 'bg-[#182338] border-emerald-500/60 ring-1 ring-emerald-500/30'
                : 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400/30'
              : isDark
                ? 'bg-[#182338] border-slate-700 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'নিযুক্ত ফিল্ড অফিসার' : 'Total Stationed AFOs'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {totalAfosCount}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              {currentLang === 'bn' ? 'সক্রিয় অফিসার' : 'Active Officers'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {currentLang === 'bn' ? 'সকল অফিসার দেখুন' : 'Click to view all officers'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Active Network Outlets (CLICKABLE TO NAVIGATE TO OUTLET PAGE) */}
        <div
          id="transfer-stat-outlets"
          onClick={() => {
            setActiveNavTab('outlets');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] shadow-sm select-none ${
            isDark
              ? 'bg-[#182338] border-slate-700 hover:border-blue-500/60 hover:shadow-blue-500/10'
              : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-blue-500/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'উপলব্ধ ব্র্যাক আউটলেট' : 'Available Outlets'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {totalActiveOutletsCount}
            </span>
            <span className="text-xs font-semibold text-blue-500">
              {currentLang === 'bn' ? 'সক্রিয় হাব' : 'Active Hubs'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> {currentLang === 'bn' ? 'আউটলেট তালিকা দেখুন' : 'Click to view outlet details'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Transferred Officers Count (CLICKABLE TO FILTER TO ROTATED AFOS) */}
        <div
          id="transfer-stat-reassigned"
          onClick={() => {
            setTransferStatusFilter('TRANSFERRED');
            setSearchQuery('');
            const el = document.getElementById('afo-officers-directory-table');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] shadow-sm select-none ${
            transferStatusFilter === 'TRANSFERRED'
              ? isDark
                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                : 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
              : isDark
                ? 'bg-[#182338] border-slate-700 hover:border-purple-500/50'
                : 'bg-white border-slate-200 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'পুনঃনিযুক্ত অফিসার' : 'Reassigned Officers'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {transferredOfficersCount}
            </span>
            <span className="text-xs font-semibold text-purple-500">
              {currentLang === 'bn' ? 'বদলিকৃত AFO' : 'Rotated AFOs'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {currentLang === 'bn' ? 'বদলিকৃতদের ফিল্টার করুন' : 'Click to filter rotated AFOs'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* AFO Officers Directory & Transfer Section */}
      <div
        id="afo-officers-directory-table"
        className={`p-6 rounded-3xl border shadow-sm ${
          isDark ? 'bg-[#182338] border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        {/* Search, Filter, and View Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              AFO Field Officers Station Directory ({filteredOfficers.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any officer to review deployment history or initiate an immediate station transfer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search officer name, ID, outlet..."
                className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Division Filter */}
            <select
              value={selectedDivisionFilter}
              onChange={(e) => setSelectedDivisionFilter(e.target.value)}
              className={`text-xs px-3 py-2 rounded-xl border font-medium ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Divisions' : d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={transferStatusFilter}
              onChange={(e) => setTransferStatusFilter(e.target.value as any)}
              className={`text-xs px-3 py-2 rounded-xl border font-medium ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="ALL">All Statuses</option>
              <option value="TRANSFERRED">Transferred Officers</option>
              <option value="SINGLE_STATION">Single Station Officers</option>
            </select>
          </div>
        </div>

        {/* Officers Grid */}
        {filteredOfficers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-400" />
            <p className="text-sm font-bold">No AFO officers match the selected criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOfficers.map((officer) => {
              const isTransferred = (officer.transferHistory && officer.transferHistory.length > 0) || (officer.previousOutletIds && officer.previousOutletIds.length > 0);
              const transferCount = officer.transferHistory?.length || officer.previousOutletIds?.length || 0;

              return (
                <div
                  key={officer.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-md ${
                    isDark
                      ? 'bg-[#151e2e] hover:bg-[#1a2538] border-slate-800'
                      : 'bg-white hover:bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header: Photo, Name, Employee ID */}
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <img
                        src={officer.avatarUrl}
                        alt={officer.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {officer.fullName}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-block mt-0.5">
                          {officer.employeeId || 'AFO-OFFICER'}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {officer.email}
                        </p>
                      </div>
                    </div>

                    {/* Current Assigned Outlet Box */}
                    <div className={`p-3 rounded-xl border mb-3 ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-emerald-500" /> Current Station
                        </span>
                        {officer.outletCode && (
                          <span className="font-mono text-slate-500">{officer.outletCode}</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {officer.outletName}
                      </p>
                    </div>

                    {/* Transfer Status Badge */}
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="text-slate-400 text-[11px]">Deployment Status:</span>
                      {isTransferred ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" /> Transferred ({transferCount}x)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          Stationed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => handleStartTransferForOfficer(officer)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Transfer Station
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOfficer(officer);
                        setCurrentView('OFFICER_REVIEW');
                      }}
                      className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      title="View Profile & Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transfer History Details Modal (Opened from counting box) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#182338] border-indigo-500/30 text-white' : 'bg-white border-indigo-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Comprehensive AFO Station Transfer Logs</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total {afoTransfers.length} official station rotation events recorded in bank system
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search logs by officer name, employee ID, outlet names, or admin name..."
                  className={`w-full text-xs pl-10 pr-4 py-2 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Modal Table / List Body */}
            <div className="p-6 overflow-y-auto space-y-3 scrollbar-none flex-1">
              {filteredHistoryRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold">No transfer records found</p>
                </div>
              ) : (
                filteredHistoryRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDark ? 'bg-[#151e2e] border-slate-800' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center gap-3">
                        {rec.userAvatarUrl && (
                          <img
                            src={rec.userAvatarUrl}
                            alt={rec.userName || 'Officer'}
                            className="w-10 h-10 rounded-xl object-cover border border-indigo-400/40"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800 dark:text-white">{rec.userName || 'Officer'}</span>
                            {rec.userEmployeeId && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {rec.userEmployeeId}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Transfer Date: {new Date(rec.transferredAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold self-start sm:self-auto ${
                        rec.revokePreviousOutletAccess
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                          : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                      }`}>
                        {rec.revokePreviousOutletAccess ? 'Prior Outlet Locked' : 'Transferred'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">From Outlet Station</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">{rec.fromOutletName}</span>
                        {rec.fromOutletCode && <span className="text-slate-400 font-mono ml-1">({rec.fromOutletCode})</span>}
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">To Destination Station</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{rec.toOutletName}</span>
                        {rec.toOutletCode && <span className="text-slate-400 font-mono ml-1">({rec.toOutletCode})</span>}
                      </div>
                    </div>

                    {rec.adminNote && (
                      <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/60 p-2.5 rounded-xl">
                        <strong className="text-slate-700 dark:text-slate-300">Administrative Memo:</strong> {rec.adminNote}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-xs text-slate-400">
                Showing {filteredHistoryRecords.length} of {afoTransfers.length} events
              </span>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
