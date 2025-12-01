-- Tabela de Colaboradores (sincronizada com RH)
CREATE TABLE IF NOT EXISTS colaboradores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_completo TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  cargo TEXT NOT NULL,
  departamento TEXT NOT NULL,
  data_admissao DATE NOT NULL,
  usuario_rede TEXT UNIQUE,
  senha_temporaria TEXT,
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'ativo', 'inativo')),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Aplicações/Sistemas disponíveis
CREATE TABLE IF NOT EXISTS aplicacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  grupo_ad TEXT NOT NULL UNIQUE,
  categoria TEXT,
  requer_aprovacao_si INTEGER DEFAULT 1,
  ativo INTEGER DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tickets de Solicitação de Acesso
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_ticket TEXT UNIQUE NOT NULL,
  colaborador_id INTEGER NOT NULL,
  solicitante_usuario TEXT NOT NULL,
  solicitante_nome TEXT NOT NULL,
  status TEXT DEFAULT 'aberto' CHECK(status IN ('aberto', 'em_andamento', 'aguardando_si', 'aprovado', 'rejeitado', 'finalizado')),
  data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_finalizacao DATETIME,
  observacoes TEXT,
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

-- Tabela de Acessos Solicitados (relação ticket x aplicações)
CREATE TABLE IF NOT EXISTS ticket_acessos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  aplicacao_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'aprovado', 'rejeitado', 'aplicado')),
  justificativa_rejeicao TEXT,
  aplicado_em DATETIME,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (aplicacao_id) REFERENCES aplicacoes(id)
);

-- Tabela de Aprovações (fluxo de aprovação)
CREATE TABLE IF NOT EXISTS aprovacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  aprovador_usuario TEXT NOT NULL,
  aprovador_nome TEXT NOT NULL,
  tipo_aprovador TEXT NOT NULL CHECK(tipo_aprovador IN ('gestor', 'seguranca_informacao')),
  acao TEXT NOT NULL CHECK(acao IN ('aprovar', 'rejeitar')),
  justificativa TEXT,
  data_aprovacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER,
  usuario TEXT NOT NULL,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id INTEGER,
  detalhes TEXT,
  ip_origem TEXT,
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- Tabela de Usuários do Portal (Gestores e SI)
CREATE TABLE IF NOT EXISTS usuarios_portal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_rede TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  perfil TEXT NOT NULL CHECK(perfil IN ('gestor', 'seguranca_informacao', 'admin')),
  departamento TEXT,
  ativo INTEGER DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores(status);
CREATE INDEX IF NOT EXISTS idx_colaboradores_usuario_rede ON colaboradores(usuario_rede);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_numero ON tickets(numero_ticket);
CREATE INDEX IF NOT EXISTS idx_tickets_colaborador ON tickets(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_ticket_acessos_ticket ON ticket_acessos(ticket_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_ticket ON aprovacoes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_logs_ticket ON logs_auditoria(ticket_id);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria(usuario);
