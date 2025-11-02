'use client';

import { useState } from 'react';
import {
  Network, Globe, Wifi, MapPin, Copy, Download, RefreshCw, X
} from 'lucide-react';

// === Утилиты ===
import {
  ipv4ToInt,
  ipv4ToBinary,
  ipv4ToHex,
  calculateCIDR,
  getPortDescription,
  getPortCategory,
  formatMacAddress,
  generateRandomMac,
  splitSubnet
} from '@/react-app/utils/network';

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
            <Network className="w-5 h-5 text-blue-400" />
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
export default function NetworkPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalResults, setModalResults] = useState<ResultItem[]>([]);
  const [lastGenerator, setLastGenerator] = useState<(() => void) | null>(null);

  // === Состояния ===
  const [ipInput, setIpInput] = useState('192.168.1.1');
  const [cidrInput, setCidrInput] = useState('192.168.1.0/24');
  const [portInput, setPortInput] = useState('80');
  const [macInput, setMacInput] = useState('');
  const [splitCidr, setSplitCidr] = useState('192.168.1.0/24');
  const [newPrefix, setNewPrefix] = useState('26');

  // === Открытие модалки ===
  const openModal = (title: string, results: ResultItem[], regenerate?: () => void) => {
    setModalTitle(title);
    setModalResults(results);
    setLastGenerator(() => regenerate || null);
    setModalOpen(true);
  };

  // === Генераторы ===
  const handleConvertIP = () => {
    try {
      const int = ipv4ToInt(ipInput);
      const binary = ipv4ToBinary(ipInput);
      const hex = ipv4ToHex(ipInput);
      openModal('Конвертер IP', [
        { label: 'Целое число', value: int.toString() },
        { label: 'Двоичный', value: binary },
        { label: 'Шестнадцатеричный', value: hex }
      ], handleConvertIP);
    } catch (error) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (error as Error).message }]);
    }
  };

  const handleCalculateCIDR = () => {
    try {
      const result = calculateCIDR(cidrInput);
      openModal('CIDR Калькулятор', [
        { label: 'Сетевой адрес', value: result.networkAddress },
        { label: 'Широковещательный', value: result.broadcastAddress },
        { label: 'Маска подсети', value: result.subnetMask },
        { label: 'Первый хост', value: result.firstUsable },
        { label: 'Последний хост', value: result.lastUsable },
        { label: 'Количество хостов', value: result.usableHosts.toString() }
      ], handleCalculateCIDR);
    } catch (error) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (error as Error).message }]);
    }
  };

  const handlePortInfo = () => {
    const port = parseInt(portInput);
    if (isNaN(port)) return;
    const desc = getPortDescription(port);
    const cat = getPortCategory(port);
    openModal('Информация о порте', [
      { label: 'Описание', value: desc },
      { label: 'Категория', value: cat }
    ], handlePortInfo);
  };

  const handleMacTools = () => {
    let formatted = '';
    try {
      formatted = formatMacAddress(macInput);
    } catch {
      formatted = 'Неверный формат MAC';
    }
    const random = generateRandomMac();
    openModal('MAC адреса', [
      { label: 'Отформатированный', value: formatted },
      { label: 'Случайный', value: random }
    ], handleMacTools);
  };

  const handleSplitSubnet = () => {
    try {
      const prefix = parseInt(newPrefix);
      const subnets = splitSubnet(splitCidr, prefix);
      const results: ResultItem[] = subnets.map((subnet, i) => ({
        label: `Подсеть ${i + 1}`,
        value: subnet
      }));
      openModal('Разделение подсети', results, handleSplitSubnet);
    } catch (error) {
      openModal('Ошибка', [{ label: 'Ошибка', value: (error as Error).message }]);
    }
  };

  return (
    <div className="min-h-screen from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <Network className="w-12 h-12 text-blue-400" />
            Сетевые утилиты
          </h1>
          <p className="text-slate-400 text-lg">IP, CIDR, порты, MAC, подсети — всё одним кликом</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* IP Converter */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold">Конвертер IP</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Int, Binary, Hex</p>
            <input
              type="text"
              value={ipInput}
              onChange={e => setIpInput(e.target.value)}
              placeholder="192.168.1.1"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleConvertIP}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Конвертировать
            </button>
          </div>

          {/* CIDR Calculator */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Network className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">CIDR калькулятор</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Сеть, маска, хосты</p>
            <input
              type="text"
              value={cidrInput}
              onChange={e => setCidrInput(e.target.value)}
              placeholder="192.168.1.0/24"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleCalculateCIDR}
              className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Рассчитать
            </button>
          </div>

          {/* Port Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-semibold">Инфо о порте</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Описание и категория</p>
            <input
              type="number"
              value={portInput}
              onChange={e => setPortInput(e.target.value)}
              placeholder="80"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handlePortInfo}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Получить информацию
            </button>
          </div>

          {/* MAC Tools */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-yellow-500 transition group">
            <div className="flex items-center gap-3 mb-3">
              <Wifi className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-semibold">MAC адреса</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Форматирование + генерация</p>
            <input
              type="text"
              value={macInput}
              onChange={e => setMacInput(e.target.value)}
              placeholder="001122334455"
              className="w-full mb-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={handleMacTools}
              className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Обработать MAC
            </button>
          </div>

          {/* Subnet Splitter */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition group lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <Network className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-semibold">Разделение подсети</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">CIDR → несколько подсетей</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={splitCidr}
                onChange={e => setSplitCidr(e.target.value)}
                placeholder="192.168.1.0/24"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                value={newPrefix}
                onChange={e => setNewPrefix(e.target.value)}
                placeholder="26"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSplitSubnet}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Разделить
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