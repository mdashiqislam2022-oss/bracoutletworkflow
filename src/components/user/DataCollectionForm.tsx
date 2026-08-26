import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Building2,
  BookOpen,
  CreditCard,
  UserCheck,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';
import { ServiceCategory, SubmissionStatus } from '../../types';
import { ReceiptModal } from './ReceiptModal';

export const DataCollectionForm: React.FC = () => {
  const { currentUser, submitWorkData, setActiveNavTab } = useApp();

  const [category, setCategory] = useState<ServiceCategory>('CHEQUE_BOOK_DISPATCH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNid, setCustomerNid] = useState('');
  const [accountOrCardNumber, setAccountOrCardNumber] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('RECEIVED_AT_OUTLET');
  const [notes, setNotes] = useState('');

  // Category specific fields
  const [chequeBookSeries, setChequeBookSeries] = useState('CB-2026-');
  const [chequeLeavesCount, setChequeLeavesCount] = useState<number>(25);
  const [cardType, setCardType] = useState('VISA Platinum Debit');
  const [cardExpiryMonthYear, setCardExpiryMonthYear] = useState('12/29');
  const [kycDocumentType, setKycDocumentType] = useState('NID & Utility Bill');
  const [customerSignatureCaptured, setCustomerSignatureCaptured] = useState(true);

  const [justSubmitted, setJustSubmitted] = useState<any | null>(null);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || !accountOrCardNumber) {
      alert('Please fill in all mandatory customer fields.');
      return;
    }

    const payload = {
      serviceCategory: category,
      customerName,
      customerPhone,
      customerNid: customerNid || '1990269201928374',
      accountOrCardNumber,
      status,
      notes,
      chequeBookSeries: category === 'CHEQUE_BOOK_DISPATCH' ? chequeBookSeries : undefined,
      chequeLeavesCount: category === 'CHEQUE_BOOK_DISPATCH' ? chequeLeavesCount : undefined,
      cardType: category === 'DEBIT_CREDIT_CARD' ? cardType : undefined,
      cardExpiryMonthYear: category === 'DEBIT_CREDIT_CARD' ? cardExpiryMonthYear : undefined,
      kycDocumentType:
        category === 'ACCOUNT_OPENING_DOCS' || category === 'LOAN_KYC_VERIFICATION'
          ? kycDocumentType
          : undefined,
      customerSignatureCaptured
    };

    const newSub = submitWorkData(payload);
    setJustSubmitted(newSub);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerNid('');
    setAccountOrCardNumber('');
    setNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F6F8] text-slate-700 border border-slate-200 uppercase tracking-wider">
            Daily Field Intake
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Outlet Work Data Collection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recording at <strong>{currentUser.outletName}</strong> by Officer <strong>{currentUser.fullName}</strong>
          </p>
        </div>

        <button
          onClick={() => setActiveNavTab('dashboard')}
          className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          View Dashboard ↗
        </button>
      </div>

      {/* Main Clean Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6">
        
        {/* Step 1: Banking Category Pill Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
            1. Select Banking Product / Service Category:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'CHEQUE_BOOK_DISPATCH', label: 'Cheque Book', icon: BookOpen, desc: 'Requisitions & Leaves' },
              { id: 'DEBIT_CREDIT_CARD', label: 'Cards Dispatch', icon: CreditCard, desc: 'Debit / Credit / Prepaid' },
              { id: 'ACCOUNT_OPENING_DOCS', label: 'Account KYC', icon: UserCheck, desc: 'Savings / Current Forms' },
              { id: 'LOAN_KYC_VERIFICATION', label: 'Loan / Remit KYC', icon: ShieldCheck, desc: 'SME / Retail Verification' }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = category === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCategory(item.id as ServiceCategory)}
                  className={`p-4 rounded-[20px] text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#18181B] text-white border-black shadow-xs'
                      : 'bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 border-slate-200/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[#D4F63D]' : 'text-slate-400'}`} />
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Customer Identity Details */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            2. Customer Identification & Contact:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Mohammad Tanvir Alam"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Customer Mobile Phone *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+880 1711-XXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Account Number or Card / Tracking Serial *
              </label>
              <input
                type="text"
                required
                value={accountOrCardNumber}
                onChange={(e) => setAccountOrCardNumber(e.target.value)}
                placeholder="e.g. 1501204892019001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Customer NID / Smart Card Number
              </label>
              <input
                type="text"
                value={customerNid}
                onChange={(e) => setCustomerNid(e.target.value)}
                placeholder="10 or 17 digit NID"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Dynamic Category Details */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            3. Specific Package & Document Details:
          </label>

          {category === 'CHEQUE_BOOK_DISPATCH' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cheque Book Series Prefix
                </label>
                <input
                  type="text"
                  value={chequeBookSeries}
                  onChange={(e) => setChequeBookSeries(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Leaf Count
                </label>
                <select
                  value={chequeLeavesCount}
                  onChange={(e) => setChequeLeavesCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 focus:outline-none font-semibold"
                >
                  <option value={20}>20 Leaves (Personal Savings)</option>
                  <option value={25}>25 Leaves (Standard)</option>
                  <option value={50}>50 Leaves (Current / SME)</option>
                  <option value={100}>100 Leaves (Corporate)</option>
                </select>
              </div>
            </div>
          )}

          {category === 'DEBIT_CREDIT_CARD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Card Product Type
                </label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 focus:outline-none font-semibold"
                >
                  <option value="VISA Platinum Debit">VISA Platinum Debit</option>
                  <option value="Mastercard World Debit">Mastercard World Debit</option>
                  <option value="VISA Signature Credit">VISA Signature Credit</option>
                  <option value="UnionPay Prepaid">UnionPay Prepaid</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  value={cardExpiryMonthYear}
                  onChange={(e) => setCardExpiryMonthYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>
          )}

          {(category === 'ACCOUNT_OPENING_DOCS' || category === 'LOAN_KYC_VERIFICATION') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Primary KYC Verification Document
                </label>
                <input
                  type="text"
                  value={kycDocumentType}
                  onChange={(e) => setKycDocumentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer Signature Status
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerSignatureCaptured}
                    onChange={(e) => setCustomerSignatureCaptured(e.target.checked)}
                    className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">Physical / Biometric Signature Verified</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Status & Notes */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Initial Handover Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 focus:outline-none font-semibold"
            >
              <option value="RECEIVED_AT_OUTLET">Received at Outlet</option>
              <option value="VERIFIED_AND_APPROVED">Verified & Approved</option>
              <option value="DELIVERED_TO_CUSTOMER">Delivered to Customer</option>
              <option value="IN_TRANSIT_TO_HUB">In Transit to Regional Hub</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Field Remarks & Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer provided fresh utility copy"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/60 text-xs text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-transform active:scale-98 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4F63D]" />
            <span>Generate & Submit Official AFO Slip</span>
          </button>
        </div>
      </form>

      {justSubmitted && (
        <ReceiptModal
          submission={justSubmitted}
          onClose={() => setJustSubmitted(null)}
        />
      )}
    </div>
  );
};
