#!/bin/bash

# ============================================
# Setup Script - Portal de Concessão de Acesso
# Automatiza configuração inicial do Docker
# ============================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}============================================${NC}"
echo -e "${BOLD}Portal de Concessão de Acesso - Docker Setup${NC}"
echo -e "${BOLD}============================================${NC}"
echo ""

# Verificar se Docker está instalado
check_docker() {
    echo -e "${YELLOW}🔍 Verificando Docker...${NC}"
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker não encontrado!${NC}"
        echo ""
        echo "Instale o Docker primeiro:"
        echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "  sudo sh get-docker.sh"
        echo "  sudo usermod -aG docker \$USER"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker encontrado: $(docker --version)${NC}"
}

# Verificar se Docker Compose está instalado
check_docker_compose() {
    echo -e "${YELLOW}🔍 Verificando Docker Compose...${NC}"
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose não encontrado!${NC}"
        echo ""
        echo "Instale o Docker Compose primeiro:"
        echo "  sudo apt-get install docker-compose-plugin"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker Compose encontrado: $(docker-compose --version)${NC}"
}

# Criar diretórios necessários
create_directories() {
    echo -e "${YELLOW}📁 Criando diretórios...${NC}"
    mkdir -p config backups logs nginx/ssl certbot/conf certbot/www
    echo -e "${GREEN}✅ Diretórios criados${NC}"
}

# Configurar variáveis de ambiente
setup_env() {
    echo -e "${YELLOW}⚙️  Configurando variáveis de ambiente...${NC}"
    if [ ! -f .env.production ]; then
        cp .env.example .env.production
        echo -e "${GREEN}✅ Arquivo .env.production criado${NC}"
        echo -e "${YELLOW}⚠️  Configure as variáveis em .env.production antes de deploy em produção${NC}"
    else
        echo -e "${GREEN}✅ Arquivo .env.production já existe${NC}"
    fi
}

# Verificar portas disponíveis
check_ports() {
    echo -e "${YELLOW}🔍 Verificando portas...${NC}"
    
    ports=(3000 80 443 9000)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Porta $port já está em uso${NC}"
        else
            echo -e "${GREEN}✅ Porta $port disponível${NC}"
        fi
    done
}

# Build da imagem
build_image() {
    echo ""
    read -p "Deseja fazer build da imagem agora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🔨 Building Docker image...${NC}"
        docker-compose build --no-cache
        echo -e "${GREEN}✅ Build concluído${NC}"
    fi
}

# Iniciar containers
start_containers() {
    echo ""
    read -p "Deseja iniciar os containers agora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🚀 Iniciando containers...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✅ Containers iniciados${NC}"
        echo ""
        echo -e "${BOLD}Aguarde 30-60 segundos para inicialização completa${NC}"
        echo ""
        echo -e "${BOLD}Acessos:${NC}"
        echo -e "  🌐 Aplicação: ${GREEN}http://localhost:3000${NC}"
        echo -e "  🔧 Nginx: ${GREEN}http://localhost${NC}"
        echo -e "  📊 Portainer: ${GREEN}http://localhost:9000${NC}"
        echo ""
        echo -e "${BOLD}Usuários de teste:${NC}"
        echo -e "  Gestor: ${GREEN}carlos.silva${NC}"
        echo -e "  SI: ${GREEN}ana.costa${NC}"
        echo ""
        echo "Para ver logs: ${YELLOW}docker-compose logs -f${NC}"
        echo "Para parar: ${YELLOW}docker-compose down${NC}"
    fi
}

# Menu de escolha de ambiente
choose_environment() {
    echo ""
    echo -e "${BOLD}Escolha o ambiente:${NC}"
    echo "1) Homologação (desenvolvimento/testes)"
    echo "2) Produção (SSL, backup, monitoring)"
    echo "3) Apenas verificar configuração"
    echo ""
    read -p "Opção [1-3]: " env_choice
    
    case $env_choice in
        1)
            export COMPOSE_FILE="docker-compose.yml"
            echo -e "${GREEN}✅ Ambiente: Homologação${NC}"
            ;;
        2)
            export COMPOSE_FILE="docker-compose.prod.yml"
            echo -e "${GREEN}✅ Ambiente: Produção${NC}"
            echo -e "${YELLOW}⚠️  Certifique-se de configurar SSL e variáveis de produção${NC}"
            ;;
        3)
            echo -e "${GREEN}✅ Apenas verificação${NC}"
            return 1
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            exit 1
            ;;
    esac
    return 0
}

# Verificar status
check_status() {
    echo ""
    echo -e "${BOLD}Status dos containers:${NC}"
    docker-compose ps
}

# Main
main() {
    check_docker
    check_docker_compose
    create_directories
    setup_env
    check_ports
    
    if choose_environment; then
        build_image
        start_containers
        
        # Aguardar um pouco
        if docker-compose ps | grep -q "Up"; then
            echo ""
            echo -e "${YELLOW}Aguardando inicialização...${NC}"
            sleep 10
            check_status
            
            # Teste rápido
            echo ""
            echo -e "${YELLOW}🧪 Testando aplicação...${NC}"
            if curl -s http://localhost:3000/api/aplicacoes > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Aplicação respondendo corretamente!${NC}"
            else
                echo -e "${YELLOW}⚠️  Aplicação ainda inicializando... aguarde mais alguns segundos${NC}"
            fi
        fi
    fi
    
    echo ""
    echo -e "${BOLD}============================================${NC}"
    echo -e "${GREEN}✅ Setup concluído!${NC}"
    echo -e "${BOLD}============================================${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Acesse http://localhost:3000"
    echo "  2. Faça login com usuário de teste"
    echo "  3. Explore o sistema"
    echo ""
    echo "Comandos úteis:"
    echo "  ${YELLOW}make help${NC}          - Ver todos os comandos"
    echo "  ${YELLOW}make logs${NC}          - Ver logs"
    echo "  ${YELLOW}make test${NC}          - Testar aplicação"
    echo "  ${YELLOW}make down${NC}          - Parar containers"
    echo ""
    echo "Documentação:"
    echo "  ${YELLOW}README.md${NC}          - Documentação geral"
    echo "  ${YELLOW}DOCKER.md${NC}          - Guia completo Docker"
    echo "  ${YELLOW}DOCKER_QUICKSTART.md${NC} - Quick start"
    echo ""
}

# Execute main function
main
