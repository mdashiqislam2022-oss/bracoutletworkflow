import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Code,
  Copy,
  Check,
  Database,
  ShieldCheck,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { supabaseSqlSchema, supabaseRlsExplanation } from '../../data/sqlSchema';

export const SqlSchemaViewer: React.FC = () => {
  const { setActiveNavTab, userPreferences } = useApp();
  const isDark = userPreferences.theme === 'dark';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className={`rounded-[24px] p-6 border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 shadow-lg text-white'
          : 'bg-white border-slate-100 shadow-xs text-slate-900'
      } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setActiveNavTab('system_settings')}
              className={`flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors ${
                isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
            </button>
          </div>
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Supabase PostgreSQL Schema & RLS Policies
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production ready DDL and Row Level Security architecture.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-98 shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
            isDark
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-[#18181B] hover:bg-black text-white'
          }`}
        >
          {copied ? <Check className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#D4F63D]'}`} /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy SQL Script'}</span>
        </button>
      </div>

      {/* RLS Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supabaseRlsExplanation.map((item, idx) => (
          <div key={idx} className={`p-5 rounded-[24px] border space-y-1.5 transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 shadow-md text-white'
              : 'bg-white border-slate-100 shadow-xs text-slate-900'
          }`}>
            <div className={`flex items-center gap-2 font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{item.title}</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* SQL Script Block */}
      <div className={`rounded-[28px] p-6 border font-mono text-xs overflow-hidden transition-all ${
        isDark
          ? 'bg-slate-950 border-slate-800 text-slate-200 shadow-xl'
          : 'bg-[#18181B] border-slate-800 text-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> schema.sql
          </span>
          <span className="text-[10px] text-slate-500">PostgreSQL 15+ / Supabase Auth</span>
        </div>

        <pre className="overflow-x-auto p-2 leading-relaxed text-[11px] text-slate-300 max-h-[500px] overflow-y-auto scrollbar-thin">
          <code>{supabaseSqlSchema}</code>
        </pre>
      </div>
    </div>
  );
};
