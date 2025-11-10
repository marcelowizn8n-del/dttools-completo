#!/bin/bash

# Script para criar pacote completo do DTTools
# Inclui: código fonte, manuais, materiais de marketing, guias de deployment

echo "📦 Criando pacote completo do DTTools..."

# Criar diretório temporário para o pacote
PACKAGE_DIR="dttools_complete_package"
rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

# 1. CÓDIGO FONTE E CONFIGURAÇÕES
echo "📁 Empacotando código fonte..."
mkdir -p $PACKAGE_DIR/source_code

# Copiar arquivos essenciais do projeto
cp -r client $PACKAGE_DIR/source_code/
cp -r server $PACKAGE_DIR/source_code/
cp -r shared $PACKAGE_DIR/source_code/
cp -r migrations $PACKAGE_DIR/source_code/
cp -r public $PACKAGE_DIR/source_code/

# Copiar arquivos de configuração
cp package.json $PACKAGE_DIR/source_code/
cp package-lock.json $PACKAGE_DIR/source_code/
cp tsconfig.json $PACKAGE_DIR/source_code/
cp vite.config.ts $PACKAGE_DIR/source_code/
cp tailwind.config.ts $PACKAGE_DIR/source_code/
cp postcss.config.js $PACKAGE_DIR/source_code/
cp drizzle.config.ts $PACKAGE_DIR/source_code/
cp components.json $PACKAGE_DIR/source_code/
cp netlify.toml $PACKAGE_DIR/source_code/ 2>/dev/null || true
cp .env.example $PACKAGE_DIR/source_code/ 2>/dev/null || true
cp replit.md $PACKAGE_DIR/source_code/

# Scripts de deployment
cp fix-deployment.sh $PACKAGE_DIR/source_code/ 2>/dev/null || true
cp build-for-production.sh $PACKAGE_DIR/source_code/ 2>/dev/null || true

# 2. MANUAIS E DOCUMENTAÇÃO
echo "📚 Empacotando manuais e documentação..."
mkdir -p $PACKAGE_DIR/documentation

# Manuais de usuário
cp MANUAL_USUARIO_DTTOOLS.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp manual_usuario_dttools.md $PACKAGE_DIR/documentation/ 2>/dev/null || true

# Guias técnicos
cp guia_tecnico_implementacao.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp GUIA_NETLIFY_DTTOOLS.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp BACKUP_E_DEPLOY_NETLIFY.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp CONFIGURACAO_DOMINIO_DNS_DTTOOLS.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp DEPLOY-FIX-README.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp DOWNLOAD_INSTRUCOES.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp DTTOOLS_GITHUB_UPLOAD_GUIDE.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp GITHUB_UPLOAD_CHECKLIST.md $PACKAGE_DIR/documentation/ 2>/dev/null || true
cp migracao-dttools-staycloud.md $PACKAGE_DIR/documentation/ 2>/dev/null || true

# 3. MATERIAIS DE MARKETING
echo "🎨 Empacotando materiais de marketing..."
mkdir -p $PACKAGE_DIR/marketing

cp -r marketing_dttools $PACKAGE_DIR/marketing/ 2>/dev/null || true
cp -r marketing_materials $PACKAGE_DIR/marketing/ 2>/dev/null || true
cp MATERIAL_DIVULGACAO_DTTOOLS.md $PACKAGE_DIR/marketing/ 2>/dev/null || true
cp marketing-social-media.md $PACKAGE_DIR/marketing/ 2>/dev/null || true
cp marketing_one_pager.md $PACKAGE_DIR/marketing/ 2>/dev/null || true
cp dttools_pitch_deck.md $PACKAGE_DIR/marketing/ 2>/dev/null || true
cp PLANO_NEGOCIO_DTTOOLS.md $PACKAGE_DIR/marketing/ 2>/dev/null || true

# 4. MATERIAIS PARA APP STORES
echo "📱 Empacotando materiais para lojas de aplicativos..."
mkdir -p $PACKAGE_DIR/app_stores

cp app_store_materials.md $PACKAGE_DIR/app_stores/ 2>/dev/null || true
cp GUIA_SUBMISSAO_APP_STORES.md $PACKAGE_DIR/app_stores/ 2>/dev/null || true

# Copiar screenshots se existirem
if [ -d "attached_assets" ]; then
  mkdir -p $PACKAGE_DIR/app_stores/screenshots
  find attached_assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -exec cp {} $PACKAGE_DIR/app_stores/screenshots/ \; 2>/dev/null || true
fi

# 5. ASSETS E LOGOS
echo "🖼️ Empacotando assets e logos..."
mkdir -p $PACKAGE_DIR/assets

