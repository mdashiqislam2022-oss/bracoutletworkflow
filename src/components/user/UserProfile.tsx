import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Mail,
  Phone,
  Camera,
  Save,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  Award,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { t } from '../../utils/translations';
   import { SupabaseService } from '../../services/supabaseService';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, userPreferences } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const currentLang = userPreferences.language || 'en';
  const langText = t[currentLang] || t.en;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
  const [unlockedFields, setUnlockedFields] = useState<Record<string, boolean>>({});
  const unlockField = (field: string) => setUnlockedFields((prev) => ({ ...prev, [field]: true }));

  if (!currentUser) return null;

  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    phone: currentUser.phone,
    avatarUrl: currentUser.avatarUrl,
    bio: currentUser.bio,
    designation: currentUser.designation,
    yearsOfService: currentUser.yearsOfService,
    bloodGroup: currentUser.bloodGroup,
    emergencyContact: currentUser.emergencyContact,
    supervisorName: currentUser.supervisorName,
    facebook: currentUser.facebook || '',
    instagram: currentUser.instagram || '',
    whatsapp: currentUser.whatsapp || currentUser.phone || ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile(formData);
  };

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleDeviceFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }
    setIsUploadingAvatar(true);
    const uploadedUrl = await SupabaseService.uploadAvatar(file, currentUser.id);
    setIsUploadingAvatar(false);
    if (uploadedUrl) {
      setFormData((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
      updateCurrentUserProfile({ avatarUrl: uploadedUrl });
      setShowAvatarPicker(false);
    } else {
      alert('Photo upload failed. Please check your internet connection and try again.');
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDeviceFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleDeviceFileUpload(file);
    }
  };

  const handleCustomAvatarSubmit = () => {
    if (customAvatarInput.trim()) {
      setFormData((prev) => ({ ...prev, avatarUrl: customAvatarInput.trim() }));
      setCustomAvatarInput('');
      setShowAvatarPicker(false);
    }
  };

  // Helper for WhatsApp link
  const cleanWhatsAppNumber = formData.whatsapp.replace(/[^0-9]/g, '');
  const whatsAppUrl = cleanWhatsAppNumber ? `https://wa.me/${cleanWhatsAppNumber}` : '';
  
  // Format Facebook link
  const facebookUrl = formData.facebook
    ? formData.facebook.startsWith('http')
      ? formData.facebook
      : `https://facebook.com/${formData.facebook.replace('@', '')}`
    : '';

  // Format Instagram link
  const instagramUrl = formData.instagram
    ? formData.instagram.startsWith('http')
      ? formData.instagram
      : `https://instagram.com/${formData.instagram.replace('@', '')}`
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden file input for native device upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header Card */}
      <div className={`rounded-[28px] p-6 sm:p-8 shadow-xs border relative overflow-hidden transition-colors ${
        isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with device change button */}
          <div className="relative group shrink-0">
            <img
              src={formData.avatarUrl}
              alt={formData.fullName}
              referrerPolicy="no-referrer"
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 shadow-xs ${
                isDark ? 'ring-slate-700' : 'ring-slate-100'
              }`}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute bottom-0 right-0 p-2.5 rounded-full shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-[#18181B] text-white hover:bg-black'
              }`}
              title="Upload photo from device"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isDark ? 'bg-slate-800 text-slate-200' : 'bg-[#18181B] text-white'
              }`}>
                {currentUser.employeeId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4F63D] text-[#18181B] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                ACTIVE ON-DUTY
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                isDark ? 'border-slate-700 text-slate-300 bg-slate-800/40' : 'border-slate-200 text-slate-600 bg-slate-50'
              }`}>
                BRAC Bank AFO
              </span>
            </div>

            <h2 className={`text-2xl font-bold tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.fullName}</h2>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formData.designation}</p>

            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                <Building2 className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                {currentUser.outletName}
                {currentUser.outletCode ? ` (${currentUser.outletCode})` : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                {currentUser.email}
              </span>
            </div>

            {/* Direct Social Badges / Click-to-Contact */}
            <div className="mt-4 pt-3.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Social Contacts:
              </span>

              {/* WhatsApp direct chat */}
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                  <span>WhatsApp ({formData.whatsapp})</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">No WhatsApp added</span>
              )}

              {/* Facebook */}
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                  title="View Facebook Profile"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ) : null}

              {/* Instagram */}
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-500/30 transition-colors"
                  title="View Instagram Profile"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ml-auto ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Upload / Change Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Direct Device Image Upload Modal / Drawer */}
        {showAvatarPicker && (
          <div className={`mt-6 pt-6 border-t relative z-10 p-5 rounded-2xl ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-[#F8FAFC]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Upload Profile Picture From Device
                </h4>
                <p className="text-[11px] text-slate-400">
                  Select any photo from your phone gallery or computer (JPG, PNG, WEBP).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            {/* Drag and Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isDark
                    ? 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
                    : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/80'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-2.5">
                <Upload className="w-6 h-6" />
              </div>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Click to browse device or drag and drop image here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports camera capture, gallery selection, and high-resolution portraits (Max 5MB)
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm inline-flex items-center gap-1.5 pointer-events-none"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Select From Device</span>
              </button>
            </div>

            {/* Direct URL Fallback Option */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="url"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                placeholder="Or paste direct image URL (https://...)"
                className={`flex-1 px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={handleCustomAvatarSubmit}
                className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer ${
                  isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-[#18181B] text-white hover:bg-black'
                }`}
              >
                Apply URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleSave} className={`rounded-[28px] p-6 sm:p-8 shadow-xs border space-y-6 transition-colors ${
        isDark ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        {/* Official Details */}
        <div>
          <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Personal & Official Contact Details
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Official records registered with BRAC Bank Human Resources.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                            <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Full Name (As per NID) *
                </label>
                {!unlockedFields.fullName && (
                  <button type="button" onClick={() => unlockField('fullName')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
              <input
                type="text"
                                disabled={!unlockedFields.fullName}
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                  ${!unlockedFields.fullName ? 'opacity-60 cursor-not-allowed' : ''}
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Official Gmail Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs cursor-not-allowed ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200/60 text-slate-400'
                }`}
              />
            </div>

            <div>
                            <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Mobile Phone Number *
                </label>
                {!unlockedFields.phone && (
                  <button type="button" onClick={() => unlockField('phone')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>>
                            <input
                type="tel"
                required
                disabled={!unlockedFields.phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none ${!unlockedFields.phone ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900'
                }`}
              />
            </div>

                       <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Emergency Contact
                </label>
                {!unlockedFields.emergencyContact && (
                  <button type="button" onClick={() => unlockField('emergencyContact')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
              <input
                type="text"
                disabled={!unlockedFields.emergencyContact}
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="+880 18XX-XXXXXX (Relation)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${!unlockedFields.emergencyContact ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
                            <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Blood Group
                </label>
                {!unlockedFields.bloodGroup && (
                  <button type="button" onClick={() => unlockField('bloodGroup')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
                            <select
                disabled={!unlockedFields.bloodGroup}
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${!unlockedFields.bloodGroup ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900'
                }`}
              >
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div>
                           <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Years of Service at Outlet
                </label>
                {!unlockedFields.yearsOfService && (
                  <button type="button" onClick={() => unlockField('yearsOfService')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
                            <input
                type="number"
                step="0.1"
                disabled={!unlockedFields.yearsOfService}
                value={formData.yearsOfService}
                onChange={(e) => setFormData({ ...formData, yearsOfService: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none ${!unlockedFields.yearsOfService ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Social Contacts Section (Facebook, Instagram, WhatsApp) */}
        <div className={`border-t pt-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Social & Instant Communication Channels
            </h3>
            <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Visible to Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Provide your social contact links so that administrators and central headquarters can easily connect with you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <div>
                           <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Number</span>
                </label>
                {!unlockedFields.whatsapp && (
                  <button type="button" onClick={() => unlockField('whatsapp')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
                            <input
                type="text"
                disabled={!unlockedFields.whatsapp}
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+880 17XXXXXXXX"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none ${!unlockedFields.whatsapp ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 placeholder-slate-400'
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Enables instant 1-click WhatsApp messaging.
              </span>
            </div>

            {/* Facebook */}
            <div>
                            <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <Facebook className="w-3.5 h-3.5 text-blue-500" />
                  <span>Facebook Profile / Handle</span>
                </label>
                {!unlockedFields.facebook && (
                  <button type="button" onClick={() => unlockField('facebook')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
                            <input
                type="text"
                disabled={!unlockedFields.facebook}
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/username or @username"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${!unlockedFields.facebook ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 placeholder-slate-400'
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Profile link or Facebook username.
              </span>
            </div>

            {/* Instagram */}
            <div>
                            <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram Profile / Handle</span>
                </label>
                {!unlockedFields.instagram && (
                  <button type="button" onClick={() => unlockField('instagram')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
                            <input
                type="text"
                disabled={!unlockedFields.instagram}
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="username or https://instagram.com/..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${!unlockedFields.instagram ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900 placeholder-slate-400'
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Instagram username or direct handle.
              </span>
            </div>
          </div>
        </div>

        {/* Banking Designation & Station */}
        <div className={`border-t pt-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Banking Designation & Placement
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Assigned outlet credentials and branch supervisor.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Official Banking Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Assigned Supervisor / Manager
              </label>
              <input
                type="text"
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Outlet Physical Address (Fixed)
              </label>
              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-700'
              }`}>
                <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <strong>{currentUser.outletName}</strong> — {currentUser.outletLocation}
                </div>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Assigned District (Fixed)
              </label>
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-700'
              }`}>
                <strong>{currentUser.district || 'Not Set'}</strong>
              </div>
            </div>

            <div className="sm:col-span-2">
                           <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Bio & Responsibilities
                </label>
                {!unlockedFields.bio && (
                  <button type="button" onClick={() => unlockField('bio')} className="text-[10px] font-semibold text-emerald-500 hover:underline">Change</button>
                )}
              </div>
                           <textarea
                rows={3}
                disabled={!unlockedFields.bio}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${!unlockedFields.bio ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F4F6F8] border-slate-200/60 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-full font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors ${
              isDark ? 'bg-white hover:bg-slate-100 text-slate-900' : 'bg-[#18181B] hover:bg-black text-white'
            }`}
          >
            <Save className="w-4 h-4 text-emerald-500" />
            <span>{currentLang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
