// js/app.js - VERSÃO COMPLETA COM DESPESAS DO JSON SERVER
import { 
    fetchReceitas, 
    addReceitaAPI, 
    deleteReceitaAPI,
    patchReceitaAPI,
    verificarApiSaude
} from './modules/api.js';

import { 
    Despesa 
} from './modules/despesas.js';

import { 
    initCategorias, 
    adicionarCategoria, 
    removerCategoria, 
    listarCategorias, 
    categoriasMap,
    recarregarCategorias
} from './modules/categorias.js';

import { 
    initTags, 
    adicionarTag, 
    removerTag, 
    listarTags, 
    tagsMap 
} from './modules/tags.js';

import { 
    salvarDespesas, 
    carregarDespesas 
} from './storage/localStorage.js';

import { criarConversorMoeda } from './utils/conversorMoeda.js';

// Importa o serviço de despesas da API
import { despesaAPIService } from './services/despesaAPIService.js';

// ============================================
// FUNÇÕES UTILITÁRIAS GLOBAIS
// ============================================

function garantirDataString(data) {
    if (!data) return '';
    if (data instanceof Date) {
        return data.toISOString().split('T')[0];
    }
    return String(data);
}

window.garantirDataString = garantirDataString;

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let state = {
    receitas: [],
    despesas: [],
    mesFiltro: '',
    buscaDespesas: ''
};

const conversor = criarConversorMoeda();
let elementos = {};

// ============================================
// INICIALIZAÇÃO
// ============================================

