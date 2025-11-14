#!/bin/bash

echo "🔍 Testando servidor..."
echo ""

# Testar porta 5000
echo "Testando http://localhost:5000..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 2>&1)

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Servidor respondendo com código 200"
elif [ "$RESPONSE" = "403" ]; then
    echo "❌ Servidor retornando 403 (Forbidden)"
    echo ""
    echo "Tentando obter mais informações..."
    curl -v http://localhost:5000 2>&1 | head -30
elif [ "$RESPONSE" = "000" ]; then
    echo "❌ Servidor não está respondendo (conexão recusada)"
    echo "   Verifique se o servidor está rodando"
else
    echo "⚠️  Servidor retornando código: $RESPONSE"
    echo ""
    echo "Resposta completa:"
    curl -s http://localhost:5000 | head -20
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verificando processos Node.js na porta 5000:"
lsof -ti:5000 2>/dev/null && echo "✅ Processo encontrado" || echo "❌ Nenhum processo na porta 5000"


