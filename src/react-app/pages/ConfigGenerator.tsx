'use client';

import React, { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
    Terminal, Sun, Moon, Copy, Download, RefreshCw, X, GripVertical, Trash2, Plus, Variable, Package, Play, Settings, FileText, Server, Cog, Clock, Code2,
    Key,
    Users
} from 'lucide-react';
import ToolCard from '@/react-app/components/ToolCard';
import {
    generateSSHKeyPair, generateDockerCommand, generateKubernetesYaml,
    generateNginxConfig, generateSystemdService, generateCronExpression, parseCronExpression
} from '@/react-app/utils/devops';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="w-full max-w-7xl bg-slate-900 rounded-xl shadow-2xl flex flex-col h-[92vh]">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">{children}</div>
            </div>
        </div>
    );
};

// === Переменные ===
interface Variable {
    name: string;
    value: string;
    description: string;
}

const defaultVariables: Variable[] = [
    { name: 'APP_NAME', value: 'my-app', description: 'Application name' },
    { name: 'PORT', value: '3000', description: 'Port' },
    { name: 'DOMAIN', value: 'example.com', description: 'Domain' },
    { name: 'IMAGE', value: 'nginx:latest', description: 'Docker image' },
    { name: 'REPLICAS', value: '3', description: 'K8s replicas' },
];

// === Команды ===
interface ShellCommand {
    id: string;
    type: string;
    value: string;
    enabled: boolean;
}

const commandCategories = {
    basics: ['shebang', 'comment', 'set', 'cd', 'pwd', 'ls', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'ln'],
    variables: ['export', 'env', 'read', 'printenv'],
    control: ['if', 'elif', 'else', 'fi', 'case', 'esac', 'for', 'in', 'do', 'done', 'while', 'until', 'function'],
    system: ['sudo', 'useradd', 'groupadd', 'chmod', 'chown', 'chgrp', 'umask', 'ulimit'],
    packages: ['apt_update', 'apt_install', 'apt_remove', 'yum_install', 'dnf_install', 'brew_install', 'pip', 'npm', 'yarn'],
    docker: ['docker_build', 'docker_run', 'docker_push', 'docker_pull', 'docker_compose', 'docker_stop', 'docker_rm'],
    kubernetes: ['kubectl_apply', 'kubectl_delete', 'kubectl_get', 'kubectl_logs', 'kubectl_port_forward'],
    terraform: ['terraform_init', 'terraform_plan', 'terraform_apply', 'terraform_destroy'],
    git: ['git_clone', 'git_pull', 'git_add', 'git_commit', 'git_push', 'git_branch', 'git_checkout'],
    network: ['curl', 'wget', 'ping', 'netstat', 'ss', 'iptables', 'ufw', 'firewall_cmd'],
    archive: ['tar', 'zip', 'unzip', 'gzip', 'gunzip'],
    text: ['grep', 'sed', 'awk', 'cut', 'sort', 'uniq', 'wc', 'head', 'tail', 'jq'],
    process: ['ps', 'kill', 'pkill', 'top', 'htop', 'systemctl', 'service', 'crontab'],
    misc: ['sleep', 'wait', 'timeout', 'trap', 'source', 'alias', 'exec', 'nohup', 'screen', 'tmux']
};

