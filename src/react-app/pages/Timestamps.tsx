'use client';

import { useState, useEffect } from 'react';
import {
  Clock, Copy, Download, RefreshCw, X, Calendar, Globe, Timer
} from 'lucide-react';

// === Утилиты ===
import {
  getCurrentUnixTimestamp,
  getCurrentMillisTimestamp,
  getCurrentISOTimestamp,
  unixToDate,
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
            <Clock className="w-5 h-5 text-blue-400" />
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
export default function TimestampsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalResults, setModalResults] = useState<ResultItem[]>([]);
  const [lastGenerator, setLastGenerator] = useState<(() => void) | null>(null);

  // === Состояния ===
  const [convertUnix, setConvertUnix] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [liveClock, setLiveClock] = useState(false);

  // === Живые часы ===
  useEffect(() => {
    if (!liveClock) return;
    const interval = setInterval(() => {
      const now = new Date();
      setModalResults(prev => {
        const updated = [...prev];
        const isoIndex = updated.findIndex(r => r.label.includes('ISO'));
        if (isoIndex !== -1) {
          updated[isoIndex].value = now.toISOString();
        }
        const localIndex = updated.findIndex(r => r.label.includes('Локальное'));
        if (localIndex !== -1) {
          updated[localIndex].value = now.toLocaleString('ru-RU', { timeZone: timezone });
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [liveClock, timezone]);

  // === Открытие модалки ===
  const openModal = (title: string, results: ResultItem[], regenerate?: () => void) => {
    setModalTitle(title);
    setModalResults(results);
    setLastGenerator(() => regenerate || null);
    setModalOpen(true);
  };

  // === Генераторы ===
  const handleCurrentTime = () => {
    const now = new Date();
    const unix = getCurrentUnixTimestamp();
    const millis = getCurrentMillisTimestamp();
    const iso = getCurrentISOTimestamp();
    const local = now.toLocaleString('ru-RU', { timeZone: timezone });

    openModal('Текущее время', [
      { label: 'Unix (сек)', value: unix.toString() },
      { label: 'Миллисекунды', value: millis.toString() },
      { label: 'ISO 8601', value: iso },
      { label: `Локальное (${timezone})`, value: local }
    ], handleCurrentTime);

    setLiveClock(true);
  };

  const handleConvertTimestamp = () => {
    const num = parseInt(convertUnix);
    if (isNaN(num)) {
      openModal('Ошибка', [{ label: 'Ошибка', value: 'Введите корректный Unix timestamp' }]);
      return;
    }

    const date = unixToDate(num);
    const iso = new Date(num * 1000).toISOString();
    const local = new Date(num * 1000).toLocaleString('ru-RU', { timeZone: timezone });

    openModal('Конвертер Unix → Дата', [
      { label: 'ISO 8601', value: iso },
      { label: `Локальное (${timezone})`, value: local },
      { label: 'Человекочитаемо', value: date }
    ]);
  };

  const handleTimezoneExample = () => {
    const now = new Date();
    const examples = [
      { tz: 'UTC', label: 'UTC' },
      { tz: 'Europe/Moscow', label: 'Москва' },
      { tz: 'America/New_York', label: 'Нью-Йорк' },
      { tz: 'Asia/Tokyo', label: 'Токио' },
    ].map(({ tz, label }) => ({
      label: `${label} (${tz})`,
      value: now.toLocaleString('ru-RU', { timeZone: tz })
    }));

    openModal('Время по миру', examples);
  };

  return (
    <div className="min-h-screen  from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <Clock className="w-12 h-12 text-indigo-400" />
            Время и даты
          </h1>
          <p className="text-slate-400 text-lg">Unix, ISO, часовые пояса, конвертеры — всё в одном месте</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Current Time */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Timer className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-semibold">Текущее время</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Unix, миллисекунды, ISO, локальное</p>
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Часовой пояс</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="UTC">UTC</option>
                <option value="Europe/Moscow">Москва (UTC+3)</option>
                <option value="Europe/London">Лондон (UTC+0)</option>
                <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                <option value="Asia/Tokyo">Токио (UTC+9)</option>
                <option value="Australia/Sydney">Сидней (UTC+11)</option>
              </select>
            </div>
            <button
              onClick={handleCurrentTime}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Получить текущее время
            </button>
          </div>

          {/* Unix to Date */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold">Unix → Дата</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Конвертер временных меток</p>
            <input
              type="number"
              value={convertUnix}
              onChange={e => setConvertUnix(e.target.value)}
              placeholder="1672531200"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleConvertTimestamp}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Конвертировать
            </button>
          </div>

          {/* World Clock */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-teal-500 transition group lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-teal-400" />
              <h3 className="text-xl font-semibold">Время по миру</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Текущее время в разных часовых поясах</p>
            <button
              onClick={handleTimezoneExample}
              className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Показать время по миру
            </button>
          </div>

        </div>
      </div>

      {/* Модалка */}
      <ResultModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setLiveClock(false);
        }}
        title={modalTitle}
        results={modalResults}
        onRegenerate={lastGenerator || undefined}
      />
    </div>
  );
}