import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  required?: boolean;
  isDark?: boolean;
  error?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label = 'Received Date',
  required = false,
  isDark = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or today
  const getInitialDate = (valStr: string) => {
    if (valStr && !isNaN(new Date(valStr).getTime())) {
      return new Date(valStr);
    }
    return new Date();
  };

  const selectedDate = getInitialDate(value);
  const [viewDate, setViewDate] = useState<Date>(new Date(selectedDate));

  // Sync view when value changes
  useEffect(() => {
    if (value && !isNaN(new Date(value).getTime())) {
      setViewDate(new Date(value));
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return 'Select Date';
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dStr;
    }
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    setViewDate(new Date());
    setIsOpen(false);
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const isSelected = (day: number) => {
    if (!value) return false;
    const [selY, selM, selD] = value.split('-').map(Number);
    return selY === year && selM === month + 1 && selD === day;
  };

  const isCurrentDay = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold mb-1.5 text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Main Trigger Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer select-none ${
          error
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : isDark
            ? 'bg-slate-900 border-slate-700 hover:border-slate-600 text-white'
            : 'bg-white border-slate-300 hover:border-slate-400 text-slate-900 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {formatDisplayDate(value)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {value || 'YYYY-MM-DD'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {value === todayStr && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              Today
            </span>
          )}
          <span className="text-xs text-slate-400">▼</span>
        </div>
      </button>

      {/* Dropdown Calendar Popup */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-[252px] rounded-2xl border shadow-2xl p-2.5 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-[#1E293B] border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* Month & Year Navigation with Specific Selectors */}
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Direct Month & Year Dropdown Selectors */}
            <div className="flex items-center gap-1">
              <select
                value={month}
                onChange={(e) => setViewDate(new Date(year, parseInt(e.target.value, 10), 1))}
                className={`text-[11px] font-extrabold py-0.5 px-1 rounded border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
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
                className={`text-[11px] font-extrabold py-0.5 px-1 rounded border transition-colors cursor-pointer font-mono ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {Array.from({ length: 25 }, (_, i) => 2015 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekday headers */}
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
                  onClick={() => handleSelectDay(day)}
                  className={`h-6 w-6 rounded-md text-[11px] font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    selected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : current
                      ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700'
                      : isDark
                      ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action: Real-Time "Today" Button */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Real-time Date
            </span>

            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Today ({today.getDate()}/{today.getMonth() + 1})</span>
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
};
