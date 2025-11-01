'use client';

import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
    Search, X, Copy, Download, Edit3, Maximize2, Sun, Moon,
    Package, Server, Globe, Terminal, GitBranch, Lock, Database, Monitor, Zap, Shield
} from 'lucide-react';
import { TEMPLATES, type Template } from '@/data/templates';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, template }) => {
    const [code, setCode] = useState(template.code);
    const [darkMode, setDarkMode] = useState(true);
    const editorRef = useRef<any>(null);

    const copyCode = () => {
        if (editorRef.current) navigator.clipboard.writeText(editorRef.current.getValue());
    };

    const downloadCode = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}.${template.language}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="w-full max-w-6xl bg-slate-900 rounded-xl shadow-2xl flex flex-col h-[92vh]">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-white">{template.name}</h2>
                        <span className="px-2 py-1 text-xs bg-blue-600/30 text-blue-300 rounded-full">#{template.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-white">
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-slate-700">
                        <span className="text-xs text-slate-400 font-mono">
                            {template.name.replace(/[^a-z0-9]/gi, '_')}.{template.language}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={copyCode} className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                            <button onClick={downloadCode} className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                                <Download className="w-4 h-4" /> Download
                            </button>
                        </div>
                    </div>
                    <Editor
                        height="100%"
                        defaultLanguage={template.language}
                        value={code}
                        onChange={(v) => setCode(v || '')}
                        theme={darkMode ? 'vs-dark' : 'light'}
                        onMount={(editor) => { editorRef.current = editor; }}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default function TemplatesPage() {
    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const categories = Array.from(new Set(TEMPLATES.map(t => t.category))).sort();
    const allTags = Array.from(new Set(TEMPLATES.flatMap(t => t.tags))).sort();

    const filtered = TEMPLATES.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase());
        const matchesTags = !selectedTags.length || selectedTags.every(tag => t.tags.includes(tag));
        const matchesCategory = !selectedCategory || t.category === selectedCategory;
        return matchesSearch && matchesTags && matchesCategory;
    });

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    const downloadCode = (template: Template) => {
        const blob = new Blob([template.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}.${template.language}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getCategoryIcon = (cat: string) => {
        const icons: Record<string, React.ReactNode> = {
            Docker: <Package className="w-5 h-5" />,
            Kubernetes: <Server className="w-5 h-5" />,
            Terraform: <Globe className="w-5 h-5" />,
            Ansible: <Terminal className="w-5 h-5" />,
            'CI/CD': <GitBranch className="w-5 h-5" />,
            Security: <Lock className="w-5 h-5" />,
            Database: <Database className="w-5 h-5" />,
            Monitoring: <Monitor className="w-5 h-5" />,
            Cloud: <Zap className="w-5 h-5" />,
            Nginx: <Shield className="w-5 h-5" />
        };
        return icons[cat] || <Package className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-white">DevOps Templates Library</h1>
                    <p className="text-xl text-slate-400">200+ готовых шаблонов. Поиск, редактирование, экспорт</p>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Поиск по названию, описанию, тегам..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">Все категории</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTags(prev =>
                                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                )}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTags.includes(tag)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                #{tag}
                            </button>
                        ))}

                        {(selectedTags.length > 0 || selectedCategory) && (
                            <button
                                onClick={() => {
                                    setSelectedTags([]);
                                    setSelectedCategory('');
                                }}
                                className="px-3 py-1.5 bg-red-600/50 text-red-300 rounded-full text-xs hover:bg-red-600 flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Очистить
                            </button>
                        )}
                    </div>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(template => (
                        <div
                            key={template.id}
                            className="group bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition-all duration-200 cursor-pointer"
                            onClick={() => setPreviewTemplate(template)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getCategoryIcon(template.category)}
                                    <h3 className="font-semibold text-white text-lg leading-tight">{template.name}</h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyCode(template.code); }}
                                        className="p-1.5 hover:bg-slate-700 rounded-lg transition"
                                        title="Копировать"
                                    >
                                        <Copy className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadCode(template); }}
                                        className="p-1.5 hover:bg-slate-700 rounded-lg transition"
                                        title="Скачать"
                                    >
                                        <Download className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingTemplate(template); }}
                                        className="p-1.5 hover:bg-blue-600 rounded-lg transition"
                                        title="Редактировать"
                                    >
                                        <Edit3 className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{template.description}</p>

                            <div className="flex flex-wrap gap-1">
                                {template.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 text-xs bg-blue-600/20 text-blue-300 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                                {template.tags.length > 3 && (
                                    <span className="text-xs text-slate-500">+{template.tags.length - 3}</span>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span className="font-mono">{template.language}</span>
                                <span className="flex items-center gap-1">
                                    <Maximize2 className="w-3 h-3" /> Клик — предпросмотр
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview Modal */}
                {previewTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4" onClick={() => setPreviewTemplate(null)}>
                        <div className="bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">{previewTemplate.name}</h2>
                                <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 overflow-auto max-h-[70vh]">
                                <Editor
                                    height="500px"
                                    defaultLanguage={previewTemplate.language}
                                    value={previewTemplate.code}
                                    theme="vs-dark"
                                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
                                />
                            </div>
                            <div className="p-4 border-t border-slate-700 flex gap-3">
                                <button onClick={() => { copyCode(previewTemplate.code); setPreviewTemplate(null); }} className="flex-1 bg-green-600 hover:bg-green-700 py-2.5 rounded-lg font-medium text-sm">
                                    Копировать
                                </button>
                                <button onClick={() => { downloadCode(previewTemplate); setPreviewTemplate(null); }} className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-medium text-sm">
                                    Скачать
                                </button>
                                <button onClick={() => { setEditingTemplate(previewTemplate); setPreviewTemplate(null); }} className="px-5 bg-purple-600 hover:bg-purple-700 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" /> Редактировать
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingTemplate && (
                    <EditModal
                        isOpen={!!editingTemplate}
                        onClose={() => setEditingTemplate(null)}
                        template={editingTemplate}
                    />
                )}
            </div>
        </div>
    );
}