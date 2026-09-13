import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Building2, ChevronDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { DenominationCounts } from '../../types';

const DENOM_LIST: { key: keyof DenominationCounts; value: number }[] = [
  { key: 'note1', value: 1 }, { key: 'note2', value: 2 }, { key: 'note5', value: 5 },
  { key: 'note10', value: 10 }, { key: 'note20', value: 20 }, { key: 'note50', value: 50 },
  { key: 'note100', value: 100 }, { key: 'note200', value: 200 }, { key: 'note500', value: 500 },
  { key: 'note1000', value: 1000 }
];

export const CashHistoryView: React.FC = () => {
  const { outlets, motherAmounts, outletTransfers, cashTransfers, userPreferences } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark ? 'bg-[#0F172A] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  const [viewOutlet, setViewOutlet] = useState('ALL');
  const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historyDatePickerOpen, setHistoryDatePickerOpen] = useState(false);
  const [historyCalendarMonth, setHistoryCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [historyMonthDropdownOpen, setHistoryMonthDropdownOpen] = useState(false);
  const [historyYearDropdownOpen, setHistoryYearDropdownOpen] = useState(false);
  const historyMonthNamesList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const historyYearOptionsList = Array.from({ length: 20 }, (_, i) => 2020 + i);

  const selectedOutletName = viewOutlet === 'ALL' ? 'All Outlets' : outlets.find((o) => o.id === viewOutlet)?.name || 'All Outlets';

  const getPreviousMotherAmount = (record: { outletId: string; createdAt: string }): number => {
    const prior = motherAmounts
      .filter((m) => m.outletId === record.outletId && new Date(m.createdAt).getTime() < new Date(record.createdAt).getTime())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return prior?.amount || 0;
  };

  const getMotherAmountReasonTag = (note?: string): string => {
    if (!note) return 'Manual';
    if (note.startsWith('Manual added')) return 'Manual +';
    if (note.startsWith('Manual subtracted')) return 'Manual −';
    if (note.includes('CD transaction')) return 'CD';
    if (note.includes('CW transaction')) return 'CW';
    if (note.includes('ID transaction')) return 'ID';
    if (note.includes('LD transaction')) return 'LD';
    if (note.includes('LR transaction')) return 'LR';
    if (note.includes('BC transaction')) return 'BC';
    if (note.includes('Move Money')) return 'Move Money';
    if (note.includes('RTGS')) return 'RTGS';
    if (note.includes('Cross-outlet')) return 'Cross-Outlet';
    return 'Adjustment';
  };

  const combinedHistory = useMemo(() => {
    const items = [
      ...motherAmounts.map((m) => ({ ...m, kind: 'Mother Amount' as const })),
      ...outletTransfers.map((t) => ({ ...t, kind: 'Transfer' as const })),
      ...cashTransfers
        .filter((t) => t.transferType === 'RTGS')
        .map((t) => ({ ...t, setByUserName: t.userName, kind: 'RTGS Transfer' as const })),
      ...cashTransfers
        .filter((t) => t.transferType === 'TRANSFER_TO_OUTLET')
        .map((t) => ({ ...t, setByUserName: t.userName, kind: 'Transfer to Outlet' as const }))
    ];
    let scoped =
      viewOutlet === 'ALL'
        ? items
        : items.filter((i) => i.outletId === viewOutlet || (i as any).destinationOutletId === viewOutlet);
    if (historyDateFilter) {
      scoped = scoped.filter((i) => new Date(i.createdAt).toLocaleDateString('en-CA') === historyDateFilter);
    }
    return scoped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [motherAmounts, outletTransfers, cashTransfers, viewOutlet, historyDateFilter]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <h2 className={`font-bold text-lg flex items-center gap-2 mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <History className="text-emerald-500" size={20} /> Cash & Mother Amount History
        </h2>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Outlet Filter */}
          <div className="relative flex-1 min-w-[200px]">
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
              <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-lg max-h-64 overflow-y-auto ${cardBg}`}>
                <button
                  onClick={() => { setViewOutlet('ALL'); setOutletDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${viewOutlet === 'ALL' ? 'text-emerald-500' : ''}`}
                >
                  All Outlets
                </button>
                {outlets.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setViewOutlet(o.id); setOutletDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${viewOutlet === o.id ? 'text-emerald-500' : ''}`}
                  >
                    {o.name} {o.code ? `(${o.code})` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="relative">
            <button
              onClick={() => setHistoryDatePickerOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${inputBg}`}
            >
              <Calendar size={13} className="text-emerald-500" />
              {historyDateFilter
                ? new Date(historyDateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Select Date'}
            </button>

            <div
              className={`absolute right-0 z-30 mt-2 w-72 rounded-2xl border shadow-lg p-3 origin-top-right transition-all duration-150 ease-out ${cardBg} ${
                historyDatePickerOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setHistoryCalendarMonth((prev) => {
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setHistoryMonthDropdownOpen((v) => !v); setHistoryYearDropdownOpen(false); }}
                      className={`text-xs font-bold py-1 px-2 rounded-md border cursor-pointer flex items-center gap-1 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      {historyMonthNamesList[historyCalendarMonth.month]}
                      <span className="text-[9px] opacity-60">▼</span>
                    </button>
                    {historyMonthDropdownOpen && (
                      <div
                        className={`absolute left-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg border shadow-xl w-32 ${
                          isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        {historyMonthNamesList.map((mName, idx) => (
                          <button
                            key={mName}
                            type="button"
                            onClick={() => {
                              setHistoryCalendarMonth((prev) => ({ ...prev, month: idx }));
                              setHistoryMonthDropdownOpen(false);
                            }}
                            className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer ${
                              idx === historyCalendarMonth.month
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

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setHistoryYearDropdownOpen((v) => !v); setHistoryMonthDropdownOpen(false); }}
                      className={`text-xs font-bold py-1 px-2 rounded-md border cursor-pointer font-mono flex items-center gap-1 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      {historyCalendarMonth.year}
                      <span className="text-[9px] opacity-60">▼</span>
                    </button>
                    {historyYearDropdownOpen && (
                      <div
                        className={`absolute left-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg border shadow-xl w-20 ${
                          isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        {historyYearOptionsList.map((y) => (
                          <button
                            key={y}
                            type="button"
                            onClick={() => {
                              setHistoryCalendarMonth((prev) => ({ ...prev, year: y }));
                              setHistoryYearDropdownOpen(false);
                            }}
                            className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer font-mono ${
                              y === historyCalendarMonth.year
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
                    setHistoryCalendarMonth((prev) => {
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
                  <div key={d} className={`text-center text-[10px] font-bold ${i === 5 || i === 6 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: new Date(historyCalendarMonth.year, historyCalendarMonth.month, 1).getDay() }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {Array.from({ length: new Date(historyCalendarMonth.year, historyCalendarMonth.month + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const dow = new Date(historyCalendarMonth.year, historyCalendarMonth.month, day).getDay();
                  const isWeekend = dow === 5 || dow === 6;
                  const dateStr = `${historyCalendarMonth.year}-${String(historyCalendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = historyDateFilter === dateStr;
                  const isToday = dateStr === new Date().toLocaleDateString('en-CA');
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setHistoryDateFilter(dateStr);
                        setHistoryDatePickerOpen(false);
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
                  onClick={() => { setHistoryDateFilter(''); setHistoryDatePickerOpen(false); }}
                  className="text-xs font-semibold text-rose-500"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    const t = new Date();
                    setHistoryCalendarMonth({ year: t.getFullYear(), month: t.getMonth() });
                    setHistoryDateFilter(t.toLocaleDateString('en-CA'));
                    setHistoryDatePickerOpen(false);
                  }}
