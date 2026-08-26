import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  BookOpen,
  Search,
  Calendar,
  Plus,
  CheckCircle2,
  Filter,
  Download,
  Copy,
  Printer,
  Trash2,
  Phone,
  User,
  ExternalLink,
  Layers,
  Sparkles,
  Check,
  Edit3,
  CalendarCheck,
  Link2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  Flame,
  RotateCcw,
  FileSpreadsheet,
  ShieldAlert,
  X
} from 'lucide-react';
import { ChequeCardEntry, ChequeBookRecord, DebitCardRecord } from '../../types';
import { DestructionModal } from './DestructionModal';
import { PrintableSlipSection } from './PrintableSlipSection';
import { ValidityCrossBanner } from './ValidityCrossBanner';
import { generateChequeCardCSVContent, downloadCSVFile, getDaysInVault } from '../../utils/chequeCardCsvExport';

export type RegistryFilterType =
  | 'ALL'
  | 'PENDING_ALL'
  | 'PENDING_CHEQUE'
  | 'PENDING_CARD'
  | 'VALIDITY_CROSS'
  | 'DESTROYED'
  | 'DESTROYED_DATE'
  | 'CHEQUE'
  | 'CARD'
  | 'INTAKE_DATE'
  | 'DELIVERED_ALL'
  | 'DELIVERED_DATE'
  | 'DELIVERED_CHEQUE'
  | 'DELIVERED_CARD';

