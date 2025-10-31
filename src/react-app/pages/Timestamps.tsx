import { useState } from 'react';
import { Clock } from 'lucide-react';
import ToolCard, { OutputField, GenerateButton, InputField } from '@/react-app/components/ToolCard';
import {
  getCurrentUnixTimestamp,
  getCurrentMillisTimestamp,
  getCurrentISOTimestamp,
  unixToDate,
} from '@/react-app/utils/generators';

export default function TimestampsPage() {
  // Timestamp states
  const [unixTime, setUnixTime] = useState('');
  const [millisTime, setMillisTime] = useState('');
  const [isoTime, setIsoTime] = useState('');
  const [convertUnix, setConvertUnix] = useState('');
  const [convertedDate, setConvertedDate] = useState('');

  const handleGenerateTimestamps = () => {
    setUnixTime(getCurrentUnixTimestamp().toString());
    setMillisTime(getCurrentMillisTimestamp().toString());
    setIsoTime(getCurrentISOTimestamp());
  };

  const handleConvertTimestamp = () => {
    if (convertUnix) {
      setConvertedDate(unixToDate(parseInt(convertUnix)));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Время и даты</h1>
        <p className="text-slate-400">Работа с временными метками и конвертеры дат</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timestamp Generator */}
        <ToolCard
          title="Генератор временных меток"
          description="Получение текущего времени в различных форматах"
          icon={<Clock className="w-5 h-5" />}
        >
          <GenerateButton onClick={handleGenerateTimestamps}>
            Получить текущее время
          </GenerateButton>
          {unixTime && <OutputField value={unixTime} label="Unix Timestamp (секунды)" />}
          {millisTime && <OutputField value={millisTime} label="Миллисекунды" />}
          {isoTime && <OutputField value={isoTime} label="ISO 8601" />}
        </ToolCard>

        {/* Timestamp Converter */}
        <ToolCard
          title="Конвертер временных меток"
          description="Преобразование Unix timestamp в читаемую дату"
          icon={<Clock className="w-5 h-5" />}
        >
          <InputField
            label="Unix Timestamp"
            value={convertUnix}
            onChange={setConvertUnix}
            type="number"
            placeholder="1672531200"
          />
          <GenerateButton onClick={handleConvertTimestamp}>
            Конвертировать в дату
          </GenerateButton>
          {convertedDate && <OutputField value={convertedDate} label="ISO дата" />}
        </ToolCard>

      </div>
    </div>
  );
}
