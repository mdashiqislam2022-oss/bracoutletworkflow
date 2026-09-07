import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRightLeft,
  Wallet,
  Landmark,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Send
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
  const { currentUser, userPreferences, cashTransfers, addCashTransfer } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const [transferType, setTransferType] = useState<CashTransferType>('RTGS');
  const [amountInput, setAmountInput] = useState('');
  const [denoms, setDenoms] = useState<Record<DenomKey, number>>(emptyDenoms());
  const [note, setNote] = useState('');
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

  const segregatedTotal = useMemo(() => {
    return [...DENOM_LEFT, ...DENOM_RIGHT].reduce((sum, d) => sum + denoms[d.key] * d.value, 0);
  }, [denoms]);

  const availableDates = useMemo(() => {
    const set = new Set(myTransfers.map((t) => new Date(t.createdAt).toDateString()));
    return Array.from(set).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [myTransfers]);

  const historyList = useMemo(() => {
    const scoped = historyDate === 'ALL'
      ? myTransfers
      : myTransfers.filter((t) => new Date(t.createdAt).toDateString() === historyDate);
    return scoped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [myTransfers, historyDate]);

  const historyTotalForSelectedDate = useMemo(() => {
    return historyList.reduce((sum, t) => sum + t.amount, 0);
  }, [historyList]);

  const handleDenomChange = (key: DenomKey, value: string) => {
    const num = parseInt(value, 10);
    setDenoms((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const handleSaveTransfer = () => {
    const amt = parseFloat(amountInput);
    if (!currentUser || isNaN(amt) || amt <= 0) return;
    addCashTransfer({
      outletId: currentUser.outletId,
      transferType,
      amount: amt,
      denominations: transferType === 'RTGS' ? denoms : undefined,
      note: note.trim() || undefined
    });
    setAmountInput('');
    setDenoms(emptyDenoms());
    setNote('');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <h2 className={`font-bold text-lg flex items-center gap-2 mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <ArrowRightLeft className="text-emerald-500" size={20} /> Transfer
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          RTGS ও Move Money ট্রান্সফার এখান থেকে করুন এবং হিস্টোরি দেখুন।
        </p>

        {/* 2 Summary Boxes */}
        <div className="grid grid-cols-2 gap-3 mb-6 max-w-lg">
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

            <p className="text-[10px] text-slate-500">
              {transferType === 'RTGS'
                ? 'RTGS transfer cash হিসেবে count হবে।'
                : 'Move Money transfer Mother Amount থেকে বিয়োগ হবে।'}
            </p>

            <button
              onClick={handleSaveTransfer}
              className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold"
            >
              Save Transfer
            </button>
          </div>

          {/* Right: Segregation panel (RTGS only) */}
          {transferType === 'RTGS' && (
            <div className={`rounded-xl border p-3 space-y-2 ${inputBg}`}>
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
              <div className="text-[11px] font-bold text-right pt-1 border-t border-slate-700/30">
                Segregated Total: ৳ {segregatedTotal.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold flex items-center gap-1.5 text-slate-500">
              <History size={14} /> Transfer History
            </div>
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${inputBg}`}
              >
                <Calendar size={12} className="text-emerald-500" />
                {historyDate === 'ALL' ? 'All Dates' : historyDate}
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              {dateDropdownOpen && (
                <div className={`absolute right-0 z-20 mt-1 w-44 rounded-xl border shadow-lg max-h-56 overflow-y-auto ${cardBg}`}>
                  <button
                    onClick={() => { setHistoryDate('ALL'); setDateDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${historyDate === 'ALL' ? 'text-emerald-500' : ''}`}
                  >
                    All Dates
                  </button>
                  {availableDates.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setHistoryDate(d); setDateDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${historyDate === d ? 'text-emerald-500' : ''}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`flex items-center justify-between rounded-lg border px-3 py-2 mb-2 text-[11px] font-bold ${inputBg}`}>
            <span>Total ({historyDate === 'ALL' ? 'All Dates' : historyDate})</span>
            <span>৳ {historyTotalForSelectedDate.toLocaleString()}</span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {historyList.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-6">No transfer history yet.</div>
            )}
            {historyList.map((t) => (
              <div key={t.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] ${inputBg}`}>
                <div>
                  <span className="font-bold">{t.transferType === 'RTGS' ? 'RTGS Transfer' : 'Move Money Transfer'}</span>
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