export const ChequeCardRegistryView: React.FC = () => {
  const {
    chequeCardEntries,
    updateChequeCardStatus,
    deleteChequeCardEntry,
    openAddEntryModal,
    openEditEntryModal,
    userPreferences,
    currentUser,
    setToast
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const isBn = userPreferences.language === 'bn';

  const todayStr = new Date().toISOString().split('T')[0];

  const [activeFilter, setActiveFilter] = useState<RegistryFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<ChequeCardEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deletingEntry, setDeletingEntry] = useState<ChequeCardEntry | null>(null);

  // Delivery prompt modal state
  const [deliveryDatePromptId, setDeliveryDatePromptId] = useState<string | null>(null);
  const [customDeliveryDate, setCustomDeliveryDate] = useState<string>(todayStr);

  // Destruction Modal state (for 90+ days validity crossed items)
  const [destroyPromptEntry, setDestroyPromptEntry] = useState<ChequeCardEntry | null>(null);

  // Intake Date Picker State
  const [intakeFilterDate, setIntakeFilterDate] = useState<string>(todayStr);
  const [isIntakePickerOpen, setIsIntakePickerOpen] = useState<boolean>(false);
  const [intakeViewDate, setIntakeViewDate] = useState<Date>(new Date());
  const intakePickerRef = useRef<HTMLDivElement>(null);

  // Delivered Date Picker State
  const [deliveredFilterDate, setDeliveredFilterDate] = useState<string>(todayStr);
  const [isDeliveredPickerOpen, setIsDeliveredPickerOpen] = useState<boolean>(false);
  const [deliveredViewDate, setDeliveredViewDate] = useState<Date>(new Date());
  const deliveredPickerRef = useRef<HTMLDivElement>(null);

  // Destroyed Date Picker State
  const [destroyedFilterDate, setDestroyedFilterDate] = useState<string>(todayStr);
  const [isDestroyedPickerOpen, setIsDestroyedPickerOpen] = useState<boolean>(false);
  const [destroyedViewDate, setDestroyedViewDate] = useState<Date>(new Date());
  const destroyedPickerRef = useRef<HTMLDivElement>(null);

  // Export dropdown state
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for date picker & export dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (intakePickerRef.current && !intakePickerRef.current.contains(e.target as Node)) {
        setIsIntakePickerOpen(false);
      }
      if (deliveredPickerRef.current && !deliveredPickerRef.current.contains(e.target as Node)) {
        setIsDeliveredPickerOpen(false);
      }
      if (destroyedPickerRef.current && !destroyedPickerRef.current.contains(e.target as Node)) {
        setIsDestroyedPickerOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Stats calculation
  const totalCheques = useMemo(
    () => chequeCardEntries.filter((e) => e.type === 'CHEQUE').length,
    [chequeCardEntries]
  );
  const pendingCheques = useMemo(
    () => chequeCardEntries.filter((e) => e.type === 'CHEQUE' && e.status === 'RECEIVED').length,
    [chequeCardEntries]
  );
  const deliveredCheques = useMemo(
    () => chequeCardEntries.filter((e) => e.type === 'CHEQUE' && e.status === 'DELIVERED_TO_CUSTOMER').length,
    [chequeCardEntries]
  );

  const totalCards = useMemo(
    () => chequeCardEntries.filter((e) => e.type === 'CARD').length,
    [chequeCardEntries]
  );
  const pendingCards = useMemo(
    () => chequeCardEntries.filter((e) => e.type === 'CARD' && e.status === 'RECEIVED').length,
    [chequeCardEntries]
  );
  const deliveredCards = useMemo(
    () => chequeCardEntries.filter((e) => e.type === 'CARD' && e.status === 'DELIVERED_TO_CUSTOMER').length,
    [chequeCardEntries]
  );

  const totalPending = useMemo(
    () => chequeCardEntries.filter((e) => e.status === 'RECEIVED').length,
    [chequeCardEntries]
  );
  const totalDelivered = useMemo(
    () => chequeCardEntries.filter((e) => e.status === 'DELIVERED_TO_CUSTOMER').length,
    [chequeCardEntries]
  );
  const totalDestroyed = useMemo(
    () => chequeCardEntries.filter((e) => e.status === 'DESTROYED_EXPIRED').length,
    [chequeCardEntries]
  );

  // Validity Cross items (> 90 days in station vault and uncollected)
  const validityCrossActiveEntries = useMemo(
    () => chequeCardEntries.filter((e) => e.status === 'RECEIVED' && getDaysInVault(e.receivedDate) >= 90),
    [chequeCardEntries]
  );
  const validityCrossCount = validityCrossActiveEntries.length;

  // Specific Intake Date Stats
  const intakeEntriesOnDate = useMemo(
    () => chequeCardEntries.filter((e) => e.receivedDate === intakeFilterDate),
    [chequeCardEntries, intakeFilterDate]
  );
  const intakeCountOnDate = intakeEntriesOnDate.length;
  const intakeChequesOnDate = intakeEntriesOnDate.filter((e) => e.type === 'CHEQUE').length;
  const intakeCardsOnDate = intakeEntriesOnDate.filter((e) => e.type === 'CARD').length;

  // Specific Delivered Date Stats
  const deliveredEntriesOnDate = useMemo(
    () =>
      chequeCardEntries.filter(
        (e) =>
          e.status === 'DELIVERED_TO_CUSTOMER' &&
          (e.deliveryDate === deliveredFilterDate || (!e.deliveryDate && e.receivedDate === deliveredFilterDate))
      ),
    [chequeCardEntries, deliveredFilterDate]
  );
  const deliveredCountOnDate = deliveredEntriesOnDate.length;

  // Specific Destroyed Date Stats
  const destroyedEntriesOnDate = useMemo(
    () =>
      chequeCardEntries.filter(
        (e) =>
          e.status === 'DESTROYED_EXPIRED' &&
          (e.destroyedAt === destroyedFilterDate || (!e.destroyedAt && e.receivedDate === destroyedFilterDate))
      ),
    [chequeCardEntries, destroyedFilterDate]
  );
  const destroyedCountOnDate = destroyedEntriesOnDate.length;
  const destroyedChequesOnDate = destroyedEntriesOnDate.filter((e) => e.type === 'CHEQUE').length;
  const destroyedCardsOnDate = destroyedEntriesOnDate.filter((e) => e.type === 'CARD').length;

  const totalLeavesReceived = useMemo(() => {
    return chequeCardEntries.reduce((acc, curr) => {
      if (curr.type === 'CHEQUE') {
        return acc + (curr.leafCount || 0);
      }
      return acc;
    }, 0);
  }, [chequeCardEntries]);

  // Account cross-reference mapping (Account Number -> list of items)
  const accountAssetMap = useMemo(() => {
    const map = new Map<string, { hasCheque: boolean; hasCard: boolean; count: number }>();
    chequeCardEntries.forEach((item) => {
      const acc = item.accountNumber.trim();
      if (!acc) return;
      const existing = map.get(acc) || { hasCheque: false, hasCard: false, count: 0 };
      if (item.type === 'CHEQUE') existing.hasCheque = true;
      if (item.type === 'CARD') existing.hasCard = true;
      existing.count += 1;
      map.set(acc, existing);
    });
    return map;
  }, [chequeCardEntries]);

  // Filtered list
  const filteredEntries = useMemo(() => {
    return chequeCardEntries.filter((item) => {
      // Tab filter
      if (activeFilter === 'PENDING_ALL') {
        if (item.status !== 'RECEIVED') return false;
      } else if (activeFilter === 'PENDING_CHEQUE') {
        if (item.type !== 'CHEQUE' || item.status !== 'RECEIVED') return false;
      } else if (activeFilter === 'PENDING_CARD') {
        if (item.type !== 'CARD' || item.status !== 'RECEIVED') return false;
      } else if (activeFilter === 'VALIDITY_CROSS') {
        if (item.status !== 'RECEIVED' || getDaysInVault(item.receivedDate) < 90) return false;
      } else if (activeFilter === 'DESTROYED') {
        if (item.status !== 'DESTROYED_EXPIRED') return false;
      } else if (activeFilter === 'DESTROYED_DATE') {
        if (item.status !== 'DESTROYED_EXPIRED') return false;
        const dDate = item.destroyedAt || item.receivedDate;
        if (dDate !== destroyedFilterDate) return false;
      } else if (activeFilter === 'CHEQUE') {
        if (item.type !== 'CHEQUE') return false;
      } else if (activeFilter === 'CARD') {
        if (item.type !== 'CARD') return false;
      } else if (activeFilter === 'INTAKE_DATE') {
        if (item.receivedDate !== intakeFilterDate) return false;
      } else if (activeFilter === 'DELIVERED_ALL') {
        if (item.status !== 'DELIVERED_TO_CUSTOMER') return false;
      } else if (activeFilter === 'DELIVERED_DATE') {
        if (item.status !== 'DELIVERED_TO_CUSTOMER') return false;
        const dDate = item.deliveryDate || item.receivedDate;
        if (dDate !== deliveredFilterDate) return false;
      } else if (activeFilter === 'DELIVERED_CHEQUE') {
        if (item.type !== 'CHEQUE' || item.status !== 'DELIVERED_TO_CUSTOMER') return false;
      } else if (activeFilter === 'DELIVERED_CARD') {
        if (item.type !== 'CARD' || item.status !== 'DELIVERED_TO_CUSTOMER') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleOrName = (item.type === 'CHEQUE' ? item.accountTitle : item.cardName).toLowerCase();
        const accNo = item.accountNumber.toLowerCase();
        const mobile = item.mobileNumber.toLowerCase();
        const cchStart = item.type === 'CHEQUE' ? item.startCchNumber.toLowerCase() : '';
        const cchEnd = item.type === 'CHEQUE' ? item.endCchNumber.toLowerCase() : '';

        return (
          titleOrName.includes(q) ||
          accNo.includes(q) ||
          mobile.includes(q) ||
          cchStart.includes(q) ||
          cchEnd.includes(q)
        );
      }

      return true;
    });
  }, [chequeCardEntries, activeFilter, searchQuery, intakeFilterDate, deliveredFilterDate, destroyedFilterDate]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setToast({ message: `Copied to clipboard: ${text}`, type: 'info' });
  };

  const handleConfirmDelivery = (id: string) => {
    updateChequeCardStatus(id, 'DELIVERED_TO_CUSTOMER', customDeliveryDate || todayStr);
    setDeliveryDatePromptId(null);
    setToast({ message: 'Marked as Delivered with delivery date recorded!', type: 'success' });
  };

  // Revert Delivered item back to Pending (allows fixing accidental deliveries)
  const handleRevertToPending = (entry: ChequeCardEntry) => {
    updateChequeCardStatus(entry.id, 'RECEIVED');
    setToast({
      message: `Reverted ${entry.type === 'CHEQUE' ? 'Cheque Book' : 'Debit Card'} (${entry.accountNumber}) back to Pending in Vault!`,
      type: 'success'
    });
  };

  // Confirm Physical Destruction of Expired Asset (90+ Days SOP)
  const handleConfirmDestruction = (destructionDate: string, reason: string) => {
    if (!destroyPromptEntry) return;
    updateChequeCardStatus(
      destroyPromptEntry.id,
      'DESTROYED_EXPIRED',
      undefined,
      destroyPromptEntry.notes,
      {
        destroyedAt: destructionDate || todayStr,
        destructionReason: reason
      }
    );
    setToast({
      message: `Asset marked as Destroyed: ${destroyPromptEntry.accountNumber} on ${destructionDate || todayStr}`,
      type: 'success'
    });
    setDestroyPromptEntry(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingEntry) return;
    deleteChequeCardEntry(deletingEntry.id);
    setToast({ message: `Record deleted: ${deletingEntry.accountNumber}`, type: 'success' });
    setDeletingEntry(null);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // Helper to get human-readable filter name
  const getFilterScopeName = () => {
    switch (activeFilter) {
      case 'ALL': return isBn ? 'সকল রেকর্ড (মাস্টার ডাটা)' : 'All Records (Master Vault)';
      case 'PENDING_ALL': return isBn ? 'সকল পেন্ডিং আইটেম (ইন-ভল্ট)' : 'All Pending Items (In-Vault)';
      case 'PENDING_CHEQUE': return isBn ? 'পেন্ডিং চেক বই সমূহ' : 'Pending Cheque Books';
      case 'PENDING_CARD': return isBn ? 'পেন্ডিং ডেবিট কার্ড সমূহ' : 'Pending Debit Cards';
      case 'VALIDITY_CROSS': return isBn ? '৯০+ দিন মেয়াদোত্তীর্ণ সতর্কবার্তা' : '90+ Days Validity Overdue Alert';
      case 'DESTROYED': return isBn ? 'ধ্বংসকৃত / মেয়াদোত্তীর্ণ আইটেম' : 'Destroyed / SOP Expired Items';
      case 'DESTROYED_DATE': return isBn ? `ধ্বংস তারিখ: ${destroyedFilterDate}` : `Destroyed on Date: ${destroyedFilterDate}`;
      case 'CHEQUE': return isBn ? 'সকল চেক বই রেজিস্ট্রি' : 'All Cheque Books Registry';
      case 'CARD': return isBn ? 'সকল ডেবিট কার্ড রেজিস্ট্রি' : 'All Debit Cards Registry';
      case 'INTAKE_DATE': return isBn ? `গ্রহণ তারিখ: ${intakeFilterDate}` : `Intake Received Date: ${intakeFilterDate}`;
      case 'DELIVERED_ALL': return isBn ? 'সকল বিতরণকৃত আইটেম' : 'All Delivered Items';
      case 'DELIVERED_DATE': return isBn ? `বিতরণ তারিখ: ${deliveredFilterDate}` : `Delivered on Date: ${deliveredFilterDate}`;
      case 'DELIVERED_CHEQUE': return isBn ? 'বিতরণকৃত চেক বই সমূহ' : 'Delivered Cheque Books';
      case 'DELIVERED_CARD': return isBn ? 'বিতরণকৃত ডেবিট কার্ড সমূহ' : 'Delivered Debit Cards';
      default: return 'Filtered Records';
    }
  };

  // Full/Default CSV Export with comprehensive categorization & summary
  const exportToCSV = () => {
    const itemsToExport = (activeFilter !== 'ALL' || searchQuery.trim()) ? filteredEntries : chequeCardEntries;
    if (itemsToExport.length === 0) {
      setToast({
        message: isBn ? 'এক্সপোর্ট করার মতো কোন ডাটা পাওয়া যায়নি।' : 'No records found matching current criteria to export.',
        type: 'info'
      });
      return;
    }

    const csvContent = generateChequeCardCSVContent(itemsToExport, {
      outletName: currentUser?.outletName || 'Motijheel Commercial SME Outlet',
      outletCode: (currentUser as any)?.outletCode || 'SME-1029',
      outletLocation: currentUser?.outletLocation,
      officerName: currentUser?.fullName || 'Station Officer',
      officerId: currentUser?.employeeId || 'AFO-001',
      officerPhone: currentUser?.phone || '',
      reportTitle: isBn ? 'ব্র্যাক ব্যাংক পিএলসি - চেক বই ও ডেবিট কার্ড মাস্টার রেজিস্ট্রি রিপোর্ট' : 'BRAC BANK PLC - CHEQUE BOOK & DEBIT CARD ASSET REGISTRY REPORT',
      filterScopeName: getFilterScopeName() + (searchQuery.trim() ? ` (Search: "${searchQuery}")` : '')
    });

    const fileSuffix = activeFilter !== 'ALL' ? activeFilter.toLowerCase() : 'master';
    downloadCSVFile(csvContent, `BRAC_Outlet_Cheque_Card_${fileSuffix}_${todayStr}.csv`);
    setToast({
      message: isBn ? `CSV রিপোর্ট ডাউনলোড সম্পন্ন! মোট ${itemsToExport.length} টি রেকর্ড ক্যাটাগরি ও তারিখসহ সংরক্ষিত হয়েছে।` : `CSV Report downloaded successfully with categorized summary (${itemsToExport.length} items)!`,
      type: 'success'
    });
    setIsExportDropdownOpen(false);
  };

  // Dedicated Master Export (All Items unconditionally)
  const exportAllMasterCSV = () => {
    if (chequeCardEntries.length === 0) {
      setToast({
        message: isBn ? 'এক্সপোর্ট করার মতো কোন ডাটা নেই।' : 'No records available in database to export.',
        type: 'info'
      });
      return;
    }

    const csvContent = generateChequeCardCSVContent(chequeCardEntries, {
      outletName: currentUser?.outletName || 'Motijheel Commercial SME Outlet',
      outletCode: (currentUser as any)?.outletCode || 'SME-1029',
      outletLocation: currentUser?.outletLocation,
      officerName: currentUser?.fullName || 'Station Officer',
      officerId: currentUser?.employeeId || 'AFO-001',
      officerPhone: currentUser?.phone || '',
      reportTitle: isBn ? 'ব্র্যাক ব্যাংক পিএলসি - সম্পূর্ণ চেক বই ও ডেবিট কার্ড মাস্টার রেজিস্ট্রি' : 'BRAC BANK PLC - COMPLETE CHEQUE BOOK & DEBIT CARD MASTER REGISTRY',
      filterScopeName: isBn ? 'সম্পূর্ণ স্টেশন ইনভেন্টরি (অল রেকর্ডস)' : 'Complete Station Inventory (All Recorded Assets)'
    });

    downloadCSVFile(csvContent, `BRAC_Bank_Complete_Cheque_Card_Master_${todayStr}.csv`);
    setToast({
      message: isBn ? `মাস্টার CSV রিপোর্ট ডাউনলোড সম্পন্ন! মোট ${chequeCardEntries.length} টি রেকর্ড ক্যাটাগরি ও সামারিসহ সংরক্ষিত হয়েছে।` : `Complete Master CSV downloaded! Total ${chequeCardEntries.length} records categorized.`,
      type: 'success'
    });
    setIsExportDropdownOpen(false);
  };

  // Dedicated Pending Details CSV Generator (User Request)
  const exportPendingDetailsCSV = () => {
    const pendingItems = chequeCardEntries.filter((e) => e.status === 'RECEIVED');
    if (pendingItems.length === 0) {
      setToast({
        message: isBn ? 'স্টেশন ভল্টে বর্তমানে কোন পেন্ডিং আইটেম নেই।' : 'No pending items found in station vault to export.',
        type: 'info'
      });
      return;
    }

    const csvContent = generateChequeCardCSVContent(pendingItems, {
      outletName: currentUser?.outletName || 'Motijheel Commercial SME Outlet',
      outletCode: (currentUser as any)?.outletCode || 'SME-1029',
      outletLocation: currentUser?.outletLocation,
      officerName: currentUser?.fullName || 'Station Officer',
      officerId: currentUser?.employeeId || 'AFO-001',
      officerPhone: currentUser?.phone || '',
      reportTitle: isBn ? 'ব্র্যাক ব্যাংক পিএলসি - স্টেশন ভল্ট পেন্ডিং চেক ও ডেবিট কার্ড রিপোর্ট' : 'BRAC BANK PLC - STATION VAULT PENDING CHEQUE & CARD DETAILS REPORT',
      filterScopeName: isBn ? 'স্টেশন ভল্ট পেন্ডিং / অবিতরণকৃত আইটেম সমূহ' : 'In-Station Vault Pending / Uncollected Assets'
    });

    downloadCSVFile(csvContent, `BRAC_Bank_Pending_Cheque_Card_Details_${todayStr}.csv`);
    setToast({
      message: isBn
        ? `পেন্ডিং ভল্ট আইটেম CSV ডাউনলোড সম্পন্ন! মোট ${pendingItems.length} টি পেন্ডিং রেকর্ড ক্যাটাগরি, তারিখ ও কাস্টমার ডিটেইলসহ সংরক্ষিত হয়েছে।`
        : `Pending Details CSV generated! Downloaded report of ${pendingItems.length} pending vault items with complete categorized details.`,
      type: 'success'
    });
    setIsExportDropdownOpen(false);
  };

  // Dedicated Delivered Items CSV Generator
  const exportDeliveredDetailsCSV = () => {
    const deliveredItems = chequeCardEntries.filter((e) => e.status === 'DELIVERED_TO_CUSTOMER');
    if (deliveredItems.length === 0) {
      setToast({
        message: isBn ? 'কোন বিতরণকৃত চেক বা কার্ড পাওয়া যায়নি।' : 'No delivered records found to export.',
        type: 'info'
      });
      return;
    }

    const csvContent = generateChequeCardCSVContent(deliveredItems, {
      outletName: currentUser?.outletName || 'Motijheel Commercial SME Outlet',
      outletCode: (currentUser as any)?.outletCode || 'SME-1029',
      outletLocation: currentUser?.outletLocation,
      officerName: currentUser?.fullName || 'Station Officer',
      officerId: currentUser?.employeeId || 'AFO-001',
      officerPhone: currentUser?.phone || '',
      reportTitle: isBn ? 'ব্র্যাক ব্যাংক পিএলসি - সফলভাবে বিতরণকৃত চেক ও ডেবিট কার্ড রিপোর্ট' : 'BRAC BANK PLC - DELIVERED CHEQUE & DEBIT CARD DISPATCH REPORT',
      filterScopeName: isBn ? 'গ্রাহকদের নিকট সফলভাবে বিতরণকৃত রেকর্ড' : 'Successfully Delivered Customer Records'
    });

    downloadCSVFile(csvContent, `BRAC_Bank_Delivered_Cheque_Card_Details_${todayStr}.csv`);
    setToast({
      message: isBn
        ? `ডেলিভার্ড আইটেম CSV রিপোর্ট ডাউনলোড সম্পন্ন! (${deliveredItems.length} টি রেকর্ড)`
        : `Delivered Items CSV report downloaded successfully! (${deliveredItems.length} records)`,
      type: 'success'
    });
    setIsExportDropdownOpen(false);
  };

  // Helper calendar renderer
  const renderCalendarPicker = (
    currentSelectedDate: string,
    viewDate: Date,
    setViewDate: (d: Date) => void,
    onSelectDate: (dStr: string) => void,
    onClose: () => void
  ) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    const isSelected = (day: number) => {
      if (!currentSelectedDate) return false;
      const [selY, selM, selD] = currentSelectedDate.split('-').map(Number);
      return selY === year && selM === month + 1 && selD === day;
    };

    const isCurrentDay = (day: number) => {
      const t = new Date();
      return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
    };

    return (
      <div
        className={`absolute right-0 top-full mt-2 z-50 w-[260px] rounded-3xl border p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#182234] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Month & Year Selection */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1">
            <select
              value={month}
              onChange={(e) => setViewDate(new Date(year, parseInt(e.target.value, 10), 1))}
              className={`text-xs font-black py-0.5 px-1.5 rounded-lg border cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {monthNames.map((mName, idx) => (
                <option key={mName} value={idx}>
                  {mName.slice(0, 3)}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setViewDate(new Date(parseInt(e.target.value, 10), month, 1))}
              className={`text-xs font-mono font-black py-0.5 px-1.5 rounded-lg border cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {Array.from({ length: 20 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
            <div
              key={d}
              className={`text-[9px] font-bold ${
                i === 5 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {blanksArray.map((_, i) => (
            <div key={`blank-${i}`} className="h-6 w-6" />
          ))}

          {daysArray.map((day) => {
            const selected = isSelected(day);
            const current = isCurrentDay(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const mStr = String(month + 1).padStart(2, '0');
                  const dStr = String(day).padStart(2, '0');
                  onSelectDate(`${year}-${mStr}-${dStr}`);
                  onClose();
                }}
                className={`h-6 w-6 rounded-md text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                  selected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : current
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-400'
                    : isDark
                    ? 'text-slate-200 hover:bg-slate-800'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Quick Buttons: Today & Close */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSelectDate(todayStr);
              setViewDate(new Date());
              onClose();
            }}
            className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Today</span>
          </button>

          <button
            type="button"
            onClick={() => onClose()}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sticky Top Section (Station Asset Vault down through Search Bar - Exactly as in user image) */}
      <div
        className={`sticky top-0 z-30 pt-1 pb-3 space-y-3.5 no-print transition-all backdrop-blur-md border-b ${
          isDark
            ? 'bg-[#131B2A]/98 border-slate-800/80 shadow-xs'
            : 'bg-[#F7F9FB]/98 border-slate-200/80 shadow-2xs'
        }`}
      >
        {/* Top Banner & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Station Asset Vault
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                • {currentUser?.outletName || 'Motijheel Commercial SME Outlet'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
              {isBn ? 'চেক বই ও ডেবিট কার্ড রেজিস্ট্রি' : 'Cheque Book & Debit Card Registry'}
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn
                ? 'আউটলেটে আগত সকল চেক বই এবং ডেবিট কার্ডের লাইভ রেকর্ড ও বিতরণ ট্র্যাকার'
                : 'Complete repository & daily intake log for all dispatched cheque books & debit cards.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Export CSV Dropdown Group */}
            <div className="relative" ref={exportDropdownRef}>
              <div className="inline-flex rounded-2xl shadow-2xs">
                <button
                  id="export-csv-btn"
                  onClick={exportToCSV}
                  title={isBn ? 'ক্যাটাগরি সামারিসহ বিস্তারিত CSV রিপোর্ট ডাউনলোড করুন' : 'Download Categorized CSV Report (With Full Summary & Customer Details)'}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-l-2xl text-xs font-bold border-y border-l transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
                </button>
                <button
                  id="export-options-toggle-btn"
                  type="button"
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  title={isBn ? 'এক্সপোর্ট অপশন ও রিপোর্ট নির্বাচন করুন' : 'Select Export Options & Custom Reports'}
                  className={`px-2 py-2 rounded-r-2xl text-xs font-bold border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-600'
                  }`}
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Export Options Dropdown Menu */}
              {isExportDropdownOpen && (
                <div
                  className={`absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isDark ? 'bg-[#182234] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {isBn ? 'কাস্টম CSV রিপোর্ট ডাউনলোড' : 'Categorized CSV Reports'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn ? 'সকল রিপোর্টে কাস্টমার নাম, মোবাইল, একাউন্ট নং ও তারিখ অন্তর্ভুক্ত' : 'Includes summary counts, customer details, dates & status'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={exportAllMasterCSV}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        <div>
                          <p className="font-bold">{isBn ? 'সম্পূর্ণ মাস্টার রেজিস্ট্রি' : 'Master Registry (All)'}</p>
                          <p className="text-[10px] text-slate-400">{chequeCardEntries.length} {isBn ? 'টি রেকর্ড' : 'total recorded items'}</p>
                        </div>
                      </div>
                      <Download className="w-3 h-3 opacity-60" />
                    </button>

                    <button
                      type="button"
                      onClick={exportToCSV}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-blue-500" />
                        <div>
                          <p className="font-bold">{isBn ? 'বর্তমান ফিল্টার্ড ভিউ' : 'Current Filtered View'}</p>
                          <p className="text-[10px] text-slate-400">{filteredEntries.length} {isBn ? 'টি ফিল্টার্ড রেকর্ড' : 'matched items'}</p>
                        </div>
                      </div>
                      <Download className="w-3 h-3 opacity-60" />
                    </button>

                    <button
                      type="button"
                      onClick={exportPendingDetailsCSV}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <div>
                          <p className="font-bold">{isBn ? 'পেন্ডিং ভল্ট আইটেমস' : 'Pending Vault Items'}</p>
                          <p className="text-[10px] text-slate-400">{totalPending} {isBn ? 'টি ভল্ট রেকর্ড' : 'in-vault uncollected'}</p>
                        </div>
                      </div>
                      <Download className="w-3 h-3 opacity-60" />
                    </button>

                    <button
                      type="button"
                      onClick={exportDeliveredDetailsCSV}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <div>
                          <p className="font-bold">{isBn ? 'বিতরণকৃত আইটেমস' : 'Delivered Items'}</p>
                          <p className="text-[10px] text-slate-400">{totalDelivered} {isBn ? 'টি ডেলিভার্ড রেকর্ড' : 'dispatched to customers'}</p>
                        </div>
                      </div>
                      <Download className="w-3 h-3 opacity-60" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pending Details Generate Button (User Request) */}
            <button
              id="generate-pending-csv-btn"
              onClick={exportPendingDetailsCSV}
              title={isBn ? 'সকল অবিতরণকৃত পেন্ডিং চেক বই ও ডেবিট কার্ডের বিস্তারিত রিপোর্ট ডাউনলোড করুন' : 'Download full CSV report of all uncollected pending cheque books and debit cards with date & customer details'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isBn ? `পেন্ডিং ডিটেইলস CSV (${totalPending})` : `Pending Details CSV (${totalPending})`}</span>
            </button>

            {/* Entry Modals */}
            <button
              id="open-cheque-entry-modal-btn"
              onClick={() => openAddEntryModal('CHEQUE')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>+ Cheque Entry</span>
            </button>

            <button
              id="open-card-entry-modal-btn"
              onClick={() => openAddEntryModal('CARD')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>+ Card Entry</span>
            </button>
          </div>
        </div>

        {/* Metric Highlights (5 Interactive Analysis Cards including Validity Cross Section) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" role="region" aria-label="Cheque and Debit Card statistics summary">
          {/* Metric 1: Cheque Books */}
          <div
            id="metric-card-cheque"
            role="button"
            tabIndex={0}
            aria-label={`${totalCheques} Cheque Books total, ${pendingCheques} pending in vault, ${deliveredCheques} delivered. Click to filter cheques.`}
            onClick={() => setActiveFilter('CHEQUE')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveFilter('CHEQUE'); }}
            className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative ${
              activeFilter === 'CHEQUE' || activeFilter === 'PENDING_CHEQUE' || activeFilter === 'DELIVERED_CHEQUE'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : isDark
                ? 'bg-[#182234] border-slate-800/80 hover:border-slate-700'
                : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Cheque Books
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center" aria-hidden="true">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <div className="text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {totalCheques}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Filter ${pendingCheques} pending cheques`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilter('PENDING_CHEQUE');
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer ${
                    activeFilter === 'PENDING_CHEQUE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  P: {pendingCheques}
                </button>
                <button
                  type="button"
                  aria-label={`Filter ${deliveredCheques} delivered cheques`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilter('DELIVERED_CHEQUE');
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer ${
                    activeFilter === 'DELIVERED_CHEQUE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  D: {deliveredCheques}
                </button>
              </div>
            </div>
            <div className={`text-[10px] font-semibold mt-1.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {totalLeavesReceived} cheque leaves in stock
            </div>
          </div>

          {/* Metric 2: Debit Cards */}
          <div
            id="metric-card-card"
            role="button"
            tabIndex={0}
            aria-label={`${totalCards} Debit Cards total, ${pendingCards} pending in vault, ${deliveredCards} delivered. Click to filter debit cards.`}
            onClick={() => setActiveFilter('CARD')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveFilter('CARD'); }}
            className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative ${
              activeFilter === 'CARD' || activeFilter === 'PENDING_CARD' || activeFilter === 'DELIVERED_CARD'
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : isDark
                ? 'bg-[#182234] border-slate-800/80 hover:border-slate-700'
                : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Debit Cards
              </span>
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center" aria-hidden="true">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <div className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                {totalCards}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Filter ${pendingCards} pending cards`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilter('PENDING_CARD');
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer ${
                    activeFilter === 'PENDING_CARD'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  P: {pendingCards}
                </button>
                <button
                  type="button"
                  aria-label={`Filter ${deliveredCards} delivered cards`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilter('DELIVERED_CARD');
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer ${
                    activeFilter === 'DELIVERED_CARD'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500/15 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  D: {deliveredCards}
                </button>
              </div>
            </div>
            <div className={`text-[10px] font-semibold mt-1.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Active card consignments
            </div>
          </div>

          {/* Metric 3: Intake Analysis by Specific Date */}
          <div
            id="metric-card-intake"
            ref={intakePickerRef}
            role="button"
            tabIndex={0}
            aria-label={`${intakeCountOnDate} assets received on intake date ${intakeFilterDate}. Click to view intake records.`}
            onClick={() => setActiveFilter('INTAKE_DATE')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveFilter('INTAKE_DATE'); }}
            className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative ${
              activeFilter === 'INTAKE_DATE'
                ? 'border-amber-500 ring-2 ring-amber-500/20'
                : isDark
                ? 'bg-[#182234] border-slate-800/80 hover:border-slate-700'
                : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Intake Date
              </span>

              <button
                type="button"
                aria-label={`Select intake date, currently ${intakeFilterDate}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsIntakePickerOpen(!isIntakePickerOpen);
                  setIsDeliveredPickerOpen(false);
                }}
                className="px-1.5 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
                <span>{intakeFilterDate === todayStr ? 'Today' : intakeFilterDate.slice(5)}</span>
              </button>
            </div>

            <div className="flex items-baseline justify-between mt-1.5">
              <div className="text-xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {intakeCountOnDate}
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400">{intakeChequesOnDate} Chq</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400">{intakeCardsOnDate} Crd</span>
              </div>
            </div>

            <div className={`text-[10px] font-semibold mt-1.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Received on <span className="font-mono">{intakeFilterDate}</span>
            </div>

            {isIntakePickerOpen &&
              renderCalendarPicker(
                intakeFilterDate,
                intakeViewDate,
                setIntakeViewDate,
                (dateStr) => {
                  setIntakeFilterDate(dateStr);
                  setActiveFilter('INTAKE_DATE');
                  setToast({ message: `Showing intake consignments for: ${dateStr}`, type: 'info' });
                },
                () => setIsIntakePickerOpen(false)
              )}
          </div>

          {/* Metric 4: Delivered Assets */}
          <div
            id="metric-card-delivered"
            ref={deliveredPickerRef}
            role="button"
            tabIndex={0}
            aria-label={`${activeFilter === 'DELIVERED_DATE' ? deliveredCountOnDate : totalDelivered} delivered assets, ${totalPending} pending in vault. Click to view delivered assets.`}
            onClick={() => setActiveFilter('DELIVERED_ALL')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveFilter('DELIVERED_ALL'); }}
            className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative ${
              activeFilter === 'DELIVERED_ALL' || activeFilter === 'DELIVERED_DATE'
                ? 'border-purple-500 ring-2 ring-purple-500/20'
                : isDark
                ? 'bg-[#182234] border-slate-800/80 hover:border-slate-700'
                : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Delivered
              </span>

              <button
                type="button"
                aria-label={`Select delivery date, currently ${deliveredFilterDate}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeliveredPickerOpen(!isDeliveredPickerOpen);
                  setIsIntakePickerOpen(false);
                }}
                className="px-1.5 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-purple-500/15 text-purple-800 dark:text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CalendarCheck className="w-2.5 h-2.5" aria-hidden="true" />
                <span>{deliveredFilterDate === todayStr ? 'Today' : deliveredFilterDate.slice(5)}</span>
              </button>
            </div>

            <div className="flex items-baseline justify-between mt-1.5">
              <div className="text-xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                {activeFilter === 'DELIVERED_DATE' ? deliveredCountOnDate : totalDelivered}
              </div>

              <span className="text-[9px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">
                {totalPending} In Vault
              </span>
            </div>

            <div className={`text-[10px] font-semibold mt-1.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Handed over to client
            </div>

            {isDeliveredPickerOpen &&
              renderCalendarPicker(
                deliveredFilterDate,
                deliveredViewDate,
                setDeliveredViewDate,
                (dateStr) => {
                  setDeliveredFilterDate(dateStr);
                  setActiveFilter('DELIVERED_DATE');
                  setToast({ message: `Showing assets delivered on: ${dateStr}`, type: 'info' });
                },
                () => setIsDeliveredPickerOpen(false)
              )}
          </div>

          {/* Metric 5: Validity Cross (90+ Days Pending & Destruction Tracker) - User Request */}
          <div
            id="metric-card-validity-cross"
            ref={destroyedPickerRef}
            role="button"
            tabIndex={0}
            aria-label={`${validityCrossCount} validity crossed items over 90 days. Click to review validity cross list.`}
            onClick={() => setActiveFilter('VALIDITY_CROSS')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveFilter('VALIDITY_CROSS'); }}
            className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative ${
              activeFilter === 'VALIDITY_CROSS' || activeFilter === 'DESTROYED' || activeFilter === 'DESTROYED_DATE'
                ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5'
                : validityCrossCount > 0
                ? isDark
                  ? 'bg-rose-950/20 border-rose-800/80 hover:border-rose-700'
                  : 'bg-rose-50/70 border-rose-200 hover:border-rose-300 shadow-xs'
                : isDark
                ? 'bg-[#182234] border-slate-800/80 hover:border-slate-700'
                : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold ${validityCrossCount > 0 ? 'text-rose-600 dark:text-rose-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Validity Cross (90+d)
                </span>
              </div>

              {/* Destruction Date Trigger */}
              <button
                type="button"
                aria-label={`Select destruction date, currently ${destroyedFilterDate}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDestroyedPickerOpen(!isDestroyedPickerOpen);
                  setIsIntakePickerOpen(false);
                  setIsDeliveredPickerOpen(false);
                }}
                title="Select Destruction Date to view destroyed records"
                className="px-1.5 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-rose-500/15 text-rose-800 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
                <span>{destroyedFilterDate === todayStr ? 'Today' : destroyedFilterDate.slice(5)}</span>
              </button>
            </div>

            <div className="flex items-baseline justify-between mt-1.5">
              <div className="flex items-baseline gap-1.5">
                <div className="text-xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                  {validityCrossCount}
                </div>
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                  Overdue
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Filter items destroyed on ${destroyedFilterDate}: ${destroyedCountOnDate}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilter('DESTROYED_DATE');
                  }}
                  title={`View items destroyed on ${destroyedFilterDate}`}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer ${
                    activeFilter === 'DESTROYED_DATE'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-500/15 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  On Date: {destroyedCountOnDate}
                </button>
                <button
                  type="button"
                  aria-label={`Filter all destroyed items: ${totalDestroyed}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilter('DESTROYED');
                  }}
                  title="View all items marked as Destroyed"
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer ${
                    activeFilter === 'DESTROYED'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All: {totalDestroyed}
                </button>
              </div>
            </div>

            <div className={`text-[10px] font-semibold mt-1.5 truncate ${validityCrossCount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {validityCrossCount > 0 ? '⚠️ Immediate destruction required' : `Destroyed on ${destroyedFilterDate.slice(5)}: ${destroyedCountOnDate}`}
            </div>

            {isDestroyedPickerOpen &&
              renderCalendarPicker(
                destroyedFilterDate,
                destroyedViewDate,
                setDestroyedViewDate,
                (dateStr) => {
                  setDestroyedFilterDate(dateStr);
                  setActiveFilter('DESTROYED_DATE');
                  setToast({ message: `Showing assets destroyed on: ${dateStr}`, type: 'info' });
                },
                () => setIsDestroyedPickerOpen(false)
              )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div
          className={`p-3 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-[#182234] border-slate-800 shadow-sm' : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none" role="tablist" aria-label="Cheque and card status filters">
            {[
              { id: 'ALL', label: `All (${chequeCardEntries.length})` },
              { id: 'PENDING_ALL', label: `Pending All (${totalPending})` },
              { id: 'PENDING_CHEQUE', label: `Pending Chq (${pendingCheques})` },
              { id: 'PENDING_CARD', label: `Pending Crd (${pendingCards})` },
              {
                id: 'VALIDITY_CROSS',
                label: `⚠️ Validity Cross: 90+d (${validityCrossCount})`,
                alert: validityCrossCount > 0
              },
              { id: 'DESTROYED', label: `🔥 All Destroyed (${totalDestroyed})` },
              {
                id: 'DESTROYED_DATE',
                label: `📅 Destroyed on ${destroyedFilterDate.slice(5)} (${destroyedCountOnDate})`
              },
              { id: 'DELIVERED_ALL', label: `Delivered (${totalDelivered})` },
              { id: 'CHEQUE', label: `Cheques (${totalCheques})` },
              { id: 'CARD', label: `Cards (${totalCards})` }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                role="tab"
                aria-selected={activeFilter === tab.id}
                aria-label={`Filter by ${tab.label}`}
                onClick={() => setActiveFilter(tab.id as RegistryFilterType)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? isDark
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-[#18181B] text-white shadow-sm'
                    : tab.alert
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                    : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="registry-search-input"
              type="text"
              aria-label="Search registry by name, account number, mobile, or CCH"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Account, Mobile, CCH..."
              className={`w-full pl-9 pr-3.5 py-2 rounded-2xl border text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dedicated Validity Cross Compliance Banner when tab is selected */}
      {(activeFilter === 'VALIDITY_CROSS' || activeFilter === 'DESTROYED' || activeFilter === 'DESTROYED_DATE') && (
        <ValidityCrossBanner
          isDark={isDark}
          expiredItemsCount={validityCrossCount}
          totalDestroyedCount={totalDestroyed}
          destroyedFilterDate={destroyedFilterDate}
          onSelectDestroyedDate={(dateStr) => {
            setDestroyedFilterDate(dateStr);
            setActiveFilter('DESTROYED_DATE');
            setToast({ message: `Filtered destruction records for: ${dateStr}`, type: 'info' });
          }}
          destroyedChequesCountOnDate={destroyedChequesOnDate}
          destroyedCardsCountOnDate={destroyedCardsOnDate}
          destroyedTotalOnDate={destroyedCountOnDate}
          activeFilter={activeFilter}
          onSetActiveFilter={(f) => setActiveFilter(f)}
          onSelectDestroy={(entry) => setDestroyPromptEntry(entry)}
        />
      )}

      {/* Prominent Global 90+ Days Expiration Warning Alert Bar (User Request) */}
      {validityCrossCount > 0 && activeFilter !== 'VALIDITY_CROSS' && (
        <div
          id="urgent-validity-cross-alert-box"
          className="p-4 rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-950 dark:text-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-sm animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-rose-700 dark:text-rose-300">
                  ⚠️ AUDIT WARNING: {validityCrossCount} Vault Item{validityCrossCount > 1 ? 's' : ''} Crossed 90 Days Expiry!
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                  Action: Destruction Required / ধ্বংস করতে হবে
                </span>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-200 mt-0.5">
                These cheque books / debit cards have been pending uncollected in the vault for 90+ days. According to BRAC Bank SOP, they must be physically shredded & logged as destroyed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setActiveFilter('VALIDITY_CROSS')}
              className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Review & Destroy {validityCrossCount} Items</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Records Table View */}
      <div
        id="registry-table-container"
        role="region"
        aria-label="Cheque book and debit card registry records table"
        className={`rounded-3xl border overflow-hidden no-print shadow-xs ${
          isDark ? 'bg-[#182234] border-slate-800' : 'bg-white border-slate-200/80'
        }`}
      >
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3" aria-hidden="true">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No records found</h3>
            <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No cheque book or debit card entry matched your current filter criteria.
            </p>
            <button
              onClick={() => openAddEntryModal()}
              aria-label="Record new entry modal"
              className="mt-4 px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Record New Entry</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[620px] overflow-y-auto relative scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs" aria-label="Cheque and debit card records directory table">
              <thead className="sticky top-0 z-20 shadow-xs">
                <tr
                  className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isDark ? 'border-slate-700 bg-[#1E293B] text-slate-200' : 'border-slate-200 bg-[#F1F5F9] text-slate-800'
                  }`}
                >
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20">Asset Type</th>
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20">Account Title / Cardholder</th>
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20">Account Number</th>
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20">Mobile (BD)</th>
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20">Received Date & Live Days</th>
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20">Specifications / CCH</th>
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20">Status & Verification</th>
                  <th scope="col" className="py-3.5 px-4 sticky top-0 bg-inherit z-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEntries.map((item, idx) => {
                  const isCheque = item.type === 'CHEQUE';
                  const isDelivered = item.status === 'DELIVERED_TO_CUSTOMER';
                  const isDestroyed = item.status === 'DESTROYED_EXPIRED';
                  const isPending = item.status === 'RECEIVED';
                  const daysInVault = getDaysInVault(item.receivedDate);
                  const isValidityCrossed = isPending && daysInVault >= 90;
                  const daysOverdue = Math.max(0, daysInVault - 90);

                  const titleOrName = isCheque ? item.accountTitle : item.cardName;
                  const crossRef = accountAssetMap.get(item.accountNumber.trim());
                  const hasDualAssets = crossRef && crossRef.hasCheque && crossRef.hasCard;

                  return (
                    <tr
                      key={`${item.id}-${idx}`}
                      id={`registry-row-${item.id}`}
                      className={`transition-colors ${
                        isValidityCrossed
                          ? isDark
                            ? 'border-l-4 border-l-rose-600 bg-rose-950/30 hover:bg-rose-950/50'
                            : 'border-l-4 border-l-rose-600 bg-rose-50/70 hover:bg-rose-100/70'
                          : isDestroyed
                          ? isDark
                            ? 'bg-slate-900/40 hover:bg-slate-900/60 opacity-85'
                            : 'bg-slate-50/80 hover:bg-slate-100/80 opacity-90'
                          : isDark
                          ? 'hover:bg-slate-800/40'
                          : 'hover:bg-slate-50/90'
                      }`}
                    >
                      {/* Asset Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                              isCheque
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}
                            aria-hidden="true"
                          >
                            {isCheque ? <BookOpen className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {isCheque ? 'Cheque Book' : 'Debit Card'}
                            </span>
                            <div className="text-[10px] font-mono text-slate-400">
                              {item.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account Title / Cardholder with Cross Reference Badge */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-black text-slate-900 dark:text-white break-words text-xs leading-snug">
                          {titleOrName}
                        </div>

                        {/* 90+ Day Overdue Explicit Warning (User Request) */}
                        {isValidityCrossed && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-2xs animate-pulse">
                              <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                              <span>⚠️ 90+ DAYS EXPIRED — MUST DESTROY (৯০+ দিন পার হয়েছে - ধ্বংস করতে হবে)</span>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                            <User className="w-3 h-3" aria-hidden="true" />
                            <span>{item.userName || 'AFO Officer'}</span>
                          </span>

                          {hasDualAssets && (
                            <span
                              title="This customer account has both a Cheque Book and a Debit Card in registry"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
                            >
                              <Link2 className="w-2.5 h-2.5" aria-hidden="true" />
                              {isCheque ? '+ Has Debit Card' : '+ Has Cheque Book'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Account Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-slate-200">
                          <span>{item.accountNumber}</span>
                          <button
                            onClick={() => handleCopy(item.accountNumber, item.id + '-acc')}
                            aria-label={`Copy account number ${item.accountNumber}`}
                            title="Copy Account Number"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            {copiedId === item.id + '-acc' ? (
                              <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                            ) : (
                              <Copy className="w-3 h-3" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-300">
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                          <span>{item.mobileNumber}</span>
                        </div>
                      </td>

                      {/* Received Date & Real-time Live Day Counter */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                                item.receivedDate === todayStr
                                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                                  : isDark
                                  ? 'bg-slate-800 text-slate-300'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {item.receivedDate}
                            </span>
                            {item.receivedDate === todayStr && (
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">TODAY</span>
                            )}
                          </div>

                          {/* Live Day Count */}
                          {isPending ? (
                            <div className="flex items-center gap-1" role="status" aria-label={`Vault storage duration: ${daysInVault} days`}>
                              {isValidityCrossed ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs">
                                  <Flame className="w-2.5 h-2.5" aria-hidden="true" />
                                  <span>{daysInVault}d in Vault (+{daysOverdue}d Expired)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                                  <span>{daysInVault} days in vault</span>
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Specifications / CCH Range */}
                      <td className="py-3.5 px-4">
                        {isCheque ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                              <Layers className="w-2.5 h-2.5" aria-hidden="true" />
                              {(item as ChequeBookRecord).leafCount} LVS
                            </span>
                            <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-extrabold">
                              {(item as ChequeBookRecord).startCchNumber} ➔ {(item as ChequeBookRecord).endCchNumber}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/20">
                              {(item as DebitCardRecord).cardType || 'VISA Contactless Debit'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status & Verification Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1" role="status" aria-label={`Status: ${item.status}`}>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isDelivered
                                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                                  : isDestroyed
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                  : isValidityCrossed
                                  ? 'bg-rose-500 text-white shadow-2xs'
                                  : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {isDelivered ? (
                                <CheckCircle2 className="w-2.5 h-2.5" aria-hidden="true" />
                              ) : isDestroyed ? (
                                <Flame className="w-2.5 h-2.5" aria-hidden="true" />
                              ) : isValidityCrossed ? (
                                <AlertTriangle className="w-2.5 h-2.5" aria-hidden="true" />
                              ) : (
                                <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                              )}
                              <span>
                                {isDelivered
                                  ? 'DELIVERED'
                                  : isDestroyed
                                  ? 'DESTROYED (90+d SOP)'
                                  : isValidityCrossed
                                  ? 'VALIDITY CROSSED (90+d)'
                                  : 'IN STATION VAULT'}
                              </span>
                            </span>
                          </div>

                          {/* Specific Context Dates */}
                          {isDelivered && (
                            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <span className="text-[10px] text-slate-500">Delivered on:</span>
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                {item.deliveryDate || item.receivedDate}
                              </span>
                            </div>
                          )}

                          {isDestroyed && (
                            <div className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1">
                              <span>Destroyed on:</span>
                              <span className="font-mono font-bold">{item.destroyedAt || 'Recorded'}</span>
                            </div>
                          )}

                          {isPending && !isValidityCrossed && (
                            <div className="text-[10px] font-medium text-slate-500">
                              Pending customer collection
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Deliver Prompt Trigger Button (if pending) */}
                          {isPending && (
                            <button
                              id={`deliver-btn-${item.id}`}
                              onClick={() => {
                                setCustomDeliveryDate(todayStr);
                                setDeliveryDatePromptId(item.id);
                              }}
                              aria-label={`Mark ${titleOrName} as delivered to customer`}
                              title="Mark as Delivered to Customer"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              <span>Deliver</span>
                            </button>
                          )}

                          {/* Revert to Pending Action (User Request - allows fixing accidental deliveries) */}
                          {isDelivered && (
                            <button
                              id={`revert-pending-btn-${item.id}`}
                              onClick={() => handleRevertToPending(item)}
                              aria-label={`Revert ${titleOrName} delivered status back to pending in vault`}
                              title="Revert Delivered status back to Pending in Vault"
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" aria-hidden="true" />
                              <span>Pending</span>
                            </button>
                          )}

                          {/* Destroy Button for 90+ Days Expired Items (User Request) */}
                          {(isValidityCrossed || isPending) && (
                            <button
                              id={`destroy-btn-${item.id}`}
                              onClick={() => setDestroyPromptEntry(item)}
                              aria-label={`Record physical destruction for ${titleOrName}`}
                              title="Record physical destruction of uncollected asset (90+ Days SOP)"
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                                isValidityCrossed
                                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md animate-pulse'
                                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{isValidityCrossed ? 'Destroy (ধ্বংস)' : 'Destroy'}</span>
                            </button>
                          )}

                          {/* Revert Destroyed back to Pending if needed */}
                          {isDestroyed && (
                            <button
                              onClick={() => handleRevertToPending(item)}
                              aria-label={`Restore destroyed item ${titleOrName} back to pending in vault`}
                              title="Restore Destroyed item back to Pending in Vault"
                              className="px-2 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" aria-hidden="true" />
                              <span>Restore</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            id={`edit-btn-${item.id}`}
                            onClick={() => openEditEntryModal(item)}
                            aria-label={`Edit record for ${titleOrName}`}
                            title="Edit Record"
                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>

                          {/* View Slip Modal Button */}
                          <button
                            id={`view-slip-btn-${item.id}`}
                            onClick={() => setSelectedEntry(item)}
                            aria-label={`View full delivery or destruction slip for ${titleOrName}`}
                            title="View Full Delivery/Destruction Slip & Print"
                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs'
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>

                          {/* Delete Button */}
                          <button
                            id={`delete-btn-${item.id}`}
                            onClick={() => setDeletingEntry(item)}
                            aria-label={`Delete record for ${titleOrName}`}
                            title="Delete Record"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup Modal */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div
            className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 transition-all animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#182234] border-rose-900/50 text-white'
                : 'bg-white border-rose-100 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Confirm Permanent Delete?
                </h3>
                <p className="text-[11px] font-semibold text-slate-500">Record removal from station vault</p>
              </div>
            </div>

            <div className="my-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Customer Title:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {deletingEntry.type === 'CHEQUE' ? deletingEntry.accountTitle : deletingEntry.cardName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Account No:</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white">{deletingEntry.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Asset Type:</span>
                <span className="font-bold text-rose-700 dark:text-rose-300">
                  {deletingEntry.type === 'CHEQUE' ? 'Cheque Book Consignment' : 'Debit Card Consignment'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to permanently delete this consignment entry? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Delivery Date Confirmation Prompt Modal */}
      {deliveryDatePromptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div
            className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 transition-all ${
              isDark
                ? 'bg-[#182234] border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Confirm Delivery to Customer
                </h3>
                <p className="text-[11px] font-semibold text-slate-500">Record delivery handover date</p>
              </div>
            </div>

            <div className="space-y-3 my-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                  Select Delivery Date:
                </label>
                <input
                  type="date"
                  value={customDeliveryDate}
                  onChange={(e) => setCustomDeliveryDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900 shadow-2xs'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeliveryDatePromptId(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelivery(deliveryDatePromptId)}
                className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Delivered</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physical Destruction Modal with Date Picker (User Request) */}
      {destroyPromptEntry && (
        <DestructionModal
          entry={destroyPromptEntry}
          onClose={() => setDestroyPromptEntry(null)}
          onConfirm={handleConfirmDestruction}
          isDark={isDark}
          daysInVault={getDaysInVault(destroyPromptEntry.receivedDate)}
        />
      )}

      {/* Slip / Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 transition-all ${
              isDark
                ? 'bg-[#182234] border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  {selectedEntry.type === 'CHEQUE' ? <BookOpen className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedEntry.type === 'CHEQUE' ? 'Cheque Book Consignment Slip' : 'Debit Card Delivery Slip'}
                  </h3>
                  <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">{selectedEntry.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Name / Account Title:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                    {selectedEntry.type === 'CHEQUE' ? selectedEntry.accountTitle : selectedEntry.cardName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Account Number:</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white text-xs">{selectedEntry.accountNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Mobile Number (BD):</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">{selectedEntry.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Received Date:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">{selectedEntry.receivedDate}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Vault & Status Tracking:</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                    selectedEntry.status === 'DELIVERED_TO_CUSTOMER'
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                      : selectedEntry.status === 'DESTROYED_EXPIRED'
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                  }`}>
                    {selectedEntry.status === 'DELIVERED_TO_CUSTOMER'
                      ? `DELIVERED: ${selectedEntry.deliveryDate || selectedEntry.receivedDate}`
                      : selectedEntry.status === 'DESTROYED_EXPIRED'
                      ? `DESTROYED ON: ${selectedEntry.destroyedAt || 'Recorded'}`
                      : `${getDaysInVault(selectedEntry.receivedDate)} Days in Vault (Pending)`}
                  </span>
                </div>
              </div>

              {selectedEntry.type === 'CHEQUE' && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">Cheque Book Details:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                      {(selectedEntry as ChequeBookRecord).leafCount} Leaves (LVS)
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    Start CCH: <span className="font-bold">{(selectedEntry as ChequeBookRecord).startCchNumber}</span>
                  </div>
                  <div className="font-mono text-xs">
                    End CCH: <span className="font-bold">{(selectedEntry as ChequeBookRecord).endCchNumber}</span>
                  </div>
                </div>
              )}

              {selectedEntry.type === 'CARD' && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Card Product:</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                      {(selectedEntry as DebitCardRecord).cardType || 'VISA Debit'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Station Outlet:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedEntry.outletName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Recorded By AFO:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedEntry.userName}</span>
                </div>
                {selectedEntry.status === 'DESTROYED_EXPIRED' && selectedEntry.destructionReason && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span className="font-bold">Destruction Reason:</span>
                    <span className="font-semibold">{selectedEntry.destructionReason}</span>
                  </div>
                )}
                {selectedEntry.notes && (
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Notes:</span> {selectedEntry.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-5 pt-3 border-t dark:border-slate-700">
              <button
                onClick={handlePrintSlip}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                  isDark
                    ? 'border-slate-600 text-white bg-slate-800 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>Print Slip</span>
              </button>

              <button
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#18181B] text-white dark:bg-white dark:text-slate-900 shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable A4 Slip Voucher */}
      <PrintableSlipSection entry={selectedEntry} />
    </div>
  );
};
