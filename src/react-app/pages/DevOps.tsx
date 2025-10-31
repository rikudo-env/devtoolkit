import { useState } from 'react';
import { Server, Key, Container, Settings, Terminal } from 'lucide-react';
import ToolCard, { OutputField, GenerateButton, InputField } from '@/react-app/components/ToolCard';
import {
  generateSSHKeyPair,
  generateDockerCommand,
  generateKubernetesYaml,
  generateNginxConfig,
  generateSystemdService,
  generateCronExpression,
  parseCronExpression
} from '@/react-app/utils/devops';

export default function DevOpsPage() {
  // SSH Key states
  const [sshPublicKey, setSshPublicKey] = useState('');
  const [sshPrivateKey, setSshPrivateKey] = useState('');

  // Docker Command states
  const [dockerImage, setDockerImage] = useState('nginx:latest');
  const [dockerName, setDockerName] = useState('my-app');
  const [dockerPorts, setDockerPorts] = useState('80:80');
  const [dockerCommand, setDockerCommand] = useState('');

  // Kubernetes states
  const [k8sName, setK8sName] = useState('my-app');
  const [k8sImage, setK8sImage] = useState('nginx:latest');
  const [k8sReplicas, setK8sReplicas] = useState('3');
  const [k8sPort, setK8sPort] = useState('80');
  const [k8sYaml, setK8sYaml] = useState('');

  // Nginx states
  const [nginxServer, setNginxServer] = useState('example.com');
  const [nginxProxy, setNginxProxy] = useState('http://localhost:3000');
  const [nginxConfig, setNginxConfig] = useState('');

  // Systemd states
  const [systemdName, setSystemdName] = useState('my-service');
  const [systemdDescription, setSystemdDescription] = useState('My Application Service');
  const [systemdExecStart, setSystemdExecStart] = useState('/usr/bin/node /app/server.js');
  const [systemdService, setSystemdService] = useState('');

  // Cron states
  const [cronMinute, setCronMinute] = useState('0');
  const [cronHour, setCronHour] = useState('2');
  const [cronDay, setCronDay] = useState('*');
  const [cronMonth, setCronMonth] = useState('*');
  const [cronWeekday, setCronWeekday] = useState('*');
  const [cronExpression, setCronExpression] = useState('');
  const [cronDescription, setCronDescription] = useState('');

  const handleGenerateSSH = async () => {
    try {
      const keyPair = await generateSSHKeyPair();
      setSshPublicKey(keyPair.publicKey);
      setSshPrivateKey(keyPair.privateKey);
    } catch (error) {
      setSshPublicKey('Ошибка генерации ключей');
      setSshPrivateKey('');
    }
  };

  const handleGenerateDocker = () => {
    const ports = dockerPorts ? [dockerPorts] : [];
    const command = generateDockerCommand({
      image: dockerImage,
      name: dockerName,
      ports,
      detached: true,
      remove: true
    });
    setDockerCommand(command);
  };

  const handleGenerateK8s = () => {
    const yaml = generateKubernetesYaml({
      name: k8sName,
      image: k8sImage,
      replicas: parseInt(k8sReplicas) || 1,
      port: parseInt(k8sPort) || 80
    });
    setK8sYaml(yaml);
  };

  const handleGenerateNginx = () => {
    const config = generateNginxConfig({
      serverName: nginxServer,
      proxyPass: nginxProxy || undefined
    });
    setNginxConfig(config);
  };

  const handleGenerateSystemd = () => {
    const service = generateSystemdService({
      name: systemdName,
      description: systemdDescription,
      execStart: systemdExecStart
    });
    setSystemdService(service);
  };

  const handleGenerateCron = () => {
    const expression = generateCronExpression({
      minute: cronMinute,
      hour: cronHour,
      day: cronDay,
      month: cronMonth,
      weekday: cronWeekday
    });
    setCronExpression(expression);
    setCronDescription(parseCronExpression(expression));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">DevOps</h1>
        <p className="text-slate-400">Инструменты для DevOps инженеров и системных администраторов</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SSH Key Generator */}
        <ToolCard
          title="Генератор SSH ключей"
          description="Создание пары SSH ключей для аутентификации"
          icon={<Key className="w-5 h-5" />}
        >
          <GenerateButton onClick={handleGenerateSSH}>
            Сгенерировать SSH ключи
          </GenerateButton>
          {sshPublicKey && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Публичный ключ</label>
                <textarea
                  value={sshPublicKey}
                  readOnly
                  rows={3}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Приватный ключ</label>
                <textarea
                  value={sshPrivateKey}
                  readOnly
                  rows={4}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </ToolCard>

        {/* Docker Command Generator */}
        <ToolCard
          title="Docker команды"
          description="Генерация Docker команд запуска"
          icon={<Container className="w-5 h-5" />}
        >
          <InputField
            label="Образ"
            value={dockerImage}
            onChange={setDockerImage}
            placeholder="nginx:latest"
          />
          <InputField
            label="Имя контейнера"
            value={dockerName}
            onChange={setDockerName}
            placeholder="my-app"
          />
          <InputField
            label="Порты (host:container)"
            value={dockerPorts}
            onChange={setDockerPorts}
            placeholder="80:80"
          />
          <GenerateButton onClick={handleGenerateDocker}>
            Сгенерировать команду
          </GenerateButton>
          {dockerCommand && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Docker команда</label>
              <textarea
                value={dockerCommand}
                readOnly
                rows={2}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none resize-none"
              />
            </div>
          )}
        </ToolCard>

        {/* Kubernetes YAML Generator */}
        <ToolCard
          title="Kubernetes YAML"
          description="Генерация манифестов Kubernetes"
          icon={<Settings className="w-5 h-5" />}
        >
          <InputField
            label="Имя приложения"
            value={k8sName}
            onChange={setK8sName}
            placeholder="my-app"
          />
          <InputField
            label="Образ"
            value={k8sImage}
            onChange={setK8sImage}
            placeholder="nginx:latest"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Реплики"
              value={k8sReplicas}
              onChange={setK8sReplicas}
              type="number"
              placeholder="3"
            />
            <InputField
              label="Порт"
              value={k8sPort}
              onChange={setK8sPort}
              type="number"
              placeholder="80"
            />
          </div>
          <GenerateButton onClick={handleGenerateK8s}>
            Сгенерировать YAML
          </GenerateButton>
          {k8sYaml && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Kubernetes манифест</label>
              <textarea
                value={k8sYaml}
                readOnly
                rows={8}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none resize-none"
              />
            </div>
          )}
        </ToolCard>

        {/* Nginx Config Generator */}
        <ToolCard
          title="Nginx конфигурация"
          description="Генерация конфигурации Nginx"
          icon={<Server className="w-5 h-5" />}
        >
          <InputField
            label="Доменное имя"
            value={nginxServer}
            onChange={setNginxServer}
            placeholder="example.com"
          />
          <InputField
            label="Proxy Pass (опционально)"
            value={nginxProxy}
            onChange={setNginxProxy}
            placeholder="http://localhost:3000"
          />
          <GenerateButton onClick={handleGenerateNginx}>
            Сгенерировать конфиг
          </GenerateButton>
          {nginxConfig && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Nginx конфигурация</label>
              <textarea
                value={nginxConfig}
                readOnly
                rows={6}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none resize-none"
              />
            </div>
          )}
        </ToolCard>

        {/* Systemd Service Generator */}
        <ToolCard
          title="Systemd сервис"
          description="Генерация файлов systemd сервисов"
          icon={<Settings className="w-5 h-5" />}
        >
          <InputField
            label="Имя сервиса"
            value={systemdName}
            onChange={setSystemdName}
            placeholder="my-service"
          />
          <InputField
            label="Описание"
            value={systemdDescription}
            onChange={setSystemdDescription}
            placeholder="My Application Service"
          />
          <InputField
            label="ExecStart"
            value={systemdExecStart}
            onChange={setSystemdExecStart}
            placeholder="/usr/bin/node /app/server.js"
          />
          <GenerateButton onClick={handleGenerateSystemd}>
            Сгенерировать сервис
          </GenerateButton>
          {systemdService && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Systemd сервис</label>
              <textarea
                value={systemdService}
                readOnly
                rows={6}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none resize-none"
              />
            </div>
          )}
        </ToolCard>

        {/* Cron Expression Generator */}
        <ToolCard
          title="Cron выражения"
          description="Генерация и парсинг cron выражений"
          icon={<Terminal className="w-5 h-5" />}
        >
          <div className="grid grid-cols-5 gap-2">
            <InputField label="Мин" value={cronMinute} onChange={setCronMinute} placeholder="0" />
            <InputField label="Час" value={cronHour} onChange={setCronHour} placeholder="2" />
            <InputField label="День" value={cronDay} onChange={setCronDay} placeholder="*" />
            <InputField label="Мес" value={cronMonth} onChange={setCronMonth} placeholder="*" />
            <InputField label="Нед" value={cronWeekday} onChange={setCronWeekday} placeholder="*" />
          </div>
          <GenerateButton onClick={handleGenerateCron}>
            Сгенерировать cron
          </GenerateButton>
          {cronExpression && <OutputField value={cronExpression} label="Cron выражение" />}
          {cronDescription && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Описание</label>
              <p className="text-sm text-slate-300 bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2">
                {cronDescription}
              </p>
            </div>
          )}
        </ToolCard>

      </div>
    </div>
  );
}
