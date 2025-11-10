# 🌐 Guia Completo de Deploy no Netlify - DTTools

## 📋 Pré-requisitos

### Conta e Configurações
- ✅ Conta no Netlify (grátis em netlify.com)
- ✅ Conta no GitHub com repositório DTTools
- ✅ Node.js 18+ instalado localmente

### Preparação do Código
- ✅ Arquivo `netlify.toml` criado na raiz do projeto
- ✅ Build scripts configurados no package.json
- ✅ Variáveis de ambiente identificadas

---

## 🚀 Método 1: Deploy via GitHub (Recomendado)

### Passo 1: Conectar Repositório
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **"New site from Git"**
3. Escolha **GitHub** como provider
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório **DTTools**

### Passo 2: Configurar Build Settings
```yaml
Base directory: (deixe vazio)
Build command: cd client && npm install && npm run build
Publish directory: client/dist
Functions directory: netlify/functions
```

### Passo 3: Variáveis de Ambiente
No dashboard do Netlify, vá em **Site Settings → Environment Variables**:

**Obrigatórias:**
```
OPENAI_API_KEY=sk-xxxxxxxx (sua chave OpenAI)
SESSION_SECRET=sua-session-secret-segura
```

**Para Stripe (se usar pagamentos):**
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxx
```

**Para Produção:**
```
NODE_ENV=production
DATABASE_URL=sua-connection-string-postgres
```

### Passo 4: Deploy!
1. Clique em **"Deploy site"**
2. Aguarde o build (3-5 minutos)
3. Site estará disponível em `https://random-name.netlify.app`

---

## ⚡ Método 2: Deploy via Netlify CLI

### Passo 1: Instalar CLI
```bash
npm install -g netlify-cli
```

### Passo 2: Login e Inicializar
```bash
# Login no Netlify
netlify login

# Na pasta raiz do projeto
netlify init

# Escolher:
# - Create & configure a new site
# - Your team (ou personal)
# - Site name: dttools (ou outro nome)
```

### Passo 3: Build Local e Deploy
```bash
# Build do frontend
cd client
npm install
npm run build
cd ..

# Deploy de teste
netlify deploy

# Deploy para produção
netlify deploy --prod
```

---

## 🔧 Método 3: Deploy Manual (Emergência)

### Passo 1: Build Local
```bash
# Na pasta client
cd client
npm install
npm run build

# Isso criará a pasta client/dist
```

### Passo 2: Upload Manual
1. No dashboard Netlify, clique **"Deploy manually"**
2. Arraste a pasta `client/dist` para o upload
3. Aguarde o upload completar

⚠️ **Limitação:** Não inclui functions/backend - apenas frontend

---

## 🛠️ Configuração Avançada

### Custom Domain
1. **Site Settings → Domain management**
2. **Add custom domain:** `dttools.app`
3. **Configure DNS** no seu provedor:
   ```
   Type: CNAME
   Name: www
   Value: seu-site.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify Load Balancer)
   ```
4. **Force HTTPS:** Ativado automaticamente

### Serverless Functions
O DTTools já está configurado para usar Netlify Functions:

**Estrutura:**
```
netlify/
  functions/
    api.js          # Express app como function
    chat.js         # IA chat endpoints
    auth.js         # Autenticação
```

**Endpoints disponíveis:**
- `/.netlify/functions/api/login`
- `/.netlify/functions/api/projects`
- `/.netlify/functions/api/chat`

### Redirects e SPA
O arquivo `netlify.toml` já configura:
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📊 Monitoramento e Analytics

### Netlify Analytics
1. **Site Settings → Analytics**
2. **Enable Netlify Analytics** (R$ 45/mês)
3. Métricas disponíveis:
   - Page views e unique visitors
   - Top pages e referrers
   - Bandwidth usage
   - Core Web Vitals

### Function Monitoring
1. **Functions → Logs**
2. Monitore:
   - Invocations por minuto
   - Duration média
   - Error rate
   - Cold starts

### Alertas
Configure em **Site Settings → Notifications**:
- Build failures
- Form submissions
- Deploy notifications
- Function errors

---

## 🔒 Segurança e Performance

### Headers de Segurança
Já configurados no `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### Cache Strategy
```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### CDN Edge Locations
Netlify automaticamente distribui via:
- 🇺🇸 Estados Unidos (múltiplas regiões)
- 🇪🇺 Europa (Londres, Frankfurt)
- 🇸🇬 Ásia-Pacífico (Singapura)
- 🇧🇷 **Brasil (São Paulo)** - baixa latência!

---

## 💾 Database Setup

### Opção 1: Neon (Recomendado)
```bash
# No dashboard Neon.tech
1. Criar database PostgreSQL
2. Copiar connection string
3. Adicionar em Netlify Environment Variables:
   DATABASE_URL=postgresql://user:pass@host/db
```

### Opção 2: Supabase
```bash
# No dashboard Supabase
1. New project
2. Database → Settings → Connection string
3. Adicionar no Netlify como DATABASE_URL
```

