import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, Landmark, ArrowRightLeft, Vault } from 'lucide-react';
import { SegregationTransactionType, DenominationCounts } from '../../types';

const CASH_IN_TYPES: SegregationTransactionType[] = ['CD', 'ID', 'LR', 'BC'];

const DENOM_LIST: { key: keyof DenominationCounts; value: number }[] = [
  { key: 'note1', value: 1 },
  { key: 'note2', value: 2 },
  { key: 'note5', value: 5 },
  { key: 'note10', value: 10 },
  { key: 'note20', value: 20 },
  { key: 'note50', value: 50 },
  { key: 'note100', value: 100 },
  { key: 'note200', value: 200 },
  { key: 'note500', value: 500 },
  { key: 'note1000', value: 1000 }
];

interface OutletCashSummaryPanelProps {
  outletId: string;
  isDark: boolean;
}

export const OutletCashSummaryPanel: React.FC<OutletCashSummaryPanelProps> = ({ outletId, isDark }) => {
  const { segregationRecords, motherAmounts, outletTransfers, cashTransfers } = useApp();

  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';

  const totals = useMemo(() => {
    const mother =
      motherAmounts
        .filter((m) => m.outletId === outletId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.amount || 0;

    const net = segregationRecords
      .filter((r) => r.outletId === outletId)
      .reduce((sum, r) => sum + (CASH_IN_TYPES.includes(r.transactionType) ? r.actualAmount : -r.actualAmount), 0);

        const rtgsOut = cashTransfers
      .filter((t) => t.outletId === outletId && t.transferType === 'RTGS')
      .reduce((sum, t) => sum + t.amount, 0);

    const transferOut = cashTransfers
      .filter((t) => t.outletId === outletId && t.transferType === 'TRANSFER_TO_OUTLET')
      .reduce((sum, t) => sum + t.amount, 0);
    const transferIn = cashTransfers
      .filter((t) => t.destinationOutletId === outletId && t.transferType === 'TRANSFER_TO_OUTLET')
      .reduce((sum, t) => sum + t.amount, 0);

    const afoCash = net - rtgsOut - transferOut + transferIn;

    const transfer = outletTransfers
      .filter((t) => t.outletId === outletId)
      .reduce((sum, t) => sum + t.amount, 0);

    const moveMoney = cashTransfers
      .filter((t) => t.outletId === outletId && t.transferType === 'MOVE_MONEY')
      .reduce((sum, t) => sum + t.amount, 0);

        const vault = afoCash + moveMoney - transfer;

    return { mother, afoCash, transfer, vault };
  }, [outletId, motherAmounts, segregationRecords, outletTransfers, cashTransfers]);

  const denomTotals = useMemo(() => {
    const totalsMap: Record<string, number> = {
      note1: 0, note2: 0, note5: 0, note10: 0, note20: 0,
      note50: 0, note100: 0, note200: 0, note500: 0, note1000: 0
    };
    segregationRecords
      .filter((r) => r.outletId === outletId)
      .forEach((r) => {
        const sign = CASH_IN_TYPES.includes(r.transactionType) ? 1 : -1;
        DENOM_LIST.forEach((d) => {
          totalsMap[d.key] += sign * (r.denominations?.[d.key] || 0);
        });
      });
        cashTransfers
      .filter((t) => t.outletId === outletId && t.transferType === 'RTGS' && t.denominations)
      .forEach((t) => {
        DENOM_LIST.forEach((d) => {
          totalsMap[d.key] -= t.denominations?.[d.key] || 0;
        });
      });
    cashTransfers
      .filter((t) => t.transferType === 'TRANSFER_TO_OUTLET' && t.denominations)
      .forEach((t) => {
        if (t.outletId === outletId) {
          DENOM_LIST.forEach((d) => {
            totalsMap[d.key] -= t.denominations?.[d.key] || 0;
          });
        }
        if (t.destinationOutletId === outletId) {
          DENOM_LIST.forEach((d) => {
            totalsMap[d.key] += t.denominations?.[d.key] || 0;
          });
        }
      });
    return totalsMap;
  }, [outletId, segregationRecords, cashTransfers]);
  return (
    <div className="mb-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className={`rounded-xl border p-3 ${cardBg}`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Landmark size={13} /> Total Mother Amount
          </div>
          <div className="text-lg font-extrabold mt-1 text-blue-500">৳ {totals.mother.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border p-3 border-emerald-500/40 bg-emerald-500/10">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <Wallet size={13} /> Total AFO Cash Amount
          </div>
          <div className="text-lg font-extrabold mt-1 text-emerald-600">৳ {totals.afoCash.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border p-3 border-amber-500/40 bg-amber-500/10">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
            <ArrowRightLeft size={13} /> Total Transfer Amount
          </div>
          <div className="text-lg font-extrabold mt-1 text-amber-600">৳ {totals.transfer.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border p-3 border-purple-500/40 bg-purple-500/10">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600">
            <Vault size={13} /> Total Vault Amount
          </div>
          <div className="text-lg font-extrabold mt-1 text-purple-600">৳ {totals.vault.toLocaleString()}</div>
        </div>
      </div>

      <div className="text-xs font-bold text-slate-500 mb-2">Denomination-wise Note Count</div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {DENOM_LIST.map((d) => (
          <div key={d.key} className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[11px] font-semibold text-slate-500 mb-1">Tk{d.value}</div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              {denomTotals[d.key].toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              ৳ {(denomTotals[d.key] * d.value).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
