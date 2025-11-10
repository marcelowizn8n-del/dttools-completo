# DTTools - Guia Técnico de Implementação
## Documentação para Desenvolvedores e Administradores de Sistema

**Versão:** 1.0  
**Data:** Setembro 2025  
**Público-alvo:** CTOs, Tech Leads, DevOps, SysAdmins

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#arquitetura)
2. [Requisitos do Sistema](#requisitos)
3. [Instalação e Configuração](#instalacao)
4. [APIs e Integrações](#apis)
5. [Segurança e Compliance](#seguranca)
6. [Backup e Recuperação](#backup)
7. [Monitoramento e Logs](#monitoramento)
8. [Scaling e Performance](#performance)
9. [Troubleshooting](#troubleshooting)
10. [Suporte Técnico](#suporte)

---

## 🏗️ Visão Geral da Arquitetura {#arquitetura}

### Stack Tecnológico

**Frontend:**
- **Framework:** React 18 + TypeScript
- **Estado:** TanStack Query + Context API
- **Routing:** Wouter (lightweight)
- **UI:** shadcn/ui + Radix UI primitives
- **Styling:** Tailwind CSS
- **Build:** Vite 5.x

**Backend:**
- **Runtime:** Node.js 20+ / TypeScript
- **Framework:** Express.js
- **ORM:** Drizzle ORM (type-safe)
- **Validação:** Zod schemas
- **Autenticação:** Passport.js + sessions

**Database:**
- **Primária:** PostgreSQL 16 (Neon/Supabase)
- **Cache:** Redis (opcional)
- **Files:** Object Storage (S3/GCS compatible)

**Infrastructure:**
- **Deploy:** Docker containers
- **Proxy:** Nginx
- **Monitoring:** Prometheus + Grafana
- **Logs:** Winston + structured logging

### Arquitetura de Componentes

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile App    │    │   API Client    │
│   (React SPA)   │    │   (React Native)│    │   (REST/GraphQL)│
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────────────────────────────┐
          │              Load Balancer                  │
          │                (Nginx)                     │
          └─────────────────────┬───────────────────────┘
                                │
          ┌─────────────────────────────────────────────┐
          │              API Gateway                    │
          │         (Express + Middleware)              │
          └─────────────────────┬───────────────────────┘
                                │
    ┌─────────────┬─────────────┼─────────────┬─────────────┐
    │             │             │             │             │
┌───▼───┐  ┌─────▼─────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
│Auth   │  │Projects   │  │Design   │  │Reports  │  │Files    │
│Service│  │Service    │  │Thinking │  │Service  │  │Service  │
│       │  │           │  │Tools    │  │         │  │         │
└───┬───┘  └─────┬─────┘  └────┬────┘  └────┬────┘  └────┬────┘
    │            │             │             │             │
    └────────────┼─────────────┼─────────────┼─────────────┘
                 │             │             │
    ┌────────────▼─────────────▼─────────────▼──────────────┐
    │                Database Layer                        │
    │           PostgreSQL + Redis Cache                   │
    └──────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Frontend** faz requisições HTTP para API
2. **API Gateway** roteia para microserviços
3. **Services** processam lógica de negócio
4. **Database Layer** persiste dados
5. **Cache** acelera leituras frequentes
6. **File Storage** armazena uploads

---

## 💾 Requisitos do Sistema {#requisitos}

### Servidor (Produção)

**Mínimo Recomendado:**
- **CPU:** 4 cores (2.4 GHz)
- **RAM:** 8 GB
- **Storage:** 100 GB SSD
- **Network:** 1 Gbps
- **OS:** Ubuntu 22.04 LTS / RHEL 8+

**Para Alta Performance:**
- **CPU:** 8+ cores (3.0+ GHz)  
- **RAM:** 16+ GB
- **Storage:** 500+ GB NVMe SSD
- **Network:** 10 Gbps
- **Load Balancer:** Nginx/HAProxy

### Base de Dados

**PostgreSQL Requirements:**
- **Versão:** 14+
- **RAM:** 4+ GB dedicada
- **Storage:** SSD obrigatório
- **Connections:** 200+ concurrent

**Redis (Cache):**
- **RAM:** 2+ GB
- **Persistence:** RDB + AOF
- **Clustering:** Para alta disponibilidade

### Ambiente de Desenvolvimento

**Node.js:** 20.x LTS  
**Package Manager:** npm 10+ / pnpm 8+  
**Database:** PostgreSQL 14+ local  
**Editor:** VS Code + extensões recomendadas

---

## 🚀 Instalação e Configuração {#instalacao}

### 1. Clonando o Repositório

```bash
# Clone do repositório principal
git clone https://github.com/dttools/platform.git
cd platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
```

### 2. Configuração do Banco de Dados

```bash
# Criar database
createdb dttools_dev

# Executar migrations
npm run db:migrate

# Seed inicial (opcional)
npm run db:seed
```

### 3. Variáveis de Ambiente

```bash
# .env.local
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dttools_dev"
PGDATABASE=dttools_dev
PGHOST=localhost
PGUSER=dttools
PGPASSWORD=your_password
PGPORT=5432

# Authentication
SESSION_SECRET="your-super-secret-session-key-256-bits"
JWT_SECRET="your-jwt-secret-key"

# File Storage
STORAGE_TYPE=local # local | s3 | gcs
UPLOAD_MAX_SIZE=10485760 # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# External APIs
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Monitoring
LOG_LEVEL=info
SENTRY_DSN="https://..."
```

### 4. Iniciando o Desenvolvimento

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client

# Terminal 3 - Database (se local)
npm run db:studio
```

### 5. Build para Produção

```bash
# Build completo
npm run build

# Preview build
npm run preview

# Deploy
npm run deploy
```

---

## 🔌 APIs e Integrações {#apis}

### Estrutura da API REST

**Base URL:** `https://api.dttools.app/v1`

**Headers Obrigatórios:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>",
  "X-API-Version": "1.0"
}
```

### Principais Endpoints

#### 🔐 Autenticação
```http
POST /auth/login
POST /auth/logout
POST /auth/register
GET  /auth/me
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
```

#### 📋 Projetos
```http
GET    /projects                    # Lista projetos do usuário
POST   /projects                    # Cria novo projeto
GET    /projects/:id                # Detalhes do projeto
PUT    /projects/:id                # Atualiza projeto
DELETE /projects/:id                # Remove projeto
GET    /projects/:id/stats          # Estatísticas
POST   /projects/:id/export         # Export PDF/PPTX
```

#### 👥 Personas (Fase 1)
```http
GET    /projects/:id/personas       # Lista personas
POST   /projects/:id/personas       # Cria persona
PUT    /personas/:id                # Atualiza persona
DELETE /personas/:id                # Remove persona
POST   /personas/:id/avatar         # Upload avatar
```

#### 🗺️ Mapas de Empatia
```http
GET    /projects/:id/empathy-maps   # Lista mapas
POST   /projects/:id/empathy-maps   # Cria mapa
PUT    /empathy-maps/:id           # Atualiza mapa
DELETE /empathy-maps/:id           # Remove mapa
```

#### 💡 Ideação (Fase 3)
```http
GET    /projects/:id/ideas          # Lista ideias
POST   /projects/:id/ideas          # Nova ideia
PUT    /ideas/:id                   # Atualiza ideia
DELETE /ideas/:id                   # Remove ideia
POST   /projects/:id/brainstorm     # Sessão brainstorm
```

#### 🔧 Protótipos (Fase 4)
```http
GET    /projects/:id/prototypes     # Lista protótipos
POST   /projects/:id/prototypes     # Novo protótipo
PUT    /prototypes/:id              # Atualiza protótipo
DELETE /prototypes/:id              # Remove protótipo
POST   /prototypes/:id/files        # Upload arquivos
```

#### 🧪 Testes (Fase 5)
```http
GET    /projects/:id/tests          # Lista testes
POST   /projects/:id/tests          # Novo teste
PUT    /tests/:id                   # Atualiza teste
DELETE /tests/:id                   # Remove teste
POST   /tests/:id/results           # Adiciona resultados
```

### Webhooks Disponíveis

```javascript
// Configuração de webhook
{
  "url": "https://your-app.com/webhooks/dttools",
  "events": [
    "project.created",
    "project.updated", 
    "project.completed",
    "persona.created",
    "idea.created",
    "prototype.tested"
  ]
}
```

**Payload Example:**
```javascript
{
  "event": "project.completed",
  "timestamp": "2025-09-26T14:30:00Z",
  "data": {
    "project_id": "uuid-here",
    "name": "Mobile App Redesign",
    "completed_phases": 5,
    "team_size": 8,
    "duration_days": 45
  }
}
```

### SDKs Disponíveis

#### JavaScript/TypeScript
```bash
npm install @dttools/sdk
```

```javascript
import { DTToolsClient } from '@dttools/sdk';

const client = new DTToolsClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.dttools.app/v1'
});

// Criar projeto
const project = await client.projects.create({
  name: "My Innovation Project",
  description: "Redesigning our mobile app"
});

// Listar personas
const personas = await client.personas.list(project.id);
```

#### Python
```bash
pip install dttools-sdk
```

```python
from dttools import DTToolsClient

client = DTToolsClient(api_key='your-api-key')

# Criar mapa de empatia
empathy_map = client.empathy_maps.create(
    project_id='project-uuid',
    name='Primary User',
    says=['Wants easy navigation'],
    thinks=['Worried about privacy'],
    does=['Uses mobile 80% of time'],
    feels=['Frustrated with current app']
)
```

---

## 🔒 Segurança e Compliance {#seguranca}

### Autenticação e Autorização

**Fluxo de Autenticação:**
1. Login via email/password ou OAuth
2. Server retorna JWT token + refresh token
3. Client armazena tokens (httpOnly cookies)
4. Requests incluem Bearer token
5. Server valida e renova tokens

**Permissões por Papel:**
```javascript
{
  "admin": ["*"],
  "owner": ["project:*", "team:*"],
  "member": ["project:read", "project:write"],
  "viewer": ["project:read"]
}
```

### Criptografia

**Em Trânsito:**
- TLS 1.3 obrigatório
- HSTS headers
- Certificate pinning

**Em Repouso:**
- AES-256 para dados sensíveis
- Bcrypt para passwords (cost 12)
- Field-level encryption para PIIs

### Compliance LGPD

**Dados Coletados:**
- Email e nome (identificação)
- Dados de uso (analytics)
- Conteúdo de projetos (necessário)

**Direitos Garantidos:**
- Portabilidade (export JSON/PDF)
- Retificação (via UI)
- Exclusão (soft delete + hard delete)
- Transparência (privacy policy)

**Implementação Técnica:**
```javascript
// Anonização automática após 30 dias de inatividade
async function anonymizeInactiveUsers() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  
  await db.user.updateMany({
    where: {
      lastLogin: { lt: cutoff },
      gdprOptOut: true
    },
    data: {
      email: 'anonymized@dttools.app',
      name: 'Anonymous User',
      personalData: null
    }
  });
}
```

### Auditoria e Logs

**Eventos Auditados:**
- Login/logout attempts
- Permission changes
- Data exports
- Admin actions
- Failed API calls

**Log Structure:**
```javascript
{
  "timestamp": "2025-09-26T14:30:00Z",
  "level": "info",
  "event": "user.login.success",
  "user_id": "uuid-here",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "login_method": "email",
    "session_id": "sess_abc123"
  }
}
```

---

## 💾 Backup e Recuperação {#backup}

### Estratégia de Backup

**Frequência:**
- **Database:** Backup contínuo (WAL) + snapshot diário
- **Files:** Sync incremental a cada 4 horas  
- **Configs:** Backup semanal versionado

**Retenção:**
- Daily backups: 30 dias
- Weekly backups: 12 semanas
- Monthly backups: 12 meses
- Yearly backups: 7 anos

### Procedimentos de Recuperação

#### Recuperação Completa do Sistema
```bash
# 1. Restore database
pg_restore --clean --if-exists \
  -h localhost -U postgres \
  -d dttools_prod \
  backup_2025-09-26.dump

# 2. Restore files
aws s3 sync s3://dttools-backups/files/2025-09-26/ \
             s3://dttools-storage/

# 3. Restart services
docker-compose down
docker-compose up -d

# 4. Verify integrity
npm run db:check
npm run health:check
```

#### Recuperação Point-in-Time
```bash
# Recovery to specific timestamp
pg_basebackup -D /recovery/data
# Configure recovery.conf with target time
# Start postgres in recovery mode
```

### Disaster Recovery

**RTO (Recovery Time Objective):** 4 horas  
**RPO (Recovery Point Objective):** 15 minutos

**Cenários Cobertos:**
- Hardware failure
- Data center outage  
- Cyber attack
- Human error
- Natural disaster

**Runbook Automatizado:**
```bash
#!/bin/bash
# disaster_recovery.sh

echo "Starting DR procedure..."

# Switch DNS to DR site
./scripts/dns_failover.sh

# Restore from latest backup
./scripts/restore_latest.sh

# Health checks
./scripts/health_check.sh

# Notify team
./scripts/notify_team.sh "DR completed"
```

---

## 📊 Monitoramento e Logs {#monitoramento}

### Métricas Principais

**Sistema:**
- CPU usage < 70%
- Memory usage < 80% 
- Disk usage < 85%
- Network latency < 100ms

**Aplicação:**
- Response time < 500ms (p95)
- Error rate < 0.1%
- Availability > 99.9%
- Throughput (requests/sec)

**Negócio:**
- Daily/Monthly Active Users
- Project creation rate
- Feature adoption
- User retention

### Stack de Monitoramento

**Métricas:** Prometheus + Grafana  
**Logs:** Winston + ELK Stack  
**APM:** Datadog / New Relic  
**Uptime:** UptimeRobot  
**Alerts:** PagerDuty

### Configuração do Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'dttools-api'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

### Dashboards Grafana

**System Overview:**
- CPU, Memory, Disk usage
- Network I/O
- Database connections
- Error rate trends

**Application Performance:**
- API response times
- Database query performance  
- Queue processing times
- User sessions

**Business Metrics:**
- User registrations
- Project completions
- Feature usage
- Revenue tracking

### Alertas Críticos

```yaml
# alerts.yml
groups:
  - name: critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 2m
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        annotations:
          summary: "Database is down"
          
      - alert: DiskSpaceLow
        expr: disk_free_percent < 10
        for: 5m
        annotations:
          summary: "Disk space critically low"
```

---

## ⚡ Scaling e Performance {#performance}

### Otimizações de Performance

**Database:**
```sql
-- Índices importantes
CREATE INDEX CONCURRENTLY idx_projects_user_id 
ON projects(user_id);

CREATE INDEX CONCURRENTLY idx_personas_project_id 
ON personas(project_id);

CREATE INDEX CONCURRENTLY idx_ideas_project_id_created_at 
ON ideas(project_id, created_at DESC);

-- Particionamento por data para logs
CREATE TABLE audit_logs_2025_09 PARTITION OF audit_logs
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
```

**API Caching:**
```javascript
// Redis caching strategy
const cache = {
  projects: 300,    // 5 minutes
  personas: 600,    // 10 minutes  
  static: 3600,     // 1 hour
  user: 900         // 15 minutes
};

// Implementation
app.get('/api/projects/:id', 
  cacheMiddleware(cache.projects),
  getProject
);
```

**Frontend Optimizations:**
```javascript
// Code splitting
const PersonaTool = lazy(() => import('./PersonaTool'));
const IdeationTool = lazy(() => import('./IdeationTool'));

// Bundle analysis
npm run build:analyze

// Preloading critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

### Horizontal Scaling

**Load Balancer (Nginx):**
```nginx
upstream dttools_backend {
    least_conn;
    server api1.dttools.com:5000 weight=3;
    server api2.dttools.com:5000 weight=3;
    server api3.dttools.com:5000 weight=2;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.dttools.app;
    
    location / {
        proxy_pass http://dttools_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Database Read Replicas:**
```javascript
// Database connection pool
const pool = {
  master: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20
  }),
  
  replica: new Pool({
    connectionString: process.env.DATABASE_READ_URL,
    max: 30
  })
};

// Query routing
function executeQuery(sql, params, options = {}) {
  const isWrite = options.write || 
    sql.trim().toLowerCase().startsWith('insert') ||
    sql.trim().toLowerCase().startsWith('update') ||
    sql.trim().toLowerCase().startsWith('delete');
    
  const connection = isWrite ? pool.master : pool.replica;
  return connection.query(sql, params);
}
```

### Auto Scaling (Kubernetes)

```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dttools-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dttools-api
  template:
    metadata:
      labels:
        app: dttools-api
    spec:
      containers:
      - name: api
        image: dttools/api:latest
        ports:
        - containerPort: 5000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dttools-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dttools-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 🔧 Troubleshooting {#troubleshooting}

### Problemas Comuns

#### 1. "Cannot connect to database"

**Sintomas:**
- API retorna 500 errors
- Logs mostram connection timeouts
- Health check falha

**Diagnóstico:**
```bash
# Check database status
pg_isready -h $PGHOST -p $PGPORT -U $PGUSER

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check locks
SELECT * FROM pg_locks WHERE NOT GRANTED;
```

**Solução:**
```bash
# Restart database
sudo systemctl restart postgresql

# Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < NOW() - INTERVAL '5 minutes';

# Adjust connection limits
ALTER SYSTEM SET max_connections = 200;
SELECT pg_reload_conf();
```

#### 2. "High memory usage"

**Sintomas:**
- Server becomes unresponsive
- OOM killer activated
- Slow response times

**Diagnóstico:**
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Node.js specific
node --max-old-space-size=4096 server.js

# Check for memory leaks
npm install -g clinic
clinic doctor -- node server.js
```

**Solução:**
```bash
# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=2048"

# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Monitor with tools
npm install -g pm2
pm2 start server.js --max-memory-restart 1G
```

#### 3. "Slow API responses"

**Sintomas:**
- Response times > 2 seconds
- Timeouts on frontend
- Database query slow log entries

**Diagnóstico:**
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
AND n_distinct > 100 
AND correlation < 0.1;
```

**Solução:**
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_slow_query 
ON projects(user_id, created_at DESC);

-- Update table statistics
ANALYZE projects;

-- Optimize query
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM projects WHERE user_id = $1;
```

### Performance Profiling

#### Backend Profiling
```bash
# Install profiler
npm install -g 0x

# Profile application
0x server.js

# Generate flame graph
node --prof server.js
node --prof-process isolate-*.log > processed.txt
```

#### Frontend Profiling
```bash
# Bundle analyzer
npm run build:analyze

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Performance monitoring
npm install web-vitals
```

### Log Analysis

#### Common Error Patterns
```bash
# Database connection errors
grep "connection" /var/log/dttools/app.log | tail -50

# Authentication failures  
grep "auth.*failed" /var/log/dttools/app.log

# API rate limit hits
grep "rate.*limit" /var/log/nginx/access.log

# Memory issues
grep -i "out of memory" /var/log/dttools/app.log
```

#### Structured Log Queries
```bash
# Using jq for JSON logs
cat app.log | jq 'select(.level=="error")' | jq '.message'

# Error frequency analysis
cat app.log | jq -r '.error_code' | sort | uniq -c | sort -nr

# User-specific issues
cat app.log | jq 'select(.user_id=="user-uuid-here")'
```

---

## 🆘 Suporte Técnico {#suporte}

### Canais de Suporte

**Email:** devs@dttools.app  
**Slack:** #dttools-devs  
**GitHub:** Issues e discussions  
**Docs:** docs.dttools.app

### SLAs

**Severidade 1 (Crítico):** 
- Sistema down ou major security issue
- Resposta: 1 hora
- Resolução: 4 horas

**Severidade 2 (Alto):**
- Funcionalidade core não funciona
- Resposta: 4 horas  
- Resolução: 24 horas

**Severidade 3 (Normal):**
- Bug que não impede uso
- Resposta: 24 horas
- Resolução: 72 horas

**Severidade 4 (Baixo):**
- Enhancement requests
- Resposta: 72 horas
- Resolução: Próxima release

### Informações para Suporte

**Sempre inclua:**
- Environment (dev/staging/prod)
- Timestamp do problema
- User ID / Session ID
- Browser/OS information
- Steps to reproduce
- Expected vs actual behavior

**Template de Bug Report:**
```markdown
## Bug Report

**Environment:** Production
**Timestamp:** 2025-09-26 14:30:00 UTC
**User:** user@example.com (uuid-here)
**Browser:** Chrome 118.0.5993.88

**Issue Description:**
Cannot save persona after uploading image

**Steps to Reproduce:**
1. Go to Phase 1 - Personas
2. Click "New Persona" 
3. Fill form fields
4. Upload image (JPG, 2MB)
5. Click "Save"

**Expected:** Persona saves successfully
**Actual:** Spinner shows indefinitely, no error message

**Console Errors:**
```
Failed to load resource: the server responded with status 500
POST https://api.dttools.app/v1/personas 500
```

**Additional Context:**
- Works fine without image upload
- Issue started around 14:00 UTC
- Affects multiple users
```

### Monitoring Dashboards

**System Health:** https://status.dttools.app  
**Performance:** https://grafana.dttools.app  
**Logs:** https://kibana.dttools.app  
**Alerts:** https://pagerduty.com/dttools

---

## 📞 Contato da Equipe Técnica

**CTO:** tech@dttools.app  
**DevOps Lead:** devops@dttools.app  
**Security Officer:** security@dttools.app  

**Emergency Contact:** +55 11 99999-9999  
**Status Page:** https://status.dttools.app

---

**© 2025 DTTools - Documentação Técnica**

*Versão 1.0 - Setembro 2025*  
*Para uso interno e parceiros técnicos*