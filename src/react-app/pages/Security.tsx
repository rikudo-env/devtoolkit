'use client';

import { useState } from 'react';
import {
  Hash, Binary, Copy, Download, RefreshCw, X, Shield, Lock
} from 'lucide-react';

// === Утилиты ===
import {
  generateSHA256,
  generateSHA512,
  encodeBase64,
  decodeBase64,
  encodeURL,
  decodeURL,
} from '@/react-app/utils/generators';

// === Модальное окно ===
interface ResultItem {
  label: string;
  value: string;
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  results: ResultItem[];
  onRegenerate?: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, title, results, onRegenerate }) => {
  if (!isOpen) return null;

  const copyAll = () => {
    const text = results.map(r => `${r.label}:\n${r.value}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  const copySingle = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const downloadAll = () => {
    const text = results.map(r => `${r.label}:\n${r.value}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            {title}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {results.map((item, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-300">{item.label}</div>
                <button
                  onClick={() => copySingle(item.value)}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded transition"
                  title="Копировать"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
              <div className="font-mono text-sm text-green-400 bg-slate-900/50 p-3 rounded break-all">
                {item.value || '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 p-4 bg-slate-900 border-t border-slate-700 justify-end">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Заново
            </button>
          )}
          <button
            onClick={copyAll}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-sm"
          >
            <Copy className="w-4 h-4" />
            Копировать всё
          </button>
          <button
            onClick={downloadAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <Download className="w-4 h-4" />
            Скачать
          </button>
        </div>
      </div>
    </div>
  );
};

// === Основной компонент ===
export default function SecurityPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalResults, setModalResults] = useState<ResultItem[]>([]);
  const [lastGenerator, setLastGenerator] = useState<(() => void) | null>(null);

  // === Состояния ===
  const [hashInput, setHashInput] = useState('');
  const [encodeInput, setEncodeInput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');

  // === Открытие модалки ===
  const openModal = (title: string, results: ResultItem[], regenerate?: () => void) => {
    setModalTitle(title);
    setModalResults(results);
    setLastGenerator(() => regenerate || null);
    setModalOpen(true);
  };

  // === Генераторы ===
  const handleGenerateHashes = async () => {
    if (!hashInput.trim()) return;
    try {
      const sha256 = await generateSHA256(hashInput);
      const sha512 = await generateSHA512(hashInput);
      openModal('Хеши SHA', [
        { label: 'SHA-256', value: sha256 },
        { label: 'SHA-512', value: sha512 }
      ], handleGenerateHashes);
    } catch {
      openModal('Ошибка', [{ label: 'Ошибка', value: 'Не удалось вычислить хеш' }]);
    }
  };

  const handleEncode = () => {
    if (!encodeInput.trim()) return;
    const base64 = encodeBase64(encodeInput);
    const url = encodeURL(encodeInput);
    openModal('Кодирование', [
      { label: 'Base64', value: base64 },
      { label: 'URL', value: url }
    ], handleEncode);
  };

  const handleDecode = () => {
    if (!decodeInput.trim()) return;
    let base64 = 'Неверный Base64';
    let url = 'Неверное URL кодирование';

    try {
      base64 = decodeBase64(decodeInput);
    } catch { /* empty */ }
    try {
      url = decodeURL(decodeInput);
    } catch { /* empty */ }

    openModal('Декодирование', [
      { label: 'Base64 → Текст', value: base64 },
      { label: 'URL → Текст', value: url }
    ], handleDecode);
  };

  const handleAllInOne = async () => {
    const text = hashInput || encodeInput || decodeInput || 'DevOpsToolkit';
    if (!text.trim()) return;

    const [sha256, sha512] = await Promise.all([
      generateSHA256(text),
      generateSHA512(text)
    ]);
    const b64 = encodeBase64(text);
    const urlEnc = encodeURL(text);

    openModal('All-in-One: Хеши + Кодирование', [
      { label: 'Исходный текст', value: text },
      { label: 'SHA-256', value: sha256 },
      { label: 'SHA-512', value: sha512 },
      { label: 'Base64', value: b64 },
      { label: 'URL-encoded', value: urlEnc }
    ], handleAllInOne);
  };

  return (
    <div className="min-h-screen from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <Shield className="w-12 h-12 text-red-400" />
            Безопасность
          </h1>
          <p className="text-slate-400 text-lg">SHA-256, SHA-512, Base64, URL-кодирование — всё в одном месте</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Hash Generator */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Hash className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold">Генератор хешей</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">SHA-256 и SHA-512</p>
            <textarea
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              placeholder="Введите текст для хеширования..."
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 h-24 resize-none font-mono text-sm"
            />
            <button
              onClick={handleGenerateHashes}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Хешировать
            </button>
          </div>

          {/* Encoder */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Binary className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">Кодировщик</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Base64 и URL</p>
            <textarea
              value={encodeInput}
              onChange={e => setEncodeInput(e.target.value)}
              placeholder="Введите текст для кодирования..."
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 h-24 resize-none font-mono text-sm"
            />
            <button
              onClick={handleEncode}
              className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Закодировать
            </button>
          </div>

          {/* Decoder */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Binary className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-semibold">Декодировщик</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Base64 и URL → текст</p>
            <textarea
              value={decodeInput}
              onChange={e => setDecodeInput(e.target.value)}
              placeholder="Вставьте Base64 или URL-код..."
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 h-24 resize-none font-mono text-sm"
            />
            <button
              onClick={handleDecode}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Декодировать
            </button>
          </div>

          {/* All-in-One */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition group lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold">All-in-One</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Хеши + кодирование за один клик</p>
            <textarea
              value={hashInput || encodeInput || decodeInput}
              onChange={e => {
                setHashInput(e.target.value);
                setEncodeInput(e.target.value);
                setDecodeInput(e.target.value);
              }}
              placeholder="Введите любой текст... (используется для всех операций)"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 h-28 resize-none font-mono text-sm"
            />
            <button
              onClick={handleAllInOne}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Запустить All-in-One
            </button>
          </div>

        </div>
      </div>

      {/* Модалка */}
      <ResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        results={modalResults}
        onRegenerate={lastGenerator || undefined}
      />
    </div>
  );
}