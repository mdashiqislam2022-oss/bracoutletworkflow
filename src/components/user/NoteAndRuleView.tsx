import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RichTextEditor } from '../common/RichTextEditor';
import { CustomDatePicker } from '../common/CustomDatePicker';
import {
  StickyNote,
  ShieldCheck,
  Plus,
  Trash2,
  X,
  Calendar
} from 'lucide-react';

export const NoteAndRuleView: React.FC = () => {
  const { currentUser, notes, rules, addNote, deleteNote, userPreferences } = useApp();
  const isDark = userPreferences.theme === 'dark';

  const cardBg = isDark ? 'bg-[#1A2333] border-slate-800' : 'bg-white border-slate-200';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const [activeTab, setActiveTab] = useState<'NOTE' | 'RULES'>('NOTE');
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [noteDate, setNoteDate] = useState(new Date().toISOString().slice(0, 10));
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewNoteId, setViewNoteId] = useState<string | null>(null);

  const myNotes = useMemo(() => {
    return notes
      .filter((n) => !currentUser || n.userId === currentUser.id)
      .sort((a, b) => new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime());
  }, [notes, currentUser]);

  const myRules = useMemo(() => {
    return rules
      .filter((r) => currentUser && r.outletIds.includes(currentUser.outletId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rules, currentUser]);

  const handleSaveNote = () => {
    if (!title.trim() || !contentHtml.trim()) return;
    addNote({ title: title.trim(), contentHtml, noteDate });
    setTitle('');
    setContentHtml('');
    setNoteDate(new Date().toISOString().slice(0, 10));
    setShowAddForm(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`rounded-2xl border p-4 md:p-5 ${cardBg}`}>
        {/* Header with Tab Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {activeTab === 'NOTE' ? <StickyNote size={20} className="text-emerald-500" /> : <ShieldCheck size={20} className="text-emerald-500" />}
            {activeTab === 'NOTE' ? 'My Notes' : 'Outlet Rules'}
          </h2>

          <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-[#0F172A]' : 'bg-slate-100'}`}>
            <button
              onClick={() => setActiveTab('NOTE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'NOTE'
                  ? `${isDark ? 'bg-[#1A2333] text-slate-100' : 'bg-white text-slate-900'} shadow-sm`
                  : 'text-slate-400'
              }`}
            >
              Note
            </button>
            <button
              onClick={() => setActiveTab('RULES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'RULES'
                  ? `${isDark ? 'bg-[#1A2333] text-slate-100' : 'bg-white text-slate-900'} shadow-sm`
                  : 'text-slate-400'
              }`}
            >
              Rules
            </button>
          </div>
        </div>

        {/* ===================== NOTE TAB ===================== */}
        {activeTab === 'NOTE' && (
          <>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold mb-4"
              >
                <Plus size={14} /> Add Note
              </button>
            )}

            {showAddForm && (
              <div className={`rounded-xl border p-3 mb-4 space-y-3 ${inputBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">New Note</span>
                  <button onClick={() => setShowAddForm(false)} className="text-slate-400">
                    <X size={15} />
                  </button>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${inputBg}`}
                />
                <CustomDatePicker value={noteDate} onChange={setNoteDate} label="Note Date" isDark={isDark} />
                <RichTextEditor
                  value={contentHtml}
                  onChange={setContentHtml}
                  placeholder="Write your note here..."
                  isDark={isDark}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={!title.trim() || !contentHtml.trim()}
                  className="w-full py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-40"
                >
                  Save Note
                </button>
              </div>
            )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myNotes.length === 0 && (
                <div className="col-span-full text-sm text-slate-500 text-center py-10">No notes yet. Add your first note above.</div>
              )}
              {myNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setViewNoteId(n.id)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${inputBg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">{n.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> {formatDate(n.noteDate)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTargetId(n.id); }}
                      className="text-rose-500 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div
                    className="text-sm mt-2 leading-relaxed break-words line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: n.contentHtml }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===================== RULES TAB (Read-only) ===================== */}
        {activeTab === 'RULES' && (
          <div className="space-y-3">
            {myRules.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-10">No rules have been set for your outlet yet.</div>
            )}
            {myRules.map((r) => (
              <div key={r.id} className={`rounded-xl border p-3 ${inputBg}`}>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="text-sm font-bold">{r.title}</div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    {r.sector}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar size={11} /> {formatDate(r.ruleDate)}
                </div>
                <div
                  className="text-sm mt-2 leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: r.contentHtml }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`rounded-2xl border p-5 max-w-sm w-full ${cardBg}`}>
            <h3 className={`font-bold text-sm mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Delete this note?</h3>
            <p className="text-xs text-slate-500 mb-4">This action cannot be undone. Are you sure you want to delete this note?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold ${inputBg}`}
              >
                No, Keep it
              </button>
              <button
                onClick={() => {
                  deleteNote(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