const commandTemplates: Record<string, string> = {
    shebang: '#!/bin/bash',
    comment: '# {{DESCRIPTION}}',
    set: 'set -euo pipefail',
    cd: 'cd "{{APP_DIR}}"',
    pwd: 'pwd',
    ls: 'ls -la',
    mkdir: 'mkdir -p "{{APP_DIR}}"',
    touch: 'touch "{{APP_DIR}}/index.html"',
    rm: 'rm -rf "{{APP_DIR}}"',
    cp: 'cp -r src/ dest/',
    mv: 'mv old.txt new.txt',
    ln: 'ln -s target link',
    export: 'export {{VAR_NAME}}="{{VAR_VALUE}}"',
    env: 'env | grep {{VAR_NAME}}',
    read: 'read -p "Enter value: " {{VAR_NAME}}',
    printenv: 'printenv {{VAR_NAME}}',
    'if': 'if [ {{CONDITION}} ]; then\n  {{COMMAND}}\nfi',
    elif: 'elif [ {{CONDITION}} ]; then\n  {{COMMAND}}',
    else: 'else\n  {{COMMAND}}',
    fi: 'fi',
    case: 'case ${{VAR_NAME}} in\n  "value1") {{COMMAND}} ;;\n  *) echo "Default" ;;\nesac',
    esac: 'esac',
    'for': 'for i in {1..5}; do\n  echo "Iteration $i"\ndone',
    'in': 'in',
    'do': 'do',
    done: 'done',
    while: 'while [ {{CONDITION}} ]; do\n  {{COMMAND}}\ndone',
    until: 'until [ {{CONDITION}} ]; do\n  {{COMMAND}}\ndone',
    function: 'function {{NAME}}() {\n  {{COMMAND}}\n}',
    sudo: 'sudo {{COMMAND}}',
    useradd: 'sudo useradd -m -s /bin/bash {{USERNAME}}',
    groupadd: 'sudo groupadd {{GROUP}}',
    chmod: 'chmod {{PERMS}} {{FILE}}',
    chown: 'sudo chown {{USER}}:{{GROUP}} {{FILE}}',
    chgrp: 'sudo chgrp {{GROUP}} {{FILE}}',
    umask: 'umask 0022',
    ulimit: 'ulimit -n 4096',
    apt_update: 'sudo apt update',
    apt_install: 'sudo apt install -y {{PACKAGE}}',
    apt_remove: 'sudo apt remove -y {{PACKAGE}}',
    yum_install: 'sudo yum install -y {{PACKAGE}}',
    dnf_install: 'sudo dnf install -y {{PACKAGE}}',
    brew_install: 'brew install {{PACKAGE}}',
    pip: 'pip install {{PACKAGE}}',
    npm: 'npm install {{PACKAGE}}',
    yarn: 'yarn add {{PACKAGE}}',
    docker_build: 'docker build -t {{IMAGE}} .',
    docker_run: 'docker run -d -p {{PORT}}:{{PORT}} --name {{APP_NAME}} {{IMAGE}}',
    docker_push: 'docker push {{IMAGE}}',
    docker_pull: 'docker pull {{IMAGE}}',
    docker_compose: 'docker-compose up -d',
    docker_stop: 'docker stop {{APP_NAME}}',
    docker_rm: 'docker rm {{APP_NAME}}',
    kubectl_apply: 'kubectl apply -f deployment.yaml',
    kubectl_delete: 'kubectl delete -f deployment.yaml',
    kubectl_get: 'kubectl get pods',
    kubectl_logs: 'kubectl logs {{POD}}',
    kubectl_port_forward: 'kubectl port-forward {{POD}} {{PORT}}:{{PORT}}',
    terraform_init: 'terraform init',
    terraform_plan: 'terraform plan',
    terraform_apply: 'terraform apply -auto-approve',
    terraform_destroy: 'terraform destroy -auto-approve',
    git_clone: 'git clone https://github.com/{{USER}}/{{REPO}}.git',
    git_pull: 'git pull origin main',
    git_add: 'git add .',
    git_commit: 'git commit -m "{{MESSAGE}}"',
    git_push: 'git push origin main',
    git_branch: 'git checkout -b {{BRANCH}}',
    git_checkout: 'git checkout {{BRANCH}}',
    curl: 'curl -sSL {{URL}}',
    wget: 'wget {{URL}}',
    ping: 'ping -c 4 {{HOST}}',
    netstat: 'netstat -tulnp',
    ss: 'ss -tulnp',
    iptables: 'sudo iptables -L',
    ufw: 'sudo ufw allow {{PORT}}',
    firewall_cmd: 'sudo firewall-cmd --add-port={{PORT}}/tcp --permanent',
    tar: 'tar -czf archive.tar.gz {{DIR}}',
    zip: 'zip -r archive.zip {{DIR}}',
    unzip: 'unzip archive.zip',
    gzip: 'gzip {{FILE}}',
    gunzip: 'gunzip {{FILE}}.gz',
    grep: 'grep "{{PATTERN}}" {{FILE}}',
    sed: 'sed "s/{{OLD}}/{{NEW}}/g" {{FILE}}',
    awk: 'awk "{{PATTERN}}" {{FILE}}',
    cut: 'cut -d"," -f1 {{FILE}}',
    sort: 'sort {{FILE}}',
    uniq: 'uniq {{FILE}}',
    wc: 'wc -l {{FILE}}',
    head: 'head -n 10 {{FILE}}',
    tail: 'tail -n 10 {{FILE}}',
    jq: 'jq ".key" {{FILE}}',
    ps: 'ps aux',
    kill: 'kill {{PID}}',
    pkill: 'pkill {{PROCESS}}',
    top: 'top',
    htop: 'htop',
    systemctl: 'sudo systemctl {{ACTION}} {{SERVICE}}',
    service: 'sudo service {{SERVICE}} {{ACTION}}',
    crontab: 'crontab -e',
    sleep: 'sleep {{SECONDS}}',
    wait: 'wait',
    timeout: 'timeout {{SECONDS}} {{COMMAND}}',
    trap: 'trap "{{COMMAND}}" EXIT',
    source: 'source {{FILE}}',
    alias: 'alias {{NAME}}="{{COMMAND}}"',
    exec: 'exec {{COMMAND}}',
    nohup: 'nohup {{COMMAND}} &',
    screen: 'screen -S {{SESSION}}',
    tmux: 'tmux new -s {{SESSION}}'
};

