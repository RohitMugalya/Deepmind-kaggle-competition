import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewProps {
  code: string;
  language?: string;
}

export const CodeView: React.FC<CodeViewProps> = ({ code, language = 'typescript' }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative h-full flex flex-col bg-gray-950 rounded-lg border border-gray-800 overflow-hidden font-mono text-sm">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
          {language === 'typescript' ? 'motion-canvas-scene.tsx' : 'script.js'}
        </span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
          title="Copy Code"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <pre className="text-blue-100 leading-relaxed whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};