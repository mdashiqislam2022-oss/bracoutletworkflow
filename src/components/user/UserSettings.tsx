import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  ShieldAlert,
  Globe,
  Bell,
  Volume2,
  Lock,
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';

export const UserSettingsView: React.FC = () => {
  const { userPreferences, updateUserPreferences } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const isBn = userPreferences.language === 'bn';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className={`rounded-[24px] p-6 shadow-xs border transition-colors ${
        isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-[#F4F6F8] text-slate-700 border border-slate-200'
        }`}>
          {isBn ? 'ইউজার পছন্দসমূহ' : 'User Preferences'}
        </span>
        <h2 className={`text-xl sm:text-2xl font-extrabold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isBn ? 'অ্যাপ্লিকেশন সেটিংস ও থিম' : 'Application Preferences & Theme'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isBn ? 'ডিসপ্লে থিম, ভাষা এবং নোটিফিকেশন নিয়ন্ত্রণ করুন।' : 'Manage display theme, language, and notification triggers.'}
        </p>
      </div>

      {/* Security Scope Notice */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
        isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-[#F8FAFC] border-slate-200/80 text-slate-600'
      }`}>
        <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className={`font-bold block mb-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {isBn ? 'ইউজার অপারেশনাল স্কোপ:' : 'Restricted User Scope:'}
          </strong>
          {isBn 
            ? 'ডাটাবেজ আর্কিটেকচার, ইউজার এক্সেস ও অ্যাডমিন ডেলিগেশন শুধুমাত্র সেন্ট্রাল অপারেশন্স থেকে নিয়ন্ত্রিত হয়।'
            : 'Database architecture, user authorization, and admin delegations are strictly locked to Central Operations.'}
        </div>
      </div>

      {/* Preference Controls Card */}
      <div className={`rounded-[28px] p-6 sm:p-8 shadow-xs border space-y-6 divide-y transition-colors ${
        isDark 
          ? 'bg-[#1E293B] border-slate-800 divide-slate-800 text-white' 
          : 'bg-white border-slate-100 divide-slate-100 text-slate-900'
      }`}>
        {/* 1. Theme Selection (Light vs Dark Mode) */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-800 text-amber-400' : 'bg-[#F4F6F8] text-indigo-600'
            }`}>
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isBn ? 'ডিসপ্লে থিম (Theme)' : 'Display Theme'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isDark 
                  ? (isBn ? 'ডার্ক মোড সক্রিয় (Dark Mode Active)' : 'Dark UI Mode (Eye-safe & High Contrast)')
                  : (isBn ? 'লাইট মোড সক্রিয় (Light Mode Active)' : 'Minimalist Light UI Mode')}
              </p>
            </div>
          </div>

          <div className={`flex items-center p-1 rounded-full border ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-[#F4F6F8] border-slate-200/80'
          }`}>
            <button
              type="button"
              onClick={() => updateUserPreferences({ theme: 'light' })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isDark
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{isBn ? 'লাইট' : 'Light'}</span>
            </button>
            <button
              type="button"
              onClick={() => updateUserPreferences({ theme: 'dark' })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডার্ক' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* 2. Language Preference */}
        <div className="pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-800 text-emerald-400' : 'bg-[#F4F6F8] text-slate-700'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Language / ভাষা
              </h4>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'ফিল্ড ইনটেক ও মেনুর ভাষা' : 'Preferred language for field intake labels'}
              </p>
            </div>
          </div>

          <select
            value={userPreferences.language}
            onChange={(e) => updateUserPreferences({ language: e.target.value as 'en' | 'bn' })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer focus:outline-none ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : 'bg-[#F4F6F8] border-slate-200 text-slate-800'
            }`}
          >
            <option value="en">English (Official)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </div>

        {/* 3. Notification Toggles */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F4F6F8] text-slate-700'
              }`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isBn ? 'গ্রাহক এসএমএস নোটিফিকেশন' : 'SMS Handover Alerts'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isBn 
                    ? 'চেক ও কার্ড ডেলিভারি করার সাথে সাথে গ্রাহককে এসএমএস নিশ্চিতকরণ পাঠানো'
                    : 'Send immediate customer SMS confirmation upon cheque/card delivery'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={userPreferences.smsAlerts}
              onChange={(e) => updateUserPreferences({ smsAlerts: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F4F6F8] text-slate-700'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isBn ? 'দৈনিক ৫:০০ PM কাট-অফ রিমাইন্ডার' : 'Daily Summary Reminder'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isBn 
                    ? 'প্রতিদিন বিকাল ৫:০০ টায় আউটলেট ব্যাচ সিঙ্ক সম্পন্ন করার রিমাইন্ডার'
                    : 'Receive 5:00 PM cutoff reminder to complete daily outlet batch sync'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={userPreferences.emailNotifications}
              onChange={(e) => updateUserPreferences({ emailNotifications: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F4F6F8] text-slate-700'
              }`}>
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isBn ? 'সাউন্ড ইফেক্ট ও অডিও' : 'Interactive Sound FX'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isBn 
                    ? 'সফলভাবে রসিদ বা স্লিপ তৈরি হলে মৃদু অডিও প্লে করা'
                    : 'Play subtle chime on successful slip generation'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={userPreferences.soundEffects}
              onChange={(e) => updateUserPreferences({ soundEffects: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
