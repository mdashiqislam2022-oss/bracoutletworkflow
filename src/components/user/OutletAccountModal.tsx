import React, { useState } from 'react';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { X, Landmark, Save, ChevronDown, Check, Search } from 'lucide-react';


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
  signatureDataUrl?: string;
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
   const [isSchemeDropdownOpen, setIsSchemeDropdownOpen] = useState(false);

  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState('');

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

  // Signature JPG Upload: 300 x 100 pixels
  const handleSignatureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSignatureError('');

    if (
      file.type !== 'image/jpeg' ||
      !/\.jpe?g$/i.test(file.name)
    ) {
      setSignatureError(
        isBn
          ? 'শুধু JPG/JPEG ছবি আপলোড করুন।'
          : 'Only JPG/JPEG images are allowed.'
      );

      event.target.value = '';
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);

      if (image.width !== 300 || image.height !== 100) {
        setSignatureError(
          isBn
            ? 'Signature ছবির মাপ অবশ্যই 300 × 100 pixels হতে হবে।'
            : 'Signature image must be exactly 300 × 100 pixels.'
        );

        event.target.value = '';
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (typeof result === 'string') {
          setSignaturePreview(result);

          setForm(prev => ({
            ...prev,
            signatureDataUrl: result
          }));
        }
      };

      reader.onerror = () => {
        setSignatureError(
          isBn
            ? 'ছবি পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            : 'Unable to read the image. Please try again.'
        );
      };

      reader.readAsDataURL(file);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);

      setSignatureError(
        isBn
          ? 'ছবিটি সঠিক নয়। অন্য JPG ছবি নির্বাচন করুন।'
          : 'Invalid image. Please select another JPG file.'
      );

      event.target.value = '';
    };

    image.src = imageUrl;
  };

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

                        <div className="relative">
              <label className={labelClass}>
                {isBn ? 'অ্যাকাউন্টের ধরন' : 'Account Type'} *
              </label>

              <button
                type="button"
                onClick={() => setIsSchemeDropdownOpen(prev => !prev)}
                aria-expanded={isSchemeDropdownOpen}
                aria-haspopup="listbox"
                className={`w-full min-h-[42px] flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left text-sm transition-all ${
                  isSchemeDropdownOpen
                    ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                    : isDark
                      ? 'border-slate-700'
                      : 'border-slate-200'
                } ${
                  isDark
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-50 text-slate-900'
                }`}
              >
                <span className="flex-1 min-w-0 truncate">
                  {form.accountType ? (
                    <>
                      <span className="font-black text-emerald-500">
                        {form.accountType}
                      </span>
                      <span className="mx-1.5 text-slate-400">—</span>
                      <span>
                        {SCHEMES.find(
                          ([code]) => code === form.accountType
                        )?.[1]}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">
                      {isBn
                        ? 'অ্যাকাউন্টের ধরন নির্বাচন করুন'
                        : 'Select account type'}
                    </span>
                  )}
                </span>

                <ChevronDown
                  size={17}
                  className={`shrink-0 text-slate-400 transition-transform ${
                    isSchemeDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <input
                type="text"
                required
                value={form.accountType}
                onChange={() => {}}
                tabIndex={-1}
                aria-label="Selected account type"
                className="absolute w-px h-px opacity-0 pointer-events-none"
              />

              {isSchemeDropdownOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close account type dropdown"
                    onClick={() => setIsSchemeDropdownOpen(false)}
                    className="fixed inset-0 z-[115] cursor-default"
                  />

                  <div
                    role="listbox"
                    aria-label={isBn ? 'অ্যাকাউন্টের ধরন' : 'Account Type'}
                    className={`absolute left-0 right-0 top-full mt-2 z-[116] max-h-64 overflow-y-auto rounded-2xl border shadow-2xl p-1.5 ${
                      isDark
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {SCHEMES.map(([code, name]) => {
                      const selected = form.accountType === code;

                      return (
                        <button
                          key={code}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            update('accountType', code);
                            setIsSchemeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                            selected
                              ? 'bg-emerald-500/15'
                              : isDark
                                ? 'hover:bg-slate-700'
                                : 'hover:bg-emerald-50'
                          }`}
                        >
                          <span
                            className={`shrink-0 min-w-[55px] px-2 py-1.5 rounded-lg text-center text-[10px] font-black ${
                              selected
                                ? 'bg-emerald-500 text-white'
                                : 'bg-emerald-500/10 text-emerald-600'
                            }`}
                          >
                            {code}
                          </span>

                          <span className="flex-1 min-w-0 text-xs font-semibold leading-relaxed">
                            {name}
                          </span>

                          {selected && (
                            <Check
                              size={16}
                              className="shrink-0 text-emerald-500"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

                        {/* Account Holder Name */}
            <div className="min-w-0">
              <label className={labelClass}>
                {isBn ? 'অ্যাকাউন্টধারীর নাম' : 'Account Holder Name'} *
              </label>

              <input
                required
                type="text"
                className={inputClass}
                value={form.accountHolderName}
                onChange={e =>
                  update('accountHolderName', textOnly(e.target.value))
                }
              />
            </div>

                        {/* Account Opening Date */}
            <div className="min-w-0">
              <CustomDatePicker
                label={isBn ? 'অ্যাকাউন্ট খোলার তারিখ' : 'Account Opening Date'}
                value={form.openingDate}
                onChange={(date) => update('openingDate', date)}
                required
                isDark={isDark}
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
                  {isBn ? 'বর্তমান ঠিকানা' : 'Present Address'}
                  <span className="ml-2 text-[10px] font-medium text-slate-400">
                    ({isBn ? 'ঐচ্ছিক' : 'Optional'})
                  </span>
                </label>

                <textarea
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
                  {isBn ? 'স্থায়ী ঠিকানা' : 'Permanent Address'}
                  <span className="ml-2 text-[10px] font-medium text-slate-400">
                    ({isBn ? 'ঐচ্ছিক' : 'Optional'})
                  </span>
                </label>

                <textarea
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

          
                  {/* Signature Upload Section */}
          <div className="border-t border-slate-500/15 pt-5">

            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-black">
                  {isBn ? 'স্বাক্ষর আপলোড' : 'Signature Upload'}
                </label>

                <p className="text-xs text-slate-500 mt-1">
                  {isBn
                    ? 'ঐচ্ছিক • JPG ছবি • 300 × 100 pixels'
                    : 'Optional • JPG image • 300 × 100 pixels'}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black">
                {isBn ? 'ঐচ্ছিক' : 'Optional'}
              </span>
            </div>

            <input
              id="outlet-signature-upload"
              type="file"
              accept=".jpg,.jpeg,image/jpeg"
              onChange={handleSignatureUpload}
              className="hidden"
            />

            <label
              htmlFor="outlet-signature-upload"
              className={`flex flex-col items-center justify-center gap-3 min-h-[150px] p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-emerald-500 ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >

              {signaturePreview ? (
                <>
                  <div className="max-w-full overflow-hidden rounded-lg bg-white p-2 border border-slate-200">
                    <img
                      src={signaturePreview}
                      alt="Account holder signature"
                      width={300}
                      height={100}
                      className="block max-w-full h-auto object-contain"
                    />
                  </div>

                  <span className="text-xs font-bold text-emerald-500">
                    {isBn
                      ? 'স্বাক্ষর পরিবর্তন করতে ক্লিক করুন'
                      : 'Click to change signature'}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-emerald-500"
                    >
                      <path d="M12 16V4" />
                      <path d="m7 9 5-5 5 5" />
                      <path d="M4 16v4h16v-4" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-black">
                      {isBn
                        ? 'স্বাক্ষরের ছবি নির্বাচন করুন'
                        : 'Choose Signature Image'}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {isBn
                        ? 'ডিভাইস থেকে JPG ছবি নির্বাচন করতে ক্লিক করুন'
                        : 'Click to browse a JPG image from your device'}
                    </p>
                  </div>
                </>
              )}

            </label>

            {signatureError && (
              <p
                role="alert"
                className="mt-2 text-xs font-semibold text-red-500"
              >
                {signatureError}
              </p>
            )}

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