async function verificarApi() {
    try {
        const response = await fetch('http://localhost:3000/receitas?_limit=1');
        if (response.ok) {
            console.log('✅ API JSON Server está rodando');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ API não disponível');
        return false;
    }
    return false;
}

async function carregarDadosIniciais() {
    try {
        console.log('📥 Carregando dados iniciais...');
        
        // Carrega receitas da API
        try {
            state.receitas = await fetchReceitas();
            console.log('💰 Receitas carregadas:', state.receitas.length);
        } catch (error) {
            console.error('Erro ao carregar receitas:', error);
            state.receitas = [];
        }
        
        // Carrega despesas da API (JSON Server)
        try {
            const despesasAPI = await despesaAPIService.listar();
            console.log('💸 Despesas carregadas da API:', despesasAPI.length);
            
            // Converte as despesas da API para objetos da classe Despesa
            state.despesas = despesasAPI.map(d => {
                // Busca os IDs das categorias e tags baseado nos nomes
                let categoriaId = null;
                for (let [id, cat] of categoriasMap.entries()) {
                    if (cat.nome === d.categoria) {
                        categoriaId = id;
                        break;
                    }
                }
                
                const tagsIds = d.tags.map(tagNome => {
                    for (let [id, tag] of tagsMap.entries()) {
                        if (tag.nome === tagNome) {
                            return id;
                        }
                    }
                    return null;
                }).filter(id => id);
                
                return new Despesa(
                    d.titulo,
                    d.descricao || '',
                    d.valorPrevisto,
                    d.valorReal,
                    categoriaId,
                    tagsIds,
                    d.data,
                    d.status
                );
            });
            
            // Salva no localStorage como backup
            if (state.despesas.length > 0) {
                salvarDespesas(state.despesas);
            }
            
        } catch (error) {
            console.error('Erro ao carregar despesas da API:', error);
            // Fallback para localStorage
            state.despesas = carregarDespesas();
            console.log('⚠️ Usando despesas do localStorage como fallback');
        }
        
        console.log('📊 Dados carregados:', {
            receitas: state.receitas.length,
            despesas: state.despesas.length
        });
        
    } catch (error) {
        console.error('❌ Erro fatal ao carregar dados:', error);
        state.receitas = [];
        state.despesas = carregarDespesas();
    }
}

function inicializarUI() {
    console.log('🎨 Inicializando interface...');
    
    elementos = {
        listaReceitas: document.querySelector('#listaReceitas'),
        listaDespesas: document.querySelector('#listaDespesas'),
        totalReceitas: document.querySelector('#totalReceitas'),
        totalDespesas: document.querySelector('#totalDespesas'),
        totalReceitasMes: document.querySelector('#totalReceitasMes'),
        totalDespesasMes: document.querySelector('#totalDespesasMes'),
        saldoMes: document.querySelector('#saldoMes'),
        mesFiltro: document.querySelector('#mesFiltro'),
        buscaDespesas: document.querySelector('#buscaDespesas'),
        selectCategoria: document.querySelector('#categoriaDespesa'),
        tagsDisponiveis: document.querySelector('#tagsDisponiveis'),
        tagsSelecionadas: document.querySelector('#tagsSelecionadas'),
        listaCategorias: document.querySelector('#listaCategorias'),
        listaTags: document.querySelector('#listaTags'),
        modal: document.querySelector('#modalEdicao'),
        modalContent: document.querySelector('#modalContent')
    };
    
    if (!elementos.listaReceitas || !elementos.listaDespesas) {
        console.error('❌ Elementos essenciais não encontrados!');
        return;
    }
    
    atualizarSelectCategorias();
    atualizarSelectTags();
    renderizarListasCategoriasTags();
    registrarEventListeners();
    render();
    
    console.log('✅ Interface inicializada');
}

// ============================================
// RENDERIZAÇÃO
// ============================================

function render() {
    if (!elementos.listaReceitas || !elementos.listaDespesas) return;
    renderReceitas();
    renderDespesas();
    atualizarBalanco();
}

// Renderiza receitas (VERSÃO CORRIGIDA COM CONVERSÃO)
function renderReceitas() {
    if (!elementos.listaReceitas) return;
    
    elementos.listaReceitas.innerHTML = '';
    
    let receitasFiltradas = [...state.receitas];
    
    // Filtra por mês
    if (state.mesFiltro) {
        receitasFiltradas = receitasFiltradas.filter(r => 
            r.data && r.data.startsWith(state.mesFiltro)
        );
    }
    
    // Ordena por data (mais recente primeiro)
    receitasFiltradas.sort((a, b) => {
        if (!a.data) return 1;
        if (!b.data) return -1;
        return new Date(b.data) - new Date(a.data);
    });
    
    console.log(`📊 Renderizando ${receitasFiltradas.length} receitas`);
    
    // Renderiza cada receita
    receitasFiltradas.forEach(receita => {
        const div = document.createElement('div');
        div.className = 'item-card receita-item';
        
        // Calcula os valores
        let valorOriginal = receita.valorOriginal || receita.valor || 0;
        let moeda = receita.moeda || 'BRL';
        let valorEmReal = receita.valorEmReal || conversor.converterParaReal(valorOriginal, moeda);
        
        // Formata os valores
        const valorOriginalFormatado = conversor.formatarValor(valorOriginal, moeda);
        const valorRealFormatado = conversor.formatarReal(valorEmReal);
        
        // Exibe o valor com a moeda original e a conversão
        const exibicaoValor = moeda === 'BRL' 
            ? valorRealFormatado 
            : `${valorOriginalFormatado} ≈ ${valorRealFormatado}`;
        
        div.innerHTML = `
            <div class="item-header">
                <span class="item-titulo">${receita.titulo || 'Sem título'}</span>
                <span class="item-valor" style="font-size: 1.1em; font-weight: bold;">
                    ${exibicaoValor}
                </span>
            </div>
            <div class="item-descricao" style="color: #666; margin: 5px 0;">
                ${receita.descricao || 'Sem descrição'}
            </div>
            ${moeda !== 'BRL' ? `
                <div class="item-conversao" style="font-size: 0.85em; color: #888; margin: 3px 0;">
                    💱 Taxa: 1 ${moeda} = R$ ${conversor.getTaxa(moeda).toFixed(2)}
                </div>
            ` : ''}
            <div class="item-data" style="font-size: 0.85em; color: #888;">
                📅 ${receita.data ? new Date(receita.data).toLocaleDateString('pt-BR') : 'Sem data'}
            </div>
            <div class="item-acoes" style="margin-top: 10px;">
                <button class="btn-edit" data-id="${receita.id}" style="background: #f8961e; color: white; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer;">✏️ Editar</button>
                <button class="btn-delete" data-id="${receita.id}" style="background: #f72585; color: white; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px;">🗑️ Remover</button>
            </div>
        `;
        
        // Adiciona eventos
        const btnEdit = div.querySelector('.btn-edit');
        const btnDelete = div.querySelector('.btn-delete');
        
        btnEdit.onclick = () => abrirModalEdicaoReceita(receita.id);
        btnDelete.onclick = () => removerReceita(receita.id);
        
        elementos.listaReceitas.appendChild(div);
    });
    
    // Atualiza total (sempre em Real)
    const total = receitasFiltradas.reduce((acc, r) => {
        const valor = r.valorEmReal || conversor.converterParaReal(r.valorOriginal || r.valor || 0, r.moeda || 'BRL');
        return acc + valor;
    }, 0);
    
    if (elementos.totalReceitas) {
        elementos.totalReceitas.textContent = conversor.formatarReal(total);
        // Adiciona tooltip mostrando total em outras moedas
        elementos.totalReceitas.title = `Total em Real: R$ ${total.toFixed(2)}`;
    }
}

function renderDespesas() {
    elementos.listaDespesas.innerHTML = '';
    
    let despesasFiltradas = [...state.despesas];
    
    if (state.mesFiltro) {
        despesasFiltradas = despesasFiltradas.filter(d => {
            if (!d.data) return false;
            return garantirDataString(d.data).startsWith(state.mesFiltro);
        });
    }
    
    if (state.buscaDespesas) {
        const termo = state.buscaDespesas.toLowerCase();
        despesasFiltradas = despesasFiltradas.filter(d => 
            (d.titulo && d.titulo.toLowerCase().includes(termo)) ||
            (d.descricao && d.descricao.toLowerCase().includes(termo))
        );
    }
    
    despesasFiltradas.sort((a, b) => {
        if (!a.data) return 1;
        if (!b.data) return -1;
        const dataA = new Date(garantirDataString(a.data));
        const dataB = new Date(garantirDataString(b.data));
        return dataB - dataA;
    });
    
    despesasFiltradas.forEach(despesa => {
        const categoria = categoriasMap.get(despesa.categoria);
        const nomeCategoria = categoria ? `${categoria.icone} ${categoria.nome}` : 'Sem categoria';
        
        const tagsHtml = (despesa.tags || []).map(tagId => {
            const tag = tagsMap.get(tagId);
            return tag ? `<span class="item-tag">${tag.nome}</span>` : '';
        }).join('');
        
        const div = document.createElement('div');
        div.className = `item-card despesa-item ${despesa.status === 'paga' ? 'paga' : 'pendente'}`;
        div.innerHTML = `
            <div class="item-header">
                <span class="item-titulo">${despesa.titulo || 'Sem título'}</span>
                <span class="item-valor">R$ ${(despesa.valorPrevisto || 0).toFixed(2)}</span>
            </div>
            <div class="item-descricao">${despesa.descricao || 'Sem descrição'}</div>
            <div class="item-categoria">📁 ${nomeCategoria}</div>
            <div class="item-tags">${tagsHtml}</div>
            <div class="item-data">${despesa.data ? new Date(garantirDataString(despesa.data)).toLocaleDateString('pt-BR') : 'Sem data'}</div>
            <div class="item-status">${despesa.status === 'paga' ? '✅ Paga' : '⏳ Não Paga'}</div>
            <div class="item-acoes">
                <button class="btn-edit" data-id="${despesa.id}">✏️ Editar</button>
                <button class="btn-delete" data-id="${despesa.id}">🗑️ Remover</button>
            </div>
        `;
        
        div.querySelector('.btn-edit').onclick = () => abrirModalEdicaoDespesa(despesa.id);
        div.querySelector('.btn-delete').onclick = () => removerDespesa(despesa.id);
        
        elementos.listaDespesas.appendChild(div);
    });
    
    const total = despesasFiltradas.reduce((acc, d) => acc + (d.valorPrevisto || 0), 0);
    if (elementos.totalDespesas) {
        elementos.totalDespesas.textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Atualiza balanço do mês (VERSÃO CORRIGIDA COM CONVERSÃO)
function atualizarBalanco() {
    let receitasMes = [...state.receitas];
    let despesasMes = [...state.despesas];
    
    if (state.mesFiltro) {
        // Filtra receitas
        receitasMes = receitasMes.filter(r => r.data && r.data.startsWith(state.mesFiltro));
        
        // Filtra despesas
        despesasMes = despesasMes.filter(d => {
            if (!d.data) return false;
            const dataString = garantirDataString(d.data);
            return dataString.startsWith(state.mesFiltro);
        });
    }
    
    // Calcula total de receitas (sempre em Real)
    const totalReceitas = receitasMes.reduce((acc, r) => {
        const valor = r.valorEmReal || conversor.converterParaReal(r.valorOriginal || r.valor || 0, r.moeda || 'BRL');
        return acc + valor;
    }, 0);
    
    // Calcula total de despesas (já estão em Real)
    const totalDespesas = despesasMes.reduce((acc, d) => {
        return acc + (d.getValorBalanco ? d.getValorBalanco() : (d.valorPrevisto || 0));
    }, 0);
    
    const saldo = totalReceitas - totalDespesas;
    
    // Atualiza elementos
    if (elementos.totalReceitasMes) {
        elementos.totalReceitasMes.textContent = conversor.formatarReal(totalReceitas);
        // Adiciona informações adicionais
        if (receitasMes.some(r => r.moeda && r.moeda !== 'BRL')) {
            elementos.totalReceitasMes.title = `Total convertido para Real`;
        }
    }
    
    if (elementos.totalDespesasMes) {
        elementos.totalDespesasMes.textContent = conversor.formatarReal(totalDespesas);
    }
    
    if (elementos.saldoMes) {
        elementos.saldoMes.textContent = conversor.formatarReal(saldo);
        elementos.saldoMes.style.color = saldo >= 0 ? '#4cc9f0' : '#f72585';
        
        // Adiciona mensagem de alerta se saldo for negativo
        if (saldo < 0) {
            elementos.saldoMes.title = `⚠️ Saldo negativo! Despesas excedem receitas em R$ ${Math.abs(saldo).toFixed(2)}`;
        } else {
            elementos.saldoMes.title = `✅ Saldo positivo!`;
        }
    }
    
    console.log(`📊 Balanço do mês ${state.mesFiltro || 'atual'}:`);
    console.log(`   Receitas: R$ ${totalReceitas.toFixed(2)}`);
    console.log(`   Despesas: R$ ${totalDespesas.toFixed(2)}`);
    console.log(`   Saldo: R$ ${saldo.toFixed(2)}`);
}

// ============================================
// CRUD RECEITAS (API)
// ============================================

async function adicionarReceita() {
    try {
        const titulo = document.querySelector('#tituloReceita')?.value;
        const descricao = document.querySelector('#descricaoReceita')?.value;
        const valor = document.querySelector('#valorReceita')?.value;
        const moeda = document.querySelector('#moedaReceita')?.value;
        const data = document.querySelector('#dataReceita')?.value;
        
        if (!titulo?.trim()) {
            alert('Preencha o título da receita!');
            return;
        }
        
        if (!valor || parseFloat(valor) <= 0) {
            alert('Preencha um valor válido!');
            return;
        }
        
        if (!data) {
            alert('Preencha a data!');
            return;
        }
        
        const novaReceita = {
            titulo: titulo.trim(),
            descricao: descricao || '',
            valor: parseFloat(valor),
            moeda: moeda || 'BRL',
            data
        };
        
        const receitaSalva = await addReceitaAPI(novaReceita);
        state.receitas = [...state.receitas, receitaSalva];
        
        document.querySelector('#tituloReceita').value = '';
        document.querySelector('#descricaoReceita').value = '';
        document.querySelector('#valorReceita').value = '';
        document.querySelector('#dataReceita').value = '';
        
        render();
        alert('✅ Receita adicionada!');
        
    } catch (error) {
        console.error('Erro:', error);
        alert(`Erro: ${error.message}`);
    }
}

async function removerReceita(id) {
    if (!confirm('Remover esta receita?')) return;
    
    try {
        await deleteReceitaAPI(id);
        state.receitas = state.receitas.filter(r => r.id !== id);
        render();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao remover');
    }
}

// ============================================
// CRUD DESPESAS (API)
// ============================================

async function adicionarDespesa() {
    console.log('📝 Tentando adicionar despesa...');
    
    try {
        const titulo = document.querySelector('#tituloDespesa')?.value;
        const descricao = document.querySelector('#descricaoDespesa')?.value;
        const valorPrevisto = document.querySelector('#valorPrevistoDespesa')?.value;
        const valorReal = document.querySelector('#valorRealDespesa')?.value;
        const categoriaId = document.querySelector('#categoriaDespesa')?.value;
        const data = document.querySelector('#dataDespesa')?.value;
        const status = document.querySelector('#statusDespesa')?.value;
        
        const tagElements = document.querySelectorAll('#tagsSelecionadas .tag-item[data-id]');
        const tagsSelecionadas = Array.from(tagElements).map(el => el.dataset.id);
        
        if (!titulo?.trim()) {
            alert('Preencha o título!');
            return;
        }
        
        if (!valorPrevisto || parseFloat(valorPrevisto) <= 0) {
            alert('Preencha um valor previsto válido!');
            return;
        }
        
        if (!categoriaId) {
            alert('Selecione uma categoria!');
            return;
        }
        
        if (!data) {
            alert('Preencha a data!');
            return;
        }
        
        // Verifica categoria
        let categoriaObj = categoriasMap.get(categoriaId);
        if (!categoriaObj && !isNaN(categoriaId)) {
            categoriaObj = categoriasMap.get(Number(categoriaId));
        }
        
        if (!categoriaObj) {
            alert('Categoria inválida!');
            return;
        }
        
        // Busca os nomes das tags
        const tagsNomes = tagsSelecionadas.map(tagId => {
            const tag = tagsMap.get(tagId);
            return tag ? tag.nome : null;
        }).filter(nome => nome);
        
        // Prepara dados para API
        const despesaData = {
            titulo: titulo.trim(),
            descricao: descricao || '',
            valorPrevisto: parseFloat(valorPrevisto),
            valorReal: valorReal ? parseFloat(valorReal) : null,
            categoria: categoriaObj.nome,
            tags: tagsNomes,
            data: data,
            status: status || 'nao_paga'
        };
        
        // Salva na API
        const novaDespesaAPI = await despesaAPIService.adicionar(despesaData);
        console.log('✅ Despesa salva na API:', novaDespesaAPI);
        
        // Cria instância da classe Despesa para o estado
        const novaDespesa = new Despesa(
            titulo.trim(),
            descricao || '',
            parseFloat(valorPrevisto),
            valorReal ? parseFloat(valorReal) : null,
            categoriaId,
            tagsSelecionadas,
            data,
            status || 'nao_paga'
        );
        
        // Atualiza estado
        state.despesas = [...state.despesas, novaDespesa];
        
        // Salva no localStorage como backup
        salvarDespesas(state.despesas);
        
        // Limpa formulário
        document.querySelector('#tituloDespesa').value = '';
        document.querySelector('#descricaoDespesa').value = '';
        document.querySelector('#valorPrevistoDespesa').value = '';
        document.querySelector('#valorRealDespesa').value = '';
        document.querySelector('#dataDespesa').value = '';
        document.querySelector('#tagsSelecionadas').innerHTML = '';
        document.querySelector('#categoriaDespesa').value = '';
        
        render();
        alert('✅ Despesa adicionada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar despesa:', error);
        alert(`Erro: ${error.message}`);
    }
}

// Função para remover despesa (CORRIGIDA)
async function removerDespesa(id) {
    if (!confirm('Deseja realmente remover esta despesa?')) return;
    
    try {
        console.log(`🗑️ Tentando remover despesa com ID: ${id} (tipo: ${typeof id})`);
        
        // Verifica se a despesa existe no estado
        const despesaExistente = state.despesas.find(d => d.id === id);
        if (!despesaExistente) {
            console.error('❌ Despesa não encontrada no estado local');
            alert('Despesa não encontrada!');
            return;
        }
        
        // Tenta remover da API
        try {
            await despesaAPIService.remover(id);
            console.log(`✅ Despesa ${id} removida da API com sucesso`);
        } catch (apiError) {
            console.warn('⚠️ Erro ao remover da API, tentando remover apenas localmente:', apiError);
            // Continua mesmo se falhar na API - remove localmente
        }
        
        // Remove do estado local
        state.despesas = state.despesas.filter(d => d.id !== id);
        
        // Atualiza o localStorage como backup
        salvarDespesas(state.despesas);
        
        // Re-renderiza a interface
        render();
        
        alert('✅ Despesa removida com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao remover despesa:', error);
        
        // Fallback: tenta remover apenas do localStorage se a API falhou
        try {
            console.log('🔄 Tentando remover apenas do localStorage...');
            state.despesas = state.despesas.filter(d => d.id !== id);
            salvarDespesas(state.despesas);
            render();
            alert('✅ Despesa removida localmente (API não respondeu)');
        } catch (fallbackError) {
            console.error('❌ Erro também no fallback:', fallbackError);
            alert('Erro ao remover despesa. Tente recarregar a página.');
        }
    }
}

// ============================================
// MODAL E EDIÇÃO
// ============================================

function abrirModalEdicaoReceita(id) {
    const receita = state.receitas.find(r => r.id === id);
    if (!receita) return;
    
    const modal = document.getElementById('modalEdicao');
    const modalContent = document.getElementById('modalContent');
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <h2>✏️ Editar Receita</h2>
        <div class="form-group">
            <label>Título</label>
            <input type="text" id="editTitulo" value="${receita.titulo || ''}" placeholder="Título">
        </div>
        <div class="form-group">
            <label>Descrição</label>
            <textarea id="editDescricao" placeholder="Descrição">${receita.descricao || ''}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Valor</label>
                <input type="number" id="editValor" value="${receita.valor || 0}" step="0.01">
            </div>
            <div class="form-group">
                <label>Moeda</label>
                <select id="editMoeda">
                    <option value="BRL" ${receita.moeda === 'BRL' ? 'selected' : ''}>R$ Real</option>
                    <option value="USD" ${receita.moeda === 'USD' ? 'selected' : ''}>US$ Dólar</option>
                    <option value="EUR" ${receita.moeda === 'EUR' ? 'selected' : ''}>€ Euro</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Data</label>
            <input type="date" id="editData" value="${receita.data || ''}">
        </div>
        <div class="modal-buttons">
            <button id="btnSalvarEdicao" class="btn-primary">💾 Salvar</button>
            <button id="btnFecharModal" class="btn-secondary">❌ Cancelar</button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('btnSalvarEdicao').onclick = async () => {
        const updates = {
            titulo: document.getElementById('editTitulo').value,
            descricao: document.getElementById('editDescricao').value,
            valor: parseFloat(document.getElementById('editValor').value),
            moeda: document.getElementById('editMoeda').value,
            data: document.getElementById('editData').value
        };
        
        await patchReceitaAPI(id, updates);
        state.receitas = state.receitas.map(r => r.id === id ? { ...r, ...updates } : r);
        modal.style.display = 'none';
        render();
        alert('✅ Receita atualizada!');
    };
    
    document.getElementById('btnFecharModal').onclick = () => {
        modal.style.display = 'none';
    };
}

function abrirModalEdicaoDespesa(id) {
    const despesa = state.despesas.find(d => d.id === id);
    if (!despesa) return;
    
    const modal = document.getElementById('modalEdicao');
    const modalContent = document.getElementById('modalContent');
    if (!modal || !modalContent) return;
    
    const categoriasOptions = listarCategorias().map(cat => 
        `<option value="${cat.id}" ${despesa.categoria === cat.id ? 'selected' : ''}>${cat.icone} ${cat.nome}</option>`
    ).join('');
    
    modalContent.innerHTML = `
        <h2>✏️ Editar Despesa</h2>
        <div class="form-group">
            <label>Título</label>
            <input type="text" id="editTitulo" value="${despesa.titulo || ''}" placeholder="Título">
        </div>
        <div class="form-group">
            <label>Descrição</label>
            <textarea id="editDescricao" placeholder="Descrição">${despesa.descricao || ''}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Valor Previsto</label>
                <input type="number" id="editValorPrevisto" value="${despesa.valorPrevisto || 0}" step="0.01">
            </div>
            <div class="form-group">
                <label>Valor Real</label>
                <input type="number" id="editValorReal" value="${despesa.valorReal || ''}" step="0.01">
            </div>
        </div>
        <div class="form-group">
            <label>Categoria</label>
            <select id="editCategoria">
                <option value="">Selecione uma categoria</option>
                ${categoriasOptions}
            </select>
        </div>
        <div class="form-group">
            <label>Data</label>
            <input type="date" id="editData" value="${despesa.data || ''}">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="editStatus">
                <option value="nao_paga" ${despesa.status === 'nao_paga' ? 'selected' : ''}>⏳ Não Paga</option>
                <option value="paga" ${despesa.status === 'paga' ? 'selected' : ''}>✅ Paga</option>
            </select>
        </div>
        <div class="modal-buttons">
            <button id="btnSalvarEdicao" class="btn-primary">💾 Salvar</button>
            <button id="btnFecharModal" class="btn-secondary">❌ Cancelar</button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('btnSalvarEdicao').onclick = async () => {
        const categoriaId = document.getElementById('editCategoria').value;
        const categoriaObj = categoriasMap.get(categoriaId);
        
        if (!categoriaObj) {
            alert('Selecione uma categoria válida!');
            return;
        }
        
        const updatesAPI = {
            titulo: document.getElementById('editTitulo').value,
            descricao: document.getElementById('editDescricao').value,
            valorPrevisto: parseFloat(document.getElementById('editValorPrevisto').value),
            valorReal: document.getElementById('editValorReal').value ? parseFloat(document.getElementById('editValorReal').value) : null,
            categoria: categoriaObj.nome,
            data: document.getElementById('editData').value,
            status: document.getElementById('editStatus').value
        };
        
        await despesaAPIService.atualizar(id, updatesAPI);
        
        state.despesas = state.despesas.map(d => 
            d.id === id ? {
                ...d,
                titulo: updatesAPI.titulo,
                descricao: updatesAPI.descricao,
                valorPrevisto: updatesAPI.valorPrevisto,
                valorReal: updatesAPI.valorReal,
                categoria: categoriaId,
                data: updatesAPI.data,
                status: updatesAPI.status
            } : d
        );
        
        salvarDespesas(state.despesas);
        modal.style.display = 'none';
        render();
        alert('✅ Despesa atualizada!');
    };
    
    document.getElementById('btnFecharModal').onclick = () => {
        modal.style.display = 'none';
    };
}

// ============================================
// TAGS E CATEGORIAS
// ============================================

function adicionarTagSelecionada() {
    const select = document.getElementById('tagsDisponiveis');
    if (!select) return;
    
    const tagId = select.value;
    if (!tagId) {
        alert('Selecione uma tag!');
        return;
    }
    
    const tag = tagsMap.get(tagId);
    if (!tag) return;
    
    const existente = document.querySelector(`#tagsSelecionadas .tag-item[data-id="${tagId}"]`);
    if (existente) {
        alert('Tag já adicionada!');
        return;
    }
    
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.dataset.id = tagId;
    tagElement.innerHTML = `${tag.nome} <button onclick="this.parentElement.remove()">×</button>`;
    
    document.getElementById('tagsSelecionadas').appendChild(tagElement);
    select.value = '';
}

function atualizarSelectCategorias() {
    const select = document.getElementById('categoriaDespesa');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    listarCategorias().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icone} ${cat.nome}`;
        select.appendChild(option);
    });
}

function atualizarSelectTags() {
    const select = document.getElementById('tagsDisponiveis');
    if (!select) return;
    
    select.innerHTML = '';
    listarTags().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.nome;
        select.appendChild(option);
    });
}

// Função para renderizar listas de categorias e tags (CORRIGIDA)
// Função para renderizar listas de categorias e tags (VERSÃO CORRIGIDA PARA CATEGORIAS)
function renderizarListasCategoriasTags() {
    console.log('🎨 Renderizando listas de categorias e tags...');
    
    // Renderizar Categorias (VERSÃO CORRIGIDA)
    if (elementos.listaCategorias) {
        elementos.listaCategorias.innerHTML = '';
        const categorias = listarCategorias();
        console.log(`📁 Renderizando ${categorias.length} categorias`);
        
        if (categorias.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma categoria cadastrada';
            li.style.color = '#999';
            li.style.fontStyle = 'italic';
            elementos.listaCategorias.appendChild(li);
        }
        
        categorias.forEach(categoria => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.padding = '5px 10px';
            li.style.backgroundColor = '#f8f9fa';
            li.style.borderRadius = '20px';
            li.style.margin = '5px';
            
            // Nome da categoria
            const spanNome = document.createElement('span');
            spanNome.textContent = `${categoria.icone} ${categoria.nome}`;
            
            // Botão remover
            const btnRemover = document.createElement('button');
            btnRemover.textContent = '×';
            btnRemover.style.background = 'none';
            btnRemover.style.border = 'none';
            btnRemover.style.color = '#f72585';
            btnRemover.style.fontSize = '1.2em';
            btnRemover.style.cursor = 'pointer';
            btnRemover.style.padding = '0 5px';
            btnRemover.style.fontWeight = 'bold';
            
            // Adiciona evento diretamente
            btnRemover.onclick = (e) => {
                e.stopPropagation();
                const id = categoria.id;
                const nome = categoria.nome;
                const icone = categoria.icone;
                
                console.log(`🔘 Botão remover clicado para categoria: ${icone} ${nome} (ID: ${id})`);
                
                // Confirmação
                if (confirm(`Remover a categoria "${icone} ${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
                    try {
                        // Verifica se a categoria está sendo usada em alguma despesa
                        const emUso = state.despesas.some(despesa => {
                            const categoriaDespesa = despesa.categoria;
                            return String(categoriaDespesa) === String(id);
                        });
                        
                        if (emUso) {
                            const despesasComCategoria = state.despesas.filter(d => String(d.categoria) === String(id));
                            alert(`⚠️ A categoria "${icone} ${nome}" está sendo usada em ${despesasComCategoria.length} despesa(s)!\n\nRemova ou altere a categoria das despesas primeiro ou confirme para remover mesmo assim.`);
                            
                            if (!confirm(`Deseja remover a categoria "${icone} ${nome}" mesmo assim? As despesas que a usam ficarão sem categoria.`)) {
                                return;
                            }
                        }
                        
                        // Remove a categoria
                        removerCategoria(id);
                        
                        // Atualiza selects
                        atualizarSelectCategorias();
                        
                        // Re-renderiza a lista
                        renderizarListasCategoriasTags();
                        
                        // Se a categoria estava em uso, atualiza as despesas para remover a referência
                        if (emUso) {
                            state.despesas = state.despesas.map(despesa => {
                                if (String(despesa.categoria) === String(id)) {
                                    console.log(`🔄 Removendo categoria da despesa: ${despesa.titulo}`);
                                    return {
                                        ...despesa,
                                        categoria: null
                                    };
                                }
                                return despesa;
                            });
                            // Salva as despesas atualizadas
                            salvarDespesas(state.despesas);
                            render(); // Re-renderiza as despesas
                        }
                        
                        alert(`✅ Categoria "${icone} ${nome}" removida com sucesso!`);
                        
                    } catch (error) {
                        console.error('❌ Erro ao remover categoria:', error);
                        alert(`Erro ao remover categoria: ${error.message}`);
                    }
                }
            };
            
            li.appendChild(spanNome);
            li.appendChild(btnRemover);
            elementos.listaCategorias.appendChild(li);
        });
    }
    
    // Renderizar Tags (mantém o código que já funciona)
    if (elementos.listaTags) {
        elementos.listaTags.innerHTML = '';
        const tags = listarTags();
        console.log(`🏷️ Renderizando ${tags.length} tags`);
        
        if (tags.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma tag cadastrada';
            li.style.color = '#999';
            li.style.fontStyle = 'italic';
            elementos.listaTags.appendChild(li);
        }
        
        tags.forEach(tag => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.padding = '5px 10px';
            li.style.backgroundColor = '#f8f9fa';
            li.style.borderRadius = '20px';
            li.style.margin = '5px';
            
            const spanNome = document.createElement('span');
            spanNome.textContent = `#${tag.nome}`;
            
            const btnRemover = document.createElement('button');
            btnRemover.textContent = '×';
            btnRemover.style.background = 'none';
            btnRemover.style.border = 'none';
            btnRemover.style.color = '#f72585';
            btnRemover.style.fontSize = '1.2em';
            btnRemover.style.cursor = 'pointer';
            btnRemover.style.padding = '0 5px';
            btnRemover.style.fontWeight = 'bold';
            
            btnRemover.onclick = (e) => {
                e.stopPropagation();
                const id = tag.id;
                const nome = tag.nome;
                
                console.log(`🔘 Botão remover clicado para tag: ${nome} (ID: ${id})`);
                
                if (confirm(`Remover a tag "#${nome}"?`)) {
                    try {
                        const tagEmUso = state.despesas.some(despesa => 
                            despesa.tags && despesa.tags.some(tagId => String(tagId) === String(id))
                        );
                        
                        if (tagEmUso) {
                            alert(`⚠️ A tag "#${nome}" está sendo usada em uma ou mais despesas!`);
                            if (!confirm(`Deseja remover a tag "#${nome}" mesmo assim?`)) {
                                return;
                            }
                        }
                        
                        removerTag(id);
                        atualizarSelectTags();
                        renderizarListasCategoriasTags();
                        
                        if (tagEmUso) {
                            state.despesas = state.despesas.map(despesa => {
                                if (despesa.tags && despesa.tags.some(tagId => String(tagId) === String(id))) {
                                    return {
                                        ...despesa,
                                        tags: despesa.tags.filter(tagId => String(tagId) !== String(id))
                                    };
                                }
                                return despesa;
                            });
                            salvarDespesas(state.despesas);
                            render();
                        }
                        
                        alert(`✅ Tag "#${nome}" removida com sucesso!`);
                        
                    } catch (error) {
                        console.error('❌ Erro ao remover tag:', error);
                        alert(`Erro ao remover tag: ${error.message}`);
                    }
                }
            };
            
            li.appendChild(spanNome);
            li.appendChild(btnRemover);
            elementos.listaTags.appendChild(li);
        });
    }
}

