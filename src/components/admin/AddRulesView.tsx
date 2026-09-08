import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RichTextEditor } from '../common/RichTextEditor';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { ShieldCheck, Plus, X, Building2, Check, PlusCircle, Trash2 } from 'lucide-react';

const SECTORS = ['Cash Handling', 'Loan Operations', 'Cheque & Card', 'Customer Service', 'Compliance', 'General'];

export const AddRulesView: React.FC = () => {
   const { outlets, rules, addRule, updateRuleOutlets, deleteRule, userPreferences } = useApp();
  const isDark = userPreferences.theme === 'dark';

  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [ruleDate, setRuleDate] = useState(new Date().toISOString().slice(0, 10));
  const [contentHtml, setContentHtml] = useState('');
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);

  const [assignTargetRuleId, setAssignTargetRuleId] = useState<string | null>(null);
  const [assignOutlets, setAssignOutlets] = useState<string[]>([]);

  const toggleOutlet = (id: string) => {
    setSelectedOutlets((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  };

  const toggleAssignOutlet = (id: string) => {
    setAssignOutlets((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  };

  const handleSaveRule = () => {
    if (!title.trim() || !contentHtml.trim() || selectedOutlets.length === 0) return;
    addRule({ title: title.trim(), sector, contentHtml, ruleDate, outletIds: selectedOutlets });
    setTitle('');
    setContentHtml('');
    setSelectedOutlets([]);
    setRuleDate(new Date().toISOString().slice(0, 10));
    setShowAddForm(false);
  };

  const handleAssignMore = () => {
    if (!assignTargetRuleId || assignOutlets.length === 0) return;
    updateRuleOutlets(assignTargetRuleId, assignOutlets);
    setAssignTargetRuleId(null);
    setAssignOutlets([]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const sortedRules = [...rules].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <ShieldCheck className="text-emerald-500" size={20} /> Outlet Rules
          </h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold"
            >
              <Plus size={14} /> Add Rule
            </button>
          )}
        </div>

        {/* Add Rule Form */}
        {showAddForm && (
          <div className={`rounded-xl border p-4 mb-5 space-y-3 ${inputBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">New Rule</span>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400">
                <X size={16} />
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rule title"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputBg}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm ${inputBg}`}>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <CustomDatePicker value={ruleDate} onChange={setRuleDate} label="Rule Date" isDark={isDark} />
            </div>

            <RichTextEditor value={contentHtml} onChange={setContentHtml} placeholder="Write the rule details here..." isDark={isDark} />

            <div>
              <div className="text-xs font-bold mb-1.5 flex items-center gap-1.5">
                <Building2 size={13} /> Select Outlet(s) for this Rule
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {outlets.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => toggleOutlet(o.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 ${
                      selectedOutlets.includes(o.id) ? 'bg-emerald-500 text-white border-emerald-500' : inputBg
                    }`}
                  >
                    {selectedOutlets.includes(o.id) && <Check size={11} />} {o.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveRule}
              disabled={!title.trim() || !contentHtml.trim() || selectedOutlets.length === 0}
              className="w-full py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-40"
            >
              Save Rule
            </button>
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {sortedRules.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-10">No rules created yet.</div>
          )}
          {sortedRules.map((r) => (
            <div key={r.id} className={`rounded-xl border p-3 ${inputBg}`}>
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="text-sm font-bold">{r.title}</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  {r.sector}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{formatDate(r.ruleDate)}</div>
              <div className="text-sm mt-2 leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: r.contentHtml }} />

              <div className="mt-3 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-slate-500 mr-1">Applied to:</span>
                {r.outletIds.map((oid) => {
                  const o = outlets.find((x) => x.id === oid);
                  return (
                    <span key={oid} className={`text-[10px] px-2 py-0.5 rounded-full ${inputBg} border`}>
                      {o?.name || oid}
                    </span>
                  );
                })}
              </div>

              {assignTargetRuleId === r.id ? (
                <div className={`mt-3 rounded-lg border p-2.5 space-y-2 ${cardBg}`}>
                  <div className="text-[11px] font-bold">Assign this rule to more outlet(s):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {outlets
                      .filter((o) => !r.outletIds.includes(o.id))
                      .map((o) => (
                        <button
                          key={o.id}
                          onClick={() => toggleAssignOutlet(o.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 ${
                            assignOutlets.includes(o.id) ? 'bg-emerald-500 text-white border-emerald-500' : inputBg
                          }`}
                        >
                          {assignOutlets.includes(o.id) && <Check size={10} />} {o.name}
                        </button>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAssignTargetRuleId(null); setAssignOutlets([]); }}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${inputBg}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignMore}
                      disabled={assignOutlets.length === 0}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAssignTargetRuleId(r.id)}
                  className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-500"
                >
                  <PlusCircle size={12} /> Assign to another outlet
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
