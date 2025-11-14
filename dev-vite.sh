#!/bin/bash
# Script para rodar Vite em modo dev
cd "$(dirname "$0")"
node node_modules/vite/bin/vite.js --host --port 5173
