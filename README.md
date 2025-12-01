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

## 📦 Scripts Disponíveis

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

## 🔐 Segurança

- ✅ Autenticação por usuário de rede
- ✅ Controle de acesso por perfil (gestor/SI/admin)
- ✅ Logs de auditoria com timestamps
- ✅ Justificativas obrigatórias para rejeições
- ✅ Rastreabilidade completa de ações
- ✅ Integração com Active Directory (simulada para MVP)

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

### Baixa Prioridade
9. **Modo escuro** para interface
10. **Notificações push** no navegador
11. **API REST documentada** (Swagger/OpenAPI)
12. **Testes automatizados** (unit + integration)

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

**Desenvolvido com Hono + Cloudflare Workers + D1 Database**

*Última atualização: 01/12/2024*
