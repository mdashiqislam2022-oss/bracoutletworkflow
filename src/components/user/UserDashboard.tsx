import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Folder,
  Search,
  SlidersHorizontal,
  Calendar,
  Plus,
  FileText,
  TrendingUp,
  MoreVertical,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Building2,
  BookOpen,
  CreditCard,
  UserCheck,
  Eye,
  ChevronRight,
  ShieldCheck,
  X,
  Layers,
  Banknote,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { WorkSubmission, ChequeCardEntry, LoanAccountRecord, ChequeBookRecord, DebitCardRecord } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { t } from '../../utils/translations';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    userSubmissions,
    setActiveNavTab,
    outlets,
    userPreferences,
    openAddEntryModal,
    chequeCardEntries,
    loanRecords,
    addToast
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const currentLang = userPreferences.language || 'en';
  const isBn = currentLang === 'bn';
  const langText = t[currentLang] || t.en;

  const [activeSlip, setActiveSlip] = useState<WorkSubmission | null>(null);
  const [dateRange, setDateRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState<'ALL' | 'CHEQUE' | 'CARD' | 'LOAN' | 'SUBMISSION'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'OVERDUE'>('ALL');
  
  // Weekly flow interactive weekday filter (0 = Sun, 1 = Mon, ..., 6 = Sat, null = all days)
  const [selectedWeekday, setSelectedWeekday] = useState<number | null>(null);

  // Refresh animation key
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        // preserve typed query if any
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast(isBn ? 'ড্যাশবোর্ড তথ্য সফলভাবে রিফ্রেশ হয়েছে।' : 'Dashboard data refreshed successfully.', 'success');
    }, 450);
  };

  if (!currentUser) return null;

  // Split Cheques & Cards (Supporting both .type and .entryType)
  const chequeBooks = useMemo(
    () => chequeCardEntries.filter((e): e is ChequeBookRecord => e.type === 'CHEQUE' || (e as any).entryType === 'CHEQUE'),
    [chequeCardEntries]
  );
  const debitCards = useMemo(
    () => chequeCardEntries.filter((e): e is DebitCardRecord => e.type === 'CARD' || (e as any).entryType === 'CARD'),
    [chequeCardEntries]
  );

  // Metrics Calculations
  const totalCheques = chequeBooks.length;
  const chequesInStock = chequeBooks.filter((c) => c.status === 'RECEIVED').length;
  const chequesDelivered = chequeBooks.filter((c) => c.status === 'DELIVERED_TO_CUSTOMER').length;
  const totalChequeLeaves = chequeBooks.reduce((sum, c) => sum + (c.leafCount || 20), 0);

  const totalCards = debitCards.length;
  const cardsInStock = debitCards.filter((c) => c.status === 'RECEIVED').length;
  const cardsDelivered = debitCards.filter((c) => c.status === 'DELIVERED_TO_CUSTOMER').length;
  const dualCurrencyCards = debitCards.filter((d) => d.cardType?.toLowerCase().includes('dual')).length;

  const totalLoans = loanRecords.length;
  const activeLoans = loanRecords.filter((l) => l.loanStatus === 'ACTIVE');
  const closedLoans = loanRecords.filter((l) => l.loanStatus === 'CLOSED');
  const overdueLoans = loanRecords.filter((l) => l.loanStatus === 'OVERDUE' || l.loanStatus === 'DEFAULTED');

  const totalLoanSanctioned = loanRecords.reduce((sum, l) => sum + (l.loanAmount || 0), 0);
  const activeLoanSanctioned = activeLoans.reduce((sum, l) => sum + (l.loanAmount || 0), 0);
  const totalMonthlyEmi = activeLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
  const peakLoanAmount = loanRecords.length > 0 ? Math.max(...loanRecords.map((l) => l.loanAmount || 0)) : (totalLoanSanctioned > 0 ? totalLoanSanctioned : 250000);

  const totalSubmissions = userSubmissions.length;
  const grandTotal = totalCheques + totalCards + totalLoans + totalSubmissions;

  // Percentage Calculations for Radial Donut (Live Analysis)
  const registryItemSum = Math.max(1, totalCheques + totalCards + totalLoans);
  const chequePct = Math.round((totalCheques / registryItemSum) * 100);
  const cardPct = Math.round((totalCards / registryItemSum) * 100);
  const loanPct = Math.max(0, 100 - chequePct - cardPct);

  // Delivered ratio
  const totalDelivered = chequesDelivered + cardsDelivered + closedLoans.length;
  const deliveredRatio = grandTotal > 0 ? Math.min(100, Math.round((totalDelivered / grandTotal) * 100)) : 70;
  const inStockRatio = 100 - deliveredRatio;

  // Dynamic 5-Month timeline and data curve for Card D
  const monthlyActivity = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number; monthKey: string; val: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label, count: 0, monthKey, val: 0 });
    }

    const checkDate = (dStr?: string) => {
      if (!dStr) return;
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const m = months.find((item) => item.monthKey === key);
      if (m) m.count++;
    };

    chequeBooks.forEach((c) => checkDate(c.receivedDate || c.createdAt));
    debitCards.forEach((d) => checkDate(d.receivedDate || d.createdAt));
    loanRecords.forEach((l) => checkDate(l.disbursementDate || l.createdAt));
    userSubmissions.forEach((s) => checkDate(s.submittedAt));

    const totalLive = grandTotal;
    return months.map((m, idx) => {
      const dynamicWeight = m.count > 0 
        ? m.count 
        : [Math.max(2, Math.round(totalLive * 0.15)), Math.max(4, Math.round(totalLive * 0.35)), Math.max(3, Math.round(totalLive * 0.8)), Math.max(5, Math.round(totalLive * 0.95)), Math.max(2, Math.round(totalLive * 0.5))][idx] || 2;
      return { ...m, val: dynamicWeight };
    });
  }, [chequeBooks, debitCards, loanRecords, userSubmissions, grandTotal]);

  // Compute Bezier points across 400x100 SVG viewbox
  const curveDetails = useMemo(() => {
    const vals = monthlyActivity.map((m) => m.val);
    const maxVal = Math.max(...vals, 1);
    const xCoords = [20, 110, 200, 290, 380];
    const yCoords = vals.map((v) => Math.round(80 - (v / maxVal) * 55));

    let peakIdx = 3;
    let highest = -1;
    vals.forEach((v, idx) => {
      if (v > highest) {
        highest = v;
        peakIdx = idx;
      }
    });

    const p0 = { x: xCoords[0], y: yCoords[0] };
    const p1 = { x: xCoords[1], y: yCoords[1] };
    const p2 = { x: xCoords[2], y: yCoords[2] };
    const p3 = { x: xCoords[3], y: yCoords[3] };
    const p4 = { x: xCoords[4], y: yCoords[4] };

    const pathString = `M ${p0.x},${p0.y} C ${(p0.x + p1.x) / 2},${p0.y} ${(p0.x + p1.x) / 2},${p1.y} ${p1.x},${p1.y} C ${(p1.x + p2.x) / 2},${p1.y} ${(p1.x + p2.x) / 2},${p2.y} ${p2.x},${p2.y} C ${(p2.x + p3.x) / 2},${p2.y} ${(p2.x + p3.x) / 2},${p3.y} ${p3.x},${p3.y} C ${(p3.x + p4.x) / 2},${p3.y} ${(p3.x + p4.x) / 2},${p4.y} ${p4.x},${p4.y}`;

    const peakX = xCoords[peakIdx];
    const peakY = yCoords[peakIdx];
    const peakPctRight = `${Math.max(10, Math.min(65, Math.round(100 - (peakX / 400) * 100 - 6)))}%`;

    return {
      pathString,
      peakX,
      peakY,
      peakIdx,
      peakMonth: monthlyActivity[peakIdx]?.label || 'Peak',
      peakPctRight
    };
  }, [monthlyActivity]);

  // Weekday distribution calculation for Weekly Flow
  const weekdayStats = useMemo(() => {
    // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const inStockCounts = [0, 0, 0, 0, 0, 0, 0];

    const parseDay = (dateStr?: string | Date): number => {
      if (!dateStr) return 4; // fallback Thursday
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 4 : d.getDay();
    };

    chequeBooks.forEach((c) => {
      const day = parseDay(c.receivedDate || c.createdAt);
      counts[day]++;
      if (c.status === 'RECEIVED') inStockCounts[day]++;
    });

    debitCards.forEach((d) => {
      const day = parseDay(d.receivedDate || d.createdAt);
      counts[day]++;
      if (d.status === 'RECEIVED') inStockCounts[day]++;
    });

    loanRecords.forEach((l) => {
      const day = parseDay(l.disbursementDate || l.createdAt);
      counts[day]++;
      if (l.loanStatus === 'ACTIVE') inStockCounts[day]++;
    });

    userSubmissions.forEach((s) => {
      const day = parseDay(s.submittedAt);
      counts[day]++;
      if (s.status !== 'DELIVERED_TO_CUSTOMER') inStockCounts[day]++;
    });

    return { counts, inStockCounts };
  }, [chequeBooks, debitCards, loanRecords, userSubmissions]);

  const weekdaysList = [
    { idx: 0, name: 'Sun', bnName: 'রবি' },
    { idx: 1, name: 'Mon', bnName: 'সোম' },
    { idx: 2, name: 'Tue', bnName: 'মঙ্গল' },
    { idx: 3, name: 'Wed', bnName: 'বুধ' },
    { idx: 4, name: 'Thu', bnName: 'বৃহ' },
    { idx: 5, name: 'Fri', bnName: 'শুক্র' },
    { idx: 6, name: 'Sat', bnName: 'শনি' },
  ];

  // Active volume count based on weekday filter
  const displayedWeeklyCount = selectedWeekday !== null
    ? weekdayStats.counts[selectedWeekday]
    : totalCheques + totalCards + totalLoans;

  const displayedWeeklyInStock = selectedWeekday !== null
    ? weekdayStats.inStockCounts[selectedWeekday]
    : chequesInStock + cardsInStock;

  // Universal Search Filter across ALL Datasets
  const query = searchTerm.toLowerCase().trim();

  const searchResults = useMemo(() => {
    if (!query) return { cheques: [], cards: [], loans: [], submissions: [], total: 0 };

    const matchedCheques = chequeBooks.filter(
      (c) =>
        c.accountTitle.toLowerCase().includes(query) ||
        c.accountNumber.includes(query) ||
        c.mobileNumber.includes(query) ||
        c.startCchNumber.toLowerCase().includes(query) ||
        c.endCchNumber.toLowerCase().includes(query) ||
        (c.notes && c.notes.toLowerCase().includes(query))
    );

    const matchedCards = debitCards.filter(
      (d) =>
        d.cardName.toLowerCase().includes(query) ||
        d.accountNumber.includes(query) ||
        d.mobileNumber.includes(query) ||
        (d.cardType && d.cardType.toLowerCase().includes(query)) ||
        (d.notes && d.notes.toLowerCase().includes(query))
    );

    const matchedLoans = loanRecords.filter(
      (l) =>
        l.accountTitle.toLowerCase().includes(query) ||
        l.customerName.toLowerCase().includes(query) ||
        l.loanAccountNumber.includes(query) ||
        l.mobileNumber.includes(query) ||
        l.loanStatus.toLowerCase().includes(query) ||
        (l.notes && l.notes.toLowerCase().includes(query))
    );

    const matchedSubmissions = userSubmissions.filter(
      (s) =>
        s.customerName.toLowerCase().includes(query) ||
        s.trackingNo.toLowerCase().includes(query) ||
        s.accountOrCardNumber.includes(query) ||
        s.customerPhone.includes(query)
    );

    const total =
      matchedCheques.length + matchedCards.length + matchedLoans.length + matchedSubmissions.length;

    return {
      cheques: matchedCheques,
      cards: matchedCards,
      loans: matchedLoans,
      submissions: matchedSubmissions,
      total
    };
  }, [query, chequeBooks, debitCards, loanRecords, userSubmissions]);

  // Combined records for the table
  interface UnifiedRow {
    id: string;
    type: 'CHEQUE' | 'CARD' | 'LOAN' | 'SUBMISSION';
    title: string;
    subTitle: string;
    accountOrId: string;
    categoryText: string;
    statusText: string;
    statusType: 'ACTIVE' | 'DELIVERED' | 'OVERDUE' | 'PENDING';
    dateText: string;
    dateObj: Date;
    weekday: number;
    rawItem: any;
  }

  const unifiedRows = useMemo(() => {
    const rows: UnifiedRow[] = [];

    const getSafeDate = (dStr?: string | Date): { str: string; obj: Date; day: number } => {
      if (!dStr) {
        const now = new Date();
        return { str: now.toISOString().split('T')[0], obj: now, day: now.getDay() };
      }
      const parsed = new Date(dStr);
      if (isNaN(parsed.getTime())) {
        const now = new Date();
        return { str: String(dStr), obj: now, day: now.getDay() };
      }
      return { str: parsed.toISOString().split('T')[0], obj: parsed, day: parsed.getDay() };
    };

    // Add Cheques
    chequeBooks.forEach((c) => {
      const dt = getSafeDate(c.receivedDate || c.createdAt);
      rows.push({
        id: `cheque-${c.id}`,
        type: 'CHEQUE',
        title: c.accountTitle,
        subTitle: c.mobileNumber,
        accountOrId: c.accountNumber,
        categoryText: `Cheque (${c.leafCount} Leaf)`,
        statusText: c.status.replace(/_/g, ' '),
        statusType: c.status === 'DELIVERED_TO_CUSTOMER' ? 'DELIVERED' : c.status === 'RECEIVED' ? 'ACTIVE' : 'OVERDUE',
        dateText: dt.str,
        dateObj: dt.obj,
        weekday: dt.day,
        rawItem: c
      });
    });

    // Add Debit Cards
    debitCards.forEach((d) => {
      const dt = getSafeDate(d.receivedDate || d.createdAt);
      rows.push({
        id: `card-${d.id}`,
        type: 'CARD',
        title: d.cardName,
        subTitle: d.mobileNumber,
        accountOrId: d.accountNumber,
        categoryText: `Debit Card (${d.cardType || 'Regular'})`,
        statusText: d.status.replace(/_/g, ' '),
        statusType: d.status === 'DELIVERED_TO_CUSTOMER' ? 'DELIVERED' : d.status === 'RECEIVED' ? 'ACTIVE' : 'OVERDUE',
        dateText: dt.str,
        dateObj: dt.obj,
        weekday: dt.day,
        rawItem: d
      });
    });

    // Add Loans
    loanRecords.forEach((l) => {
      const dt = getSafeDate(l.disbursementDate || l.createdAt);
      rows.push({
        id: `loan-${l.id}`,
        type: 'LOAN',
        title: l.accountTitle,
        subTitle: `${l.customerName} • ৳${l.loanAmount.toLocaleString()}`,
        accountOrId: l.loanAccountNumber,
        categoryText: `Loan (${l.loanTenureYears}y • EMI: ৳${l.monthlyInstallment})`,
        statusText: l.loanStatus,
        statusType: l.loanStatus === 'ACTIVE' ? 'ACTIVE' : l.loanStatus === 'CLOSED' ? 'DELIVERED' : 'OVERDUE',
        dateText: dt.str,
        dateObj: dt.obj,
        weekday: dt.day,
        rawItem: l
      });
    });

    // Add Submissions
    userSubmissions.forEach((s) => {
      const dt = getSafeDate(s.submittedAt);
      rows.push({
        id: `sub-${s.id}`,
        type: 'SUBMISSION',
        title: s.customerName,
        subTitle: s.customerPhone,
        accountOrId: s.accountOrCardNumber,
        categoryText: s.serviceCategory.replace(/_/g, ' '),
        statusText: s.status.replace(/_/g, ' '),
        statusType: s.status === 'DELIVERED_TO_CUSTOMER' ? 'DELIVERED' : 'PENDING',
        dateText: dt.str,
        dateObj: dt.obj,
        weekday: dt.day,
        rawItem: s
      });
    });

    // Sort newest date first
    return rows.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [chequeBooks, debitCards, loanRecords, userSubmissions]);

  // Filter table rows
  const filteredTableRows = useMemo(() => {
    return unifiedRows.filter((row) => {
      // Tab filter
      if (activeTableTab === 'CHEQUE' && row.type !== 'CHEQUE') return false;
      if (activeTableTab === 'CARD' && row.type !== 'CARD') return false;
      if (activeTableTab === 'LOAN' && row.type !== 'LOAN') return false;
      if (activeTableTab === 'SUBMISSION' && row.type !== 'SUBMISSION') return false;

      // Status Filter
      if (selectedStatusFilter === 'ACTIVE' && row.statusType !== 'ACTIVE' && row.statusType !== 'PENDING') return false;
      if (selectedStatusFilter === 'DELIVERED' && row.statusType !== 'DELIVERED') return false;
      if (selectedStatusFilter === 'OVERDUE' && row.statusType !== 'OVERDUE') return false;

      // Weekday filter (if user selected one in Weekly Flow)
      if (selectedWeekday !== null && row.weekday !== selectedWeekday) return false;

      // Date Range Filter
      if (dateRange !== 'ALL') {
        const rowTime = row.dateObj.getTime();
        const now = new Date();
        if (dateRange === 'TODAY') {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          if (rowTime < todayStart) return false;
        } else if (dateRange === 'WEEK') {
          const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
          if (rowTime < sevenDaysAgo) return false;
        } else if (dateRange === 'MONTH') {
          const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
          if (rowTime < thirtyDaysAgo) return false;
        }
      }

      // Query filter
      if (query) {
        const matches =
          row.title.toLowerCase().includes(query) ||
          row.subTitle.toLowerCase().includes(query) ||
          row.accountOrId.includes(query) ||
          row.categoryText.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [unifiedRows, activeTableTab, selectedStatusFilter, selectedWeekday, dateRange, query]);

  const hasActiveCustomFilters =
    selectedStatusFilter !== 'ALL' ||
    activeTableTab !== 'ALL' ||
    selectedWeekday !== null ||
    dateRange !== 'ALL' ||
    Boolean(searchTerm);

  return (
    <div key={refreshKey} className="space-y-6">
      {/* 1. Sticky Sub-Header Bar (Breadcrumbs, Title & Controls) - Matches image.png */}
      <div className={`sticky top-[106px] sm:top-[112px] z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-3 -mt-2 mb-4 border-b transition-all backdrop-blur-md ${
        isDark ? 'bg-[#131B2A]/80 border-slate-800/60' : 'bg-[#F7F9FB]/80 border-slate-200/50'
      }`}>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Folder className="w-3.5 h-3.5 text-slate-400" />
            <span>{langText.homePage}</span>
            <span>→</span>
            <Folder className="w-3.5 h-3.5 text-slate-400" />
            <span className={isDark ? 'text-slate-300 font-semibold' : 'text-slate-600 font-semibold'}>
              {langText.dashboard}
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {langText.financeOverview}
          </h1>
        </div>

        {/* Action Controls: Search, Filter, Date Range, Refresh Button, Add Entry, Report */}
        <div className="flex flex-wrap items-center gap-2 relative" ref={searchContainerRef}>
          {/* Circular / Expandable Search */}
          <div className="relative">
            {isSearchOpen ? (
              <div
                className={`flex items-center rounded-full px-3 py-1.5 border shadow-2xs transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isBn ? 'নাম, একাউন্ট নং, মোবাইল, CCH খুঁজুন...' : 'Search Name, A/C, Phone, CCH...'}
                  className="text-xs bg-transparent focus:outline-none w-44 sm:w-56 text-inherit font-medium placeholder:text-slate-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-slate-400 hover:text-slate-600 mr-1 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchTerm('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs cursor-pointer transition-all ${
                  searchTerm
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
                title={isBn ? 'ইউজার ডাটা খুঁজুন (নাম, মোবাইল, একাউন্ট নং)' : 'Search all records'}
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Live Search Quick Results Dropdown */}
            {isSearchOpen && query && (
              <div
                className={`absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 text-xs font-bold">
                  <span>
                    {isBn ? 'অনুসন্ধান ফলাফল' : 'Search Results'} ({searchResults.total})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    &quot;{searchTerm}&quot;
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-1 text-xs">
                  {searchResults.total === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      {isBn ? 'কোন তথ্য পাওয়া যায়নি।' : 'No matching records found across user data.'}
                    </div>
                  ) : (
                    <>
                      {/* Cheques */}
                      {searchResults.cheques.map((c) => (
                        <div
                          key={`res-c-${c.id}`}
                          onClick={() => {
                            setActiveNavTab('cheque_cards');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-emerald-500/10 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold truncate text-slate-900 dark:text-white flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{c.accountTitle}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              A/C: {c.accountNumber} • {c.leafCount} Leaves
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shrink-0">
                            {c.status}
                          </span>
                        </div>
                      ))}

                      {/* Debit Cards */}
                      {searchResults.cards.map((d) => (
                        <div
                          key={`res-d-${d.id}`}
                          onClick={() => {
                            setActiveNavTab('cheque_cards');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-indigo-500/10 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold truncate text-slate-900 dark:text-white flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">{d.cardName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              A/C: {d.accountNumber} • {d.cardType || 'Regular Debit'}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 shrink-0">
                            {d.status}
                          </span>
                        </div>
                      ))}

                      {/* Loans */}
                      {searchResults.loans.map((l) => (
                        <div
                          key={`res-l-${l.id}`}
                          onClick={() => {
                            setActiveNavTab('loan_accounts');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-amber-500/10 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold truncate text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Banknote className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate">{l.accountTitle}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Loan: {l.loanAccountNumber} • ৳{l.loanAmount.toLocaleString()}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 shrink-0">
                            {l.loanStatus}
                          </span>
                        </div>
                      ))}

                      {/* Submissions */}
                      {searchResults.submissions.map((s) => (
                        <div
                          key={`res-s-${s.id}`}
                          onClick={() => {
                            setActiveSlip(s);
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-sky-500/10 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold truncate text-slate-900 dark:text-white flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span className="truncate">{s.customerName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Track: {s.trackingNo} • {s.serviceCategory}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-300 shrink-0">
                            View Slip
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Filter & Scope Button */}
          <button
            id="dashboard-filter-scope-btn"
            onClick={() => setIsFilterModalOpen(true)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs cursor-pointer transition-all relative ${
              hasActiveCustomFilters
                ? 'bg-emerald-500 text-white border-emerald-500 ring-2 ring-emerald-500/30'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title={isBn ? 'আউটলেট ফিল্টার ও স্কোপ সেটিংস' : 'Filter records & station scope'}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveCustomFilters && (
              <span className="w-2 h-2 rounded-full bg-white dark:bg-slate-900 absolute top-1.5 right-1.5 shadow-xs" />
            )}
          </button>

          {/* Manual Refresh Button (Spinning + Toast Trigger) */}
          <button
            id="dashboard-refresh-btn"
            onClick={handleManualRefresh}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs cursor-pointer transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title={isBn ? 'ড্যাশবোর্ড রিফ্রেশ করুন' : 'Refresh Dashboard'}
          >
            <RotateCcw className={`w-4 h-4 text-emerald-500 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Date range quick selector */}
          <button
            onClick={() => {
              if (dateRange === 'ALL') setDateRange('TODAY');
              else if (dateRange === 'TODAY') setDateRange('WEEK');
              else if (dateRange === 'WEEK') setDateRange('MONTH');
              else setDateRange('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold shadow-2xs cursor-pointer transition-colors ${
              dateRange !== 'ALL'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title="Click to cycle timeframe"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {dateRange === 'ALL'
                ? isBn ? 'সকল সময়' : 'All Time'
                : dateRange === 'TODAY'
                ? isBn ? 'আজকের ডাটা' : 'Today'
                : dateRange === 'WEEK'
                ? isBn ? 'গত ৭ দিন' : 'Last 7 Days'
                : isBn ? 'চলতি মাস' : 'This Month'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">▾</span>
          </button>

          {/* Add Widget / New Entry Pill */}
          <button
            id="dashboard-add-entry-btn"
            onClick={() => openAddEntryModal('CHOICE')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold shadow-2xs cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>{langText.addEntry}</span>
          </button>

          {/* Create a Report Pill */}
          <button
            onClick={() => {
              if (userSubmissions.length > 0) {
                setActiveSlip(userSubmissions[0]);
              } else if (chequeBooks.length > 0) {
                setActiveNavTab('cheque_cards');
              } else {
                setActiveNavTab('loan_accounts');
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold shadow-2xs cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <span>{langText.createReport}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Dashboard Bento Grid (Card A, Card B, Card C, Card D, Card E) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card A: Left Tall Card (AFO Station / Outlet Hub) */}
        <div
          style={{ animationDelay: '0ms' }}
          role="region"
          aria-label={isBn ? 'সক্রিয় এএফও আউটলেট হাব' : 'Active AFO Station and Outlet Hub'}
          className={`lg:col-span-3 rounded-[24px] p-5 flex flex-col justify-between min-h-[380px] shadow-xs border transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 group animate-dashboard-card ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700 text-white' 
              : 'bg-[#E8EDF2] border-slate-200/60 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {langText.activeStation}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" title="Live Station" />
            <span className="sr-only">Station Status: Live Online</span>
          </div>

          <div className="my-auto space-y-4 text-center">
            {/* Live Records Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
              isDark ? 'bg-slate-900/90 text-[#D4F63D]' : 'bg-[#18181B] text-white'
            }`}>
              <span>{grandTotal} {isBn ? 'সর্বমোট রেকর্ড' : 'Live Records'}</span>
            </div>

            <div className="space-y-1">
              <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentUser.outletName}
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                AFO: {currentUser.fullName} ({currentUser.employeeId})
              </p>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                {currentUser.outletLocation}
              </div>
            </div>

            {/* Smooth Sine Wave Illustration with Hover Zoom */}
            <div className="py-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <svg
                role="img"
                aria-label={isBn ? "লাইভ স্টেশন অপারেশনাল তরঙ্গের অ্যানিমেশন চিত্র" : "Live station operational activity waveform"}
                className="w-32 h-10 overflow-visible animate-wave-drift"
                viewBox="0 0 120 40"
              >
                <title>{isBn ? 'স্টেশন অপারেশন তরঙ্গ' : 'Station Activity Wave'}</title>
                <path
                  d="M 0,20 Q 30,0 60,20 T 120,20"
                  fill="none"
                  stroke={isDark ? '#D4F63D' : '#18181B'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-draw-sine"
                />
                <circle
                  cx="60"
                  cy="20"
                  r="5"
                  fill="#D4F63D"
                  stroke="#18181B"
                  strokeWidth="2"
                  className="animate-graph-dot"
                />
              </svg>
            </div>
          </div>

          {/* Profile & Station Link Button */}
          <button
            onClick={() => setActiveNavTab('profile')}
            aria-label={isBn ? `প্রোফাইল ও আউটলেট তথ্য দেখুন - ${currentUser.fullName}, ${currentUser.outletName}` : `View AFO Profile & Station details for ${currentUser.fullName}, ${currentUser.outletName}`}
            className={`w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              isDark 
                ? 'bg-white hover:bg-slate-100 text-slate-900' 
                : 'bg-[#18181B] hover:bg-black text-white'
            }`}
          >
            <span>{isBn ? 'প্রোফাইল ও আউটলেট তথ্য' : 'AFO Profile & Station'}</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-white/20 text-white'}`} aria-hidden="true">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Right 9-Columns Bento Area */}
        <div className="lg:col-span-9 space-y-5">
          
          {/* Top Row: Intake & Operations (Weekly Flow) + Total Loan Portfolio */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Card B: Intake & Operations / Interactive Weekly Flow (5-cols) */}
            <div
              style={{ animationDelay: '60ms' }}
              role="region"
              aria-label={isBn ? 'ইনটেক ও রেজিস্ট্রি ভলিউম, সাপ্তাহিক প্রবাহ গ্রাফ' : 'Intake and Operations weekly volume chart and day-by-day filter'}
              className={`md:col-span-5 rounded-[24px] p-5 flex flex-col justify-between shadow-2xs border transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 group animate-dashboard-card ${
                isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  {isBn ? 'ইনটেক ও রেজিস্ট্রি ভলিউম' : 'Intake & Operations'}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {selectedWeekday !== null
                    ? `${weekdaysList[selectedWeekday].name} Volume`
                    : (isBn ? 'সাপ্তাহিক প্রবাহ' : 'Weekly Flow')}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-3">
                <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`} aria-label={`${displayedWeeklyCount} total weekly operations items`}>
                  {displayedWeeklyCount}
                </span>
                <div className="px-2.5 py-1 rounded-full bg-[#D4F63D] text-slate-900 text-[11px] font-black tracking-tight shadow-xs" aria-label={`${displayedWeeklyInStock} in-stock items`}>
                  {displayedWeeklyInStock} In-Stock
                </div>
              </div>

              {/* Day Markers Timeline with Interactive Click Filtering */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400" role="group" aria-label={isBn ? 'দিন ভিত্তিক ফিল্টার বাটন' : 'Day of week filter buttons'}>
                  {weekdaysList.map((day) => {
                    const isSelected = selectedWeekday === day.idx;
                    const count = weekdayStats.counts[day.idx];
                    return (
                      <button
                        key={day.name}
                        onClick={() => {
                          if (selectedWeekday === day.idx) {
                            setSelectedWeekday(null);
                          } else {
                            setSelectedWeekday(day.idx);
                          }
                        }}
                        aria-pressed={isSelected}
                        aria-label={`${day.name} (${day.bnName}): ${count} items. ${isSelected ? 'Filter active. Click to clear.' : 'Click to filter table by this day.'}`}
                        className={`transition-all duration-150 cursor-pointer select-none rounded-lg px-1.5 py-0.5 ${
                          isSelected
                            ? 'bg-[#D4F63D] text-slate-900 font-black shadow-xs scale-105'
                            : 'hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title={`${day.name}: ${count} records (Click to filter)`}
                      >
                        <span>{isBn ? day.bnName : day.name}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedWeekday !== null && (
                  <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5" role="status">
                    <span>
                      {isBn ? `${weekdaysList[selectedWeekday].bnName}বারের ফিল্টার সক্রিয়` : `Filtered by ${weekdaysList[selectedWeekday].name}`} ({displayedWeeklyCount} items)
                    </span>
                    <button
                      onClick={() => setSelectedWeekday(null)}
                      aria-label={isBn ? 'দিন ভিত্তিক ফিল্টার রিসেট করুন' : 'Reset day filter to show all weekdays'}
                      className="underline text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {isBn ? 'রিসেট' : 'Reset'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card C: Total Balance / Loan Sanction Portfolio (7-cols) */}
            <div
              style={{ animationDelay: '120ms' }}
              role="region"
              aria-label={isBn ? 'মোট লোন স্যাংশন পোর্টফোলিও এবং ইএমআই বিবরণী' : 'Total Loan Sanction Portfolio and Monthly EMI recovery summary'}
              className={`md:col-span-7 rounded-[24px] p-5 shadow-2xs border flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 group animate-dashboard-card ${
                isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              
              {/* Left Balance Metric */}
              <div className="w-full sm:w-1/2 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {isBn ? 'মোট লোন স্যাংশন পোর্টফোলিও' : 'Total Loan Portfolio'}
                </span>
                <div className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`} aria-label={`Total loan portfolio sanctioned: ${totalLoanSanctioned.toLocaleString()} BDT`}>
                  ৳{totalLoanSanctioned.toLocaleString()}
                </div>
                
                {/* Delivered % vs In-Stock % Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>Delivered ({deliveredRatio}%)</span>
                    <span>In-Stock ({inStockRatio}%)</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={deliveredRatio}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Inventory distribution: ${deliveredRatio}% Delivered to customer, ${inStockRatio}% In-Stock in branch vault`}
                    className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex"
                  >
                    <div style={{ width: `${deliveredRatio}%` }} className="bg-slate-900 dark:bg-white transition-all duration-500"></div>
                    <div style={{ width: `${inStockRatio}%` }} className="bg-[#D4F63D] transition-all duration-500"></div>
                  </div>
                </div>
              </div>

              {/* Right Pastel Mint Card - REFACTORED TO LOAN SANCTIONS & EMI STREAM */}
              <div
                onClick={() => setActiveNavTab('loan_accounts')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveNavTab('loan_accounts');
                  }
                }}
                aria-label={`View Loan Account Details: Monthly EMI stream ৳${totalMonthlyEmi.toLocaleString()}, ${activeLoans.length} active loans, ${closedLoans.length} settled loans, ${overdueLoans.length} overdue`}
                className="w-full sm:w-1/2 bg-[#BCE6CD] text-slate-900 rounded-[20px] p-4 flex flex-col justify-between min-h-[135px] shadow-sm hover:scale-[1.025] hover:shadow-md transition-all duration-300 cursor-pointer group"
                title="View Loan Account Details"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 flex items-center gap-1">
                    <Banknote className="w-3 h-3 text-slate-800" aria-hidden="true" />
                    <span>LOAN & EMI RECOVERY</span>
                  </span>
                  <div className="px-1.5 py-0.5 rounded bg-slate-900/10 flex items-center justify-center font-black text-[8px] tracking-wider text-slate-900">
                    SME LOAN
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2">
                  <div>
                    <span className="text-[10px] text-slate-600 block font-semibold">
                      Monthly EMI Stream
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 block">
                      ৳{totalMonthlyEmi.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-600 block font-semibold">Live Accounts</span>
                    <span className="font-mono text-xs font-black text-slate-900">
                      {activeLoans.length} Active / {closedLoans.length} Settled
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-600 pt-1 border-t border-slate-900/10 flex items-center justify-between">
                  <span>Overdue: {overdueLoans.length} Accounts</span>
                  <span className="font-bold text-slate-900 group-hover:underline flex items-center gap-0.5">
                    Details <ChevronRight className="w-2.5 h-2.5" aria-hidden="true" />
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Row: Activity Flow (Bezier graph) + Contract Type Radial Donut */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Card D: Total Operational Activity Flow (7-cols) */}
            <div
              style={{ animationDelay: '180ms' }}
              role="region"
              aria-label={isBn ? 'মাসিক কার্যক্রম ও সাবমিশন গ্রাফ' : 'Operational Activity and Loan Sanction Flow Graph'}
              className={`md:col-span-7 rounded-[24px] p-5 shadow-2xs border flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 group animate-dashboard-card ${
                isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {isBn ? 'কার্যক্রম ও সাবমিশন গ্রাফ' : 'Operational Activity Flow'}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`} aria-label={`${grandTotal} total items and files`}>
                      {grandTotal} {isBn ? 'মোট ফাইল ও আইটেম' : 'Total Items'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold" aria-label={`${activeLoans.length} active loan files`}>
                      {activeLoans.length} Active Loans
                    </span>
                  </div>
                </div>

                {/* Wallets / Assets Tags */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                  }`} aria-label={`${outlets.length} active station outlets`}>
                    {outlets.length} {langText.wallets}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                  }`} aria-label={`${totalCheques + totalCards} total cards and cheques in inventory`}>
                    {totalCheques + totalCards} {isBn ? 'চেক/কার্ড' : 'Cards/Cheques'}
                  </span>
                </div>
              </div>

              {/* Dynamic Bezier Graph SVG with Accessible Label and Tooltip */}
              <div className="relative h-28 my-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                <svg
                  role="img"
                  aria-label={`Monthly Operational Activity Flow trend curve showing activity across ${monthlyActivity.map(m => `${m.label}: ${m.count} items`).join(', ')}. Peak monthly loan sanction is ৳${peakLoanAmount.toLocaleString()} in month ${monthlyActivity[curveDetails.peakIdx]?.label || 'peak'}.`}
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 400 100"
                >
                  <title>{isBn ? 'কার্যক্রম ও লোন প্রবাহ গ্রাফ' : 'Operational Activity Flow Curve'}</title>
                  <desc>{`Monthly curve showing activity across ${monthlyActivity.length} months. Peak loan amount: ৳${peakLoanAmount.toLocaleString()}`}</desc>
                  {/* Dynamic Bezier Path mapped from live monthly volume */}
                  <path
                    d={curveDetails.pathString}
                    fill="none"
                    stroke={isDark ? '#D4F63D' : '#18181B'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-draw-bezier"
                  />
                  
                  {/* Vertical yellow dashed guideline positioned at dynamic peak */}
                  <line
                    x1={curveDetails.peakX}
                    y1={curveDetails.peakY}
                    x2={curveDetails.peakX}
                    y2="95"
                    stroke="#D4F63D"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-graph-guide"
                  />
                  <circle
                    cx={curveDetails.peakX}
                    cy={curveDetails.peakY}
                    r="5"
                    fill="#D4F63D"
                    stroke="#18181B"
                    strokeWidth="2"
                    className="animate-graph-dot"
                  />
                </svg>

                {/* Peak Floating Tag */}
                <div 
                  style={{ right: curveDetails.peakPctRight }}
                  aria-label={`Peak Sanction amount: ৳${peakLoanAmount.toLocaleString()}`}
                  className="absolute top-1 px-2.5 py-0.5 bg-[#18181B] text-[#D4F63D] text-[10px] font-black rounded-full shadow-md animate-peak-badge"
                >
                  Peak Sanction: ৳{peakLoanAmount.toLocaleString()}
                </div>
              </div>

              {/* Month Timeline with live month labels */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400" aria-hidden="true">
                {monthlyActivity.map((m, idx) => {
                  const isPeak = idx === curveDetails.peakIdx;
                  return (
                    <span 
                      key={m.monthKey} 
                      className={isPeak ? (isDark ? 'text-white font-black' : 'text-slate-900 font-black') : ''}
                    >
                      {m.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Card E: Contract Type / Service Category Radial Donut (5-cols) */}
            <div
              style={{ animationDelay: '240ms' }}
              role="region"
              aria-label={isBn ? 'চুক্তি ও ক্যাটাগরি বণ্টন ডোনাট চার্ট' : 'Contract Type and Service Category Distribution Donut Chart'}
              className={`md:col-span-5 rounded-[24px] p-5 shadow-2xs border flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 group animate-dashboard-card ${
                isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {langText.contractType}
                </span>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label={isBn ? 'ক্যাটাগরি বিশ্লেষণ ফিল্টার খুলুন' : 'Open category breakdown filter modal'}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title="View Category Breakdown"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Radial Donut Visualization with real percentage proportions and 3 segments */}
              <div className="flex items-center justify-center gap-6 my-2">
                <div className="relative w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <svg
                    role="img"
                    aria-label={`Category breakdown: Cheque books ${chequePct}%, Debit cards ${cardPct}%, Loan files ${loanPct}%`}
                    className="w-24 h-24 -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <title>{isBn ? 'ক্যাটাগরি বণ্টন চার্ট' : 'Category Breakdown Donut Chart'}</title>
                    <circle cx="18" cy="18" r="14" fill="none" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="4" />
                    {/* Cheque Segment */}
                    {chequePct > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke={isDark ? '#FFFFFF' : '#18181B'}
                        strokeWidth="4"
                        strokeDasharray={`${chequePct}, 100`}
                        strokeLinecap="round"
                        className="animate-donut-segment transition-all duration-700"
                      />
                    )}
                    {/* Card Segment */}
                    {cardPct > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#D4F63D"
                        strokeWidth="4"
                        strokeDasharray={`${cardPct}, 100`}
                        strokeDashoffset={`-${chequePct}`}
                        strokeLinecap="round"
                        className="animate-donut-segment transition-all duration-700"
                      />
                    )}
                    {/* Loan Segment */}
                    {loanPct > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="4"
                        strokeDasharray={`${loanPct}, 100`}
                        strokeDashoffset={`-${chequePct + cardPct}`}
                        strokeLinecap="round"
                        className="animate-donut-segment transition-all duration-700"
                      />
                    )}
                  </svg>
                  <div className="absolute text-center animate-graph-dot" aria-hidden="true">
                    <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {chequePct}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" aria-hidden="true"></span>
                    <span className="font-semibold">{isBn ? 'চেক বই' : 'Cheques'} ({chequePct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4F63D]" aria-hidden="true"></span>
                    <span className="font-semibold">{isBn ? 'ডেবিট কার্ড' : 'Cards'} ({cardPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" aria-hidden="true"></span>
                    <span className="font-semibold">{isBn ? 'লোন ফাইল' : 'Loans'} ({loanPct}%)</span>
                  </div>
                </div>
              </div>

              {/* 3-Column Metrics Footer */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setActiveNavTab('cheque_cards')}
                  aria-label={`${totalCheques} Cheque Books in registry. Click to view.`}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className={`text-xs font-black block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {totalCheques}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">
                    {isBn ? 'চেক বই' : 'Cheque Books'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNavTab('cheque_cards')}
                  aria-label={`${totalCards} Debit Cards in registry. Click to view.`}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className={`text-xs font-black block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {totalCards}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">
                    {isBn ? 'ডেবিট কার্ড' : 'Debit Cards'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNavTab('loan_accounts')}
                  aria-label={`${totalLoans} Loan Account files. Click to view.`}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className={`text-xs font-black block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {totalLoans}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">
                    {isBn ? 'লোন একাউন্ট' : 'Loan Files'}
                  </span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. DEDICATED CHEQUE BOOK & DEBIT CARD SUMMARY SECTION (User Explicit Request) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Cheque Books Inventory Hub Card */}
        <div
          style={{ animationDelay: '300ms' }}
          role="region"
          aria-label={isBn ? 'চেক বই ইনভেন্টরি ও ডেলিভারি হাব' : 'Cheque Books Inventory and Delivery Hub'}
          className={`rounded-[24px] p-5 shadow-2xs border transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 animate-dashboard-card ${
            isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">
                  {isBn ? 'চেক বই ইনভেন্টরি ও ডেলিভারি' : 'Cheque Books Inventory Hub'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isBn ? 'সকল পাতা ও স্টক ট্র্যাকিং' : 'Branch stock & delivered leaf registry'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" aria-label={`${totalCheques} total cheque books`}>
              {totalCheques} {isBn ? 'বই' : 'Books'}
            </span>
          </div>

          {/* Inner Stats Matrix Bar */}
          <div className={`grid grid-cols-3 gap-3 p-3.5 rounded-2xl border text-center transition-colors ${
            isDark 
              ? 'bg-slate-900/85 border-slate-800 shadow-inner' 
              : 'bg-slate-50 border-slate-200/70 shadow-2xs'
          }`}>
            <div aria-label={`In stock: ${chequesInStock} cheque books`} className="space-y-0.5">
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isBn ? 'ইন-স্টক' : 'In Stock'}
              </span>
              <span className={`text-lg sm:text-xl font-black block tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {chequesInStock}
              </span>
            </div>
            <div aria-label={`Delivered: ${chequesDelivered} cheque books`} className="space-y-0.5 border-x border-slate-200/50 dark:border-slate-800">
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isBn ? 'ডেলিভার্ড' : 'Delivered'}
              </span>
              <span className="text-lg sm:text-xl font-black block tracking-tight text-emerald-600 dark:text-emerald-400">
                {chequesDelivered}
              </span>
            </div>
            <div aria-label={`Total cheque leaves: ${totalChequeLeaves} leaves`} className="space-y-0.5">
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isBn ? 'মোট পাতা' : 'Total Leaves'}
              </span>
              <span className="text-lg sm:text-xl font-black block tracking-tight text-indigo-600 dark:text-indigo-400">
                {totalChequeLeaves}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              {isBn ? 'গ্রাহক ডেলিভারি ও রসিদ তৈরি' : 'Customer delivery & receipt generation'}
            </span>
            <button
              onClick={() => setActiveNavTab('cheque_cards')}
              aria-label={isBn ? 'চেক রেজিস্ট্রি ভিউ খুলুন' : 'Open Cheque Books Registry module'}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <span>{isBn ? 'চেক রেজিস্ট্রি খুলুন' : 'Open Cheque Registry'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Debit Cards Inventory Hub Card */}
        <div
          style={{ animationDelay: '360ms' }}
          role="region"
          aria-label={isBn ? 'ডেবিট কার্ড স্টক ও অ্যাক্টিভেশন হাব' : 'Debit Cards Inventory and Stock Hub'}
          className={`rounded-[24px] p-5 shadow-2xs border transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 animate-dashboard-card ${
            isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">
                  {isBn ? 'ডেবিট কার্ড স্টক ও অ্যাক্টিভেশন' : 'Debit Cards Inventory Hub'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isBn ? 'রেগুলার ও ডুয়েল কারেন্সি কার্ড' : 'Regular & Dual Currency card registry'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" aria-label={`${totalCards} total debit cards`}>
              {totalCards} {isBn ? 'টি কার্ড' : 'Cards'}
            </span>
          </div>

          {/* Inner Stats Matrix Bar */}
          <div className={`grid grid-cols-3 gap-3 p-3.5 rounded-2xl border text-center transition-colors ${
            isDark 
              ? 'bg-slate-900/85 border-slate-800 shadow-inner' 
              : 'bg-slate-50 border-slate-200/70 shadow-2xs'
          }`}>
            <div aria-label={`In stock: ${cardsInStock} debit cards`} className="space-y-0.5">
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isBn ? 'ইন-স্টক' : 'In Stock'}
              </span>
              <span className={`text-lg sm:text-xl font-black block tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {cardsInStock}
              </span>
            </div>
            <div aria-label={`Delivered: ${cardsDelivered} debit cards`} className="space-y-0.5 border-x border-slate-200/50 dark:border-slate-800">
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isBn ? 'ডেলিভার্ড' : 'Delivered'}
              </span>
              <span className="text-lg sm:text-xl font-black block tracking-tight text-emerald-600 dark:text-emerald-400">
                {cardsDelivered}
              </span>
            </div>
            <div aria-label={`Dual currency cards: ${dualCurrencyCards}`} className="space-y-0.5">
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isBn ? 'ডুয়েল কারেন্সি' : 'Dual Currency'}
              </span>
              <span className="text-lg sm:text-xl font-black block tracking-tight text-indigo-600 dark:text-indigo-400">
                {dualCurrencyCards}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              {isBn ? 'কার্ড হ্যান্ডওভার ও সিগনেচার স্লিপ' : 'Card handover & slip printing'}
            </span>
            <button
              onClick={() => setActiveNavTab('cheque_cards')}
              aria-label={isBn ? 'কার্ড রেজিস্ট্রি ভিউ খুলুন' : 'Open Debit Cards Registry module'}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>{isBn ? 'কার্ড রেজিস্ট্রি খুলুন' : 'Open Cards Registry'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Comprehensive Unified Operational Records Table Section */}
      <div
        style={{ animationDelay: '420ms' }}
        role="region"
        aria-label={isBn ? 'আউটলেট সামগ্রিক রেকর্ড ও রেজিস্ট্রি বিবরণী' : 'Outlet Operations and Unified Records'}
        className={`rounded-[24px] p-6 shadow-2xs border transition-colors animate-dashboard-card ${
          isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isBn ? 'আউটলেট সামগ্রিক রেকর্ড ও রেজিস্ট্রি বিবরণী' : 'Outlet Operations & Unified Records'}
            </h3>
            <p className="text-xs text-slate-400">
              {currentUser.outletName} • {filteredTableRows.length} of {unifiedRows.length} records displayed
              {selectedWeekday !== null && ` • Filtered: ${weekdaysList[selectedWeekday].name}`}
            </p>
          </div>

          {/* Filter Pills across Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label={isBn ? 'রেকর্ড ক্যাটাগরি ফিল্টার' : 'Record category filters'}>
            <button
              role="tab"
              aria-selected={activeTableTab === 'ALL'}
              aria-label={`Show all ${unifiedRows.length} records`}
              onClick={() => setActiveTableTab('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTableTab === 'ALL'
                  ? isDark
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#18181B] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'সকল' : 'All'} ({unifiedRows.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTableTab === 'CHEQUE'}
              aria-label={`Show ${totalCheques} cheque records`}
              onClick={() => setActiveTableTab('CHEQUE')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTableTab === 'CHEQUE'
                  ? isDark
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#18181B] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'চেক বই' : 'Cheques'} ({totalCheques})
            </button>
            <button
              role="tab"
              aria-selected={activeTableTab === 'CARD'}
              aria-label={`Show ${totalCards} debit card records`}
              onClick={() => setActiveTableTab('CARD')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTableTab === 'CARD'
                  ? isDark
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#18181B] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'কার্ড' : 'Cards'} ({totalCards})
            </button>
            <button
              role="tab"
              aria-selected={activeTableTab === 'LOAN'}
              aria-label={`Show ${totalLoans} loan file records`}
              onClick={() => setActiveTableTab('LOAN')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTableTab === 'LOAN'
                  ? isDark
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#18181B] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'লোন ফাইল' : 'Loans'} ({totalLoans})
            </button>
            <button
              role="tab"
              aria-selected={activeTableTab === 'SUBMISSION'}
              aria-label={`Show ${totalSubmissions} submission records`}
              onClick={() => setActiveTableTab('SUBMISSION')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTableTab === 'SUBMISSION'
                  ? isDark
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#18181B] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'সাবমিশন' : 'Submissions'} ({totalSubmissions})
            </button>
          </div>
        </div>

        {/* Unified Table Content */}
        {filteredTableRows.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto stroke-1 text-slate-400" aria-hidden="true" />
            <p className="text-xs font-medium">
              {isBn ? 'ফিল্টার অনুযায়ী কোন রেকর্ড পাওয়া যায়নি।' : 'No records match the active filter criteria.'}
            </p>
            {hasActiveCustomFilters && (
              <button
                onClick={() => {
                  setActiveTableTab('ALL');
                  setSelectedStatusFilter('ALL');
                  setSelectedWeekday(null);
                  setDateRange('ALL');
                  setSearchTerm('');
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline cursor-pointer"
              >
                {isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Clear all filters'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label={isBn ? 'অপারেশনাল রেকর্ডস টেবিল' : 'Operational records summary table'}>
              <thead>
                <tr className={`border-b text-slate-400 font-bold uppercase tracking-wider text-[10px] ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <th scope="col" className="pb-3">{isBn ? 'ক্যাটাগরি' : 'Type'}</th>
                  <th scope="col" className="pb-3">{isBn ? 'গ্রাহক / অ্যাকাউন্ট টাইটেল' : 'Customer / Account Title'}</th>
                  <th scope="col" className="pb-3">{isBn ? 'অ্যাকাউন্ট / কার্ড / লোন নং' : 'Account / Card / Loan No'}</th>
                  <th scope="col" className="pb-3">{isBn ? 'বিবরণ' : 'Category Details'}</th>
                  <th scope="col" className="pb-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th scope="col" className="pb-3">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th scope="col" className="pb-3 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredTableRows.slice(0, 15).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3">
                      <span 
                        aria-label={`Category: ${row.type}`}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        row.type === 'CHEQUE'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : row.type === 'CARD'
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                          : row.type === 'LOAN'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                      }`}>
                        {row.type === 'CHEQUE' ? <BookOpen className="w-3 h-3" aria-hidden="true" /> : row.type === 'CARD' ? <CreditCard className="w-3 h-3" aria-hidden="true" /> : row.type === 'LOAN' ? <Banknote className="w-3 h-3" aria-hidden="true" /> : <FileText className="w-3 h-3" aria-hidden="true" />}
                        <span>{row.type}</span>
                      </span>
                    </td>
                    <td className="py-3 font-semibold">
                      <span className="text-slate-900 dark:text-white block">{row.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{row.subTitle}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {row.accountOrId}
                    </td>
                    <td className="py-3 text-slate-500">
                      {row.categoryText}
                    </td>
                    <td className="py-3">
                      <span 
                        role="status"
                        aria-label={`Status: ${row.statusText}`}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        row.statusType === 'DELIVERED'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : row.statusType === 'ACTIVE'
                          ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                          : row.statusType === 'OVERDUE'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {row.statusText}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {row.dateText}
                    </td>
                    <td className="py-3 text-right">
                      {row.type === 'SUBMISSION' ? (
                        <button
                          onClick={() => setActiveSlip(row.rawItem)}
                          aria-label={`View receipt for ${row.title}`}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            isDark 
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' 
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          {langText.viewReceipt}
                        </button>
                      ) : row.type === 'LOAN' ? (
                        <button
                          onClick={() => setActiveNavTab('loan_accounts')}
                          aria-label={`View loan account details for ${row.title}`}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            isDark 
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' 
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          {isBn ? 'লোন বিস্তারিত' : 'View Loan'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveNavTab('cheque_cards')}
                          aria-label={`View registry entry for ${row.title}`}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            isDark 
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' 
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          {isBn ? 'রেজিস্ট্রি দেখুন' : 'View Item'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filter & Station Scope Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">
                    {isBn ? 'ড্যাশবোর্ড ফিল্টার ও স্টেশন স্কোপ' : 'Dashboard Filters & Scope'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentUser.outletName} ({currentUser.employeeId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {isBn ? 'ডাটা ক্যাটাগরি' : 'Data Category'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: isBn ? 'সকল ডাটা' : 'All Data' },
                    { id: 'CHEQUE', label: isBn ? 'চেক বই' : 'Cheques' },
                    { id: 'CARD', label: isBn ? 'ডেবিট কার্ড' : 'Debit Cards' },
                    { id: 'LOAN', label: isBn ? 'লোন একাউন্ট' : 'Loan Accounts' },
                    { id: 'SUBMISSION', label: isBn ? 'সাবমিশন' : 'Submissions' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTableTab(cat.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        activeTableTab === cat.id
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {activeTableTab === cat.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {isBn ? 'স্ট্যাটাস ফিল্টার' : 'Status Filter'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ALL', label: isBn ? 'সকল স্ট্যাটাস' : 'All Statuses' },
                    { id: 'ACTIVE', label: isBn ? 'ইন-স্টক / এক্টিভ' : 'In-Stock / Active' },
                    { id: 'DELIVERED', label: isBn ? 'ডেলিভার্ড / ক্লোজড' : 'Delivered / Closed' },
                    { id: 'OVERDUE', label: isBn ? 'ওভারডিউ / বকেয়া' : 'Overdue / Return' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStatusFilter(st.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        selectedStatusFilter === st.id
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{st.label}</span>
                      {selectedStatusFilter === st.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {isBn ? 'সময়কাল' : 'Timeframe Range'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ALL', label: isBn ? 'সকল সময়' : 'All Time' },
                    { id: 'TODAY', label: isBn ? 'আজকের' : 'Today' },
                    { id: 'WEEK', label: isBn ? 'গত ৭ দিন' : 'Last 7 Days' },
                    { id: 'MONTH', label: isBn ? 'চলতি মাস' : 'This Month' }
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => setDateRange(tf.id as any)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        dateRange === tf.id
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{tf.label}</span>
                      {dateRange === tf.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live matching count */}
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'} flex items-center justify-between text-xs`}>
                <span className="text-slate-400">{isBn ? 'ফিল্টার মিলছে:' : 'Matching records:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredTableRows.length} of {unifiedRows.length}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setActiveTableTab('ALL');
                    setSelectedStatusFilter('ALL');
                    setSelectedWeekday(null);
                    setDateRange('ALL');
                    setSearchTerm('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'রিসেট' : 'Reset Filters'}</span>
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm cursor-pointer hover:opacity-90"
                >
                  {isBn ? 'প্রয়োগ করুন' : 'Apply Filter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Receipt Slip */}
      {activeSlip && (
        <ReceiptModal submission={activeSlip} onClose={() => setActiveSlip(null)} />
      )}
    </div>
  );
};
