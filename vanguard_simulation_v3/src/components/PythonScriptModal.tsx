import React, { useState } from 'react';
import { Code, Copy, Check, Download, X, Terminal, ExternalLink } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  pythonScriptContent: string;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  pythonScriptContent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonScriptContent], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'app.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#091220] border border-[#00f3ff] rounded shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#050b14] border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#00f3ff]" />
            <div>
              <h3 className="text-sm font-bold text-[#ffffff] font-mono">
                app.py — Self-Contained Streamlit Digital Twin Script
              </h3>
              <p className="text-[11px] text-[#94a3b8]">
                Production-ready single script for Streamlit Community Cloud (Zero external data dependencies)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1626] border border-[#00f3ff] hover:bg-[#00f3ff] hover:text-[#050b14] text-[#00f3ff] text-xs font-mono font-semibold rounded transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED TO CLIPBOARD' : 'COPY app.py'}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00f3ff] hover:bg-[#38bdf8] text-[#050b14] text-xs font-mono font-bold rounded transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD app.py
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#94a3b8] hover:text-[#ffffff] rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Instructions banner */}
        <div className="bg-[#050e1a] border-b border-[#1e293b] px-5 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#cbd5e1]">
            <Terminal className="w-4 h-4 text-[#00ff66]" />
            <span>RUN LOCALLY:</span>
            <code className="bg-[#0f172a] px-2 py-0.5 rounded text-[#00ff66] border border-[#1e293b]">
              pip install streamlit plotly numpy pandas && streamlit run app.py
            </code>
          </div>
          <div className="text-[11px] text-[#94a3b8]">
            File size: ~{Math.round(pythonScriptContent.length / 1024)} KB · Complete &amp; Untruncated
          </div>
        </div>

        {/* Script Content Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-[#050b14] font-mono text-xs text-[#cbd5e1] leading-relaxed select-text">
          <pre className="whitespace-pre overflow-x-auto text-[11.5px] leading-5">
            {pythonScriptContent}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#050b14] border-t border-[#1e293b] flex items-center justify-between text-xs text-[#94a3b8] font-mono">
          <span>Project VANGUARD · Indian Railways Counter-Sabotage Drone System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-white rounded text-xs transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
