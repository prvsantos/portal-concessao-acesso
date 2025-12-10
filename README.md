# Portal de Concessão de Acesso

## 🎯 Visão Geral

Sistema corporativo completo para gerenciamento de acessos de novos colaboradores, com fluxo de aprovação multinível (Gestor → Segurança da Informação) e auditoria completa.

## 🚀 URLs de Acesso

- **Produção (Sandbox)**: https://3000-ihkwhkl3t8ren8u48qqqp-b9b802c4.sandbox.novita.ai
- **API Base**: `/api`
- **GitHub**: Aguardando deployment

## ✨ Funcionalidades Implementadas

### ✅ Para Gestores
- **Visualizar novos colaboradores** pendentes de liberação de acesso
- **Solicitar acessos** para novos funcionários (seleção múltipla de aplicações/sistemas)
- **Acompanhar tickets** criados e status das solicitações
- **Visualizar logs** de auditoria de suas solicitações

### ✅ Para Segurança da Informação
- **Aprovar/Rejeitar tickets** individualmente por acesso
- **Justificar rejeições** (obrigatório para compliance)
- **Aplicar acessos** aos grupos do Active Directory após aprovação
- **Visualizar histórico completo** de todas as aprovações

### ✅ Sistema de Auditoria
- **Logs completos** de todas as ações (criar ticket, aprovar, rejeitar, aplicar)
- **Rastreabilidade** de quem solicitou, quem aprovou, quando e o quê
- **Histórico de aprovações** por ticket com timestamps
- **Detalhes de justificativas** para todas as rejeições

## 📊 Fluxo de Trabalho

1. **RH cadastra novo colaborador** no sistema (gera conta no AD automaticamente)
2. **Gestor acessa o portal** e vê os novos colaboradores pendentes
3. **Gestor seleciona colaborador** e escolhe aplicações/sistemas necessários
4. **Sistema gera ticket** automaticamente (ex: TKT-2024-00001)
5. **Segurança da Informação** recebe ticket para análise
6. **SI aprova/rejeita** cada acesso individualmente (com justificativa obrigatória se rejeitar)
7. **Sistema aplica acessos** aos grupos AD após aprovação
8. **Ticket finalizado** e logs registrados para auditoria
9. **Gestor visualiza credenciais** (usuário de rede + senha temporária)

## 🗄️ Arquitetura de Dados

### Tabelas Principais

#### `colaboradores`
- Dados dos novos funcionários
- Sincronização com sistema RH
- Status: pendente → ativo → inativo

#### `aplicacoes`
- Sistemas/ferramentas disponíveis
- Mapeamento para grupos AD
- Categorização (ERP, BI, Vendas, etc.)
- Flag de aprovação SI necessária

#### `tickets`
- Solicitações de acesso
- Status: aberto → em_andamento → aguardando_si → aprovado → finalizado/rejeitado
- Vínculo com colaborador e solicitante

#### `ticket_acessos`
- Relação N:N entre tickets e aplicações
- Status individual por acesso
- Justificativas de rejeição

#### `aprovacoes`
- Histórico de todas as aprovações/rejeições
- Registro de quem, quando e justificativa
- Tipo de aprovador (gestor/SI)

#### `logs_auditoria`
- Auditoria completa de todas as ações
- Rastreabilidade para compliance
- Timestamps e IP de origem

#### `usuarios_portal`
- Usuários com acesso ao portal
- Perfis: gestor, seguranca_informacao, admin
- Controle de departamento e ativação

### Grupos AD Mapeados

- **SAP_View** → Acesso de visualização SAP
- **SAP_Admin** → Acesso administrativo SAP
- **Email_Users** → E-mail corporativo M365
- **VPN_Users** → Acesso VPN remota
- **SharePoint_Users** → SharePoint colaboração
- **PowerBI_Viewers** → Visualização dashboards
- **PowerBI_Editors** → Criação dashboards
- **Finance_Users** → Sistema financeiro
- **RH_Users** → Portal RH
- **CRM_Sales** → CRM de vendas

## 👥 Usuários de Teste

### Gestores
- **carlos.silva** - Tecnologia
- **maria.santos** - Financeiro
- **joao.oliveira** - Vendas

### Segurança da Informação
- **ana.costa** - TI
- **pedro.alves** - TI

### Administrador
- **admin** - TI

## 🛠️ Stack Tecnológica

- **Backend**: Hono (TypeScript) + Cloudflare Workers
- **Banco de Dados**: Cloudflare D1 (SQLite distribuído)
- **Frontend**: HTML + TailwindCSS + Vanilla JS (Axios)
- **Deployment**: Cloudflare Pages
- **Desenvolvimento**: Wrangler + PM2

## 🐳 Deployment com Docker

### Quick Start - Homologação

```bash
# Usando Docker Compose
docker-compose up -d

# Ou usando Makefile
make up

# Acessar aplicação
# http://localhost:3000 (aplicação direta)
# http://localhost (via Nginx)
# http://localhost:9000 (Portainer - monitoramento)
```

### Quick Start - Produção

