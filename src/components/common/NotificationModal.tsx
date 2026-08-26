import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  Building2,
  ExternalLink
} from 'lucide-react';
import { StationNotification } from '../../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    authMode,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setActiveNavTab,
    userPreferences,
    showToast
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const [selectedNotifForReading, setSelectedNotifForReading] = useState<StationNotification | null>(null);

  if (!isOpen) return null;

  const relevantNotifications = notifications.filter((n) => {
    if (authMode === 'USER' && currentUser) {
      // 1. Admin-only notifications must never be shown to regular users
      if (n.targetAudience === 'ADMIN_ONLY') return false;

      // 2. If specifically targeted to a user, strictly only that user can see it
      if (n.targetUserId && n.targetUserId !== 'ALL') {
        const isUserMatch =
          n.targetUserId === currentUser.id ||
          (currentUser.username && n.targetUserId.toLowerCase() === currentUser.username.toLowerCase()) ||
          (currentUser.email && n.targetUserId.toLowerCase() === currentUser.email.toLowerCase());
        if (!isUserMatch) return false;
      }

      // 3. If specifically targeted to an outlet, strictly only users of that outlet can see it
      if (n.targetOutletId && n.targetOutletId !== 'ALL') {
        if (n.targetOutletId !== currentUser.outletId) return false;
      }

      return true;
    }
    if (authMode === 'ADMIN') {
      if (n.targetAudience === 'USER_ONLY') return false;
      return true;
    }
    return true;
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

  const handleOpenReader = (notif: StationNotification) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    setSelectedNotifForReading(notif);
  };

  const handleCompleteReadAndGoToDashboard = () => {
    if (selectedNotifForReading) {
      if (!selectedNotifForReading.isRead) {
        markNotificationAsRead(selectedNotifForReading.id);
      }
    }
    setSelectedNotifForReading(null);
    onClose();
    setActiveNavTab('dashboard');
    showToast({ message: 'Notification read complete. Returned to main dashboard.', type: 'success' });
  };

  return (
    <>
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
          {/* Header */}
          <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-[#F8FAFC]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Notifications & Directives
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Official notes and alerts from Central Admin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {relevantNotifications.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  {relevantNotifications.some((n) => !n.isRead) && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className={`font-semibold hover:underline cursor-pointer ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={clearNotifications}
                    className={`hover:underline font-semibold cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    Clear
                  </button>
                </div>
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

          {/* Notification Message View List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {relevantNotifications.length > 0 ? (
              relevantNotifications.map((notif, idx) => (
                <div
                  key={`${notif.id}-${idx}`}
                  onClick={() => handleOpenReader(notif)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                    !notif.isRead
                      ? isDark
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-xs'
                        : 'bg-emerald-50/70 border-emerald-300/90 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      : 'bg-[#F8FAFC] border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {!notif.isRead ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-2xs animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400/50 shrink-0" />
                      )}
                      <h4 className={`text-xs sm:text-sm font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {notif.title}
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {notif.priority || 'NORMAL'}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed line-clamp-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {notif.message}
                  </p>

                  <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${
                    isDark ? 'border-slate-700/70' : 'border-slate-200'
                  }`}>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
                      <span>Click to read full message</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-400 dark:text-slate-500 text-[10px]">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(notif.timestamp)}</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2.5 ${
                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <p className={`font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No Notifications</p>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You have no pending notification directives.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FULL NOTIFICATION READER POPUP MODAL                      */}
      {/* ======================================================== */}
      {selectedNotifForReading && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedNotifForReading(null)}
        >
          <div
            className={`w-full max-w-xl rounded-[28px] shadow-2xl border flex flex-col overflow-hidden max-h-[90vh] ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Badge & Close */}
            <div className={`p-5 border-b flex items-center justify-between gap-3 ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                      Official Admin Directive
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedNotifForReading.priority || 'HIGH'} PRIORITY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">BRAC Bank Operations Notification Dispatch</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotifForReading(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reading Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Sending Time & Metadata Card */}
              <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-xs">
                    Dispatched On:
                  </span>
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {formatDate(selectedNotifForReading.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sender: Central Administration</span>
                </div>
              </div>

              {/* Subject Title */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Directive Subject
                </span>
                <h3 className={`text-base sm:text-lg font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedNotifForReading.title}
                </h3>
              </div>

              {/* Full Message Body */}
              <div className={`p-4 sm:p-5 rounded-2xl border leading-relaxed whitespace-pre-wrap text-xs sm:text-sm font-normal ${
                isDark ? 'bg-slate-950/90 border-slate-800 text-slate-200' : 'bg-[#F8FAFC] border-slate-200 text-slate-800'
              }`}>
                {selectedNotifForReading.message}
              </div>

              {/* Related Action if linked */}
              {selectedNotifForReading.linkTab && selectedNotifForReading.linkTab !== 'dashboard' && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span className="font-semibold text-xs">This notification references an action module:</span>
                  <button
                    onClick={() => {
                      if (selectedNotifForReading.linkTab) {
                        setActiveNavTab(selectedNotifForReading.linkTab);
                        setSelectedNotifForReading(null);
                        onClose();
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Module</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'
            }`}>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Marked as viewed upon reading</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotifForReading(null)}
                  className={`px-4 py-2 rounded-full font-bold text-xs border cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  Close Reader
                </button>

                <button
                  type="button"
                  id="notification-read-complete-btn"
                  onClick={handleCompleteReadAndGoToDashboard}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Read Complete & Go to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
