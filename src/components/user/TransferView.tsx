import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OutletCashSummaryPanel } from '../common/OutletCashSummaryPanel';
import {
  ArrowRightLeft,
  Wallet,
  Landmark,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { CashTransferType } from '../../types';

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

export const TransferView: React.FC = () => {
  const { currentUser, userPreferences, cashTransfers, addCashTransfer, showToast, outlets } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

    const [transferType, setTransferType] = useState<CashTransferType>('RTGS');
  const [amountInput, setAmountInput] = useState('');
  const [rtgsChargeEnabled, setRtgsChargeEnabled] = useState(false);
  const [rtgsChargeAmount, setRtgsChargeAmount] = useState('100');
  const [denoms, setDenoms] = useState<Record<DenomKey, number>>(emptyDenoms());
    const [note, setNote] = useState('');
    const [copiedTotal, setCopiedTotal] = useState(false);
  const [destinationOutletId, setDestinationOutletId] = useState('');
  const [outletSearchTerm, setOutletSearchTerm] = useState('');
  const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = dateFilter ? new Date(dateFilter) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const monthNamesList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const yearOptionsList = Array.from({ length: 20 }, (_, i) => 2020 + i);
  const myTransfers = useMemo(() => {
    return cashTransfers.filter((t) => !currentUser || t.userId === currentUser.id);
  }, [cashTransfers, currentUser]);

  const rtgsTotal = useMemo(() => {
    return myTransfers.filter((t) => t.transferType === 'RTGS').reduce((sum, t) => sum + t.amount, 0);
  }, [myTransfers]);

  const moveMoneyTotal = useMemo(() => {
    return myTransfers.filter((t) => t.transferType === 'MOVE_MONEY').reduce((sum, t) => sum + t.amount, 0);
  }, [myTransfers]);
  
  const transferToOutletTotal = useMemo(() => {
    return myTransfers.filter((t) => t.transferType === 'TRANSFER_TO_OUTLET').reduce((sum, t) => sum + t.amount, 0);
  }, [myTransfers]);

  const filteredOutlets = useMemo(() => {
    const term = outletSearchTerm.trim().toLowerCase();
    const list = outlets.filter((o) => o.id !== currentUser?.outletId);
    if (!term) return list;
    return list.filter((o) => o.name.toLowerCase().includes(term) || o.code?.toLowerCase().includes(term));
  }, [outlets, outletSearchTerm, currentUser]);

  const selectedDestinationOutlet = outlets.find((o) => o.id === destinationOutletId);

  const segregatedTotal = useMemo(() => {
    return [...DENOM_LEFT, ...DENOM_RIGHT].reduce((sum, d) => sum + denoms[d.key] * d.value, 0);
  }, [denoms]);
  
        const canSaveTransfer = useMemo(() => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return false;
    if (transferType === 'RTGS' || transferType === 'TRANSFER_TO_OUTLET') {
      if (segregatedTotal <= 0 || amt !== segregatedTotal) return false;
    }
    if (transferType === 'RTGS' && rtgsChargeEnabled) {
      const chargeAmt = parseFloat(rtgsChargeAmount);
      if (isNaN(chargeAmt) || chargeAmt < 0 || chargeAmt > amt) return false;
    }
    if (transferType === 'TRANSFER_TO_OUTLET' && !destinationOutletId) return false;
    return true;
  }, [amountInput, transferType, segregatedTotal, destinationOutletId, rtgsChargeEnabled, rtgsChargeAmount]);

    const historyList = useMemo(() => {
    const scoped = !dateFilter
      ? myTransfers
      : myTransfers.filter((t) => new Date(t.createdAt).toLocaleDateString('en-CA') === dateFilter);
    return scoped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [myTransfers, dateFilter]);

  const historyTotalForSelectedDate = useMemo(() => {
    return historyList.reduce((sum, t) => sum + t.amount, 0);
  }, [historyList]);

       const handleDenomChange = (key: DenomKey, value: string) => {
    const num = parseInt(value, 10);
    const safeNum = isNaN(num) ? 0 : num;
    setDenoms((prev) => {
      const updated = { ...prev, [key]: safeNum };
      if (transferType === 'RTGS' || transferType === 'TRANSFER_TO_OUTLET') {
        const newTotal = [...DENOM_LEFT, ...DENOM_RIGHT].reduce((sum, d) => sum + updated[d.key] * d.value, 0);
        setAmountInput(newTotal > 0 ? String(newTotal) : '');
      }
      return updated;
    });
  };

    const handleSaveTransfer = () => {
    const amt = parseFloat(amountInput);
    if (!currentUser || isNaN(amt) || amt <= 0) return;

    if (transferType === 'RTGS' || transferType === 'TRANSFER_TO_OUTLET') {
      if (segregatedTotal <= 0) {
        showToast({ message: 'Transfer save করার আগে অবশ্যই Segregation দিতে হবে।', type: 'error' });
        return;
      }
      if (amt !== segregatedTotal) {
        showToast({ message: 'Amount এবং Segregation Total অবশ্যই এক হতে হবে।', type: 'error' });
        return;
      }
    }

    if (transferType === 'TRANSFER_TO_OUTLET' && !destinationOutletId) {
      showToast({ message: 'অনুগ্রহ করে একটা Destination Outlet সিলেক্ট করুন।', type: 'error' });
      return;
    }

       const rtgsChargeAmt = transferType === 'RTGS' && rtgsChargeEnabled ? (parseFloat(rtgsChargeAmount) || 0) : 0;
    if (transferType === 'RTGS' && rtgsChargeEnabled && rtgsChargeAmt > amt) {
      showToast({ message: 'Charge amount, total RTGS amount থেকে বেশি হতে পারবে না।', type: 'error' });
      return;
    }

    addCashTransfer({
      outletId: currentUser.outletId,
      transferType,
      amount: amt,
      chargeAmount: transferType === 'RTGS' ? rtgsChargeAmt : undefined,
      denominations: transferType !== 'MOVE_MONEY' ? denoms : undefined,
      note: note.trim() || undefined,
      destinationOutletId: transferType === 'TRANSFER_TO_OUTLET' ? destinationOutletId : undefined
    });
    setAmountInput('');
    setDenoms(emptyDenoms());
    setNote('');
    setDestinationOutletId('');
    setOutletSearchTerm('');
    setRtgsChargeEnabled(false);
    setRtgsChargeAmount('100');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <h2 className={`font-bold text-lg flex items-center gap-2 mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <ArrowRightLeft className="text-emerald-500" size={20} /> Transfer
               </h2>

        <OutletCashSummaryPanel outletId={currentUser?.outletId || ''} isDark={isDark} />

               {/* 3 Summary Boxes */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-2xl">
          <div className="rounded-xl border p-3 border-blue-500/40 bg-blue-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
              <Landmark size={13} /> RTGS Transfer
            </div>
            <div className="text-lg font-extrabold mt-1 text-blue-600">৳ {rtgsTotal.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border p-3 border-purple-500/40 bg-purple-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600">
              <Wallet size={13} /> Move Money Transfer
            </div>
            <div className="text-lg font-extrabold mt-1 text-purple-600">৳ {moveMoneyTotal.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border p-3 border-teal-500/40 bg-teal-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-600">
              <Send size={13} /> Transferred Amount to Outlet
            </div>
            <div className="text-lg font-extrabold mt-1 text-teal-600">৳ {transferToOutletTotal.toLocaleString()}</div>
          </div>
        </div>

        {/* Transfer Option */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Transfer form */}
          <div className={`rounded-xl border p-3 space-y-2 ${inputBg}`}>
            <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
              <Send size={14} /> Transfer Option
            </div>

                        <div className="flex gap-2">
              <button
                onClick={() => setTransferType('RTGS')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                  transferType === 'RTGS'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : `${inputBg}`
                }`}
              >
                RTGS Transfer
              </button>
              <button
                onClick={() => setTransferType('MOVE_MONEY')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                  transferType === 'MOVE_MONEY'
                    ? 'bg-purple-500 text-white border-purple-500'
                    : `${inputBg}`
                }`}
              >
                Move Money
              </button>
              <button
                onClick={() => setTransferType('TRANSFER_TO_OUTLET')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                  transferType === 'TRANSFER_TO_OUTLET'
                    ? 'bg-teal-500 text-white border-teal-500'
                    : `${inputBg}`
                }`}
              >
                Transfer to Outlet
              </button>
            </div>

            <input
              type="number"
              min={0}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="Amount"
              className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}
            />

            {transferType === 'TRANSFER_TO_OUTLET' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOutletDropdownOpen((v) => !v)}
                  className={`w-full flex items-center justify-between rounded-lg border px-2 py-1.5 text-xs font-semibold ${inputBg}`}
                >
                  <span className="truncate">{selectedDestinationOutlet ? selectedDestinationOutlet.name : 'Select Destination Outlet'}</span>
                  <ChevronDown size={13} className="text-slate-400 shrink-0" />
                </button>
                {outletDropdownOpen && (
                  <div className={`absolute z-30 mt-1 w-full rounded-xl border shadow-lg ${cardBg}`}>
                    <div className="p-2 border-b border-slate-700/20">
                      <input
                        autoFocus
                        value={outletSearchTerm}
                        onChange={(e) => setOutletSearchTerm(e.target.value)}
                        placeholder="Search outlet..."
                        className={`w-full rounded-lg border px-2 py-1 text-xs ${inputBg}`}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredOutlets.length === 0 && (
                        <div className="text-[11px] text-slate-500 text-center py-3">No outlet found.</div>
                      )}
                      {filteredOutlets.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setDestinationOutletId(o.id);
                            setOutletDropdownOpen(false);
                            setOutletSearchTerm('');
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500/10 ${
                            destinationOutletId === o.id ? 'text-emerald-500' : ''
                          }`}
                        >
                          {o.name} {o.code ? `(${o.code})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

                        <button
              onClick={handleSaveTransfer}
              disabled={!canSaveTransfer}
              className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Transfer
            </button>
          </div>

                            {/* Right: Segregation panel (enabled for RTGS & Transfer to Outlet, disabled for Move Money) */}
         <div className={`rounded-xl border p-3 space-y-2 transition-all ${inputBg} ${transferType === 'MOVE_MONEY' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="text-xs font-bold flex items-center gap-1.5 text-blue-600 mb-1">
                Segregation
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  {DENOM_LEFT.map((d) => (
                    <div key={d.key} className="flex items-center gap-1.5">
                      <span className="text-[10px] w-9 font-semibold text-slate-500">Tk{d.value}</span>
                      <input
                        type="number"
                        min={0}
                                                disabled={transferType === 'MOVE_MONEY'}
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
                                                disabled={transferType === 'MOVE_MONEY'}
                        value={denoms[d.key] || ''}
                        onChange={(e) => handleDenomChange(d.key, e.target.value)}
                        placeholder="0"
                        className={`w-full rounded-lg border px-2 py-1 text-xs ${inputBg}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 text-[11px] font-bold pt-1 border-t border-slate-700/30">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(segregatedTotal));
                    setCopiedTotal(true);
                    setTimeout(() => setCopiedTotal(false), 1500);
                  }}
                  title="Copy exact amount"
                  className={`p-1 rounded-md border transition-colors ${
                    copiedTotal
                      ? 'border-emerald-500 text-emerald-500'
                      : isDark
                      ? 'border-slate-700 text-slate-400 hover:text-slate-200'
                      : 'border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {copiedTotal ? <Check size={12} /> : <Copy size={12} />}
                </button>
                Segregated Total: ৳ {segregatedTotal.toLocaleString()}
              </div>
            </div>
        </div>

        {/* History */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold flex items-center gap-1.5 text-slate-500">
              <History size={14} /> Transfer History
            </div>
                        <div className="relative">
              <button
                onClick={() => setDatePickerOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${inputBg}`}
              >
                <Calendar size={12} className="text-emerald-500" />
                {dateFilter
                  ? new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'All Dates'}
                <ChevronDown size={12} className="text-slate-400" />
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

          <div className={`flex items-center justify-between rounded-lg border px-3 py-2 mb-2 text-[11px] font-bold ${inputBg}`}>
            <span>
              Total (
              {dateFilter
                ? new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'All Dates'}
              )
            </span>
            <span>৳ {historyTotalForSelectedDate.toLocaleString()}</span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {historyList.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-6">No transfer history yet.</div>
            )}
            {historyList.map((t) => (
              <div key={t.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] ${inputBg}`}>
                <div>
                                   <span className="font-bold">
                    {t.transferType === 'RTGS'
                      ? 'RTGS Transfer'
                      : t.transferType === 'MOVE_MONEY'
                      ? 'Move Money Transfer'
                      : `Transfer to ${t.destinationOutletName || 'Outlet'}`}
                  </span>
                  {t.note ? <span className="text-slate-500"> ({t.note})</span> : null}
                  <div className="text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <div className="font-extrabold">৳ {t.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
