import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Banknote,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  RefreshCcw,
  Building2,
  User,
  Calendar,
    CreditCard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
    X,
  BarChart3,
  History,
   List,
    Shuffle,
  HandCoins,
  Download
} from 'lucide-react';
import { SegregationTransactionType } from '../../types';
import { TotalCashAnalysisView } from './TotalCashAnalysisView';
import { CashHistoryView } from './CashHistoryView';
import { SupportingHistoryView } from './SupportingHistoryView';

const TX_LABELS: Record<SegregationTransactionType, { label: string; icon: React.ElementType; color: string }> = {
  CD: { label: 'Cash Deposit', icon: ArrowDownCircle, color: 'text-emerald-500' },
  CW: { label: 'Cash Withdraw', icon: ArrowUpCircle, color: 'text-rose-500' },
  ID: { label: 'Initial Deposit', icon: Wallet, color: 'text-blue-500' },
  LD: { label: 'Loan Disbursement', icon: Banknote, color: 'text-amber-500' },
  LR: { label: 'Loan Repayment', icon: RefreshCcw, color: 'text-purple-500' },
  BC: { label: 'Bill Collection', icon: CreditCard, color: 'text-teal-500' },
    CHG: { label: 'Cash Change', icon: Shuffle, color: 'text-indigo-500' }
};

