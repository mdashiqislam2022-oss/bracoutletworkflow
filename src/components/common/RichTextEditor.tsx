import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Strikethrough, Highlighter, Palette } from 'lucide-react';

const COLOR_PALETTE = [
  '#000000', '#374151', '#6B7280', '#EF4444', '#F97316',
  '#F59E0B', '#EAB308', '#22C55E', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#FFFFFF'
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  isDark: boolean;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  isDark,
  minHeight = '160px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [activeColor, setActiveColor] = useState('#000000');
  const savedRange = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyCommand = (command: string, arg?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const toolbarBtn = `p-1.5 rounded-lg text-xs font-bold transition ${
    isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
  }`;

  return (
    <div className={`rounded-xl border ${inputBg}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-1 px-2 py-1.5 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} relative`}>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand('bold')}
          className={toolbarBtn}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand('italic')}
          className={toolbarBtn}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand('strikeThrough')}
          className={toolbarBtn}
          title="Cut / Strikethrough"
        >
          <Strikethrough size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand('hiliteColor', '#FEF08A')}
          className={toolbarBtn}
          title="Highlight"
        >
          <Highlighter size={14} />
        </button>

        <div className="w-px h-4 bg-slate-400/30 mx-1" />

        {/* Color Picker */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
          onClick={() => setShowColorPalette((v) => !v)}
          className="flex items-center gap-1 p-1 rounded-lg"
          title="Text Color"
        >
          <Palette size={13} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
          <span
            className="w-4 h-4 rounded border border-slate-400"
            style={{ backgroundColor: activeColor }}
          />
        </button>

        {showColorPalette && (
          <div className={`absolute z-30 top-full left-0 mt-1 p-2 rounded-xl border shadow-lg grid grid-cols-5 gap-1.5 ${inputBg}`}>
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setActiveColor(color);
                  applyCommand('foreColor', color);
                  setShowColorPalette(false);
                }}
                className="w-6 h-6 rounded-full border border-slate-400"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        data-placeholder={placeholder || 'Write here...'}
        className="rich-text-editable px-3 py-2 text-sm outline-none overflow-y-auto"
        style={{ minHeight }}
        suppressContentEditableWarning
      />
      <style>{`
        .rich-text-editable:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
