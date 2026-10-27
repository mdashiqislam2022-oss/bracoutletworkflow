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
  ArrowRightLeft,
  Eye
} from 'lucide-react';
import { LoanAccountRecord, LoanStatus } from '../../types';
import { LoanAccountModal } from './LoanAccountModal';
import { OutletAccountModal } from './OutletAccountModal';

type UnifiedAccount = {
  source:
    | 'LOAN'
    | 'CHEQUE'
    | 'CARD'
    | 'CUSTOMER'
    | 'SAVINGS'
    | 'CURRENT';
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
    allAccountId?: string;
  sourceTable?: string;

  // Outlet Account Details
  accountSchemeCode?: string;
  accountHolderName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  sameAddress?: boolean;
  openingDate?: string;
};
export const LoanAccountDetailsView: React.FC = () => {
  const {
    loanRecords,
    chequeCardEntries,
    customerAccounts,
        allAccounts,
        addOutletAccount,
    updateOutletAccount,
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
 const [showAccountTypePopup, setShowAccountTypePopup] = useState(false);
const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);
   const [editingRecord, setEditingRecord] = useState<LoanAccountRecord | null>(null);

  // Retail Account Edit
  const [editingRetailAccount, setEditingRetailAccount] =
    useState<UnifiedAccount | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<LoanAccountRecord | null>(null);
   const [copiedId, setCopiedId] = useState<string | null>(null);

      const [selectedOutletAccount, setSelectedOutletAccount] =
     useState<UnifiedAccount | null>(null);

   // Account Edit Confirmation
   const [accountPendingEdit, setAccountPendingEdit] =
     useState<UnifiedAccount | null>(null);
  // Find cheque and card records for the selected account
  const selectedAccountChequeCardRecords = useMemo(() => {
    if (!selectedOutletAccount) return [];

    const accountNumber = selectedOutletAccount.accountNumber
      .trim()
      .toLowerCase();

    if (!accountNumber) return [];

    return chequeCardEntries.filter((entry) => {
      const entryAccountNumber = entry.accountNumber
        .trim()
        .toLowerCase();

      return (
        entryAccountNumber === accountNumber &&
        entry.outletId === selectedOutletAccount.outletId
      );
    });
  }, [selectedOutletAccount, chequeCardEntries]);

  // Overview Counts & Financial Math
    const unifiedAccounts = useMemo<UnifiedAccount[]>(() => {
  const accounts: UnifiedAccount[] = [];

  allAccounts
    .filter(
      (account) =>
        !currentUser || account.outletId === currentUser.outletId
    )
    .forEach((account) => {
      accounts.push({
        source:
          account.accountType === 'LOAN'
            ? 'LOAN'
            : account.accountType === 'CHEQUE'
            ? 'CHEQUE'
            : account.accountType === 'DEBIT_CARD' ||
              account.accountType === 'CREDIT_CARD'
            ? 'CARD'
            : account.accountType === 'SAVINGS'
            ? 'SAVINGS'
            : 'CURRENT',
        id: account.id,
        accountNumber: account.accountNumber,
        accountTitle: account.accountTitle,
        customerName:
          account.customerName || account.accountTitle || 'Customer',
        mobileNumber: account.mobileNumber || '',
        category:
          account.category ||
          account.accountType,
        status: account.status || 'ACTIVE',
        outletId: account.outletId,
        outletName: account.outletName,
        createdAt: account.createdAt,
                loanAmount: account.loanAmount,
        monthlyInstallment: account.monthlyInstallment,
        disbursementDate: account.disbursementDate,
        interestRate: account.interestRate,
        loanTenureYears: account.loanTenureYears,

        loanRecord:
          account.accountType === 'LOAN'
            ? loanRecords.find(
                (loan) =>
                  loan.accountNumber.trim().toLowerCase() ===
                    account.accountNumber.trim().toLowerCase() &&
                  loan.outletId === account.outletId
              )
            : undefined,

        isOutsideOutlet: account.isOutsideOutlet,
        allAccountId: account.id,
        sourceTable: account.sourceTable,

        // Outlet Account Details
        accountSchemeCode: account.accountSchemeCode,
        accountHolderName: account.accountHolderName,
        presentAddress: account.presentAddress,
        permanentAddress: account.permanentAddress,
        sameAddress: account.sameAddress,
        openingDate: account.openingDate
      });
    });

  /*
   * Same account number may exist in multiple source tables.
   * All Accounts page must show it only once.
   */
  const uniqueAccounts = new Map<string, UnifiedAccount>();

  accounts.forEach((account) => {
    const normalizedAccountNumber =
      account.accountNumber.trim().toLowerCase();

    if (!normalizedAccountNumber) {
      uniqueAccounts.set(
        `${account.source}-${account.id}`,
        account
      );
      return;
    }

    if (!uniqueAccounts.has(normalizedAccountNumber)) {
      uniqueAccounts.set(
        normalizedAccountNumber,
        account
      );
    }
  });

  return Array.from(uniqueAccounts.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}, [allAccounts, currentUser, loanRecords]);
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
  if (filteredAccounts.length === 0) {
    alert(
      isBn
        ? 'এক্সপোর্ট করার জন্য কোনো অ্যাকাউন্ট ডাটা নেই।'
        : 'No account records to export.'
    );
    return;
  }

  const headers = [
    'Account Type',
    'Account Number',
    'Account Title',
    'Customer Name',
    'Mobile Number',
    'Category',
    'Status',
    'Outlet Name',
    'Created At',
    'Loan Amount (BDT)',
    'Monthly Installment (BDT)',
    'Disbursement Date',
    'Interest Rate (%)',
    'Tenure (Years)',
    'Outside Outlet'
  ];

  const rows = filteredAccounts.map((account) => [
    `"${account.source.replace(/"/g, '""')}"`,
    `"${account.accountNumber.replace(/"/g, '""')}"`,
    `"${account.accountTitle.replace(/"/g, '""')}"`,
    `"${account.customerName.replace(/"/g, '""')}"`,
    `"${account.mobileNumber.replace(/"/g, '""')}"`,
    `"${account.category.replace(/"/g, '""')}"`,
    `"${account.status.replace(/"/g, '""')}"`,
    `"${account.outletName.replace(/"/g, '""')}"`,
    `"${account.createdAt}"`,
    account.loanAmount ?? '',
    account.monthlyInstallment ?? '',
    account.disbursementDate ?? '',
    account.interestRate ?? '',
    account.loanTenureYears ?? '',
    account.isOutsideOutlet ? 'Yes' : 'No'
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');

  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `All_Accounts_Registry_${new Date().toISOString().split('T')[0]}.csv`
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setToast({
    message: isBn
      ? 'সকল অ্যাকাউন্টের CSV রিপোর্ট ডাউনলোড সম্পন্ন!'
      : 'All Accounts CSV export completed!',
    type: 'success'
  });
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
                setShowAccountTypePopup(true);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isBn ? 'অ্যাকাউন্ট যোগ করুন' : 'Add Account'}</span>
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
  accountFilter === 'LOAN' && statusFilter === 'ALL'
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
    onClick={() => {
      setAccountFilter(filterKey === 'ALL' ? 'ALL' : 'LOAN');
      setStatusFilter(filterKey);
    }}
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

                        {/* Account Title */}
                        <div className="font-bold text-slate-900 dark:text-white">
                          {account.accountTitle}
                        </div>

                        {/* Account Holder Name - Hide duplicate */}
                        {(() => {
                          const holderName = (
                            account.accountHolderName ||
                            account.customerName ||
                            ''
                          ).trim();

                          const accountTitle = (
                            account.accountTitle || ''
                          ).trim();

                          if (
                            !holderName ||
                            holderName.toLowerCase() === accountTitle.toLowerCase()
                          ) {
                            return null;
                          }

                          return (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {holderName}
                            </div>
                          );
                        })()}

                        {/* Account Type */}
                        {account.source === 'LOAN' ? (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                              {isBn ? 'এসএমই লোন অ্যাকাউন্ট' : 'SME Loan Account'}
                            </span>
                          </div>
                        ) : account.sourceTable === 'manual_outlet_account' ? (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                              {isBn ? 'রিটেইল অ্যাকাউন্ট' : 'Retail Account'}
                            </span>
                          </div>
                        ) : null}

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

                        <div className="mt-1.5">
                          {account.source === 'LOAN' ? (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black">
    <Landmark size={11} />
    {isBn ? 'এসএমই লোন' : 'SME Loan'}
  </span>
) : account.sourceTable === 'manual_outlet_account' ? (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
    <Landmark size={11} />
    {isBn ? 'রিটেইল অ্যাকাউন্ট' : 'Retail Account'}
  </span>
) : null}
                        </div>
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
                        <div className="flex items-center justify-end gap-2">

                          {/* View Account Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedOutletAccount(account)}
                            title={isBn ? 'অ্যাকাউন্টের বিস্তারিত দেখুন' : 'View Account Details'}
                            aria-label={isBn ? 'অ্যাকাউন্টের বিস্তারিত দেখুন' : 'View Account Details'}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400'
                                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-600'
                            }`}
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit Account */}
                          <button
                            type="button"
                                                       onClick={() => {
                              setAccountPendingEdit(account);
                            }}
                            title={isBn ? 'অ্যাকাউন্ট এডিট করুন' : 'Edit Account'}
                            aria-label={isBn ? 'অ্যাকাউন্ট এডিট করুন' : 'Edit Account'}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
                                : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600'
                            }`}
                          >
                            <Edit3 size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
            {/* Account Edit Confirmation Popup */}
      {accountPendingEdit && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="account-edit-confirm-title"
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Edit3 size={22} />
              </div>

              <div>
                <h2
                  id="account-edit-confirm-title"
                  className="text-lg font-black"
                >
                  {isBn ? 'অ্যাকাউন্ট এডিট নিশ্চিত করুন' : 'Confirm Account Edit'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {accountPendingEdit.accountNumber}
                </p>
              </div>
            </div>

            <p className="text-sm font-medium mb-2">
              {isBn
                ? 'আপনি কি নিশ্চিত যে এই অ্যাকাউন্টটি এডিট করতে চান?'
                : 'Are you sure you want to edit this account?'}
            </p>

            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-6 break-words">
              {accountPendingEdit.accountTitle}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAccountPendingEdit(null)}
                className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const account = accountPendingEdit;

                  setAccountPendingEdit(null);

                  if (account.source === 'LOAN' && account.loanRecord) {
                    setEditingRecord(account.loanRecord);
                    setIsAddModalOpen(true);
                           } else if (account.sourceTable === 'manual_outlet_account') {
            setEditingRetailAccount(account);
            setIsOutletModalOpen(true);
          } else {
            setToast({
              message: isBn
                ? 'এই অ্যাকাউন্টের এডিট ফর্ম এখনো উপলব্ধ নয়।'
                : 'The edit form for this account is not available yet.',
              type: 'info'
            });
          }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors"
              >
                <Edit3 size={15} />
                {isBn ? 'হ্যাঁ, এডিট করুন' : 'Yes, Edit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outlet Account Entry Modal */}
            <OutletAccountModal
        isOpen={isOutletModalOpen}
        onClose={() => {
          setIsOutletModalOpen(false);
          setEditingRetailAccount(null);
        }}
        initialData={
          editingRetailAccount
            ? {
                accountTitle: editingRetailAccount.accountTitle || '',
                accountNumber: editingRetailAccount.accountNumber || '',
                mobileNumber: editingRetailAccount.mobileNumber || '',
                accountType: editingRetailAccount.accountSchemeCode || '',
                accountHolderName:
                  editingRetailAccount.accountHolderName ||
                  editingRetailAccount.customerName ||
                  '',
                presentAddress: editingRetailAccount.presentAddress || '',
                permanentAddress: editingRetailAccount.permanentAddress || '',
                sameAddress: editingRetailAccount.sameAddress || false,
                openingDate: editingRetailAccount.openingDate || ''
              }
            : null
        }
                 onSubmit={async (data) => {
          if (editingRetailAccount) {
            const success = await updateOutletAccount(
              editingRetailAccount.id,
              data
            );

            if (success) {
              setIsOutletModalOpen(false);
              setEditingRetailAccount(null);
            }

            return;
          }

          addOutletAccount(data);
          setIsOutletModalOpen(false);
        }}
        isDark={isDark}
        isBn={isBn}
      />
            {/* Outlet Account Details Popup */}
      {selectedOutletAccount && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">

          <div
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
              isDark
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-900'
            }`}
          >

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-500/15 bg-inherit">

              <div>
                                <h2 className="text-lg font-black">
                  {selectedOutletAccount.source === 'LOAN'
                    ? (isBn ? 'এসএমই লোন অ্যাকাউন্টের বিস্তারিত' : 'SME Loan Account Details')
                    : selectedOutletAccount.sourceTable === 'manual_outlet_account'
                    ? (isBn ? 'রিটেইল অ্যাকাউন্টের বিস্তারিত' : 'Retail Account Details')
                    : (isBn ? 'অ্যাকাউন্টের সম্পূর্ণ বিস্তারিত' : 'Complete Account Details')}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {isBn
                    ? 'নির্বাচিত অ্যাকাউন্টের সংরক্ষিত তথ্য'
                    : 'Saved information for the selected account'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOutletAccount(null)}
                className="p-2 rounded-xl hover:bg-slate-500/10"
                aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X size={20} />
              </button>

            </div>

            {/* Account Information */}
            <div className="p-6 space-y-4">

              {[
                {
                  label: isBn ? 'অ্যাকাউন্টের শিরোনাম' : 'Account Title',
                  value: selectedOutletAccount.accountTitle
                },
                {
                  label: isBn ? 'অ্যাকাউন্ট নম্বর' : 'Account Number',
                  value: selectedOutletAccount.accountNumber
                },
                {
                  label: isBn ? 'মোবাইল নম্বর' : 'Mobile Number',
                  value: selectedOutletAccount.mobileNumber
                },
                                {
                  label: isBn ? 'অ্যাকাউন্টের ধরন' : 'Account Type',
                  value: (() => {
                    const schemeNames: Record<string, string> = {
                      SBA: 'Savings Bank Account',
                      CAA: 'Current Account - Agent/Individual',
                      SPPRB: 'Savings Probashi Poribar Remittance Beneficiary',
                      ABSAD: 'Agent Banking Savings Account - Digital',
                      ABSDN: 'Agent Banking Savings Deposit Normal',
                      SRPPT: 'Savings Remittance Probashi Poribar TARA',
                      SRTHM: 'Savings Remittance TARA Homemaker',
                      CSTUG: 'Current Account - SME TARA Uddokta Group',
                      SRPPR: 'Savings Remittance Probashi Poribar Receiver'
                    };

                    const code =
                      selectedOutletAccount.accountSchemeCode ||
                      selectedOutletAccount.category;

                    return schemeNames[code]
                      ? `${code} — ${schemeNames[code]}`
                      : code;
                  })()
                },
                {
                  label: isBn ? 'অ্যাকাউন্টধারীর নাম' : 'Account Holder Name',
                  value: selectedOutletAccount.accountHolderName ||
                    selectedOutletAccount.customerName
                },
                {
                  label: isBn ? 'বর্তমান ঠিকানা' : 'Present Address',
                  value: selectedOutletAccount.presentAddress
                },
                {
                  label: isBn ? 'স্থায়ী ঠিকানা' : 'Permanent Address',
                  value: selectedOutletAccount.permanentAddress
                },
                {
                  label: isBn ? 'দুই ঠিকানা একই' : 'Same Address',
                  value: selectedOutletAccount.sameAddress
                    ? (isBn ? 'হ্যাঁ' : 'Yes')
                    : (isBn ? 'না' : 'No')
                },
                {
                  label: isBn ? 'অ্যাকাউন্ট খোলার তারিখ' : 'Opening Date',
                  value: selectedOutletAccount.openingDate
                },
                                {
                  label: isBn ? 'আউটলেট' : 'Outlet',
                  value: selectedOutletAccount.outletName
                },

                ...(selectedOutletAccount.source === 'LOAN'
                  ? [
                      {
                        label: isBn ? 'লোনের পরিমাণ' : 'Loan Amount',
                        value:
                          selectedOutletAccount.loanAmount != null
                            ? `৳${selectedOutletAccount.loanAmount.toLocaleString()}`
                            : '—'
                      },
                      {
                        label: isBn ? 'মাসিক কিস্তি (EMI)' : 'Monthly EMI',
                        value:
                          selectedOutletAccount.monthlyInstallment != null
                            ? `৳${selectedOutletAccount.monthlyInstallment.toLocaleString()}`
                            : '—'
                      },
                      {
                        label: isBn ? 'সুদের হার' : 'Interest Rate',
                        value:
                          selectedOutletAccount.interestRate != null
                            ? `${selectedOutletAccount.interestRate}%`
                            : '—'
                      },
                      {
                        label: isBn ? 'লোনের মেয়াদ' : 'Loan Tenure',
                        value:
                          selectedOutletAccount.loanTenureYears != null
                            ? `${selectedOutletAccount.loanTenureYears} ${
                                isBn ? 'বছর' : 'Years'
                              }`
                            : '—'
                      },
                      {
                        label: isBn ? 'বিতরণের তারিখ' : 'Disbursement Date',
                        value: selectedOutletAccount.disbursementDate || '—'
                      }
                    ]
                  : []),

                {
                  label: isBn ? 'অ্যাকাউন্টের অবস্থা' : 'Account Status',
                  value: selectedOutletAccount.status
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 p-3 rounded-xl ${
                    isDark ? 'bg-slate-800/70' : 'bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </span>

                                    <span className="text-sm font-bold break-words sm:text-right">
                    {item.value || '—'}
                  </span>
                </div>
              ))}

              {/* Cheque & Card Details */}
              <div className="pt-4 border-t border-slate-500/20">
                <h3 className="text-base font-black mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-sky-500" />
                  {isBn
                    ? 'চেক, কার্ড ও ডেলিভারি তথ্য'
                    : 'Cheque, Card & Delivery Details'}
                </h3>

                {selectedAccountChequeCardRecords.length === 0 ? (
                  <div
                    className={`p-4 rounded-xl text-center text-xs ${
                      isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {isBn
                      ? 'এই অ্যাকাউন্টের কোনো চেক বা কার্ডের তথ্য পাওয়া যায়নি।'
                      : 'No cheque or card records found for this account.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAccountChequeCardRecords.map((entry) => (
                      <div
                        key={`${entry.type}-${entry.id}`}
                        className={`p-4 rounded-2xl border ${
                          isDark
                            ? 'bg-slate-800/70 border-slate-700'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-black ${
                              entry.type === 'CHEQUE'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-purple-500/10 text-purple-500'
                            }`}
                          >
                            {entry.type === 'CHEQUE'
                              ? (isBn ? 'চেক বই' : 'Cheque Book')
                              : (isBn ? 'ডেবিট কার্ড' : 'Debit Card')}
                          </span>

                          <span className="text-[11px] font-bold text-emerald-500">
                            {entry.status}
                          </span>
                        </div>

                        {[
                          {
                            label: isBn ? 'অ্যাকাউন্ট নম্বর' : 'Account Number',
                            value: entry.accountNumber
                          },
                          {
                            label: isBn ? 'মোবাইল নম্বর' : 'Mobile Number',
                            value: entry.mobileNumber
                          },
                          {
                            label: isBn ? 'গ্রহণের তারিখ' : 'Received Date',
                            value: entry.receivedDate
                          },
                          ...(entry.type === 'CHEQUE'
                            ? [
                                {
                                  label: isBn ? 'চেক পাতার সংখ্যা' : 'Cheque Leaves',
                                  value: String(entry.leafCount)
                                },
                                {
                                  label: isBn ? 'প্রথম চেক নম্বর' : 'Start Cheque Number',
                                  value: entry.startCchNumber
                                },
                                {
                                  label: isBn ? 'শেষ চেক নম্বর' : 'End Cheque Number',
                                  value: entry.endCchNumber
                                }
                              ]
                            : [
                                {
                                  label: isBn ? 'কার্ডের নাম' : 'Card Name',
                                  value: entry.cardName
                                },
                                {
                                  label: isBn ? 'কার্ডের ধরন' : 'Card Type',
                                  value: entry.cardType || '—'
                                }
                              ]),
                          {
                            label: isBn ? 'ডেলিভারি স্ট্যাটাস' : 'Delivery Status',
                            value:
                              entry.status === 'DELIVERED_TO_CUSTOMER'
                                ? (isBn ? 'গ্রাহককে প্রদান করা হয়েছে' : 'Delivered to Customer')
                                : entry.status === 'RECEIVED'
                                ? (isBn ? 'আউটলেটে গ্রহণ করা হয়েছে' : 'Received at Outlet')
                                : entry.status
                          },
                          {
                            label: isBn ? 'ডেলিভারির তারিখ' : 'Delivery Date',
                            value: entry.deliveredAt || '—'
                          },
                          {
                            label: isBn ? 'মন্তব্য' : 'Notes',
                            value: entry.notes || '—'
                          }
                        ].map((detail, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-slate-500/10 last:border-0"
                          >
                            <span className="text-xs text-slate-500">
                              {detail.label}
                            </span>

                            <span className="text-xs font-bold break-words sm:text-right">
                              {detail.value || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-4 border-t border-slate-500/15 bg-inherit">
              <button
                type="button"
                onClick={() => setSelectedOutletAccount(null)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black transition-colors"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Loan Add/Edit Modal */}
            {showAccountTypePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">

          <div className={`w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 ${
            isDark
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-900'
          }`}>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black">
                  {isBn ? 'অ্যাকাউন্টের ধরন নির্বাচন করুন' : 'Select Account Type'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {isBn
                    ? 'আপনি কোন ধরনের অ্যাকাউন্ট যোগ করতে চান?'
                    : 'Which type of account would you like to add?'}
                </p>
              </div>

              <button
                onClick={() => setShowAccountTypePopup(false)}
                className="p-2 rounded-full hover:bg-slate-500/10"
                aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* SME Loan Account */}
              <button
                type="button"
                onClick={() => {
                  setShowAccountTypePopup(false);
                  setEditingRecord(null);
                  setIsAddModalOpen(true);
                }}
                className={`text-left p-5 rounded-2xl border-2 transition-all hover:border-amber-500 hover:shadow-lg ${
                  isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-amber-50/50 border-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4">
                  <Landmark size={25} className="text-amber-500" />
                </div>

                <h3 className="font-black text-sm mb-2">
                  {isBn ? 'এসএমই লোন অ্যাকাউন্ট' : 'SME Loan Account'}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {isBn
                    ? 'লোনের পরিমাণ, EMI, সুদের হার ও মেয়াদসহ নতুন লোন যোগ করুন।'
                    : 'Add a loan with amount, EMI, interest rate and tenure.'}
                </p>
              </button>

              {/* Outlet Account */}
              <button
                type="button"
                onClick={() => {
  setShowAccountTypePopup(false);
  setIsOutletModalOpen(true);
}}
                className={`text-left p-5 rounded-2xl border-2 transition-all hover:border-emerald-500 hover:shadow-lg ${
                  isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-emerald-50/50 border-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                  <Layers size={25} className="text-emerald-500" />
                </div>

                <h3 className="font-black text-sm mb-2">
                  {isBn ? 'আউটলেট অ্যাকাউন্ট' : 'Outlet Account'}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {isBn
                    ? 'সেভিংস, কারেন্ট ও অন্যান্য আউটলেট অ্যাকাউন্ট যোগ করুন।'
                    : 'Add savings, current and other outlet accounts.'}
                </p>
              </button>

            </div>

            <button
              onClick={() => setShowAccountTypePopup(false)}
              className={`w-full mt-6 py-3 rounded-xl text-sm font-bold ${
                isDark
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isBn ? 'বাতিল করুন' : 'Cancel'}
            </button>

          </div>
        </div>
      )}
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