window.removerCategoriaHandler = (id) => {
    if (confirm('Remover categoria?')) {
        removerCategoria(id);
        atualizarSelectCategorias();
        renderizarListasCategoriasTags();
    }
};

window.removerTagHandler = (id) => {
    if (confirm('Remover tag?')) {
        removerTag(id);
        atualizarSelectTags();
        renderizarListasCategoriasTags();
    }
};

// ============================================
// EVENT LISTENERS
// ============================================

function registrarEventListeners() {
    console.log('🔌 Registrando event listeners...');
    
    const btnReceita = document.getElementById('btnAdicionarReceita');
    const btnDespesa = document.getElementById('btnAdicionarDespesa');
    const btnCategoria = document.getElementById('btnAdicionarCategoria');
    const btnTag = document.getElementById('btnAdicionarTag');
    const btnTagDespesa = document.getElementById('btnAdicionarTagDespesa');
    const btnLimparFiltro = document.getElementById('btnLimparFiltro');
    const mesFiltro = document.getElementById('mesFiltro');
    const buscaDespesas = document.getElementById('buscaDespesas');
    
    if (btnReceita) btnReceita.onclick = adicionarReceita;
    if (btnDespesa) btnDespesa.onclick = adicionarDespesa;
    
    if (btnCategoria) {
        btnCategoria.onclick = () => {
            const input = document.getElementById('novaCategoria');
            const nome = input?.value;
            if (nome?.trim()) {
                adicionarCategoria(nome.trim());
                atualizarSelectCategorias();
                renderizarListasCategoriasTags();
                input.value = '';
            } else alert('Digite um nome!');
        };
    }
    
    if (btnTag) {
        btnTag.onclick = () => {
            const input = document.getElementById('novaTag');
            const nome = input?.value;
            if (nome?.trim()) {
                adicionarTag(nome.trim());
                atualizarSelectTags();
                renderizarListasCategoriasTags();
                input.value = '';
            } else alert('Digite um nome!');
        };
    }
    
    if (btnTagDespesa) btnTagDespesa.onclick = adicionarTagSelecionada;
    
    if (mesFiltro) {
        mesFiltro.onchange = (e) => {
            state.mesFiltro = e.target.value;
            render();
        };
    }
    
    if (btnLimparFiltro) {
        btnLimparFiltro.onclick = () => {
            if (mesFiltro) mesFiltro.value = '';
            state.mesFiltro = '';
            render();
        };
    }
    
    if (buscaDespesas) {
        let timeoutId;
        buscaDespesas.oninput = (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                state.buscaDespesas = e.target.value;
                render();
            }, 300);
        };
    }
    
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            const modal = document.getElementById('modalEdicao');
            if (modal) modal.style.display = 'none';
        };
    }
    
    window.onclick = (e) => {
        const modal = document.getElementById('modalEdicao');
        if (modal && e.target === modal) modal.style.display = 'none';
    };
}

