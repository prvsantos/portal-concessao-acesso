import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// API ROUTES - COLABORADORES
// ============================================

// Listar colaboradores pendentes (novos contratados)
app.get('/api/colaboradores/pendentes', async (c) => {
  const { DB } = c.env;
  
  try {
    const result = await DB.prepare(`
      SELECT id, nome_completo, email, cpf, cargo, departamento, 
             data_admissao, usuario_rede, status
      FROM colaboradores 
      WHERE status = 'pendente'
      ORDER BY data_admissao DESC
    `).all();
    
    return c.json({ success: true, data: result.results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Buscar colaborador por ID
app.get('/api/colaboradores/:id', async (c) => {
  const { DB } = c.env;
  const id = c.req.param('id');
  
  try {
    const result = await DB.prepare(`
      SELECT * FROM colaboradores WHERE id = ?
    `).bind(id).first();
    
    if (!result) {
      return c.json({ success: false, error: 'Colaborador não encontrado' }, 404);
    }
    
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// API ROUTES - APLICAÇÕES
// ============================================

// Listar todas as aplicações ativas
app.get('/api/aplicacoes', async (c) => {
  const { DB } = c.env;
  
  try {
    const result = await DB.prepare(`
      SELECT id, nome, descricao, grupo_ad, categoria, requer_aprovacao_si
      FROM aplicacoes 
      WHERE ativo = 1
      ORDER BY categoria, nome
    `).all();
    
    return c.json({ success: true, data: result.results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// API ROUTES - TICKETS
// ============================================

// Criar novo ticket de solicitação
app.post('/api/tickets', async (c) => {
  const { DB } = c.env;
  
  try {
    const body = await c.req.json();
    const { colaborador_id, solicitante_usuario, solicitante_nome, acessos, observacoes } = body;
    
    // Gerar número do ticket
    const countResult = await DB.prepare(`
      SELECT COUNT(*) as total FROM tickets
    `).first();
    
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String((countResult?.total as number || 0) + 1).padStart(5, '0')}`;
    
    // Criar ticket
    const ticketResult = await DB.prepare(`
      INSERT INTO tickets (numero_ticket, colaborador_id, solicitante_usuario, solicitante_nome, status, observacoes)
      VALUES (?, ?, ?, ?, 'aberto', ?)
    `).bind(ticketNumber, colaborador_id, solicitante_usuario, solicitante_nome, observacoes || null).run();
    
    const ticketId = ticketResult.meta.last_row_id;
    
    // Inserir acessos solicitados
    for (const aplicacaoId of acessos) {
      await DB.prepare(`
        INSERT INTO ticket_acessos (ticket_id, aplicacao_id, status)
        VALUES (?, ?, 'pendente')
      `).bind(ticketId, aplicacaoId).run();
    }
    
    // Registrar log
    await DB.prepare(`
      INSERT INTO logs_auditoria (ticket_id, usuario, acao, entidade, entidade_id, detalhes)
      VALUES (?, ?, 'criar_ticket', 'tickets', ?, ?)
    `).bind(ticketId, solicitante_usuario, ticketId, `Ticket ${ticketNumber} criado com ${acessos.length} acessos solicitados`).run();
    
    // Atualizar status do colaborador
    await DB.prepare(`
      UPDATE colaboradores SET status = 'ativo' WHERE id = ?
    `).bind(colaborador_id).run();
    
    return c.json({ 
      success: true, 
      data: { 
        ticket_id: ticketId, 
        numero_ticket: ticketNumber 
      } 
    });
    
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Listar todos os tickets
app.get('/api/tickets', async (c) => {
  const { DB } = c.env;
  const status = c.req.query('status');
  
  try {
    let query = `
      SELECT t.*, c.nome_completo, c.cargo, c.departamento
      FROM tickets t
      JOIN colaboradores c ON t.colaborador_id = c.id
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY t.data_solicitacao DESC';
    
    const stmt = DB.prepare(query);
    const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    
    return c.json({ success: true, data: result.results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Buscar detalhes de um ticket
app.get('/api/tickets/:id', async (c) => {
  const { DB } = c.env;
  const id = c.req.param('id');
  
  try {
    // Buscar ticket
    const ticket = await DB.prepare(`
      SELECT t.*, c.nome_completo, c.email, c.cargo, c.departamento, c.usuario_rede, c.senha_temporaria
      FROM tickets t
      JOIN colaboradores c ON t.colaborador_id = c.id
      WHERE t.id = ?
    `).bind(id).first();
    
    if (!ticket) {
      return c.json({ success: false, error: 'Ticket não encontrado' }, 404);
    }
    
    // Buscar acessos solicitados
    const acessos = await DB.prepare(`
      SELECT ta.*, a.nome, a.descricao, a.grupo_ad, a.categoria
      FROM ticket_acessos ta
      JOIN aplicacoes a ON ta.aplicacao_id = a.id
      WHERE ta.ticket_id = ?
    `).bind(id).all();
    
    // Buscar aprovações
    const aprovacoes = await DB.prepare(`
      SELECT * FROM aprovacoes
      WHERE ticket_id = ?
      ORDER BY data_aprovacao DESC
    `).bind(id).all();
    
    return c.json({ 
      success: true, 
      data: {
        ticket,
        acessos: acessos.results,
        aprovacoes: aprovacoes.results
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// API ROUTES - APROVAÇÕES (Segurança da Informação)
// ============================================

// Aprovar ou rejeitar ticket
app.post('/api/tickets/:id/aprovar', async (c) => {
  const { DB } = c.env;
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { aprovador_usuario, aprovador_nome, acao, justificativa, acessos_status } = body;
    
    // Registrar aprovação
    await DB.prepare(`
      INSERT INTO aprovacoes (ticket_id, aprovador_usuario, aprovador_nome, tipo_aprovador, acao, justificativa)
      VALUES (?, ?, ?, 'seguranca_informacao', ?, ?)
    `).bind(id, aprovador_usuario, aprovador_nome, acao, justificativa || null).run();
    
    if (acao === 'aprovar') {
      // Atualizar status dos acessos
      if (acessos_status && Array.isArray(acessos_status)) {
        for (const acesso of acessos_status) {
          await DB.prepare(`
            UPDATE ticket_acessos 
            SET status = ?, justificativa_rejeicao = ?, aplicado_em = CURRENT_TIMESTAMP
            WHERE ticket_id = ? AND aplicacao_id = ?
          `).bind(
            acesso.status, 
            acesso.justificativa || null, 
            id, 
            acesso.aplicacao_id
          ).run();
        }
      }
      
      // Verificar se todos os acessos foram processados
      const pendentes = await DB.prepare(`
        SELECT COUNT(*) as total FROM ticket_acessos
        WHERE ticket_id = ? AND status = 'pendente'
      `).bind(id).first();
      
      // Atualizar status do ticket
      const newStatus = (pendentes?.total as number || 0) === 0 ? 'finalizado' : 'aprovado';
      await DB.prepare(`
        UPDATE tickets 
        SET status = ?, data_finalizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(newStatus, id).run();
      
      // Registrar log
      await DB.prepare(`
        INSERT INTO logs_auditoria (ticket_id, usuario, acao, entidade, entidade_id, detalhes)
        VALUES (?, ?, 'aprovar_ticket', 'tickets', ?, ?)
      `).bind(id, aprovador_usuario, id, `Ticket aprovado pela Segurança da Informação`).run();
      
    } else {
      // Rejeitar ticket
      await DB.prepare(`
        UPDATE tickets 
        SET status = 'rejeitado', data_finalizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(id).run();
      
      // Registrar log
      await DB.prepare(`
        INSERT INTO logs_auditoria (ticket_id, usuario, acao, entidade, entidade_id, detalhes)
        VALUES (?, ?, 'rejeitar_ticket', 'tickets', ?, ?)
      `).bind(id, aprovador_usuario, id, `Ticket rejeitado: ${justificativa}`).run();
    }
    
    return c.json({ success: true, message: `Ticket ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso` });
    
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// API ROUTES - LOGS
// ============================================

// Buscar logs de um ticket
app.get('/api/logs/ticket/:id', async (c) => {
  const { DB } = c.env;
  const id = c.req.param('id');
  
  try {
    const result = await DB.prepare(`
      SELECT * FROM logs_auditoria
      WHERE ticket_id = ?
      ORDER BY data_hora DESC
    `).bind(id).all();
    
    return c.json({ success: true, data: result.results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Buscar todos os logs (com paginação)
app.get('/api/logs', async (c) => {
  const { DB } = c.env;
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  try {
    const result = await DB.prepare(`
      SELECT * FROM logs_auditoria
      ORDER BY data_hora DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return c.json({ success: true, data: result.results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// API ROUTES - USUÁRIOS DO PORTAL
// ============================================

// Buscar usuário por username
app.get('/api/usuarios/:username', async (c) => {
  const { DB } = c.env;
  const username = c.req.param('username');
  
  try {
    const result = await DB.prepare(`
      SELECT id, usuario_rede, nome, email, perfil, departamento, ativo
      FROM usuarios_portal
      WHERE usuario_rede = ? AND ativo = 1
    `).bind(username).first();
    
    if (!result) {
      return c.json({ success: false, error: 'Usuário não encontrado' }, 404);
    }
    
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// FRONTEND ROUTES
// ============================================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portal de Concessão de Acesso</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#2563eb',
                  secondary: '#1e40af',
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="bg-primary text-white p-3 rounded-full">
                            <i class="fas fa-shield-halved text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800">Portal de Concessão de Acesso</h1>
                            <p class="text-gray-600">Sistema de gerenciamento de acessos corporativos</p>
                        </div>
                    </div>
                    <div id="userInfo" class="text-right hidden">
                        <p class="text-sm text-gray-600">Logado como:</p>
                        <p class="font-semibold text-gray-800" id="userName"></p>
                        <span class="text-xs px-2 py-1 rounded-full" id="userRole"></span>
                    </div>
                </div>
            </div>

            <!-- Login Section -->
            <div id="loginSection" class="max-w-md mx-auto">
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                        <i class="fas fa-sign-in-alt mr-2"></i>Acesso ao Sistema
                    </h2>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Usuário de Rede</label>
                        <input type="text" id="loginUsername" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                               placeholder="Digite seu usuário">
                    </div>
                    
                    <button onclick="handleLogin()" 
                            class="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                        <i class="fas fa-arrow-right mr-2"></i>Entrar
                    </button>
                    
                    <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p class="text-sm text-gray-700 mb-2"><strong>Usuários de teste:</strong></p>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li><strong>Gestor:</strong> carlos.silva, maria.santos, joao.oliveira</li>
                            <li><strong>Segurança da Informação:</strong> ana.costa, pedro.alves</li>
                            <li><strong>Administrador:</strong> admin</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Main Content (hidden initially) -->
            <div id="mainContent" class="hidden">
                <!-- Navigation Tabs -->
                <div class="bg-white rounded-lg shadow-lg mb-6">
                    <div class="flex border-b">
                        <button onclick="showTab('novos')" id="tabNovos" 
                                class="flex-1 px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50 border-b-2 border-transparent hover:border-primary transition-colors">
                            <i class="fas fa-user-plus mr-2"></i>Novos Colaboradores
                        </button>
                        <button onclick="showTab('tickets')" id="tabTickets"
                                class="flex-1 px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50 border-b-2 border-transparent hover:border-primary transition-colors">
                            <i class="fas fa-ticket-alt mr-2"></i>Acompanhar Tickets
                        </button>
                        <button onclick="showTab('aprovacoes')" id="tabAprovacoes"
                                class="flex-1 px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50 border-b-2 border-transparent hover:border-primary transition-colors hidden">
                            <i class="fas fa-check-circle mr-2"></i>Aprovar Acessos
                        </button>
                        <button onclick="showTab('logs')" id="tabLogs"
                                class="flex-1 px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50 border-b-2 border-transparent hover:border-primary transition-colors">
                            <i class="fas fa-history mr-2"></i>Logs e Auditoria
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <div id="contentNovos" class="tab-content hidden"></div>
                <div id="contentTickets" class="tab-content hidden"></div>
                <div id="contentAprovacoes" class="tab-content hidden"></div>
                <div id="contentLogs" class="tab-content hidden"></div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
});

export default app
