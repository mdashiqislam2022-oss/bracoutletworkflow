import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { HandCoins, Building2, ChevronDown, Calendar, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { DenominationCounts } from '../../types';

const DENOM_LIST: { key: keyof DenominationCounts; value: number }[] = [
  { key: 'note1', value: 1 }, { key: 'note2', value: 2 }, { key: 'note5', value: 5 },
  { key: 'note10', value: 10 }, { key: 'note20', value: 20 }, { key: 'note50', value: 50 },
  { key: 'note100', value: 100 }, { key: 'note200', value: 200 }, { key: 'note500', value: 500 },
  { key: 'note1000', value: 1000 }
];

export const SupportingHistoryView: React.FC = () => {
  const { outlets, supportingRecords, userPreferences } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark ? 'bg-[#0F172A] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  const [viewOutlet, setViewOutlet] = useState('ALL');
  const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const monthNamesList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const yearOptionsList = Array.from({ length: 20 }, (_, i) => 2020 + i);

  const selectedOutletName = viewOutlet === 'ALL' ? 'All Outlets' : outlets.find((o) => o.id === viewOutlet)?.name || 'All Outlets';

  const filtered = useMemo(() => {
    let list = viewOutlet === 'ALL' ? supportingRecords : supportingRecords.filter((s) => s.outletId === viewOutlet);
    if (dateFilter) {
      list = list.filter((s) => new Date(s.createdAt).toLocaleDateString('en-CA') === dateFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [supportingRecords, viewOutlet, dateFilter]);

  const totals = useMemo(() => {
    const total = filtered.reduce((sum, s) => sum + s.amount, 0);
    const recovered = filtered.filter((s) => s.status === 'RECOVERED').reduce((sum, s) => sum + (s.recoveredAmount || s.amount), 0);
    const pending = filtered.filter((s) => s.status === 'PENDING').reduce((sum, s) => sum + s.amount, 0);
    return { total, recovered, pending };
  }, [filtered]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <h2 className={`font-bold text-lg flex items-center gap-2 mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <HandCoins className="text-emerald-500" size={20} /> Supporting History
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
              onClick={() => setDatePickerOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${inputBg}`}
            >
              <Calendar size={13} className="text-emerald-500" />
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
                  <div key={d} className={`text-center text-[10px] font-bold ${i === 5 || i === 6 ? 'text-rose-500' : 'text-slate-400'}`}>
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
                  onClick={() => { setDateFilter(''); setDatePickerOpen(false); }}
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

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl border p-3 border-blue-500/40 bg-blue-500/10">
            <div className="text-[11px] font-semibold text-blue-600">Total Supported</div>
            <div className="text-lg font-extrabold text-blue-600">৳ {totals.total.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border p-3 border-emerald-500/40 bg-emerald-500/10">
            <div className="text-[11px] font-semibold text-emerald-600">Recovered</div>
            <div className="text-lg font-extrabold text-emerald-600">৳ {totals.recovered.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border p-3 border-amber-500/40 bg-amber-500/10">
            <div className="text-[11px] font-semibold text-amber-600">Pending</div>
            <div className="text-lg font-extrabold text-amber-600">৳ {totals.pending.toLocaleString()}</div>
          </div>
        </div>

        <div className="text-xs text-slate-500 mb-2">{filtered.length} entries found</div>

        <div className="space-y-1.5 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-6">No supporting records found.</div>
          )}
          {filtered.map((s) => {
            const isOpen = expandedId === s.id;
            return (
              <div key={s.id} className={`rounded-lg border ${inputBg}`}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : s.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-left"
                >
                  <div>
                    <span className="font-bold">{s.recipientName}</span> — {s.purpose}
                    <span
                      className={`ml-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold align-middle ${
                        s.status === 'RECOVERED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold align-middle bg-slate-500/10 text-slate-500">
                      {s.fundingSource}
                    </span>
                    <div className="text-slate-500">
                      {s.outletName} · {s.userName} · {new Date(s.supportingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-extrabold">৳ {s.amount.toLocaleString()}</div>
                    {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-700/20 space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-500">
                      {s.mobileNumber && <div>Mobile: <span className="font-semibold">{s.mobileNumber}</span></div>}
                      {s.smeOfficerName && <div>SME Officer: <span className="font-semibold">{s.smeOfficerName}</span></div>}
                      {s.accountNumber && <div>Account No: <span className="font-semibold">{s.accountNumber}</span></div>}
                      {s.accountTitle && <div>Account Title: <span className="font-semibold">{s.accountTitle}</span></div>}
                      {s.notes && <div>Note: <span className="font-semibold">{s.notes}</span></div>}
                    </div>

                    {s.fundingSource === 'CASH' && s.denominations && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 mb-1">Given Denomination</div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
                          {DENOM_LIST.filter((d) => (s.denominations?.[d.key] || 0) > 0).map((d) => (
                            <div key={d.key} className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1">
                              <span className="font-semibold">Tk{d.value}:</span> {s.denominations?.[d.key]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {s.status === 'RECOVERED' && (
                      <div className={`rounded-lg p-2 ${isDark ? 'bg-emerald-950/30' : 'bg-emerald-50'}`}>
                        <div className="text-[10px] font-bold text-emerald-600 mb-1">Recovery Details</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-500">
                          <div>Amount: <span className="font-semibold">৳{(s.recoveredAmount || 0).toLocaleString()}</span></div>
                          <div>Source: <span className="font-semibold">{s.recoveredFundingSource}</span></div>
                          {s.recoveredAt && <div>Date: <span className="font-semibold">{new Date(s.recoveredAt).toLocaleString()}</span></div>}
                          {s.recoveredBy && <div>By: <span className="font-semibold">{s.recoveredBy}</span></div>}
                        </div>
                        {s.recoveredFundingSource === 'CASH' && s.recoveredDenominations && (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] mt-2">
                            {DENOM_LIST.filter((d) => (s.recoveredDenominations?.[d.key] || 0) > 0).map((d) => (
                              <div key={d.key} className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1">
                                <span className="font-semibold">Tk{d.value}:</span> {s.recoveredDenominations?.[d.key]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