// ============================================
// FUNÇÕES DE DEBUG
// ============================================

window.debugEstado = function() {
    console.log('🔍 ESTADO ATUAL:');
    console.log('💰 Receitas:', state.receitas.length);
    console.log('💸 Despesas:', state.despesas.length);
    console.log('📁 Categorias Map:', Array.from(categoriasMap.entries()));
    console.log('🏷️ Tags Map:', Array.from(tagsMap.entries()));
    return '✅ Debug concluído';
};

window.limparStorage = function() {
    if (confirm('Limpar todo o localStorage?')) {
        localStorage.clear();
        location.reload();
    }
};

window.sincronizarDespesas = async function() {
    console.log('🔄 Sincronizando despesas...');
    const despesas = await despesaAPIService.sincronizarComLocalStorage();
    state.despesas = despesas;
    render();
    alert(`✅ ${despesas.length} despesas sincronizadas!`);
};

// ============================================
// INICIALIZAÇÃO PRINCIPAL
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando Sistema de Gestão Financeira...');
    
    try {
        await verificarApi();
        initCategorias();
        initTags();
        await carregarDadosIniciais();
        inicializarUI();
        
        // Expõe funções globais
        window.fecharModal = () => {
            const modal = document.getElementById('modalEdicao');
            if (modal) modal.style.display = 'none';
        };
        
        console.log('✅ Sistema iniciado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao iniciar sistema:', error);
        alert('Erro ao iniciar o sistema. Verifique o console.');
    }
});
