# 🐳 Guia Completo de Docker - Portal de Concessão de Acesso

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Quick Start](#quick-start)
4. [Ambientes](#ambientes)
5. [Comandos Úteis](#comandos-úteis)
6. [Arquitetura](#arquitetura)
7. [Configuração](#configuração)
8. [Volumes e Persistência](#volumes-e-persistência)
9. [Rede](#rede)
10. [Segurança](#segurança)
11. [Backup e Restore](#backup-e-restore)
12. [Troubleshooting](#troubleshooting)
13. [Produção](#produção)

## 🎯 Visão Geral

Este projeto oferece **3 formas de deployment**:

1. **Docker Compose (Homologação)** - Ambiente de testes
2. **Docker Compose Production** - Produção com SSL, backup, monitoramento
3. **Dockerfile standalone** - Build customizado

### Componentes Docker

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌──────────────┐  │
│  │   Nginx     │───→│ Portal App   │  │
│  │  (Proxy)    │    │  (Node 20)   │  │
│  │  Port 80    │    │  Port 3000   │  │
│  └─────────────┘    └──────────────┘  │
│         │                   │          │
│         │                   ↓          │
│         │            ┌──────────────┐  │
│         │            │  D1 SQLite   │  │
│         │            │   (Volume)   │  │
│         │            └──────────────┘  │
│         │                              │
│  ┌─────────────┐                      │
│  │ Portainer   │                      │
│  │  (Monitor)  │                      │
│  │  Port 9000  │                      │
│  └─────────────┘                      │
│                                        │
└────────────────────────────────────────┘
```

## ⚙️ Pré-requisitos

### Instalação do Docker

#### Linux (Ubuntu/Debian)
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt-get install docker-compose-plugin

# Verificar instalação
docker --version
docker-compose --version
```

#### Windows
1. Instalar [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop)
2. Ativar WSL2 (recomendado)
3. Reiniciar o sistema

#### macOS
1. Instalar [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop)
2. Abrir aplicação Docker Desktop

### Requisitos Mínimos
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 10 GB livres
- **Sistema**: Linux, Windows 10+, macOS 10.15+

## 🚀 Quick Start

### Homologação (Desenvolvimento/Testes)

```bash
# 1. Clone o repositório
git clone https://github.com/empresa/portal-acesso.git
cd portal-acesso

# 2. Configure variáveis de ambiente (opcional)
cp .env.example .env.production
nano .env.production

# 3. Inicie os containers
docker-compose up -d

# 4. Aguarde inicialização (30-60 segundos)
docker-compose logs -f portal-acesso

# 5. Acesse a aplicação
# http://localhost:3000 - Aplicação direta
# http://localhost - Via Nginx
# http://localhost:9000 - Portainer (monitoramento)

# 6. Teste login
# Usuário: carlos.silva (Gestor)
# Usuário: ana.costa (Segurança da Informação)
```

### Usando Makefile (Recomendado)

```bash
# Ver todos os comandos disponíveis
make help

# Iniciar ambiente
make build
make up

# Ver logs
make logs

# Testar aplicação
make test
```

## 🏗️ Ambientes

### 1. Homologação (docker-compose.yml)

**Características:**
- Seed database habilitado (dados de teste)
- Portainer incluído
- Logs verbosos
- 1 réplica
- Sem SSL

**Uso:**
```bash
docker-compose up -d
```

**Acessos:**
- App: http://localhost:3000
- Nginx: http://localhost
- Portainer: http://localhost:9000

### 2. Produção (docker-compose.prod.yml)

**Características:**
- SSL/TLS com Let's Encrypt
- 3 réplicas com load balancing
- Backup automático (2 AM diário)
- Rate limiting
- Recursos limitados
- Sem seed database

**Uso:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Acessos:**
- App: https://portal.empresa.com

### 3. Build Manual (Dockerfile)

```bash
# Build
docker build -t portal-acesso:1.0 .

# Run
docker run -d \
  --name portal-acesso \
  -p 3000:3000 \
  -v portal-data:/app/.wrangler/state/v3/d1 \
  -e NODE_ENV=production \
  portal-acesso:1.0
```

## 📝 Comandos Úteis

### Gerenciamento de Containers

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f portal-acesso  # Apenas app

# Acessar shell
docker-compose exec portal-acesso sh
```

### Makefile (Atalhos)

```bash
make build          # Build da imagem
make up             # Iniciar containers
make down           # Parar containers
make restart        # Reiniciar
make logs           # Ver logs
make logs-app       # Logs apenas da app
make shell          # Acessar shell
make ps             # Status
make test           # Testar aplicação
make health         # Health check
make stats          # Estatísticas de uso
make backup         # Backup do banco
make restore        # Restaurar backup
make clean          # Limpar tudo
```

### Docker Standalone

```bash
# Listar containers
docker ps

# Parar container
docker stop portal-acesso-homolog

# Remover container
docker rm portal-acesso-homolog

# Ver logs
docker logs -f portal-acesso-homolog

# Executar comando
docker exec portal-acesso-homolog ls -la

# Inspecionar
docker inspect portal-acesso-homolog

# Stats em tempo real
docker stats portal-acesso-homolog
```

## 🏛️ Arquitetura

### Dockerfile Multi-Stage

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
USER nodejs
CMD ["dumb-init", "--", "docker-entrypoint.sh"]
```

**Vantagens:**
- ✅ Imagem final menor (~150 MB vs ~1 GB)
- ✅ Sem dependências de desenvolvimento
- ✅ Usuário não-root (segurança)
- ✅ Dumb-init para sinais corretos

### Processo de Inicialização

1. **Container inicia** → `docker-entrypoint.sh`
2. **Verifica banco** → Se não existe, cria
3. **Aplica migrações** → Schema do banco
4. **Seed (opcional)** → Dados de teste
5. **Inicia Wrangler** → Servidor na porta 3000
6. **Health check** → Nginx monitora

## ⚙️ Configuração

### Variáveis de Ambiente

Crie arquivo `.env.production`:

```bash
# Aplicação
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
TZ=America/Sao_Paulo

# Database
SEED_DATABASE=false

# Azure AD (futuro)
AZURE_AD_CLIENT_ID=your-id
AZURE_AD_CLIENT_SECRET=your-secret
AZURE_AD_TENANT_ID=your-tenant

# SMTP (futuro)
SMTP_HOST=smtp.empresa.com
SMTP_PORT=587
SMTP_USER=noreply@empresa.com
SMTP_PASSWORD=your-password
```

### Customizar docker-compose.yml

```yaml
services:
  portal-acesso:
    # Alterar porta
    ports:
      - "3001:3000"  # Host:Container
    
    # Adicionar variável
    environment:
      - CUSTOM_VAR=value
    
    # Ajustar recursos
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
```

### Configurar Nginx

Edite `nginx/nginx.conf` ou `nginx/nginx.prod.conf`:

```nginx
# Alterar rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;

# Adicionar header customizado
add_header X-Custom-Header "value" always;

# Configurar upstream
upstream portal_backend {
    server portal-acesso:3000 weight=2;
    server portal-acesso-2:3000 weight=1;
}
```

## 💾 Volumes e Persistência

### Volumes Criados

```bash
# Listar volumes
docker volume ls | grep portal

# Inspecionar volume
docker volume inspect portal-acesso-data

# Localização no host
/var/lib/docker/volumes/portal-acesso-data/_data
```

### Volumes Definidos

| Volume | Descrição | Caminho Container |
|--------|-----------|-------------------|
| `portal-data` | Banco D1 SQLite | `/app/.wrangler/state/v3/d1` |
| `portal-logs` | Logs da aplicação | `/app/logs` |
| `nginx-logs` | Logs do Nginx | `/var/log/nginx` |
| `portainer-data` | Dados do Portainer | `/data` |

### Backup Manual

```bash
# Backup do banco
docker run --rm \
  -v portal-acesso-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/portal-backup-$(date +%Y%m%d).tar.gz /data

# Restore
docker run --rm \
  -v portal-acesso-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/portal-backup-20241201.tar.gz -C /
```

### Backup Automatizado (Produção)

Incluído em `docker-compose.prod.yml`:
- Executa diariamente às 2 AM
- Retenção de 30 dias
- Salvos em `./backups/`

## 🌐 Rede

### Rede Criada

```bash
# Inspecionar rede
docker network inspect portal-acesso-network

# Ver containers na rede
docker network inspect portal-acesso-network | jq '.[0].Containers'
```

### Comunicação Entre Containers

Os containers se comunicam usando seus nomes de serviço:

```javascript
// No código da aplicação
const nginxUrl = 'http://nginx:80';
const appUrl = 'http://portal-acesso:3000';
```

### Expor Serviços

```yaml
# Apenas interno (não acessível do host)
expose:
  - "3000"

# Acessível do host
ports:
  - "3000:3000"  # host:container
```

## 🔐 Segurança

### Implementado

1. **Usuário não-root**: Container roda como `nodejs:1001`
2. **Alpine Linux**: Menor superfície de ataque
3. **Multi-stage**: Sem ferramentas de build em produção
4. **Health checks**: Monitoramento de estado
5. **Rate limiting**: Proteção contra abuse
6. **SSL/TLS**: Certificados Let's Encrypt
7. **Security headers**: X-Frame-Options, CSP, etc.
8. **Rede isolada**: Containers em subnet privada

### Recomendações Adicionais

```bash
# Escanear vulnerabilidades
docker scan portal-acesso:latest

# Ou usar Trivy
trivy image portal-acesso:latest

# Atualizar imagens base regularmente
docker-compose pull
docker-compose up -d

# Verificar logs de segurança
docker-compose logs | grep -i "error\|fail\|unauthorized"
```

### Hardening

```bash
# Limitar capacidades do container
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE

# Read-only filesystem (quando possível)
read_only: true
tmpfs:
  - /tmp
  - /app/.wrangler
```

## 💾 Backup e Restore

### Usando Makefile

```bash
# Criar backup
make backup

# Restaurar backup
make restore
# (será solicitado o caminho do arquivo)
```

### Manual Detalhado

```bash
# 1. Parar containers
docker-compose down

# 2. Backup do volume
docker run --rm \
  -v portal-acesso-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/portal-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# 3. Reiniciar containers
docker-compose up -d

# 4. Para restaurar:
docker-compose down
docker volume rm portal-acesso-data
docker volume create portal-acesso-data
docker run --rm \
  -v portal-acesso-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/portal-20241201-143000.tar.gz -C /data
docker-compose up -d
```

### Backup Completo do Sistema

```bash
#!/bin/bash
# backup-completo.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backups/full-$DATE"

mkdir -p $BACKUP_DIR

# Backup volumes
docker run --rm \
  -v portal-acesso-data:/data \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar czf /backup/database.tar.gz -C /data .

# Backup configurações
cp -r nginx $BACKUP_DIR/
cp -r config $BACKUP_DIR/
cp .env.production $BACKUP_DIR/
cp docker-compose*.yml $BACKUP_DIR/

# Compactar tudo
tar czf "backups/full-backup-$DATE.tar.gz" -C backups "full-$DATE"
rm -rf $BACKUP_DIR

echo "✅ Backup completo criado: backups/full-backup-$DATE.tar.gz"
```

## 🔧 Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs portal-acesso

# Verificar se porta está em uso
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000

# Recriar container
docker-compose down
docker-compose up -d --force-recreate
```

### Banco de dados corrompido

```bash
# Opção 1: Resetar completamente
docker-compose down -v  # Remove volumes
docker-compose up -d

# Opção 2: Restaurar backup
make restore
```

### Problemas de rede

```bash
# Recriar rede
docker-compose down
docker network prune
docker-compose up -d

# Testar conectividade entre containers
docker-compose exec portal-acesso ping nginx
docker-compose exec portal-acesso wget -O- http://nginx:80
```

### Problemas de permissão

```bash
# Verificar ownership
docker-compose exec portal-acesso ls -la /app/.wrangler

# Corrigir permissões
docker-compose exec -u root portal-acesso chown -R nodejs:nodejs /app/.wrangler
docker-compose restart portal-acesso
```

### Logs não aparecem

```bash
# Verificar driver de logging
docker inspect portal-acesso-homolog | jq '.[0].HostConfig.LogConfig'

# Ver logs do Docker daemon
sudo journalctl -u docker.service -f
```

### Container fica reiniciando

```bash
# Ver health check
docker inspect portal-acesso-homolog | jq '.[0].State.Health'

# Desabilitar health check temporariamente
# Comentar seção healthcheck no docker-compose.yml
docker-compose up -d --force-recreate
```

### Alto uso de CPU/Memória

```bash
# Ver estatísticas
docker stats portal-acesso-homolog

# Limitar recursos no docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
```

## 🏭 Produção

### Checklist Pré-Deploy

- [ ] Configurar `.env.production` com valores reais
- [ ] Configurar certificados SSL em `nginx/ssl/`
- [ ] Ajustar `docker-compose.prod.yml` (domínio, réplicas)
- [ ] Configurar firewall no host (UFW/iptables)
- [ ] Configurar backup automatizado
- [ ] Configurar monitoramento (Prometheus, Grafana)
- [ ] Testar em ambiente de staging
- [ ] Documentar procedimentos de rollback
- [ ] Configurar alertas (email, Slack, PagerDuty)

### Deploy Produção

```bash
# 1. Build da imagem
docker build -t portal-acesso:1.0.0 .
docker tag portal-acesso:1.0.0 portal-acesso:latest

# 2. Push para registry (se aplicável)
docker tag portal-acesso:1.0.0 registry.empresa.com/portal-acesso:1.0.0
docker push registry.empresa.com/portal-acesso:1.0.0

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f

# 5. Smoke test
curl https://portal.empresa.com/health
```

### Configurar SSL (Let's Encrypt)

```bash
# 1. Configurar DNS apontando para servidor
# portal.empresa.com -> IP_DO_SERVIDOR

# 2. Obter certificado
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@empresa.com \
  --agree-tos \
  --no-eff-email \
  -d portal.empresa.com

# 3. Reiniciar Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Renovação Automática SSL

Incluído em `docker-compose.prod.yml`:
- Container `certbot` verifica renovação a cada 12h
- Nginx reload automático após renovação

### Rolling Update (Zero Downtime)

```bash
# 1. Build nova versão
docker build -t portal-acesso:1.0.1 .

# 2. Update gradual (1 réplica por vez)
docker service update \
  --image portal-acesso:1.0.1 \
  --update-parallelism 1 \
  --update-delay 10s \
  portal-stack_portal-acesso
```

### Monitoramento

```bash
# Portainer
http://localhost:9000

# Logs centralizados (configurar depois)
# - ELK Stack (Elasticsearch, Logstash, Kibana)
# - Grafana Loki
# - Splunk

# Métricas
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Rollback

```bash
# Rollback rápido (se algo der errado)
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --scale portal-acesso=0
# Corrigir problema
docker-compose -f docker-compose.prod.yml up -d --scale portal-acesso=3
```

## 📚 Recursos Adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

---

**Portal de Concessão de Acesso - Docker Guide v1.0**  
*Última atualização: 01/12/2024*
