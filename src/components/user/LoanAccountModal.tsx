import React, { useState, useEffect } from 'react';
import { X, Landmark, DollarSign, Calendar, Clock, User, Phone, FileText, CheckCircle2, Percent, AlertCircle } from 'lucide-react';
import { LoanAccountRecord, LoanStatus } from '../../types';

interface LoanAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    accountTitle: string;
    customerName: string;
    mobileNumber: string;
    loanAccountNumber: string;
    loanAmount: number;
    monthlyInstallment: number;
    disbursementDate: string;
    interestRate: number;
    loanTenureYears: number;
    loanStatus?: LoanStatus;
    notes?: string;
  }) => void;
  initialData?: LoanAccountRecord | null;
  isDark: boolean;
  isBn: boolean;
}

export const LoanAccountModal: React.FC<LoanAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isDark,
  isBn
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [accountTitle, setAccountTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loanAccountNumber, setLoanAccountNumber] = useState('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [monthlyInstallment, setMonthlyInstallment] = useState<string>('');
  const [disbursementDate, setDisbursementDate] = useState<string>(todayStr);
  const [interestRate, setInterestRate] = useState<string>('9.0');
  const [loanTenureYears, setLoanTenureYears] = useState<number>(3);
  const [loanStatus, setLoanStatus] = useState<LoanStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAccountTitle(initialData.accountTitle || '');
        setCustomerName(initialData.customerName || '');
        setMobileNumber(initialData.mobileNumber || '');
        setLoanAccountNumber(initialData.loanAccountNumber || '');
        setLoanAmount(String(initialData.loanAmount || ''));
        setMonthlyInstallment(String(initialData.monthlyInstallment || ''));
        setDisbursementDate(initialData.disbursementDate || todayStr);
        setInterestRate(String(initialData.interestRate || '9.0'));
        setLoanTenureYears(initialData.loanTenureYears || 3);
        setLoanStatus(initialData.loanStatus || 'ACTIVE');
        setNotes(initialData.notes || '');
      } else {
        setAccountTitle('');
        setCustomerName('');
        setMobileNumber('');
        setLoanAccountNumber('');
        setLoanAmount('');
        setMonthlyInstallment('');
        setDisbursementDate(todayStr);
        setInterestRate('9.0');
        setLoanTenureYears(3);
        setLoanStatus('ACTIVE');
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, initialData, todayStr]);

  if (!isOpen) return null;

  // Auto calculate monthly EMI estimation if user inputs loan amount and tenure
  const handleCalculateEmi = () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = loanTenureYears * 12;
    if (p > 0 && r > 0 && n > 0) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setMonthlyInstallment(Math.round(emi).toString());
    }
  };

  // Validation according to user requirements:
  // - acc title: (Only Word / Text & spaces)
  // - acc number: (Only number)
  // - mobile number: (Only number)
  // - loan amount: (Only number)
    const handleAccountTitleChange = (val: string) => {
    // Only letters, spaces, dots, and ampersands allowed
    const sanitized = val.replace(/[^a-zA-Z\u0980-\u09FF\s.&'-]/g, '');
    setAccountTitle(sanitized);
  };

  const handleCustomerNameChange = (val: string) => {
    const sanitized = val.replace(/[^a-zA-Z\u0980-\u09FF\s.&'-]/g, '');
    setCustomerName(sanitized);
  };

  const handleMobileChange = (val: string) => {
    const numbersOnly = val.replace(/\D/g, '').slice(0, 11);
    setMobileNumber(numbersOnly);
  };

  const handleAccountNumberChange = (val: string) => {
    const numbersOnly = val.replace(/\D/g, '').slice(0, 20);
    setLoanAccountNumber(numbersOnly);
  };

  const handleLoanAmountChange = (val: string) => {
    const numbersOnly = val.replace(/\D/g, '');
    setLoanAmount(numbersOnly);
  };

  const handleInstallmentChange = (val: string) => {
    const numbersOnly = val.replace(/\D/g, '');
    setMonthlyInstallment(numbersOnly);
  };

  const handleInterestRateChange = (val: string) => {
    // Allow float numbers like 9.5
    const sanitized = val.replace(/[^0-9.]/g, '');
    setInterestRate(sanitized);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!accountTitle.trim()) {
      newErrors.accountTitle = isBn ? 'অ্যাকাউন্ট টাইটেল লিখুন (শুধুমাত্র টেক্সট)' : 'Account title is required (words only)';
    }
    if (!customerName.trim()) {
      newErrors.customerName = isBn ? 'গ্রাহকের নাম লিখুন' : 'Customer name is required';
    }
    if (!mobileNumber.trim() || mobileNumber.length < 11) {
      newErrors.mobileNumber = isBn ? 'সঠিক ১১ ডিজিট মোবাইল নম্বর দিন (শুধুমাত্র সংখ্যা)' : 'Valid 11-digit mobile number required';
    }
    if (!loanAccountNumber.trim()) {
      newErrors.loanAccountNumber = isBn ? 'লোন অ্যাকাউন্ট নম্বর দিন (শুধুমাত্র সংখ্যা)' : 'Loan account number required (numbers only)';
    }
    if (!loanAmount || Number(loanAmount) <= 0) {
      newErrors.loanAmount = isBn ? 'লোন অ্যামাউন্ট লিখুন' : 'Valid loan amount required';
    }
    if (!monthlyInstallment || Number(monthlyInstallment) <= 0) {
      newErrors.monthlyInstallment = isBn ? 'মাসিক কিস্তি (ইএমআই) লিখুন' : 'Monthly installment required';
    }
    if (!disbursementDate) {
      newErrors.disbursementDate = isBn ? 'লোন গ্রহণের তারিখ নির্বাচন করুন' : 'Disbursement date is required';
    }
    if (!interestRate || Number(interestRate) <= 0) {
      newErrors.interestRate = isBn ? 'সুদের হার (%) দিন' : 'Interest rate is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      accountTitle: accountTitle.trim(),
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      loanAccountNumber: loanAccountNumber.trim(),
      loanAmount: Number(loanAmount),
      monthlyInstallment: Number(monthlyInstallment),
      disbursementDate,
      interestRate: Number(interestRate),
      loanTenureYears: Number(loanTenureYears),
      loanStatus,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`sticky top-0 z-10 px-6 py-5 border-b flex items-center justify-between backdrop-blur-md ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {initialData
                  ? isBn ? 'লোন অ্যাকাউন্ট এডিট করুন' : 'Edit Loan Account'
                  : isBn ? 'নতুন লোন ফাইল এন্ট্রি করুন' : 'New Loan File Entry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'আউটলেট গ্রাহকের লোন বিবরণী ও কিস্তির তথ্য সংরক্ষণ করুন'
                  : 'Add customer loan sanction details, monthly EMI & tenure'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Account Title (Words only) & Customer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                1) {isBn ? 'গ্রাহক অ্যাকাউন্ট টাইটেল' : 'Customer Acc Title'} <span className="text-rose-500">*</span>
                <span className="text-[10px] font-normal text-slate-400 ml-1">({isBn ? 'শুধুমাত্র শব্দ/Text' : 'Only Word'})</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'উদাঃ Rafiqul Islam Trading' : 'e.g. Rafiqul Enterprise'}
                  value={accountTitle}
                  onChange={(e) => handleAccountTitleChange(e.target.value)}
                  className={`w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none ${
                    errors.accountTitle
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.accountTitle && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.accountTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                2) {isBn ? 'গ্রাহকের নাম (Customer Name)' : 'Customer Name'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'উদাঃ Md. Rafiqul Islam' : 'e.g. Md. Rafiqul Islam'}
                  value={customerName}
                  onChange={(e) => handleCustomerNameChange(e.target.value)}
                  className={`w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none ${
                    errors.customerName
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.customerName && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.customerName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Customer Mobile (Only numbers) & Loan Account Number (Only numbers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                3) {isBn ? 'গ্রাহক মোবাইল নম্বর' : 'Customer Mobile Number'} <span className="text-rose-500">*</span>
                <span className="text-[10px] font-normal text-slate-400 ml-1">({isBn ? 'শুধুমাত্র সংখ্যা' : 'Only Number'})</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={11}
                  required
                  placeholder="017XXXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  className={`w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border font-mono transition-colors focus:outline-none ${
                    errors.mobileNumber
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.mobileNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                {isBn ? 'লোন অ্যাকাউন্ট নম্বর' : 'Loan Account Number'} <span className="text-rose-500">*</span>
                <span className="text-[10px] font-normal text-slate-400 ml-1">({isBn ? 'শুধুমাত্র সংখ্যা' : 'Only Number'})</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={20}
                  required
                  placeholder={isBn ? 'উদাঃ 205120894512001' : 'e.g. 205120894512001'}
                  value={loanAccountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  className={`w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border font-mono transition-colors focus:outline-none ${
                    errors.loanAccountNumber
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.loanAccountNumber && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.loanAccountNumber}</p>
              )}
            </div>
          </div>

          {/* Row 3: Loan Amount (Taka) & Monthly Installment (Taka) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                4) {isBn ? 'লোন অ্যামাউন্ট (টাকা)' : 'Loan Amount (BDT)'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-amber-500">৳</span>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'উদাঃ 1500000' : 'e.g. 1500000'}
                  value={loanAmount}
                  onChange={(e) => handleLoanAmountChange(e.target.value)}
                  onBlur={handleCalculateEmi}
                  className={`w-full text-xs font-bold pl-8 pr-3.5 py-2.5 rounded-xl border font-mono transition-colors focus:outline-none ${
                    errors.loanAmount
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>
              {loanAmount && (
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {isBn ? 'ইন ওয়ার্ডস' : 'Amount'}: ৳{Number(loanAmount).toLocaleString()} BDT
                </p>
              )}
              {errors.loanAmount && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.loanAmount}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  5) {isBn ? 'মাসিক কিস্তি (Monthly Installment)' : 'Monthly Installment (EMI)'} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleCalculateEmi}
                  className="text-[10px] font-bold text-amber-500 hover:text-amber-400 underline cursor-pointer"
                >
                  {isBn ? 'অটো হিসাব করুন' : 'Auto Calculate'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-amber-500">৳</span>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'উদাঃ 31500' : 'e.g. 31500'}
                  value={monthlyInstallment}
                  onChange={(e) => handleInstallmentChange(e.target.value)}
                  className={`w-full text-xs font-bold pl-8 pr-3.5 py-2.5 rounded-xl border font-mono transition-colors focus:outline-none ${
                    errors.monthlyInstallment
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>
              {monthlyInstallment && (
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {isBn ? 'প্রতি মাসে প্রদান' : 'Per Month'}: ৳{Number(monthlyInstallment).toLocaleString()} BDT
                </p>
              )}
              {errors.monthlyInstallment && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.monthlyInstallment}</p>
              )}
            </div>
          </div>

          {/* Row 4: Disbursement Date, Interest Rate (%) & Tenure (Years) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                6) {isBn ? 'লোন গ্রহণের তারিখ' : 'Loan Date'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border font-mono transition-colors focus:outline-none ${
                    errors.disbursementDate
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white text-slate-800'
                  }`}
                />
              </div>
              {errors.disbursementDate && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.disbursementDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                7) {isBn ? 'সুদের হার (%)' : 'Interest Rate (%)'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="9.0"
                  value={interestRate}
                  onChange={(e) => handleInterestRateChange(e.target.value)}
                  onBlur={handleCalculateEmi}
                  className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border font-mono transition-colors focus:outline-none ${
                    errors.interestRate
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
              {errors.interestRate && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.interestRate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                {isBn ? 'কত বছরের জন্য (Tenure)' : 'Loan Tenure (Years)'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={loanTenureYears}
                onChange={(e) => {
                  setLoanTenureYears(Number(e.target.value));
                  setTimeout(handleCalculateEmi, 50);
                }}
                className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border transition-colors focus:outline-none ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500 focus:bg-white'
                }`}
              >
                <option value={1}>1 {isBn ? 'বছর (১২ মাস)' : 'Year (12 Mos)'}</option>
                <option value={2}>2 {isBn ? 'বছর (২৪ মাস)' : 'Years (24 Mos)'}</option>
                <option value={3}>3 {isBn ? 'বছর (৩৬ মাস)' : 'Years (36 Mos)'}</option>
                <option value={4}>4 {isBn ? 'বছর (৪৮ মাস)' : 'Years (48 Mos)'}</option>
                <option value={5}>5 {isBn ? 'বছর (৬০ মাস)' : 'Years (60 Mos)'}</option>
                <option value={7}>7 {isBn ? 'বছর (৮৪ মাস)' : 'Years (84 Mos)'}</option>
                <option value={10}>10 {isBn ? 'বছর (১২০ মাস)' : 'Years (120 Mos)'}</option>
                <option value={15}>15 {isBn ? 'বছর (১৮০ মাস)' : 'Years (180 Mos)'}</option>
              </select>
            </div>
          </div>

          {/* Row 5: Loan Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                {isBn ? 'লোন স্ট্যাটাস (Status)' : 'Loan Status'}
              </label>
              <select
                value={loanStatus}
                onChange={(e) => setLoanStatus(e.target.value as LoanStatus)}
                className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border transition-colors focus:outline-none ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500 focus:bg-white'
                }`}
              >
                <option value="ACTIVE">{isBn ? 'চালু আছে (ACTIVE)' : 'ACTIVE (Ongoing)'}</option>
                <option value="CLOSED">{isBn ? 'পরিশোধ সম্পন্ন (CLOSED)' : 'CLOSED (Settled)'}</option>
                <option value="OVERDUE">{isBn ? 'ওভারডিউ (OVERDUE)' : 'OVERDUE (Delayed)'}</option>
                <option value="DEFAULTED">{isBn ? 'ডিফল্ট (DEFAULTED)' : 'DEFAULTED'}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                {isBn ? 'মন্তব্য / বিবরণী (Notes - Optional)' : 'Notes / Remarks (Optional)'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'উদাঃ SME Business Loan / Mortgage Deed Ref' : 'e.g. SME Business Expansion Loan'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 focus:border-amber-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t flex items-center justify-end gap-3 border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? (isBn ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes') : (isBn ? 'লোন তথ্য যোগ করুন' : 'Add Loan Record')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
