import React, { useState } from 'react';
import { X, Landmark, Save } from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';

export interface OutletAccountFormData {
  accountTitle: string;
  accountNumber: string;
  mobileNumber: string;
  accountType: string;
  accountHolderName: string;
  presentAddress: string;
  permanentAddress: string;
  sameAddress: boolean;
  openingDate: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OutletAccountFormData) => void;
  isDark: boolean;
  isBn: boolean;
}

const SCHEMES = [
  ['SBA', 'Savings Bank Account'],
  ['CAA', 'Current Account - Agent/Individual'],
  ['SPPRB', 'Savings Probashi Poribar Remittance Beneficiary'],
  ['ABSAD', 'Agent Banking Savings Account - Digital'],
  ['ABSDN', 'Agent Banking Savings Deposit Normal'],
  ['SRPPT', 'Savings Remittance Probashi Poribar TARA'],
  ['SRTHM', 'Savings Remittance TARA Homemaker'],
  ['CSTUG', 'Current Account - SME TARA Uddokta Group'],
  ['SRPPR', 'Savings Remittance Probashi Poribar Receiver']
];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const emptyForm = (): OutletAccountFormData => ({
  accountTitle: '',
  accountNumber: '',
  mobileNumber: '',
  accountType: '',
  accountHolderName: '',
  presentAddress: '',
  permanentAddress: '',
  sameAddress: false,
  openingDate: today()
});

export const OutletAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  isDark,
  isBn
}) => {
  const [form, setForm] = useState<OutletAccountFormData>(emptyForm);

  if (!isOpen) return null;

  const update = (key: keyof OutletAccountFormData, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      if (key === 'presentAddress' && prev.sameAddress) {
        next.permanentAddress = value as string;
      }

      if (key === 'sameAddress' && value === true) {
        next.permanentAddress = prev.presentAddress;
      }

      return next;
    });
  };

  const textOnly = (value: string) =>
    value.replace(/[^\p{L}\p{M}\s.'-]/gu, '');

  const numberOnly = (value: string) =>
    value.replace(/\D/g, '');

  const inputClass = `w-full px-3 py-2.5 rounded-xl border outline-none text-sm ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-white'
      : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  const labelClass = 'block text-xs font-bold mb-1.5';

  const fields = [
    {
      key: 'accountTitle',
      en: 'Account Title',
      bn: 'অ্যাকাউন্টের শিরোনাম',
      numeric: false
    },
    {
      key: 'accountNumber',
      en: 'Account Number',
      bn: 'অ্যাকাউন্ট নম্বর',
      numeric: true
    },
    {
      key: 'mobileNumber',
      en: 'Mobile Number',
      bn: 'মোবাইল নম্বর',
      numeric: true
    },
    {
      key: 'accountHolderName',
      en: 'Account Holder Name',
      bn: 'অ্যাকাউন্টধারীর নাম',
      numeric: false
    }
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...form,
      permanentAddress: form.sameAddress
        ? form.presentAddress
        : form.permanentAddress
    };

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-3 sm:p-5">

      <div className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-slate-500/15">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/15">
              <Landmark className="text-emerald-500" size={22} />
            </div>

            <div>
              <h2 className="text-lg font-black">
                {isBn ? 'নতুন আউটলেট অ্যাকাউন্ট' : 'New Outlet Account'}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {isBn
                  ? 'অ্যাকাউন্টের বিস্তারিত তথ্য পূরণ করুন'
                  : 'Enter outlet account details'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-500/10"
            aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          id="outlet-account-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-5"
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.slice(0, 3).map(field => (
              <div key={field.key}>
                <label className={labelClass}>
                  {isBn ? field.bn : field.en} *
                </label>

                <input
                  required
                  className={inputClass}
                  type="text"
                  inputMode={field.numeric ? 'numeric' : 'text'}
                  value={form[field.key]}
                  onChange={e =>
                    update(
                      field.key,
                      field.numeric
                        ? numberOnly(e.target.value)
                        : textOnly(e.target.value)
                    )
                  }
                />
              </div>
            ))}

            <div>
              <label className={labelClass}>
                {isBn ? 'অ্যাকাউন্টের ধরন' : 'Account Type'} *
              </label>

              <select
                required
                className={inputClass}
                value={form.accountType}
                onChange={e => update('accountType', e.target.value)}
              >
                <option value="">
                  {isBn ? 'ধরন নির্বাচন করুন' : 'Select account type'}
                </option>

                {SCHEMES.map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} — {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                {isBn ? 'অ্যাকাউন্টধারীর নাম' : 'Account Holder Name'} *
              </label>

              <input
                required
                className={inputClass}
                value={form.accountHolderName}
                onChange={e =>
                  update('accountHolderName', textOnly(e.target.value))
                }
              />
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-slate-500/15 pt-5 space-y-4">

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sameAddress}
                onChange={e =>
                  update('sameAddress', e.target.checked)
                }
                className="w-4 h-4 accent-emerald-500"
              />

              <span className="text-sm font-semibold">
                {isBn
                  ? 'বর্তমান ও স্থায়ী ঠিকানা একই'
                  : 'Present and permanent addresses are the same'}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelClass}>
                  {isBn ? 'বর্তমান ঠিকানা' : 'Present Address'} *
                </label>

                <textarea
                  required
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={form.presentAddress}
                  onChange={e =>
                    update('presentAddress', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  {isBn ? 'স্থায়ী ঠিকানা' : 'Permanent Address'} *
                </label>

                <textarea
                  required
                  rows={3}
                  disabled={form.sameAddress}
                  className={`${inputClass} resize-none ${
                    form.sameAddress
                      ? 'opacity-45 cursor-not-allowed bg-slate-500/15'
                      : ''
                  }`}
                  value={form.sameAddress
                    ? form.presentAddress
                    : form.permanentAddress}
                  onChange={e =>
                    update('permanentAddress', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Opening Date */}
          <div className="border-t border-slate-500/15 pt-5">
            <CustomDatePicker
              value={form.openingDate}
              onChange={date => update('openingDate', date)}
              label={isBn ? 'অ্যাকাউন্ট খোলার তারিখ' : 'Account Opening Date'}
              isDark={isDark}
              required
            />
          </div>

        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 sm:px-7 py-4 border-t border-slate-500/15">

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="submit"
            form="outlet-account-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600"
          >
            <Save size={16} />
            {isBn ? 'অ্যাকাউন্ট সংরক্ষণ করুন' : 'Save Account'}
          </button>

        </div>
      </div>
    </div>
  );
};
