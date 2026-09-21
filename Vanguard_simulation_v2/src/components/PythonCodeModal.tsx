import React, { useState } from 'react';
import { Copy, Check, Download, X, Code2, Terminal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pythonCode: string;
}

export const PythonCodeModal: React.FC<Props> = ({ isOpen, onClose, pythonCode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#0d1422] border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#121926]">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-mono text-sm font-bold text-slate-200">
                app.py (Streamlit + Plotly Standalone Script)
              </div>
              <div className="font-mono text-xs text-slate-400">
                Zero Dependency Breakage: Streamlit, Plotly, NumPy, Pandas, Hashlib
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download app.py</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Execution hint */}
        <div className="p-2.5 px-4 bg-[#080c14] border-b border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Run locally:</span>
          <code className="text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            streamlit run app.py
          </code>
        </div>

        {/* Code body */}
        <div className="flex-1 overflow-auto p-4 bg-[#080c14]">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed">
            <code>{pythonCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
