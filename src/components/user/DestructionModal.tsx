import React, { useState } from 'react';
import { Flame, Calendar, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { ChequeCardEntry, ChequeBookRecord, DebitCardRecord } from '../../types';

interface DestructionModalProps {
  entry: ChequeCardEntry | null;
  onClose: () => void;
  onConfirm: (destructionDate: string, reason: string) => void;
  isDark: boolean;
  daysInVault: number;
}

export const DestructionModal: React.FC<DestructionModalProps> = ({
  entry,
  onClose,
  onConfirm,
  isDark,
  daysInVault
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [destructionDate, setDestructionDate] = useState<string>(todayStr);
  const [reason, setReason] = useState<string>(
    `Validity crossed 90+ days (${daysInVault} days in vault). Physically shredded and destroyed under SOP supervision.`
  );

  if (!entry) return null;

  const isCheque = entry.type === 'CHEQUE';
  const nameOrTitle = isCheque
    ? (entry as ChequeBookRecord).accountTitle
    : (entry as DebitCardRecord).cardName;
  const daysOverdue = Math.max(0, daysInVault - 90);

  return (
    <div
      id="destruction-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 no-print"
    >
      <div
        id="destruction-modal-content"
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 transition-all animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#182234] border-rose-900/60 text-white'
            : 'bg-white border-rose-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Record Asset Physical Destruction</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  90+ Days Expiry SOP
                </span>
              </h3>
              <p className="text-[11px] font-semibold text-slate-500">
                Log irreversible destruction of expired vault consignments
              </p>
            </div>
          </div>
          <button
            id="close-destruction-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Days Overdue Alert Box */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Retention Period Expired</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-black bg-rose-600 text-white shadow-xs">
              +{daysOverdue} Days Past 90d Limit
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 pt-2 border-t border-rose-500/20 text-rose-800 dark:text-rose-200">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Received on Station:</span>
              <span className="font-mono font-extrabold">{entry.receivedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Time in Vault:</span>
              <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">
                {daysInVault} Days Active
              </span>
            </div>
          </div>
        </div>

        {/* Consignment Target Details */}
        <div className="space-y-3 text-xs mb-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2.5 font-medium">
            <div>
              <span className="text-[10px] text-slate-500 block">Customer Name / Title:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs">{nameOrTitle}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Account Number:</span>
              <span className="font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                {entry.accountNumber}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Asset Classification:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {isCheque ? 'Cheque Book Consignment' : 'Debit Card Consignment'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Specifications / CCH:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                {isCheque
                  ? `${(entry as ChequeBookRecord).leafCount} LVS (${(entry as ChequeBookRecord).startCchNumber} - ${(entry as ChequeBookRecord).endCchNumber})`
                  : (entry as DebitCardRecord).cardType || 'Debit Card'}
              </span>
            </div>
          </div>

          {/* Destruction Date Picker */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Destruction Execution Date (Date Picker):</span>
              </span>
              <span className="text-[10px] font-normal text-slate-400">Exact date item was destroyed</span>
            </label>
            <input
              id="destruction-date-input"
              type="date"
              value={destructionDate}
              onChange={(e) => setDestructionDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold font-mono focus:outline-none focus:ring-2 transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-700 focus:border-rose-500 text-white'
                  : 'bg-white border-slate-300 focus:border-rose-500 text-slate-900 shadow-2xs'
              }`}
            />
          </div>

          {/* Destruction Reason / Remarks */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Destruction Reason & Compliance Note:</span>
            </label>
            <textarea
              id="destruction-reason-input"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Uncollected for >90 days. Perforated and destroyed per SOP guidelines."
              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 transition-all resize-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 focus:border-rose-500 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 focus:border-rose-500 text-slate-900 placeholder-slate-400 shadow-2xs'
              }`}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            id="cancel-destruction-btn"
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button
            id="confirm-destruction-btn"
            type="button"
            onClick={() => onConfirm(destructionDate, reason)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-4 h-4" />
            <span>Confirm Physical Destruction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
