import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Landmark,
  ArrowRightLeft,
  Vault,
  Building2,
  ChevronDown,
  History,
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SegregationTransactionType, DenominationCounts } from '../../types';

const CASH_IN_TYPES: SegregationTransactionType[] = ['CD', 'ID', 'LR', 'BC'];

export const TotalCashAnalysisView: React.FC = () => {
    const {
    outlets,
    segregationRecords,
    motherAmounts,
    outletTransfers,
    outletVaults,
    cashTransfers,
    addMotherAmount,
    addOutletTransfer,
    addOutletVault,
    userPreferences
  } = useApp();

  const isDark = userPreferences.theme === 'dark';
  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const [viewOutlet, setViewOutlet] = useState('ALL');
  const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
    const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historyDatePickerOpen, setHistoryDatePickerOpen] = useState(false);
  const [historyCalendarMonth, setHistoryCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [historyMonthDropdownOpen, setHistoryMonthDropdownOpen] = useState(false);
  const [historyYearDropdownOpen, setHistoryYearDropdownOpen] = useState(false);
  const historyMonthNamesList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const historyYearOptionsList = Array.from({ length: 20 }, (_, i) => 2020 + i);

  const [motherOutlet, setMotherOutlet] = useState('');
    const [motherOutletDropdownOpen, setMotherOutletDropdownOpen] = useState(false);
  const [motherAmountInput, setMotherAmountInput] = useState('');
  const [motherNote, setMotherNote] = useState('');
    const [motherAmountSign, setMotherAmountSign] = useState<'+' | '-'>('+');

  const [transferOutlet, setTransferOutlet] = useState('');
  const [transferAmountInput, setTransferAmountInput] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const [vaultOutlet, setVaultOutlet] = useState('');
  const [vaultAmountInput, setVaultAmountInput] = useState('');
  const [vaultNote, setVaultNote] = useState('');

  // ---------- Helper calculations ----------
  const getLatestMotherAmount = (outletId: string) => {
    const list = motherAmounts
      .filter((m) => m.outletId === outletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0] || null;
  };

  const getLatestVault = (outletId: string) => {
    const list = outletVaults
      .filter((v) => v.outletId === outletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0] || null;
  };

  const getTotalTransfer = (outletId: string) => {
    return outletTransfers.filter((t) => t.outletId === outletId).reduce((sum, t) => sum + t.amount, 0);
  };

              const getAfoCash = (outletId: string) => {
    const net = segregationRecords
      .filter((r) => {
        const effectiveId = r.crossOutletDirection === 'THERE' && r.crossOutletId ? r.crossOutletId : r.outletId;
        return effectiveId === outletId;
      })
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
    return net - rtgsOut - transferOut + transferIn;
  };

  const relevantOutlets = useMemo(() => {
    return viewOutlet === 'ALL' ? outlets : outlets.filter((o) => o.id === viewOutlet);
  }, [outlets, viewOutlet]);
  
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

      const denomTotals = useMemo(() => {
    const relevantIds = relevantOutlets.map((o) => o.id);
    const totals: Record<string, number> = {
      note1: 0, note2: 0, note5: 0, note10: 0, note20: 0,
      note50: 0, note100: 0, note200: 0, note500: 0, note1000: 0
    };
       segregationRecords
      .filter((r) => {
        const effectiveId = r.crossOutletDirection === 'THERE' && r.crossOutletId ? r.crossOutletId : r.outletId;
        return relevantIds.includes(effectiveId);
      })
      .forEach((r) => {
        const sign = CASH_IN_TYPES.includes(r.transactionType) ? 1 : -1;
        DENOM_LIST.forEach((d) => {
          totals[d.key] += sign * (r.denominations?.[d.key] || 0);
        });
      });
       cashTransfers
      .filter((t) => relevantIds.includes(t.outletId) && t.transferType === 'RTGS' && t.denominations)
      .forEach((t) => {
        DENOM_LIST.forEach((d) => {
          totals[d.key] -= t.denominations?.[d.key] || 0;
        });
      });
    cashTransfers
      .filter((t) => t.transferType === 'TRANSFER_TO_OUTLET' && t.denominations)
      .forEach((t) => {
        if (relevantIds.includes(t.outletId)) {
          DENOM_LIST.forEach((d) => {
            totals[d.key] -= t.denominations?.[d.key] || 0;
          });
        }
        if (t.destinationOutletId && relevantIds.includes(t.destinationOutletId)) {
          DENOM_LIST.forEach((d) => {
            totals[d.key] += t.denominations?.[d.key] || 0;
          });
        }
      });
    return totals;
  }, [segregationRecords, cashTransfers, relevantOutlets]);
            const totals = useMemo(() => {
    let mother = 0;
    let afoCash = 0;
    let transfer = 0;
    let moveMoney = 0;
    let receivedFromOutlet = 0;
    relevantOutlets.forEach((o) => {
      mother += getLatestMotherAmount(o.id)?.amount || 0;
      afoCash += getAfoCash(o.id);
      transfer += getTotalTransfer(o.id);
      moveMoney += cashTransfers
        .filter((t) => t.outletId === o.id && t.transferType === 'MOVE_MONEY')
        .reduce((sum, t) => sum + t.amount, 0);
      receivedFromOutlet += cashTransfers
        .filter((t) => t.destinationOutletId === o.id && t.transferType === 'TRANSFER_TO_OUTLET')
        .reduce((sum, t) => sum + t.amount, 0);
    });
        const vault = afoCash - transfer;
    return { mother, afoCash, transfer, vault, receivedFromOutlet };
  }, [relevantOutlets, motherAmounts, outletTransfers, segregationRecords, cashTransfers]);
  const selectedOutletName = viewOutlet === 'ALL' ? 'All Outlets' : outlets.find((o) => o.id === viewOutlet)?.name || 'All Outlets';

  // ---------- Combined History (latest 15) ----------
         const combinedHistory = useMemo(() => {
        const items = [
      ...motherAmounts.map((m) => ({ ...m, kind: 'Mother Amount' as const })),
      ...outletTransfers.map((t) => ({ ...t, kind: 'Transfer' as const })),
      ...cashTransfers
        .filter((t) => t.transferType === 'RTGS')
        .map((t) => ({ ...t, setByUserName: t.userName, kind: 'RTGS Transfer' as const })),
      ...cashTransfers
        .filter((t) => t.transferType === 'TRANSFER_TO_OUTLET')
        .map((t) => ({ ...t, setByUserName: t.userName, kind: 'Transfer to Outlet' as const }))
    ];
    const scoped =
      viewOutlet === 'ALL'
        ? items
        : items.filter((i) => i.outletId === viewOutlet || (i as any).destinationOutletId === viewOutlet);
    return scoped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15);
    }, [motherAmounts, outletTransfers, outletVaults, cashTransfers, viewOutlet]);

  const currentMotherForSelectedOutlet = useMemo(() => {
    if (!motherOutlet) return 0;
    return motherAmounts
      .filter((m) => m.outletId === motherOutlet)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.amount || 0;
    }, [motherAmounts, motherOutlet]);

  const getPreviousMotherAmount = (record: { outletId: string; createdAt: string }): number => {
    const prior = motherAmounts
      .filter((m) => m.outletId === record.outletId && new Date(m.createdAt).getTime() < new Date(record.createdAt).getTime())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return prior?.amount || 0;
  };

  const getMotherAmountReasonTag = (note?: string): string => {
    if (!note) return 'Manual';
    if (note.startsWith('Manual added')) return 'Manual +';
    if (note.startsWith('Manual subtracted')) return 'Manual −';
    if (note.includes('CD transaction')) return 'CD';
    if (note.includes('CW transaction')) return 'CW';
    if (note.includes('ID transaction')) return 'ID';
    if (note.includes('LD transaction')) return 'LD';
    if (note.includes('LR transaction')) return 'LR';
    if (note.includes('BC transaction')) return 'BC';
    if (note.includes('Move Money')) return 'Move Money';
    if (note.includes('RTGS')) return 'RTGS';
    if (note.includes('Cross-outlet')) return 'Cross-Outlet';
    return 'Adjustment';
  };

  // ---------- Handlers ----------
    const handleSetMother = () => {
    const amt = parseFloat(motherAmountInput);
    if (!motherOutlet || isNaN(amt) || amt <= 0) return;
    const newTotal = motherAmountSign === '+'
      ? currentMotherForSelectedOutlet + amt
      : currentMotherForSelectedOutlet - amt;
    addMotherAmount({
      outletId: motherOutlet,
      amount: newTotal,
      note: `Manual ${motherAmountSign === '+' ? 'added' : 'subtracted'} ৳${amt}${motherNote.trim() ? ' — ' + motherNote.trim() : ''}`
    });
    setMotherAmountInput('');
    setMotherNote('');
  };

  const handleAddTransfer = () => {
    const amt = parseFloat(transferAmountInput);
    if (!transferOutlet || isNaN(amt) || amt <= 0) return;
    addOutletTransfer({ outletId: transferOutlet, amount: amt, note: transferNote.trim() || undefined });
    setTransferAmountInput('');
    setTransferNote('');
  };

  const handleSetVault = () => {
    const amt = parseFloat(vaultAmountInput);
    if (!vaultOutlet || isNaN(amt) || amt < 0) return;
    addOutletVault({ outletId: vaultOutlet, amount: amt, note: vaultNote.trim() || undefined });
    setVaultAmountInput('');
    setVaultNote('');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <h2 className={`font-bold text-lg flex items-center gap-2 mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <Wallet className="text-emerald-500" size={20} /> Total Cash Analysis
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Outlet-wise vault reconciliation — Mother Amount, live AFO cash-in-hand, transfers, and vault balance.
        </p>

        {/* Outlet Filter */}
        <div className="relative mb-4 max-w-sm">
          <button
            onClick={() => setOutletDropdownOpen((v) => !v)}
            className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold ${inputBg}`}
          >
            <span className="flex items-center gap-2 truncate">
              <Building2 size={15} className="text-emerald-500 shrink-0" /> {selectedOutletName}
            </span>
            <ChevronDown size={15} className="text-slate-400 shrink-0" />
          </button>
          {outletDropdownOpen && (
            <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-lg max-h-64 overflow-y-auto ${cardBg}`}>
              <button
                onClick={() => { setViewOutlet('ALL'); setOutletDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${viewOutlet === 'ALL' ? 'text-emerald-500' : ''}`}
              >
                All Outlets
              </button>
              {outlets.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { setViewOutlet(o.id); setOutletDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${viewOutlet === o.id ? 'text-emerald-500' : ''}`}
                >
                  {o.name} {o.code ? `(${o.code})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4 Summary Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
              <ArrowRightLeft size={13} /> Total Amount Received From Outlet
            </div>
            <div className="text-lg font-extrabold mt-1 text-amber-600">৳ {totals.receivedFromOutlet.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border p-3 border-purple-500/40 bg-purple-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600">
              <Vault size={13} /> Total Vault Amount
            </div>
                        <div className="text-lg font-extrabold mt-1 text-purple-600">৳ {totals.vault.toLocaleString()}</div>
          </div>
        </div>

        {/* Denomination-wise Note Count (Outlet scoped) */}
        <div className="mb-6">
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

                       {/* Update Forms */}
        <div className="grid grid-cols-1 mb-6">
                   {/* Set Mother Amount */}
          <div className={`rounded-xl border p-3 space-y-2 max-w-md ${inputBg}`}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold flex items-center gap-1.5 text-blue-500">
                <PlusCircle size={14} /> Set Mother Amount
              </div>
                            <div className={`relative flex items-center rounded-lg border p-0.5 ${inputBg}`} style={{ width: '60px', height: '26px' }}>
                <div
                  className={`absolute top-0.5 bottom-0.5 left-0.5 w-[27px] rounded-md transition-all duration-300 ease-in-out ${
                    motherAmountSign === '-' ? 'translate-x-[27px] bg-red-500/15' : 'translate-x-0 bg-emerald-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMotherAmountSign('+')}
                  className={`relative z-10 w-1/2 h-full text-center text-xs font-extrabold rounded-md transition-colors ${
                    motherAmountSign === '+' ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setMotherAmountSign('-')}
                  className={`relative z-10 w-1/2 h-full text-center text-xs font-extrabold rounded-md transition-colors ${
                    motherAmountSign === '-' ? 'text-red-500' : 'text-slate-400'
                  }`}
                >
                  −
                </button>
              </div>
            </div>
                        <div className="relative">
              <button
                type="button"
                onClick={() => setMotherOutletDropdownOpen((v) => !v)}
                className={`w-full flex items-center justify-between rounded-lg border px-2 py-1.5 text-xs font-semibold ${inputBg}`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Building2 size={13} className="text-blue-500 shrink-0" />
                  {motherOutlet ? outlets.find((o) => o.id === motherOutlet)?.name : 'Select Outlet'}
                </span>
                <ChevronDown size={13} className="text-slate-400 shrink-0" />
              </button>
              {motherOutletDropdownOpen && (
                <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-lg max-h-56 overflow-y-auto ${cardBg}`}>
                  {outlets.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => { setMotherOutlet(o.id); setMotherOutletDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 ${motherOutlet === o.id ? 'text-emerald-500' : ''}`}
                    >
                      {o.name} {o.code ? `(${o.code})` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input type="number" min={0} value={motherAmountInput} onChange={(e) => setMotherAmountInput(e.target.value)} placeholder="Amount" className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`} />
            {motherOutlet && motherAmountInput && !isNaN(parseFloat(motherAmountInput)) && (
              <div className="text-[10px] font-semibold text-slate-500 px-1">
                Current: ৳{currentMotherForSelectedOutlet.toLocaleString()}
                {' '}→ New: ৳{(currentMotherForSelectedOutlet + (motherAmountSign === '+' ? 1 : -1) * parseFloat(motherAmountInput)).toLocaleString()}
              </div>
            )}
            <input value={motherNote} onChange={(e) => setMotherNote(e.target.value)} placeholder="Note (optional)" className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`} />
            <button onClick={handleSetMother} className="w-full py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold">Save Mother Amount</button>
          </div>
                  </div>


        {/* History */}
                <div>
          <div className="text-xs font-bold flex items-center gap-1.5 mb-2 text-slate-500">
            <History size={14} /> Recent History
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {combinedHistory.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-6">No history yet.</div>
            )}
                        {combinedHistory.map((h) => {
                           const hasDenoms = (h.kind === 'RTGS Transfer' || h.kind === 'Transfer to Outlet') && !!(h as any).denominations;
              const isOpen = expandedHistoryId === h.id;
              const motherTag = h.kind === 'Mother Amount' ? getMotherAmountReasonTag(h.note) : '';
              return (
                <div key={`${h.kind}-${h.id}`} className={`rounded-lg border ${inputBg}`}>
                  <button
                    type="button"
                    onClick={() => hasDenoms && setExpandedHistoryId(isOpen ? null : h.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[11px] text-left ${
                      hasDenoms ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                                       <div>
                      <span className="font-bold">{h.kind}</span> — {h.outletName}
                      {h.kind === 'Transfer to Outlet' && (h as any).destinationOutletName ? (
                        <span className="text-teal-600 font-semibold"> → {(h as any).destinationOutletName}</span>
                      ) : null}
                                            {h.kind === 'Mother Amount' ? (
                        <span className={`ml-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold align-middle ${
                          motherTag === 'CW' || motherTag === 'LD' ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {motherTag}
                        </span>
                      ) : (
                        h.note ? <span className="text-slate-500"> ({h.note})</span> : null
                      )}
                      {h.kind === 'Mother Amount' && (
                        <div className="text-slate-500">
                          Before: ৳{getPreviousMotherAmount(h).toLocaleString()} → After: ৳{h.amount.toLocaleString()}{' '}
                          <span className={h.amount >= getPreviousMotherAmount(h) ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                            ({h.amount >= getPreviousMotherAmount(h) ? '+' : ''}{(h.amount - getPreviousMotherAmount(h)).toLocaleString()})
                          </span>
                        </div>
                      )}
                      <div className="text-slate-500">{new Date(h.createdAt).toLocaleString()} · {h.setByUserName}</div>
                    </div>
                                       <div className={`font-extrabold ${h.kind === 'Mother Amount' ? (h.amount >= getPreviousMotherAmount(h) ? 'text-emerald-600' : 'text-red-500') : ''}`}>
                      {h.kind === 'Mother Amount' ? (h.amount >= getPreviousMotherAmount(h) ? '+ ' : '− ') : ''}৳ {h.amount.toLocaleString()}
                    </div>
                  </button>
                  {isOpen && hasDenoms && (
                    <div className="px-3 pb-2 pt-1 border-t border-slate-700/20">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
                        {DENOM_LIST.map((d) => (
                          <div key={d.key} className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1">
                            <span className="font-semibold">Tk{d.value}:</span> {(h as any).denominations?.[d.key] || 0}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
