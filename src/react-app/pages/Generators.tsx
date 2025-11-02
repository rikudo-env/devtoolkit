'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Fingerprint, Key, Lock, Type, Shuffle, Copy, Download, RefreshCw, X, QrCode
} from 'lucide-react';
import QRCode from 'qrcode';

// === Генераторы ===
import {
  generateUUIDv4,
  generateUUIDv1,
  generateRandomToken,
  generateHexToken,
  generateBase64Token,
  generatePassword,
  generateRandomWords,
  generateMockJWT,
  generateRandomNumber,
  generateRandomFloat,
} from '@/react-app/utils/generators';

// === Модальное окно ===
interface ResultItem {
  label: string;
  value: string;
  isQR?: boolean;
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
    const text = results
      .filter(r => !r.isQR)
      .map(r => `${r.label}:\n${r.value}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
  };

  const copySingle = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const downloadAll = async () => {
    const textParts: string[] = [];
    const qrItems: { value: string; label: string }[] = [];

    results.forEach(item => {
      if (item.isQR) {
        qrItems.push({ value: item.value, label: item.label });
      } else {
        textParts.push(`${item.label}:\n${item.value}`);
      }
    });

    // Скачать текст
    if (textParts.length > 0) {
      const text = textParts.join('\n\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Скачать QR
    for (const { value, label } of qrItems) {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, value, { width: 512, margin: 2 });
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${label.toLowerCase().replace(/\s+/g, '-')}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const downloadSingleQR = async (value: string, label: string) => {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, value, { width: 512, margin: 2 });
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${label.toLowerCase().replace(/\s+/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-blue-400" />
            {title}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {results.map((item, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-300">{item.label}</div>
                <div className="flex gap-1">
                  {!item.isQR && (
                    <button
                      onClick={() => copySingle(item.value)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded transition"
                      title="Копировать"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  )}
                  {item.isQR && (
                    <button
                      onClick={() => downloadSingleQR(item.value, item.label)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded transition"
                      title="Скачать QR"
                    >
                      <Download className="w-3.5 h-3.5 text-green-400" />
                    </button>
                  )}
                </div>
              </div>

              {item.isQR ? (
                <div className="flex justify-center p-4 bg-slate-900/50 rounded-lg">
                  <QRCodeCanvas text={item.value} />
                </div>
              ) : (
                <div className="font-mono text-sm text-green-400 bg-slate-900/50 p-3 rounded break-all">
                  {item.value || '—'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
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
            Скачать всё
          </button>
        </div>
      </div>
    </div>
  );
};

// === QR Code Canvas ===
const QRCodeCanvas: React.FC<{ text: string }> = ({ text }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: 256,
        margin: 2,
        color: { dark: '#10b981', light: '#1e293b' }
      });
    }
  }, [text]);

  return <canvas ref={canvasRef} className="rounded-lg border border-slate-700" />;
};

// === Основной компонент ===
export default function GeneratorsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalResults, setModalResults] = useState<ResultItem[]>([]);
  const [lastGenerator, setLastGenerator] = useState<(() => void) | null>(null);

  // === Состояния ===
  const [tokenLength, setTokenLength] = useState('32');
  const [passwordLength, setPasswordLength] = useState('16');
  const [wordCount, setWordCount] = useState('3');
  const [jwtPayload, setJwtPayload] = useState('{"sub":"1234567890","name":"John Doe"}');
  const [minNum, setMinNum] = useState('1');
  const [maxNum, setMaxNum] = useState('100');
  const [qrText, setQrText] = useState('https://example.com');

  // === Генераторы ===
  const openModal = (title: string, results: ResultItem[], regenerate?: () => void) => {
    setModalTitle(title);
    setModalResults(results);
    setLastGenerator(() => regenerate || null);
    setModalOpen(true);
  };

  const handleUUID = () => {
    const v4 = generateUUIDv4();
    const v1 = generateUUIDv1();
    openModal('UUID v4 & v1', [
      { label: 'UUID v4', value: v4 },
      { label: 'UUID v1', value: v1 }
    ], handleUUID);
  };

  const handleTokens = () => {
    const len = parseInt(tokenLength) || 32;
    openModal('Токены', [
      { label: 'Алфавитно-цифровой', value: generateRandomToken(len) },
      { label: 'Hex', value: generateHexToken(len) },
      { label: 'Base64', value: generateBase64Token(len) }
    ], handleTokens);
  };

  const handlePassword = () => {
    const len = parseInt(passwordLength) || 16;
    const pwd = generatePassword(len, true);
    openModal('Пароль', [{ label: 'Пароль', value: pwd }], handlePassword);
  };

  const handleWords = () => {
    const count = parseInt(wordCount) || 3;
    const words = generateRandomWords(count, '-');
    openModal('Случайные слова', [{ label: 'Слова', value: words }], handleWords);
  };

  const handleJWT = () => {
    try {
      const payload = JSON.parse(jwtPayload);
      const token = generateMockJWT(payload);
      openModal('Mock JWT', [{ label: 'JWT', value: token }], handleJWT);
    } catch {
      openModal('Ошибка', [{ label: 'Ошибка', value: 'Неверный JSON' }]);
    }
  };

  const handleNumbers = () => {
    const min = parseInt(minNum) || 1;
    const max = parseInt(maxNum) || 100;
    openModal('Случайные числа', [
      { label: 'Целое', value: generateRandomNumber(min, max).toString() },
      { label: 'С плавающей точкой', value: generateRandomFloat(min, max, 2).toString() }
    ], handleNumbers);
  };

  const handleQR = () => {
    if (!qrText.trim()) return;
    openModal('QR-код', [
      { label: 'Текст', value: qrText },
      { label: 'QR-код', value: qrText, isQR: true }
    ], handleQR);
  };

  return (
    <div className="min-h-screen from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <Shuffle className="w-12 h-12 text-purple-400" />
            Генераторы
          </h1>
          <p className="text-slate-400 text-lg">UUID, токены, пароли, QR-коды — всё одним кликом</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* UUID */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Fingerprint className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold">UUID v4 & v1</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Уникальные идентификаторы</p>
            <button onClick={handleUUID} className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать
            </button>
          </div>

          {/* Tokens */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Key className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">Токены</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Алфавитно-цифровой, Hex, Base64</p>
            <input type="number" value={tokenLength} onChange={e => setTokenLength(e.target.value)} placeholder="Длина (32)" className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-sm" />
            <button onClick={handleTokens} className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать
            </button>
          </div>

          {/* Password */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold">Пароль</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Символы, цифры, спецсимволы</p>
            <input type="number" value={passwordLength} onChange={e => setPasswordLength(e.target.value)} placeholder="Длина (16)" className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 text-sm" />
            <button onClick={handlePassword} className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать
            </button>
          </div>

          {/* Random Words */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-yellow-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Type className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-semibold">Случайные слова</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Для паролей или названий</p>
            <input type="number" value={wordCount} onChange={e => setWordCount(e.target.value)} placeholder="Количество (3)" className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 text-sm" />
            <button onClick={handleWords} className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать
            </button>
          </div>

          {/* JWT */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Key className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-semibold">Mock JWT</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Для тестирования API</p>
            <textarea value={jwtPayload} onChange={e => setJwtPayload(e.target.value)} placeholder='{"sub":"123","name":"John"}' className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 h-20 resize-none font-mono text-xs" />
            <button onClick={handleJWT} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать
            </button>
          </div>

          {/* Random Numbers */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Shuffle className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-semibold">Случайные числа</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Целые и с плавающей точкой</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" value={minNum} onChange={e => setMinNum(e.target.value)} placeholder="Мин" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm" />
              <input type="number" value={maxNum} onChange={e => setMaxNum(e.target.value)} placeholder="Макс" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm" />
            </div>
            <button onClick={handleNumbers} className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать
            </button>
          </div>

          {/* QR Code */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-teal-500 transition group lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <QrCode className="w-6 h-6 text-teal-400" />
              <h3 className="text-xl font-semibold">Генератор QR-кодов</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">URL, текст, Wi-Fi, контакт</p>
            <textarea
              value={qrText}
              onChange={e => setQrText(e.target.value)}
              placeholder="Введите текст или URL..."
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 h-24 resize-none font-mono text-sm"
            />
            <button onClick={handleQR} className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4" /> Сгенерировать QR
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