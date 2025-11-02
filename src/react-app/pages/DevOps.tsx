'use client';

import { useState, useRef } from 'react';
import {
  Terminal, Globe, Container, Settings, HardDrive, Server, Database,
  GitBranch, Shield, Cpu, Zap, Search, Copy, Download, X, ExternalLink,
  ChevronRight, FileText, AlertTriangle,
  Package, Wrench, Monitor,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// === Модальное окно ===
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {title}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// === Tools (Частые команды, которые все забывают) ===
interface ToolItem {
  id: string;
  title: string;
  category: string;
  command: string;
  preview: string; // Краткое превью
  tags: string[];
  distro?: string[];
}

const tools: ToolItem[] = [
  {
    id: 'docker-clean',
    title: 'Docker: Полная очистка',
    category: 'Docker',
    command: `docker system prune -a --volumes -f`,
    preview: 'Удалить всё: образы, контейнеры, volumes',
    tags: ['docker', 'cleanup', 'prune'],
    distro: ['Ubuntu', 'CentOS', 'Debian']
  },
  {
    id: 'docker-logs',
    title: 'Docker: Логи + очистка',
    category: 'Docker',
    command: `docker logs -f container_name
docker system df
sudo truncate -s 0 /var/lib/docker/containers/*/container.log`,
    preview: 'Следить за логами и очистить их',
    tags: ['docker', 'logs', 'truncate'],
    distro: ['Ubuntu', 'Debian']
  },
  {
    id: 'ssh-keygen',
    title: 'SSH: Новый ключ (ed25519)',
    category: 'Network',
    command: `ssh-keygen -t ed25519 -C "your@email.com" -f ~/.ssh/id_ed25519`,
    preview: 'Генерация безопасного ключа',
    tags: ['ssh', 'keygen', 'ed25519']
  },
  {
    id: 'git-undo',
    title: 'Git: Откат последнего коммита',
    category: 'Git',
    command: `git reset --soft HEAD~1  # оставить изменения
git reset --hard HEAD~1   # удалить всё`,
    preview: 'Откат коммита (soft/hard)',
    tags: ['git', 'reset', 'undo']
  },
  {
    id: 'systemd-reload',
    title: 'Systemd: Перезагрузить юнит без даунтайма',
    category: 'Linux',
    command: `sudo systemctl daemon-reload
sudo systemctl restart myapp`,
    preview: 'Перезапуск сервиса',
    tags: ['systemd', 'restart', 'reload'],
    distro: ['Ubuntu', 'CentOS', 'Fedora']
  },
  {
    id: 'find-large',
    title: 'Найти большие файлы (>100M)',
    category: 'Linux',
    command: `find / -type f -size +100M -exec ls -lh {} \\; 2>/dev/null`,
    preview: 'Поиск тяжёлых файлов',
    tags: ['find', 'disk', 'cleanup']
  },
  {
    id: 'nested-vm',
    title: 'QEMU: Nested VM (внутри VM)',
    category: 'Virtualization',
    command: `qemu-system-x86_64 -enable-kvm -cpu host,+vmx -m 4G -drive file=vm.img`,
    preview: 'Вложенная виртуализация',
    tags: ['qemu', 'kvm', 'nested'],
    distro: ['Ubuntu', 'Fedora']
  },
  {
    id: 'gpu-passthrough',
    title: 'QEMU: GPU Passthrough',
    category: 'Virtualization',
    command: `qemu-system-x86_64 -device vfio-pci,host=01:00.0 -cpu host,kvm=off`,
    preview: 'GPU в VM (игры/ML)',
    tags: ['gpu', 'passthrough', 'nvidia'],
    distro: ['Ubuntu', 'Arch']
  }
];

// === Knowledge (Подробные гайды с иконками) ===
interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  links?: { text: string; url: string }[];
  distro?: string[];
}

