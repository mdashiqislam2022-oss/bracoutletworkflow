import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { userPreferences, currentUser, currentAdmin, authMode } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const isBn = userPreferences.language === 'bn';

  if (!isOpen) return null;

  const displayName = currentUser?.fullName || currentAdmin?.fullName || 'User';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all transform scale-100 ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Accent Warning Header */}
        <div
          className={`p-6 border-b flex items-start gap-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-rose-50/50 border-rose-100'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 shadow-xs">
            <LogOut className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {isBn ? 'লগআউট নিশ্চিতকরণ' : 'Confirm Logout'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isBn
                ? `আপনি কি নিশ্চিতভাবে আউটলেট পোর্টাল (${displayName}) থেকে লগআউট করতে চান?`
                : `Are you sure you want to sign out of the portal (${displayName})?`}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Info Body */}
        <div className="p-6 space-y-4">
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
              isDark
                ? 'bg-slate-800/50 border-slate-700/70 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {isBn
                ? 'লগআউট করার পর পুনরায় প্রবেশ করতে আপনাকে মোবাইল বা ইউজার আইডি দিয়ে সাইন-ইন করতে হবে।'
                : 'After logging out, you will need your PIN or credentials to sign back into this station.'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isBn ? 'বাতিল করুন' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                onClose();
                onConfirm();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{isBn ? 'হ্যাঁ, লগআউট করুন' : 'Yes, Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
