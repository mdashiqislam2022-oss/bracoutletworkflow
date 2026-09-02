import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  X,
  Check,
  Wallet,
  Landmark,
  CreditCard,
  Users,
  Banknote,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
  Trash2,
  Tag,
  ChevronDown,
  Copy
} from 'lucide-react';
import { SegregationTransactionType } from '../../types';

type DenomKey = 'note1' | 'note2' | 'note5' | 'note10' | 'note20' | 'note50' | 'note100' | 'note200' | 'note500' | 'note1000';

const DENOM_LEFT: { key: DenomKey; value: number }[] = [
  { key: 'note1', value: 1 },
  { key: 'note2', value: 2 },
  { key: 'note5', value: 5 },
  { key: 'note10', value: 10 },
  { key: 'note20', value: 20 }
];
const DENOM_RIGHT: { key: DenomKey; value: number }[] = [
  { key: 'note50', value: 50 },
  { key: 'note100', value: 100 },
  { key: 'note200', value: 200 },
  { key: 'note500', value: 500 },
  { key: 'note1000', value: 1000 }
];

const TX_TYPES: { id: SegregationTransactionType; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'CD', label: 'Cash Deposit', short: 'Deposit', icon: ArrowDownCircle },
  { id: 'CW', label: 'Cash Withdraw', short: 'Withdraw', icon: ArrowUpCircle },
  { id: 'ID', label: 'Initial Deposit', short: 'Init', icon: Wallet },
  { id: 'LD', label: 'Loan Disbursement', short: 'Loan', icon: Banknote },
  { id: 'LR', label: 'Loan Repayment', short: 'Repay', icon: RefreshCcw }
];

// Charge Slabs — applicable only for CD (Cash Deposit) & CW (Cash Withdraw)
const CHARGE_SLABS: { min: number; max: number | null; amount?: number; percent?: number }[] = [
  { min: 1, max: 5000, amount: 10 },
  { min: 5001, max: 10000, amount: 20 },
  { min: 10001, max: 15000, amount: 25 },
  { min: 15001, max: 25000, amount: 50 },
  { min: 25001, max: 35000, amount: 70 },
  { min: 35001, max: 100000, amount: 100 },
  { min: 100001, max: 300000, amount: 200 },
  { min: 300001, max: null, percent: 0.001 }
];

const calculateSlabCharge = (amount: number): number => {
  if (amount <= 0) return 0;
  const slab = CHARGE_SLABS.find((s) => amount >= s.min && (s.max === null || amount <= s.max));
  if (!slab) return 0;
  if (slab.percent) return Math.round(amount * slab.percent);
  return slab.amount || 0;
};
const emptyDenoms = (): Record<DenomKey, number> => ({
  note1: 0, note2: 0, note5: 0, note10: 0, note20: 0,
  note50: 0, note100: 0, note200: 0, note500: 0, note1000: 0
});

interface UnifiedAccount {
  source: 'LOAN_ACCOUNT' | 'CHEQUE_CARD' | 'CUSTOMER_ACCOUNT';
  id: string;
  accountNumber: string;
  accountTitle: string;
  mobileNumber: string;
  categoryLabel: string;
}