// === Drag & Drop Item ===
const DraggableCommand: React.FC<{
    cmd: ShellCommand;
    index: number;
    moveCommand: (dragIndex: number, hoverIndex: number) => void;
    updateCommand: (id: string, value: string) => void;
    toggleCommand: (id: string) => void;
    removeCommand: (id: string) => void;
}> = ({ cmd, index, moveCommand, updateCommand, toggleCommand, removeCommand }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'command',
        item: { index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() })
    });

    const [, drop] = useDrop({
        accept: 'command',
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                moveCommand(item.index, index);
                item.index = index;
            }
        }
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all ${isDragging ? 'opacity-50' : ''
                } ${cmd.enabled ? 'bg-slate-800' : 'bg-slate-900 opacity-60'}`}
        >
            <GripVertical className="w-4 h-4 text-slate-500 cursor-move" />
            <input
                type="checkbox"
                checked={cmd.enabled}
                onChange={() => toggleCommand(cmd.id)}
                className="w-4 h-4 text-blue-600 rounded"
            />
            <input
                type="text"
                value={cmd.value}
                onChange={(e) => updateCommand(cmd.id, e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-300 outline-none font-mono"
                placeholder="Enter command..."
            />
            <button onClick={() => removeCommand(cmd.id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

// === Shell Constructor ===
const ShellConstructor: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [commands, setCommands] = useState<ShellCommand[]>([]);
    const [variables, setVariables] = useState<Variable[]>(defaultVariables);
    const [darkMode, setDarkMode] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState('');
    const editorRef = useRef<any>(null);

    const presets: Record<string, ShellCommand[]> = {
        'Node.js Deploy': [
            { id: '1', type: 'shebang', value: '#!/bin/bash', enabled: true },
            { id: '2', type: 'set', value: 'set -euo pipefail', enabled: true },
            { id: '3', type: 'export', value: 'export APP_NAME="{{APP_NAME}}"', enabled: true },
            { id: '4', type: 'mkdir', value: 'mkdir -p /opt/{{APP_NAME}}', enabled: true },
            { id: '5', type: 'cd', value: 'cd /opt/{{APP_NAME}}', enabled: true },
            { id: '6', type: 'git_clone', value: 'git clone https://github.com/user/repo.git .', enabled: true },
            { id: '7', type: 'npm', value: 'npm install', enabled: true },
            { id: '8', type: 'docker_build', value: 'docker build -t {{APP_NAME}} .', enabled: true },
            { id: '9', type: 'docker_run', value: 'docker run -d -p {{PORT}}:{{PORT}} --name {{APP_NAME}} {{APP_NAME}}', enabled: true }
        ],
        'Static Site': [
            { id: '1', type: 'shebang', value: '#!/bin/bash', enabled: true },
            { id: '2', type: 'mkdir', value: 'mkdir -p /var/www/{{DOMAIN}}', enabled: true },
            { id: '3', type: 'cd', value: 'cd /var/www/{{DOMAIN}}', enabled: true },
            { id: '4', type: 'git_clone', value: 'git clone https://github.com/user/site.git .', enabled: true },
            { id: '5', type: 'nginx', value: 'sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/{{DOMAIN}}', enabled: true },
            { id: '6', type: 'sed', value: 'sudo sed -i "s/example.com/{{DOMAIN}}/g" /etc/nginx/sites-available/{{DOMAIN}}', enabled: true },
            { id: '7', type: 'systemctl', value: 'sudo systemctl reload nginx', enabled: true }
        ]
    };

    const applyPreset = () => {
        if (!selectedPreset || !presets[selectedPreset]) return;
        const presetCmds = presets[selectedPreset].map((cmd, i) => ({ ...cmd, id: Date.now() + i + '' }));
        setCommands(presetCmds);
    };

    const addCommand = (type: string) => {
        const newCmd: ShellCommand = {
            id: Date.now().toString(),
            type,
            value: commandTemplates[type] || '',
            enabled: true
        };
        setCommands([...commands, newCmd]);
    };

    const updateCommand = (id: string, value: string) => {
        setCommands(commands.map(c => c.id === id ? { ...c, value } : c));
    };

    const toggleCommand = (id: string) => {
        setCommands(commands.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    };

    const removeCommand = (id: string) => {
        setCommands(commands.filter(c => c.id !== id));
    };

    const moveCommand = (dragIndex: number, hoverIndex: number) => {
        const dragged = commands[dragIndex];
        const newCommands = [...commands];
        newCommands.splice(dragIndex, 1);
        newCommands.splice(hoverIndex, 0, dragged);
        setCommands(newCommands);
    };

    const replaceVariables = (text: string) => {
        let result = text;
        variables.forEach(v => {
            result = result.replace(new RegExp(`{{${v.name}}}`, 'g'), v.value);
        });
        return result;
    };

    const generateScript = () => {
        return commands
            .filter(c => c.enabled)
            .map(c => replaceVariables(c.value))
            .join('\n');
    };

    const copyToClipboard = () => {
        if (editorRef.current) navigator.clipboard.writeText(editorRef.current.getValue());
    };

    const downloadFile = () => {
        const script = generateScript();
        const blob = new Blob([script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deploy.sh';
        a.click();
        URL.revokeObjectURL(url);
    };

    const openModal = () => {
        setModalOpen(true);
        onGenerate();
    };

    return (
        <>
            <ToolCard title="Shell Constructor Pro" description="Drag & drop, variables, presets, 50+ commands" icon={<Terminal className="w-5 h-5" />} onClick={openModal}>
                <button onClick={(e) => { e.stopPropagation(); openModal(); }} className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 text-sm font-medium">
                    Open Constructor
                </button>
            </ToolCard>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Shell Script Constructor Pro">
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-slate-700 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedPreset}
                                    onChange={(e) => setSelectedPreset(e.target.value)}
                                    className="px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded"
                                >
                                    <option value="">Select Preset</option>
                                    {Object.keys(presets).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <button onClick={applyPreset} disabled={!selectedPreset} className="px-3 py-1.5 text-sm bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
                                    Apply
                                </button>
                            </div>
                            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-white">
                                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {Object.entries(commandCategories).map(([cat, cmds]) => (
                                <div key={cat} className="flex flex-wrap gap-1">
                                    {cmds.map(cmd => (
                                        <button
                                            key={cmd}
                                            onClick={() => addCommand(cmd)}
                                            className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700 capitalize"
                                            title={commandTemplates[cmd]}
                                        >
                                            {cmd.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-80 border-r border-slate-700 p-4 space-y-4 overflow-y-auto">
                            <div>
                                <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <Variable className="w-4 h-4" /> Variables
                                </h3>
                                <div className="space-y-2">
                                    {variables.map(v => (
                                        <div key={v.name} className="flex items-center gap-2 text-xs">
                                            <span className="font-mono text-blue-400">{v.name}</span>
                                            <input
                                                type="text"
                                                value={v.value}
                                                onChange={(e) => setVariables(vars => vars.map(vv => vv.name === v.name ? { ...vv, value: e.target.value } : vv))}
                                                className="flex-1 bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-300 mb-2">Commands ({commands.filter(c => c.enabled).length})</h3>
                                <DndProvider backend={HTML5Backend}>
                                    <div className="space-y-2">
                                        {commands.map((cmd, idx) => (
                                            <DraggableCommand
                                                key={cmd.id}
                                                cmd={cmd}
                                                index={idx}
                                                moveCommand={moveCommand}
                                                updateCommand={updateCommand}
                                                toggleCommand={toggleCommand}
                                                removeCommand={removeCommand}
                                            />
                                        ))}
                                    </div>
                                </DndProvider>
                                {commands.length === 0 && <p className="text-slate-500 text-xs">Add commands above</p>}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between p-3 border-b border-slate-700">
                                <span className="text-xs text-slate-400">deploy.sh</span>
                                <div className="flex gap-2">
                                    <button onClick={copyToClipboard} className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                                        <Copy className="w-4 h-4" /> Copy
                                    </button>
                                    <button onClick={downloadFile} className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                </div>
                            </div>
                            <Editor
                                height="100%"
                                defaultLanguage="bash"
                                value={generateScript()}
                                theme={darkMode ? 'vs-dark' : 'light'}
                                onMount={(editor) => { editorRef.current = editor; }}
                                options={{ minimap: { enabled: false }, fontSize: 13, readOnly: true, wordWrap: 'on' }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

// === Остальные генераторы (без изменений) ===
const ConfigGenerator: React.FC<{ type: string; onGenerate: () => void }> = ({ type, onGenerate }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [config, setConfig] = useState('');
    const [language, setLanguage] = useState('yaml');
    const [darkMode, setDarkMode] = useState(true);
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any) => { editorRef.current = editor; };

    const copyToClipboard = () => {
        if (editorRef.current) navigator.clipboard.writeText(editorRef.current.getValue());
    };

    const downloadFile = () => {
        if (!config) return;
        const blob = new Blob([config], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getFileName(type);
        a.click();
        URL.revokeObjectURL(url);
    };

    const generateConfig = async () => {
        let result = '';
        let lang = 'yaml';

        switch (type) {
            case 'ssh':
                {
                    const keys = await generateSSHKeyPair();
                    result = `Public Key:\n${keys.publicKey}\n\nPrivate Key:\n${keys.privateKey}`;
                    lang = 'text';
                    break;
                }
            case 'docker':
                result = generateDockerCommand({ image: 'nginx:latest', name: 'web', ports: ['80:80'], detached: true, remove: true });
                lang = 'bash';
                break;
            case 'k8s':
                result = generateKubernetesYaml({ name: 'my-app', image: 'nginx:latest', replicas: 3, port: 80 });
                lang = 'yaml';
                break;
            case 'nginx':
                result = generateNginxConfig({ serverName: 'example.com', proxyPass: 'http://localhost:3000' });
                lang = 'nginx';
                break;
            case 'systemd':
                result = generateSystemdService({ name: 'my-service', description: 'My Service', execStart: '/usr/bin/node /app/server.js' });
                lang = 'ini';
                break;
            case 'cron':
                {
                    const expr = generateCronExpression({ minute: '0', hour: '2' });
                    result = `${expr}\n\n${parseCronExpression(expr)}`;
                    lang = 'text';
                    break;
                }
            case 'dockerfile':
                result = `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]`;
                lang = 'dockerfile';
                break;
            case 'terraform':
                result = `provider "aws" { region = "us-east-1" }\nresource "aws_instance" "web" { ami = "ami-0c55b159cbfafe1f0" instance_type = "t3.micro" tags = { Name = "web-server" } }`;
                lang = 'hcl';
                break;
            case 'ansible':
                result = `- name: Deploy app\n  hosts: webservers\n  tasks:\n    - name: Update packages\n      apt:\n        update_cache: yes\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present`;
                lang = 'yaml';
                break;
        }

        setConfig(result);
        setLanguage(lang);
        setModalOpen(true);
        onGenerate();
    };

    return (
        <>
            <ToolCard title={getTitle(type)} description={getDescription(type)} icon={getIcon(type)} onClick={generateConfig}>
                <button onClick={(e) => { e.stopPropagation(); generateConfig(); }} className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                    Generate
                </button>
            </ToolCard>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={getTitle(type)}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-3 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-white">
                                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <span className="text-xs text-slate-400">{getFileName(type)}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={copyToClipboard} className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                            <button onClick={downloadFile} className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                                <Download className="w-4 h-4" /> Download
                            </button>
                            <button onClick={generateConfig} className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                                <RefreshCw className="w-4 h-4" /> Regenerate
                            </button>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage={language}
                            value={config}
                            onChange={(v) => setConfig(v || '')}
                            theme={darkMode ? 'vs-dark' : 'light'}
                            onMount={handleEditorDidMount}
                            options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false, automaticLayout: true }}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

const getTitle = (type: string): string => {
    const map: Record<string, string> = { ssh: 'SSH Keys', docker: 'Docker Run', k8s: 'Kubernetes YAML', nginx: 'Nginx Config', systemd: 'Systemd Service', cron: 'Cron Expression', dockerfile: 'Dockerfile', terraform: 'Terraform', ansible: 'Ansible Playbook' };
    return map[type] || 'Config';
};

const getDescription = (type: string): string => {
    const map: Record<string, string> = { ssh: 'Generate SSH key pair', docker: 'Docker run command', k8s: 'K8s deployment YAML', nginx: 'Nginx server block', systemd: 'Systemd unit file', cron: 'Cron job with description', dockerfile: 'Dockerfile template', terraform: 'Terraform HCL config', ansible: 'Ansible playbook' };
    return map[type] || '';
};

const getIcon = (type: string): React.ReactNode => {
    const map: Record<string, React.ReactNode> = {
        ssh: <Key className="w-5 h-5" />, docker: <Play className="w-5 h-5" />, k8s: <FileText className="w-5 h-5" />,
        nginx: <Server className="w-5 h-5" />, systemd: <Settings className="w-5 h-5" />, cron: <Clock className="w-5 h-5" />,
        dockerfile: <FileText className="w-5 h-5" />, terraform: <Cog className="w-5 h-5" />, ansible: <Users className="w-5 h-5" />
    };
    return map[type] || <Code2 className="w-5 h-5" />;
};

const getFileName = (type: string): string => {
    const map: Record<string, string> = { ssh: 'ssh_key', docker: 'docker_run.sh', k8s: 'deployment.yaml', nginx: 'nginx.conf', systemd: 'service.service', cron: 'cron.txt', dockerfile: 'Dockerfile', terraform: 'main.tf', ansible: 'playbook.yml' };
    return map[type] || 'config.txt';
};

export default function ConfigGeneratorPage() {
    const [generatedCount, setGeneratedCount] = useState(0);
    const generators = ['ssh', 'docker', 'k8s', 'nginx', 'systemd', 'cron', 'dockerfile', 'terraform', 'ansible'];

    return (
        <div className="min-h-screen text-white">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Config Generator Pro</h1>
                    <p className="text-slate-400">Генерируйте, редактируйте и экспортируйте конфиги</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {generators.map((t) => (
                        <ConfigGenerator key={t} type={t} onGenerate={() => setGeneratedCount(c => c + 1)} />
                    ))}
                    <ShellConstructor onGenerate={() => setGeneratedCount(c => c + 1)} />
                </div>
            </div>
        </div>
    );
}