```bash
# Build da imagem
docker build -t portal-acesso:latest .

# Ou usando docker-compose de produção
docker-compose -f docker-compose.prod.yml up -d

# Ou usando Makefile
make build-prod
make up-prod
```

### Comandos Docker Úteis (via Makefile)

```bash
# Gerenciamento
make build              # Build da imagem
make up                 # Iniciar containers (homologação)
make down               # Parar containers
make restart            # Reiniciar containers
make logs               # Ver logs em tempo real
make ps                 # Listar containers
make shell              # Acessar shell do container

# Produção
make build-prod         # Build para produção
make up-prod            # Iniciar produção
make logs-prod          # Ver logs de produção

# Manutenção
make backup             # Backup do banco de dados
make restore            # Restaurar backup
make clean              # Limpar containers e volumes
make health             # Verificar health dos containers

# Ver todos os comandos
make help
```

## 📦 Scripts NPM Disponíveis

```bash
npm run dev:sandbox      # Desenvolvimento local com D1 local
npm run build            # Build para produção
npm run deploy:prod      # Deploy para Cloudflare Pages

# Banco de Dados
npm run db:migrate:local # Aplicar migrações (local)
npm run db:migrate:prod  # Aplicar migrações (produção)
npm run db:seed          # Inserir dados de teste
npm run db:reset         # Resetar banco local (drop + migrate + seed)
npm run db:console:local # Console SQL interativo (local)

# Utilitários
npm run clean-port       # Liberar porta 3000
npm run test             # Testar servidor local
```

## 🏗️ Arquitetura Docker

### Dockerfile Multi-Stage
- **Stage 1 (Builder)**: Build da aplicação
- **Stage 2 (Production)**: Runtime otimizado com Alpine Linux
- **Usuário não-root**: Segurança (nodejs:nodejs)
- **Health Check**: Monitoramento automático
- **Dumb-init**: Gerenciamento correto de sinais

### Docker Compose - Homologação
- **portal-acesso**: Aplicação principal (porta 3000)
- **nginx**: Reverse proxy (portas 80/443)
- **portainer**: Interface de monitoramento (porta 9000)
- **Volumes persistentes**: Banco de dados e logs
- **Rede isolada**: portal-acesso-network

### Docker Compose - Produção
- **Réplicas**: 3 instâncias com load balancing
- **SSL/TLS**: Certificados Let's Encrypt automáticos
- **Rate Limiting**: Proteção contra abuse
- **Backup automatizado**: Diário às 2 AM
- **Recursos limitados**: CPU e memória controlados
- **Health checks**: Monitoramento contínuo

## 📁 Estrutura de Arquivos Docker

```
webapp/
├── Dockerfile                 # Dockerfile multi-stage otimizado
├── docker-compose.yml         # Homologação
├── docker-compose.prod.yml    # Produção
├── docker-entrypoint.sh       # Script de inicialização
├── .dockerignore              # Otimização de build
├── Makefile                   # Comandos facilitados
├── .env.example               # Exemplo de variáveis
├── .env.production            # Variáveis de produção
├── nginx/
│   ├── nginx.conf            # Config Nginx homologação
│   ├── nginx.prod.conf       # Config Nginx produção
│   └── ssl/                  # Certificados SSL
├── config/                    # Configurações customizadas
├── backups/                   # Backups do banco
├── certbot/                   # Let's Encrypt
└── logs/                      # Logs da aplicação
```

## 🔐 Segurança

- ✅ Autenticação por usuário de rede
- ✅ Controle de acesso por perfil (gestor/SI/admin)
- ✅ Logs de auditoria com timestamps
- ✅ Justificativas obrigatórias para rejeições
- ✅ Rastreabilidade completa de ações
- ✅ Integração com Active Directory (simulada para MVP)

## ⚙️ Variáveis de Ambiente

### Configuração Básica
```bash
NODE_ENV=production          # Ambiente (development/staging/production)
PORT=3000                    # Porta da aplicação
HOST=0.0.0.0                # Host binding
TZ=America/Sao_Paulo        # Timezone
SEED_DATABASE=false         # Inserir dados de teste (true/false)
```

### Integração Azure AD (futuro)
```bash
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
```

### SMTP (notificações - futuro)
```bash
SMTP_HOST=smtp.empresa.com
SMTP_PORT=587
SMTP_USER=noreply@empresa.com
SMTP_PASSWORD=your-password
```

Veja `.env.example` para lista completa de variáveis disponíveis.

## 🔐 Considerações de Segurança (Docker)

### Implementado
- ✅ Usuário não-root no container (nodejs:1001)
- ✅ Imagem Alpine Linux (menor superfície de ataque)
- ✅ Multi-stage build (menor tamanho final)
- ✅ Health checks automáticos
- ✅ Rate limiting no Nginx
- ✅ Security headers HTTP
- ✅ SSL/TLS em produção
- ✅ Rede isolada entre containers
- ✅ Volumes com permissões restritas

### Recomendações Adicionais
- 🔒 Use secrets do Docker Swarm/Kubernetes para credenciais
- 🔒 Configure firewall (UFW/iptables) no host
- 🔒 Mantenha imagens atualizadas (`docker-compose pull`)
- 🔒 Monitore logs de segurança
- 🔒 Faça backups regulares (automatizado no compose prod)
- 🔒 Use scanner de vulnerabilidades (Trivy, Clair)

