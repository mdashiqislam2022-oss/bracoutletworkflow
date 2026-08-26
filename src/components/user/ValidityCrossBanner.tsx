import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  BookOpen,
  CreditCard,
  Layers,
  RotateCcw
} from 'lucide-react';
import { ChequeCardEntry } from '../../types';

interface ValidityCrossBannerProps {
  isDark: boolean;
  expiredItemsCount: number;
  totalDestroyedCount: number;
  destroyedFilterDate: string;
  onSelectDestroyedDate: (date: string) => void;
  destroyedChequesCountOnDate: number;
  destroyedCardsCountOnDate: number;
  destroyedTotalOnDate: number;
  activeFilter: string;
  onSetActiveFilter: (filter: any) => void;
  onSelectDestroy?: (entry: ChequeCardEntry) => void;
}

export const ValidityCrossBanner: React.FC<ValidityCrossBannerProps> = ({
  isDark,
  expiredItemsCount,
  totalDestroyedCount,
  destroyedFilterDate,
  onSelectDestroyedDate,
  destroyedChequesCountOnDate,
  destroyedCardsCountOnDate,
  destroyedTotalOnDate,
  activeFilter,
  onSetActiveFilter,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const renderCalendar = () => {
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
      if (!destroyedFilterDate) return false;
      const [selY, selM, selD] = destroyedFilterDate.split('-').map(Number);
      return selY === year && selM === month + 1 && selD === day;
    };

    const isCurrentDay = (day: number) => {
      const t = new Date();
      return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
    };

    return (
      <div
        className={`absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-50 w-[270px] rounded-3xl border p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#182234] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Month & Year Selection */}
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
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
                  onSelectDestroyedDate(`${year}-${mStr}-${dStr}`);
                  setIsDatePickerOpen(false);
                }}
                className={`h-6 w-6 rounded-md text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                  selected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : current
                    ? 'bg-rose-50 text-rose-800 font-extrabold dark:bg-rose-950/60 dark:text-rose-300 border border-rose-400'
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
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSelectDestroyedDate(todayStr);
              setViewDate(new Date());
              setIsDatePickerOpen(false);
            }}
            className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Today</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDatePickerOpen(false)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      id="validity-cross-audit-banner"
      className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-4 shadow-sm ${
        isDark
          ? 'bg-[#182234] border-rose-900/60 text-slate-200'
          : 'bg-white border-rose-200/90 text-slate-800'
      }`}
    >
      {/* Top Section: Audit Notice & Active Overdue Alert */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 border-b pb-3.5 border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Validity Cross (90+ Days) Compliance & Destruction Dashboard
              </h3>
              {expiredItemsCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  ⚠️ {expiredItemsCount} Items Must Be Destroyed
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                  ✓ Vault Status Fully Compliant
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Under BRAC Bank vault regulations, cheque books & debit cards pending uncollected for over 90 days must be physically perforated and logged as destroyed.
            </p>
          </div>
        </div>

        {/* Quick Switch Buttons for Validity Cross vs Destroyed */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-center shrink-0">
          <button
            type="button"
            onClick={() => onSetActiveFilter('VALIDITY_CROSS')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'VALIDITY_CROSS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>90+d Overdue ({expiredItemsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onSetActiveFilter('DESTROYED')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'DESTROYED'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Destroyed ({totalDestroyedCount})</span>
          </button>
        </div>
      </div>

      {/* Date Picker & Specific Destruction Date Analysis Box (User Request) */}
      <div
        id="destruction-date-picker-section"
        className={`p-3.5 sm:p-4 rounded-2xl border ${
          isDark
            ? 'bg-slate-900/60 border-slate-800 text-white'
            : 'bg-slate-50/90 border-slate-200/90 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Date Picker Trigger Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Select Destruction Date:</span>
            </span>

            {/* Date Dropdown button with mini calendar */}
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border flex items-center gap-2 cursor-pointer transition-all shadow-2xs ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-rose-300'
                    : 'bg-white hover:bg-slate-100 border-rose-200 text-rose-800'
                }`}
              >
                <span>{destroyedFilterDate}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  {destroyedFilterDate === todayStr ? 'Today' : destroyedFilterDate === yesterdayStr ? 'Yesterday' : 'Date'}
                </span>
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
              </button>

              {isDatePickerOpen && renderCalendar()}
            </div>

            {/* Quick date presets */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectDestroyedDate(todayStr)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  destroyedFilterDate === todayStr
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => onSelectDestroyedDate(yesterdayStr)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  destroyedFilterDate === yesterdayStr
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Date Breakdown Metrics: Cheques, Cards, and Total on Date */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cheques Destroyed:</span>
              <span className="font-mono text-sm px-1.5 py-0.2 rounded bg-emerald-500/20">
                {destroyedChequesCountOnDate}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-black text-blue-800 dark:text-blue-300">
              <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Cards Destroyed:</span>
              <span className="font-mono text-sm px-1.5 py-0.2 rounded bg-blue-500/20">
                {destroyedCardsCountOnDate}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-black text-rose-800 dark:text-rose-300 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Total on {destroyedFilterDate.slice(5)}:</span>
              <span className="font-mono text-sm px-1.5 py-0.2 rounded bg-rose-600 text-white">
                {destroyedTotalOnDate}
              </span>
            </div>
          </div>
        </div>

        {/* Filter View shortcut button if viewing specific destruction date */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <span>Showing destruction records for date:</span>
            <strong className="font-mono text-rose-600 dark:text-rose-400 font-black">
              {destroyedFilterDate}
            </strong>
            <span>({destroyedTotalOnDate} items logged)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetActiveFilter('DESTROYED_DATE')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'DESTROYED_DATE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 dark:text-rose-300 border border-rose-500/30'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Show {destroyedFilterDate} Records in Table ({destroyedTotalOnDate})</span>
            </button>

            <button
              type="button"
              onClick={() => onSetActiveFilter('DESTROYED')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Show All Destroyed ({totalDestroyedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
