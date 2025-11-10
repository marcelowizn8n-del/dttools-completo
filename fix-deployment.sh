#!/bin/bash

# DTTools Deployment Fix Script
# This script fixes the production deployment by copying fresh build assets to the correct location

echo "🔧 Iniciando correção de deployment do DTTools..."

# Step 1: Build fresh assets
echo "📦 Executando build completo..."
npm run build

# Step 2: Copy fresh build to production location
echo "📁 Copiando assets para produção..."
mkdir -p server/public
cp -r dist/public/* server/public/

# Step 3: Verify copy was successful
if [ -f "server/public/index.html" ]; then
    echo "✅ Assets copiados com sucesso!"
    echo "📊 Tamanho do index.html: $(wc -c < server/public/index.html) bytes"
else
    echo "❌ Erro: Falha ao copiar assets!"
    exit 1
fi

echo "🚀 Deployment corrigido! Republique no Replit para aplicar as mudanças."