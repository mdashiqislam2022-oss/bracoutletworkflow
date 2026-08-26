import React from 'react';
import { WorkSubmission } from '../../types';
import {
  X,
  Printer,
  CheckCircle2,
  Building2,
  Calendar,
  FileCheck,
  CreditCard,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Share2
} from 'lucide-react';

interface ReceiptModalProps {
  submission: WorkSubmission;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ submission, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Receipt Header Banner */}
        <div className="p-6 bg-[#18181B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 fill-current text-[#D4F63D]" viewBox="0 0 24 24">
                <path d="M12 2L2 22h20L12 2zm0 5.5l5.5 11h-11L12 7.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                BRAC BANK LIMITED
              </h3>
              <p className="text-[10px] text-slate-400">
                Official Outlet Work Acknowledgment Slip
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5 text-xs text-slate-800">
          
          {/* Tracking Bar */}
          <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Official Tracking No
              </span>
              <span className="font-mono font-black text-sm text-slate-900">
                {submission.trackingNo}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Status
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
                {submission.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 divide-y divide-slate-100">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400 font-medium">Customer Name:</span>
              <span className="font-bold text-slate-900">{submission.customerName}</span>
            </div>

            <div className="pt-2 flex justify-between">
              <span className="text-slate-400 font-medium">Contact Phone:</span>
              <span className="font-mono font-medium">{submission.customerPhone}</span>
            </div>

            <div className="pt-2 flex justify-between">
              <span className="text-slate-400 font-medium">Service Category:</span>
              <span className="font-semibold text-slate-800">
                {submission.serviceCategory.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="pt-2 flex justify-between">
              <span className="text-slate-400 font-medium">Account / Card Number:</span>
              <span className="font-mono font-bold text-slate-900">{submission.accountOrCardNumber}</span>
            </div>

            {submission.chequeBookSeries && (
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400 font-medium">Cheque Book Series:</span>
                <span className="font-mono font-medium">{submission.chequeBookSeries} ({submission.chequeLeavesCount} leaves)</span>
              </div>
            )}

            {submission.cardType && (
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400 font-medium">Card Product & Expiry:</span>
                <span className="font-medium">{submission.cardType} ({submission.cardExpiryMonthYear})</span>
              </div>
            )}

            <div className="pt-2 flex justify-between">
              <span className="text-slate-400 font-medium">Outlet Station:</span>
              <span className="font-medium text-slate-700">{submission.outletName}</span>
            </div>

            <div className="pt-2 flex justify-between">
              <span className="text-slate-400 font-medium">Recorded By Officer:</span>
              <span className="font-medium text-slate-700">{submission.recordedByOfficer}</span>
            </div>

            <div className="pt-2 flex justify-between">
              <span className="text-slate-400 font-medium">Submission Timestamp:</span>
              <span className="font-mono text-slate-500">
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Barcode & Verification Note */}
          <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-slate-100 text-center space-y-1">
            <div className="font-mono tracking-widest text-[11px] text-slate-400 select-all">
              ||| | |||| || ||| ||||| |||| | |||
            </div>
            <p className="text-[10px] text-slate-400">
              Digitally verified and logged to BRAC Bank Central Audit trail.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F8FAFC] border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-full bg-[#18181B] hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4F63D]" />
            <span>Print Receipt Slip</span>
          </button>
        </div>

      </div>
    </div>
  );
};
