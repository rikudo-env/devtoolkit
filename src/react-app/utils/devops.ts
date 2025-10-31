// DevOps utilities

export const generateSSHKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );

    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

    return {
      publicKey: `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`,
      privateKey: `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`
    };
  } catch (error) {
    // Fallback for environments that don't support crypto.subtle
    const mockPublicKey = generateRandomToken(64);
    const mockPrivateKey = generateRandomToken(128);
    
    return {
      publicKey: `ssh-rsa AAAAB3NzaC1yc2EAAAA${mockPublicKey} generated@devtoolkit`,
      privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----\n${mockPrivateKey}\n-----END OPENSSH PRIVATE KEY-----`
    };
  }
};

export const generateDockerCommand = (options: {
  image: string;
  name?: string;
  ports?: string[];
  volumes?: string[];
  env?: string[];
  detached?: boolean;
  interactive?: boolean;
  remove?: boolean;
}): string => {
  let command = 'docker run';
  
  if (options.detached) command += ' -d';
  if (options.interactive) command += ' -it';
  if (options.remove) command += ' --rm';
  
  if (options.name) command += ` --name ${options.name}`;
  
  if (options.ports) {
    options.ports.forEach(port => {
      command += ` -p ${port}`;
    });
  }
  
  if (options.volumes) {
    options.volumes.forEach(volume => {
      command += ` -v ${volume}`;
    });
  }
  
  if (options.env) {
    options.env.forEach(env => {
      command += ` -e ${env}`;
    });
  }
  
  command += ` ${options.image}`;
  
  return command;
};

export const generateKubernetesYaml = (options: {
  name: string;
  image: string;
  replicas?: number;
  port?: number;
  namespace?: string;
}): string => {
  const replicas = options.replicas || 1;
  const port = options.port || 80;
  const namespace = options.namespace || 'default';
  
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${options.name}
  namespace: ${namespace}
  labels:
    app: ${options.name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${options.name}
  template:
    metadata:
      labels:
        app: ${options.name}
    spec:
      containers:
      - name: ${options.name}
        image: ${options.image}
        ports:
        - containerPort: ${port}
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ${options.name}-service
  namespace: ${namespace}
spec:
  selector:
    app: ${options.name}
  ports:
  - protocol: TCP
    port: 80
    targetPort: ${port}
  type: ClusterIP`;
};

export const generateDockerCompose = (services: {
  name: string;
  image: string;
  ports?: string[];
  volumes?: string[];
  environment?: Record<string, string>;
  dependsOn?: string[];
}[]): string => {
  let compose = `version: '3.8'\n\nservices:\n`;
  
  services.forEach(service => {
    compose += `  ${service.name}:\n`;
    compose += `    image: ${service.image}\n`;
    
    if (service.ports && service.ports.length > 0) {
      compose += `    ports:\n`;
      service.ports.forEach(port => {
        compose += `      - "${port}"\n`;
      });
    }
    
    if (service.volumes && service.volumes.length > 0) {
      compose += `    volumes:\n`;
      service.volumes.forEach(volume => {
        compose += `      - ${volume}\n`;
      });
    }
    
    if (service.environment && Object.keys(service.environment).length > 0) {
      compose += `    environment:\n`;
      Object.entries(service.environment).forEach(([key, value]) => {
        compose += `      ${key}: ${value}\n`;
      });
    }
    
    if (service.dependsOn && service.dependsOn.length > 0) {
      compose += `    depends_on:\n`;
      service.dependsOn.forEach(dep => {
        compose += `      - ${dep}\n`;
      });
    }
    
    compose += `    restart: unless-stopped\n\n`;
  });
  
  return compose;
};

export const generateNginxConfig = (options: {
  serverName: string;
  port?: number;
  proxyPass?: string;
  ssl?: boolean;
  certPath?: string;
  keyPath?: string;
}): string => {
  const port = options.port || 80;
  
  let config = `server {
    listen ${port};
    server_name ${options.serverName};
    
    access_log /var/log/nginx/${options.serverName}.access.log;
    error_log /var/log/nginx/${options.serverName}.error.log;
`;

  if (options.ssl) {
    config += `    
    listen 443 ssl http2;
    ssl_certificate ${options.certPath || '/path/to/cert.pem'};
    ssl_certificate_key ${options.keyPath || '/path/to/key.pem'};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
`;
  }

  if (options.proxyPass) {
    config += `
    location / {
        proxy_pass ${options.proxyPass};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }`;
  } else {
    config += `
    location / {
        root /var/www/${options.serverName};
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }`;
  }

  config += `
}`;

  return config;
};

export const generateSystemdService = (options: {
  name: string;
  description: string;
  execStart: string;
  workingDirectory?: string;
  user?: string;
  environment?: Record<string, string>;
  restart?: string;
}): string => {
  let service = `[Unit]
Description=${options.description}
After=network.target

[Service]
Type=simple
ExecStart=${options.execStart}`;

  if (options.workingDirectory) {
    service += `\nWorkingDirectory=${options.workingDirectory}`;
  }

  if (options.user) {
    service += `\nUser=${options.user}`;
  }

  service += `\nRestart=${options.restart || 'always'}`;
  service += `\nRestartSec=5`;

  if (options.environment && Object.keys(options.environment).length > 0) {
    Object.entries(options.environment).forEach(([key, value]) => {
      service += `\nEnvironment=${key}=${value}`;
    });
  }

  service += `

[Install]
WantedBy=multi-user.target`;

  return service;
};

export const generateCronExpression = (options: {
  minute?: string;
  hour?: string;
  day?: string;
  month?: string;
  weekday?: string;
}): string => {
  return [
    options.minute || '*',
    options.hour || '*',
    options.day || '*',
    options.month || '*',
    options.weekday || '*'
  ].join(' ');
};

export const parseCronExpression = (cron: string): string => {
  const parts = cron.split(' ');
  if (parts.length !== 5) {
    return 'Invalid cron expression';
  }

  const [minute, hour, day, month, weekday] = parts;
  
  let description = 'Runs ';
  
  // Minutes
  if (minute === '*') {
    description += 'every minute ';
  } else if (minute.includes('/')) {
    const interval = minute.split('/')[1];
    description += `every ${interval} minutes `;
  } else {
    description += `at minute ${minute} `;
  }
  
  // Hours
  if (hour === '*') {
    description += 'of every hour ';
  } else if (hour.includes('/')) {
    const interval = hour.split('/')[1];
    description += `every ${interval} hours `;
  } else {
    description += `of hour ${hour} `;
  }
  
  // Days
  if (day === '*') {
    description += 'every day ';
  } else {
    description += `on day ${day} `;
  }
  
  // Months
  if (month === '*') {
    description += 'of every month ';
  } else {
    description += `of month ${month} `;
  }
  
  // Weekdays
  if (weekday !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    description += `on ${days[parseInt(weekday)] || weekday}`;
  }
  
  return description;
};

// Helper function for random token generation (reused from generators)
const generateRandomToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
};
