// Estado global da aplicação
let currentUser = null;
let currentTab = null;

// ============================================
// LOGIN
// ============================================

async function handleLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  
  if (!username) {
    alert('Por favor, digite seu usuário');
    return;
  }
  
  try {
    const response = await axios.get(`/api/usuarios/${username}`);
    
    if (response.data.success) {
      currentUser = response.data.data;
      
      // Mostrar informações do usuário
      document.getElementById('userName').textContent = currentUser.nome;
      const roleSpan = document.getElementById('userRole');
      
      if (currentUser.perfil === 'gestor') {
        roleSpan.textContent = 'Gestor';
        roleSpan.className = 'text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800';
      } else if (currentUser.perfil === 'seguranca_informacao') {
        roleSpan.textContent = 'Segurança da Informação';
        roleSpan.className = 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-800';
        // Mostrar tab de aprovações
        document.getElementById('tabAprovacoes').classList.remove('hidden');
      } else if (currentUser.perfil === 'admin') {
        roleSpan.textContent = 'Administrador';
        roleSpan.className = 'text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800';
        document.getElementById('tabAprovacoes').classList.remove('hidden');
      }
      
      document.getElementById('userInfo').classList.remove('hidden');
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('mainContent').classList.remove('hidden');
      
      // Mostrar primeira tab
      showTab('novos');
    }
  } catch (error) {
    alert('Usuário não encontrado ou inativo');
    console.error(error);
  }
}

// ============================================
// NAVEGAÇÃO ENTRE TABS
// ============================================

