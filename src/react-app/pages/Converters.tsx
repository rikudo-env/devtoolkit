'use client';

import { useState } from 'react';
import {
  Hash, Scale, RotateCcw, Palette, Thermometer, Copy, Download, RefreshCw, X, Calculator
} from 'lucide-react';
import {
  convertNumberSystem,
  formatBytes,
  convertTime,
  hexToRgb,
  rgbToHsl,
  celsiusToFahrenheit,
  celsiusToKelvin
} from '@/react-app/utils/converters';
import { rgbToHex } from '@/react-app/utils/converters';

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
            <Calculator className="w-5 h-5 text-blue-400" />
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
export default function ConvertersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalResults, setModalResults] = useState<ResultItem[]>([]);
  const [lastGenerator, setLastGenerator] = useState<(() => void) | null>(null);

  // === Состояния ===
  const [numberInput, setNumberInput] = useState('255');
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('16');

  const [sizeInput, setSizeInput] = useState('1024');
  const [fromUnit, setFromUnit] = useState('B');
  const [toUnit, setToUnit] = useState('KB');

  const [timeInput, setTimeInput] = useState('60');
  const [fromTimeUnit, setFromTimeUnit] = useState('second');
  const [toTimeUnit, setToTimeUnit] = useState('minute');

  const [hexColor, setHexColor] = useState('#FF5733');
  const [rgbR, setRgbR] = useState('255');
  const [rgbG, setRgbG] = useState('87');
  const [rgbB, setRgbB] = useState('51');

  const [tempInput, setTempInput] = useState('25');

  // === Открытие модалки ===
  const openModal = (title: string, results: ResultItem[], regenerate?: () => void) => {
    setModalTitle(title);
    setModalResults(results);
    setLastGenerator(() => regenerate || null);
    setModalOpen(true);
  };

  // === Обработчики ===
  const handleNumber = () => {
    try {
      const num = numberInput.trim();
      const from = parseInt(fromBase);
      const to = parseInt(toBase);
      if (isNaN(from) || isNaN(to) || from < 2 || from > 36 || to < 2 || to > 36) {
        throw new Error('База: 2–36');
      }
      const result = convertNumberSystem(num, from, to);
      openModal('Системы счисления', [
        { label: `Исходное (${from})`, value: num },
        { label: `Результат (${to})`, value: result }
      ], handleNumber);
    } catch (e) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (e as Error).message }]);
    }
  };

  const handleSize = () => {
    try {
      const bytes = parseFloat(sizeInput);
      if (isNaN(bytes)) throw new Error('Введите число');
      const multiplier: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
      const fromBytes = bytes * (multiplier[fromUnit] || 1);
      const toBytes = fromBytes / (multiplier[toUnit] || 1);
      const formatted = formatBytes(fromBytes);
      openModal('Размеры данных', [
        { label: `Исходное`, value: `${bytes} ${fromUnit}` },
        { label: `Результат`, value: `${toBytes.toFixed(4)} ${toUnit}` },
        { label: `Человекочитаемо`, value: formatted }
      ], handleSize);
    } catch (e) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (e as Error).message }]);
    }
  };

  const handleTime = () => {
    try {
      const time = parseFloat(timeInput);
      if (isNaN(time)) throw new Error('Введите число');
      const result = convertTime(time, fromTimeUnit, toTimeUnit);
      openModal('Время', [
        { label: `Исходное`, value: `${time} ${fromTimeUnit}` },
        { label: `Результат`, value: `${result} ${toTimeUnit}` }
      ], handleTime);
    } catch (e) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (e as Error).message }]);
    }
  };

  const handleColor = () => {
    try {
      // HEX → RGB → HSL
      const rgb = hexToRgb(hexColor);
      if (!rgb) throw new Error('Неверный HEX');
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const hexFromRgb = rgbToHex(rgb.r, rgb.g, rgb.b);

      // RGB → HEX
      const r = parseInt(rgbR);
      const g = parseInt(rgbG);
      const b = parseInt(rgbB);
      let rgbToHexResult = '';
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        rgbToHexResult = rgbToHex(r, g, b);
      }

      openModal('Цвета', [
        { label: 'HEX → RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
        { label: 'RGB → HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
        { label: 'HEX (проверка)', value: hexFromRgb },
        ...(rgbToHexResult ? [{ label: 'RGB → HEX', value: rgbToHexResult }] : [])
      ], handleColor);
    } catch (e) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (e as Error).message }]);
    }
  };

  const handleTemperature = () => {
    try {
      const c = parseFloat(tempInput);
      if (isNaN(c)) throw new Error('Введите число');
      const f = celsiusToFahrenheit(c).toFixed(2);
      const k = celsiusToKelvin(c).toFixed(2);
      openModal('Температура', [
        { label: 'Цельсий', value: `${c}°C` },
        { label: 'Фаренгейт', value: `${f}°F` },
        { label: 'Кельвин', value: `${k}K` }
      ], handleTemperature);
    } catch (e) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (e as Error).message }]);
    }
  };

  return (
    <div className="min-h-screen from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <Calculator className="w-12 h-12 text-blue-400" />
            Конвертеры
          </h1>
          <p className="text-slate-400 text-lg">Числа, размеры, время, цвета, температура — всё в одном месте</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Системы счисления */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Hash className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold">Системы счисления</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">10 → 16, 2 → 8, любые базы</p>
            <input
              type="text"
              value={numberInput}
              onChange={e => setNumberInput(e.target.value)}
              placeholder="255"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={fromBase}
                onChange={e => setFromBase(e.target.value)}
                placeholder="10"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm"
              />
              <input
                type="number"
                value={toBase}
                onChange={e => setToBase(e.target.value)}
                placeholder="16"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>
            <button
              onClick={handleNumber}
              className="mt-4 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Конвертировать
            </button>
          </div>

          {/* Размеры данных */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Scale className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">Размеры данных</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">B → KB → MB → GB → TB</p>
            <input
              type="number"
              value={sizeInput}
              onChange={e => setSizeInput(e.target.value)}
              placeholder="1024"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={fromUnit}
                onChange={e => setFromUnit(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
              >
                <option value="B">B</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
              <select
                value={toUnit}
                onChange={e => setToUnit(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
              >
                <option value="B">B</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
            <button
              onClick={handleSize}
              className="mt-4 w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Конвертировать
            </button>
          </div>

          {/* Время */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <RotateCcw className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-semibold">Время</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">сек → мин → ч → дн → год</p>
            <input
              type="number"
              value={timeInput}
              onChange={e => setTimeInput(e.target.value)}
              placeholder="60"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={fromTimeUnit}
                onChange={e => setFromTimeUnit(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="ms">мс</option>
                <option value="second">сек</option>
                <option value="minute">мин</option>
                <option value="hour">ч</option>
                <option value="day">дн</option>
                <option value="week">нед</option>
                <option value="month">мес</option>
                <option value="year">лет</option>
              </select>
              <select
                value={toTimeUnit}
                onChange={e => setToTimeUnit(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="ms">мс</option>
                <option value="second">сек</option>
                <option value="minute">мин</option>
                <option value="hour">ч</option>
                <option value="day">дн</option>
                <option value="week">нед</option>
                <option value="month">мес</option>
                <option value="year">лет</option>
              </select>
            </div>
            <button
              onClick={handleTime}
              className="mt-4 w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Конвертировать
            </button>
          </div>

          {/* Цвета */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-yellow-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Palette className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-semibold">Цвета</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">HEX ↔ RGB ↔ HSL</p>
            <input
              type="text"
              value={hexColor}
              onChange={e => setHexColor(e.target.value)}
              placeholder="#FF5733"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 font-mono text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={rgbR}
                onChange={e => setRgbR(e.target.value)}
                placeholder="R"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 text-sm text-center"
              />
              <input
                type="number"
                value={rgbG}
                onChange={e => setRgbG(e.target.value)}
                placeholder="G"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 text-sm text-center"
              />
              <input
                type="number"
                value={rgbB}
                onChange={e => setRgbB(e.target.value)}
                placeholder="B"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 text-sm text-center"
              />
            </div>
            <button
              onClick={handleColor}
              className="mt-4 w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Конвертировать
            </button>
          </div>

          {/* Температура */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition group lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <Thermometer className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-semibold">Температура</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">°C → °F → K</p>
            <input
              type="number"
              value={tempInput}
              onChange={e => setTempInput(e.target.value)}
              placeholder="25"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleTemperature}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Конвертировать
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