export const DenominationSegregationAdmin: React.FC = () => {
  const { segregationRecords, outlets, userPreferences, motherAmounts, outletTransfers, cashTransfers, supportingRecords, denominationAdjustments, showToast } = useApp();
  const isDark = userPreferences.theme === 'dark';
    const [activeSubPage, setActiveSubPage] = useState<'ENTRIES' | 'ANALYSIS' | 'HISTORY' | 'SUPPORTING'>('ENTRIES');

    const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | SegregationTransactionType>('ALL');
  const [chargeOnlyFilter, setChargeOnlyFilter] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [outletFilter, setOutletFilter] = useState('ALL');
  const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
    const [outletSearchTerm, setOutletSearchTerm] = useState('');
    const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = dateFilter ? new Date(dateFilter) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const monthNamesList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const yearOptionsList = Array.from({ length: 20 }, (_, i) => 2020 + i);
  
  // ==================== CSV Export State ====================
  const [exportPopupOpen, setExportPopupOpen] = useState(false);
  const [exportSections, setExportSections] = useState<Record<string, boolean>>({
    ENTRIES: true,
    ANALYSIS: true,
    HISTORY: true,
    SUPPORTING: true
  });
  const [exportDateMode, setExportDateMode] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [exportSelectedDates, setExportSelectedDates] = useState<string[]>([]);
  const [exportDatePickerOpen, setExportDatePickerOpen] = useState(false);
  const [exportCalendarMonth, setExportCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [exportMonthDropdownOpen, setExportMonthDropdownOpen] = useState(false);
  const [exportYearDropdownOpen, setExportYearDropdownOpen] = useState(false);
    const [rangeSelectMode, setRangeSelectMode] = useState(false);
  const [rangeAnchorDate, setRangeAnchorDate] = useState<string | null>(null);

  const getDateRange = (a: string, b: string): string[] => {
    const start = new Date(a < b ? a : b);
    const end = new Date(a < b ? b : a);
    const result: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      result.push(cur.toLocaleDateString('en-CA'));
      cur.setDate(cur.getDate() + 1);
    }
    return result;
  };

  const handleDayClick = (dateStr: string) => {
    if (!rangeSelectMode) {
      setExportSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
      return;
    }
    if (!rangeAnchorDate) {
      setRangeAnchorDate(dateStr);
      return;
    }
    if (rangeAnchorDate === dateStr) {
      setRangeAnchorDate(null);
      return;
    }
    setExportSelectedDates(getDateRange(rangeAnchorDate, dateStr));
    setRangeAnchorDate(null);
  };
  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const selectedOutletName = outletFilter === 'ALL' ? 'All Outlets' : outlets.find((o) => o.id === outletFilter)?.name || 'All Outlets';

  const filteredOutletOptions = useMemo(() => {
    const term = outletSearchTerm.trim().toLowerCase();
    if (!term) return outlets;
    return outlets.filter((o) => o.name.toLowerCase().includes(term) || o.code?.toLowerCase().includes(term));
  }, [outlets, outletSearchTerm]);

  // Records scoped only by Outlet + Date (used for the clickable summary boxes)
  const scopedForSummary = useMemo(() => {
    return segregationRecords.filter((r) => {
      if (outletFilter !== 'ALL' && r.outletId !== outletFilter) return false;
      if (dateFilter) {
        const recordDate = new Date(r.createdAt).toLocaleDateString('en-CA'); // yyyy-mm-dd
        if (recordDate !== dateFilter) return false;
      }
      return true;
    });
  }, [segregationRecords, outletFilter, dateFilter]);

  const summaryByType = useMemo(() => {
       const map: Record<SegregationTransactionType, { amount: number; count: number }> = {
      CD: { amount: 0, count: 0 },
      CW: { amount: 0, count: 0 },
      ID: { amount: 0, count: 0 },
      LD: { amount: 0, count: 0 },
      LR: { amount: 0, count: 0 },
      BC: { amount: 0, count: 0 },
      CHG: { amount: 0, count: 0 }
    };
    scopedForSummary.forEach((r) => {
      map[r.transactionType].amount += r.actualAmount;
      map[r.transactionType].count += 1;
    });
    return map;
  }, [scopedForSummary]);
  
  // Total Charge collected (Outlet + Date scoped) — from CD & CW where charge was applied
  const scopedTotalCharge = useMemo(() => {
    return scopedForSummary.reduce((sum, r) => sum + (r.chargeApplied ? r.chargeAmount : 0), 0);
  }, [scopedForSummary]);

  const scopedChargeEntryCount = useMemo(() => {
    return scopedForSummary.filter((r) => r.chargeApplied && r.chargeAmount > 0).length;
  }, [scopedForSummary]);

  // Final list: Outlet + Date + Type + Search text, all combined
    const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return scopedForSummary.filter((r) => {
      if (chargeOnlyFilter) {
        if (!r.chargeApplied || r.chargeAmount <= 0) return false;
      } else if (typeFilter !== 'ALL' && r.transactionType !== typeFilter) {
        return false;
      }
      if (!term) return true;
      return (
        r.accountNumber.toLowerCase().includes(term) ||
        r.accountTitle.toLowerCase().includes(term) ||
        r.mobileNumber.toLowerCase().includes(term) ||
        r.outletName.toLowerCase().includes(term) ||
        r.userName?.toLowerCase().includes(term)
      );
    });
  }, [scopedForSummary, searchTerm, typeFilter, chargeOnlyFilter]);

  const totalAmount = useMemo(() => filtered.reduce((sum, r) => sum + r.actualAmount, 0), [filtered]);

  // ==================== CSV Export Logic ====================
  const csvEscape = (val: any): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const buildCsvSection = (title: string, headers: string[], rows: (string | number)[][]): string => {
    const lines = [`=== ${title} ===`, headers.map(csvEscape).join(',')];
    rows.forEach((row) => lines.push(row.map(csvEscape).join(',')));
    lines.push('');
    return lines.join('\n');
  };

  const dateMatches = (iso: string, dates: string[]): boolean => {
    if (dates.length === 0) return true;
    return dates.includes(new Date(iso).toLocaleDateString('en-CA'));
  };

    const buildAllEntriesCsv = (dates: string[]): string => {
    const rows = segregationRecords
      .filter((r) => dateMatches(r.createdAt, dates))
      .map((r) => [
        new Date(r.createdAt).toLocaleString(),
        r.outletName,
        r.userName,
        r.transactionType,
        r.accountTitle,
        r.accountNumber,
        r.mobileNumber,
        r.actualAmount,
        r.chargeApplied ? r.chargeAmount : 0,
        r.bearerName || '',
        r.notes || '',
        r.denominations?.note1 || 0,
        r.denominations?.note2 || 0,
        r.denominations?.note5 || 0,
        r.denominations?.note10 || 0,
        r.denominations?.note20 || 0,
        r.denominations?.note50 || 0,
        r.denominations?.note100 || 0,
        r.denominations?.note200 || 0,
        r.denominations?.note500 || 0,
        r.denominations?.note1000 || 0
      ]);
    return buildCsvSection(
      'ALL ENTRIES (DENOMINATION SEGREGATION)',
      ['Date/Time', 'Outlet', 'AFO', 'Type', 'Account Title', 'Account No', 'Mobile', 'Amount', 'Charge', 'Bearer Name', 'Note', 'Tk1', 'Tk2', 'Tk5', 'Tk10', 'Tk20', 'Tk50', 'Tk100', 'Tk200', 'Tk500', 'Tk1000'],
      rows
    );
  };

  const buildTotalCashAnalysisCsv = (): string => {
    const rows = outlets.map((o) => {
      const mother =
        motherAmounts
          .filter((m) => m.outletId === o.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.amount || 0;
      const net = segregationRecords
        .filter((r) => {
          const effectiveId = r.crossOutletDirection === 'THERE' && r.crossOutletId ? r.crossOutletId : r.outletId;
          return effectiveId === o.id && r.transactionType !== 'CHG';
        })
        .reduce((sum, r) => sum + (['CD', 'ID', 'LR', 'BC'].includes(r.transactionType) ? r.actualAmount : -r.actualAmount), 0);
      const rtgsOut = cashTransfers.filter((t) => t.outletId === o.id && t.transferType === 'RTGS').reduce((s, t) => s + t.amount, 0);
      const transferOut = cashTransfers.filter((t) => t.outletId === o.id && t.transferType === 'TRANSFER_TO_OUTLET').reduce((s, t) => s + t.amount, 0);
      const transferIn = cashTransfers.filter((t) => t.destinationOutletId === o.id && t.transferType === 'TRANSFER_TO_OUTLET').reduce((s, t) => s + t.amount, 0);
      const supportingCashOut = supportingRecords.filter((s) => s.outletId === o.id && s.fundingSource === 'CASH').reduce((s, r) => s + r.amount, 0);
      const supportingCashRecoveredIn = supportingRecords.filter((s) => s.outletId === o.id && s.status === 'RECOVERED' && s.recoveredFundingSource === 'CASH').reduce((s, r) => s + (r.recoveredAmount || 0), 0);
      const manualAdjustment = denominationAdjustments.filter((a) => a.outletId === o.id).reduce((s, a) => s + a.changeAmount, 0);
      const afoCash = net - rtgsOut - transferOut + transferIn - supportingCashOut + supportingCashRecoveredIn + manualAdjustment;
      const transfer = outletTransfers.filter((t) => t.outletId === o.id).reduce((s, t) => s + t.amount, 0);
      const vault = afoCash - transfer;
      return [o.name, mother, afoCash, transferIn, vault];
    });
    return buildCsvSection(
      'TOTAL CASH ANALYSIS (CURRENT SNAPSHOT PER OUTLET)',
      ['Outlet', 'Total Mother Amount', 'Total AFO Cash Amount', 'Total Received From Outlet', 'Total Vault Amount'],
      rows
    );
  };

  const buildHistoryCsv = (dates: string[]): string => {
    const items: { date: string; kind: string; outlet: string; who: string; amount: number; detail: string }[] = [];
    motherAmounts.forEach((m) => items.push({ date: m.createdAt, kind: 'Mother Amount', outlet: m.outletName, who: m.setByUserName, amount: m.amount, detail: m.note || '' }));
    outletTransfers.forEach((t) => items.push({ date: t.createdAt, kind: 'Transfer', outlet: t.outletName, who: t.setByUserName, amount: t.amount, detail: t.note || '' }));
    cashTransfers.filter((t) => t.transferType === 'RTGS').forEach((t) => items.push({ date: t.createdAt, kind: 'RTGS Transfer', outlet: t.outletName, who: t.userName, amount: t.amount, detail: t.note || '' }));
    cashTransfers.filter((t) => t.transferType === 'TRANSFER_TO_OUTLET').forEach((t) => items.push({ date: t.createdAt, kind: 'Transfer to Outlet', outlet: t.outletName, who: t.userName, amount: t.amount, detail: `To ${t.destinationOutletName || ''}` }));
    denominationAdjustments.forEach((a) => items.push({ date: a.createdAt, kind: 'Denomination Adjustment', outlet: a.outletName, who: a.setByUserName, amount: a.changeAmount, detail: `${a.denomKey} count ${a.previousCount} to ${a.newCount}` }));
    const rows = items
      .filter((i) => dateMatches(i.date, dates))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((i) => [new Date(i.date).toLocaleString(), i.kind, i.outlet, i.who, i.amount, i.detail]);
    return buildCsvSection(
      'CASH & MOTHER AMOUNT HISTORY',
      ['Date/Time', 'Type', 'Outlet', 'By', 'Amount', 'Detail'],
      rows
    );
  };

  const buildSupportingCsv = (dates: string[]): string => {
    const rows = supportingRecords
      .filter((s) => dateMatches(s.createdAt, dates))
      .map((s) => [
        new Date(s.createdAt).toLocaleString(),
        s.outletName,
        s.userName,
        s.recipientName,
        s.purpose,
        s.fundingSource,
        s.amount,
        s.status,
        s.status === 'RECOVERED' ? (s.recoveredAmount || 0) : '',
        s.status === 'RECOVERED' ? (s.recoveredFundingSource || '') : '',
        s.mobileNumber || '',
        s.notes || ''
      ]);
        return buildCsvSection(
      'SUPPORTING HISTORY',
      ['Date/Time', 'Outlet', 'AFO', 'Recipient', 'Purpose', 'Funding Source', 'Amount', 'Status', 'Recovered Amount', 'Recovered Source', 'Mobile', 'Note'],
      rows
    );
  };

  const handleDownloadCsv = () => {
    const dates = exportDateMode === 'SPECIFIC' ? exportSelectedDates : [];
    if (exportDateMode === 'SPECIFIC' && dates.length === 0) {
      showToast({ message: 'Please select at least one date, or switch to All Dates.', type: 'error' });
      return;
    }
    let csvContent = '';
    if (exportSections.ENTRIES) csvContent += buildAllEntriesCsv(dates);
    if (exportSections.ANALYSIS) csvContent += buildTotalCashAnalysisCsv();
    if (exportSections.HISTORY) csvContent += buildHistoryCsv(dates);
    if (exportSections.SUPPORTING) csvContent += buildSupportingCsv(dates);

    if (!csvContent.trim()) {
      showToast({ message: 'Please select at least one section to export.', type: 'error' });
      return;
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateLabel = exportDateMode === 'SPECIFIC' ? dates.join('_') : 'all-dates';
    link.href = url;
    link.download = `cash-analysis-export-${dateLabel}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportPopupOpen(false);
    showToast({ message: 'CSV exported successfully.', type: 'success' });
  };

    return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h2 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <Banknote className="text-emerald-500" size={20} />
            {activeSubPage === 'ENTRIES'
              ? 'Denomination Segregation — All Entries'
                            : activeSubPage === 'ANALYSIS'
              ? 'Total Cash Analysis'
              : activeSubPage === 'HISTORY'
              ? 'Cash & Mother Amount History'
              : 'Supporting History'}
                    </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setExportPopupOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${inputBg}`}
              >
                <Download size={13} className="text-emerald-500" /> Export CSV
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {exportPopupOpen && (
                <div className={`absolute left-0 z-30 mt-2 w-80 rounded-2xl border shadow-lg p-3 ${cardBg}`}>
                  <div className="text-xs font-bold mb-2 text-slate-500">Select sections to export</div>
                  <div className="space-y-1.5 mb-3">
                    {[
                      { key: 'ENTRIES', label: 'All Entries' },
                      { key: 'ANALYSIS', label: 'Total Cash Analysis' },
                      { key: 'HISTORY', label: 'Cash & Mother Amount History' },
                      { key: 'SUPPORTING', label: 'Supporting History' }
                    ].map((sec) => (
                      <label key={sec.key} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportSections[sec.key]}
                          onChange={(e) => setExportSections((prev) => ({ ...prev, [sec.key]: e.target.checked }))}
                          className="rounded"
                        />
                        {sec.label}
                      </label>
                    ))}
                  </div>

                  <div className="text-xs font-bold mb-2 text-slate-500">Date range</div>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setExportDateMode('ALL')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                        exportDateMode === 'ALL' ? 'bg-emerald-500 text-white border-emerald-500' : inputBg
                      }`}
                    >
                      All Dates
                    </button>
                    <button
                      onClick={() => setExportDateMode('SPECIFIC')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                        exportDateMode === 'SPECIFIC' ? 'bg-emerald-500 text-white border-emerald-500' : inputBg
                      }`}
                    >
                      Specific Date(s)
                    </button>
                  </div>

                  {exportDateMode === 'SPECIFIC' && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExportDatePickerOpen((v) => !v)}
                        className={`w-full flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-semibold mb-2 ${inputBg}`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-emerald-500" />
                          {exportSelectedDates.length === 0
                            ? 'Pick date(s)'
                            : `${exportSelectedDates.length} date(s) selected`}
                        </span>
                        <ChevronDown size={12} className="text-slate-400" />
                      </button>

                      {exportDatePickerOpen && (
                        <div className={`rounded-xl border p-2 ${inputBg}`}>
                          <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() =>
                                setExportCalendarMonth((prev) => {
                                  const m = prev.month === 0 ? 11 : prev.month - 1;
                                  const y = prev.month === 0 ? prev.year - 1 : prev.year;
                                  return { year: y, month: m };
                                })
                              }
                              className="p-1 rounded-lg hover:bg-emerald-500/10 text-slate-500"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <div className="flex items-center gap-1">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => { setExportMonthDropdownOpen((v) => !v); setExportYearDropdownOpen(false); }}
                                  className="text-xs font-bold py-1 px-2 rounded-md border cursor-pointer flex items-center gap-1"
                                >
                                  {monthNamesList[exportCalendarMonth.month]}
                                  <span className="text-[9px] opacity-60">▼</span>
                                </button>
                                {exportMonthDropdownOpen && (
                                  <div className={`absolute left-0 top-full mt-1 z-50 max-h-40 overflow-y-auto rounded-lg border shadow-xl w-28 ${cardBg}`}>
                                    {monthNamesList.map((mName, idx) => (
                                      <button
                                        key={mName}
                                        type="button"
                                        onClick={() => {
                                          setExportCalendarMonth((prev) => ({ ...prev, month: idx }));
                                          setExportMonthDropdownOpen(false);
                                        }}
                                        className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer ${
                                          idx === exportCalendarMonth.month ? 'bg-emerald-600 text-white' : ''
                                        }`}
                                      >
                                        {mName}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => { setExportYearDropdownOpen((v) => !v); setExportMonthDropdownOpen(false); }}
                                  className="text-xs font-bold py-1 px-2 rounded-md border cursor-pointer font-mono flex items-center gap-1"
                                >
                                  {exportCalendarMonth.year}
                                  <span className="text-[9px] opacity-60">▼</span>
                                </button>
                                {exportYearDropdownOpen && (
                                  <div className={`absolute left-0 top-full mt-1 z-50 max-h-40 overflow-y-auto rounded-lg border shadow-xl w-16 ${cardBg}`}>
                                    {yearOptionsList.map((y) => (
                                      <button
                                        key={y}
                                        type="button"
                                        onClick={() => {
                                          setExportCalendarMonth((prev) => ({ ...prev, year: y }));
                                          setExportYearDropdownOpen(false);
                                        }}
                                        className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer font-mono ${
                                          y === exportCalendarMonth.year ? 'bg-emerald-600 text-white' : ''
                                        }`}
                                      >
                                        {y}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setExportCalendarMonth((prev) => {
                                  const m = prev.month === 11 ? 0 : prev.month + 1;
                                  const y = prev.month === 11 ? prev.year + 1 : prev.year;
                                  return { year: y, month: m };
                                })
                              }
                              className="p-1 rounded-lg hover:bg-emerald-500/10 text-slate-500"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 mb-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                              <div key={d} className={`text-center text-[9px] font-bold ${i === 5 || i === 6 ? 'text-rose-500' : 'text-slate-400'}`}>
                                {d}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: new Date(exportCalendarMonth.year, exportCalendarMonth.month, 1).getDay() }).map((_, i) => (
                              <div key={`blank-${i}`} />
                            ))}
                                                        {Array.from({ length: new Date(exportCalendarMonth.year, exportCalendarMonth.month + 1, 0).getDate() }).map((_, i) => {
                              const day = i + 1;
                              const dateStr = `${exportCalendarMonth.year}-${String(exportCalendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const isSelected = exportSelectedDates.includes(dateStr);
                              const isAnchor = rangeAnchorDate === dateStr;
                              return (
                                <button
                                  key={day}
                                  onClick={() => handleDayClick(dateStr)}
                                  className={`h-7 rounded-lg text-[11px] font-semibold transition ${
                                    isAnchor
                                      ? 'bg-amber-500 text-white'
                                      : isSelected
                                      ? 'bg-emerald-500 text-white'
                                      : 'hover:bg-emerald-500/10'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>

                          {exportSelectedDates.length > 0 && (
                            <button
                              onClick={() => setExportSelectedDates([])}
                              className="w-full mt-2 text-[10px] font-semibold text-rose-500"
                            >
                              Clear selected dates
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                                   <button
                    onClick={handleDownloadCsv}
                    className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold"
                  >
                    Download CSV
                  </button>
                </div>
              )}
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-[#0F172A]' : 'bg-slate-100'}`}>
            <button
              onClick={() => setActiveSubPage('ENTRIES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubPage === 'ENTRIES'
                  ? `${isDark ? 'bg-[#1A2333] text-slate-100' : 'bg-white text-slate-900'} shadow-sm`
                  : 'text-slate-400'
              }`}
            >
              <List size={13} /> All Entries
            </button>
                       <button
              onClick={() => setActiveSubPage('ANALYSIS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubPage === 'ANALYSIS'
                  ? `${isDark ? 'bg-[#1A2333] text-slate-100' : 'bg-white text-slate-900'} shadow-sm`
                  : 'text-slate-400'
              }`}
            >
              <BarChart3 size={13} /> Total Cash Analysis
            </button>
            <button
              onClick={() => setActiveSubPage('HISTORY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubPage === 'HISTORY'
                  ? `${isDark ? 'bg-[#1A2333] text-slate-100' : 'bg-white text-slate-900'} shadow-sm`
                  : 'text-slate-400'
              }`}
            >
                          <History size={13} /> History
            </button>
            <button
              onClick={() => setActiveSubPage('SUPPORTING')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubPage === 'SUPPORTING'
                  ? `${isDark ? 'bg-[#1A2333] text-slate-100' : 'bg-white text-slate-900'} shadow-sm`
                  : 'text-slate-400'
              }`}
            >
                          <HandCoins size={13} /> Supporting History
            </button>
          </div>
          </div>
        </div>

        {activeSubPage === 'ENTRIES' && (
          <p className="text-xs text-slate-500 mb-4">
            Every cash counting transaction saved by AFOs across all outlets, with full denomination breakdown.
          </p>
        )}

                {activeSubPage === 'ANALYSIS' ? (
          <TotalCashAnalysisView />
               ) : activeSubPage === 'HISTORY' ? (
          <CashHistoryView />
        ) : activeSubPage === 'SUPPORTING' ? (
          <SupportingHistoryView />
        ) : (
          <>
        {/* Outlet Selector (with its own search) */}
        <div className="relative mb-4 max-w-sm">
          <button
            onClick={() => setOutletDropdownOpen((v) => !v)}
            className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold ${inputBg}`}
          >
            <span className="flex items-center gap-2 truncate">
              <Building2 size={15} className="text-emerald-500 shrink-0" /> {selectedOutletName}
            </span>
            <ChevronDown size={15} className="text-slate-400 shrink-0" />
          </button>

          {outletDropdownOpen && (
            <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-lg ${cardBg}`}>
              <div className="p-2 border-b border-slate-700/20">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    value={outletSearchTerm}
                    onChange={(e) => setOutletSearchTerm(e.target.value)}
                    placeholder="Search outlet..."
                    className={`w-full rounded-lg border pl-7 pr-2 py-1.5 text-xs ${inputBg}`}
                  />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                <button
                  onClick={() => {
                    setOutletFilter('ALL');
                    setOutletDropdownOpen(false);
                    setOutletSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${
                    outletFilter === 'ALL' ? 'text-emerald-500' : ''
                  }`}
                >
                  All Outlets
                </button>
                {filteredOutletOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setOutletFilter(o.id);
                      setOutletDropdownOpen(false);
                      setOutletSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${
                      outletFilter === o.id ? 'text-emerald-500' : ''
                    }`}
                  >
                    {o.name} {o.code ? `(${o.code})` : ''}
                  </button>
                ))}
                {filteredOutletOptions.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500">No outlet found.</div>
                )}
              </div>
            </div>
          )}
        </div>

                {/* Clickable Summary Boxes (Outlet + Date scoped) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          {(Object.keys(TX_LABELS) as SegregationTransactionType[]).map((t) => {
            const tx = TX_LABELS[t];
            const isActive = !chargeOnlyFilter && typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setChargeOnlyFilter(false);
                  setTypeFilter(isActive ? 'ALL' : t);
                }}
                className={`text-left rounded-xl border p-2.5 transition ${
                  isActive ? 'border-emerald-500 ring-1 ring-emerald-500' : inputBg
                }`}
              >
                <div className={`flex items-center gap-1 text-[10px] font-semibold ${tx.color}`}>
                  <tx.icon size={12} /> {t}
                </div>
                <div className="text-xs font-bold mt-0.5 truncate">{tx.label}</div>
                <div className={`text-sm font-extrabold mt-0.5 ${tx.color}`}>
                  ৳ {summaryByType[t].amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">{summaryByType[t].count} Entries</div>
              </button>
            );
          })}

          {/* Charge Total Box (clickable — shows which accounts were charged) */}
          <button
            onClick={() => {
              setTypeFilter('ALL');
              setChargeOnlyFilter((v) => !v);
            }}
            className={`text-left rounded-xl border p-2.5 transition ${
              chargeOnlyFilter
                ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/10'
                : 'border-amber-500/40 bg-amber-500/10'
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
              <Search size={12} /> Charge
            </div>
            <div className="text-xs font-bold mt-0.5 text-amber-600 truncate">Total Charge</div>
            <div className="text-sm font-extrabold mt-0.5 text-amber-600">
              ৳ {scopedTotalCharge.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-600/70">{scopedChargeEntryCount} Entries</div>
          </button>
        </div>
        {/* Search + Date Picker */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Account, Customer, Mobile, Outlet, or AFO name..."
              className={`w-full rounded-lg border pl-9 pr-3 py-2 text-sm ${inputBg}`}
            />
          </div>
                    <div className="relative">
            <button
              onClick={() => setDatePickerOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${inputBg}`}
            >
              <Calendar size={15} className="text-emerald-500" />
              {dateFilter
                ? new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Select Date'}
            </button>

            <div
              className={`absolute right-0 z-30 mt-2 w-72 rounded-2xl border shadow-lg p-3 origin-top-right transition-all duration-150 ease-out ${cardBg} ${
                datePickerOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setCalendarMonth((prev) => {
                      const m = prev.month === 0 ? 11 : prev.month - 1;
                      const y = prev.month === 0 ? prev.year - 1 : prev.year;
                      return { year: y, month: m };
                    })
                  }
                  className="p-1 rounded-lg hover:bg-emerald-500/10 text-slate-500"
                >
                  <ChevronLeft size={16} />
                </button>
                                 <div className="flex items-center gap-1">
                  {/* Custom Month Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setMonthDropdownOpen((v) => !v); setYearDropdownOpen(false); }}
                      className={`text-xs font-bold py-1 px-2 rounded-md border cursor-pointer flex items-center gap-1 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      {monthNamesList[calendarMonth.month]}
                      <span className="text-[9px] opacity-60">▼</span>
                    </button>
                    {monthDropdownOpen && (
                      <div
                        className={`absolute left-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg border shadow-xl w-32 ${
                          isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        {monthNamesList.map((mName, idx) => (
                          <button
                            key={mName}
                            type="button"
                            onClick={() => {
                              setCalendarMonth((prev) => ({ ...prev, month: idx }));
                              setMonthDropdownOpen(false);
                            }}
                            className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer ${
                              idx === calendarMonth.month
                                ? 'bg-emerald-600 text-white'
                                : isDark
                                ? 'text-slate-200 hover:bg-slate-800'
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {mName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom Year Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setYearDropdownOpen((v) => !v); setMonthDropdownOpen(false); }}
                      className={`text-xs font-bold py-1 px-2 rounded-md border cursor-pointer font-mono flex items-center gap-1 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      {calendarMonth.year}
                      <span className="text-[9px] opacity-60">▼</span>
                    </button>
                    {yearDropdownOpen && (
                      <div
                        className={`absolute left-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg border shadow-xl w-20 ${
                          isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        {yearOptionsList.map((y) => (
                          <button
                            key={y}
                            type="button"
                            onClick={() => {
                              setCalendarMonth((prev) => ({ ...prev, year: y }));
                              setYearDropdownOpen(false);
                            }}
                            className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer font-mono ${
                              y === calendarMonth.year
                                ? 'bg-emerald-600 text-white'
                                : isDark
                                ? 'text-slate-200 hover:bg-slate-800'
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setCalendarMonth((prev) => {
                      const m = prev.month === 11 ? 0 : prev.month + 1;
                      const y = prev.month === 11 ? prev.year + 1 : prev.year;
                      return { year: y, month: m };
                    })
                  }
                  className="p-1 rounded-lg hover:bg-emerald-500/10 text-slate-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                  <div
                    key={d}
                    className={`text-center text-[10px] font-bold ${i === 5 || i === 6 ? 'text-rose-500' : 'text-slate-400'}`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: new Date(calendarMonth.year, calendarMonth.month, 1).getDay() }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {Array.from({ length: new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const dow = new Date(calendarMonth.year, calendarMonth.month, day).getDay();
                  const isWeekend = dow === 5 || dow === 6;
                  const dateStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = dateFilter === dateStr;
                  const isToday = dateStr === new Date().toLocaleDateString('en-CA');
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setDateFilter(dateStr);
                        setDatePickerOpen(false);
                      }}
                      className={`h-8 rounded-lg text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : isToday
                          ? 'border border-emerald-500 text-emerald-500'
                          : isWeekend
                          ? 'text-rose-500 hover:bg-rose-500/10'
                          : 'hover:bg-emerald-500/10'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/20">
                <button
                  onClick={() => {
                    setDateFilter('');
                    setDatePickerOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-500"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    const t = new Date();
                    setCalendarMonth({ year: t.getFullYear(), month: t.getMonth() });
                    setDateFilter(t.toLocaleDateString('en-CA'));
                    setDatePickerOpen(false);
                  }}
                  className="text-xs font-semibold text-emerald-500"
                >
                  Today
                </button>
              </div>
            </div>
          </div>  
        </div>

        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>{filtered.length} Entries Found</span>
          <span className="font-bold text-emerald-500">Total: ৳ {totalAmount.toLocaleString()}</span>
        </div>

        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-10">No segregation entries found.</div>
          )}
          {filtered.map((r) => {
            const tx = TX_LABELS[r.transactionType];
            const isOpen = expandedId === r.id;
            return (
              <div key={r.id} className={`rounded-xl border ${inputBg}`}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : r.id)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <tx.icon size={18} className={tx.color} />
                    <div>
                                            <div className="text-sm font-bold">
                        {r.accountTitle} — {r.accountNumber}
                        {r.bearerName && (
                          <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[9px] font-bold align-middle">
                            Bearer: {r.bearerName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><Building2 size={11} /> {r.outletName}</span>
                        <span className="flex items-center gap-1"><User size={11} /> {r.userName}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-extrabold ${tx.color}`}>৳ {r.actualAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">{tx.label}</div>
                  </div>
                </button>

                               {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-700/20">
                    {r.transactionType === 'CHG' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <div>
                          <div className="text-[11px] font-bold text-indigo-600 mb-1">Received from Customer</div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {[
                              ['Tk1', r.changeReceivedDenominations?.note1], ['Tk2', r.changeReceivedDenominations?.note2],
                              ['Tk5', r.changeReceivedDenominations?.note5], ['Tk10', r.changeReceivedDenominations?.note10],
                              ['Tk20', r.changeReceivedDenominations?.note20], ['Tk50', r.changeReceivedDenominations?.note50],
                              ['Tk100', r.changeReceivedDenominations?.note100], ['Tk200', r.changeReceivedDenominations?.note200],
                              ['Tk500', r.changeReceivedDenominations?.note500], ['Tk1000', r.changeReceivedDenominations?.note1000]
                            ]
                              .filter(([, count]) => (count as number) > 0)
                              .map(([label, count]) => (
                                <div key={label as string} className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1">
                                  <span className="font-semibold">{label}:</span> {count as number}
                                </div>
                              ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-rose-500 mb-1">Given to Customer</div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {[
                              ['Tk1', r.denominations.note1], ['Tk2', r.denominations.note2],
                              ['Tk5', r.denominations.note5], ['Tk10', r.denominations.note10],
                              ['Tk20', r.denominations.note20], ['Tk50', r.denominations.note50],
                              ['Tk100', r.denominations.note100], ['Tk200', r.denominations.note200],
                              ['Tk500', r.denominations.note500], ['Tk1000', r.denominations.note1000]
                            ]
                              .filter(([, count]) => (count as number) > 0)
                              .map(([label, count]) => (
                                <div key={label as string} className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1">
                                  <span className="font-semibold">{label}:</span> {count as number}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 text-[11px]">
                        {[
                          ['Tk1', r.denominations.note1], ['Tk2', r.denominations.note2],
                          ['Tk5', r.denominations.note5], ['Tk10', r.denominations.note10],
                          ['Tk20', r.denominations.note20], ['Tk50', r.denominations.note50],
                          ['Tk100', r.denominations.note100], ['Tk200', r.denominations.note200],
                          ['Tk500', r.denominations.note500], ['Tk1000', r.denominations.note1000]
                        ].map(([label, count]) => (
                          <div key={label as string} className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1">
                            <span className="font-semibold">{label}:</span> {count as number}
                          </div>
                        ))}
                      </div>
                    )}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-500">
                                           <div>Mobile: <span className="font-semibold">{r.mobileNumber}</span></div>
                      {r.bearerName && (
                        <div>Bearer: <span className="font-semibold text-amber-600">{r.bearerName}</span></div>
                      )}
                      <div>Total RCVD: <span className="font-semibold">৳{r.totalReceivedAmount.toLocaleString()}</span></div>
                      <div>Charge: <span className="font-semibold">{r.chargeApplied ? `৳${r.chargeAmount}` : 'No'}</span></div>
                      <div>Return: <span className="font-semibold">৳{r.returnAmount.toLocaleString()}</span></div>
                      <div>Source: <span className="font-semibold">{r.linkedAccountSource.replace('_', ' ')}</span></div>
                      <div>Type: <span className="font-semibold">{r.transactionType}</span></div>
                    </div>
                    {r.notes && (
                      <div className="mt-2 text-[11px] rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1.5">
                        <span className="font-semibold text-slate-500">Note: </span>
                        <span>{r.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
                </div>
          </>
        )}
      </div>
    </div>
  );
};
