import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Code,
  Key,
  Clock,
  Shield,
  Network,
  RotateCcw,
  Server,
  Menu,
  X,
  Settings,
  FileText
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    path: '/generators',
    label: 'Генераторы',
    icon: <Key className="w-5 h-5" />,
    description: 'UUID, токены, пароли'
  },
  {
    path: '/timestamps',
    label: 'Время и даты',
    icon: <Clock className="w-5 h-5" />,
    description: 'Timestamp, конвертеры'
  },
  {
    path: '/security',
    label: 'Безопасность',
    icon: <Shield className="w-5 h-5" />,
    description: 'Хеши, кодирование'
  },
  {
    path: '/network',
    label: 'Сеть',
    icon: <Network className="w-5 h-5" />,
    description: 'IP, CIDR, порты'
  },
  {
    path: '/converters',
    label: 'Конвертеры',
    icon: <RotateCcw className="w-5 h-5" />,
    description: 'Единицы, системы счисления'
  },
  {
    path: '/devops',
    label: 'DevOps',
    icon: <Server className="w-5 h-5" />,
    description: 'SSH, команды, утилиты'
  },
  {
    path: '/config-generator',
    label: 'Генератор конфигураций',
    icon: <Settings className="w-5 h-5" />,
    description: 'Конфигурации для различных систем'
  },
  {
    path: '/templates',
    label: 'Шаблоны',
    icon: <FileText className="w-5 h-5" />,
    description: 'Шаблоны для различных систем'
  }
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 w-80 h-screen bg-slate-900/95 backdrop-blur-sm border-r border-slate-800/50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DevToolkit</h1>
                <p className="text-xs text-slate-400">Утилиты для разработчиков</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }
                    `}
                  >
                    <div className={`p-1.5 rounded ${isActive ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 text-center">
              Создано для разработчиков
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="h-screen overflow-y-auto lg:ml-80">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-400" />
            </button>
            <h1 className="text-lg font-semibold text-white">DevToolkit</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
