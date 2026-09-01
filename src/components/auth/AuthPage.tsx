import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  KeyRound,
  AlertCircle,
  Phone,
  User,
  Eye,
  EyeOff,
  AtSign,
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  Send,
  Hash,
  FileText,
  Clock,
  PartyPopper
} from 'lucide-react';

type AuthViewMode = 'USER_LOGIN' | 'USER_SIGNUP' | 'USER_FORGOT' | 'USER_FORGOT_SUCCESS' | 'ADMIN_LOGIN';

const BANGLADESH_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria',
  'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga', "Cox's Bazar", 'Cumilla',
  'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj',
  'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat',
  'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia',
  'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur',
  'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj',
  'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna',
  'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati',
  'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj',
  'Sylhet', 'Tangail', 'Thakurgaon'
];

export const AuthPage: React.FC = () => {
  const {
    loginUserWithCredentials,
    signUpUser,
    loginAdminByPin,
        requestPasswordResetFromAdmin,
    outlets,
    userPreferences,
    isCloudDataLoaded
  } = useApp();

  const isDark = userPreferences.theme === 'dark';

  // Auth View Modes (No Admin Forgot mode)
  const [authView, setAuthView] = useState<AuthViewMode>('USER_LOGIN');

  // User Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // User Signup State (Strict Validations & No Default Values)
  const [signupOutletName, setSignupOutletName] = useState('');
    const [signupOutletCode, setSignupOutletCode] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [saveOnSignup, setSaveOnSignup] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
    const [googleEmailVerified, setGoogleEmailVerified] = useState(false);

    // Initialize Google Sign-In button (retries until Google script + button element are both ready)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    let attempts = 0;

    const renderGoogleButton = () => {
      const google = (window as any).google;
      const btnContainer = document.getElementById('google-signin-button');
      if (!google || !google.accounts || !google.accounts.id || !btnContainer) {
        return false;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            if (payload.email && payload.email.toLowerCase().endsWith('@gmail.com')) {
              setSignupEmail(payload.email);
              setGoogleEmailVerified(true);
                            google.accounts.id.cancel();
            } else {
              setGoogleEmailVerified(false);
              alert('Please select a valid Gmail (@gmail.com) account.');
            }
          } catch {
            setGoogleEmailVerified(false);
          }
        }
      });

      btnContainer.innerHTML = '';
      google.accounts.id.renderButton(btnContainer, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with'
      });

      return btnContainer.innerHTML.trim().length > 0;
    };

    const tryRender = () => {
      if (cancelled) return;
      attempts += 1;
      const success = renderGoogleButton();
      if (!success && attempts < 20) {
        setTimeout(tryRender, 300);
      }
    };

    tryRender();

    return () => {
      cancelled = true;
    };
    }, [authView, googleEmailVerified]);
  // Simplified User Request Reset from Admin State (Single large note box)
  const [resetReqUserNote, setResetReqUserNote] = useState('');
  const [resetSuccessDetails, setResetSuccessDetails] = useState<{
    ticketId: string;
    note: string;
  } | null>(null);

  // Admin Login State (No hardcoded credentials in UI)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Error & Feedback state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);

  // Trigger shake animation on error
  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  // Handle User Login with animated sliding arrow
    const handleUserLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);
      setSuccessMessage(null);

    if (!isCloudDataLoaded) {
      triggerError('System is still loading your account data. Please wait a moment and try again.');
      return;
    }
  
      const cleanId = loginIdentifier.trim();
      const cleanPass = loginPassword.trim();
  
      if (!cleanId) {
        triggerError('Please enter your username or registered Gmail address.');
        return;
      }

    if (!cleanPass) {
      triggerError('Please enter your 4-digit password.');
      return;
    }

    setIsLoggingIn(true);

        setTimeout(async () => {
      const res = await loginUserWithCredentials(cleanId, cleanPass);
      setIsLoggingIn(false);

      if (!res.success) {
        triggerError(res.message || 'Invalid login credentials. Please check your username and 4-digit password.');
        return;
      }
    }, 450);
  };

  // Handle User Registration
  const handleUserSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

        if (!signupOutletName.trim()) {
      triggerError('Please enter your assigned BRAC Bank outlet name.');
      return;
    }

        if (!signupOutletCode.trim()) {
      triggerError('Please enter your assigned BRAC Bank outlet code. This field is required.');
      return;
    }

    if (!signupDistrict.trim()) {
      triggerError('Please select your assigned district.');
      return;
    }

    if (!signupFullName.trim()) {
      triggerError('Please enter your full name.');
      return;
    }

    if (!signupPhone.trim()) {
      triggerError('Please enter your mobile phone number.');
      return;
    }

    if (signupPhone.trim().length < 10) {
      triggerError('Please enter a valid mobile number with at least 10 digits.');
      return;
    }

        if (!signupEmail.trim() || !googleEmailVerified) {
      triggerError('Please verify your Gmail address using the Google Sign-In button.');
      return;
    }

    const cleanUser = signupUsername.trim().toLowerCase();
    if (!cleanUser) {
      triggerError('Please choose a username for login.');
      return;
    }

    const cleanPass = signupPassword.trim();
    if (!cleanPass || cleanPass.length !== 4) {
      triggerError('Password must be exactly 4 digits.');
      return;
    }

    setIsSigningUp(true);

    setTimeout(() => {
            const res = signUpUser({
        outletName: signupOutletName.trim(),
        outletCode: signupOutletCode.trim(),
        district: signupDistrict,
        fullName: signupFullName.trim(),
        phone: signupPhone.trim(),
        email: signupEmail.trim(),
        username: cleanUser,
        password: cleanPass,
        autoLogin: false
      });

      if (!res.success) {
        setIsSigningUp(false);
        triggerError(res.message || 'Signup failed. Please check the details entered.');
        return;
      }

      setSignupSuccess(true);
      setIsSigningUp(false);

      // Pre-fill login credentials so user can log in seamlessly
      setLoginIdentifier(cleanUser);
      setLoginPassword(cleanPass);

      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {
        // safe fallback
      }

      // Smooth standard animated transition to login screen after celebration
      setTimeout(() => {
        setSignupSuccess(false);
        setAuthView('USER_LOGIN');
        setSuccessMessage(`Account created for ${signupFullName.trim()}! Please enter your credentials to log in.`);
      }, 950);
    }, 500);
  };

  // Handle Simplified Password Reset Request to Admin (Single Note Submission)
  const handleSubmitResetRequestToAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNote = resetReqUserNote.trim();
    if (!cleanNote) {
      triggerError('Please write your reset request note or message for the Central Admin.');
      return;
    }

    const res = requestPasswordResetFromAdmin({
      fullName: 'Field Officer (AFO)',
      emailOrPhone: loginIdentifier.trim() || 'Outlet User',
      userNote: cleanNote
    });

    if (!res.success) {
      triggerError(res.message || 'Could not submit reset request.');
      return;
    }

    const generatedTicket = res.requestId || 'REQ-' + Date.now().toString().slice(-6);

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    setResetSuccessDetails({
      ticketId: generatedTicket,
      note: cleanNote
    });
    setAuthView('USER_FORGOT_SUCCESS');
  };

  // On clicking OK / Back to login -> Direct transition to login section
  const handleResetSuccessOk = () => {
    setResetReqUserNote('');
    setResetSuccessDetails(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthView('USER_LOGIN');
  };

  // Handle Admin Login
    const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = adminUsername.trim();
    const cleanPass = adminPassword.trim();

    if (!cleanUser || !cleanPass) {
      triggerError('Please enter both admin username and password.');
      return;
    }

        const res = await loginAdminByPin(cleanUser, cleanPass);
    if (!res.success) {
      triggerError(res.message || 'Invalid admin credentials. Access denied.');
    }
  };

  // Helper for text-only input sanitization (letters and spaces only)
  const handleTextOnlyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
    setter(sanitized);
  };

  // Helper for numeric-only input sanitization (numbers only)
  const handleNumericOnlyChange = (setter: (val: string) => void, maxLength?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let sanitized = e.target.value.replace(/[^0-9]/g, '');
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength);
    }
    setter(sanitized);
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto p-3">
      {/* Minimalist Card Container */}
      <div
        id="auth-card-container"
        className={`rounded-[28px] p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border space-y-6 transition-colors duration-200 ${
          isDark 
            ? 'bg-[#1E293B] border-slate-800 text-white' 
            : 'bg-white border-slate-100 text-slate-900'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-black text-[#D4F63D] flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 5.5l5.5 11h-11L12 7.5z" />
            </svg>
          </div>

          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {authView === 'ADMIN_LOGIN' ? 'Central Admin Portal' : 'Outlet Work Data'}
          </h2>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {authView === 'ADMIN_LOGIN'
              ? 'Head Office Master Management Authorization'
              : 'BRAC Bank Field Officer (AFO) Work Station'}
          </p>
        </div>

        {/* Notifications & Shaking Error Feedback */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            className={`p-3.5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 shadow-sm ${
              shakeError ? 'animate-shake' : 'animate-fadeIn'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span className="leading-relaxed font-semibold">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            id="auth-success-banner"
            className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-fadeIn font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Animated Views Container */}
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* VIEW 1: USER (AFO) LOGIN                                 */}
          {/* ======================================================== */}
          {authView === 'USER_LOGIN' && (
            <motion.div
              key="USER_LOGIN"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <form id="user-login-form" onSubmit={handleUserLogin} className="space-y-4">
                <div className="flex items-center justify-between pb-0.5">
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    User Login
                  </span>
                  <button
                    id="goto-register-link-btn"
                    type="button"
                    onClick={() => {
                      setAuthView('USER_SIGNUP');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>Register (Sign Up)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Username / Gmail Field */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Username or Gmail *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="user-login-identifier-input"
                      type="text"
                      required
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Type your username or registered email"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field (4-Digit) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      4-Digit Password *
                    </label>
                    <button
                      id="user-forgot-password-link"
                      type="button"
                      onClick={() => {
                        setAuthView('USER_FORGOT');
                        setResetReqUserNote('');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="user-login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      maxLength={4}
                      inputMode="numeric"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={handleNumericOnlyChange(setLoginPassword, 4)}
                      placeholder="Enter 4-digit password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="remember-credentials-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
                    />
                    <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Remember credentials
                    </span>
                  </label>
                </div>

                {/* Login Submit Button with animated sliding arrow */}
                <button
                  id="user-login-submit-btn"
                  type="submit"
                  disabled={isLoggingIn || !isCloudDataLoaded}
                  className={`group w-full py-3 rounded-full text-xs font-bold transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 overflow-hidden ${
                    isDark 
                      ? 'bg-white hover:bg-slate-100 text-slate-900' 
                      : 'bg-[#18181B] hover:bg-black text-white'
                  }`}
                >
                    <span>{!isCloudDataLoaded ? 'Loading...' : isLoggingIn ? 'Verifying...' : 'Login'}</span>
                  <motion.span
                    animate={{ x: isLoggingIn ? 14 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="inline-flex items-center group-hover:translate-x-1 transition-transform"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </button>
              </form>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: USER (AFO) SIGN UP (Hover Zoom Animation on Boxes)*/}
          {/* ======================================================== */}
          {authView === 'USER_SIGNUP' && (
            <motion.div
              key="USER_SIGNUP"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <form id="user-signup-form" onSubmit={handleUserSignup} className="space-y-3.5">
                <div className="flex items-center justify-between pb-1">
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Register (Sign Up)
                  </span>
                  <button
                    id="back-to-login-link"
                    type="button"
                    onClick={() => {
                      setAuthView('USER_LOGIN');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Already have an account? Login</span>
                  </button>
                </div>

                {/* 1. Assigned Outlet Name & Code (Hover Zoom) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2 transition-all duration-200 ease-out hover:scale-[1.015] focus-within:scale-[1.015]">
                    <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      1. Assigned Outlet Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-outlet-input"
                        type="text"
                        required
                        value={signupOutletName}
                        onChange={handleTextOnlyChange(setSignupOutletName)}
                        placeholder="Type your assigned outlet name"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow ${
                          isDark
                            ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="transition-all duration-200 ease-out hover:scale-[1.015] focus-within:scale-[1.015]">
                                        <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Outlet Code *
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="signup-outlet-code-input"
                        type="text"
                        required
                        inputMode="numeric"
                        value={signupOutletCode}
                        onChange={handleNumericOnlyChange(setSignupOutletCode, 10)}
                        placeholder="Type outlet code (numbers only)"
                        className={`w-full pl-8 pr-2.5 py-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow ${
                          isDark
                            ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Assigned District Dropdown */}
                <div className="transition-all duration-200 ease-out hover:scale-[1.015] focus-within:scale-[1.015]">
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Assigned District *
                  </label>
                  <select
                    id="signup-district-input"
                    required
                    value={signupDistrict}
                    onChange={(e) => setSignupDistrict(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow ${
                      isDark
                        ? 'bg-slate-900/70 border-slate-700 text-white focus:border-slate-500 focus:ring-slate-500/20'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-900 focus:border-slate-800 focus:ring-slate-900/10'
                    }`}
                  >
                    <option value="">Select your district</option>
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Full Name (Hover Zoom) */}
                <div className="transition-all duration-200 ease-out hover:scale-[1.015] focus-within:scale-[1.015]">
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    2. Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="signup-fullname-input"
                      type="text"
                      required
                      value={signupFullName}
                      onChange={handleTextOnlyChange(setSignupFullName)}
                      placeholder="Type your full name"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                      }`}
                    />
                  </div>
                </div>

                {/* 3. Mobile Number (Hover Zoom) */}
                <div className="transition-all duration-200 ease-out hover:scale-[1.015] focus-within:scale-[1.015]">
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    3. Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="signup-phone-input"
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={14}
                      value={signupPhone}
                      onChange={handleNumericOnlyChange(setSignupPhone, 14)}
                      placeholder="Type your mobile number"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                      }`}
                    />
                  </div>
                </div>

                                {/* 4. Gmail Address (Verified via Google Sign-In) */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    4. Gmail Address (Verify with Google) *
                  </label>
                  {googleEmailVerified && signupEmail ? (
                                        <div key="google-email-verified" className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                      isDark ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> {signupEmail}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSignupEmail('');
                          setGoogleEmailVerified(false);
                        }}
                        className="text-[10px] underline opacity-80 hover:opacity-100 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                                        <div key="google-signin-button-wrapper" id="google-signin-button" className="flex justify-start" />
                  )}
                </div>

                {/* 5. User Name & 6. 4-Digit Password (Hover Zoom) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="transition-all duration-200 ease-out hover:scale-[1.015] focus-within:scale-[1.015]">
                    <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      5. Login Username *
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-username-input"
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                        placeholder="Type your username"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow ${
                          isDark
                            ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="transition-all duration-200 ease-out hover:scale-[1.015] focus-within:scale-[1.015]">
                    <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      6. 4-Digit Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-password-input"
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        inputMode="numeric"
                        maxLength={4}
                        value={signupPassword}
                        onChange={handleNumericOnlyChange(setSignupPassword, 4)}
                        placeholder="Enter 4-digit password"
                        className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow ${
                          isDark
                            ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Credentials Checkbox on Signup */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="signup-save-credentials-checkbox"
                      type="checkbox"
                      checked={saveOnSignup}
                      onChange={(e) => setSaveOnSignup(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
                    />
                    <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Save credentials for fast future login
                    </span>
                  </label>
                </div>

                {/* Signup Submit Button with Standard Animation */}
                <motion.button
                  id="user-signup-submit-btn"
                  type="submit"
                  disabled={isSigningUp || signupSuccess}
                  whileHover={!(isSigningUp || signupSuccess) ? { scale: 1.015 } : {}}
                  whileTap={!(isSigningUp || signupSuccess) ? { scale: 0.985 } : {}}
                  className={`w-full py-3.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4 relative overflow-hidden ${
                    signupSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : isDark 
                        ? 'bg-white hover:bg-slate-100 text-slate-900' 
                        : 'bg-[#18181B] hover:bg-black text-white'
                  } ${isSigningUp ? 'opacity-90 cursor-wait' : ''}`}
                >
                  {isSigningUp ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : signupSuccess ? (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                      <span>Registered Successfully! Directing to Login...</span>
                    </motion.div>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Complete Sign Up</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: USER FORGOT PASSWORD -> SINGLE NOTE REQUEST TO ADMIN */}
          {/* ======================================================== */}
          {authView === 'USER_FORGOT' && (
            <motion.div
              key="USER_FORGOT"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <RotateCcw className="w-4 h-4" />
                  <span>Request Reset from Central Admin</span>
                </div>
                <button
                  id="back-to-user-login-from-forgot-btn"
                  type="button"
                  onClick={() => {
                    setAuthView('USER_LOGIN');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>

              <div className="space-y-3.5">
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDark ? 'bg-slate-900/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Write a Note for Admin
                  </p>
                  Type your password reset request, reason, or account information below. It will be sent directly to the Admin notification center for review.
                </div>

                <form id="user-reset-request-to-admin-form" onSubmit={handleSubmitResetRequestToAdmin} className="space-y-3.5">
                  {/* Single Big Note Box */}
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Note for Central Admin *
                    </label>
                    <div className="relative">
                      <textarea
                        id="reset-req-note-input"
                        rows={5}
                        required
                        value={resetReqUserNote}
                        onChange={(e) => setResetReqUserNote(e.target.value)}
                        placeholder="Type your reset request note, reason, username or mobile number here for Admin review..."
                        className={`w-full p-3.5 rounded-2xl border text-xs leading-relaxed font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none transition-shadow ${
                          isDark
                            ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Send Request Button */}
                  <button
                    id="submit-reset-request-to-admin-btn"
                    type="submit"
                    className={`w-full py-3.5 rounded-full text-xs font-bold transition-transform active:scale-98 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                      isDark 
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Request to Admin Desk</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: USER FORGOT SUCCESS -> IN-PAGE REQUEST SENT SWIPE */}
          {/* ======================================================== */}
          {authView === 'USER_FORGOT_SUCCESS' && (
            <motion.div
              key="USER_FORGOT_SUCCESS"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4 text-center py-1"
            >
              {/* Request Sent Icon Badge */}
              <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7 text-slate-950" />
              </div>

              {/* Status Header */}
              <div className="space-y-1.5">
                <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Submit Request Sent
                </h3>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Wait for admin reply</span>
                </div>
              </div>

              {/* Message Explanation */}
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Your password reset request note has been successfully sent to the Central Admin Desk. Please wait for the admin to review and update your credentials.
              </p>

              {/* Submitted Note Card (Clean - Ticket REF removed) */}
              {resetSuccessDetails?.note && (
                <div className={`p-3 rounded-2xl border text-left text-[11px] space-y-1 ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted Note:</span>
                  <p className="line-clamp-3 text-slate-600 dark:text-slate-300 italic">"{resetSuccessDetails.note}"</p>
                </div>
              )}

              {/* OK Back to Login Button */}
              <button
                id="reset-success-back-to-login-btn"
                type="button"
                onClick={handleResetSuccessOk}
                className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1 ${
                  isDark
                    ? 'bg-white hover:bg-slate-100 text-slate-900'
                    : 'bg-[#18181B] hover:bg-black text-white'
                }`}
              >
                <span>OK (Back to Login)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* VIEW 5: ADMIN LOGIN (Clean, Permanent, No Demo Text)     */}
          {/* ======================================================== */}
          {authView === 'ADMIN_LOGIN' && (
            <motion.div
              key="ADMIN_LOGIN"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Central Admin Authorization</span>
                </div>
                <button
                  id="back-to-user-from-admin-btn"
                  type="button"
                  onClick={() => {
                    setAuthView('USER_LOGIN');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to User Login</span>
                </button>
              </div>

              <form id="admin-login-form" onSubmit={handleAdminLogin} className="space-y-3.5">
                {/* Admin Username (Instructional placeholder only) */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Admin Username *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="admin-username-input"
                      type="text"
                      required
                      autoComplete="username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Type your admin username"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                      }`}
                    />
                  </div>
                </div>

                {/* Admin 4-Digit PIN (Instructional placeholder only) */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Admin 4-Digit Password / PIN *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="admin-password-input"
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      maxLength={4}
                      inputMode="numeric"
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={handleNumericOnlyChange(setAdminPassword, 4)}
                      placeholder="Enter 4-digit PIN"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500/20'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-slate-900/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Admin Login Submit Button */}
                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  className={`w-full py-3 rounded-full text-xs font-bold transition-transform active:scale-98 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-3 ${
                    isDark 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Authorize Admin Portal</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small subtle Admin text link at bottom footer when in user mode */}
        {authView !== 'ADMIN_LOGIN' && (
          <div className="pt-2 text-center">
            <button
              id="admin-entry-text-link"
              type="button"
              onClick={() => {
                setAuthView('ADMIN_LOGIN');
                setAdminUsername('');
                setAdminPassword('');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              <KeyRound className="w-3 h-3 opacity-60" />
              <span>admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
