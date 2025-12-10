# ============================================
# Makefile - Portal de Concessão de Acesso
# Comandos úteis para gerenciamento Docker
# ============================================

.PHONY: help build up down restart logs ps clean test

# Variáveis
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.prod.yml
IMAGE_NAME = portal-acesso
CONTAINER_NAME = portal-acesso-homolog

# Help
help:
	@echo "============================================"
	@echo "Portal de Concessão de Acesso - Docker Commands"
	@echo "============================================"
	@echo ""
	@echo "Ambiente de Homologação:"
	@echo "  make build              - Build da imagem Docker"
	@echo "  make up                 - Iniciar containers (homologação)"
	@echo "  make down               - Parar e remover containers"
	@echo "  make restart            - Reiniciar containers"
	@echo "  make logs               - Ver logs em tempo real"
	@echo "  make logs-app           - Ver apenas logs da aplicação"
	@echo "  make ps                 - Listar containers em execução"
	@echo "  make shell              - Acessar shell do container"
	@echo "  make db-console         - Acessar console do banco de dados"
	@echo "  make test               - Testar aplicação"
	@echo ""
	@echo "Ambiente de Produção:"
	@echo "  make build-prod         - Build da imagem para produção"
	@echo "  make up-prod            - Iniciar containers (produção)"
	@echo "  make down-prod          - Parar containers (produção)"
	@echo "  make logs-prod          - Ver logs (produção)"
	@echo ""
	@echo "Manutenção:"
	@echo "  make backup             - Fazer backup do banco de dados"
	@echo "  make restore            - Restaurar backup do banco"
	@echo "  make clean              - Limpar containers e volumes"
	@echo "  make clean-all          - Limpar tudo (incluindo imagens)"
	@echo "  make health             - Verificar health dos containers"
	@echo ""

# ============================================
# Homologação
# ============================================

build:
	@echo "🔨 Building Docker image..."
	$(DOCKER_COMPOSE) build --no-cache

up:
	@echo "🚀 Starting containers (homologação)..."
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Containers started!"
	@echo "📱 Aplicação: http://localhost:3000"
	@echo "🌐 Nginx: http://localhost"
	@echo "📊 Portainer: http://localhost:9000"

down:
	@echo "🛑 Stopping containers..."
	$(DOCKER_COMPOSE) down

restart:
	@echo "🔄 Restarting containers..."
	$(DOCKER_COMPOSE) restart

logs:
	@echo "📋 Logs (Ctrl+C para sair)..."
	$(DOCKER_COMPOSE) logs -f

logs-app:
	@echo "📋 Application logs (Ctrl+C para sair)..."
	$(DOCKER_COMPOSE) logs -f portal-acesso

ps:
	@echo "📊 Running containers:"
	$(DOCKER_COMPOSE) ps

shell:
	@echo "🐚 Accessing container shell..."
	$(DOCKER_COMPOSE) exec portal-acesso sh

db-console:
	@echo "💾 Accessing database console..."
	$(DOCKER_COMPOSE) exec portal-acesso npx wrangler d1 execute portal-acesso-production --local --command="SELECT name FROM sqlite_master WHERE type='table';"

test:
	@echo "🧪 Testing application..."
	@curl -s http://localhost:3000/api/aplicacoes | jq . || echo "❌ Test failed"
	@echo "✅ Test completed"

# ============================================
# Produção
# ============================================

build-prod:
	@echo "🔨 Building Docker image (production)..."
	docker build -t $(IMAGE_NAME):latest .
	docker tag $(IMAGE_NAME):latest $(IMAGE_NAME):$$(date +%Y%m%d-%H%M%S)

up-prod:
	@echo "🚀 Starting containers (produção)..."
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "✅ Containers started (production mode)!"
	@echo "🌐 Application: https://portal.empresa.com"

down-prod:
	@echo "🛑 Stopping production containers..."
	$(DOCKER_COMPOSE_PROD) down

logs-prod:
	@echo "📋 Production logs (Ctrl+C para sair)..."
	$(DOCKER_COMPOSE_PROD) logs -f portal-acesso

restart-prod:
	@echo "🔄 Restarting production containers..."
	$(DOCKER_COMPOSE_PROD) restart

# ============================================
# Manutenção
# ============================================

backup:
	@echo "💾 Creating backup..."
	@mkdir -p backups
	docker exec $(CONTAINER_NAME) tar -czf /tmp/backup.tar.gz -C /app/.wrangler/state/v3/d1 .
	docker cp $(CONTAINER_NAME):/tmp/backup.tar.gz ./backups/portal-backup-$$(date +%Y%m%d-%H%M%S).tar.gz
	@echo "✅ Backup created in ./backups/"

restore:
	@echo "🔄 Restoring backup..."
	@read -p "Enter backup file path: " backup_file; \
	docker cp $$backup_file $(CONTAINER_NAME):/tmp/restore.tar.gz; \
	docker exec $(CONTAINER_NAME) tar -xzf /tmp/restore.tar.gz -C /app/.wrangler/state/v3/d1
	@echo "✅ Backup restored"

clean:
	@echo "🧹 Cleaning containers and volumes..."
	$(DOCKER_COMPOSE) down -v
	@echo "✅ Cleaned"

clean-all:
	@echo "🧹 Cleaning everything (containers, volumes, images)..."
	$(DOCKER_COMPOSE) down -v --rmi all
	@echo "✅ All cleaned"

health:
	@echo "🏥 Checking container health..."
	@docker ps --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ============================================
# Desenvolvimento
# ============================================

dev-build:
	@echo "🔨 Building for development..."
	$(DOCKER_COMPOSE) build

dev-up:
	@echo "🚀 Starting development environment..."
	$(DOCKER_COMPOSE) up

dev-logs:
	@echo "📋 Development logs..."
	$(DOCKER_COMPOSE) logs -f portal-acesso

# ============================================
# Utilities
# ============================================

stats:
	@echo "📊 Container statistics:"
	docker stats --no-stream $(CONTAINER_NAME)

inspect:
	@echo "🔍 Container inspection:"
	docker inspect $(CONTAINER_NAME) | jq '.[0].State'

network:
	@echo "🌐 Network information:"
	docker network inspect portal-acesso-network | jq '.[0].Containers'

volumes:
	@echo "💾 Volume information:"
	docker volume ls | grep portal

prune:
	@echo "🧹 Pruning unused Docker resources..."
	docker system prune -f
	@echo "✅ Pruned"
