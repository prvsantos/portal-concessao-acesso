# 🚀 Guia de Deploy - Portal de Concessão de Acesso

## 📋 Visão Geral

Este documento fornece instruções detalhadas para deploy do Portal de Concessão de Acesso em diferentes ambientes usando Docker.

## 🎯 Opções de Deploy

### 1. Docker Compose - Homologação ⭐ (Recomendado para início)
- **Uso**: Desenvolvimento, testes, homologação
- **Complexidade**: Baixa
- **Tempo de setup**: 5 minutos
- **Escalabilidade**: Limitada
- **Custo**: Mínimo

### 2. Docker Compose - Produção
- **Uso**: Produção em servidor único
- **Complexidade**: Média
- **Tempo de setup**: 30 minutos
- **Escalabilidade**: Média (até 3 réplicas)
- **Custo**: Baixo

### 3. Cloudflare Pages (Original)
- **Uso**: Edge deployment serverless
- **Complexidade**: Média
- **Tempo de setup**: 15 minutos
- **Escalabilidade**: Alta (automática)
- **Custo**: Baixo/Gratuito

### 4. Kubernetes (Futuro)
- **Uso**: Enterprise, alta disponibilidade
- **Complexidade**: Alta
- **Tempo de setup**: 2-3 horas
- **Escalabilidade**: Muito alta
- **Custo**: Médio/Alto

## 🏃 Quick Start - Homologação

### Pré-requisitos
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Reiniciar sessão para aplicar grupo
```

### Deploy Automático
```bash
# Clone o projeto
git clone https://github.com/empresa/portal-acesso.git
cd portal-acesso

# Execute o script de setup
./setup-docker.sh

# Siga as instruções na tela
```

### Deploy Manual
```bash
# 1. Clone e entre no diretório
git clone https://github.com/empresa/portal-acesso.git
cd portal-acesso

# 2. Inicie os containers
docker-compose up -d

# 3. Aguarde inicialização (30-60s)
docker-compose logs -f portal-acesso

# 4. Teste a aplicação
curl http://localhost:3000/api/aplicacoes
```

### Acessar
- 🌐 **Aplicação**: http://localhost:3000
- 🔧 **Nginx**: http://localhost
- 📊 **Portainer**: http://localhost:9000

## 🏭 Deploy Produção - Servidor Linux

### Pré-requisitos
- [ ] Servidor Linux (Ubuntu 20.04+ ou CentOS 7+)
- [ ] Domínio configurado (ex: portal.empresa.com)
- [ ] Certificado SSL (ou usar Let's Encrypt)
- [ ] Firewall configurado
- [ ] Backup configurado

### Passo a Passo

#### 1. Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Configurar firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 2. Configurar DNS

Aponte seu domínio para o IP do servidor:
```
portal.empresa.com → A → 203.0.113.10
```

#### 3. Clonar Projeto

```bash
cd /opt
sudo git clone https://github.com/empresa/portal-acesso.git
cd portal-acesso
sudo chown -R $USER:$USER .
```

#### 4. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.production

# Editar variáveis
nano .env.production
```

Configurar:
```bash
NODE_ENV=production
SEED_DATABASE=false
# Adicione outras configurações necessárias
```

#### 5. Configurar SSL (Let's Encrypt)

```bash
# Editar docker-compose.prod.yml
nano docker-compose.prod.yml

# Alterar domínio:
# portal.empresa.com -> seu-dominio.com.br

# Primeira execução (obter certificados)
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@empresa.com \
  --agree-tos \
  --no-eff-email \
  -d portal.empresa.com
```

#### 6. Deploy

```bash
# Build da imagem
docker build -t portal-acesso:1.0.0 .

# Iniciar produção
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

#### 7. Verificar

```bash
# Teste local
curl -k https://localhost/api/aplicacoes

# Teste externo
curl https://portal.empresa.com/api/aplicacoes

# Health check
docker-compose -f docker-compose.prod.yml ps
```

#### 8. Configurar Backup Automático

O backup já está configurado no `docker-compose.prod.yml`:
- Executa diariamente às 2 AM
- Retenção de 30 dias
- Salvos em `./backups/`

Verifique se está funcionando:
```bash
# Ver logs do backup
docker-compose -f docker-compose.prod.yml logs backup

