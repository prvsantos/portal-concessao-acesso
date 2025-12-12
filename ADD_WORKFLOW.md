# 🔧 Como Adicionar o GitHub Actions Workflow

## ⚠️ Ação Manual Necessária

O GitHub App não tem permissão para criar workflows automaticamente via API.  
Você precisa adicionar o arquivo manualmente através da interface web do GitHub.

## 📝 Passos para Adicionar o Workflow

### Opção 1: Via Interface Web do GitHub (Mais Fácil) ✅

1. **Acesse o repositório**:
   ```
   https://github.com/prvsantos/portal-concessao-acesso
   ```

2. **Selecione a branch homolog**:
   - Clique no dropdown de branches (normalmente diz "main")
   - Selecione **"homolog"**

3. **Criar arquivo de workflow**:
   - Clique em **"Add file"** → **"Create new file"**
   - No campo "Name your file", digite: `.github/workflows/docker-build.yml`

4. **Cole o conteúdo abaixo**:

```yaml
name: Docker Build and Push

on:
  push:
    branches:
      - main
      - homolog
      - develop
    tags:
      - 'v*'
  pull_request:
    branches:
      - main
      - homolog

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

      - name: Run Trivy vulnerability scanner
        if: github.event_name != 'pull_request'
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        if: github.event_name != 'pull_request'
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

5. **Commit o arquivo**:
   - Mensagem sugerida: "Add GitHub Actions workflow for Docker CI/CD"
   - Certifique-se de estar commitando na branch **homolog**
   - Clique em **"Commit changes"**

6. **Verificar**:
   - Vá até: https://github.com/prvsantos/portal-concessao-acesso/actions
   - O workflow deve começar a executar automaticamente
   - Aguarde ~5-10 minutos para o primeiro build

### Opção 2: Via Git CLI (Se preferir linha de comando)

```bash
# Clone o repositório
git clone https://github.com/prvsantos/portal-concessao-acesso.git
cd portal-concessao-acesso

# Checkout branch homolog
git checkout homolog

# Criar diretório e arquivo
mkdir -p .github/workflows
cat > .github/workflows/docker-build.yml << 'EOF'
[Cole aqui o conteúdo do workflow acima]
EOF

# Commit e push
git add .github/workflows/docker-build.yml
git commit -m "Add GitHub Actions workflow for Docker CI/CD"
git push origin homolog
```

## ✅ Verificação

Após adicionar o workflow:

1. **GitHub Actions**: https://github.com/prvsantos/portal-concessao-acesso/actions
   - Deve aparecer um workflow rodando

2. **Primeiro build**: 
   - Pode levar 5-10 minutos
   - Build multi-arquitetura (amd64 + arm64)

3. **Imagens publicadas**: https://github.com/prvsantos/portal-concessao-acesso/pkgs/container/portal-concessao-acesso
   - Após build, verá a imagem disponível

## 🎯 O Que o Workflow Faz

✅ **Build automático** em cada push para homolog  
✅ **Multi-arquitetura**: amd64 (Intel/AMD) + arm64 (ARM/Apple Silicon)  
✅ **Push para GHCR**: GitHub Container Registry  
✅ **Scanner de segurança**: Trivy vulnerability scan  
✅ **Cache otimizado**: Builds mais rápidos

## 📦 Usar a Imagem

Após o workflow rodar:

```bash
# Pull da imagem
docker pull ghcr.io/prvsantos/portal-concessao-acesso:homolog

# Run
docker run -d -p 3000:3000 ghcr.io/prvsantos/portal-concessao-acesso:homolog

# Ou no docker-compose.yml
services:
  portal:
    image: ghcr.io/prvsantos/portal-concessao-acesso:homolog
    ports:
      - "3000:3000"
```

## 🆘 Troubleshooting

### Workflow não aparece
- ✅ Certifique-se de que está na branch **homolog**
- ✅ Arquivo deve estar em `.github/workflows/docker-build.yml`
- ✅ Extensão deve ser `.yml` (não `.yaml`)

### Build falha
- 🔍 Veja logs detalhados em Actions
- 🔍 Verifique se o Dockerfile está correto
- 🔍 Pode ser timeout (primeira build é mais lenta)

### Permissão de push de imagem
- Settings → Actions → General
- "Workflow permissions" → "Read and write permissions"
- Salvar

---

## 🎊 Após Adicionar

Seu repositório terá CI/CD completo:
- ✅ Build automático de Docker images
- ✅ Push para GitHub Container Registry
- ✅ Scanner de vulnerabilidades
- ✅ Multi-arquitetura
- ✅ Cache otimizado

**Branch homolog estará totalmente automatizada! 🚀**

---

*Criado em: 01/12/2024*  
*Repositório: prvsantos/portal-concessao-acesso*  
*Branch: homolog*
