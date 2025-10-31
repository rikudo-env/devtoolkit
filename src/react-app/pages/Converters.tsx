import { useState } from 'react';
import { RotateCcw, Hash, Palette, Thermometer, Scale } from 'lucide-react';
import ToolCard, { OutputField, GenerateButton, InputField } from '@/react-app/components/ToolCard';
import {
  convertNumberSystem,
  convertBytes,
  formatBytes,
  convertTime,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  celsiusToFahrenheit,
  celsiusToKelvin
} from '@/react-app/utils/converters';

export default function ConvertersPage() {
  // Number system states
  const [numberInput, setNumberInput] = useState('255');
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('16');
  const [convertedNumber, setConvertedNumber] = useState('');

  // Data size states
  const [sizeInput, setSizeInput] = useState('1024');
  const [fromUnit, setFromUnit] = useState('B');
  const [toUnit, setToUnit] = useState('KB');
  const [convertedSize, setConvertedSize] = useState('');
  const [formattedSize, setFormattedSize] = useState('');

  // Time conversion states
  const [timeInput, setTimeInput] = useState('60');
  const [fromTimeUnit, setFromTimeUnit] = useState('second');
  const [toTimeUnit, setToTimeUnit] = useState('minute');
  const [convertedTime, setConvertedTime] = useState('');

  // Color conversion states
  const [hexColor, setHexColor] = useState('#FF5733');
  const [rgbResult, setRgbResult] = useState('');
  const [hslResult, setHslResult] = useState('');
  const [rgbR, setRgbR] = useState('255');
  const [rgbG, setRgbG] = useState('87');
  const [rgbB, setRgbB] = useState('51');
  const [hexResult, setHexResult] = useState('');

  // Temperature states
  const [tempInput, setTempInput] = useState('25');
  const [celsiusToF, setCelsiusToF] = useState('');
  const [celsiusToK, setCelsiusToK] = useState('');

  const handleConvertNumber = () => {
    try {
      const result = convertNumberSystem(numberInput, parseInt(fromBase), parseInt(toBase));
      setConvertedNumber(result);
    } catch (error) {
      setConvertedNumber('Ошибка: ' + (error as Error).message);
    }
  };

  const handleConvertSize = () => {
    try {
      const bytes = parseFloat(sizeInput);
      const result = convertBytes(bytes, fromUnit, toUnit);
      setConvertedSize(result.toString());
      setFormattedSize(formatBytes(bytes * (fromUnit === 'B' ? 1 : fromUnit === 'KB' ? 1024 : fromUnit === 'MB' ? 1024*1024 : 1024*1024*1024)));
    } catch (error) {
      setConvertedSize('Ошибка: ' + (error as Error).message);
      setFormattedSize('');
    }
  };

  const handleConvertTime = () => {
    try {
      const time = parseFloat(timeInput);
      const result = convertTime(time, fromTimeUnit, toTimeUnit);
      setConvertedTime(result.toString());
    } catch (error) {
      setConvertedTime('Ошибка: ' + (error as Error).message);
    }
  };

  const handleConvertHexToRgb = () => {
    try {
      const rgb = hexToRgb(hexColor);
      if (rgb) {
        setRgbResult(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setHslResult(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
      }
    } catch (error) {
      setRgbResult('Ошибка: ' + (error as Error).message);
      setHslResult('');
    }
  };

  const handleConvertRgbToHex = () => {
    try {
      const r = parseInt(rgbR);
      const g = parseInt(rgbG);
      const b = parseInt(rgbB);
      const hex = rgbToHex(r, g, b);
      setHexResult(hex);
    } catch (error) {
      setHexResult('Ошибка: ' + (error as Error).message);
    }
  };

  const handleConvertTemperature = () => {
    try {
      const temp = parseFloat(tempInput);
      setCelsiusToF(celsiusToFahrenheit(temp).toFixed(2) + '°F');
      setCelsiusToK(celsiusToKelvin(temp).toFixed(2) + 'K');
    } catch (error) {
      setCelsiusToF('Ошибка');
      setCelsiusToK('Ошибка');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Конвертеры</h1>
        <p className="text-slate-400">Преобразование единиц измерения и систем счисления</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Number System Converter */}
        <ToolCard
          title="Системы счисления"
          description="Конвертация между различными системами счисления"
          icon={<Hash className="w-5 h-5" />}
        >
          <InputField
            label="Число"
            value={numberInput}
            onChange={setNumberInput}
            placeholder="255"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Из системы"
              value={fromBase}
              onChange={setFromBase}
              type="number"
              placeholder="10"
            />
            <InputField
              label="В систему"
              value={toBase}
              onChange={setToBase}
              type="number"
              placeholder="16"
            />
          </div>
          <GenerateButton onClick={handleConvertNumber}>
            Конвертировать
          </GenerateButton>
          {convertedNumber && <OutputField value={convertedNumber} label="Результат" />}
        </ToolCard>

        {/* Data Size Converter */}
        <ToolCard
          title="Размеры данных"
          description="Конвертация между единицами измерения данных"
          icon={<Scale className="w-5 h-5" />}
        >
          <InputField
            label="Размер"
            value={sizeInput}
            onChange={setSizeInput}
            type="number"
            placeholder="1024"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Из</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="B">B</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">В</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="B">B</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>
          <GenerateButton onClick={handleConvertSize}>
            Конвертировать
          </GenerateButton>
          {convertedSize && <OutputField value={convertedSize + ' ' + toUnit} label="Результат" />}
          {formattedSize && <OutputField value={formattedSize} label="Автоформат" />}
        </ToolCard>

        {/* Time Converter */}
        <ToolCard
          title="Время"
          description="Конвертация между единицами времени"
          icon={<RotateCcw className="w-5 h-5" />}
        >
          <InputField
            label="Время"
            value={timeInput}
            onChange={setTimeInput}
            type="number"
            placeholder="60"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Из</label>
              <select
                value={fromTimeUnit}
                onChange={(e) => setFromTimeUnit(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="ms">Миллисекунды</option>
                <option value="second">Секунды</option>
                <option value="minute">Минуты</option>
                <option value="hour">Часы</option>
                <option value="day">Дни</option>
                <option value="week">Недели</option>
                <option value="month">Месяцы</option>
                <option value="year">Годы</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">В</label>
              <select
                value={toTimeUnit}
                onChange={(e) => setToTimeUnit(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="ms">Миллисекунды</option>
                <option value="second">Секунды</option>
                <option value="minute">Минуты</option>
                <option value="hour">Часы</option>
                <option value="day">Дни</option>
                <option value="week">Недели</option>
                <option value="month">Месяцы</option>
                <option value="year">Годы</option>
              </select>
            </div>
          </div>
          <GenerateButton onClick={handleConvertTime}>
            Конвертировать
          </GenerateButton>
          {convertedTime && <OutputField value={convertedTime} label="Результат" />}
        </ToolCard>

        {/* Color Converter */}
        <ToolCard
          title="Цвета"
          description="Конвертация между цветовыми форматами"
          icon={<Palette className="w-5 h-5" />}
        >
          <InputField
            label="HEX цвет"
            value={hexColor}
            onChange={setHexColor}
            placeholder="#FF5733"
          />
          <GenerateButton onClick={handleConvertHexToRgb}>
            HEX → RGB/HSL
          </GenerateButton>
          {rgbResult && <OutputField value={rgbResult} label="RGB" />}
          {hslResult && <OutputField value={hslResult} label="HSL" />}
          
          <div className="pt-3 border-t border-slate-700/50">
            <div className="grid grid-cols-3 gap-2">
              <InputField label="R" value={rgbR} onChange={setRgbR} type="number" />
              <InputField label="G" value={rgbG} onChange={setRgbG} type="number" />
              <InputField label="B" value={rgbB} onChange={setRgbB} type="number" />
            </div>
            <GenerateButton onClick={handleConvertRgbToHex}>
              RGB → HEX
            </GenerateButton>
            {hexResult && <OutputField value={hexResult} label="HEX" />}
          </div>
        </ToolCard>

        {/* Temperature Converter */}
        <ToolCard
          title="Температура"
          description="Конвертация температурных шкал"
          icon={<Thermometer className="w-5 h-5" />}
        >
          <InputField
            label="Цельсий (°C)"
            value={tempInput}
            onChange={setTempInput}
            type="number"
            placeholder="25"
          />
          <GenerateButton onClick={handleConvertTemperature}>
            Конвертировать
          </GenerateButton>
          {celsiusToF && <OutputField value={celsiusToF} label="Фаренгейт" />}
          {celsiusToK && <OutputField value={celsiusToK} label="Кельвин" />}
        </ToolCard>

      </div>
    </div>
  );
}
