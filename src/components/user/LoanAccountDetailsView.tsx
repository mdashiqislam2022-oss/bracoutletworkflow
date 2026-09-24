import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Landmark,
  Search,
  Plus,
  Filter,
  DollarSign,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Trash2,
  Edit3,
  Copy,
  Check,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Download,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ArrowRightLeft
} from 'lucide-react';
import { LoanAccountRecord, LoanStatus } from '../../types';
import { LoanAccountModal } from './LoanAccountModal';

type UnifiedAccount = {
  source: 'LOAN' | 'CHEQUE' | 'CARD' | 'CUSTOMER';
  id: string;
  accountNumber: string;
  accountTitle: string;
  customerName: string;
  mobileNumber: string;
  category: string;
  status: string;
  outletId: string;
  outletName: string;
  createdAt: string;
  loanAmount?: number;
  monthlyInstallment?: number;
  disbursementDate?: string;
  interestRate?: number;
  loanTenureYears?: number;
  loanRecord?: LoanAccountRecord;
  isOutsideOutlet?: boolean;
};

export const LoanAccountDetailsView: React.FC = () => {
  const {
    loanRecords,
    chequeCardEntries,
    customerAccounts,
    addLoanRecord,
    updateLoanRecord,
    deleteLoanRecord,
    userPreferences,
    currentUser,
    setToast
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const isBn = userPreferences.language === 'bn';

   const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LoanStatus>('ALL');
  const [accountFilter, setAccountFilter] = useState<
  'ALL' | 'LOAN' | 'OUTLET' | 'EXTERNAL'
>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<LoanAccountRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LoanAccountRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<LoanAccountRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Overview Counts & Financial Math
    const unifiedAccounts = useMemo<UnifiedAccount[]>(() => {
    const accounts: UnifiedAccount[] = [];

    // 1. Loan Accounts
    loanRecords
      .filter((loan) => !currentUser || loan.outletId === currentUser.outletId)
      .forEach((loan) => {
        accounts.push({
          source: 'LOAN',
          id: loan.id,
          accountNumber: loan.loanAccountNumber,
          accountTitle: loan.accountTitle,
          customerName: loan.customerName,
          mobileNumber: loan.mobileNumber,
          category: 'LOAN ACCOUNT',
          status: loan.loanStatus,
          outletId: loan.outletId,
          outletName: loan.outletName,
          createdAt: loan.createdAt,
          loanAmount: loan.loanAmount,
          monthlyInstallment: loan.monthlyInstallment,
          disbursementDate: loan.disbursementDate,
          interestRate: loan.interestRate,
          loanTenureYears: loan.loanTenureYears,
          loanRecord: loan,
          isOutsideOutlet: false
        });
      });

    // 2. Cheque / Debit / Credit Card Accounts
    chequeCardEntries
      .filter((entry) => !currentUser || entry.outletId === currentUser.outletId)
      .forEach((entry: any) => {
        accounts.push({
          source: entry.type === 'CHEQUE' ? 'CHEQUE' : 'CARD',
          id: entry.id,
          accountNumber: entry.accountNumber,
          accountTitle: entry.accountTitle || entry.cardName || 'Customer',
          customerName: entry.accountTitle || entry.cardName || 'Customer',
          mobileNumber: entry.mobileNumber,
          category: entry.type === 'CHEQUE'
            ? 'CHEQUE BOOK'
            : 'DEBIT / CREDIT CARD',
          status: entry.status,
          outletId: entry.outletId,
          outletName: entry.outletName,
          createdAt: entry.createdAt,
          isOutsideOutlet: false
        });
      });

    // 3. Savings / Current Accounts added from Cash Counting
    customerAccounts
      .filter((account) => !currentUser || account.outletId === currentUser.outletId)
      .forEach((account) => {
        accounts.push({
          source: 'CUSTOMER',
          id: account.id,
          accountNumber: account.accountNumber,
          accountTitle: account.accountTitle,
          customerName: account.accountTitle,
          mobileNumber: account.mobileNumber,
          category: account.isOutsideOutlet
            ? 'EXTERNAL ACCOUNT'
            : account.accountCategory,
          status: account.status,
          outletId: account.outletId,
          outletName: account.outletName,
          createdAt: account.createdAt,
          isOutsideOutlet: account.isOutsideOutlet === true
        });
      });

    return accounts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [loanRecords, chequeCardEntries, customerAccounts, currentUser]);
  const outletLoanRecords = useMemo(
  () =>
    loanRecords.filter(
      (loan) => !currentUser || loan.outletId === currentUser.outletId
    ),
  [loanRecords, currentUser]
);

const totalLoans = outletLoanRecords.length;

const outletAccounts = useMemo(
  () => unifiedAccounts.filter((account) => !account.isOutsideOutlet),
  [unifiedAccounts]
);

const externalAccounts = useMemo(
  () => unifiedAccounts.filter((account) => account.isOutsideOutlet),
  [unifiedAccounts]
);

const activeLoans = useMemo(
  () => outletLoanRecords.filter((l) => l.loanStatus === 'ACTIVE'),
  [outletLoanRecords]
);

const closedLoans = useMemo(
  () => outletLoanRecords.filter((l) => l.loanStatus === 'CLOSED'),
  [outletLoanRecords]
);

const overdueLoans = useMemo(
  () =>
    outletLoanRecords.filter(
      (l) => l.loanStatus === 'OVERDUE' || l.loanStatus === 'DEFAULTED'
    ),
  [outletLoanRecords]
);

  const totalSanctionedAmount = useMemo(
  () =>
    outletLoanRecords.reduce(
      (acc, curr) => acc + (curr.loanAmount || 0),
      0
    ),
  [outletLoanRecords]
);
  const totalMonthlyEmiExpected = useMemo(
    () => activeLoans.reduce((acc, curr) => acc + (curr.monthlyInstallment || 0), 0),
    [activeLoans]
  );

  // Filtered Loans based on Search & Status
      const filteredAccounts = useMemo(() => {
    return unifiedAccounts.filter((item) => {
      // Account type filter
if (accountFilter === 'LOAN' && item.source !== 'LOAN') {
  return false;
}

if (accountFilter === 'OUTLET' && item.isOutsideOutlet) {
  return false;
}

if (accountFilter === 'EXTERNAL' && !item.isOutsideOutlet) {
  return false;
}

// Loan status filter
if (statusFilter !== 'ALL') {
  if (item.source !== 'LOAN') {
    return false;
  }

  if (
    statusFilter === 'OVERDUE'
      ? item.status !== 'OVERDUE' && item.status !== 'DEFAULTED'
      : item.status !== statusFilter
  ) {
    return false;
  }
}

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();

        const matchTitle = item.accountTitle
          .toLowerCase()
          .includes(q);

        const matchName = item.customerName
          .toLowerCase()
          .includes(q);

        const matchMobile = item.mobileNumber
          .toLowerCase()
          .includes(q);

        const matchAccNo = item.accountNumber
          .toLowerCase()
          .includes(q);

        const matchCategory = item.category
          .toLowerCase()
          .includes(q);

        return (
          matchTitle ||
          matchName ||
          matchMobile ||
          matchAccNo ||
          matchCategory
        );
      }

      return true;
    });
    }, [unifiedAccounts, accountFilter, statusFilter, searchQuery]);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToast({ message: isBn ? 'ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickStatusChange = (loan: LoanAccountRecord, newStatus: LoanStatus) => {
    if (loan.loanStatus === newStatus) return;
    updateLoanRecord({
      ...loan,
      loanStatus: newStatus,
      updatedAt: new Date().toISOString()
    });
    setToast({
      message: isBn
        ? `"${loan.accountTitle}" এর স্ট্যাটাস '${newStatus}' এ পরিবর্তন করা হয়েছে!`
        : `Status updated to '${newStatus}' for ${loan.accountTitle}!`,
      type: 'success'
    });
  };

  const handleExportCsv = () => {
    if (loanRecords.length === 0) {
      alert(isBn ? 'এক্সপোর্ট করার জন্য কোন লোন ডাটা নেই।' : 'No loan records to export.');
      return;
    }
    const headers = ['Account Title', 'Customer Name', 'Mobile Number', 'Loan Account No', 'Loan Amount (BDT)', 'Monthly Installment (BDT)', 'Disbursement Date', 'Interest Rate (%)', 'Tenure (Years)', 'Status', 'Notes'];
    const rows = loanRecords.map((l) => [
      `"${l.accountTitle.replace(/"/g, '""')}"`,
      `"${l.customerName.replace(/"/g, '""')}"`,
      `"${l.mobileNumber}"`,
      `"${l.loanAccountNumber}"`,
      l.loanAmount,
      l.monthlyInstallment,
      l.disbursementDate,
      `${l.interestRate}%`,
      l.loanTenureYears,
      l.loanStatus,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Loan_Accounts_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: isBn ? 'CSV রিপোর্ট ডাউনলোড সম্পন্ন!' : 'Loan CSV export completed!', type: 'success' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sticky Top Section (Outlet Portal down through Search Bar - Exactly as in user image) */}
      <div
        className={`sticky top-0 z-30 pt-1 pb-3 space-y-3.5 no-print transition-all backdrop-blur-md border-b ${
          isDark
            ? 'bg-[#131B2A]/98 border-slate-800/80 shadow-xs'
            : 'bg-[#F7F9FB]/98 border-slate-200/80 shadow-2xs'
        }`}
      >
        {/* 1. Header & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Landmark className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBn ? 'আউটলেট পোর্টাল' : 'Outlet Portal'}</span>
              <span>→</span>
              <span className={isDark ? 'text-amber-400 font-semibold' : 'text-amber-600 font-semibold'}>
               {isBn ? 'সকল অ্যাকাউন্ট' : 'All Accounts'}
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
             <span>{isBn ? 'সকল অ্যাকাউন্ট ডিরেক্টরি' : 'All Accounts Directory'}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {currentUser?.outletName || 'Motijheel SME Outlet'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
               ? 'আপনার আউটলেটের সকল লোন, চেক, কার্ড, সেভিংস ও কারেন্ট অ্যাকাউন্ট এক জায়গা থেকে দেখুন এবং পরিচালনা করুন'
               : 'View and manage all loan, cheque, card, savings and current accounts associated with this outlet'}
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'CSV রিপোর্ট' : 'Export CSV'}</span>
            </button>

            {/* New Loan Entry Button */}
            <button
              id="add-loan-entry-btn"
              onClick={() => {
                setEditingRecord(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isBn ? '+ নতুন লোন এন্ট্রি' : '+ Add New Loan File'}</span>
            </button>
          </div>
        </div>

        {/* 2. Overview Counting Metric Cards (Total, Active, Closed, Overdue) */}
       <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4" role="region" aria-label={isBn ? 'লোন পরিসংখ্যান সামারি' : 'Loan overview summary metrics'}>
          {/* Card 1: Total Loans */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`${totalLoans} total loan records, sanctioned amount ${totalSanctionedAmount.toLocaleString()} BDT. Click to show all loans.`}
           onClick={() => {
  setAccountFilter('LOAN');
  setStatusFilter('ALL');
}}
 onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    setAccountFilter('LOAN');
    setStatusFilter('ALL');
  }
}}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'ring-2 ring-amber-500 shadow-md'
                : 'hover:border-amber-500/50'
            } ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-2xs'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isBn ? 'সর্বমোট লোন' : 'Total Loans'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500" aria-hidden="true">
                <Landmark className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {totalLoans}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isBn ? 'টি ফাইল' : 'files'}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono truncate">
              ৳{totalSanctionedAmount.toLocaleString()} BDT
            </div>
          </div>

          {/* Card 2: Active / Running Loans */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`${activeLoans.length} active loans, monthly EMI ৳${totalMonthlyEmiExpected.toLocaleString()}. Click to filter active loans.`}
          onClick={() => {
  setAccountFilter('LOAN');
  setStatusFilter('ACTIVE');
}}
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    setAccountFilter('LOAN');
    setStatusFilter('ACTIVE');
  }
}}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'ring-2 ring-emerald-500 shadow-md'
                : 'hover:border-emerald-500/50'
            } ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-2xs'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {isBn ? 'চালু লোন (Active)' : 'Active Loans'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500" aria-hidden="true">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {activeLoans.length}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isBn ? 'চলমান' : 'running'}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">
              {isBn ? 'মাসিক কিস্তি' : 'Monthly EMI'}: ৳{totalMonthlyEmiExpected.toLocaleString()}
            </div>
          </div>

          {/* Card 3: Closed / Settled Loans */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`${closedLoans.length} closed or settled loans. Click to filter closed loans.`}
          onClick={() => {
  setAccountFilter('LOAN');
  setStatusFilter('CLOSED');
}}
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    setAccountFilter('LOAN');
    setStatusFilter('CLOSED');
  }
}}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'CLOSED'
                ? 'ring-2 ring-indigo-500 shadow-md'
                : 'hover:border-indigo-500/50'
            } ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-2xs'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {isBn ? 'পরিশোধ সম্পন্ন (Closed)' : 'Closed / Settled'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-500" aria-hidden="true">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {closedLoans.length}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isBn ? 'বন্ধ হয়েছে' : 'settled'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium truncate">
              {isBn ? 'সম্পূর্ণ এনওসি প্রদানকৃত' : 'Fully matured & NOC issued'}
            </div>
          </div>

          {/* Card 4: Overdue / Defaulted */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`${overdueLoans.length} overdue or defaulted loans. Click to filter overdue loans.`}
           onClick={() => {
  setAccountFilter('LOAN');
  setStatusFilter('OVERDUE');
}}
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    setAccountFilter('LOAN');
    setStatusFilter('OVERDUE');
  }
}}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'OVERDUE'
                ? 'ring-2 ring-rose-500 shadow-md'
                : 'hover:border-rose-500/50'
            } ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-2xs'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {isBn ? 'ওভারডিউ / বকেয়া' : 'Overdue / Alerts'}
              </span>
              <div className="w-7 h-7 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500" aria-hidden="true">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                {overdueLoans.length}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isBn ? 'দেরি হচ্ছে' : 'needs focus'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-rose-500 font-medium truncate">
              {overdueLoans.length > 0 ? (isBn ? 'তাগাদা প্রদান প্রয়োজন' : 'Follow up required') : (isBn ? 'সব কিস্তি নিয়মিত' : 'All accounts clean')}
            </div>
          </div>
              {/* Card 5: Outlet Accounts */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`${outletAccounts.length} outlet accounts. Click to show outlet accounts.`}
            onClick={() => {
              setAccountFilter('OUTLET');
              setStatusFilter('ALL');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setAccountFilter('OUTLET');
                setStatusFilter('ALL');
              }
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              accountFilter === 'OUTLET'
                ? 'ring-2 ring-cyan-500 shadow-md'
                : 'hover:border-cyan-500/50'
            } ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/80'
                : 'bg-white border-slate-200/80 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                {isBn ? 'আউটলেট অ্যাকাউন্ট' : 'Outlet Accounts'}
              </span>

              <div
                className="w-7 h-7 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-500"
                aria-hidden="true"
              >
                <Landmark className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {outletAccounts.length}
              </span>

              <span className="text-[10px] text-slate-400 font-medium">
                {isBn ? 'টি অ্যাকাউন্ট' : 'accounts'}
              </span>
            </div>

            <div className="mt-1 text-[11px] text-slate-400 font-medium truncate">
              {isBn
                ? 'এই আউটলেটের অ্যাকাউন্ট'
                : 'Accounts under this outlet'}
            </div>
          </div>

          {/* Card 6: External Accounts */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`${externalAccounts.length} external accounts. Click to show external accounts.`}
            onClick={() => {
              setAccountFilter('EXTERNAL');
              setStatusFilter('ALL');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setAccountFilter('EXTERNAL');
                setStatusFilter('ALL');
              }
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              accountFilter === 'EXTERNAL'
                ? 'ring-2 ring-rose-500 shadow-md'
                : 'hover:border-rose-500/50'
            } ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/80'
                : 'bg-white border-slate-200/80 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {isBn ? 'বাহিরের অ্যাকাউন্ট' : 'External Accounts'}
              </span>

              <div
                className="w-7 h-7 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500"
                aria-hidden="true"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                {externalAccounts.length}
              </span>

              <span className="text-[10px] text-slate-400 font-medium">
                {isBn ? 'টি অ্যাকাউন্ট' : 'accounts'}
              </span>
            </div>

            <div className="mt-1 text-[11px] text-rose-500 font-medium truncate">
              {isBn
                ? 'আউটলেটের বাইরের অ্যাকাউন্ট'
                : 'Accounts outside this outlet'}
            </div>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className={`p-3 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-2xs'
        }`}>
          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
             aria-label={isBn ? 'সকল অ্যাকাউন্ট খুঁজুন' : 'Search all accounts'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
             placeholder={isBn ? 'অ্যাকাউন্ট, নাম, মোবাইল, নম্বর বা ক্যাটাগরি খুঁজুন...' : 'Search account, customer, phone, number or category...'}
              className={`w-full text-xs font-semibold pl-9 pr-8 py-2 rounded-xl border transition-colors focus:outline-none ${
                isDark
                  ? 'bg-slate-900/80 border-slate-700 focus:border-amber-500 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-start md:justify-end" role="tablist" aria-label="Loan status filters">
            <span className="text-[11px] font-bold text-slate-400 mr-1">{isBn ? 'ফিল্টার:' : 'Filter:'}</span>
            {(['ALL', 'ACTIVE', 'CLOSED', 'OVERDUE'] as const).map((filterKey) => (
              <button
                key={filterKey}
                role="tab"
                aria-selected={statusFilter === filterKey}
                aria-label={`Filter by ${filterKey} loans`}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === filterKey
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark
                    ? 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/60'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {filterKey === 'ALL'
                  ? isBn ? 'সকল লোন' : 'All'
                  : filterKey === 'ACTIVE'
                  ? isBn ? 'চালু (Active)' : 'Active'
                  : filterKey === 'CLOSED'
                  ? isBn ? 'পরিশোধিত (Closed)' : 'Closed'
                  : isBn ? 'ওভারডিউ (Overdue)' : 'Overdue'}
              </button>
            ))}
          </div>
        </div>
      </div>

            {/* 4. All Accounts Directory */}
      <div
        role="region"
        aria-label={isBn ? 'সকল অ্যাকাউন্ট তালিকা' : 'All accounts directory'}
        className={`rounded-3xl border overflow-hidden shadow-2xs ${
          isDark
            ? 'bg-slate-800/40 border-slate-700/80'
            : 'bg-white border-slate-200/80'
        }`}
      >
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-xs border-collapse"
            aria-label={isBn ? 'সকল অ্যাকাউন্ট' : 'All accounts table'}
          >
            <thead>
              <tr
                className={`border-b text-[11px] font-black uppercase tracking-wider ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-700/80 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <th scope="col" className="py-3.5 px-4">
                  #
                </th>

                <th scope="col" className="py-3.5 px-4">
                  {isBn ? 'অ্যাকাউন্ট ও গ্রাহক' : 'Account & Customer'}
                </th>

                <th scope="col" className="py-3.5 px-4">
                  {isBn ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
                </th>

                <th scope="col" className="py-3.5 px-4">
                  {isBn ? 'ক্যাটাগরি' : 'Category'}
                </th>

                <th scope="col" className="py-3.5 px-4">
                  {isBn ? 'মোবাইল' : 'Mobile'}
                </th>

                <th scope="col" className="py-3.5 px-4">
                  {isBn ? 'স্ট্যাটাস' : 'Status'}
                </th>

                <th scope="col" className="py-3.5 px-4">
                  {isBn ? 'আউটলেট' : 'Outlet'}
                </th>

                <th scope="col" className="py-3.5 px-4 text-right">
                  {isBn ? 'অ্যাকশন' : 'Actions'}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Landmark
                      className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2"
                      aria-hidden="true"
                    />

                    <p className="font-bold text-sm">
                      {searchQuery
                        ? isBn
                          ? 'এই সার্চে কোনো অ্যাকাউন্ট পাওয়া যায়নি'
                          : 'No accounts match your search'
                        : isBn
                        ? 'কোনো অ্যাকাউন্ট পাওয়া যায়নি'
                        : 'No accounts found'}
                    </p>

                    <button
                      onClick={() => {
                        setEditingRecord(null);
                        setIsAddModalOpen(true);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isBn ? 'লোন অ্যাকাউন্ট যোগ করুন' : 'Add Loan Account'}
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account, index) => {
                  const loan = account.loanRecord;

                  const isLoan = account.source === 'LOAN';
                  const isActive = account.status === 'ACTIVE';
                  const isClosed = account.status === 'CLOSED';
                  const isOverdue =
                    account.status === 'OVERDUE' ||
                    account.status === 'DEFAULTED';

                  return (
                    <tr
                      key={`${account.source}-${account.id}`}
                      className={`transition-colors ${
                        isDark
                          ? 'hover:bg-slate-800/70'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* # */}
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      {/* Account & Customer */}
                      <td className="py-3 px-4 min-w-[220px]">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {account.accountTitle}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {account.customerName}
                        </div>
                      </td>

                      {/* Account Number */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          <span>{account.accountNumber}</span>

                          <button
                            onClick={() =>
                              handleCopy(
                                account.accountNumber,
                                `acc-${account.source}-${account.id}`
                              )
                            }
                            aria-label={`Copy account number ${account.accountNumber}`}
                            title="Copy Account No"
                            className="text-slate-400 hover:text-amber-500 cursor-pointer ml-0.5"
                          >
                            {copiedId ===
                            `acc-${account.source}-${account.id}` ? (
                              <Check
                                className="w-3 h-3 text-emerald-500"
                                aria-hidden="true"
                              />
                            ) : (
                              <Copy
                                className="w-2.5 h-2.5"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                            account.source === 'LOAN'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : account.source === 'CHEQUE'
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                              : account.source === 'CARD'
                              ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                              : account.isOutsideOutlet
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          }`}
                        >
                          {account.category}
                        </span>
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {account.mobileNumber || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : isClosed
                              ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'
                              : isOverdue
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                          }`}
                        >
                          {account.status}
                        </span>
                      </td>

                      {/* Outlet */}
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {account.isOutsideOutlet ? (
                          <span className="font-bold text-rose-500">
                            {isBn ? 'বাহিরের অ্যাকাউন্ট' : 'External'}
                          </span>
                        ) : (
                          account.outletName || '—'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isLoan && loan ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                handleQuickStatusChange(
                                  loan,
                                  isActive ? 'CLOSED' : 'ACTIVE'
                                )
                              }
                              title={
                                isActive
                                  ? 'Mark as Closed / Settled'
                                  : 'Reactivate Loan'
                              }
                              className={`px-2 py-1 rounded-lg border text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                                isActive
                                  ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>
                                {isActive
                                  ? isBn
                                    ? 'ক্লোজ'
                                    : 'Close'
                                  : isBn
                                  ? 'এক্টিভ'
                                  : 'Active'}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingRecord(loan);
                                setIsAddModalOpen(true);
                              }}
                              title="Edit loan file"
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isDark
                                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingRecord(loan)}
                              title="Delete loan file"
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            {isBn ? 'শুধু দেখুন' : 'View only'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Loan Add/Edit Modal */}
      <LoanAccountModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={(data) => {
          if (editingRecord) {
            updateLoanRecord({
              ...editingRecord,
              ...data
            });
          } else {
            addLoanRecord(data);
          }
        }}
        initialData={editingRecord}
        isDark={isDark}
        isBn={isBn}
      />

      {/* 6. Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black">
              {isBn ? 'লোন ফাইলটি মুছে ফেলতে চান?' : 'Delete Loan Record?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? `আপনি কি নিশ্চিতভাবে "${deletingRecord.accountTitle}" (Acc: ${deletingRecord.loanAccountNumber}) এর লোন ফাইলটি মুছে ফেলতে চান?`
                : `Are you sure you want to remove the loan record for "${deletingRecord.accountTitle}"? This cannot be undone.`}
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                onClick={() => setDeletingRecord(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteLoanRecord(deletingRecord.id);
                  setDeletingRecord(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
