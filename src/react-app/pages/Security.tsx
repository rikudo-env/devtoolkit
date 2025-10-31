import { useState } from 'react';
import { Hash, Binary } from 'lucide-react';
import ToolCard, { OutputField, GenerateButton, InputField } from '@/react-app/components/ToolCard';
import {
  generateSHA256,
  generateSHA512,
  encodeBase64,
  decodeBase64,
  encodeURL,
  decodeURL,
} from '@/react-app/utils/generators';

export default function SecurityPage() {
  // Hash states
  const [hashInput, setHashInput] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha512Hash, setSha512Hash] = useState('');

  // Encoding states
  const [encodeInput, setEncodeInput] = useState('');
  const [base64Encoded, setBase64Encoded] = useState('');
  const [urlEncoded, setUrlEncoded] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [base64Decoded, setBase64Decoded] = useState('');
  const [urlDecoded, setUrlDecoded] = useState('');

  const handleGenerateHashes = async () => {
    if (hashInput) {
      setSha256Hash(await generateSHA256(hashInput));
      setSha512Hash(await generateSHA512(hashInput));
    }
  };

  const handleEncode = () => {
    if (encodeInput) {
      setBase64Encoded(encodeBase64(encodeInput));
      setUrlEncoded(encodeURL(encodeInput));
    }
  };

  const handleDecode = () => {
    if (decodeInput) {
      try {
        setBase64Decoded(decodeBase64(decodeInput));
      } catch {
        setBase64Decoded('Неверный Base64');
      }
      try {
        setUrlDecoded(decodeURL(decodeInput));
      } catch {
        setUrlDecoded('Неверное URL кодирование');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Безопасность</h1>
        <p className="text-slate-400">Хеширование, кодирование и криптографические утилиты</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hash Generator */}
        <ToolCard
          title="Генератор хешей"
          description="Создание криптографических хешей"
          icon={<Hash className="w-5 h-5" />}
        >
          <InputField
            label="Текст для хеширования"
            value={hashInput}
            onChange={setHashInput}
            placeholder="Введите текст для хеширования"
          />
          <GenerateButton onClick={handleGenerateHashes}>
            Сгенерировать хеши
          </GenerateButton>
          {sha256Hash && <OutputField value={sha256Hash} label="SHA-256" />}
          {sha512Hash && <OutputField value={sha512Hash} label="SHA-512" />}
        </ToolCard>

        {/* Encoder */}
        <ToolCard
          title="Кодировщик"
          description="Кодирование текста в Base64 и URL форматы"
          icon={<Binary className="w-5 h-5" />}
        >
          <InputField
            label="Текст для кодирования"
            value={encodeInput}
            onChange={setEncodeInput}
            placeholder="Введите текст для кодирования"
          />
          <GenerateButton onClick={handleEncode}>
            Закодировать
          </GenerateButton>
          {base64Encoded && <OutputField value={base64Encoded} label="Base64" />}
          {urlEncoded && <OutputField value={urlEncoded} label="URL закодировано" />}
        </ToolCard>

        {/* Decoder */}
        <ToolCard
          title="Декодировщик"
          description="Декодирование Base64 и URL закодированного текста"
          icon={<Binary className="w-5 h-5" />}
        >
          <InputField
            label="Текст для декодирования"
            value={decodeInput}
            onChange={setDecodeInput}
            placeholder="Введите текст для декодирования"
          />
          <GenerateButton onClick={handleDecode}>
            Декодировать
          </GenerateButton>
          {base64Decoded && <OutputField value={base64Decoded} label="Base64 декодировано" />}
          {urlDecoded && <OutputField value={urlDecoded} label="URL декодировано" />}
        </ToolCard>

      </div>
    </div>
  );
}
