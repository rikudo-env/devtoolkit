import { useState } from 'react';
import { Network, Globe, Wifi, MapPin } from 'lucide-react';
import ToolCard, { OutputField, GenerateButton, InputField } from '@/react-app/components/ToolCard';
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

export default function NetworkPage() {
  // IP Converter states
  const [ipInput, setIpInput] = useState('192.168.1.1');
  const [ipInt, setIpInt] = useState('');
  const [ipBinary, setIpBinary] = useState('');
  const [ipHex, setIpHex] = useState('');

  // CIDR Calculator states
  const [cidrInput, setCidrInput] = useState('192.168.1.0/24');
  const [cidrResult, setCidrResult] = useState<any>(null);

  // Port Info states
  const [portInput, setPortInput] = useState('80');
  const [portDescription, setPortDescription] = useState('');
  const [portCategory, setPortCategory] = useState('');

  // MAC Address states
  const [macInput, setMacInput] = useState('');
  const [formattedMac, setFormattedMac] = useState('');
  const [randomMac, setRandomMac] = useState('');

  // Subnet splitter states
  const [splitCidr, setSplitCidr] = useState('192.168.1.0/24');
  const [newPrefix, setNewPrefix] = useState('26');
  const [splitResult, setSplitResult] = useState<string[]>([]);

  const handleConvertIP = () => {
    try {
      setIpInt(ipv4ToInt(ipInput).toString());
      setIpBinary(ipv4ToBinary(ipInput));
      setIpHex(ipv4ToHex(ipInput));
    } catch (error) {
      setIpInt('Ошибка: ' + (error as Error).message);
      setIpBinary('');
      setIpHex('');
    }
  };

  const handleCalculateCIDR = () => {
    try {
      const result = calculateCIDR(cidrInput);
      setCidrResult(result);
    } catch (error) {
      setCidrResult({ error: (error as Error).message });
    }
  };

  const handlePortInfo = () => {
    const port = parseInt(portInput);
    if (!isNaN(port)) {
      setPortDescription(getPortDescription(port));
      setPortCategory(getPortCategory(port));
    }
  };

  const handleFormatMac = () => {
    try {
      setFormattedMac(formatMacAddress(macInput));
    } catch (error) {
      setFormattedMac('Ошибка: ' + (error as Error).message);
    }
  };

  const handleGenerateMac = () => {
    setRandomMac(generateRandomMac());
  };

  const handleSplitSubnet = () => {
    try {
      const result = splitSubnet(splitCidr, parseInt(newPrefix));
      setSplitResult(result);
    } catch (error) {
      setSplitResult(['Ошибка: ' + (error as Error).message]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Сетевые утилиты</h1>
        <p className="text-slate-400">IP адреса, CIDR, порты и другие сетевые инструменты</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* IP Converter */}
        <ToolCard
          title="Конвертер IP адресов"
          description="Преобразование IP адресов в разные форматы"
          icon={<Globe className="w-5 h-5" />}
        >
          <InputField
            label="IP адрес"
            value={ipInput}
            onChange={setIpInput}
            placeholder="192.168.1.1"
          />
          <GenerateButton onClick={handleConvertIP}>
            Конвертировать
          </GenerateButton>
          {ipInt && <OutputField value={ipInt} label="Целое число" />}
          {ipBinary && <OutputField value={ipBinary} label="Двоичный" />}
          {ipHex && <OutputField value={ipHex} label="Шестнадцатеричный" />}
        </ToolCard>

        {/* CIDR Calculator */}
        <ToolCard
          title="CIDR калькулятор"
          description="Расчёт сетевых параметров CIDR"
          icon={<Network className="w-5 h-5" />}
        >
          <InputField
            label="CIDR"
            value={cidrInput}
            onChange={setCidrInput}
            placeholder="192.168.1.0/24"
          />
          <GenerateButton onClick={handleCalculateCIDR}>
            Рассчитать
          </GenerateButton>
          {cidrResult && !cidrResult.error && (
            <>
              <OutputField value={cidrResult.networkAddress} label="Сетевой адрес" />
              <OutputField value={cidrResult.broadcastAddress} label="Широковещательный" />
              <OutputField value={cidrResult.subnetMask} label="Маска подсети" />
              <OutputField value={cidrResult.firstUsable} label="Первый адрес" />
              <OutputField value={cidrResult.lastUsable} label="Последний адрес" />
              <OutputField value={cidrResult.usableHosts.toString()} label="Количество хостов" />
            </>
          )}
          {cidrResult && cidrResult.error && (
            <OutputField value={cidrResult.error} label="Ошибка" />
          )}
        </ToolCard>

        {/* Port Information */}
        <ToolCard
          title="Информация о портах"
          description="Получение информации о сетевых портах"
          icon={<MapPin className="w-5 h-5" />}
        >
          <InputField
            label="Номер порта"
            value={portInput}
            onChange={setPortInput}
            type="number"
            placeholder="80"
          />
          <GenerateButton onClick={handlePortInfo}>
            Получить информацию
          </GenerateButton>
          {portDescription && <OutputField value={portDescription} label="Описание" />}
          {portCategory && <OutputField value={portCategory} label="Категория" />}
        </ToolCard>

        {/* MAC Address Tools */}
        <ToolCard
          title="MAC адреса"
          description="Форматирование и генерация MAC адресов"
          icon={<Wifi className="w-5 h-5" />}
        >
          <InputField
            label="MAC адрес"
            value={macInput}
            onChange={setMacInput}
            placeholder="001122334455"
          />
          <div className="grid grid-cols-2 gap-2">
            <GenerateButton onClick={handleFormatMac}>
              Форматировать
            </GenerateButton>
            <GenerateButton onClick={handleGenerateMac}>
              Сгенерировать
            </GenerateButton>
          </div>
          {formattedMac && <OutputField value={formattedMac} label="Отформатированный MAC" />}
          {randomMac && <OutputField value={randomMac} label="Случайный MAC" />}
        </ToolCard>

        {/* Subnet Splitter */}
        <ToolCard
          title="Разделение подсети"
          description="Разделение CIDR на более мелкие подсети"
          icon={<Network className="w-5 h-5" />}
        >
          <InputField
            label="CIDR для разделения"
            value={splitCidr}
            onChange={setSplitCidr}
            placeholder="192.168.1.0/24"
          />
          <InputField
            label="Новый префикс"
            value={newPrefix}
            onChange={setNewPrefix}
            type="number"
            placeholder="26"
          />
          <GenerateButton onClick={handleSplitSubnet}>
            Разделить подсеть
          </GenerateButton>
          {splitResult.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Подсети:</label>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {splitResult.map((subnet, index) => (
                  <OutputField key={index} value={subnet} />
                ))}
              </div>
            </div>
          )}
        </ToolCard>

      </div>
    </div>
  );
}
