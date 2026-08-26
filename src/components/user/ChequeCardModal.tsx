import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  BookOpen,
  User,
  Hash,
  Phone,
  Layers,
  CheckCircle2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { ChequeLeafCount } from '../../types';
import { CustomDatePicker } from '../common/CustomDatePicker';

interface ChequeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'CHOICE' | 'CHEQUE' | 'CARD';
}

export const ChequeCardModal: React.FC<ChequeCardModalProps> = ({
  isOpen,
  onClose,
  initialType = 'CHOICE'
}) => {
  const {
    userPreferences,
    addChequeBookEntry,
    addDebitCardEntry,
    updateChequeCardEntry,
    editingChequeCardEntry,
    currentUser
  } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const isBn = userPreferences.language === 'bn';

  const isEditing = Boolean(editingChequeCardEntry);
  const [selectedType, setSelectedType] = useState<'CHOICE' | 'CHEQUE' | 'CARD'>(initialType);

  // Cheque Form State
  const [chequeForm, setChequeForm] = useState({
    accountTitle: '',
    accountNumber: '',
    mobileNumber: '',
    receivedDate: new Date().toISOString().split('T')[0],
    leafCount: 25 as ChequeLeafCount,
    startCchNumber: '',
    endCchNumber: '',
    notes: ''
  });

  // Card Form State
  const [cardForm, setCardForm] = useState({
    cardName: '',
    accountNumber: '',
    mobileNumber: '',
    receivedDate: new Date().toISOString().split('T')[0],
    cardType: 'VISA Contactless Debit',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingChequeCardEntry) {
        setSelectedType(editingChequeCardEntry.type);
        if (editingChequeCardEntry.type === 'CHEQUE') {
          const chq = editingChequeCardEntry as any;
          setChequeForm({
            accountTitle: chq.accountTitle || '',
            accountNumber: chq.accountNumber || '',
            mobileNumber: chq.mobileNumber || '',
            receivedDate: chq.receivedDate || new Date().toISOString().split('T')[0],
            leafCount: chq.leafCount || 25,
            startCchNumber: chq.startCchNumber || '',
            endCchNumber: chq.endCchNumber || '',
            notes: chq.notes || ''
          });
        } else {
          const crd = editingChequeCardEntry as any;
          setCardForm({
            cardName: crd.cardName || '',
            accountNumber: crd.accountNumber || '',
            mobileNumber: crd.mobileNumber || '',
            receivedDate: crd.receivedDate || new Date().toISOString().split('T')[0],
            cardType: crd.cardType || 'VISA Contactless Debit',
            notes: crd.notes || ''
          });
        }
      } else {
        setSelectedType(initialType);
        setChequeForm({
          accountTitle: '',
          accountNumber: '',
          mobileNumber: '',
          receivedDate: new Date().toISOString().split('T')[0],
          leafCount: 25,
          startCchNumber: '',
          endCchNumber: '',
          notes: ''
        });
        setCardForm({
          cardName: '',
          accountNumber: '',
          mobileNumber: '',
          receivedDate: new Date().toISOString().split('T')[0],
          cardType: 'VISA Contactless Debit',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialType, editingChequeCardEntry]);

  if (!isOpen) return null;

  // Auto calculate end CCH number if user enters start CCH number
  const handleStartCchChange = (startVal: string) => {
    setChequeForm((prev) => {
      const updated = { ...prev, startCchNumber: startVal };
      const match = startVal.match(/^(.*?)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const numStr = match[2];
        const startNum = parseInt(numStr, 10);
        if (!isNaN(startNum) && prev.leafCount) {
          const endNum = startNum + prev.leafCount - 1;
          const paddedEnd = String(endNum).padStart(numStr.length, '0');
          updated.endCchNumber = `${prefix}${paddedEnd}`;
        }
      }
      return updated;
    });
  };

  const handleLeafCountChange = (count: ChequeLeafCount) => {
    setChequeForm((prev) => {
      const updated = { ...prev, leafCount: count };
      if (prev.startCchNumber) {
        const match = prev.startCchNumber.match(/^(.*?)(\d+)$/);
        if (match) {
          const prefix = match[1];
          const numStr = match[2];
          const startNum = parseInt(numStr, 10);
          if (!isNaN(startNum)) {
            const endNum = startNum + count - 1;
            const paddedEnd = String(endNum).padStart(numStr.length, '0');
            updated.endCchNumber = `${prefix}${paddedEnd}`;
          }
        }
      }
      return updated;
    });
  };

  const validateCheque = () => {
    const errs: Record<string, string> = {};
    if (!chequeForm.accountTitle.trim()) errs.accountTitle = 'Account Title is required (letters only)';
    if (!chequeForm.accountNumber.trim()) errs.accountNumber = 'Account Number is required (numbers only)';
    if (!chequeForm.mobileNumber.trim()) errs.mobileNumber = 'Mobile Number is required (numbers only)';
    if (!chequeForm.receivedDate) errs.receivedDate = 'Received Date is required';
    if (!chequeForm.startCchNumber.trim()) errs.startCchNumber = 'Start CCH Number is required';
    if (!chequeForm.endCchNumber.trim()) errs.endCchNumber = 'End CCH Number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCard = () => {
    const errs: Record<string, string> = {};
    if (!cardForm.cardName.trim()) errs.cardName = 'Cardholder Name is required (letters only)';
    if (!cardForm.accountNumber.trim()) errs.accountNumber = 'Account Number is required (numbers only)';
    if (!cardForm.mobileNumber.trim()) errs.mobileNumber = 'Mobile Number is required (numbers only)';
    if (!cardForm.receivedDate) errs.receivedDate = 'Received Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChequeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheque()) return;

    if (isEditing && editingChequeCardEntry) {
      updateChequeCardEntry({
        ...editingChequeCardEntry,
        type: 'CHEQUE',
        accountTitle: chequeForm.accountTitle.trim(),
        accountNumber: chequeForm.accountNumber.trim(),
        mobileNumber: chequeForm.mobileNumber.trim(),
        receivedDate: chequeForm.receivedDate,
        leafCount: chequeForm.leafCount,
        startCchNumber: chequeForm.startCchNumber.trim(),
        endCchNumber: chequeForm.endCchNumber.trim(),
        notes: chequeForm.notes
      } as any);
    } else {
      addChequeBookEntry({
        accountTitle: chequeForm.accountTitle,
        accountNumber: chequeForm.accountNumber,
        mobileNumber: chequeForm.mobileNumber,
        receivedDate: chequeForm.receivedDate,
        leafCount: chequeForm.leafCount,
        startCchNumber: chequeForm.startCchNumber,
        endCchNumber: chequeForm.endCchNumber,
        notes: chequeForm.notes
      });
    }

    onClose();
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;

    if (isEditing && editingChequeCardEntry) {
      updateChequeCardEntry({
        ...editingChequeCardEntry,
        type: 'CARD',
        cardName: cardForm.cardName.trim(),
        accountNumber: cardForm.accountNumber.trim(),
        mobileNumber: cardForm.mobileNumber.trim(),
        receivedDate: cardForm.receivedDate,
        cardType: cardForm.cardType,
        notes: cardForm.notes
      } as any);
    } else {
      addDebitCardEntry({
        cardName: cardForm.cardName,
        accountNumber: cardForm.accountNumber,
        mobileNumber: cardForm.mobileNumber,
        receivedDate: cardForm.receivedDate,
        cardType: cardForm.cardType,
        notes: cardForm.notes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-[#182234] border-slate-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-700/80 bg-slate-800/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {selectedType !== 'CHOICE' && (
              <button
                onClick={() => setSelectedType('CHOICE')}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer mr-1 ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-700 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-200 text-slate-800 bg-white'
                }`}
                title="Go back to selection"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                selectedType === 'CARD'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : selectedType === 'CHEQUE'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : isDark
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {selectedType === 'CARD' ? (
                <CreditCard className="w-5 h-5" />
              ) : selectedType === 'CHEQUE' ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </div>

            <div>
              <h2
                className={`text-base font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {selectedType === 'CHOICE'
                  ? isBn
                    ? 'তথ্য এন্ট্রি নির্বাচন করুন'
                    : 'Select Entry Type'
                  : selectedType === 'CHEQUE'
                  ? isEditing
                    ? isBn
                      ? 'চেক বই তথ্য পরিবর্তন (Edit)'
                      : 'Edit Cheque Book Entry'
                    : isBn
                    ? 'চেক বই তথ্য এন্ট্রি'
                    : 'Cheque Book Entry'
                  : isEditing
                  ? isBn
                    ? 'ডেবিট কার্ড তথ্য পরিবর্তন (Edit)'
                    : 'Edit Debit Card Entry'
                  : isBn
                  ? 'ডেবিট কার্ড তথ্য এন্ট্রি'
                  : 'Debit Card Entry'}
              </h2>
              <p
                className={`text-xs font-bold ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {currentUser?.outletName || 'Motijheel Commercial SME Outlet'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Choice Screen: Clean, Direct, High-Contrast */}
          {selectedType === 'CHOICE' && (
            <div className="space-y-4 py-2">
              <div className="text-center pb-2">
                <h3
                  className={`text-sm font-black ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {isBn
                    ? 'আপনি কোন তথ্য এন্ট্রি করতে চান?'
                    : 'Which data do you want to enter?'}
                </h3>
                <p
                  className={`text-xs font-semibold mt-0.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {isBn
                    ? 'নিচে চেক বই অথবা ডেবিট কার্ড সিলেক্ট করুন:'
                    : 'Please select Cheque Book or Debit Card below:'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Cheque Book Button */}
                <button
                  type="button"
                  onClick={() => setSelectedType('CHEQUE')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-36 group ${
                    isDark
                      ? 'bg-slate-800/90 border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-white'
                      : 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-600 hover:bg-emerald-100/70 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h4
                      className={`text-base font-black ${
                        isDark ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-800'
                      }`}
                    >
                      Cheque Book Entry
                    </h4>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-700'
                      }`}
                    >
                      {isBn ? 'চেক বই এন্ট্রি করতে ক্লিক করুন' : 'Click to enter Cheque data'}
                    </p>
                  </div>
                </button>

                {/* 2. Debit Card Button */}
                <button
                  type="button"
                  onClick={() => setSelectedType('CARD')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-36 group ${
                    isDark
                      ? 'bg-slate-800/90 border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-white'
                      : 'bg-blue-50/70 border-blue-300 hover:border-blue-600 hover:bg-blue-100/70 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-700 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h4
                      className={`text-base font-black ${
                        isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-800'
                      }`}
                    >
                      Debit Card Entry
                    </h4>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        isDark ? 'text-blue-400' : 'text-blue-700'
                      }`}
                    >
                      {isBn ? 'ডেবিট কার্ড এন্ট্রি করতে ক্লিক করুন' : 'Click to enter Card data'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Cheque Book Entry Form */}
          {selectedType === 'CHEQUE' && (
            <form onSubmit={handleChequeSubmit} className="space-y-4">
              {/* Account Title */}
              <div>
                <label
                  className={`block text-xs font-black mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  1) Account Title / Customer Name <span className="text-rose-500">*</span>
                  <span className="text-[10px] font-normal text-slate-400 ml-1.5">(Letters only, no digits)</span>
                </label>
                <div className="relative">
                  <User
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    value={chequeForm.accountTitle}
                    onChange={(e) => {
                      const textOnly = e.target.value.replace(/[0-9]/g, '');
                      setChequeForm({ ...chequeForm, accountTitle: textOnly });
                    }}
                    placeholder="e.g. Md. Rafiqul Islam / Rahim Trading"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 transition-all ${
                      errors.accountTitle
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : isDark
                        ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 shadow-2xs'
                    }`}
                  />
                </div>
                {errors.accountTitle && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.accountTitle}</p>}
              </div>

              {/* Account Number & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    className={`block text-xs font-black mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}
                  >
                    2) Account Number <span className="text-rose-500">*</span>
                    <span className="text-[10px] font-normal text-slate-400 ml-1">(Numbers only)</span>
                  </label>
                  <div className="relative">
                    <Hash
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    />
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      value={chequeForm.accountNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        setChequeForm({ ...chequeForm, accountNumber: digitsOnly });
                      }}
                      placeholder="16-digit Account No"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 transition-all ${
                        errors.accountNumber
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder-slate-500'
                          : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                  {errors.accountNumber && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.accountNumber}</p>}
                </div>

                <div>
                  <label
                    className={`block text-xs font-black mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}
                  >
                    3) Mobile Number (BD) <span className="text-rose-500">*</span>
                    <span className="text-[10px] font-normal text-slate-400 ml-1">(Numbers only)</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    />
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      value={chequeForm.mobileNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        setChequeForm({ ...chequeForm, mobileNumber: digitsOnly });
                      }}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 transition-all ${
                        errors.mobileNumber
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder-slate-500'
                          : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.mobileNumber}</p>}
                </div>
              </div>

              {/* Received Date with Custom Calendar Picker & Leaf Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <CustomDatePicker
                    label="4) Received Date"
                    required
                    value={chequeForm.receivedDate}
                    onChange={(newDate) => setChequeForm({ ...chequeForm, receivedDate: newDate })}
                    isDark={isDark}
                    error={errors.receivedDate}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-black mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}
                  >
                    5) LVS (Leaf Count Selection) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    />
                    <select
                      value={chequeForm.leafCount}
                      onChange={(e) => handleLeafCountChange(parseInt(e.target.value, 10) as ChequeLeafCount)}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-extrabold focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white'
                          : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <option value={10}>10 Leaves (LVS)</option>
                      <option value={20}>20 Leaves (LVS)</option>
                      <option value={25}>25 Leaves (LVS)</option>
                      <option value={50}>50 Leaves (LVS)</option>
                      <option value={100}>100 Leaves (LVS)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Start CCH Number & End CCH Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    className={`block text-xs font-black mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}
                  >
                    6) START CCH NUMBER <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={chequeForm.startCchNumber}
                    onChange={(e) => handleStartCchChange(e.target.value)}
                    placeholder="e.g. CCH-9021401"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 transition-all ${
                      errors.startCchNumber
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : isDark
                        ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-emerald-400'
                        : 'bg-white border-slate-300 focus:border-emerald-500 text-emerald-900 font-extrabold shadow-2xs'
                    }`}
                  />
                  {errors.startCchNumber && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.startCchNumber}</p>}
                </div>

                <div>
                  <label
                    className={`block text-xs font-black mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}
                  >
                    7) END CCH NUMBER <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={chequeForm.endCchNumber}
                    onChange={(e) => setChequeForm({ ...chequeForm, endCchNumber: e.target.value })}
                    placeholder="e.g. CCH-9021425"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 transition-all ${
                      errors.endCchNumber
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : isDark
                        ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-emerald-400'
                        : 'bg-white border-slate-300 focus:border-emerald-500 text-emerald-900 font-extrabold shadow-2xs'
                    }`}
                  />
                  {errors.endCchNumber && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.endCchNumber}</p>}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label
                  className={`block text-xs font-black mb-1 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={chequeForm.notes}
                  onChange={(e) => setChequeForm({ ...chequeForm, notes: e.target.value })}
                  placeholder="e.g. Received via courier dispatch"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 transition-all resize-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900 placeholder-slate-400 shadow-2xs'
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={isEditing ? onClose : () => setSelectedType('CHOICE')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-800 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {isEditing ? 'Cancel' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Update Cheque Book Entry' : 'Save Cheque Book Entry'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Debit Card Entry Form */}
          {selectedType === 'CARD' && (
            <form onSubmit={handleCardSubmit} className="space-y-4">
              {/* Card Name */}
              <div>
                <label
                  className={`block text-xs font-black mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  1) Card Name (Name on Card) <span className="text-rose-500">*</span>
                  <span className="text-[10px] font-normal text-slate-400 ml-1.5">(Letters only, no digits)</span>
                </label>
                <div className="relative">
                  <User
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    value={cardForm.cardName}
                    onChange={(e) => {
                      const textOnly = e.target.value.replace(/[0-9]/g, '').toUpperCase();
                      setCardForm({ ...cardForm, cardName: textOnly });
                    }}
                    placeholder="e.g. TARIQUL ISLAM CHOWDHURY"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-extrabold tracking-wide uppercase focus:outline-none focus:ring-2 transition-all ${
                      errors.cardName
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : isDark
                        ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 shadow-2xs'
                    }`}
                  />
                </div>
                {errors.cardName && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.cardName}</p>}
              </div>

              {/* Account Number */}
              <div>
                <label
                  className={`block text-xs font-black mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  2) Account Number <span className="text-rose-500">*</span>
                  <span className="text-[10px] font-normal text-slate-400 ml-1">(Numbers only)</span>
                </label>
                <div className="relative">
                  <Hash
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={cardForm.accountNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      setCardForm({ ...cardForm, accountNumber: digitsOnly });
                    }}
                    placeholder="16-digit Account No linked to this Card"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 transition-all ${
                      errors.accountNumber
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : isDark
                        ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 shadow-2xs'
                    }`}
                  />
                </div>
                {errors.accountNumber && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.accountNumber}</p>}
              </div>

              {/* Mobile Number & Received Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    className={`block text-xs font-black mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}
                  >
                    3) Mobile Number (BD) <span className="text-rose-500">*</span>
                    <span className="text-[10px] font-normal text-slate-400 ml-1">(Numbers only)</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    />
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      value={cardForm.mobileNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        setCardForm({ ...cardForm, mobileNumber: digitsOnly });
                      }}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 transition-all ${
                        errors.mobileNumber
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500'
                          : 'bg-white border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <CustomDatePicker
                    label="4) Received Date"
                    required
                    value={cardForm.receivedDate}
                    onChange={(newDate) => setCardForm({ ...cardForm, receivedDate: newDate })}
                    isDark={isDark}
                    error={errors.receivedDate}
                  />
                </div>
              </div>

              {/* Card Type Variant */}
              <div>
                <label
                  className={`block text-xs font-black mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  Card Type / Product
                </label>
                <select
                  value={cardForm.cardType}
                  onChange={(e) => setCardForm({ ...cardForm, cardType: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-extrabold focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-white border-slate-300 focus:border-blue-500 text-slate-900 shadow-2xs'
                  }`}
                >
                  <option value="VISA Contactless Debit">VISA Contactless Debit</option>
                  <option value="VISA Priority Debit">VISA Priority Debit</option>
                  <option value="Mastercard Titanium Debit">Mastercard Titanium Debit</option>
                  <option value="Mastercard Contactless Debit">Mastercard Contactless Debit</option>
                  <option value="UnionPay Global Debit">UnionPay Global Debit</option>
                  <option value="TakaPay National Debit">TakaPay National Debit</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label
                  className={`block text-xs font-black mb-1 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={cardForm.notes}
                  onChange={(e) => setCardForm({ ...cardForm, notes: e.target.value })}
                  placeholder="e.g. Pin mailer attached"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 transition-all resize-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 shadow-2xs'
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={isEditing ? onClose : () => setSelectedType('CHOICE')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-800 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {isEditing ? 'Cancel' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Update Debit Card Entry' : 'Save Debit Card Entry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
