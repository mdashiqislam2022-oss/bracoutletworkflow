import React from 'react';
import { ChequeCardEntry, ChequeBookRecord, DebitCardRecord } from '../../types';

interface PrintableSlipSectionProps {
  entry: ChequeCardEntry | null;
}

export const PrintableSlipSection: React.FC<PrintableSlipSectionProps> = ({ entry }) => {
  if (!entry) return null;

  return (
    <div id="printable-slip-section" className="hidden">
      <div className="max-w-2xl mx-auto p-6 border-2 border-black rounded-xl font-sans text-black bg-white">
        {/* Slip Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h2 className="text-xl font-black uppercase tracking-wider">BRAC BANK PLC</h2>
          <p className="text-xs font-bold text-gray-700">SME & Branch Banking Operations</p>
          <h3 className="text-sm font-black mt-2 underline uppercase">
            {entry.type === 'CHEQUE'
              ? 'OFFICIAL CHEQUE BOOK CONSIGNMENT & DELIVERY SLIP'
              : 'OFFICIAL DEBIT CARD DELIVERY & RECEIPT VOUCHER'}
          </h3>
          <div className="flex justify-between text-xs mt-2 font-mono">
            <span>
              VOUCHER ID: <strong>{entry.id}</strong>
            </span>
            <span>
              PRINT DATE: <strong>{new Date().toLocaleString('en-GB')}</strong>
            </span>
          </div>
        </div>

        {/* Slip Details Table */}
        <table className="w-full border-collapse border border-black text-xs mb-4">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 w-1/3 border-r border-black">Customer Name / Title:</td>
              <td className="p-2 font-black text-sm">
                {entry.type === 'CHEQUE'
                  ? (entry as ChequeBookRecord).accountTitle
                  : (entry as DebitCardRecord).cardName}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 border-r border-black">Account Number:</td>
              <td className="p-2 font-mono font-bold">{entry.accountNumber}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 border-r border-black">Customer Mobile:</td>
              <td className="p-2 font-mono font-bold">{entry.mobileNumber}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 border-r border-black">Station Outlet:</td>
              <td className="p-2 font-bold">{entry.outletName}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 border-r border-black">Recorded By (AFO):</td>
              <td className="p-2 font-bold">{entry.userName}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 border-r border-black">Received on Station:</td>
              <td className="p-2 font-mono font-bold">{entry.receivedDate}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 border-r border-black">Status / Handover Details:</td>
              <td className="p-2 font-mono font-black">
                {entry.status === 'DELIVERED_TO_CUSTOMER'
                  ? `DELIVERED ON: ${entry.deliveryDate || entry.receivedDate}`
                  : entry.status === 'DESTROYED_EXPIRED'
                  ? `DESTROYED ON: ${entry.destroyedAt || 'Recorded'} (Validity 90+d SOP)`
                  : 'IN VAULT (PENDING CUSTOMER COLLECTION)'}
              </td>
            </tr>
            {entry.status === 'DESTROYED_EXPIRED' && entry.destructionReason && (
              <tr className="border-b border-black">
                <td className="p-2 font-bold bg-gray-100 border-r border-black">Destruction SOP Reason:</td>
                <td className="p-2 text-rose-700 italic font-semibold">{entry.destructionReason}</td>
              </tr>
            )}
            <tr className="border-b border-black">
              <td className="p-2 font-bold bg-gray-100 border-r border-black">Asset Specifications:</td>
              <td className="p-2 font-mono">
                {entry.type === 'CHEQUE'
                  ? `Cheque Book: ${(entry as ChequeBookRecord).leafCount} Leaves | CCH Range: ${(entry as ChequeBookRecord).startCchNumber} to ${(entry as ChequeBookRecord).endCchNumber}`
                  : `Debit Card: ${(entry as DebitCardRecord).cardType || 'VISA Contactless Debit'}`}
              </td>
            </tr>
            {entry.notes && (
              <tr>
                <td className="p-2 font-bold bg-gray-100 border-r border-black">Special Remarks:</td>
                <td className="p-2 italic">{entry.notes}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Acknowledgment declaration */}
        <p className="text-[10px] text-gray-700 mb-8 leading-relaxed">
          * I hereby confirm that I have received/processed the aforementioned banking asset in accordance with BRAC Bank Station Asset Vault standard operating procedures.
        </p>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div>
            <div className="border-t border-black pt-1 font-bold">
              {entry.status === 'DESTROYED_EXPIRED'
                ? 'Supervisor / Audit Officer Witness'
                : 'Customer / Recipient Signature'}
            </div>
            <div className="text-[10px] text-gray-600">Date: ________________________</div>
          </div>
          <div>
            <div className="border-t border-black pt-1 font-bold">Authorized Station Officer Seal & Sign</div>
            <div className="text-[10px] text-gray-600">{entry.userName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