## 🚧 Próximos Passos

### Alta Prioridade
1. **Integração real com Active Directory**
   - Microsoft Graph API (Azure AD/Entra ID)
   - ou LDAP via serviço intermediário
2. **Autenticação real** (SAML/OAuth2)
3. **Notificações por e-mail** (aprovações, rejeições)
4. **Dashboard de métricas** (tickets por status, SLA, etc.)

### Média Prioridade
5. **Exportação de relatórios** (Excel/PDF)
6. **Busca e filtros avançados** em tickets e logs
7. **Sistema de comentários** em tickets
8. **Upload de arquivos** (documentos de justificativa)
9. **Orquestração Kubernetes** (para produção em escala)

### Baixa Prioridade
10. **Modo escuro** para interface
11. **Notificações push** no navegador
12. **API REST documentada** (Swagger/OpenAPI)
13. **Testes automatizados** (unit + integration)
14. **CI/CD Pipeline** (GitHub Actions / GitLab CI)

## 📝 Notas Importantes

### Integração AD
Por enquanto, a integração com Active Directory está **simulada**. Para ambiente de produção real, você precisará:

1. **Azure AD (Microsoft Entra ID)**: Use Microsoft Graph API
2. **AD On-Premise**: Configure um serviço intermediário que exponha API REST para Cloudflare Workers

### Estrutura de Pastas
```
webapp/
├── src/
│   └── index.tsx          # Backend Hono com todas as APIs
├── public/static/
│   └── app.js             # Frontend JavaScript
├── migrations/
│   └── 0001_initial_schema.sql  # Schema do banco
├── seed.sql               # Dados de teste
├── ecosystem.config.cjs   # PM2 config
├── wrangler.jsonc         # Cloudflare config
└── package.json           # Dependencies & scripts
```

## 📊 Status do Projeto

- ✅ **Backend Completo**: Todas as APIs implementadas
- ✅ **Frontend Completo**: Interface para gestores e SI
- ✅ **Banco de Dados**: Schema completo com D1
- ✅ **Auditoria**: Sistema de logs funcionando
- ✅ **Fluxo de Aprovação**: Multinível implementado
- ⚠️ **Integração AD**: Simulada (aguardando integração real)
- ⏳ **Deploy Produção**: Aguardando Cloudflare Pages

## 🎨 Interface

### Tela de Login
- Login simples por usuário de rede
- Lista de usuários de teste visível

### Dashboard Gestor
- Cards de novos colaboradores
- Seleção de acessos por categoria
- Formulário de solicitação intuitivo

### Dashboard Segurança da Informação
- Lista de tickets pendentes
- Análise individual de cada acesso
- Justificativa obrigatória para rejeições

### Acompanhamento de Tickets
- Tabela com todos os tickets
- Status coloridos e detalhamento
- Histórico de aprovações

### Logs de Auditoria
- Tabela completa de todas as ações
- Filtros por usuário, ação, data
- Exportação futura

## 📞 Suporte

Para dúvidas ou problemas, consulte os logs do sistema ou a documentação das APIs.

---

## 🚀 Deploy em Diferentes Ambientes

### 1. Docker (Recomendado para On-Premise)
```bash
# Homologação
docker-compose up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Cloudflare Pages (Recomendado para Edge/Serverless)
```bash
npm run build
npx wrangler pages deploy dist --project-name portal-acesso
```

### 3. Kubernetes (Enterprise)
```bash
# Criar deployment e service
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml
kubectl apply -f k8s/ingress.yml
```

### 4. Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml portal-stack
```

## 📊 Monitoramento e Observabilidade

### Logs
```bash
# Docker Compose
docker-compose logs -f portal-acesso

# Makefile
make logs
make logs-app
```

### Health Check
```bash
# Via curl
curl http://localhost:3000/api/aplicacoes

# Via Makefile
make health
make test
```

### Métricas
- **Portainer**: http://localhost:9000 (incluído no docker-compose)
- **Docker Stats**: `docker stats portal-acesso-homolog`
- **Makefile**: `make stats`

## 🆘 Troubleshooting

### Container não inicia
```bash
# Ver logs
make logs

# Verificar status
make ps

# Inspecionar container
make inspect
```

### Banco de dados corrompido
```bash
# Restaurar backup
make restore

# Ou resetar completamente
docker-compose down -v
docker-compose up -d
```

### Problemas de permissão
```bash
# Verificar ownership dos volumes
docker exec portal-acesso-homolog ls -la /app/.wrangler

# Recriar container com permissões corretas
docker-compose down
docker-compose up -d --force-recreate
```

### Porta já em uso
```bash
# Verificar processo usando a porta
lsof -i :3000

# Ou alterar porta no docker-compose.yml
ports:
  - "3001:3000"
```

---

**Desenvolvido com Hono + Cloudflare Workers + D1 Database**  
**Containerizado com Docker + Nginx + Multi-Stage Build**

*Última atualização: 01/12/2024*