# Testar backup manual
make backup
```

## 🔒 Checklist de Segurança

### Antes do Deploy

- [ ] Alterar senhas padrão dos usuários de teste
- [ ] Configurar `.env.production` com valores reais
- [ ] Configurar SSL/TLS (Let's Encrypt ou certificado próprio)
- [ ] Revisar configurações de rate limiting no Nginx
- [ ] Configurar firewall no servidor (UFW/iptables)
- [ ] Desabilitar SEED_DATABASE em produção
- [ ] Configurar backup automático
- [ ] Testar restore de backup
- [ ] Configurar monitoramento (Portainer, logs)
- [ ] Documentar credenciais de forma segura

### Após Deploy

- [ ] Verificar logs por erros
- [ ] Testar todos os fluxos da aplicação
- [ ] Verificar health checks
- [ ] Testar backup e restore
- [ ] Configurar alertas (email, Slack)
- [ ] Documentar procedimentos de rollback
- [ ] Treinar equipe nos procedimentos

## 📊 Monitoramento

### Portainer
```bash
# Acessar Portainer
http://servidor:9000

# Criar conta admin na primeira vez
# Conectar ao Docker local
```

### Logs
```bash
# Logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs -f portal-acesso
docker-compose logs -f nginx

# Logs com timestamp
docker-compose logs -f -t portal-acesso
```

### Métricas
```bash
# Stats em tempo real
docker stats

# Via Makefile
make stats

# Health check
make health
```

## 🔄 Atualizações

### Atualizar Aplicação

```bash
# 1. Backup atual
make backup

# 2. Pull nova versão
git pull origin main

# 3. Build nova imagem
docker build -t portal-acesso:1.0.1 .

# 4. Parar containers
docker-compose down

# 5. Iniciar com nova versão
docker-compose up -d

# 6. Verificar
docker-compose ps
docker-compose logs -f
```

### Rollback

```bash
# Se algo der errado, voltar para versão anterior
docker-compose down
git checkout v1.0.0
docker build -t portal-acesso:1.0.0 .
docker-compose up -d
```

## 🆘 Troubleshooting

### Container não inicia
```bash
# Ver logs de erro
docker-compose logs portal-acesso

# Verificar configuração
docker-compose config

# Recriar container
docker-compose down
docker-compose up -d --force-recreate
```

### Aplicação não responde
```bash
# Verificar se container está rodando
docker-compose ps

# Verificar health
docker inspect portal-acesso-homolog | jq '.[0].State.Health'

# Reiniciar
docker-compose restart portal-acesso
```

### Banco de dados corrompido
```bash
# Restaurar do backup
make restore

# Ou resetar completamente (CUIDADO!)
docker-compose down -v
docker-compose up -d
```

### Problemas de rede
```bash
# Verificar rede Docker
docker network inspect portal-acesso-network

# Recriar rede
docker-compose down
docker network prune
docker-compose up -d
```

## 📞 Suporte

### Documentação
- **README.md** - Documentação geral do projeto
- **DOCKER.md** - Guia completo de Docker
- **DOCKER_QUICKSTART.md** - Quick start
- **DEPLOY_GUIDE.md** - Este documento

### Comandos Úteis
```bash
make help           # Ver todos os comandos disponíveis
docker-compose ps   # Status dos containers
docker stats        # Uso de recursos
```

### Logs Importantes
- Aplicação: `/app/logs/`
- Nginx: `/var/log/nginx/`
- Docker: `docker-compose logs`

---

## 🎯 Próximas Etapas Recomendadas

### Curto Prazo (1-2 semanas)
1. ✅ Deploy em ambiente de homologação
2. ✅ Testes completos de todos os fluxos
3. ⬜ Integração com Active Directory real
4. ⬜ Configurar notificações por email

### Médio Prazo (1-2 meses)
5. ⬜ Deploy em produção
6. ⬜ Configurar monitoramento avançado (Prometheus + Grafana)
7. ⬜ Implementar CI/CD completo
8. ⬜ Adicionar testes automatizados

### Longo Prazo (3-6 meses)
9. ⬜ Migrar para Kubernetes (se necessário)
10. ⬜ Implementar multi-região
11. ⬜ Adicionar funcionalidades avançadas
12. ⬜ Integração com mais sistemas

---

**Portal de Concessão de Acesso - Deploy Guide v1.0**  
*Última atualização: 01/12/2024*
