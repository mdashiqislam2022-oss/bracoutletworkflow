import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HandCoins,
  History,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Landmark,
  CheckCircle2,
  Clock3,
  Sparkles
} from 'lucide-react';
import { SupportingFundingSource } from '../../types';

type DenomKey = 'note1' | 'note2' | 'note5' | 'note10' | 'note20' | 'note50' | 'note100' | 'note200' | 'note500' | 'note1000';

const DENOM_LEFT: { key: DenomKey; value: number }[] = [
  { key: 'note1', value: 1 },
  { key: 'note2', value: 2 },
  { key: 'note5', value: 5 },
  { key: 'note10', value: 10 },
  { key: 'note20', value: 20 }
];
const DENOM_RIGHT: { key: DenomKey; value: number }[] = [
  { key: 'note50', value: 50 },
  { key: 'note100', value: 100 },
  { key: 'note200', value: 200 },
  { key: 'note500', value: 500 },
  { key: 'note1000', value: 1000 }
];

const emptyDenoms = (): Record<DenomKey, number> => ({
  note1: 0, note2: 0, note5: 0, note10: 0, note20: 0,
  note50: 0, note100: 0, note200: 0, note500: 0, note1000: 0
});

const todayStr = () => new Date().toLocaleDateString('en-CA');

const monthNamesList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const yearOptionsList = Array.from({ length: 20 }, (_, i) => 2020 + i);

// Only letters, spaces, and common name punctuation allowed
const stripDigits = (val: string) => val.replace(/[0-9]/g, '');
// Only digits allowed
const stripNonDigits = (val: string) => val.replace(/\D/g, '');

