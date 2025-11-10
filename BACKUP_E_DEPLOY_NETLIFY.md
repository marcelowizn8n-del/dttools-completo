# 🔄 Backup e Deploy: Replit → Netlify

## 🛡️ PASSO 1: BACKUP DO SITE ATUAL (OBRIGATÓRIO)

### ⚠️ Importante: Faça isso ANTES de qualquer alteração!

#### A. Backup via Netlify Dashboard
1. **Acesse seu dashboard Netlify**
2. **Selecione seu site atual**
3. **Vá em "Deploys"**
4. **Clique no último deploy bem-sucedido**
5. **Download do site:**
   - **Método 1:** Clique em "Download deploy" 
   - **Método 2:** Use Netlify CLI:
   ```bash
   # Instalar CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Listar sites
   netlify sites:list
   
   # Download do último deploy
   netlify api getSiteDeploy --data='{"site_id":"SEU_SITE_ID","deploy_id":"DEPLOY_ID"}' > backup.json
   ```

#### B. Backup via Git (se conectado ao GitHub)
1. **Clone o repositório atual:**
   ```bash
   git clone https://github.com/seu-usuario/seu-repo-atual.git backup-site
   ```

#### C. Backup Manual da Configuração
**Salve essas informações:**
- ✅ **Domain settings** (custom domain)
- ✅ **Environment variables** 
- ✅ **Build settings** (command, directory)
- ✅ **Function settings**
- ✅ **Redirect rules**
- ✅ **SSL certificates** (anotação dos domains)

---

## 🚀 PASSO 2: PREPARAR CÓDIGO NO REPLIT

### A. Organizar Repositório Git
```bash
# No terminal do Replit
git init
git add .
git commit -m "DTTools - Versão completa para deploy"
```

### B. Conectar ao GitHub
1. **Crie novo repositório no GitHub** (ex: `dttools-app`)
2. **No Replit, vá na aba "Git"**
3. **Connect to GitHub**
4. **Autorize e selecione o repositório criado**
5. **Push inicial:**
   ```bash
   git remote add origin https://github.com/seu-usuario/dttools-app.git
   git branch -M main  
   git push -u origin main
   ```

---

## 🌐 PASSO 3: DEPLOY NO NETLIFY

### Opção A: Substituir Site Existente (Recomendado)
1. **No dashboard Netlify**
2. **Selecione seu site atual**
3. **Site Settings → Build & Deploy → Repository**
4. **Link to different repository**
5. **Conecte ao novo repo `dttools-app`**
6. **Configure build settings:**
   ```
   Base directory: (vazio)
   Build command: cd client && npm install && npm run build
   Publish directory: client/dist
   Functions directory: netlify/functions
   ```

### Opção B: Criar Novo Site (Mais Seguro)
1. **New site from Git**
2. **GitHub → dttools-app**
3. **Mesmo build settings acima**
4. **Depois de testar, apontar domínio para novo site**

---

## ⚙️ PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

### Variáveis Obrigatórias:
```bash
# No Netlify: Site Settings → Environment Variables
OPENAI_API_KEY=sk-proj-xxxxxxxx
SESSION_SECRET=sua-chave-super-segura-aqui
NODE_ENV=production
```

### Variáveis do Stripe (se usar pagamentos):
```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxx
```

### Variáveis de Database (se usar):
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

## 🔍 PASSO 5: TESTE E VALIDAÇÃO

### A. Deploy de Teste
1. **Aguarde build completar** (3-5 minutos)
2. **Acesse URL temporária** do Netlify
3. **Teste todas as funcionalidades:**
   - ✅ Login/cadastro
   - ✅ Navegação entre páginas
   - ✅ Chat de IA (se OPENAI_API_KEY configurada)
   - ✅ Sistema de fases
   - ✅ Dashboard

### B. Teste de Performance
- ✅ **Core Web Vitals** no lighthouse
- ✅ **Tempo de carregamento** < 3s
- ✅ **Functions funcionando** (API endpoints)

---

## 🌍 PASSO 6: MIGRAÇÃO DO DOMÍNIO

### A. Preparação
```bash
# Antes de mudar DNS, teste:
curl -I https://dttools.app  # Site atual
curl -I https://novo-site.netlify.app  # Novo site
```

### B. Migração do Domínio Custom
1. **No site novo: Site Settings → Domain management**
2. **Add custom domain: `dttools.app`**
3. **Aguardar Netlify configurar SSL**
4. **Testar: `https://dttools.app`**

### C. Rollback Plan (se algo der errado)
1. **Manter backup acessível**
2. **DNS TTL baixo (300s) durante migração**
3. **Monitorar por 24h após migração**

---

## 🚨 PLANO DE CONTINGÊNCIA

### Se algo der errado:

#### Problema: Build Failure
```bash
# Verificar logs no Netlify
# Comum: dependências missing
# Solução: verificar package.json

# Testar build local primeiro:
cd client && npm install && npm run build
```

#### Problema: Site não funciona
1. **Verificar environment variables**
2. **Verificar redirects no netlify.toml**
3. **Verificar functions**

#### Rollback Completo
1. **Reconectar site antigo ao repository original**
2. **Restaurar environment variables**
3. **Aguardar redeploy automático**

---

## ⚡ DEPLOY RÁPIDO (5 MINUTOS)

### Para quem tem pressa:

```bash
# 1. No Replit
git init
git add .
git commit -m "DTTools complete"

# 2. Criar repo GitHub e conectar via interface Replit

# 3. No Netlify
# - Import from GitHub
# - Build: cd client && npm install && npm run build
# - Publish: client/dist
# - Add environment variables

# 4. Aguardar deploy e testar
```

---

## 📋 CHECKLIST PRÉ-DEPLOY

### Antes de começar:
- [ ] **Backup completo** do site atual
- [ ] **Testar build local** no Replit
- [ ] **Repositório GitHub** criado
- [ ] **Environment variables** anotadas
- [ ] **Domain/SSL settings** documentados

### Durante o deploy:
- [ ] **Build settings** corretos
- [ ] **Variables** configuradas
- [ ] **Functions** funcionando
- [ ] **Redirects** aplicados

### Após deploy:
- [ ] **Testes funcionais** completos
- [ ] **Performance** validada
- [ ] **SSL** funcionando
- [ ] **Analytics** configurado
- [ ] **Backup do novo site**

---

## 📞 SUPORTE DE EMERGÊNCIA

### Se precisar de ajuda:
- **Netlify Support:** https://community.netlify.com
- **Replit Discord:** https://discord.gg/replit
- **Status Pages:**
  - Netlify: https://netlifystatus.com
  - GitHub: https://githubstatus.com

### Comandos úteis para debug:
```bash
# Testar conectividade
ping dttools.app
nslookup dttools.app

# Verificar SSL
curl -I https://dttools.app

# Test build local
npm run build 2>&1 | tee build.log
```

---

**🎯 RESUMO: Backup → GitHub → Netlify → Teste → Domínio**

**⏱️ Tempo estimado: 15-30 minutos (+ tempo de propagação DNS)**

**🛡️ Risco: BAIXO (com backup adequado)**