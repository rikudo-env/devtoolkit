import { useState } from 'react';
import { 
  Fingerprint,
  Key,
  Lock,
  Type,
  Shuffle
} from 'lucide-react';
import ToolCard, { OutputField, GenerateButton, InputField } from '@/react-app/components/ToolCard';
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

export default function GeneratorsPage() {
  // UUID states
  const [uuid4, setUuid4] = useState('');
  const [uuid1, setUuid1] = useState('');

  // Token states
  const [randomToken, setRandomToken] = useState('');
  const [hexToken, setHexToken] = useState('');
  const [base64Token, setBase64Token] = useState('');
  const [tokenLength, setTokenLength] = useState('32');

  // Password states
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState('16');

  // Random words states
  const [randomWords, setRandomWords] = useState('');
  const [wordCount, setWordCount] = useState('3');

  // JWT states
  const [jwtPayload, setJwtPayload] = useState('{"sub":"1234567890","name":"John Doe"}');
  const [jwt, setJwt] = useState('');

  // Random number states
  const [randomInt, setRandomInt] = useState('');
  const [randomFloat, setRandomFloat] = useState('');
  const [minNum, setMinNum] = useState('1');
  const [maxNum, setMaxNum] = useState('100');

  const handleGenerateUUIDs = () => {
    setUuid4(generateUUIDv4());
    setUuid1(generateUUIDv1());
  };

  const handleGenerateTokens = () => {
    const length = parseInt(tokenLength) || 32;
    setRandomToken(generateRandomToken(length));
    setHexToken(generateHexToken(length));
    setBase64Token(generateBase64Token(length));
  };

  const handleGeneratePassword = () => {
    const length = parseInt(passwordLength) || 16;
    setPassword(generatePassword(length, true));
  };

  const handleGenerateWords = () => {
    const count = parseInt(wordCount) || 3;
    setRandomWords(generateRandomWords(count, '-'));
  };

  const handleGenerateJWT = () => {
    try {
      const payload = JSON.parse(jwtPayload);
      setJwt(generateMockJWT(payload));
    } catch {
      setJwt('Invalid JSON payload');
    }
  };

  const handleGenerateNumbers = () => {
    const min = parseInt(minNum) || 1;
    const max = parseInt(maxNum) || 100;
    setRandomInt(generateRandomNumber(min, max).toString());
    setRandomFloat(generateRandomFloat(min, max, 2).toString());
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Генераторы</h1>
        <p className="text-slate-400">UUID, токены, пароли и другие случайные данные</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* UUID Generator */}
        <ToolCard
          title="UUID Generator"
          description="Генерация универсальных уникальных идентификаторов"
          icon={<Fingerprint className="w-5 h-5" />}
        >
          <GenerateButton onClick={handleGenerateUUIDs}>
            Сгенерировать UUID
          </GenerateButton>
          {uuid4 && <OutputField value={uuid4} label="UUID v4" />}
          {uuid1 && <OutputField value={uuid1} label="UUID v1" />}
        </ToolCard>

        {/* Token Generator */}
        <ToolCard
          title="Генератор токенов"
          description="Создание безопасных случайных токенов"
          icon={<Key className="w-5 h-5" />}
        >
          <InputField
            label="Длина токена"
            value={tokenLength}
            onChange={setTokenLength}
            type="number"
            placeholder="32"
          />
          <GenerateButton onClick={handleGenerateTokens}>
            Сгенерировать токены
          </GenerateButton>
          {randomToken && <OutputField value={randomToken} label="Алфавитно-цифровой токен" />}
          {hexToken && <OutputField value={hexToken} label="Hex токен" />}
          {base64Token && <OutputField value={base64Token} label="Base64 токен" />}
        </ToolCard>

        {/* Password Generator */}
        <ToolCard
          title="Генератор паролей"
          description="Создание надёжных случайных паролей"
          icon={<Lock className="w-5 h-5" />}
        >
          <InputField
            label="Длина пароля"
            value={passwordLength}
            onChange={setPasswordLength}
            type="number"
            placeholder="16"
          />
          <GenerateButton onClick={handleGeneratePassword}>
            Сгенерировать пароль
          </GenerateButton>
          {password && <OutputField value={password} label="Пароль" />}
        </ToolCard>

        {/* Random Words */}
        <ToolCard
          title="Случайные слова"
          description="Генерация комбинаций случайных слов"
          icon={<Type className="w-5 h-5" />}
        >
          <InputField
            label="Количество слов"
            value={wordCount}
            onChange={setWordCount}
            type="number"
            placeholder="3"
          />
          <GenerateButton onClick={handleGenerateWords}>
            Сгенерировать слова
          </GenerateButton>
          {randomWords && <OutputField value={randomWords} label="Случайные слова" />}
        </ToolCard>

        {/* JWT Generator */}
        <ToolCard
          title="Генератор JWT (Mock)"
          description="Создание JWT токенов для тестирования"
          icon={<Key className="w-5 h-5" />}
        >
          <InputField
            label="Payload (JSON)"
            value={jwtPayload}
            onChange={setJwtPayload}
            placeholder='{"sub":"1234567890"}'
          />
          <GenerateButton onClick={handleGenerateJWT}>
            Сгенерировать JWT
          </GenerateButton>
          {jwt && <OutputField value={jwt} label="JWT токен" />}
        </ToolCard>

        {/* Random Numbers */}
        <ToolCard
          title="Случайные числа"
          description="Генерация случайных целых чисел и чисел с плавающей точкой"
          icon={<Shuffle className="w-5 h-5" />}
        >
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Мин"
              value={minNum}
              onChange={setMinNum}
              type="number"
              placeholder="1"
            />
            <InputField
              label="Макс"
              value={maxNum}
              onChange={setMaxNum}
              type="number"
              placeholder="100"
            />
          </div>
          <GenerateButton onClick={handleGenerateNumbers}>
            Сгенерировать числа
          </GenerateButton>
          {randomInt && <OutputField value={randomInt} label="Случайное целое" />}
          {randomFloat && <OutputField value={randomFloat} label="Случайное число" />}
        </ToolCard>

      </div>
    </div>
  );
}
