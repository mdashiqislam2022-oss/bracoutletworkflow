import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  X,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { StationMailMessage } from '../../types';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MailModal: React.FC<MailModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    authMode,
    mailMessages,
    markMailAsRead,
    markAllMailAsRead,
    deleteMailMessage,
    sendMailMessage,
    showToast,
    userPreferences
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const [expandedMailId, setExpandedMailId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');

  if (!isOpen) return null;

  // Filter messages relevant to current user
  const relevantMessages = mailMessages.filter((m) => {
    if (authMode === 'USER' && currentUser) {
      return (
        m.recipientUserId === 'ALL' ||
        m.recipientUserId === currentUser.id ||
        m.recipientOutletId === 'ALL' ||
        m.recipientOutletId === currentUser.outletId
      );
    }
    // Admin inbox: only show mail actually sent TO the admin (e.g. AFO support
    // requests). The admin's own outgoing notes/memos should not appear here.
    return m.senderRole === 'USER';
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const toggleExpand = (mail: StationMailMessage) => {
    if (!mail.isRead) {
      markMailAsRead(mail.id);
    }
    setExpandedMailId(expandedMailId === mail.id ? null : mail.id);
  };

  const handleSendToAdmin = () => {
    if (!composeSubject.trim() || !composeContent.trim()) {
      showToast({ message: 'Please write both a subject and a message.', type: 'error' });
      return;
    }
    sendMailMessage({
      subject: composeSubject.trim(),
      content: composeContent.trim(),
      category: 'DIRECT_MEMO',
      priority: 'NORMAL'
    });
    setComposeSubject('');
    setComposeContent('');
    setIsComposing(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-lg rounded-[28px] shadow-2xl border flex flex-col max-h-[82vh] overflow-hidden transition-colors ${
          isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-[#F8FAFC]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Mail & Messages
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Official communications from Admin & Headquarters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {authMode === 'USER' && (
              <button
                onClick={() => setIsComposing((prev) => !prev)}
                className={`text-[11px] font-semibold hover:underline px-2 py-1 cursor-pointer ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                {isComposing ? 'Cancel' : 'Message Admin'}
              </button>
            )}
            {relevantMessages.some((m) => !m.isRead) && (
              <button
                onClick={markAllMailAsRead}
                className={`text-[11px] font-semibold hover:underline px-2 py-1 cursor-pointer ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compose message to Admin (AFO users only) */}
        {authMode === 'USER' && isComposing && (
          <div className={`p-4 border-b space-y-2.5 ${
            isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-[#F8FAFC]'
          }`}>
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Subject"
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <textarea
              value={composeContent}
              onChange={(e) => setComposeContent(e.target.value)}
              placeholder="Describe your issue or question for Admin..."
              rows={3}
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none resize-none ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <button
              onClick={handleSendToAdmin}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send to Admin
            </button>
          </div>
        )}

        {/* Message Feed List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {relevantMessages.length > 0 ? (
            relevantMessages.map((mail, idx) => {
              const isExpanded = expandedMailId === mail.id;
              return (
                <div
                  key={`${mail.id}-${idx}`}
                  onClick={() => toggleExpand(mail)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    !mail.isRead
                      ? isDark
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-xs'
                        : 'bg-emerald-50/60 border-emerald-300/90 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      : 'bg-[#F8FAFC] border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {!mail.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-2xs" />
                      )}
                      <span className={`font-bold text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {mail.senderName}
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-xs sm:text-sm font-bold mb-1.5 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {mail.subject}
                  </h4>

                  <p className={`text-xs leading-relaxed whitespace-pre-wrap ${
                    isDark ? 'text-slate-200 font-normal' : 'text-slate-800 font-normal'
                  } ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {mail.content}
                  </p>

                  {/* Sent Date & Time at bottom right */}
                  <div className={`mt-3 pt-2 border-t border-dashed flex items-center justify-between text-[11px] ${
                    isDark ? 'border-slate-700/70 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span className="italic">
                      {isExpanded ? 'Click to collapse' : 'Click to read full message'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                        <span>Sent: {formatDate(mail.timestamp)}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMailMessage(mail.id);
                        }}
                        className={`hover:text-rose-500 transition-colors p-1 cursor-pointer ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2.5 ${
                isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}>
                <Mail className="w-5 h-5" />
              </div>
              <p className={`font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No Messages</p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your mail inbox is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