function showTab(tabName) {
  currentTab = tabName;
  
  // Resetar todas as tabs
  const tabs = ['tabNovos', 'tabTickets', 'tabAprovacoes', 'tabLogs'];
  tabs.forEach(tab => {
    const el = document.getElementById(tab);
    if (el) {
      el.classList.remove('border-primary', 'text-primary', 'bg-blue-50');
    }
  });
  
  // Ativar tab atual
  const currentTabEl = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (currentTabEl) {
    currentTabEl.classList.add('border-primary', 'text-primary', 'bg-blue-50');
  }
  
  // Esconder todos os conteúdos
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  
  // Mostrar conteúdo da tab atual
  const content = document.getElementById('content' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (content) {
    content.classList.remove('hidden');
  }
  
  // Carregar dados da tab
  switch(tabName) {
    case 'novos':
      loadNovosColaboradores();
      break;
    case 'tickets':
      loadTickets();
      break;
    case 'aprovacoes':
      loadTicketsParaAprovacao();
      break;
    case 'logs':
      loadLogs();
      break;
  }
}

// ============================================
// TAB: NOVOS COLABORADORES
// ============================================

async function loadNovosColaboradores() {
  try {
    const response = await axios.get('/api/colaboradores/pendentes');
    const colaboradores = response.data.data;
    
    const content = document.getElementById('contentNovos');
    
    if (colaboradores.length === 0) {
      content.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p class="text-xl text-gray-600">Nenhum colaborador pendente de liberação de acesso</p>
        </div>
      `;
      return;
    }
    
    content.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-user-plus mr-2"></i>Novos Colaboradores
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${colaboradores.map(colab => `
            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-4">
                <div class="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <i class="fas fa-user text-xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-gray-800">${colab.nome_completo}</h3>
                  <p class="text-sm text-gray-600">${colab.cargo}</p>
                </div>
              </div>
              
              <div class="space-y-2 text-sm mb-4">
                <p class="text-gray-600"><i class="fas fa-building mr-2"></i>${colab.departamento}</p>
                <p class="text-gray-600"><i class="fas fa-envelope mr-2"></i>${colab.email}</p>
                <p class="text-gray-600"><i class="fas fa-calendar mr-2"></i>Admissão: ${formatDate(colab.data_admissao)}</p>
                <p class="text-gray-600"><i class="fas fa-user-circle mr-2"></i>Usuário: <strong>${colab.usuario_rede}</strong></p>
              </div>
              
              <button onclick="solicitarAcessos(${colab.id}, '${colab.nome_completo}')" 
                      class="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg transition duration-200">
                <i class="fas fa-key mr-2"></i>Solicitar Acessos
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error);
    alert('Erro ao carregar colaboradores');
  }
}

async function solicitarAcessos(colaboradorId, nomeColaborador) {
  try {
    // Buscar aplicações disponíveis
    const response = await axios.get('/api/aplicacoes');
    const aplicacoes = response.data.data;
    
    // Agrupar por categoria
    const categorias = {};
    aplicacoes.forEach(app => {
      if (!categorias[app.categoria]) {
        categorias[app.categoria] = [];
      }
      categorias[app.categoria].push(app);
    });
    
    const content = document.getElementById('contentNovos');
    content.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-key mr-2"></i>Solicitar Acessos
          </h2>
          <button onclick="loadNovosColaboradores()" 
                  class="text-gray-600 hover:text-gray-800">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p class="font-semibold text-gray-800">Colaborador: ${nomeColaborador}</p>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Observações (opcional)</label>
          <textarea id="observacoes" rows="3" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Informações adicionais sobre a solicitação..."></textarea>
        </div>
        
        <h3 class="text-lg font-bold text-gray-800 mb-4">Selecione os Acessos:</h3>
        
        <div class="space-y-6 mb-6">
          ${Object.keys(categorias).map(categoria => `
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-bold text-gray-700 mb-3 flex items-center">
                <i class="fas fa-folder mr-2 text-primary"></i>${categoria}
              </h4>
              <div class="space-y-2">
                ${categorias[categoria].map(app => `
                  <label class="flex items-start p-3 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" value="${app.id}" 
                           class="mt-1 mr-3 h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded acesso-checkbox">
                    <div class="flex-1">
                      <div class="font-semibold text-gray-800">${app.nome}</div>
                      <div class="text-sm text-gray-600">${app.descricao || ''}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        <i class="fas fa-shield-alt mr-1"></i>Grupo AD: ${app.grupo_ad}
                        ${app.requer_aprovacao_si ? '<span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Requer aprovação SI</span>' : ''}
                      </div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="flex gap-4">
          <button onclick="loadNovosColaboradores()" 
                  class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200">
            <i class="fas fa-times mr-2"></i>Cancelar
          </button>
          <button onclick="confirmarSolicitacao(${colaboradorId})" 
                  class="flex-1 bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
            <i class="fas fa-check mr-2"></i>Confirmar Solicitação
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar aplicações:', error);
    alert('Erro ao carregar aplicações');
  }
}

async function confirmarSolicitacao(colaboradorId) {
  const checkboxes = document.querySelectorAll('.acesso-checkbox:checked');
  
  if (checkboxes.length === 0) {
    alert('Selecione pelo menos um acesso');
    return;
  }
  
  const acessos = Array.from(checkboxes).map(cb => parseInt(cb.value));
  const observacoes = document.getElementById('observacoes').value.trim();
  
  if (!confirm(`Confirmar solicitação de ${acessos.length} acesso(s)?`)) {
    return;
  }
  
  try {
    const response = await axios.post('/api/tickets', {
      colaborador_id: colaboradorId,
      solicitante_usuario: currentUser.usuario_rede,
      solicitante_nome: currentUser.nome,
      acessos: acessos,
      observacoes: observacoes || null
    });
    
    if (response.data.success) {
      alert(`✅ Ticket ${response.data.data.numero_ticket} criado com sucesso!`);
      showTab('tickets');
    }
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    alert('Erro ao criar ticket');
  }
}

// ============================================
// TAB: ACOMPANHAR TICKETS
// ============================================

async function loadTickets() {
  try {
    const response = await axios.get('/api/tickets');
    const tickets = response.data.data;
    
    const content = document.getElementById('contentTickets');
    
    if (tickets.length === 0) {
      content.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p class="text-xl text-gray-600">Nenhum ticket encontrado</p>
        </div>
      `;
      return;
    }
    
    content.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-ticket-alt mr-2"></i>Tickets de Solicitação
        </h2>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-100 border-b">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ticket</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Colaborador</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cargo</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Solicitante</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${tickets.map(ticket => `
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <span class="font-mono text-sm font-semibold text-blue-600">${ticket.numero_ticket}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-800">${ticket.nome_completo}</div>
                    <div class="text-sm text-gray-600">${ticket.departamento}</div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">${ticket.cargo}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">${ticket.solicitante_nome}</td>
                  <td class="px-4 py-3">${getStatusBadge(ticket.status)}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">${formatDateTime(ticket.data_solicitacao)}</td>
                  <td class="px-4 py-3">
                    <button onclick="verDetalhesTicket(${ticket.id})" 
                            class="text-primary hover:text-secondary font-semibold">
                      <i class="fas fa-eye mr-1"></i>Ver Detalhes
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar tickets:', error);
    alert('Erro ao carregar tickets');
  }
}

async function verDetalhesTicket(ticketId) {
  try {
    const response = await axios.get(`/api/tickets/${ticketId}`);
    const { ticket, acessos, aprovacoes } = response.data.data;
    
    const content = document.getElementById('contentTickets');
    content.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-ticket-alt mr-2"></i>Detalhes do Ticket
          </h2>
          <button onclick="loadTickets()" 
                  class="text-gray-600 hover:text-gray-800">
            <i class="fas fa-arrow-left mr-2"></i>Voltar
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-bold text-gray-800 mb-3"><i class="fas fa-info-circle mr-2"></i>Informações do Ticket</h3>
            <div class="space-y-2 text-sm">
              <p><strong>Número:</strong> <span class="font-mono text-blue-600">${ticket.numero_ticket}</span></p>
              <p><strong>Status:</strong> ${getStatusBadge(ticket.status)}</p>
              <p><strong>Data Solicitação:</strong> ${formatDateTime(ticket.data_solicitacao)}</p>
              ${ticket.data_finalizacao ? `<p><strong>Data Finalização:</strong> ${formatDateTime(ticket.data_finalizacao)}</p>` : ''}
              <p><strong>Solicitante:</strong> ${ticket.solicitante_nome}</p>
              ${ticket.observacoes ? `<p><strong>Observações:</strong> ${ticket.observacoes}</p>` : ''}
            </div>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-bold text-gray-800 mb-3"><i class="fas fa-user mr-2"></i>Dados do Colaborador</h3>
            <div class="space-y-2 text-sm">
              <p><strong>Nome:</strong> ${ticket.nome_completo}</p>
              <p><strong>E-mail:</strong> ${ticket.email}</p>
              <p><strong>Cargo:</strong> ${ticket.cargo}</p>
              <p><strong>Departamento:</strong> ${ticket.departamento}</p>
              <p><strong>Usuário de Rede:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded">${ticket.usuario_rede}</span></p>
              ${ticket.senha_temporaria ? `<p><strong>Senha Temporária:</strong> <span class="font-mono bg-yellow-100 px-2 py-1 rounded">${ticket.senha_temporaria}</span></p>` : ''}
            </div>
          </div>
        </div>
        
        <div class="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 class="font-bold text-gray-800 mb-3"><i class="fas fa-list mr-2"></i>Acessos Solicitados</h3>
          <div class="space-y-2">
            ${acessos.map(acesso => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div class="flex-1">
                  <div class="font-semibold text-gray-800">${acesso.nome}</div>
                  <div class="text-sm text-gray-600">${acesso.descricao || ''}</div>
                  <div class="text-xs text-gray-500 mt-1">Grupo AD: ${acesso.grupo_ad}</div>
                  ${acesso.justificativa_rejeicao ? `<div class="text-xs text-red-600 mt-1">❌ ${acesso.justificativa_rejeicao}</div>` : ''}
                </div>
                <div>${getStatusBadge(acesso.status)}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${aprovacoes.length > 0 ? `
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-bold text-gray-800 mb-3"><i class="fas fa-check-circle mr-2"></i>Histórico de Aprovações</h3>
            <div class="space-y-3">
              ${aprovacoes.map(apr => `
                <div class="flex items-start p-3 bg-gray-50 rounded">
                  <div class="flex-shrink-0 mr-3">
                    ${apr.acao === 'aprovar' ? 
                      '<i class="fas fa-check-circle text-green-500 text-xl"></i>' : 
                      '<i class="fas fa-times-circle text-red-500 text-xl"></i>'}
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-800">${apr.aprovador_nome}</div>
                    <div class="text-sm text-gray-600">${apr.tipo_aprovador === 'gestor' ? 'Gestor' : 'Segurança da Informação'}</div>
                    <div class="text-sm text-gray-700 mt-1">
                      ${apr.acao === 'aprovar' ? '✅ Aprovado' : '❌ Rejeitado'}
                      ${apr.justificativa ? `: ${apr.justificativa}` : ''}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${formatDateTime(apr.data_aprovacao)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar detalhes do ticket:', error);
    alert('Erro ao carregar detalhes');
  }
}

// ============================================
// TAB: APROVAR ACESSOS (Segurança da Informação)
// ============================================

async function loadTicketsParaAprovacao() {
  try {
    const response = await axios.get('/api/tickets?status=aberto');
    const tickets = response.data.data;
    
    const content = document.getElementById('contentAprovacoes');
    
    if (tickets.length === 0) {
      content.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <i class="fas fa-check-circle text-6xl text-gray-300 mb-4"></i>
          <p class="text-xl text-gray-600">Nenhum ticket aguardando aprovação</p>
        </div>
      `;
      return;
    }
    
    content.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-check-circle mr-2"></i>Tickets Aguardando Aprovação
        </h2>
        
        <div class="space-y-4">
          ${tickets.map(ticket => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <span class="font-mono text-sm font-semibold text-blue-600">${ticket.numero_ticket}</span>
                  <span class="ml-3">${getStatusBadge(ticket.status)}</span>
                </div>
                <div class="text-sm text-gray-600">${formatDateTime(ticket.data_solicitacao)}</div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p class="text-sm text-gray-600">Colaborador:</p>
                  <p class="font-semibold text-gray-800">${ticket.nome_completo}</p>
                  <p class="text-sm text-gray-600">${ticket.cargo} - ${ticket.departamento}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Solicitado por:</p>
                  <p class="font-semibold text-gray-800">${ticket.solicitante_nome}</p>
                </div>
              </div>
              
              <button onclick="analisarTicket(${ticket.id})" 
                      class="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg transition duration-200">
                <i class="fas fa-search mr-2"></i>Analisar Ticket
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar tickets:', error);
    alert('Erro ao carregar tickets');
  }
}

async function analisarTicket(ticketId) {
  try {
    const response = await axios.get(`/api/tickets/${ticketId}`);
    const { ticket, acessos } = response.data.data;
    
    const content = document.getElementById('contentAprovacoes');
    content.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-clipboard-check mr-2"></i>Análise de Ticket
          </h2>
          <button onclick="loadTicketsParaAprovacao()" 
                  class="text-gray-600 hover:text-gray-800">
            <i class="fas fa-arrow-left mr-2"></i>Voltar
          </button>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p class="font-semibold text-gray-800">Ticket: ${ticket.numero_ticket}</p>
          <p class="text-sm text-gray-700">Colaborador: ${ticket.nome_completo} (${ticket.cargo})</p>
          <p class="text-sm text-gray-700">Solicitante: ${ticket.solicitante_nome}</p>
        </div>
        
        <h3 class="text-lg font-bold text-gray-800 mb-4">Acessos Solicitados:</h3>
        
        <div class="space-y-3 mb-6">
          ${acessos.map(acesso => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800">${acesso.nome}</h4>
                  <p class="text-sm text-gray-600">${acesso.descricao || ''}</p>
                  <p class="text-xs text-gray-500 mt-1">Grupo AD: ${acesso.grupo_ad}</p>
                </div>
              </div>
              
              <div class="flex gap-2">
                <label class="flex items-center flex-1 p-2 border-2 border-green-300 rounded cursor-pointer hover:bg-green-50">
                  <input type="radio" name="acesso_${acesso.aplicacao_id}" value="aprovado" checked
                         class="mr-2 acesso-decision" data-app-id="${acesso.aplicacao_id}">
                  <span class="text-green-700 font-semibold"><i class="fas fa-check mr-1"></i>Aprovar</span>
                </label>
                
                <label class="flex items-center flex-1 p-2 border-2 border-red-300 rounded cursor-pointer hover:bg-red-50">
                  <input type="radio" name="acesso_${acesso.aplicacao_id}" value="rejeitado"
                         class="mr-2 acesso-decision" data-app-id="${acesso.aplicacao_id}">
                  <span class="text-red-700 font-semibold"><i class="fas fa-times mr-1"></i>Rejeitar</span>
                </label>
              </div>
              
              <div class="mt-2 hidden justificativa-container" id="justificativa_${acesso.aplicacao_id}">
                <input type="text" placeholder="Justificativa da rejeição (obrigatório)"
                       class="w-full px-3 py-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent justificativa-input"
                       data-app-id="${acesso.aplicacao_id}">
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Observações Gerais (opcional)</label>
          <textarea id="observacoes_aprovacao" rows="3" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Comentários adicionais sobre a análise..."></textarea>
        </div>
        
        <div class="flex gap-4">
          <button onclick="loadTicketsParaAprovacao()" 
                  class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200">
            <i class="fas fa-times mr-2"></i>Cancelar
          </button>
          <button onclick="confirmarAprovacao(${ticketId}, 'rejeitar')" 
                  class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-200">
            <i class="fas fa-ban mr-2"></i>Rejeitar Tudo
          </button>
          <button onclick="confirmarAprovacao(${ticketId}, 'aprovar')" 
                  class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
            <i class="fas fa-check mr-2"></i>Aprovar
          </button>
        </div>
      </div>
    `;
    
    // Adicionar event listeners para mostrar/esconder justificativa
    document.querySelectorAll('.acesso-decision').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const appId = e.target.dataset.appId;
        const container = document.getElementById(`justificativa_${appId}`);
        if (e.target.value === 'rejeitado') {
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
      });
    });
    
  } catch (error) {
    console.error('Erro ao carregar ticket:', error);
    alert('Erro ao carregar ticket');
  }
}

async function confirmarAprovacao(ticketId, acao) {
  // Coletar decisões dos acessos
  const decisions = [];
  document.querySelectorAll('.acesso-decision:checked').forEach(radio => {
    const appId = radio.dataset.appId;
    const status = radio.value;
    const justificativaInput = document.querySelector(`.justificativa-input[data-app-id="${appId}"]`);
    const justificativa = justificativaInput ? justificativaInput.value.trim() : '';
    
    if (status === 'rejeitado' && !justificativa) {
      alert('Por favor, informe a justificativa para todos os acessos rejeitados');
      throw new Error('Justificativa obrigatória');
    }
    
    decisions.push({
      aplicacao_id: parseInt(appId),
      status: status,
      justificativa: justificativa || null
    });
  });
  
  const observacoes = document.getElementById('observacoes_aprovacao').value.trim();
  
  // Se ação for rejeitar tudo, solicitar justificativa
  let justificativa_geral = observacoes;
  if (acao === 'rejeitar' && !justificativa_geral) {
    justificativa_geral = prompt('Justificativa da rejeição (obrigatório):');
    if (!justificativa_geral) {
      alert('Justificativa é obrigatória para rejeição');
      return;
    }
  }
  
  if (!confirm(`Confirmar ${acao === 'aprovar' ? 'aprovação' : 'rejeição'} do ticket?`)) {
    return;
  }
  
  try {
    await axios.post(`/api/tickets/${ticketId}/aprovar`, {
      aprovador_usuario: currentUser.usuario_rede,
      aprovador_nome: currentUser.nome,
      acao: acao,
      justificativa: justificativa_geral || null,
      acessos_status: acao === 'aprovar' ? decisions : null
    });
    
    alert(`✅ Ticket ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso!`);
    loadTicketsParaAprovacao();
    
  } catch (error) {
    console.error('Erro ao processar aprovação:', error);
    alert('Erro ao processar aprovação');
  }
}

// ============================================
// TAB: LOGS E AUDITORIA
// ============================================

async function loadLogs() {
  try {
    const response = await axios.get('/api/logs');
    const logs = response.data.data;
    
    const content = document.getElementById('contentLogs');
    
    if (logs.length === 0) {
      content.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <i class="fas fa-history text-6xl text-gray-300 mb-4"></i>
          <p class="text-xl text-gray-600">Nenhum log registrado</p>
        </div>
      `;
      return;
    }
    
    content.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-history mr-2"></i>Logs de Auditoria
        </h2>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-100 border-b">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data/Hora</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuário</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ação</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Entidade</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Detalhes</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${logs.map(log => `
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">${formatDateTime(log.data_hora)}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800">${log.usuario}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 text-xs rounded-full ${getActionBadgeClass(log.acao)}">
                      ${log.acao}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">${log.entidade}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">${log.detalhes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar logs:', error);
    alert('Erro ao carregar logs');
  }
}

// ============================================
// UTILIDADES
// ============================================

function getStatusBadge(status) {
  const badges = {
    'pendente': '<span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-semibold">Pendente</span>',
    'aberto': '<span class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-semibold">Aberto</span>',
    'em_andamento': '<span class="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-semibold">Em Andamento</span>',
    'aguardando_si': '<span class="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-semibold">Aguardando SI</span>',
    'aprovado': '<span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">Aprovado</span>',
    'aplicado': '<span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">Aplicado</span>',
    'rejeitado': '<span class="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 font-semibold">Rejeitado</span>',
    'finalizado': '<span class="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-semibold">Finalizado</span>',
    'ativo': '<span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">Ativo</span>',
    'inativo': '<span class="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-semibold">Inativo</span>'
  };
  return badges[status] || status;
}

function getActionBadgeClass(acao) {
  const classes = {
    'criar_ticket': 'bg-blue-100 text-blue-800',
    'aprovar_ticket': 'bg-green-100 text-green-800',
    'rejeitar_ticket': 'bg-red-100 text-red-800',
    'aplicar_acesso': 'bg-purple-100 text-purple-800'
  };
  return classes[acao] || 'bg-gray-100 text-gray-800';
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}
