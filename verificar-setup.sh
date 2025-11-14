#!/bin/bash

echo "🔍 Verificando setup do projeto DTTools..."
echo ""

PROJECT_DIR="/Users/marceloferreiradearaujo/Library/Mobile Documents/com~apple~CloudDocs/2025/Marcelo/Design Thinking Tools/Material Completo 25:09:2025/dttools-completo-20251004"

cd "$PROJECT_DIR" 2>/dev/null || {
    echo "❌ ERRO: Diretório não encontrado!"
    echo "   Caminho: $PROJECT_DIR"
    exit 1
}

echo "✅ Diretório encontrado: $(pwd)"
echo ""

# Verificar arquivos essenciais
echo "📁 Verificando arquivos essenciais..."
MISSING_FILES=0

check_file() {
    if [ -f "$1" ]; then
        echo "   ✅ $1"
    else
        echo "   ❌ $1 (FALTANDO)"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

check_file "package.json"
check_file "server/index.ts"
check_file "client/src/components/DoubleDiamond.tsx"
check_file "client/src/pages/project-detail.tsx"
check_file "vite.config.ts"

echo ""

# Verificar node_modules
echo "📦 Verificando dependências..."
if [ -d "node_modules" ] && [ "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "   ✅ node_modules existe"
    NODE_MODULES_COUNT=$(ls -1 node_modules 2>/dev/null | wc -l | tr -d ' ')
    echo "   📊 $NODE_MODULES_COUNT pacotes encontrados"
else
    echo "   ⚠️  node_modules não encontrado ou vazio"
    echo "   💡 Execute: npm install --legacy-peer-deps"
    MISSING_FILES=$((MISSING_FILES + 1))
fi

echo ""

# Verificar Node.js
echo "🟢 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js instalado: $NODE_VERSION"
else
    echo "   ❌ Node.js não encontrado"
    echo "   💡 Instale Node.js: https://nodejs.org/"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm instalado: $NPM_VERSION"
else
    echo "   ❌ npm não encontrado"
    exit 1
fi

echo ""

# Verificar tsx (será baixado via npx se necessário)
echo "🔧 Verificando tsx..."
if command -v tsx &> /dev/null || command -v npx &> /dev/null; then
    echo "   ✅ tsx disponível (via npx)"
else
    echo "   ⚠️  npx não encontrado (instalado com npm)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $MISSING_FILES -eq 0 ]; then
    echo "✅ TUDO PRONTO!"
    echo ""
    echo "Para iniciar o servidor em modo desenvolvimento:"
    echo "   npm run dev"
    echo ""
    echo "O DoubleDiamond aparecerá automaticamente quando você"
    echo "acessar a página de detalhes de um projeto."
else
    echo "⚠️  ATENÇÃO: Alguns arquivos estão faltando!"
    echo ""
    echo "Execute os seguintes comandos:"
    echo "   cd \"$PROJECT_DIR\""
    echo "   npm install --legacy-peer-deps"
    echo "   npm run dev"
fi

echo ""


