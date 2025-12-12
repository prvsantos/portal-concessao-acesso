# 🔧 GitHub Setup - CI/CD Configurado

## ✅ GitHub Actions Workflow Incluído

O workflow do GitHub Actions já está configurado em `.github/workflows/docker-build.yml`!

## 🎯 O Que o Workflow Faz

O workflow executa automaticamente em cada push/PR:

### ✅ Ações Automáticas:
1. **Build da imagem Docker** (multi-arquitetura: amd64, arm64)
2. **Push para GitHub Container Registry** (`ghcr.io`)
3. **Scanner de vulnerabilidades** com Trivy
4. **Upload de resultados** para GitHub Security

### 📦 Imagens Geradas:
```
ghcr.io/prvsantos/portal-concessao-acesso:main
ghcr.io/prvsantos/portal-concessao-acesso:homolog
ghcr.io/prvsantos/portal-concessao-acesso:sha-abc123
ghcr.io/prvsantos/portal-concessao-acesso:v1.0.0 (para tags)
```

## 🔐 Permissões Configuradas

O workflow tem as permissões corretas:
```yaml
permissions:
  contents: read      # Ler código
  packages: write     # Push de imagens
```

## 📊 Como Usar as Imagens

### Pull e Run
```bash
# Pull da imagem
docker pull ghcr.io/prvsantos/portal-concessao-acesso:main

# Run
docker run -d -p 3000:3000 ghcr.io/prvsantos/portal-concessao-acesso:main

# Ou usar no docker-compose.yml
services:
  portal:
    image: ghcr.io/prvsantos/portal-concessao-acesso:main
    ports:
      - "3000:3000"
```

## 🔍 Verificar Status do Workflow

1. **GitHub Actions**: https://github.com/prvsantos/portal-concessao-acesso/actions
2. **Packages**: https://github.com/prvsantos/portal-concessao-acesso/pkgs/container/portal-concessao-acesso
3. **Security**: https://github.com/prvsantos/portal-concessao-acesso/security

## 🚀 Branches Monitoradas

O workflow roda automaticamente nos seguintes branches:
- `main` - Produção
- `homolog` - Homologação
- `develop` - Desenvolvimento

## 📝 Configuração do Workflow

### Triggers
```yaml
on:
  push:
    branches: [main, homolog, develop]
    tags: ['v*']
  pull_request:
    branches: [main, homolog]
```

### Plataformas
- `linux/amd64` (Intel/AMD)
- `linux/arm64` (ARM - Apple Silicon, Raspberry Pi, etc.)

### Cache
- Usa GitHub Actions cache para builds mais rápidos
- Cache compartilhado entre builds

## 🛠️ Customização

### Adicionar novas branches
Edite `.github/workflows/docker-build.yml`:
```yaml
on:
  push:
    branches:
      - main
      - homolog
      - develop
      - sua-branch  # Adicione aqui
```

### Alterar registro de imagens
```yaml
env:
  REGISTRY: ghcr.io  # Ou: docker.io, registry.empresa.com
  IMAGE_NAME: ${{ github.repository }}
```

### Desabilitar scanner de vulnerabilidades
Comente ou remova os steps:
```yaml
# - name: Run Trivy vulnerability scanner
# - name: Upload Trivy results
```

## 🆘 Troubleshooting

### Workflow não executa
- ✅ Verifique que o arquivo está em `.github/workflows/`
- ✅ Extensão deve ser `.yml` (não `.yaml`)
- ✅ Branch deve estar na lista de triggers

### Build falha
- 🔍 Veja logs em: https://github.com/prvsantos/portal-concessao-acesso/actions
- 🔍 Verifique se Dockerfile está correto
- 🔍 Confirme que dependências estão no package.json

### Push de imagem falha
- 🔐 Settings → Actions → General → "Workflow permissions"
- 🔐 Selecione "Read and write permissions"
- 🔐 Salve e tente novamente

### Scanner de vulnerabilidades falha
- ⚠️ Normal em primeira execução
- ⚠️ Pode falhar se imagem for muito grande
- ✅ Workflow continua mesmo se scanner falhar

## 📦 Imagens Disponíveis

Após o primeiro push, as imagens estarão em:
```
https://github.com/prvsantos/portal-concessao-acesso/pkgs/container/portal-concessao-acesso
```

### Download público
```bash
docker pull ghcr.io/prvsantos/portal-concessao-acesso:main
```

### Se repositório for privado
```bash
# Login primeiro
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Depois pull
docker pull ghcr.io/prvsantos/portal-concessao-acesso:main
```

## ✅ Checklist de Verificação

- [x] Workflow em `.github/workflows/docker-build.yml`
- [x] Permissões configuradas (read + write)
- [x] Branches corretas nos triggers
- [x] Multi-arquitetura habilitada
- [x] Scanner de vulnerabilidades ativo
- [x] Cache otimizado

---

## 🎉 CI/CD Pronto!

Seu repositório está configurado com:
- ✅ Build automático de imagens Docker
- ✅ Push para GitHub Container Registry
- ✅ Scanner de vulnerabilidades
- ✅ Multi-arquitetura (amd64 + arm64)
- ✅ Cache otimizado

**Próximo push iniciará o workflow automaticamente! 🚀**

---

*Workflow configurado em: 01/12/2024*  
*Repositório: prvsantos/portal-concessao-acesso*