const knowledgeBase: KnowledgeItem[] = [
  {
    id: 'gpu-passthrough-guide',
    title: 'QEMU/KVM: GPU Passthrough (Полный гайд 2025)',
    category: 'Virtualization',
    content: `# GPU Passthrough — 95–99% производительности

> Требуется: 2 GPU, IOMMU, UEFI

## 1. BIOS
- IOMMU: Включить
- Resizable BAR: Отключить
- Above 4G: Включить

## 2. Установка
\`\`\`bash
sudo apt install qemu-kvm libvirt-clients virt-manager ovmf
\`\`\`

## 3. IOMMU
\`\`\`bash
# /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="amd_iommu=on iommu=pt pcie_acs_override=downstream"
\`\`\`

## 4. Изолировать GPU
\`\`\`bash
lspci -nn | grep VGA
# options vfio-pci ids=10de:2489,10de:228b
\`\`\`

## 5. XML
\`\`\`xml
<kvm><hidden state='on'/></kvm>
<vendor_id state='on' value='123456789pve'/>
\`\`\``,
    tags: ['qemu', 'kvm', 'gpu', 'passthrough'],
    links: [
      { text: 'Arch Wiki', url: 'https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF' },
      { text: 'VFIO', url: 'https://www.reddit.com/r/VFIO/' }
    ],
    distro: ['Ubuntu', 'Arch']
  },
  {
    id: 'ssh-tunnel',
    title: 'SSH Туннели: L, R, D (SOCKS5)',
    category: 'Network',
    content: `# SSH Туннели

## Локальный (-L)
\`\`\`bash
ssh -L 8080:localhost:80 user@remote
\`\`\`

## Реверсный (-R)
\`\`\`bash
ssh -R 8080:localhost:3000 user@public
\`\`\`

## SOCKS5 (-D)
\`\`\`bash
ssh -D 1080 user@server
\`\`\``,
    tags: ['ssh', 'tunnel', 'proxy'],
    links: [{ text: 'OpenSSH', url: 'https://www.openssh.com' }]
  },
  {
    id: 'docker-cleanup',
    title: 'Docker: Полная очистка',
    category: 'Docker',
    content: `# Docker — полная очистка

\`\`\`bash
docker system prune -a --volumes -f
\`\`\``,
    tags: ['docker', 'prune', 'cleanup']
  },
  {
    id: 'k8s-debug',
    title: 'K8s: Диагностика подов',
    category: 'Kubernetes',
    content: `# K8s Debug

\`\`\`bash
kubectl logs pod -f
kubectl exec -it pod -- sh
kubectl describe pod
\`\`\``,
    tags: ['k8s', 'kubectl', 'debug']
  },
  {
    id: 'systemd-service',
    title: 'Systemd: Надёжный сервис',
    category: 'Linux',
    content: `# Systemd Unit

\`\`\`ini
[Service]
Restart=always
RestartSec=5
\`\`\``,
    tags: ['systemd', 'service'],
    distro: ['Ubuntu', 'CentOS']
  },
  {
    id: 'nginx-ssl',
    title: 'Nginx: SSL + Let\'s Encrypt',
    category: 'Web',
    content: `# Nginx SSL

\`\`\`bash
sudo certbot --nginx -d example.com
\`\`\``,
    tags: ['nginx', 'ssl'],
    distro: ['Ubuntu']
  },
  {
    id: 'cron-backup',
    title: 'Cron: Резервное копирование',
    category: 'Backup',
    content: `# Cron Backup

\`\`\`bash
0 2 * * * rsync -a /data/ /backup/
\`\`\``,
    tags: ['cron', 'backup']
  },
  {
    id: 'git-hooks',
    title: 'Git: Pre-commit хуки',
    category: 'Git',
    content: `# Pre-commit

\`\`\`bash
npm run lint || exit 1
\`\`\``,
    tags: ['git', 'hooks']
  },
  {
    id: 'iptables-rules',
    title: 'iptables: Базовая защита',
    category: 'Security',
    content: `# iptables

\`\`\`bash
*filter
:INPUT DROP
-A INPUT -p tcp --dport 22 -j ACCEPT
COMMIT
\`\`\``,
    tags: ['iptables', 'firewall']
  },
  {
    id: 'monitoring',
    title: 'Мониторинг: htop + glances',
    category: 'Monitoring',
    content: `# Мониторинг

\`\`\`bash
htop
glances
\`\`\``,
    tags: ['htop', 'glances']
  },
  {
    id: 'ansible-playbook',
    title: 'Ansible: Деплой',
    category: 'Automation',
    content: `# Ansible

\`\`\`yaml
- name: Install Node
  apt: name=nodejs
\`\`\``,
    tags: ['ansible', 'deploy']
  },
  {
    id: 'ufw-setup',
    title: 'UFW: Простой файрвол',
    category: 'Security',
    content: `# UFW

\`\`\`bash
sudo ufw allow ssh
sudo ufw enable
\`\`\``,
    tags: ['ufw', 'firewall'],
    distro: ['Ubuntu']
  },
  {
    id: 'fail2ban',
    title: 'Fail2Ban: Защита от брута',
    category: 'Security',
    content: `# Fail2Ban

\`\`\`ini
[sshd]
enabled = true
maxretry = 5
\`\`\``,
    tags: ['fail2ban', 'security']
  },
  {
    id: 'lvm-snapshot',
    title: 'LVM: Снапшоты',
    category: 'Storage',
    content: `# LVM Snapshot

\`\`\`bash
lvcreate -L 10G -s -n snap /dev/vg/data
\`\`\``,
    tags: ['lvm', 'snapshot']
  },
  {
    id: 'zfs-pool',
    title: 'ZFS: Пул и датасет',
    category: 'Storage',
    content: `# ZFS

\`\`\`bash
zpool create tank /dev/sdb
zfs create tank/data
\`\`\``,
    tags: ['zfs', 'storage'],
    distro: ['Ubuntu']
  }
];

