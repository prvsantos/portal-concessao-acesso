# 🚀 Docker Quick Start - Portal de Concessão de Acesso

## 📦 Instalação Rápida

### Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+

### Instalar Docker (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## 🏃 Start em 3 Comandos

```bash
# 1. Clone o projeto
git clone https://github.com/empresa/portal-acesso.git
cd portal-acesso

# 2. Inicie os containers
docker-compose up -d

# 3. Aguarde 30 segundos e acesse
http://localhost:3000
```

## 🔑 Usuários de Teste

- **Gestor**: `carlos.silva`, `maria.santos`, `joao.oliveira`
- **Segurança da Informação**: `ana.costa`, `pedro.alves`
- **Admin**: `admin`

## 📊 Acessos Disponíveis

- 🌐 **Aplicação**: http://localhost:3000
- 🔧 **Nginx**: http://localhost
- 📊 **Portainer**: http://localhost:9000

## 🛠️ Comandos Básicos

```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Status
docker-compose ps
```

## 🎯 Usando Makefile (Recomendado)

```bash
make help        # Ver todos os comandos
make up          # Iniciar
make logs        # Ver logs
make test        # Testar
make down        # Parar
make backup      # Backup do banco
```

## 🏭 Produção

```bash
# Build da imagem
docker build -t portal-acesso:latest .

# Deploy produção
docker-compose -f docker-compose.prod.yml up -d

# Ou usando Makefile
make build-prod
make up-prod
```

## 📚 Documentação Completa

- **README.md** - Documentação geral do projeto
- **DOCKER.md** - Guia completo de Docker (troubleshooting, segurança, produção)
- **.env.example** - Variáveis de ambiente disponíveis

## 🆘 Problemas Comuns

### Porta 3000 em uso
```bash
# Verificar processo
sudo lsof -i :3000

# Ou alterar porta no docker-compose.yml
ports:
  - "3001:3000"
```

### Container não inicia
```bash
docker-compose logs portal-acesso
docker-compose down -v
docker-compose up -d
```

### Permissões
```bash
sudo chown -R $USER:$USER .
docker-compose restart
```

---

**🎉 Pronto! Seu portal está rodando no Docker!**

Para mais informações, consulte:
- `DOCKER.md` - Guia completo
- `README.md` - Documentação do projeto
- `make help` - Comandos disponíveis
