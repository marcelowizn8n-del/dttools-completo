# Manual de Administração - DTTools
**Design Thinking Tools Platform**

---

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Acesso Administrativo](#acesso-administrativo)
3. [Gerenciamento de Usuários](#gerenciamento-de-usuários)
4. [Gerenciamento de Conteúdo](#gerenciamento-de-conteúdo)
5. [Sistema de Assinaturas](#sistema-de-assinaturas)
6. [Monitoramento e Analytics](#monitoramento-e-analytics)
7. [Backup e Segurança](#backup-e-segurança)
8. [Manutenção do Sistema](#manutenção-do-sistema)
9. [Troubleshooting](#troubleshooting)

---

## 1. Visão Geral do Sistema {#visão-geral}

### Arquitetura
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: Express Sessions
- **Payment**: Stripe
- **AI**: OpenAI + Google Gemini

### Componentes Principais
- Sistema de Autenticação
- 5 Fases do Design Thinking
- Ferramentas Interativas (Konva.js)
- Sistema de Benchmarking
- Chat IA
- Exportação (PDF, PPTX, Markdown)
- Sistema de Assinaturas

---

## 2. Acesso Administrativo {#acesso-administrativo}

### Credenciais Padrão
- **Email**: dttools.app@gmail.com
- **Senha**: Gulex0519!@
- **Papel**: admin

⚠️ **IMPORTANTE**: Altere estas credenciais imediatamente após o primeiro acesso em produção!

### Primeiro Acesso

1. Acesse: `https://dttools.app/login`
2. Faça login com as credenciais padrão
3. Vá para Perfil > Configurações
4. Altere email e senha
5. Configure autenticação de dois fatores (se disponível)

### Painel Administrativo

Acesse: `https://dttools.app/admin`

**Funcionalidades disponíveis:**
- 📊 Dashboard com métricas
- 👥 Gerenciamento de usuários
- 📚 Biblioteca de conteúdo
- 💳 Planos de assinatura
- 📈 Analytics e relatórios
- ⚙️ Configurações do sistema

---

## 3. Gerenciamento de Usuários {#gerenciamento-de-usuários}

### Visualizar Usuários

1. Acesse: **Admin > Usuários**
2. Visualize lista completa com:
   - Nome e email
   - Plano de assinatura
   - Status (ativo/inativo)
   - Data de cadastro
   - Último acesso

### Buscar Usuários

```
Campo de busca: Pesquise por nome, email ou empresa
Filtros disponíveis:
- Por plano (Free, Pro, Enterprise)
- Por status (Ativo, Inativo, Trial)
- Por data de cadastro
```

### Ações Administrativas

**Para cada usuário:**
- ✏️ **Editar**: Modificar dados do perfil
- 🔒 **Suspender**: Bloquear acesso temporariamente
- 🗑️ **Excluir**: Remover conta permanentemente
- 💳 **Alterar Plano**: Upgrade/downgrade manual
- 📊 **Ver Atividade**: Histórico de uso

### Criar Novo Usuário (Manual)

1. Admin > Usuários > **+ Novo Usuário**
2. Preencha:
   - Nome completo
   - Email
   - Empresa (opcional)
   - Cargo
   - Plano inicial
3. Sistema envia email de boas-vindas automaticamente

### Gerenciar Permissões

**Papéis disponíveis:**
- `user` - Usuário padrão
- `admin` - Administrador completo
- `moderator` - Moderador de conteúdo (se implementado)

Para alterar papel:
```
Admin > Usuários > [Selecionar Usuário] > Editar > Campo "Papel"
```

---

## 4. Gerenciamento de Conteúdo {#gerenciamento-de-conteúdo}

### Biblioteca de Conhecimento

**Admin > Biblioteca**

#### Artigos e Tutoriais

1. **Criar Novo Artigo**:
   - Título
   - Categoria (Empathy, Define, Ideate, Prototype, Test)
   - Conteúdo (editor rich text)
   - Tags
   - Nível (Iniciante, Intermediário, Avançado)
   - Publicar/Rascunho

2. **Editar Artigo Existente**:
   - Biblioteca > [Selecionar Artigo] > Editar
   - Salvar alterações
   - Histórico de versões disponível

3. **Organizar Conteúdo**:
   - Arrastar e soltar para reordenar
   - Agrupar por categoria
   - Destacar artigos principais

### Templates e Recursos

**Admin > Templates**

- Modelos de Mapa de Empatia
- Templates de Personas
- Questionários de Entrevista
- Frameworks de Ideação

**Gerenciar Templates:**
1. Upload de novos templates
2. Categorização
3. Preview antes de publicar
4. Controle de versão

---

## 5. Sistema de Assinaturas {#sistema-de-assinaturas}

### Planos Disponíveis

**Admin > Planos**

| Plano | Preço | Recursos |
|-------|-------|----------|
| Free | R$ 0 | 1 projeto, ferramentas básicas |
| Pro | R$ 49/mês | Projetos ilimitados, IA, exportação |
| Enterprise | R$ 299/mês | Tudo + benchmarking, suporte prioritário |

### Configurar Planos

1. Admin > Planos > [Selecionar Plano]
2. Editar:
   - Nome e descrição
   - Preço
   - Recursos incluídos
   - Limites (projetos, exportações, etc.)
3. Salvar alterações

### Stripe Integration

**Configuração Inicial:**

1. Acesse Stripe Dashboard: https://dashboard.stripe.com
2. Obtenha as chaves:
   - Secret Key: `sk_live_...`
   - Public Key: `pk_live_...`
3. Configure no sistema:
   ```
   Admin > Configurações > Integrações > Stripe
   ```

**Produtos e Preços no Stripe:**

Para cada plano no DTTools, crie correspondente no Stripe:
```
Stripe > Produtos > Criar Produto
- Nome: "DTTools Pro"
- Preço: R$ 49,00 BRL mensal
- Tipo: Recorrente
```

Copie o `price_id` e configure no DTTools:
```
Admin > Planos > Pro > ID do Stripe: "price_xxx"
```

### Gerenciar Assinaturas

**Visualizar Assinaturas Ativas:**
```
Admin > Assinaturas
```

**Ações disponíveis:**
- 🔄 **Renovar**: Extender assinatura manualmente
- ❌ **Cancelar**: Cancelar no final do período
- 💰 **Reembolsar**: Processar reembolso
- 📧 **Notificar**: Enviar email ao cliente

**Assinaturas Vencidas:**
- Sistema marca automaticamente como "expirado"
- Email de lembr ete enviado 7 dias antes
- Downgrade automático para plano Free após expiração

---

## 6. Monitoramento e Analytics {#monitoramento-e-analytics}

### Dashboard Principal

**Admin > Dashboard**

**Métricas em Tempo Real:**
- 👥 Usuários ativos hoje
- 📊 Projetos criados (última semana/mês)
- 💰 Receita mensal (MRR)
- 📈 Taxa de conversão Free → Pago
- ⏱️ Tempo médio de uso

### Relatórios Detalhados

**Admin > Relatórios**

1. **Relatório de Usuários**:
   - Crescimento mensal
   - Churn rate
   - Lifetime Value (LTV)
   - Segmentação por indústria

2. **Relatório de Uso**:
   - Ferramentas mais utilizadas
   - Fases mais acessadas
   - Tempo médio por sessão
   - Funcionalidades menos usadas

3. **Relatório Financeiro**:
   - Receita por plano
   - Projeção de receita
   - CAC (Custo de Aquisição)
   - ROI de marketing

**Exportar Relatórios:**
```
Relatórios > [Selecionar Tipo] > Exportar
Formatos: CSV, Excel, PDF
```

### Logs do Sistema

**Admin > Logs**

**Tipos de logs:**
- 🔐 Autenticação (logins, falhas)
- 💳 Pagamentos (sucesso, falha, reembolsos)
- ⚠️ Erros do sistema
- 🔧 Alterações administrativas
- 📤 Exportações realizadas

**Buscar Logs:**
```
Filtros:
- Por tipo
- Por usuário
- Por data/hora
- Por nível (info, warning, error)
```

---

## 7. Backup e Segurança {#backup-e-segurança}

### Backup Automático

**Configuração:**

1. Admin > Configurações > Backup
2. Configure:
   - Frequência (diário, semanal)
   - Horário (recomendado: madrugada)
   - Retenção (30 dias padrão)
   - Storage (S3, Google Cloud, etc.)

**Backup inclui:**
- ✅ Banco de dados completo
- ✅ Arquivos de usuários (uploads)
- ✅ Configurações do sistema
- ✅ Logs importantes

### Backup Manual

**Criar backup imediato:**

```bash
# Via SSH/Terminal
cd /path/to/dttools
npm run backup

# Ou via Admin Panel
Admin > Backup > Criar Backup Agora
```

### Restaurar Backup

⚠️ **ATENÇÃO**: Restauração sobrescreve dados atuais!

```bash
# Via terminal
npm run restore -- --file=backup_YYYYMMDD.tar.gz

# Confirmar operação
Are you sure? (yes/no): yes
```

**Via Admin:**
1. Admin > Backup > Restaurar
2. Selecione arquivo de backup
3. Confirme operação
4. Aguarde conclusão (pode levar alguns minutos)

### Segurança

**Práticas Recomendadas:**

1. **Senhas:**
   - Mínimo 12 caracteres
   - Incluir números, letras e símbolos
   - Rotação a cada 90 dias
   - Nunca compartilhar credenciais admin

2. **Acessos:**
   - Revisar logs de acesso semanalmente
   - Remover usuários inativos (>90 dias)
   - Monitorar tentativas de login falhas

3. **API Keys:**
   - Rotacionar chaves periodicamente
   - Usar variáveis de ambiente
   - Nunca commitar chaves no código

4. **HTTPS:**
   - Sempre usar SSL/TLS em produção
   - Certificado válido e atualizado
   - Redirecionar HTTP → HTTPS

### SSL/TLS Certificate

**Renovação (Let's Encrypt):**

```bash
# Renovar certificado
certbot renew

# Verificar status
certbot certificates
```

---

## 8. Manutenção do Sistema {#manutenção-do-sistema}

### Atualizações

**Verificar atualizações:**

```bash
# Verificar versão atual
npm run version

# Verificar updates disponíveis
npm outdated
```

**Atualizar sistema:**

```bash
# Backup primeiro!
npm run backup

# Atualizar dependências
npm update

# Rebuild
npm run build

# Reiniciar
npm run restart
```

### Limpeza de Dados

**Tarefas mensais:**

1. **Limpar dados temporários:**
   ```bash
   npm run cleanup:temp
   ```

2. **Otimizar banco de dados:**
   ```bash
   npm run db:optimize
   ```

3. **Remover backups antigos:**
   ```bash
   npm run cleanup:backups -- --older-than=90days
   ```

### Monitoramento de Performance

**Admin > Performance**

**Métricas:**
- ⚡ Tempo de resposta da API
- 💾 Uso de memória
- 💿 Uso de disco
- 🌐 Latência de rede
- 📊 Queries mais lentas

**Alertas configuráveis:**
- CPU > 80% por 5min
- Memória > 90%
- Disco > 85%
- Tempo de resposta > 2s

### Escalonamento

**Quando escalar:**
- Usuários ativos > 1000 simultâneos
- Tempo de resposta > 1s consistentemente
- CPU/memória constantemente alto

**Opções de escalonamento:**

1. **Vertical (aumentar recursos):**
   - Upgrade de servidor
   - Mais RAM
   - CPU mais potente

2. **Horizontal (mais servidores):**
   - Load balancer
   - Múltiplas instâncias
   - CDN para assets estáticos

---

## 9. Troubleshooting {#troubleshooting}

### Problemas Comuns

#### 1. Sistema Lento

**Sintomas:** Páginas demoram a carregar

**Soluções:**
```bash
# Verificar uso de recursos
npm run check:resources

# Otimizar banco
npm run db:optimize

# Limpar cache
npm run cache:clear

# Reiniciar serviços
npm run restart
```

#### 2. Erro de Login

**Sintomas:** Usuários não conseguem fazer login

**Verificar:**
1. Logs de erro: `Admin > Logs > Authentication`
2. Status do banco de dados
3. Configuração de sessões
4. Certificado SSL válido

**Solução:**
```bash
# Verificar sessões
npm run sessions:check

# Limpar sessões expiradas
npm run sessions:cleanup
```

#### 3. Falha na Exportação PDF/PPTX

**Sintomas:** Erro ao exportar projetos

**Causas comuns:**
- Falta de memória
- Timeout do servidor
- Dados corrompidos no projeto

**Solução:**
```bash
# Aumentar timeout
Editar: server/routes.ts
Aumentar timeout de exportação: 60000ms → 120000ms

# Verificar logs
tail -f logs/export-errors.log
```

#### 4. Pagamentos não Processando

**Sintomas:** Stripe retorna erro

**Verificar:**
1. Chaves do Stripe corretas
2. Webhook configurado
3. Produtos sincronizados

**Testar:**
```bash
# Modo de teste
curl -X POST http://localhost:5000/api/test-stripe

# Verificar logs Stripe
Admin > Integrações > Stripe > Ver Logs
```

#### 5. IA não Responde

**Sintomas:** Chat IA sem resposta

**Verificar:**
1. API keys (OpenAI/Gemini) válidas
2. Créditos disponíveis
3. Rate limits

**Solução:**
```bash
# Testar conexão
npm run test:ai

# Verificar créditos
# OpenAI: https://platform.openai.com/usage
# Gemini: https://console.cloud.google.com
```

### Comandos Úteis

```bash
# Status do sistema
npm run status

# Ver logs em tempo real
npm run logs:watch

# Reiniciar servidor
npm run restart

# Modo de manutenção
npm run maintenance:on
npm run maintenance:off

# Backup de emergência
npm run backup:emergency

# Verificar integridade
npm run check:health
```

### Contatos de Suporte

**Emergências:**
- 🔥 Sistema fora do ar: [criar procedimento]
- 💰 Problema de pagamento: suporte@dttools.app
- 🔒 Segurança: security@dttools.app

**Suporte técnico:**
- Email: tech@dttools.app
- Telefone: +55 11 XXXX-XXXX
- Slack: #dttools-support

---

## Apêndices

### A. Variáveis de Ambiente

```bash
# Essenciais
DATABASE_URL=postgresql://...
SESSION_SECRET=...
NODE_ENV=production

# Pagamentos
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# IA
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Email (se configurado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

### B. Estrutura do Banco de Dados

**Tabelas principais:**
- `users` - Usuários
- `projects` - Projetos
- `empathy_maps` - Mapas de empatia
- `personas` - Personas
- `ideas` - Ideias
- `prototypes` - Protótipos
- `subscription_plans` - Planos
- `user_sessions` - Sessões

### C. Checklist de Deployment

- [ ] Backup completo realizado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS ativo
- [ ] Stripe em modo produção
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Email de notificações configurado
- [ ] Credenciais admin alteradas
- [ ] Firewall configurado
- [ ] CDN configurado (se aplicável)

---

**Versão do Manual**: 1.0.0  
**Última Atualização**: $(date +%Y-%m-%d)  
**Próxima Revisão**: +3 meses

---

© 2025 DTTools - Todos os direitos reservados
