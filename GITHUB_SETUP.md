# 🔧 GitHub Setup - Configuração Adicional

## ⚠️ Ação Manual Necessária

O GitHub App não tem permissão para criar workflows automaticamente. Você precisa adicionar o workflow manualmente.

## 📝 Como Adicionar o GitHub Actions Workflow

### Opção 1: Via Interface Web (Recomendado)

1. **Acesse seu repositório**:
   ```
   https://github.com/prvsantos/portal-concessao-acesso
   ```

2. **Criar arquivo de workflow**:
   - Clique em **"Add file"** → **"Create new file"**
   - Digite o caminho: `.github/workflows/docker-build.yml`

3. **Cole o conteúdo**:
   - Abra o arquivo `.github-examples/docker-build.yml` neste projeto
   - Copie todo o conteúdo (após os comentários iniciais)
   - Cole no arquivo que você está criando no GitHub

4. **Commit**:
   - Adicione uma mensagem: "Add GitHub Actions workflow for Docker build"
   - Clique em **"Commit changes"**

### Opção 2: Via Git Clone Local

Se você clonar o repositório na sua máquina local:

```bash
# Clone o repositório
git clone https://github.com/prvsantos/portal-concessao-acesso.git
cd portal-concessao-acesso

# Copiar o workflow do exemplo
mkdir -p .github/workflows
cp .github-examples/docker-build.yml .github/workflows/

# Commit e push
git add .github/workflows/docker-build.yml
git commit -m "Add GitHub Actions workflow for Docker build"
git push origin main
```

## 🎯 O Que o Workflow Faz

Quando ativado, o workflow executará automaticamente:

### ✅ Em cada Push/PR para main:
1. **Build da imagem Docker** (multi-arquitetura: amd64, arm64)
2. **Push para GitHub Container Registry** (`ghcr.io`)
3. **Scanner de vulnerabilidades** com Trivy
4. **Upload de resultados** para GitHub Security

### 📦 Imagens Geradas:
```
ghcr.io/prvsantos/portal-concessao-acesso:main
ghcr.io/prvsantos/portal-concessao-acesso:sha-abc123
ghcr.io/prvsantos/portal-concessao-acesso:v1.0.0 (para tags)
```

## 🔐 Permissões Necessárias

O workflow já está configurado com as permissões corretas:
```yaml
permissions:
  contents: read
  packages: write
```

Isso permite que o GitHub Actions:
- Leia o código do repositório
- Faça push de imagens para GitHub Container Registry

## 📊 Como Usar as Imagens

Após o workflow rodar, você pode usar as imagens:

```bash
# Pull da imagem
docker pull ghcr.io/prvsantos/portal-concessao-acesso:main

# Run
docker run -d -p 3000:3000 ghcr.io/prvsantos/portal-concessao-acesso:main
```

## 🔍 Verificar Status do Workflow

1. Vá até: https://github.com/prvsantos/portal-concessao-acesso/actions
2. Você verá os workflows rodando/concluídos
3. Clique em qualquer workflow para ver detalhes

## 🆘 Troubleshooting

### Workflow não aparece
- Certifique-se de que o arquivo está em `.github/workflows/` (não `.github-examples/`)
- Verifique se o arquivo tem extensão `.yml` (não `.yaml`)

### Build falha
- Verifique os logs do workflow no GitHub Actions
- Certifique-se de que o Dockerfile está correto
- Verifique se as dependências estão instaladas

### Permissão negada no push de imagem
- Vá em Settings → Actions → General
- Em "Workflow permissions", selecione "Read and write permissions"
- Salve as alterações

---

## ✅ Checklist de Setup

- [ ] Adicionar workflow em `.github/workflows/docker-build.yml`
- [ ] Fazer commit do arquivo
- [ ] Verificar se workflow aparece em Actions
- [ ] Aguardar build automático
- [ ] Verificar imagem em Packages
- [ ] Testar pull da imagem

---

**Após adicionar o workflow, seu repositório terá CI/CD completo! 🎉**
