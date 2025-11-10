# Migração DTTools - Aplicação Full-Stack

## 📋 Informações Gerais

- **Nome do Projeto**: DTTools (Design Thinking Tools)
- **Tipo**: Aplicação SaaS Full-Stack
- **Domínio**: dttools.app
- **Origem**: Migração do Replit
- **Plano Contratado**: Platinum

## 🔧 Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **Vite** (build system)
- **Tailwind CSS** + shadcn/ui
- **Wouter** (routing)

### Backend
- **Node.js 18+** (ES Modules)
- **Express.js** + TypeScript
- **PostgreSQL** com Drizzle ORM
- **Stripe** (pagamentos)
- **Express-session** (autenticação)

### Integrações
- **Stripe** (sistema de pagamentos ativo)
- **n8n** (automações - opcional para início)

## 🚀 Scripts de Deploy

```bash
# Instalação de dependências
npm install

# Build de produção
npm run build

# Iniciar aplicação em produção
npm run start

# Verificação de tipos
npm run check

# Migração do banco de dados
npm run db:push
```

## 🔐 Variáveis de Ambiente

### Obrigatórias para funcionamento:

```env
NODE_ENV=production
DATABASE_URL=[configurar PostgreSQL na StayCloud]
SESSION_SECRET=[fornecerei via ticket seguro]
STRIPE_SECRET_KEY=[fornecerei via ticket seguro]
VITE_STRIPE_PUBLIC_KEY=[fornecerei via ticket seguro]
PORT=5000
```

### Opcionais (para funcionalidades avançadas):
```env
OPENAI_API_KEY=[para funcionalidades de IA - futuro]
```

## 📦 Dependências Críticas

### Runtime
- **Node.js 18+** (suporte a ES Modules)
- **PostgreSQL** (banco de dados)
- **SSL/HTTPS** (obrigatório para Stripe)

### Principais bibliotecas:
- express (^4.21.2)
- stripe (^18.5.0)
- drizzle-orm (^0.39.1)
- @neondatabase/serverless (^0.10.4)
- bcrypt (^6.0.0)
- express-session (^1.18.1)

## 🛠️ Configuração Específica

### 1. Processo de Build
```bash
# O build gera arquivos em /dist
npm run build

# Estrutura após build:
/dist/         # Arquivos do servidor
/dist/client/  # Arquivos estáticos do frontend
```

### 2. Configuração do Servidor
- **Porta**: 5000 (configurável via PORT)
- **Processo**: Requer process manager (PM2 recomendado)
- **Sessões**: Atualmente MemoryStore (migrar para PostgreSQL)

### 3. PostgreSQL Setup
- **Driver**: @neondatabase/serverless
- **ORM**: Drizzle
- **Migrations**: Executar `npm run db:push` após configurar DATABASE_URL

### 4. Arquivos Estáticos
- **Build output**: `/dist/client/`
- **Assets**: Servidos pelo Express
- **Uploads**: Configurar diretório para uploads futuros

## 🌐 Configurações de Domínio

### Domínio Principal
- **dttools.app** (já registrado)
- **SSL**: Obrigatório (Let's Encrypt)
- **Redirecionamento**: www → apex

### Configuração DNS
- Configurar A record apontando para IP da StayCloud
- Configurar CNAME para www se necessário

## 💳 Integração Stripe

### Configuração Necessária
- **Webhooks**: Configurar endpoint `/api/stripe/webhook`
- **Ambiente**: Usar chaves LIVE (não test)
- **Métodos**: Cartão, PIX, boleto para Brasil

### URLs de Webhook (pós-migração)
```
https://dttools.app/api/stripe/webhook
```

## 🔍 Monitoramento e Logs

### Health Checks
- **Endpoint**: `GET /api/health` (criar se não existir)
- **Database**: Verificar conectividade PostgreSQL
- **Stripe**: Verificar conexão com APIs

### Logs Importantes
- Express access logs
- Stripe webhook logs  
- Database connection logs
- Application errors

## ⚙️ Configurações de Performance

### Recomendações
- **PM2**: Para gerenciar processo Node.js
- **Gzip**: Comprimir respostas HTTP
- **Cache**: Headers para arquivos estáticos
- **Database**: Connection pooling

## 🚨 Pontos de Atenção

### Críticos para funcionamento
1. **SSL obrigatório** - Stripe requer HTTPS
2. **PostgreSQL** deve estar configurado antes do primeiro start
3. **Variáveis de ambiente** são essenciais
4. **Build process** deve rodar sem erros

### Dados para migrar
1. **Database**: Usuários, projetos, planos de assinatura
2. **Sessões**: Reconfigurar sistema de sessões
3. **Assets**: Arquivos estáticos e uploads

## 📞 Suporte Técnico

### Em caso de problemas durante a migração
- **Logs**: Verificar logs do Node.js e PostgreSQL
- **Build**: Executar `npm run check` para verificar tipos
- **Database**: Testar conexão com `npm run db:push`
- **Stripe**: Verificar webhooks no dashboard Stripe

## 📋 Checklist Pós-Migração

- [ ] Aplicação inicia sem erros (`npm run start`)
- [ ] Database conecta corretamente
- [ ] Frontend carrega (React app)
- [ ] Login/logout funcionam
- [ ] Stripe checkout funciona
- [ ] SSL configurado
- [ ] Domínio dttools.app aponta corretamente
- [ ] Webhooks Stripe configurados

---

**Observações Importantes:**

1. Esta é uma aplicação SaaS ativa com sistema de pagamentos
2. Possui usuários cadastrados e dados importantes
3. Integração Stripe deve funcionar imediatamente após migração
4. Backup dos dados é essencial antes da migração

**Fornecerei as variáveis de ambiente sensíveis via ticket de suporte seguro após confirmação da configuração inicial.**