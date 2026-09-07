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
  PlusCircle
} from 'lucide-react';
import { SegregationTransactionType } from '../../types';

const CASH_IN_TYPES: SegregationTransactionType[] = ['CD', 'ID', 'LR', 'BC'];

export const TotalCashAnalysisView: React.FC = () => {
  const {
    outlets,
    segregationRecords,
    motherAmounts,
    outletTransfers,
    outletVaults,
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

  const [motherOutlet, setMotherOutlet] = useState('');
  const [motherAmountInput, setMotherAmountInput] = useState('');
  const [motherNote, setMotherNote] = useState('');

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
      .filter((r) => r.outletId === outletId)
      .reduce((sum, r) => sum + (CASH_IN_TYPES.includes(r.transactionType) ? r.actualAmount : -r.actualAmount), 0);
    return net;
  };

  const relevantOutlets = useMemo(() => {
    return viewOutlet === 'ALL' ? outlets : outlets.filter((o) => o.id === viewOutlet);
  }, [outlets, viewOutlet]);

      const totals = useMemo(() => {
    let mother = 0;
    let afoCash = 0;
    let transfer = 0;
    relevantOutlets.forEach((o) => {
      mother += getLatestMotherAmount(o.id)?.amount || 0;
      afoCash += getAfoCash(o.id);
      transfer += getTotalTransfer(o.id);
    });
    const vault = mother + afoCash - transfer;
    return { mother, afoCash, transfer, vault };
  }, [relevantOutlets, motherAmounts, outletTransfers, segregationRecords]);

  const selectedOutletName = viewOutlet === 'ALL' ? 'All Outlets' : outlets.find((o) => o.id === viewOutlet)?.name || 'All Outlets';

  // ---------- Combined History (latest 15) ----------
  const combinedHistory = useMemo(() => {
        const items = [
      ...motherAmounts.map((m) => ({ ...m, kind: 'Mother Amount' as const })),
      ...outletTransfers.map((t) => ({ ...t, kind: 'Transfer' as const }))
    ];
    const scoped = viewOutlet === 'ALL' ? items : items.filter((i) => i.outletId === viewOutlet);
    return scoped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15);
  }, [motherAmounts, outletTransfers, outletVaults, viewOutlet]);

  // ---------- Handlers ----------
  const handleSetMother = () => {
    const amt = parseFloat(motherAmountInput);
    if (!motherOutlet || isNaN(amt) || amt < 0) return;
    addMotherAmount({ outletId: motherOutlet, amount: amt, note: motherNote.trim() || undefined });
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

                {/* Update Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Set Mother Amount */}
          <div className={`rounded-xl border p-3 space-y-2 ${inputBg}`}>
            <div className="text-xs font-bold flex items-center gap-1.5 text-blue-500">
              <PlusCircle size={14} /> Set Mother Amount
            </div>
            <select value={motherOutlet} onChange={(e) => setMotherOutlet(e.target.value)} className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}>
              <option value="">Select Outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input type="number" min={0} value={motherAmountInput} onChange={(e) => setMotherAmountInput(e.target.value)} placeholder="Amount" className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`} />
            <input value={motherNote} onChange={(e) => setMotherNote(e.target.value)} placeholder="Note (optional)" className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`} />
            <button onClick={handleSetMother} className="w-full py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold">Save Mother Amount</button>
          </div>

          {/* Add Transfer */}
          <div className={`rounded-xl border p-3 space-y-2 ${inputBg}`}>
            <div className="text-xs font-bold flex items-center gap-1.5 text-amber-600">
              <PlusCircle size={14} /> Add Transfer Entry
            </div>
            <select value={transferOutlet} onChange={(e) => setTransferOutlet(e.target.value)} className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`}>
              <option value="">Select Outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input type="number" min={0} value={transferAmountInput} onChange={(e) => setTransferAmountInput(e.target.value)} placeholder="Amount" className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`} />
            <input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Note (optional)" className={`w-full rounded-lg border px-2 py-1.5 text-xs ${inputBg}`} />
            <button onClick={handleAddTransfer} className="w-full py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold">Add Transfer</button>
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
            {combinedHistory.map((h) => (
              <div key={`${h.kind}-${h.id}`} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] ${inputBg}`}>
                <div>
                  <span className="font-bold">{h.kind}</span> — {h.outletName}
                  {h.note ? <span className="text-slate-500"> ({h.note})</span> : null}
                  <div className="text-slate-500">{new Date(h.createdAt).toLocaleString()} · {h.setByUserName}</div>
                </div>
                <div className="font-extrabold">৳ {h.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
