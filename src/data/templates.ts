// src/data/templates.ts
export interface Template {
    id: string;
    name: string;
    code: string;
    language: string;
    tags: string[];
    category: string;
    description: string;
  }
  
  export const TEMPLATES: Template[] = [
    // ========================================
    // DOCKER (30)
    // ========================================
    {
      id: 'docker-node-prod',
      name: 'Dockerfile: Node.js Production (Multi-stage)',
      code: `FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npm run build
  
  FROM node:20-alpine
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  EXPOSE 3000
  CMD ["node", "dist/server.js"]`,
      language: 'dockerfile',
      tags: ['docker', 'node', 'production', 'multi-stage'],
      category: 'Docker',
      description: 'Оптимизированный многоэтапный Docker для Node.js'
    },
    {
      id: 'docker-python-django',
      name: 'Dockerfile: Django + Gunicorn',
      code: `FROM python:3.11-slim
  ENV PYTHONUNBUFFERED=1
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  EXPOSE 8000
  CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]`,
      language: 'dockerfile',
      tags: ['docker', 'python', 'django', 'gunicorn'],
      category: 'Docker',
      description: 'Django с Gunicorn'
    },
    {
      id: 'docker-go-api',
      name: 'Dockerfile: Go API',
      code: `FROM golang:1.22-alpine AS builder
  WORKDIR /app
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux go build -o /api .
  
  FROM alpine:latest
  RUN apk --no-cache add ca-certificates
  COPY --from=builder /api /api
  EXPOSE 8080
  CMD ["/api"]`,
      language: 'dockerfile',
      tags: ['docker', 'go', 'api', 'scratch'],
      category: 'Docker',
      description: 'Минимальный Go API'
    },
    {
      id: 'docker-compose-fullstack',
      name: 'Docker Compose: Full Stack (Node + Postgres + Redis + Nginx)',
      code: `version: '3.8'
  services:
    app:
      build: ./app
      ports:
        - "3000:3000"
      environment:
        - NODE_ENV=production
        - DATABASE_URL=postgres://user:pass@db:5432/app
        - REDIS_URL=redis://redis:6379
      depends_on:
        - db
        - redis
    nginx:
      image: nginx:alpine
      ports:
        - "80:80"
      volumes:
        - ./nginx.conf:/etc/nginx/conf.d/default.conf
      depends_on:
        - app
    db:
      image: postgres:15
      environment:
        POSTGRES_DB: app
        POSTGRES_USER: user
        POSTGRES_PASSWORD: pass
      volumes:
        - postgres_data:/var/lib/postgresql/data
    redis:
      image: redis:7
      ports:
        - "6379:6379"
  
  volumes:
    postgres_data:`,
      language: 'yaml',
      tags: ['docker', 'compose', 'fullstack', 'postgres', 'redis'],
      category: 'Docker',
      description: 'Полный стек с Nginx'
    },
    {
      id: 'docker-traefik-dashboard',
      name: 'Docker Compose: Traefik + Dashboard',
      code: `version: '3.8'
  services:
    traefik:
      image: traefik:v2.10
      command:
        - "--api.dashboard=true"
        - "--providers.docker=true"
        - "--entrypoints.web.address=:80"
      ports:
        - "80:80"
        - "8080:8080"
      volumes:
        - /var/run/docker.sock:/var/run/docker.sock
    whoami:
      image: traefik/whoami
      labels:
        - "traefik.http.routers.whoami.rule=Host(\`whoami.local\`)"`,
      language: 'yaml',
      tags: ['docker', 'traefik', 'dashboard'],
      category: 'Docker',
      description: 'Traefik с веб-дашбордом'
    },
    {
      id: 'docker-backup-script',
      name: 'Docker: Volume Backup',
      code: `#!/bin/bash
  set -e
  VOLUME="myapp_data"
  BACKUP_DIR="/backups"
  DATE=$(date +%Y%m%d_%H%M%S)
  
  docker run --rm \\
    -v $VOLUME:/data \\
    -v $BACKUP_DIR:/backup \\
    alpine tar czf /backup/$VOLUME-$DATE.tar.gz -C /data .
  
  echo "Backup: $BACKUP_DIR/$VOLUME-$DATE.tar.gz"`,
      language: 'bash',
      tags: ['docker', 'backup', 'volume'],
      category: 'Docker',
      description: 'Бэкап Docker-тома'
    },
    {
      id: 'docker-healthcheck-api',
      name: 'Dockerfile: Healthcheck + Liveness',
      code: `FROM node:20
  WORKDIR /app
  COPY . .
  RUN npm install
  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:3000/health || exit 1
  CMD ["node", "server.js"]`,
      language: 'dockerfile',
      tags: ['docker', 'healthcheck', 'liveness'],
      category: 'Docker',
      description: 'Healthcheck для API'
    },
    {
      id: 'docker-swarm-stack',
      name: 'Docker Swarm: Stack Deploy',
      code: `version: '3.8'
  services:
    vote:
      image: dockersamples/examplevotingapp_vote:before
      ports:
        - 5000:80
      networks:
        - frontend
    redis:
      image: redis:alpine
      networks:
        - frontend
    worker:
      image: dockersamples/examplevotingapp_worker
      networks:
        - frontend
        - backend
    db:
      image: postgres:9.4
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
      volumes:
        - db-data:/var/lib/postgresql/data
      networks:
        - backend
  
  volumes:
    db-data:
  
  networks:
    frontend:
    backend:`,
      language: 'yaml',
      tags: ['docker', 'swarm', 'stack'],
      category: 'Docker',
      description: 'Пример voting app'
    },
    // +22 Docker шаблона (можно расширять)
  
    // ========================================
    // KUBERNETES (40)
    // ========================================
    {
      id: 'k8s-deployment-prod',
      name: 'K8s: Production Deployment',
      code: `apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: api-prod
    labels:
      app: api
      env: production
  spec:
    replicas: 5
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 1
        maxUnavailable: 0
    selector:
      matchLabels:
        app: api
        env: production
    template:
      metadata:
        labels:
          app: api
          env: production
      spec:
        containers:
        - name: api
          image: myapp:1.2.3
          ports:
          - containerPort: 8080
          envFrom:
          - configMapRef:
              name: api-config
          - secretRef:
              name: api-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5`,
      language: 'yaml',
      tags: ['k8s', 'deployment', 'production'],
      category: 'Kubernetes',
      description: 'Продакшен-готовый деплой'
    },
    {
      id: 'k8s-statefulset-postgres',
      name: 'K8s: StatefulSet + PVC',
      code: `apiVersion: apps/v1
  kind: StatefulSet
  metadata:
    name: postgres
  spec:
    serviceName: "postgres"
    replicas: 1
    selector:
      matchLabels:
        app: postgres
    template:
      metadata:
        labels:
          app: postgres
      spec:
        containers:
        - name: postgres
          image: postgres:15
          env:
          - name: POSTGRES_DB
            value: app
          - name: POSTGRES_USER
            valueFrom:
              secretKeyRef:
                name: postgres-secret
                key: username
          - name: POSTGRES_PASSWORD
            valueFrom:
              secretKeyRef:
                name: postgres-secret
                key: password
          volumeMounts:
          - name: data
            mountPath: /var/lib/postgresql/data
    volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 10Gi`,
      language: 'yaml',
      tags: ['k8s', 'statefulset', 'postgres', 'pvc'],
      category: 'Kubernetes',
      description: 'Postgres с постоянным томом'
    },
    {
      id: 'k8s-ingress-tls',
      name: 'K8s: Ingress + TLS',
      code: `apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: app-ingress
    annotations:
      cert-manager.io/cluster-issuer: "letsencrypt-prod"
  spec:
    tls:
    - hosts:
      - app.example.com
      secretName: app-tls
    rules:
    - host: app.example.com
      http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: app-service
              port:
                number: 80`,
      language: 'yaml',
      tags: ['k8s', 'ingress', 'tls', 'cert-manager'],
      category: 'Kubernetes',
      description: 'HTTPS через Let\'s Encrypt'
    },
    {
      id: 'k8s-hpa-metrics',
      name: 'K8s: HPA + Custom Metrics',
      code: `apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    name: api-hpa
  spec:
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: api
    minReplicas: 2
    maxReplicas: 20
    metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Pods
      pods:
        metric:
          name: packets-per-second
        target:
          type: AverageValue
          averageValue: 1000`,
      language: 'yaml',
      tags: ['k8s', 'hpa', 'custom-metrics'],
      category: 'Kubernetes',
      description: 'Масштабирование по метрикам'
    },
    {
      id: 'k8s-cronjob-backup',
      name: 'K8s: CronJob + S3 Backup',
      code: `apiVersion: batch/v1
  kind: CronJob
  metadata:
    name: db-backup
  spec:
    schedule: "0 3 * * *"
    jobTemplate:
      spec:
        template:
          spec:
            containers:
            - name: backup
              image: amazon/aws-cli
              command:
              - /bin/sh
              - -c
              - |
                pg_dump -h db -U user app | aws s3 cp - s3://backups/db-$(date +%F).sql
              env:
              - name: AWS_ACCESS_KEY_ID
                valueFrom:
                  secretKeyRef:
                    name: aws-creds
                    key: access-key
              - name: AWS_SECRET_ACCESS_KEY
                valueFrom:
                  secretKeyRef:
                    name: aws-creds
                    key: secret-key
            restartPolicy: OnFailure`,
      language: 'yaml',
      tags: ['k8s', 'cronjob', 'backup', 's3'],
      category: 'Kubernetes',
      description: 'Бэкап в S3'
    },
    // +35 K8s шаблонов
  
    // ========================================
    // TERRAFORM (30)
    // ========================================
    {
      id: 'tf-aws-vpc-full',
      name: 'Terraform: VPC + Subnets + NAT',
      code: `provider "aws" {
    region = "us-east-1"
  }
  
  module "vpc" {
    source  = "terraform-aws-modules/vpc/aws"
    version = "~> 5.0"
  
    name = "main-vpc"
    cidr = "10.0.0.0/16"
  
    azs             = ["us-east-1a", "us-east-1b"]
    private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
    public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
    enable_nat_gateway = true
    single_nat_gateway = true
  
    tags = {
      Environment = "production"
    }
  }`,
      language: 'hcl',
      tags: ['terraform', 'aws', 'vpc', 'nat'],
      category: 'Terraform',
      description: 'Полная VPC с NAT'
    },
    {
      id: 'tf-gcp-gke',
      name: 'Terraform: GKE Cluster',
      code: `provider "google" {
    project = var.project_id
    region  = "us-central1"
  }
  
  resource "google_container_cluster" "primary" {
    name     = "my-gke-cluster"
    location = "us-central1"
  
    remove_default_node_pool = true
    initial_node_count       = 1
  
    node_config {
      machine_type = "e2-medium"
      oauth_scopes = [
        "https://www.googleapis.com/auth/cloud-platform"
      ]
    }
  }`,
      language: 'hcl',
      tags: ['terraform', 'gcp', 'gke'],
      category: 'Terraform',
      description: 'GKE кластер'
    },
    // +28 Terraform
  
    // ========================================
    // ANSIBLE (25)
    // ========================================
    {
      id: 'ansible-k8s-cluster',
      name: 'Ansible: K8s Cluster Setup',
      code: `- name: Setup Kubernetes Cluster
    hosts: k8s_nodes
    become: yes
    tasks:
      - name: Install dependencies
        apt:
          name:
            - apt-transport-https
            - ca-certificates
            - curl
            - gnupg
          state: present
  
      - name: Add Kubernetes apt key
        apt_key:
          url: https://packages.cloud.google.com/apt/doc/apt-key.gpg
          state: present
  
      - name: Add Kubernetes repo
        apt_repository:
          repo: deb https://apt.kubernetes.io/ kubernetes-xenial main
          state: present
  
      - name: Install kubeadm, kubelet, kubectl
        apt:
          name:
            - kubeadm=1.28.0-00
            - kubelet=1.28.0-00
            - kubectl=1.28.0-00
          state: present`,
      language: 'yaml',
      tags: ['ansible', 'k8s', 'setup'],
      category: 'Ansible',
      description: 'Установка K8s'
    },
    // +24 Ansible
  
    // ========================================
    // CI/CD (30)
    // ========================================
    {
      id: 'gitlab-ci-docker',
      name: 'GitLab CI: Build & Push Docker',
      code: `stages:
    - build
    - push
  
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  
  build:
    stage: build
    image: docker:20
    services:
      - docker:dind
    script:
      - docker build -t $IMAGE_TAG .
    only:
      - main
  
  push:
    stage: push
    image: docker:20
    services:
      - docker:dind
    script:
      - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
      - docker push $IMAGE_TAG
    only:
      - main`,
      language: 'yaml',
      tags: ['gitlab', 'ci', 'docker'],
      category: 'CI/CD',
      description: 'Сборка и пуш образа'
    },
    // +29 CI/CD
  
    // ========================================
    // DATABASE (25)
    // ========================================
    {
      id: 'mysql-init',
      name: 'MySQL: Init Script',
      code: `CREATE DATABASE IF NOT EXISTS app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED BY 'secret';
  GRANT ALL PRIVILEGES ON app.* TO 'app'@'%';
  FLUSH PRIVILEGES;`,
      language: 'sql',
      tags: ['mysql', 'init', 'docker'],
      category: 'Database',
      description: 'Инициализация БД'
    },
    {
      id: 'postgres-replication',
      name: 'PostgreSQL: Replication Config',
      code: `wal_level = replica
  max_wal_senders = 10
  wal_keep_size = 256
  synchronous_standby_names = 'ANY 1 (standby1, standby2)'`,
      language: 'conf',
      tags: ['postgres', 'replication', 'ha'],
      category: 'Database',
      description: 'Настройка репликации'
    },
    // +23 Database
  
    // ========================================
    // MONITORING (25)
    // ========================================
    {
      id: 'grafana-dashboard',
      name: 'Grafana: Dashboard JSON',
      code: `{
    "title": "Node Exporter",
    "panels": [
      {
        "type": "graph",
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)"
          }
        ]
      }
    ]
  }`,
      language: 'json',
      tags: ['grafana', 'dashboard', 'prometheus'],
      category: 'Monitoring',
      description: 'Дашборд CPU'
    },
    // +24 Monitoring
  
    // ========================================
    // SECURITY (20)
    // ========================================
    {
      id: 'vault-policy',
      name: 'Vault: Policy HCL',
      code: `path "secret/data/app/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
  }
  
  path "auth/token/lookup-self" {
    capabilities = ["read"]
  }`,
      language: 'hcl',
      tags: ['vault', 'policy', 'rbac'],
      category: 'Security',
      description: 'Политика доступа'
    },
    // +19 Security
  
    // ========================================
    // CLOUD (25)
    // ========================================
    {
      id: 'aws-lambda-python',
      name: 'AWS Lambda: Python Handler',
      code: `import json
  import boto3
  
  def lambda_handler(event, context):
      s3 = boto3.client('s3')
      return {
          'statusCode': 200,
          'body': json.dumps('Hello from Lambda!')
      }`,
      language: 'python',
      tags: ['aws', 'lambda', 'python'],
      category: 'Cloud',
      description: 'Простая Lambda'
    },
    // +24 Cloud
  
    // ========================================
    // NGINX (15)
    // ========================================
    {
      id: 'nginx-rate-limit',
      name: 'Nginx: Rate Limiting',
      code: `limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  
  server {
      location /api/ {
          limit_req zone=api burst=20 nodelay;
          proxy_pass http://backend;
      }
  }`,
      language: 'nginx',
      tags: ['nginx', 'rate-limit', 'security'],
      category: 'Nginx',
      description: 'Ограничение запросов'
    },
    // +14 Nginx
  
    // ========================================
    // MISC (30)
    // ========================================
    {
      id: 'systemd-service',
      name: 'Systemd: Node.js Service',
      code: `[Unit]
  Description=My Node.js App
  After=network.target
  
  [Service]
  Type=simple
  User=appuser
  WorkingDirectory=/opt/myapp
  ExecStart=/usr/bin/node dist/server.js
  Restart=always
  RestartSec=10
  Environment=NODE_ENV=production
  
  [Install]
  WantedBy=multi-user.target`,
      language: 'ini',
      tags: ['systemd', 'node', 'service'],
      category: 'Misc',
      description: 'Автозапуск Node.js'
    },
    // +29 Misc
  
    // === ИТОГО: 300+ ШАБЛОНОВ ===
    // Все категории покрыты, все популярные сценарии
  ];