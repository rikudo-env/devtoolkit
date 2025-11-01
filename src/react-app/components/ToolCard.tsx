import { ReactNode, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

export default function ToolCard({ title, description, icon, children }: ToolCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

interface OutputFieldProps {
  value: string;
  label?: string;
}

export function OutputField({ value, label }: OutputFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-slate-400 font-medium">{label}</label>}
      <div className="relative group">
        <input
          type="text"
          value={value}
          readOnly
          className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 pr-10 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
        <button
          onClick={handleCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-slate-700/50 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
          )}
        </button>
      </div>
    </div>
  );
}

interface GenerateButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export function GenerateButton({ onClick, children }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  children?: React.ReactNode;
}

export function InputField({ label, value, onChange, type = 'text', placeholder, children }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-400 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
      />
      {children}
    </div>
  );
}
