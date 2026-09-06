import React, { useState, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { SegregationTransactionType } from '../../types';

const TX_LABELS: Record<SegregationTransactionType, { label: string; icon: React.ElementType; color: string }> = {
  CD: { label: 'Cash Deposit', icon: ArrowDownCircle, color: 'text-emerald-500' },
  CW: { label: 'Cash Withdraw', icon: ArrowUpCircle, color: 'text-rose-500' },
  ID: { label: 'Initial Deposit', icon: Wallet, color: 'text-blue-500' },
  LD: { label: 'Loan Disbursement', icon: Banknote, color: 'text-amber-500' },
  LR: { label: 'Loan Repayment', icon: RefreshCcw, color: 'text-purple-500' },
  BC: { label: 'Bill Collection', icon: CreditCard, color: 'text-teal-500' }
};

export const DenominationSegregationAdmin: React.FC = () => {
  const { segregationRecords, outlets, userPreferences } = useApp();
  const isDark = userPreferences.theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | SegregationTransactionType>('ALL');
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
      BC: { amount: 0, count: 0 }
    };
    scopedForSummary.forEach((r) => {
      map[r.transactionType].amount += r.actualAmount;
      map[r.transactionType].count += 1;
    });
    return map;
  }, [scopedForSummary]);

  // Final list: Outlet + Date + Type + Search text, all combined
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return scopedForSummary.filter((r) => {
      if (typeFilter !== 'ALL' && r.transactionType !== typeFilter) return false;
      if (!term) return true;
      return (
        r.accountNumber.toLowerCase().includes(term) ||
        r.accountTitle.toLowerCase().includes(term) ||
        r.mobileNumber.toLowerCase().includes(term) ||
        r.outletName.toLowerCase().includes(term) ||
        r.userName?.toLowerCase().includes(term)
      );
    });
  }, [scopedForSummary, searchTerm, typeFilter]);

  const totalAmount = useMemo(() => filtered.reduce((sum, r) => sum + r.actualAmount, 0), [filtered]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <h2 className={`font-bold text-lg flex items-center gap-2 mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <Banknote className="text-emerald-500" size={20} /> Denomination Segregation — All Entries
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Every cash counting transaction saved by AFOs across all outlets, with full denomination breakdown.
        </p>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {(Object.keys(TX_LABELS) as SegregationTransactionType[]).map((t) => {
            const tx = TX_LABELS[t];
            const isActive = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(isActive ? 'ALL' : t)}
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
            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`rounded-lg border pl-9 pr-3 py-2 text-sm ${inputBg}`}
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 border border-rose-500/30"
            >
              <X size={13} /> Clear Date
            </button>
          )}
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-500">
                      <div>Mobile: <span className="font-semibold">{r.mobileNumber}</span></div>
                      <div>Total RCVD: <span className="font-semibold">৳{r.totalReceivedAmount.toLocaleString()}</span></div>
                      <div>Charge: <span className="font-semibold">{r.chargeApplied ? `৳${r.chargeAmount}` : 'No'}</span></div>
                      <div>Return: <span className="font-semibold">৳{r.returnAmount.toLocaleString()}</span></div>
                      <div>Source: <span className="font-semibold">{r.linkedAccountSource.replace('_', ' ')}</span></div>
                      <div>Type: <span className="font-semibold">{r.transactionType}</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