### Opção 3: PlanetScale (MySQL)
```bash
# No dashboard PlanetScale
1. New database
2. Connect → Netlify
3. Install no Netlify automaticamente
```

---

## 🚨 Troubleshooting

### Build Failures

**Erro: "Module not found"**
```bash
# Verificar package.json nas pastas corretas
ls client/package.json
ls server/package.json

# Build command deve ser:
cd client && npm install && npm run build
```

**Erro: "Out of memory"**
```bash
# No netlify.toml adicionar:
[build.environment]
  NODE_OPTIONS = "--max_old_space_size=4096"
```

### Function Errors

**Erro: "Function timeout"**
```javascript
// Functions têm limite de 10 segundos
// Para operações longas, usar background functions
export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // ... código
};
```

**Erro: "Cold starts"**
```javascript
// Implementar function warming
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200 };
  }
  // ... resto da function
};
```

### DNS Issues

**Propagação DNS lenta:**
```bash
# Verificar DNS
nslookup dttools.app
dig dttools.app

# Forçar refresh (pode levar até 48h)
```

**HTTPS não funciona:**
1. Verificar se DNS está correto
2. **Site Settings → HTTPS → Renew certificate**
3. Aguardar até 24h para provisioning

---

## 📈 Performance Optimization

### Build Performance
```toml
# netlify.toml
[build]
  command = "cd client && npm ci && npm run build"
  publish = "client/dist"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
```

### Function Optimization
```javascript
// Reutilizar conexões
let dbConnection;

export const handler = async (event) => {
  if (!dbConnection) {
    dbConnection = await createConnection();
  }
  // ... usar dbConnection
};
```

### Frontend Optimization
```bash
# Vite já otimiza automaticamente:
# - Tree shaking
# - Code splitting
# - Asset optimization
# - Gzip compression (Netlify CDN)
```

---

## 💰 Custos e Limites

### Plano Starter (Grátis)
- ✅ 100GB bandwidth/mês
- ✅ 300 function invocations/mês
- ✅ 125K function runtime segundos/mês
- ✅ 1 concurrent build
- ❌ Analytics

### Plano Pro (US$ 19/mês)
- ✅ 400GB bandwidth/mês
- ✅ 2M function invocations/mês
- ✅ 125K function runtime segundos/mês
- ✅ 3 concurrent builds
- ✅ Analytics incluído
- ✅ Background functions

### Estimativa DTTools
**Cenário Conservador (1K usuários ativos):**
- Bandwidth: ~50GB/mês
- Functions: ~500K invocations/mês
- **Custo:** Plano Starter (grátis)

**Cenário Growth (10K usuários):**
- Bandwidth: ~200GB/mês
- Functions: ~2M invocations/mês
- **Custo:** Plano Pro (US$ 19/mês)

---

## 🔄 CI/CD Pipeline

### Auto-Deploy
Todo push para `main` automaticamente:
1. **Trigger** build no Netlify
2. **Install** dependencies
3. **Build** aplicação
4. **Test** (se configurado)
5. **Deploy** para produção
6. **Notify** via Slack/email

### Branch Previews
- Cada PR automaticamente gera preview URL
- Testes de QA em ambiente isolado
- Merge automaticamente deploya para produção

### Rollback Strategy
```bash
# Via CLI
netlify sites:list
netlify api listSiteDeploys --data='{"site_id":"SITE_ID"}'
netlify api restoreSiteDeploy --data='{"site_id":"SITE_ID","deploy_id":"DEPLOY_ID"}'

# Via Dashboard
Site Overview → Deploys → Deploy actions → Restore
```

---

## 🎯 Checklist Final

### Pré-Deploy
- [ ] Código commitado e pushado para GitHub
- [ ] `netlify.toml` configurado corretamente
- [ ] Environment variables listadas
- [ ] Build local testado com `npm run build`
- [ ] Redirects funcionando corretamente

### Pós-Deploy
- [ ] Site acessível via URL Netlify
- [ ] Functions respondendo corretamente
- [ ] Database conectada
- [ ] Environment variables configuradas
- [ ] Custom domain configurado (se aplicável)
- [ ] HTTPS funcionando
- [ ] Performance testada (Core Web Vitals)

### Monitoramento
- [ ] Analytics configurado
- [ ] Alertas de build configurados
- [ ] Monitoring de functions ativo
- [ ] Backup strategy para database
- [ ] DNS monitoring ativo

---

## 📞 Suporte

### Documentação Oficial
- [Netlify Docs](https://docs.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify CLI](https://cli.netlify.com)

### Comunidade
- [Netlify Community Forum](https://community.netlify.com)
- [Discord](https://discord.gg/netlify)
- [Twitter @netlify](https://twitter.com/netlify)

### Contato DTTools
- **Suporte técnico:** tech@dttools.app
- **Emergency hotline:** +55 11 99999-9999
- **Documentation:** docs.dttools.app

---

*Guia criado para DTTools v2.0*  
*Última atualização: Setembro 2024*

🚀 **Boa sorte com seu deploy! O Brasil inteiro poderá acessar o DTTools em poucos minutos!**