export const DenominationSegregationView: React.FC = () => {
  const {
    currentUser,
    userPreferences,
    loanRecords,
    chequeCardEntries,
    customerAccounts,
    segregationRecords,
    addCustomerAccount,
    addSegregationRecord,
    showToast
  } = useApp();

  const isDark = userPreferences.theme === 'dark';

  // ---------- Calculator State ----------
  const [activeType, setActiveType] = useState<SegregationTransactionType>('CD');
  const [denoms, setDenoms] = useState<Record<DenomKey, number>>(emptyDenoms());
  const [chargeApplied, setChargeApplied] = useState(false);
  const [chargeAmount, setChargeAmount] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);

  // ---------- Account Search State ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTab, setSearchTab] = useState<'ALL' | 'SAVINGS' | 'LOAN' | 'CARDS'>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<UnifiedAccount | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustAccNo, setNewCustAccNo] = useState('');
  const [newCustTitle, setNewCustTitle] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustCategory, setNewCustCategory] = useState<'SAVINGS' | 'CURRENT'>('SAVINGS');

  // ---------- Derived: Totals ----------
  const totalReceivedAmount = useMemo(() => {
    return [...DENOM_LEFT, ...DENOM_RIGHT].reduce((sum, d) => sum + denoms[d.key] * d.value, 0);
  }, [denoms]);

  const totalPieces = useMemo(() => {
    return [...DENOM_LEFT, ...DENOM_RIGHT].reduce((sum, d) => sum + denoms[d.key], 0);
  }, [denoms]);

  const actualAmount = useMemo(() => {
    const chargeDeduction = chargeApplied ? chargeAmount : 0;
    return Math.max(0, totalReceivedAmount - returnAmount - chargeDeduction);
  }, [totalReceivedAmount, returnAmount, chargeApplied, chargeAmount]);

  // ---------- Derived: Top Summary Cards ----------
  const summaryByType = useMemo(() => {
    const scoped = segregationRecords.filter(
      (r) => !currentUser || r.userId === currentUser.id
    );
    const map: Record<SegregationTransactionType, { amount: number; count: number }> = {
      CD: { amount: 0, count: 0 },
      CW: { amount: 0, count: 0 },
      ID: { amount: 0, count: 0 },
      LD: { amount: 0, count: 0 },
      LR: { amount: 0, count: 0 }
    };
    scoped.forEach((r) => {
      map[r.transactionType].amount += r.actualAmount;
      map[r.transactionType].count += 1;
    });
    return map;
  }, [segregationRecords, currentUser]);

  // ---------- Derived: Unified Account Search Results ----------
  const searchResults = useMemo((): UnifiedAccount[] => {
    const term = searchTerm.trim().toLowerCase();
    let list: UnifiedAccount[] = [];

    if (searchTab === 'ALL' || searchTab === 'LOAN') {
      loanRecords
        .filter((l) => !currentUser || l.outletId === currentUser.outletId)
        .forEach((l) => {
          list.push({
            source: 'LOAN_ACCOUNT',
            id: l.id,
            accountNumber: l.loanAccountNumber,
            accountTitle: l.customerName,
            mobileNumber: l.mobileNumber,
            categoryLabel: 'LOAN ACCOUNT'
          });
        });
    }
    if (searchTab === 'ALL' || searchTab === 'CARDS') {
      chequeCardEntries
        .filter((c) => !currentUser || c.outletId === currentUser.outletId)
        .forEach((c: any) => {
          list.push({
            source: 'CHEQUE_CARD',
            id: c.id,
            accountNumber: c.accountNumber,
            accountTitle: c.accountTitle || c.cardName || 'Customer',
            mobileNumber: c.mobileNumber,
            categoryLabel: c.type === 'CHEQUE' ? 'CHEQUE BOOK' : 'DEBIT/CREDIT CARD'
          });
        });
    }
    if (searchTab === 'ALL' || searchTab === 'SAVINGS') {
      customerAccounts
        .filter((a) => !currentUser || a.outletId === currentUser.outletId)
        .forEach((a) => {
          list.push({
            source: 'CUSTOMER_ACCOUNT',
            id: a.id,
            accountNumber: a.accountNumber,
            accountTitle: a.accountTitle,
            mobileNumber: a.mobileNumber,
            categoryLabel: a.accountCategory
          });
        });
    }

    if (!term) return list.slice(0, 8);
    return list.filter(
      (a) =>
        a.accountNumber.toLowerCase().includes(term) ||
        a.accountTitle.toLowerCase().includes(term) ||
        a.mobileNumber.toLowerCase().includes(term)
    );
  }, [searchTerm, searchTab, loanRecords, chequeCardEntries, customerAccounts, currentUser]);

  // ---------- Handlers ----------
  const handleDenomChange = (key: DenomKey, value: string) => {
    const num = Math.max(0, parseInt(value || '0', 10) || 0);
    setDenoms((prev) => ({ ...prev, [key]: num }));
  };

  const handleClear = () => {
    setDenoms(emptyDenoms());
    setChargeApplied(false);
    setChargeAmount(0);
    setReturnAmount(0);
  };

  const handleAddCustomer = () => {
    if (!newCustAccNo.trim() || !newCustTitle.trim() || !newCustMobile.trim()) {
      showToast({ message: 'Account Number, Title and Mobile are required.', type: 'error' });
      return;
    }
    const created = addCustomerAccount({
      accountNumber: newCustAccNo,
      accountTitle: newCustTitle,
      mobileNumber: newCustMobile,
      accountCategory: newCustCategory
    });
    setSelectedAccount({
      source: 'CUSTOMER_ACCOUNT',
      id: created.id,
      accountNumber: created.accountNumber,
      accountTitle: created.accountTitle,
      mobileNumber: created.mobileNumber,
      categoryLabel: created.accountCategory
    });
    setNewCustAccNo('');
    setNewCustTitle('');
    setNewCustMobile('');
    setShowAddCustomer(false);
  };

  const handleSave = () => {
    if (!selectedAccount) {
      showToast({ message: 'Please select an account first.', type: 'error' });
      return;
    }
    if (totalReceivedAmount <= 0) {
      showToast({ message: 'Please enter at least one denomination count.', type: 'error' });
      return;
    }
    addSegregationRecord({
      transactionType: activeType,
      denominations: denoms,
      totalReceivedAmount,
      chargeApplied,
      chargeAmount: chargeApplied ? chargeAmount : 0,
      returnAmount,
      actualAmount,
      linkedAccountSource: selectedAccount.source,
      linkedAccountId: selectedAccount.id,
      accountNumber: selectedAccount.accountNumber,
      accountTitle: selectedAccount.accountTitle,
      customerName: selectedAccount.accountTitle,
      mobileNumber: selectedAccount.mobileNumber
    });
    handleClear();
    setSelectedAccount(null);
  };

  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TX_TYPES.map((tx) => (
          <div key={tx.id} className={`rounded-2xl border p-3 ${cardBg}`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <tx.icon size={14} /> {tx.id}
            </div>
            <div className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {tx.label}
            </div>
            <div className="text-lg font-extrabold mt-1 text-emerald-500">
              ৳ {summaryByType[tx.id].amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">{summaryByType[tx.id].count} Entries</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* LEFT: Denomination Calculator */}
        <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <Banknote size={18} className="text-emerald-500" /> Denomination Segregation Calculator
            </h3>
            <button onClick={handleClear} className="text-xs font-semibold text-rose-500 flex items-center gap-1">
              <Trash2 size={13} /> Clear
            </button>
          </div>

          {/* Transaction Type Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {TX_TYPES.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setActiveType(tx.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  activeType === tx.id
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : `${inputBg} text-slate-500`
                }`}
              >
                {tx.id} {tx.label}
              </button>
            ))}
          </div>

          {/* Denomination Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {DENOM_LEFT.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="text-xs w-10 font-semibold text-slate-500">Tk{d.value}</span>
                <input
                  type="number"
                  min={0}
                  value={denoms[d.key] || ''}
                  onChange={(e) => handleDenomChange(d.key, e.target.value)}
                  placeholder="0"
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${inputBg}`}
                />
                <span className="text-[11px] text-slate-500 w-16 text-right">
                  ৳{(denoms[d.key] * d.value).toLocaleString()}
                </span>
              </div>
            ))}
            {DENOM_RIGHT.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="text-xs w-12 font-semibold text-slate-500">Tk{d.value}</span>
                <input
                  type="number"
                  min={0}
                  value={denoms[d.key] || ''}
                  onChange={(e) => handleDenomChange(d.key, e.target.value)}
                  placeholder="0"
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${inputBg}`}
                />
                <span className="text-[11px] text-slate-500 w-16 text-right">
                  ৳{(denoms[d.key] * d.value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Charge & Return */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Apply Charge:</span>
            <button
              onClick={() => setChargeApplied(true)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                chargeApplied ? 'bg-amber-500 text-white' : `${inputBg} text-slate-500`
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => {
                setChargeApplied(false);
                setChargeAmount(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                !chargeApplied ? 'bg-rose-500 text-white' : `${inputBg} text-slate-500`
              }`}
            >
              No
            </button>
            {chargeApplied && (
              <input
                type="number"
                min={0}
                value={chargeAmount || ''}
                onChange={(e) => setChargeAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                placeholder="Charge Amount"
                className={`w-32 rounded-lg border px-2 py-1 text-xs ${inputBg}`}
              />
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-slate-500 w-28">Return Amount</span>
            <input
              type="number"
              min={0}
              value={returnAmount || ''}
              onChange={(e) => setReturnAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
              placeholder="0"
              className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${inputBg}`}
            />
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-xl border p-3 ${inputBg}`}>
              <div className="text-[11px] text-slate-500">TOTAL RCVD</div>
              <div className="text-lg font-extrabold">৳ {totalReceivedAmount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">{totalPieces} notes</div>
            </div>
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
              <div className="text-[11px] text-emerald-600 font-semibold">ACTUAL AMT</div>
              <div className="text-lg font-extrabold text-emerald-600">৳ {actualAmount.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-600">Net posted amount</div>
            </div>
          </div>

          {selectedAccount && (
            <div className={`rounded-xl border p-2.5 mb-3 flex items-center justify-between ${inputBg}`}>
              <div className="text-xs">
                <span className="font-bold">{selectedAccount.accountTitle}</span>
                <span className="text-slate-500"> — {selectedAccount.accountNumber}</span>
              </div>
              <button onClick={() => setSelectedAccount(null)} className="text-rose-500">
                <X size={14} />
              </button>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!selectedAccount || totalReceivedAmount <= 0}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save & Record Transaction
          </button>
        </div>

        {/* RIGHT: Account & Customer Search */}
        <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <Users size={18} className="text-emerald-500" /> Account & Customer Search
            </h3>
            <button
              onClick={() => setShowAddCustomer((v) => !v)}
              className="text-xs font-semibold text-emerald-500 flex items-center gap-1"
            >
              <Plus size={13} /> Add New Customer
            </button>
          </div>

          {showAddCustomer && (
            <div className={`rounded-xl border p-3 mb-3 space-y-2 ${inputBg}`}>
              <input
                value={newCustAccNo}
                onChange={(e) => setNewCustAccNo(e.target.value)}
                placeholder="Account Number"
                className={`w-full rounded-lg border px-2 py-1.5 text-sm ${inputBg}`}
              />
              <input
                value={newCustTitle}
                onChange={(e) => setNewCustTitle(e.target.value)}
                placeholder="Customer / Account Title"
                className={`w-full rounded-lg border px-2 py-1.5 text-sm ${inputBg}`}
              />
              <input
                value={newCustMobile}
                onChange={(e) => setNewCustMobile(e.target.value)}
                placeholder="Mobile Number"
                className={`w-full rounded-lg border px-2 py-1.5 text-sm ${inputBg}`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setNewCustCategory('SAVINGS')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    newCustCategory === 'SAVINGS' ? 'bg-emerald-500 text-white' : inputBg
                  }`}
                >
                  Savings
                </button>
                <button
                  onClick={() => setNewCustCategory('CURRENT')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    newCustCategory === 'CURRENT' ? 'bg-emerald-500 text-white' : inputBg
                  }`}
                >
                  Current
                </button>
              </div>
              <button
                onClick={handleAddCustomer}
                className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold"
              >
                Save Customer
              </button>
            </div>
          )}

          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Account No, Customer Name, Mobile..."
              className={`w-full rounded-lg border pl-9 pr-3 py-2 text-sm ${inputBg}`}
            />
          </div>

          <div className="flex gap-1.5 mb-3 flex-wrap">
            {[
              { id: 'ALL', label: 'All Accounts' },
              { id: 'SAVINGS', label: 'Savings/Current' },
              { id: 'LOAN', label: 'Loan Accounts' },
              { id: 'CARDS', label: 'Cards & Cheques' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                  searchTab === tab.id ? 'bg-emerald-500 text-white' : `${inputBg} text-slate-500`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {searchResults.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-6">No accounts found.</div>
            )}
            {searchResults.map((acc) => (
              <div
                key={`${acc.source}-${acc.id}`}
                className={`rounded-xl border p-2.5 flex items-center justify-between ${inputBg}`}
              >
                <div>
                  <div className="text-sm font-bold">{acc.accountNumber}</div>
                  <div className="text-[11px] text-slate-500">
                    {acc.categoryLabel} · {acc.accountTitle} · {acc.mobileNumber}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAccount(acc)}
                  className="text-xs font-bold text-emerald-500 flex items-center gap-1"
                >
                  <Check size={13} /> Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