export const SupportingView: React.FC = () => {
  const { currentUser, userPreferences, supportingRecords, addSupportingRecord, markSupportingRecovered, showToast } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [fundingSource, setFundingSource] = useState<SupportingFundingSource>('CASH');
  const [denoms, setDenoms] = useState<Record<DenomKey, number>>(emptyDenoms());
  const [balanceAmount, setBalanceAmount] = useState('');

  const [recipientName, setRecipientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [smeOfficerName, setSmeOfficerName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [supportingDate, setSupportingDate] = useState(todayStr());

  // Entry-form date picker state
  const [entryDatePickerOpen, setEntryDatePickerOpen] = useState(false);
  const [entryCalendarMonth, setEntryCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [entryMonthDropdownOpen, setEntryMonthDropdownOpen] = useState(false);
  const [entryYearDropdownOpen, setEntryYearDropdownOpen] = useState(false);

  // History filter date picker state
  const [historyDateFilter, setHistoryDateFilter] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | 'PENDING' | 'RECOVERED'>('ALL');
  const [historyDatePickerOpen, setHistoryDatePickerOpen] = useState(false);
  const [historyCalendarMonth, setHistoryCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [historyMonthDropdownOpen, setHistoryMonthDropdownOpen] = useState(false);
  const [historyYearDropdownOpen, setHistoryYearDropdownOpen] = useState(false);
   const [recoverConfirmId, setRecoverConfirmId] = useState<string | null>(null);
  const [recoverFundingSource, setRecoverFundingSource] = useState<SupportingFundingSource>('CASH');
  const [recoverDenoms, setRecoverDenoms] = useState<Record<DenomKey, number>>(emptyDenoms());

  const handleRecoverDenomChange = (key: DenomKey, value: string) => {
    const num = parseInt(value, 10);
    const safeNum = isNaN(num) ? 0 : num;
    setRecoverDenoms((prev) => ({ ...prev, [key]: safeNum }));
  };

  const recoverSegregatedTotal = useMemo(() => {
    return [...DENOM_LEFT, ...DENOM_RIGHT].reduce((sum, d) => sum + recoverDenoms[d.key] * d.value, 0);
  }, [recoverDenoms]);

  const handleDenomChange = (key: DenomKey, value: string) => {
    const num = parseInt(value, 10);
    const safeNum = isNaN(num) ? 0 : num;
    setDenoms((prev) => ({ ...prev, [key]: safeNum }));
  };

  const segregatedTotal = useMemo(() => {
    return [...DENOM_LEFT, ...DENOM_RIGHT].reduce((sum, d) => sum + denoms[d.key] * d.value, 0);
  }, [denoms]);

  const supportingAmount = useMemo(() => {
    if (fundingSource === 'CASH') return segregatedTotal;
    return parseFloat(balanceAmount) || 0;
  }, [fundingSource, segregatedTotal, balanceAmount]);

  // Save button enables ONLY when Supporting To (Name) and Purpose are filled — everything else optional
  const canSaveSupporting = useMemo(() => {
    if (!recipientName.trim() || !purpose.trim()) return false;
    if (supportingAmount <= 0) return false;
    return true;
  }, [recipientName, purpose, supportingAmount]);

  const handleSaveSupporting = () => {
    if (!currentUser) return;
    if (!canSaveSupporting) {
      showToast({ message: 'অনুগ্রহ করে Supporting To Name ও Purpose পূরণ করুন এবং amount দিন।', type: 'error' });
      return;
    }
    addSupportingRecord({
      fundingSource,
      denominations: fundingSource === 'CASH' ? denoms : undefined,
      amount: supportingAmount,
      recipientName: recipientName.trim(),
      mobileNumber: mobileNumber.trim() || undefined,
      smeOfficerName: smeOfficerName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      accountTitle: accountTitle.trim() || undefined,
      purpose: purpose.trim(),
      supportingDate,
      outletId: currentUser.outletId,
      notes: notes.trim() || undefined
    });
    // Reset form
    setDenoms(emptyDenoms());
    setBalanceAmount('');
    setRecipientName('');
    setMobileNumber('');
    setSmeOfficerName('');
    setAccountNumber('');
    setAccountTitle('');
    setPurpose('');
    setNotes('');
    setSupportingDate(todayStr());
  };

  const mySupportingRecords = useMemo(() => {
    return supportingRecords.filter((r) => !currentUser || r.userId === currentUser.id);
  }, [supportingRecords, currentUser]);

  const totalSupportingStats = useMemo(() => {
    const amount = mySupportingRecords.reduce((sum, r) => sum + r.amount, 0);
    return { amount, count: mySupportingRecords.length };
  }, [mySupportingRecords]);

   const recoveredStats = useMemo(() => {
    const recovered = mySupportingRecords.filter((r) => r.status === 'RECOVERED');
    const amount = recovered.reduce((sum, r) => sum + r.amount, 0);
    return { amount, count: recovered.length };
  }, [mySupportingRecords]);

  const pendingStats = useMemo(() => {
    const pending = mySupportingRecords.filter((r) => r.status === 'PENDING');
    const amount = pending.reduce((sum, r) => sum + r.amount, 0);
    return { amount, count: pending.length };
  }, [mySupportingRecords]);
    const filteredHistory = useMemo(() => {
    let items = [...mySupportingRecords];
    if (historyDateFilter) {
      items = items.filter((r) => r.supportingDate === historyDateFilter);
    }
    if (historyStatusFilter !== 'ALL') {
      items = items.filter((r) => r.status === historyStatusFilter);
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mySupportingRecords, historyDateFilter, historyStatusFilter]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <div className="flex items-center justify-between mb-1">
          <h2 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <HandCoins className="text-emerald-500" size={20} /> Supporting
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab((prev) => (prev === 'entry' ? 'history' : 'entry'))}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
              activeTab === 'history' ? 'bg-emerald-500 text-white border-emerald-500' : inputBg
            }`}
          >
            <History size={14} />
            {activeTab === 'history' ? 'Supporting' : 'History'}
          </button>
        </div>

        {activeTab === 'entry' && (
          <div className="animate-tab-fade">
                       {/* Summary Boxes */}
            <div className="grid grid-cols-3 gap-3 mb-6 max-w-3xl">
              <div className="rounded-xl border p-3 border-blue-500/40 bg-blue-500/10">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                  <Wallet size={13} /> Total Supported Amount
                </div>
                <div className="text-lg font-extrabold mt-1 text-blue-600">
                  ৳ {totalSupportingStats.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-blue-600/70 font-semibold mt-0.5">{totalSupportingStats.count} entries</div>
              </div>
              <div className="rounded-xl border p-3 border-emerald-500/40 bg-emerald-500/10">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 size={13} /> Recovered Amount
                </div>
                <div className="text-lg font-extrabold mt-1 text-emerald-600">
                  ৳ {recoveredStats.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600/70 font-semibold mt-0.5">{recoveredStats.count} entries</div>
              </div>
                            <button
                type="button"
                onClick={() => { setHistoryStatusFilter('PENDING'); setActiveTab('history'); }}
                className="text-left rounded-xl border p-3 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                  <Clock3 size={13} /> Pending Supporting
                </div>
                <div className="text-lg font-extrabold mt-1 text-amber-600">
                  ৳ {pendingStats.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-600/70 font-semibold mt-0.5">{pendingStats.count} entries</div>
              </button>
            </div>

                       {/* Funding Source Selector - width matches Money Segregation box below */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
              <div>
              <div className="text-xs font-bold flex items-center gap-1.5 text-slate-500 mb-1.5">
                Supporting Source
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFundingSource('CASH')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${
                    fundingSource === 'CASH' ? 'bg-blue-500 text-white border-blue-500' : `${inputBg}`
                  }`}
                >
                  <Wallet size={13} /> Cash
                </button>
                <button
                  type="button"
                  onClick={() => setFundingSource('BALANCE')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${
                    fundingSource === 'BALANCE' ? 'bg-purple-500 text-white border-purple-500' : `${inputBg}`
                  }`}
                >
                                   <Landmark size={13} /> Balance
                </button>
              </div>
              </div>
              <div className="hidden lg:block" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Segregation / Balance Amount + Save */}
                           <div className={`rounded-xl border p-3 space-y-2 ${inputBg}`}>
                <div key={fundingSource} className="animate-tab-fade">
                {fundingSource === 'CASH' ? (
                  <>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-blue-600 mb-1">
                      Money Segregation
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        {DENOM_LEFT.map((d) => (
                          <div key={d.key} className="flex items-center gap-1.5">
                            <span className="text-[10px] w-9 font-semibold text-slate-500">Tk{d.value}</span>
                            <input
                              type="number"
                              min={0}
                              value={denoms[d.key] || ''}
                              onChange={(e) => handleDenomChange(d.key, e.target.value)}
                              placeholder="0"
                              className={`w-full rounded-lg border px-2 py-1 text-xs ${inputBg}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        {DENOM_RIGHT.map((d) => (
                          <div key={d.key} className="flex items-center gap-1.5">
                            <span className="text-[10px] w-9 font-semibold text-slate-500">Tk{d.value}</span>
                            <input
                              type="number"
                              min={0}
                              value={denoms[d.key] || ''}
                              onChange={(e) => handleDenomChange(d.key, e.target.value)}
                              placeholder="0"
                              className={`w-full rounded-lg border px-2 py-1 text-xs ${inputBg}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-purple-600 mb-1">
                      Balance Amount
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      placeholder="Amount from Balance"
                      className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
                    />
                                  </>
                )}
                </div>

                <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] font-bold mt-2 ${cardBg}`}>
                  <span className="text-slate-500">Supporting Amount</span>
                  <span className="text-emerald-600">৳ {supportingAmount.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleSaveSupporting}
                  disabled={!canSaveSupporting}
                  className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Supporting
                </button>
              </div>

              {/* Right: Details Form */}
              <div className={`rounded-xl border p-3 space-y-2 ${inputBg}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
                    Supporting Details
                  </div>

                  {/* Date Picker - moved to top right corner */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEntryDatePickerOpen((v) => !v)}
                      className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold ${inputBg}`}
                    >
                      <Calendar size={11} className="text-emerald-500" />
                      {supportingDate
                        ? new Date(supportingDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Select Date'}
                      <ChevronDown size={11} className="text-slate-400" />
                    </button>

                    <div
                      className={`absolute right-0 z-30 mt-2 w-72 rounded-2xl border shadow-lg p-3 origin-top-right transition-all duration-150 ease-out ${cardBg} ${
                        entryDatePickerOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() =>
                            setEntryCalendarMonth((prev) => {
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
                              onClick={() => { setEntryMonthDropdownOpen((v) => !v); setEntryYearDropdownOpen(false); }}
                              className={`text-xs font-bold py-1 px-2 rounded-md border cursor-pointer flex items-center gap-1 ${
                                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              {monthNamesList[entryCalendarMonth.month]}
                              <span className="text-[9px] opacity-60">▼</span>
                            </button>
                            {entryMonthDropdownOpen && (
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
                                      setEntryCalendarMonth((prev) => ({ ...prev, month: idx }));
                                      setEntryMonthDropdownOpen(false);
                                    }}
                                    className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer ${
                                      idx === entryCalendarMonth.month
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
                              onClick={() => { setEntryYearDropdownOpen((v) => !v); setEntryMonthDropdownOpen(false); }}
                              className={`text-xs font-bold py-1 px-2 rounded-md border cursor-pointer font-mono flex items-center gap-1 ${
                                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              {entryCalendarMonth.year}
                              <span className="text-[9px] opacity-60">▼</span>
                            </button>
                            {entryYearDropdownOpen && (
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
                                      setEntryCalendarMonth((prev) => ({ ...prev, year: y }));
                                      setEntryYearDropdownOpen(false);
                                    }}
                                    className={`w-full text-left text-xs font-semibold px-3 py-1.5 cursor-pointer font-mono ${
                                      y === entryCalendarMonth.year
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
                            setEntryCalendarMonth((prev) => {
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
                        {Array.from({ length: new Date(entryCalendarMonth.year, entryCalendarMonth.month, 1).getDay() }).map((_, i) => (
                          <div key={`blank-${i}`} />
                        ))}
                        {Array.from({ length: new Date(entryCalendarMonth.year, entryCalendarMonth.month + 1, 0).getDate() }).map((_, i) => {
                          const day = i + 1;
                          const dow = new Date(entryCalendarMonth.year, entryCalendarMonth.month, day).getDay();
                          const isWeekend = dow === 5 || dow === 6;
                          const dateStr = `${entryCalendarMonth.year}-${String(entryCalendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isSelected = supportingDate === dateStr;
                          const isToday = dateStr === todayStr();
                          return (
                            <button
                              key={day}
                              onClick={() => {
                                setSupportingDate(dateStr);
                                setEntryDatePickerOpen(false);
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
                        <span className="text-[10px] text-slate-500 font-medium">Selected Date</span>
                        <button
                          onClick={() => {
                            const t = new Date();
                            setEntryCalendarMonth({ year: t.getFullYear(), month: t.getMonth() });
                            setSupportingDate(todayStr());
                            setEntryDatePickerOpen(false);
                          }}
                          className="text-xs font-semibold text-emerald-500 flex items-center gap-1"
                        >
                          <Sparkles size={11} /> Today
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                              <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(stripDigits(e.target.value))}
                  placeholder="Supporting To (Name)"
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
                />
                <div className="text-[9px] font-bold text-rose-500 -mt-1.5 ml-0.5">* Required</div>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(stripDigits(e.target.value))}
                  placeholder="Supporting Purpose"
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
                />
                <div className="text-[9px] font-bold text-rose-500 -mt-1.5 ml-0.5">* Required</div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(stripNonDigits(e.target.value))}
                  placeholder="Number (Mobile)"
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
                />
                <input
                  value={smeOfficerName}
                  onChange={(e) => setSmeOfficerName(stripDigits(e.target.value))}
                  placeholder="SME Officer Name"
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(stripNonDigits(e.target.value))}
                  placeholder="Account Number"
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
                />
                <input
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(stripDigits(e.target.value))}
                  placeholder="Account Title"
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
                />

                {/* Note box - placed where date picker used to be */}
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note (optional)"
                  rows={2}
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs resize-none ${inputBg}`}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-tab-fade">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] font-bold ${inputBg}`}>
                <span>
                  Total ({historyDateFilter
                    ? new Date(historyDateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'All Dates'})
                </span>
                <span className="ml-2">৳ {filteredHistory.reduce((s, r) => s + r.amount, 0).toLocaleString()}</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setHistoryDatePickerOpen((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${inputBg}`}
                >
                  <Calendar size={12} className="text-emerald-500" />
                  {historyDateFilter
                    ? new Date(historyDateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'All Dates'}
                  <ChevronDown size={12} className="text-slate-400" />
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
                          {monthNamesList[historyCalendarMonth.month]}
                          <span className="text-[9px] opacity-60">▼</span>
                        </button>
                        {historyMonthDropdownOpen && (
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
                            {yearOptionsList.map((y) => (
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
                      <div
                        key={d}
                        className={`text-center text-[10px] font-bold ${i === 5 || i === 6 ? 'text-rose-500' : 'text-slate-400'}`}
                      >
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
                      const isToday = dateStr === todayStr();
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
                      onClick={() => {
                        setHistoryDateFilter('');
                        setHistoryDatePickerOpen(false);
                      }}
                      className="text-xs font-semibold text-rose-500"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        const t = new Date();
                        setHistoryCalendarMonth({ year: t.getFullYear(), month: t.getMonth() });
                        setHistoryDateFilter(todayStr());
                        setHistoryDatePickerOpen(false);
                      }}
                      className="text-xs font-semibold text-emerald-500"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {filteredHistory.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-6">No supporting history found.</div>
              )}
              {filteredHistory.map((r) => (
                <div key={r.id} className={`rounded-lg border px-3 py-2 text-[11px] ${inputBg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold">{r.recipientName}</span>
                      <span className="text-slate-500"> ({r.purpose})</span>
                      <span
                        className={`ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold align-middle ${
                          r.fundingSource === 'CASH'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-purple-500/10 text-purple-600'
                        }`}
                      >
                        {r.fundingSource}
                      </span>
                      <span
                        className={`ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold align-middle ${
                          r.status === 'RECOVERED'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {r.status}
                      </span>
                      <div className="text-slate-500">
                        {new Date(r.supportingDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {r.smeOfficerName ? ` · SME: ${r.smeOfficerName}` : ''}
                        {r.notes ? ` · Note: ${r.notes}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="font-extrabold">৳ {r.amount.toLocaleString()}</div>
                      {r.status === 'PENDING' ? (
                                                                     <button
                          type="button"
                          onClick={() => {
                            setRecoverConfirmId(r.id);
                            setRecoverFundingSource('CASH');
                            setRecoverDenoms(emptyDenoms());
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold"
                        >
                          <CheckCircle2 size={11} /> Recovered
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <Clock3 size={11} /> {r.recoveredAt ? new Date(r.recoveredAt).toLocaleDateString('en-GB') : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                           ))}
            </div>
          </div>
        )}
      </div>

           {/* Recovered Confirmation Popup */}
      {recoverConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-sm rounded-2xl border p-4 shadow-xl ${cardBg}`}>
                       <div className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Confirm Recovery
            </div>
            <div className="text-xs text-slate-500 mb-3">
              Has the supporting amount of ৳{' '}
              {(mySupportingRecords.find((r) => r.id === recoverConfirmId)?.amount || 0).toLocaleString()}{' '}
              been properly recovered?
            </div>

            <div className="text-xs font-bold flex items-center gap-1.5 text-slate-500 mb-1.5">
              Recovered Via
            </div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setRecoverFundingSource('CASH')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${
                  recoverFundingSource === 'CASH' ? 'bg-blue-500 text-white border-blue-500' : `${inputBg}`
                }`}
              >
                <Wallet size={13} /> Cash
              </button>
              <button
                type="button"
                onClick={() => setRecoverFundingSource('BALANCE')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${
                  recoverFundingSource === 'BALANCE' ? 'bg-purple-500 text-white border-purple-500' : `${inputBg}`
                }`}
              >
                <Landmark size={13} /> Balance
              </button>
            </div>

            <div key={recoverFundingSource} className="animate-tab-fade">
              {recoverFundingSource === 'CASH' ? (
                <div className={`rounded-xl border p-3 space-y-2 mb-3 ${inputBg}`}>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-blue-600 mb-1">
                    Money Segregation
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      {DENOM_LEFT.map((d) => (
                        <div key={d.key} className="flex items-center gap-1.5">
                          <span className="text-[10px] w-9 font-semibold text-slate-500">Tk{d.value}</span>
                          <input
                            type="number"
                            min={0}
                            value={recoverDenoms[d.key] || ''}
                            onChange={(e) => handleRecoverDenomChange(d.key, e.target.value)}
                            placeholder="0"
                            className={`w-full rounded-lg border px-2 py-1 text-xs ${inputBg}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      {DENOM_RIGHT.map((d) => (
                        <div key={d.key} className="flex items-center gap-1.5">
                          <span className="text-[10px] w-9 font-semibold text-slate-500">Tk{d.value}</span>
                          <input
                            type="number"
                            min={0}
                            value={recoverDenoms[d.key] || ''}
                            onChange={(e) => handleRecoverDenomChange(d.key, e.target.value)}
                            placeholder="0"
                            className={`w-full rounded-lg border px-2 py-1 text-xs ${inputBg}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                                   <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] font-bold mt-2 ${cardBg}`}>
                    <span className="text-slate-500">Recovered Amount</span>
                    <span className="text-emerald-600">৳ {recoverSegregatedTotal.toLocaleString()}</span>
                  </div>
                  <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] font-bold mt-2 ${cardBg}`}>
                    <span className="text-slate-500">Total Supporting Amount</span>
                    <span className="text-blue-600">
                      ৳ {(mySupportingRecords.find((r) => r.id === recoverConfirmId)?.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] font-bold mt-2 ${cardBg}`}>
                    <span className="text-slate-500">Due Amount</span>
                    <span
                      className={
                        (mySupportingRecords.find((r) => r.id === recoverConfirmId)?.amount || 0) - recoverSegregatedTotal === 0
                          ? 'text-emerald-600'
                          : 'text-rose-500'
                      }
                    >
                      ৳ {((mySupportingRecords.find((r) => r.id === recoverConfirmId)?.amount || 0) - recoverSegregatedTotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 mb-3">
                  The full supporting amount of ৳{' '}
                  {(mySupportingRecords.find((r) => r.id === recoverConfirmId)?.amount || 0).toLocaleString()}{' '}
                  will be added back to Mother Amount.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecoverConfirmId(null)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${inputBg}`}
              >
                No
              </button>
              <button
                type="button"
                                disabled={
                  recoverFundingSource === 'CASH' &&
                  recoverSegregatedTotal !== (mySupportingRecords.find((r) => r.id === recoverConfirmId)?.amount || 0)
                }
                onClick={() => {
                  if (recoverConfirmId) {
                    markSupportingRecovered(recoverConfirmId, {
                      recoveredFundingSource: recoverFundingSource,
                      recoveredDenominations: recoverFundingSource === 'CASH' ? recoverDenoms : undefined,
                      recoveredAmount: recoverFundingSource === 'CASH' ? recoverSegregatedTotal : undefined
                    });
                  }
                  setRecoverConfirmId(null);
                }}
                className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