// === Иконка дистрибутива (с tooltip) ===
const DistroIcon: React.FC<{ name: string }> = ({ name }) => {
  const colors: Record<string, string> = {
    Ubuntu: 'text-orange-500',
    CentOS: 'text-purple-500',
    Debian: 'text-red-500',
    Fedora: 'text-blue-500',
    Arch: 'text-cyan-500',
  };
  return (
    <Terminal
      className={`w-4 h-4 ${colors[name] || 'text-gray-500'}`}
    />
  );
};

// === Иконка категории ===
const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Virtualization: <Cpu className="w-5 h-5 text-purple-400" />,
    Network: <Globe className="w-5 h-5 text-cyan-400" />,
    Docker: <Container className="w-5 h-5 text-green-400" />,
    Kubernetes: <Settings className="w-5 h-5 text-indigo-400" />,
    Linux: <HardDrive className="w-5 h-5 text-orange-400" />,
    Web: <Server className="w-5 h-5 text-teal-400" />,
    Backup: <Database className="w-5 h-5 text-amber-400" />,
    Git: <GitBranch className="w-5 h-5 text-pink-400" />,
    Security: <Shield className="w-5 h-5 text-red-400" />,
    Monitoring: <Monitor className="w-5 h-5 text-yellow-400" />,
    Automation: <Zap className="w-5 h-5 text-emerald-400" />,
    Storage: <Package className="w-5 h-5 text-lime-400" />,
  };
  return iconMap[category] || <Wrench className="w-5 h-5 text-gray-400" />;
};

// === Основной компонент ===
export default function DevOpsToolkit() {
  const [activeTab, setActiveTab] = useState<'tools' | 'knowledge'>('tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalLanguage, setModalLanguage] = useState('bash');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const categories = ['all', 'Virtualization', 'Network', 'Docker', 'Kubernetes', 'Linux', 'Web', 'Backup', 'Git', 'Security', 'Monitoring', 'Automation', 'Storage'];

  const filteredKnowledge = knowledgeBase.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openModal = (title: string, content: string, language: string = 'bash') => {
    setModalTitle(title);
    setModalContent(content);
    setModalLanguage(language);
    setModalOpen(true);
  };

  const copyToClipboard = () => {
    const text = editorRef.current?.getValue() || modalContent;
    navigator.clipboard.writeText(text);
  };

  const downloadFile = () => {
    const text = editorRef.current?.getValue() || modalContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = modalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <Terminal className="w-12 h-12 text-blue-400" />
            DevOps Toolkit Pro
          </h1>
          <p className="text-slate-400 text-lg">Команды, которые забывают все. Гайды, которые спасают.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-2 rounded-md transition ${activeTab === 'tools' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Инструменты
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-6 py-2 rounded-md transition ${activeTab === 'knowledge' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            База знаний
          </button>
        </div>

        {/* === TOOLS TAB === */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map(item => (
              <div
                key={item.id}
                onClick={() => openModal(item.title, item.command, 'bash')}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-blue-500 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <CategoryIcon category={item.category} />
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-xs text-slate-300 mb-2">{item.preview}</p>
                <code className="text-xs text-cyan-400 bg-slate-900/50 px-2 py-1 rounded block truncate">
                  {item.command.split('\n')[0]}
                </code>
                {item.distro && (
                  <div className="flex gap-1 mt-3">
                    {item.distro.map(d => <DistroIcon key={d} name={d} />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* === KNOWLEDGE TAB === */}
        {activeTab === 'knowledge' && (
          <div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по тегам, командам..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'Все категории' : cat}</option>
                ))}
              </select>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
              {filteredKnowledge.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">Ничего не найдено</p>
                </div>
              ) : (
                filteredKnowledge.map(item => (
                  <div
                    key={item.id}
                    onClick={() => openModal(item.title, item.content, 'markdown')}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={item.category} />
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-slate-700/50 rounded-full text-slate-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {item.links && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.links.map(link => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            {link.text}
                          </a>
                        ))}
                      </div>
                    )}
                    {item.distro && (
                      <div className="flex gap-1 mb-2 items-center">
                        {item.distro.map(d => <DistroIcon key={d} name={d} />)}
                        <span className="text-xs text-slate-400 ml-1">{item.distro.join(', ')}</span>
                      </div>
                    )}
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {item.content.split('\n').filter(line => !line.startsWith('```') && line.trim()).slice(0, 2).join(' ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* === MODAL === */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        <div className="h-[70vh] flex flex-col">
          <Editor
            height="100%"
            language={modalLanguage}
            value={modalContent}
            theme="vs-dark"
            onMount={editor => { editorRef.current = editor; }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true
            }}
          />
          <div className="flex gap-2 p-4 bg-slate-900 border-t border-slate-700">
            <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
              <Copy className="w-4 h-4" /> Копировать
            </button>
            <button onClick={downloadFile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
              <Download className="w-4 h-4" /> Скачать
            </button>
            <div className="flex-1" />
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition text-sm">
              Закрыть
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}