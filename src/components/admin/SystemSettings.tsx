import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  Plus,
  Trash2,
  RefreshCw,
  Database,
  ShieldCheck,
  CheckCircle2,
  Code,
  User,
  Camera,
  Upload,
  Sparkles,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { t } from '../../utils/translations';
   import { SupabaseService } from '../../services/supabaseService';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

export const SystemSettings: React.FC = () => {
  const {
    outlets,
    addNewOutlet,
    resetDemoData,
    setActiveNavTab,
    userPreferences,
    currentAdmin,
    currentUser,
    updateAdminProfile,
    showToast
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const currentLang = userPreferences.language || 'en';
  const langText = t[currentLang] || t.en;

  // Admin Profile Customization State
  const initialAvatar =
    currentAdmin?.avatarUrl ||
    currentUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const [adminAvatarUrl, setAdminAvatarUrl] = useState(initialAvatar);
  const [adminFullName, setAdminFullName] = useState(currentAdmin?.fullName || currentUser?.fullName || 'Mohammad Ashiqul Islam');
  const [adminEmail, setAdminEmail] = useState(currentAdmin?.email || currentUser?.email || 'admin@bracbank.com');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Outlet State
  const [newOutletName, setNewOutletName] = useState('');
  const [newOutletCode, setNewOutletCode] = useState('');
  const [newOutletDistrict, setNewOutletDistrict] = useState('Dhaka');
  const [newOutletAddress, setNewOutletAddress] = useState('');
  const [isAddingOutlet, setIsAddingOutlet] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast({ message: 'Image size should be less than 2MB', type: 'error' });
      return;
    }

    const ownerId = currentAdmin?.id || currentUser?.id || 'admin';
    showToast({ message: 'Uploading photo...', type: 'info' });
    const uploadedUrl = await SupabaseService.uploadAvatar(file, ownerId);
    if (uploadedUrl) {
      setAdminAvatarUrl(uploadedUrl);
      showToast({ message: 'Photo uploaded! Click Save to apply.', type: 'success' });
    } else {
      showToast({ message: 'Photo upload failed. Please try again.', type: 'error' });
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    setAdminAvatarUrl(customImageUrl.trim());
    setCustomImageUrl('');
    showToast({ message: 'Avatar image URL applied to preview.', type: 'info' });
  };

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    updateAdminProfile({
      fullName: adminFullName.trim(),
      email: adminEmail.trim(),
      avatarUrl: adminAvatarUrl
    });

    setTimeout(() => {
      setIsSavingProfile(false);
    }, 350);
  };

  const handleAddOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutletName.trim() || !newOutletCode.trim()) return;

    addNewOutlet({
      name: newOutletName.trim(),
      code: newOutletCode.trim().toUpperCase(),
      district: newOutletDistrict,
      address: newOutletAddress.trim() || `${newOutletDistrict}, Bangladesh`
    });

    setNewOutletName('');
    setNewOutletCode('');
    setNewOutletAddress('');
    setIsAddingOutlet(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fadeIn">
      {/* Header */}
      <div className={`rounded-[24px] p-6 border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
          : 'bg-white border-slate-100 shadow-xs text-slate-900'
      } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isDark
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-[#F4F6F8] text-slate-700 border border-slate-200'
          }`}>
            {currentLang === 'bn' ? 'সিস্টেম ও অ্যাডমিন হাব' : 'Central Infrastructure'}
          </span>
          <h2 className={`text-xl sm:text-2xl font-extrabold mt-1 tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {currentLang === 'bn' ? 'সিস্টেম ও আউটলেট সেটিংস' : 'System & Admin Settings'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentLang === 'bn'
              ? 'অ্যাডমিন প্রোফাইল ছবি ও পরিচিতি পরিবর্তন করুন, ব্রাঞ্চ নোড কনফিগার করুন এবং ডেটাবেস স্কিমা পরিদর্শন করুন।'
              : 'Customize administrator avatar, operational details, nationwide branch nodes, and PostgreSQL schema.'}
          </p>
        </div>

        <button
          onClick={() => setActiveNavTab('sql_schema')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-98 shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
            isDark
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-[#18181B] hover:bg-black text-white'
          }`}
        >
          <Code className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#D4F63D]'}`} />
          <span>{currentLang === 'bn' ? 'Supabase স্কিমা দেখুন ↗' : 'View Supabase Schema ↗'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ADMIN PROFILE & VISUAL IDENTITY SETTINGS SECTION         */}
      {/* ======================================================== */}
      <div className={`rounded-[28px] p-6 sm:p-7 border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
          : 'bg-white border-slate-100 shadow-xs text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentLang === 'bn' ? 'অ্যাডমিন প্রোফাইল ও পরিচিতি' : 'Admin Profile & Visual Identity'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentLang === 'bn'
                  ? 'আপনার অ্যাডমিন প্রোফাইল ছবি, পূর্ণ নাম ও যোগাযোগের তথ্য এখান থেকে সরাসরি আপডেট করুন।'
                  : 'Update your master administrator photo, name, and security profile.'}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 self-start sm:self-auto">
            {currentLang === 'bn' ? 'মাস্টার অ্যাডমিনিস্ট্রেটর' : 'Master Administrator'}
          </span>
        </div>

        <form onSubmit={handleSaveAdminProfile} className="mt-6 space-y-6">
          {/* Avatar Preview & Direct Options */}
          <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
            <div className="relative group shrink-0">
              <img
                src={adminAvatarUrl}
                alt="Admin Avatar Preview"
                className="w-24 h-24 rounded-2xl object-cover border-3 border-indigo-500 shadow-lg transition-transform group-hover:scale-105"
              />
              <label
                htmlFor="admin-photo-upload"
                className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold gap-1"
                title={currentLang === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change photo'}
              >
                <Camera className="w-5 h-5" />
                <span>{currentLang === 'bn' ? 'ছবি বদলান' : 'Change'}</span>
              </label>
              <input
                id="admin-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-3 w-full">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  {currentLang === 'bn' ? 'প্রিসেট ছবি থেকে নির্বাচন করুন:' : 'Choose from curated avatars:'}
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAdminAvatarUrl(url)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        adminAvatarUrl === url
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-110'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Photo Button & URL input */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label
                  htmlFor="admin-photo-upload-btn"
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{currentLang === 'bn' ? 'ডিভাইস থেকে আপলোড করুন' : 'Upload New Photo'}</span>
                  <input
                    id="admin-photo-upload-btn"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <input
                    type="url"
                    placeholder={currentLang === 'bn' ? 'বা ছবির URL পেস্ট করুন...' : 'Or enter image URL...'}
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-xl border flex-1 transition-all ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  {customImageUrl && (
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-2xs"
                    >
                      {currentLang === 'bn' ? 'প্রয়োগ' : 'Apply'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text Fields: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                {currentLang === 'bn' ? 'অ্যাডমিনের পূর্ণ নাম' : 'Administrator Full Name'}
              </label>
              <input
                type="text"
                required
                value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                {currentLang === 'bn' ? 'অ্যাডমিন ইমেইল' : 'Administrator Email'}
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSavingProfile
                  ? currentLang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'
                  : currentLang === 'bn' ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Outlets Management */}
        <div className={`lg:col-span-8 rounded-[28px] p-6 sm:p-7 border transition-all space-y-4 ${
          isDark
            ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
            : 'bg-white border-slate-100 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <Building2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-slate-700'}`} />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentLang === 'bn' ? `নিবন্ধিত ব্র্যাক ব্যাংক আউটলেট সমূহ (${outlets.length})` : `Registered BRAC Bank Outlets (${outlets.length})`}
              </h3>
            </div>
            <button
              onClick={() => setIsAddingOutlet(!isAddingOutlet)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-[#18181B] text-white hover:bg-black'
              }`}
            >
              {isAddingOutlet ? (currentLang === 'bn' ? 'বাতিল' : 'Cancel') : (currentLang === 'bn' ? '+ আউটলেট যোগ করুন' : '+ Add Outlet')}
            </button>
          </div>

          {isAddingOutlet && (
            <form onSubmit={handleAddOutlet} className={`p-4 rounded-2xl border space-y-3 text-xs ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-white'
                : 'bg-[#F8FAFC] border-slate-200/60 text-slate-900'
            }`}>
              <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentLang === 'bn' ? 'নতুন ব্রাঞ্চ আউটলেট নোড রেজিস্টার করুন:' : 'Register New Branch Outlet Node:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Outlet Name (e.g. Uttara Sector 3 Outlet)"
                  value={newOutletName}
                  onChange={(e) => setNewOutletName(e.target.value)}
                  className={`px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                  }`}
                />
                <input
                  type="text"
                  required
                  placeholder="Outlet Code (e.g. BBL-UTT-01)"
                  value={newOutletCode}
                  onChange={(e) => setNewOutletCode(e.target.value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                  }`}
                />
                <select
                  value={newOutletDistrict}
                  onChange={(e) => setNewOutletDistrict(e.target.value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Dhaka">Dhaka District</option>
                  <option value="Chittagong">Chittagong District</option>
                  <option value="Sylhet">Sylhet District</option>
                  <option value="Rajshahi">Rajshahi District</option>
                  <option value="Khulna">Khulna District</option>
                  <option value="Barisal">Barisal District</option>
                  <option value="Rangpur">Rangpur District</option>
                </select>
                <input
                  type="text"
                  placeholder="Physical Address"
                  value={newOutletAddress}
                  onChange={(e) => setNewOutletAddress(e.target.value)}
                  className={`px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'
                  }`}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
                >
                  {currentLang === 'bn' ? 'আউটলেট সেভ ও প্রভিশন করুন' : 'Save & Provision Outlet'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {outlets.map((outlet) => (
              <div
                key={outlet.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                    : 'bg-[#F8FAFC] border-slate-100 text-slate-900'
                }`}
              >
                <div>
                  <div className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {outlet.name}
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] border ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      {outlet.code}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {outlet.address} • {outlet.district}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#E8F5E9] text-[#2E7D32]'
                }`}>
                  {outlet.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Diagnostics & Operations */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`rounded-[28px] p-6 border transition-all space-y-4 ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
              : 'bg-white border-slate-100 shadow-xs text-slate-900'
          }`}>
            <h3 className={`text-sm font-bold pb-2 border-b ${
              isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'
            }`}>
              {currentLang === 'bn' ? 'সিস্টেম ডায়াগনস্টিকস' : 'System Diagnostics'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>PostgreSQL Cloud DB</span>
                <span className={`font-semibold flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>RLS Security Status</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Sync Interval</span>
                <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Real-time</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>App Version</span>
                <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>v2.4.0 (Aesthetic)</span>
              </div>
            </div>
          </div>

          <div className={`rounded-[28px] p-6 border transition-all space-y-3 ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
              : 'bg-white border-slate-100 shadow-xs text-slate-900'
          }`}>
            <h3 className={`text-sm font-bold pb-2 border-b ${
              isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'
            }`}>
              {currentLang === 'bn' ? 'ডেমো ডেটা রিসেট স্যান্ডবক্স' : 'Data Reset Sandbox'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentLang === 'bn'
                ? 'মক লেনদেন ও ডেমো সাবমিশন ফ্যাক্টরি ডিফল্টে পুনরায় সেট করুন।'
                : 'Reset mock transactions and demo submissions to factory seed defaults.'}
            </p>
            <button
              onClick={() => {
                if (confirm(currentLang === 'bn' ? 'আপনি কি নিশ্চিত যে সকল ফিল্ড ডেটা ডিফল্ট অবস্থায় রিসেট করতে চান?' : 'Are you sure you want to reset all mock field data to defaults?')) {
                  resetDemoData();
                }
              }}
              className={`w-full py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentLang === 'bn' ? 'ডেমো সীড ডেটা রিসেট করুন' : 'Reset Demo Seed Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

