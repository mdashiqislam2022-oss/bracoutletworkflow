import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Headphones,
  MessageCircle,
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { userPreferences, setToast } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const isBn = userPreferences.language === 'bn';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const whatsappNumber = '01620473754';
  const internationalWhatsapp = '+8801620473754';
  const supportEmail = 'mdashiqislam2022@gmail.com';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setToast({
      message: isBn ? `${text} কপি করা হয়েছে!` : `Copied ${text} to clipboard!`,
      type: 'success'
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const whatsappUrl = `https://wa.me/8801620473754?text=${encodeURIComponent(
    'Hello Ashiq, I need support regarding Outlet Workflow Application.'
  )}`;
  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
    'Outlet Workflow - Direct Support Request'
  )}&body=${encodeURIComponent(
    'Hi Ashiq,\n\nI need technical / operational assistance with the Outlet Workflow portal.\n\nOutlet Name:\nIssue Details:\n'
  )}`;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden transition-all transform scale-100 ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xs shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 id="support-modal-title" className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{isBn ? 'সহায়তা ও যোগাযোগ কেন্দ্র' : 'Direct Support & Helpdesk'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'সরাসরি ডেভেলপার আশিকের সাথে যোগাযোগ করুন'
                  : 'Contact lead developer Ashiq for immediate assistance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close support modal"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Card 1: WhatsApp Support */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? 'bg-slate-800/60 border-emerald-500/30 hover:border-emerald-500/60'
                : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400 shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {isBn ? 'হোয়াটসঅ্যাপ সরাসরি চ্যাট' : 'Direct WhatsApp Support'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono shrink-0">
                      Fast Reply
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {whatsappNumber} ({internationalWhatsapp})
                  </p>
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={() => handleCopy(whatsappNumber, 'wa')}
                title="Copy WhatsApp Number"
                className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {copiedKey === 'wa' ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer select-none"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{isBn ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান' : 'Open WhatsApp Chat'}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80 shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 2: Email Support */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? 'bg-slate-800/60 border-sky-500/30 hover:border-sky-500/60'
                : 'bg-sky-50/50 border-sky-200 hover:border-sky-400 shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {isBn ? 'ইমেইল সহায়তা' : 'Direct Email Support'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 font-mono shrink-0">
                      Official
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 mt-0.5 break-all">
                    {supportEmail}
                  </p>
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={() => handleCopy(supportEmail, 'mail')}
                title="Copy Support Email"
                className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {copiedKey === 'mail' ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
              <a
                href={mailtoUrl}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer select-none"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>{isBn ? 'ইমেইল পাঠান' : 'Send Support Email'}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80 shrink-0" />
              </a>
            </div>
          </div>

          {/* Lead Developer Info */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs ${
              isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">
                  Lead Engineer: Mohammad Ashiqul Islam (Ashiq)
                </span>
                <p className="text-[11px] text-slate-400 truncate">
                  Application Architecture & Outlet System Development
                </p>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Online
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 sm:px-6 py-3.5 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <span className="text-[11px] text-slate-400 font-medium truncate">
            Outlet Workflow v2.4 • Developed by Ashiq
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

