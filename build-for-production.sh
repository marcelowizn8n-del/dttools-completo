#!/bin/bash

# Script para build de produção do DTTools
echo "🚀 Iniciando build de produção..."

# 1. Fazer build normal
echo "📦 Executando build do Vite..."
npm run build

# 2. Copiar arquivos para o local correto onde o servidor espera
echo "📁 Copiando arquivos para server/public..."
cp -r dist/public server/public

# 3. Copiar logo para acesso direto (dev e prod)
echo "🎨 Copiando logo para acesso direto..."
mkdir -p client/public
cp client/src/assets/logo-horizontal.png client/public/  # Para desenvolvimento
cp client/src/assets/logo-horizontal.png server/public/  # Para produção

echo "✅ Build de produção concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Teste localmente com: npm run start"
echo "2. Publique no Replit para que as mudanças sejam refletidas"
echo ""
echo "🎯 Os arquivos estão agora em server/public/ onde o servidor de produção espera encontrá-los."