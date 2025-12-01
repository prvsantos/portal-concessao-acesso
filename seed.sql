-- Seed data para testes

-- Inserir aplicações/sistemas disponíveis
INSERT OR IGNORE INTO aplicacoes (nome, descricao, grupo_ad, categoria, requer_aprovacao_si) VALUES 
  ('SAP - Visualização', 'Acesso de visualização ao SAP', 'SAP_View', 'ERP', 1),
  ('SAP - Administrador', 'Acesso administrativo ao SAP', 'SAP_Admin', 'ERP', 1),
  ('E-mail Corporativo', 'Conta de e-mail Microsoft 365', 'Email_Users', 'Comunicação', 0),
  ('VPN Corporativa', 'Acesso remoto via VPN', 'VPN_Users', 'Infraestrutura', 1),
  ('SharePoint', 'Acesso ao SharePoint', 'SharePoint_Users', 'Colaboração', 0),
  ('Power BI - Viewer', 'Visualização de dashboards', 'PowerBI_Viewers', 'BI', 0),
  ('Power BI - Editor', 'Criação de dashboards', 'PowerBI_Editors', 'BI', 1),
  ('Sistema Financeiro', 'Acesso ao sistema financeiro', 'Finance_Users', 'Financeiro', 1),
  ('Sistema RH', 'Acesso ao portal de RH', 'RH_Users', 'RH', 1),
  ('CRM Vendas', 'Acesso ao CRM de vendas', 'CRM_Sales', 'Vendas', 1);

-- Inserir usuários do portal (Gestores e SI)
INSERT OR IGNORE INTO usuarios_portal (usuario_rede, nome, email, perfil, departamento) VALUES 
  ('carlos.silva', 'Carlos Silva', 'carlos.silva@empresa.com', 'gestor', 'Tecnologia'),
  ('maria.santos', 'Maria Santos', 'maria.santos@empresa.com', 'gestor', 'Financeiro'),
  ('joao.oliveira', 'João Oliveira', 'joao.oliveira@empresa.com', 'gestor', 'Vendas'),
  ('ana.costa', 'Ana Costa', 'ana.costa@empresa.com', 'seguranca_informacao', 'TI'),
  ('pedro.alves', 'Pedro Alves', 'pedro.alves@empresa.com', 'seguranca_informacao', 'TI'),
  ('admin', 'Administrador', 'admin@empresa.com', 'admin', 'TI');

-- Inserir colaboradores de exemplo (recém contratados)
INSERT OR IGNORE INTO colaboradores (nome_completo, email, cpf, cargo, departamento, data_admissao, usuario_rede, senha_temporaria, status) VALUES 
  ('Lucas Ferreira', 'lucas.ferreira@empresa.com', '123.456.789-01', 'Desenvolvedor Júnior', 'Tecnologia', '2024-01-15', 'lucas.ferreira', 'Temp@123', 'pendente'),
  ('Juliana Rodrigues', 'juliana.rodrigues@empresa.com', '234.567.890-12', 'Analista Financeiro', 'Financeiro', '2024-01-15', 'juliana.rodrigues', 'Temp@456', 'pendente'),
  ('Roberto Mendes', 'roberto.mendes@empresa.com', '345.678.901-23', 'Vendedor Sênior', 'Vendas', '2024-01-16', 'roberto.mendes', 'Temp@789', 'pendente'),
  ('Fernanda Lima', 'fernanda.lima@empresa.com', '456.789.012-34', 'Analista de BI', 'Tecnologia', '2024-01-16', 'fernanda.lima', 'Temp@321', 'pendente');

-- Inserir um ticket de exemplo
INSERT OR IGNORE INTO tickets (numero_ticket, colaborador_id, solicitante_usuario, solicitante_nome, status) VALUES 
  ('TKT-2024-00001', 1, 'carlos.silva', 'Carlos Silva', 'aberto');

-- Inserir acessos solicitados para o ticket de exemplo
INSERT OR IGNORE INTO ticket_acessos (ticket_id, aplicacao_id, status) VALUES 
  (1, 1, 'pendente'),  -- SAP View
  (1, 3, 'pendente'),  -- Email
  (1, 5, 'pendente');  -- SharePoint
