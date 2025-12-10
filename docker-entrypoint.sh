#!/bin/sh
set -e

echo "============================================"
echo "Portal de Concessão de Acesso - Iniciando"
echo "============================================"

# Check if database needs initialization
if [ ! -f "/app/.wrangler/state/v3/d1/db.sqlite" ]; then
    echo "📦 Inicializando banco de dados..."
    
    # Apply migrations
    echo "🔄 Aplicando migrações..."
    npx wrangler d1 migrations apply portal-acesso-production --local --yes || true
    
    # Seed database if SEED_DATABASE is set
    if [ "${SEED_DATABASE:-true}" = "true" ]; then
        echo "🌱 Inserindo dados iniciais..."
        npx wrangler d1 execute portal-acesso-production --local --file=./seed.sql || true
    fi
    
    echo "✅ Banco de dados inicializado"
else
    echo "✅ Banco de dados já existe"
fi

echo "🚀 Iniciando servidor na porta ${PORT:-3000}..."
echo "🌐 Ambiente: ${NODE_ENV:-production}"
echo "============================================"

# Start application
exec npx wrangler pages dev dist \
    --d1=portal-acesso-production \
    --local \
    --ip ${HOST:-0.0.0.0} \
    --port ${PORT:-3000}