# Copiar logos
cp public/logo-horizontal.png $PACKAGE_DIR/assets/ 2>/dev/null || true
cp public/logo-icon.png $PACKAGE_DIR/assets/ 2>/dev/null || true
cp client/src/assets/*.png $PACKAGE_DIR/assets/ 2>/dev/null || true

# 6. CRIAR README PRINCIPAL DO PACOTE
echo "📝 Criando README principal..."
cat > $PACKAGE_DIR/README.md << 'EOF'
# DTTools - Pacote Completo
**Design Thinking Tools Platform**

Este é o pacote completo do DTTools contendo todos os materiais necessários para deployment, uso e divulgação da plataforma.

## 📦 Conteúdo do Pacote

### 1. `/source_code` - Código Fonte Completo
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL com Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS
- Todos os arquivos de configuração incluídos

### 2. `/documentation` - Documentação Técnica
- **Manual do Usuário**: Guia completo de uso da plataforma
- **Guias de Deployment**: 
  - Deploy no Netlify
  - Deploy no Railway
  - Configuração de DNS e domínio
  - Backup e migração
- **Guias Técnicos**: Implementação e arquitetura

### 3. `/marketing` - Materiais de Marketing
- Plano de Negócio completo
- Pitch Deck
- Material de divulgação
- Conteúdo para redes sociais
- One-pager executivo

### 4. `/app_stores` - Materiais para Lojas de Aplicativos
- Guia de submissão para App Store e Google Play
- Screenshots prontos
- Descrições e metadados
- Ícones e assets necessários

### 5. `/assets` - Logos e Identidade Visual
- Logo horizontal
- Logo icon
- Favicon
- Outros assets visuais

## 🚀 Como Começar

### Instalação Local

```bash
cd source_code
npm install
```

### Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Variáveis necessárias:
- `DATABASE_URL` - URL do PostgreSQL
- `SESSION_SECRET` - Chave secreta para sessões
- `STRIPE_SECRET_KEY` - Chave do Stripe (pagamentos)
- `OPENAI_API_KEY` - Chave da OpenAI (IA)
- `GEMINI_API_KEY` - Chave do Google Gemini (IA)

### Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5000

### Build para Produção

```bash
npm run build
```

### Deploy

#### Opção 1: Netlify
Siga o guia em `/documentation/GUIA_NETLIFY_DTTOOLS.md`

#### Opção 2: Railway
Siga o guia em `/documentation/DTTOOLS_GITHUB_UPLOAD_GUIDE.md`

## 📚 Documentação Importante

### Para Desenvolvedores
- `source_code/replit.md` - Arquitetura e preferências do projeto
- `/documentation/guia_tecnico_implementacao.md` - Guia técnico completo

### Para Usuários
- `/documentation/MANUAL_USUARIO_DTTOOLS.md` - Manual completo do usuário

### Para Marketing e Vendas
- `/marketing/PLANO_NEGOCIO_DTTOOLS.md` - Plano de negócio
- `/marketing/dttools_pitch_deck.md` - Apresentação executiva

### Para Publicação em App Stores
- `/app_stores/GUIA_SUBMISSAO_APP_STORES.md` - Processo completo

## 🔑 Credenciais Padrão

**Admin do Sistema:**
- Email: dttools.app@gmail.com
- Senha: Gulex0519!@

⚠️ **IMPORTANTE**: Altere estas credenciais em produção!

## 🌐 Links Úteis

- **Site**: https://dttools.app
- **Repositório**: [Adicionar após upload no GitHub]
- **Documentação Online**: [Adicionar se disponível]

## 📞 Suporte

Para questões técnicas ou comerciais, consulte a documentação completa ou entre em contato através do site.

## 📄 Licença

Proprietary - Todos os direitos reservados © 2025 DTTools

---

**Versão do Pacote**: 1.0.0  
**Data**: $(date +%Y-%m-%d)  
**Gerado para**: Deployment e Distribuição Completa
EOF

# 7. CRIAR ARQUIVO COM INFORMAÇÕES DE VARIÁVEIS DE AMBIENTE
cat > $PACKAGE_DIR/source_code/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dttools

# Session
SESSION_SECRET=your-secret-key-here-change-in-production

# Stripe (Pagamentos)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# OpenAI (IA)
OPENAI_API_KEY=sk-your-openai-api-key

# Google Gemini (IA)
GEMINI_API_KEY=your-gemini-api-key

# PostgreSQL (se usar separado)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=dttools

# Node Environment
NODE_ENV=development
EOF

# 8. Compactar tudo
echo "🗜️ Compactando pacote final..."
tar -czf dttools_complete_package_$(date +%Y%m%d).tar.gz $PACKAGE_DIR

# Limpar diretório temporário
rm -rf $PACKAGE_DIR

# Informações do arquivo gerado
FINAL_FILE="dttools_complete_package_$(date +%Y%m%d).tar.gz"
FILE_SIZE=$(ls -lh $FINAL_FILE | awk '{print $5}')

echo ""
echo "✅ Pacote completo criado com sucesso!"
echo "📦 Arquivo: $FINAL_FILE"
echo "📊 Tamanho: $FILE_SIZE"
echo ""
echo "Para descompactar:"
echo "  tar -xzf $FINAL_FILE"
echo ""
echo "Para download:"
echo "  Acesse: http://localhost:5000/$FINAL_FILE"
echo "  ou baixe diretamente do workspace"
