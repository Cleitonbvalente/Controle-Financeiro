import { 
    fetchReceitas, 
    addReceitaAPI, 
    deleteReceitaAPI,
    patchReceitaAPI
} from './modules/api.js';

import { 
    Despesa 
} from './modules/despesas.js';

import { 
    initCategorias, 
    adicionarCategoria, 
    removerCategoria, 
    listarCategorias, 
    categoriasMap 
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

// Função utilitária para garantir que data seja string
function garantirDataString(data) {
    if (!data) return '';
    if (data instanceof Date) {
        return data.toISOString().split('T')[0];
    }
    return String(data);
}

// AGUARDA O DOM CARREGAR COMPLETAMENTE
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando Sistema de Gestão Financeira...');
    console.log('📁 Carregando módulos...');
    
    try {
        // Inicializa categorias e tags
        console.log('🔧 Inicializando categorias...');
        initCategorias();
        
        console.log('🔧 Inicializando tags...');
        initTags();
        
        // Carrega dados
        await carregarDadosIniciais();
        
        // Inicializa UI
        inicializarUI();
        
        console.log('✅ Sistema iniciado com sucesso!');
        console.log('📊 Estado inicial:', state);
    } catch (error) {
        console.error('❌ Erro ao iniciar sistema:', error);
        alert('Erro ao iniciar o sistema. Verifique o console para mais detalhes.');
    }
});

// Variáveis globais do estado da aplicação
let state = {
    receitas: [],
    despesas: [],
    mesFiltro: '',
    buscaDespesas: ''
};

// Conversor de moeda
const conversor = criarConversorMoeda();

// Elementos DOM (serão preenchidos depois que o DOM carregar)
let elementos = {};

// Templates
let templateReceita, templateDespesa;

// Função para carregar dados iniciais
async function carregarDadosIniciais() {
    try {
        console.log('📥 Carregando dados iniciais...');
        
        // Carrega receitas da API
        state.receitas = await fetchReceitas();
        console.log('💰 Receitas carregadas:', state.receitas.length);
        
        // Carrega despesas do localStorage
        state.despesas = carregarDespesas();
        console.log('💸 Despesas carregadas:', state.despesas.length);
        
        console.log('📊 Dados carregados:', {
            receitas: state.receitas.length,
            despesas: state.despesas.length
        });
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        state.receitas = [];
        state.despesas = [];
    }
}

// Função para inicializar UI
function inicializarUI() {
    console.log('🎨 Inicializando interface...');
    
    // Busca todos os elementos do DOM
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
    
    // Verifica se os elementos principais foram encontrados
    console.log('🔍 Elementos encontrados:', {
        listaReceitas: !!elementos.listaReceitas,
        listaDespesas: !!elementos.listaDespesas,
        selectCategoria: !!elementos.selectCategoria,
        tagsDisponiveis: !!elementos.tagsDisponiveis
    });
    
    // Busca os templates
    templateReceita = document.querySelector('#templateReceita');
    templateDespesa = document.querySelector('#templateDespesa');
    
    console.log('📋 Templates encontrados:', {
        templateReceita: !!templateReceita,
        templateDespesa: !!templateDespesa
    });
    
    // Verifica se elementos essenciais existem
    if (!elementos.listaReceitas || !elementos.listaDespesas) {
        console.error('❌ Elementos da lista não encontrados!');
        return;
    }
    
    // Atualiza selects
    atualizarSelectCategorias();
    atualizarSelectTags();
    renderizarListasCategoriasTags();
    
    // Registra event listeners
    registrarEventListeners();
    
    // Render inicial
    render();
    
    console.log('✅ Interface inicializada');
}

// Registra todos os event listeners
function registrarEventListeners() {
    console.log('🔌 Registrando event listeners...');
    
    // Botões de adição
    const btnReceita = document.querySelector('#btnAdicionarReceita');
    const btnDespesa = document.querySelector('#btnAdicionarDespesa');
    const btnCategoria = document.querySelector('#btnAdicionarCategoria');
    const btnTag = document.querySelector('#btnAdicionarTag');
    const btnTagDespesa = document.querySelector('#btnAdicionarTagDespesa');
    const btnLimparFiltro = document.querySelector('#btnLimparFiltro');
    
    // Verifica cada botão e adiciona evento
    if (btnReceita) {
        btnReceita.addEventListener('click', adicionarReceita);
        console.log('✅ Botão receita registrado');
    } else {
        console.error('❌ Botão receita não encontrado');
    }
    
    if (btnDespesa) {
        btnDespesa.addEventListener('click', adicionarDespesa);
        console.log('✅ Botão despesa registrado');
    } else {
        console.error('❌ Botão despesa não encontrado');
    }
    
    if (btnCategoria) {
        btnCategoria.addEventListener('click', () => {
            const nome = document.querySelector('#novaCategoria')?.value;
            if (nome && nome.trim() !== '') {
                adicionarCategoria(nome.trim());
                atualizarSelectCategorias();
                renderizarListasCategoriasTags();
                document.querySelector('#novaCategoria').value = '';
            } else {
                alert('Digite um nome para a categoria!');
            }
        });
        console.log('✅ Botão categoria registrado');
    }
    
    if (btnTag) {
        btnTag.addEventListener('click', () => {
            const nome = document.querySelector('#novaTag')?.value;
            if (nome && nome.trim() !== '') {
                adicionarTag(nome.trim());
                atualizarSelectTags();
                renderizarListasCategoriasTags();
                document.querySelector('#novaTag').value = '';
            } else {
                alert('Digite um nome para a tag!');
            }
        });
        console.log('✅ Botão tag registrado');
    }
    
    // Tags em despesas
    if (btnTagDespesa) {
        btnTagDespesa.addEventListener('click', adicionarTagSelecionada);
        console.log('✅ Botão adicionar tag registrado');
    }
    
    // Filtros
    if (elementos.mesFiltro) {
        elementos.mesFiltro.addEventListener('change', (e) => {
            state.mesFiltro = e.target.value;
            console.log('📅 Filtro por mês:', state.mesFiltro);
            render();
        });
    }
    
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', () => {
            if (elementos.mesFiltro) {
                elementos.mesFiltro.value = '';
            }
            state.mesFiltro = '';
            console.log('🔄 Filtro limpo');
            render();
        });
    }
    
    // Busca
    if (elementos.buscaDespesas) {
        let timeoutId;
        elementos.buscaDespesas.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                state.buscaDespesas = e.target.value.toLowerCase();
                console.log('🔍 Busca:', state.buscaDespesas);
                render();
            }, 300);
        });
    }
    
    // Modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', fecharModal);
    }
    
    window.addEventListener('click', (e) => {
        if (elementos.modal && e.target === elementos.modal) {
            fecharModal();
        }
    });
}

// Função para renderizar a interface
function render() {
    if (!elementos.listaReceitas || !elementos.listaDespesas) return;
    
    console.log('🔄 Renderizando interface...');
    renderReceitas();
    renderDespesas();
    atualizarBalanco();
}

// Renderiza receitas
function renderReceitas() {
    elementos.listaReceitas.innerHTML = '';
    
    let receitasFiltradas = [...state.receitas];
    
    // Filtra por mês
    if (state.mesFiltro) {
        receitasFiltradas = receitasFiltradas.filter(r => 
            r.data && r.data.startsWith(state.mesFiltro)
        );
    }
    
    // Ordena por data
    receitasFiltradas.sort((a, b) => {
        if (!a.data) return 1;
        if (!b.data) return -1;
        return new Date(b.data) - new Date(a.data);
    });
    
    // Renderiza cada receita
    for (const receita of receitasFiltradas) {
        if (!templateReceita) continue;
        
        const clone = templateReceita.content.cloneNode(true);
        const item = clone.querySelector('.item-card');
        
        item.querySelector('.item-titulo').textContent = receita.titulo || 'Sem título';
        item.querySelector('.item-descricao').textContent = receita.descricao || 'Sem descrição';
        item.querySelector('.item-data').textContent = receita.data ? new Date(receita.data).toLocaleDateString('pt-BR') : 'Sem data';
        item.querySelector('.item-valor').textContent = conversor.formatarValor(receita.valor || 0, receita.moeda || 'BRL');
        
        const btnEdit = item.querySelector('.btn-edit');
        const btnDelete = item.querySelector('.btn-delete');
        
        btnEdit.dataset.id = receita.id;
        btnDelete.dataset.id = receita.id;
        
        btnEdit.onclick = () => abrirModalEdicaoReceita(receita.id);
        btnDelete.onclick = () => removerReceita(receita.id);
        
        elementos.listaReceitas.appendChild(clone);
    }
    
    // Atualiza total
    const total = receitasFiltradas.reduce((acc, r) => acc + (r.valor || 0), 0);
    if (elementos.totalReceitas) {
        elementos.totalReceitas.textContent = conversor.formatarValor(total, 'BRL');
    }
}

// Renderiza despesas
function renderDespesas() {
    elementos.listaDespesas.innerHTML = '';
    
    let despesasFiltradas = [...state.despesas];
    
    // FILTRA POR MÊS
    if (state.mesFiltro) {
        despesasFiltradas = despesasFiltradas.filter(d => {
            if (!d.data) return false;
            const dataString = garantirDataString(d.data);
            return dataString.startsWith(state.mesFiltro);
        });
    }
    
    // Filtra por busca
    if (state.buscaDespesas) {
        despesasFiltradas = despesasFiltradas.filter(d => 
            (d.titulo && d.titulo.toLowerCase().includes(state.buscaDespesas)) ||
            (d.descricao && d.descricao.toLowerCase().includes(state.buscaDespesas))
        );
    }
    
    // Ordena por data
    despesasFiltradas.sort((a, b) => {
        if (!a.data) return 1;
        if (!b.data) return -1;
        
        const dataA = new Date(garantirDataString(a.data));
        const dataB = new Date(garantirDataString(b.data));
        
        return dataB - dataA;
    });
    
    console.log(`📋 Renderizando ${despesasFiltradas.length} despesas`);
    
    // Renderiza cada despesa
    despesasFiltradas.forEach(despesa => {
        if (!templateDespesa) return;
        
        // VERIFICA SE O MÉTODO EXISTE
        if (typeof despesa.formatarExibicao !== 'function') {
            console.error('❌ Despesa sem método formatarExibicao:', despesa);
            return;
        }
        
        const clone = templateDespesa.content.cloneNode(true);
        const item = clone.querySelector('.item-card');
        
        const formatado = despesa.formatarExibicao(categoriasMap, tagsMap);
        
        // Preenche os dados
        item.querySelector('.item-titulo').textContent = formatado.titulo;
        item.querySelector('.item-descricao').textContent = formatado.descricao;
        item.querySelector('.item-categoria').textContent = formatado.categoria;
        item.querySelector('.item-data').textContent = formatado.data;
        item.querySelector('.item-status').textContent = formatado.status;
        item.querySelector('.item-valor').textContent = formatado.valorPrevisto;
        
        // Adiciona tags
        const tagsContainer = item.querySelector('.item-tags');
        tagsContainer.innerHTML = ''; // Limpa tags anteriores
        
        if (despesa.tags && despesa.tags.length > 0) {
            despesa.tags.forEach(tagId => {
                const tag = tagsMap.get(tagId);
                if (tag) {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'item-tag';
                    tagSpan.textContent = tag.nome;
                    tagsContainer.appendChild(tagSpan);
                }
            });
        }
        
        // Configura botões
        const btnEdit = item.querySelector('.btn-edit');
        const btnDelete = item.querySelector('.btn-delete');
        
        btnEdit.dataset.id = despesa.id;
        btnDelete.dataset.id = despesa.id;
        
        btnEdit.onclick = () => abrirModalEdicaoDespesa(despesa.id);
        btnDelete.onclick = () => removerDespesa(despesa.id);
        
        elementos.listaDespesas.appendChild(clone);
    });
    
    // Atualiza total
    const total = despesasFiltradas.reduce((acc, d) => {
        return acc + (d.getValorBalanco ? d.getValorBalanco() : (d.valorPrevisto || 0));
    }, 0);
    
    if (elementos.totalDespesas) {
        elementos.totalDespesas.textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Atualiza balanço do mês
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
    
    const totalReceitas = receitasMes.reduce((acc, r) => acc + (r.valorConvertido || r.valor || 0), 0);
    const totalDespesas = despesasMes.reduce((acc, d) => acc + (d.getValorBalanco ? d.getValorBalanco() : (d.valorPrevisto || 0)), 0);
    const saldo = totalReceitas - totalDespesas;
    
    if (elementos.totalReceitasMes) {
        elementos.totalReceitasMes.textContent = `R$ ${totalReceitas.toFixed(2)}`;
    }
    if (elementos.totalDespesasMes) {
        elementos.totalDespesasMes.textContent = `R$ ${totalDespesas.toFixed(2)}`;
    }
    if (elementos.saldoMes) {
        elementos.saldoMes.textContent = `R$ ${saldo.toFixed(2)}`;
        elementos.saldoMes.style.color = saldo >= 0 ? '#4cc9f0' : '#f72585';
    }
}

// Adicionar receita
async function adicionarReceita() {
    console.log('📝 Tentando adicionar receita...');
    
    try {
        const titulo = document.querySelector('#tituloReceita')?.value;
        const descricao = document.querySelector('#descricaoReceita')?.value;
        const valor = document.querySelector('#valorReceita')?.value;
        const moeda = document.querySelector('#moedaReceita')?.value;
        const data = document.querySelector('#dataReceita')?.value;
        
        console.log('📦 Dados da receita:', { titulo, descricao, valor, moeda, data });
        
        if (!titulo || titulo.trim() === '') {
            alert('Preencha o título da receita!');
            return;
        }
        
        if (!valor || valor <= 0) {
            alert('Preencha o valor da receita!');
            return;
        }
        
        if (!data) {
            alert('Preencha a data da receita!');
            return;
        }
        
        const novaReceita = {
            titulo: titulo.trim(),
            descricao: descricao || '',
            valor: Number(valor),
            moeda: moeda || 'BRL',
            data
        };
        
        // Salva na API
        const receitaSalva = await addReceitaAPI(novaReceita);
        console.log('✅ Receita salva na API:', receitaSalva);
        
        // Atualiza estado
        state.receitas = [...state.receitas, receitaSalva];
        
        // Limpa formulário
        document.querySelector('#tituloReceita').value = '';
        document.querySelector('#descricaoReceita').value = '';
        document.querySelector('#valorReceita').value = '';
        document.querySelector('#dataReceita').value = '';
        
        render();
        
        console.log('✅ Receita adicionada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar receita:', error);
        alert(`Erro ao adicionar receita: ${error.message}`);
    }
}

// Adicionar despesa
// Adicionar despesa (VERSÃO CORRIGIDA)
function adicionarDespesa() {
    console.log('📝 Tentando adicionar despesa...');
    console.log('📁 Estado atual das categorias:', Array.from(categoriasMap.entries()));
    
    try {
        // Pega os valores do formulário
        const titulo = document.querySelector('#tituloDespesa')?.value;
        const descricao = document.querySelector('#descricaoDespesa')?.value;
        const valorPrevisto = document.querySelector('#valorPrevistoDespesa')?.value;
        const valorReal = document.querySelector('#valorRealDespesa')?.value;
        const categoriaId = document.querySelector('#categoriaDespesa')?.value;
        const data = document.querySelector('#dataDespesa')?.value;
        const status = document.querySelector('#statusDespesa')?.value;
        
        console.log('📦 Dados do formulário:', {
            titulo, 
            descricao, 
            valorPrevisto, 
            valorReal, 
            categoriaId, 
            data, 
            status
        });
        
        // Pega tags selecionadas
        const tagElements = document.querySelectorAll('#tagsSelecionadas .tag-item[data-id]');
        const tagsSelecionadas = Array.from(tagElements).map(el => {
            return el.dataset.id;
        });
        
        console.log('🏷️ Tags selecionadas:', tagsSelecionadas);
        
        // VALIDAÇÕES
        if (!titulo || titulo.trim() === '') {
            alert('Preencha o título da despesa!');
            return;
        }
        
        if (!valorPrevisto || parseFloat(valorPrevisto) <= 0) {
            alert('Preencha um valor previsto válido!');
            return;
        }
        
        if (!categoriaId || categoriaId === '') {
            alert('Selecione uma categoria!');
            console.log('⚠️ Nenhuma categoria selecionada');
            return;
        }
        
        if (!data) {
            alert('Preencha a data da despesa!');
            return;
        }
        
        // VERIFICAÇÃO CRÍTICA DA CATEGORIA
        console.log('🔍 Verificando categoria ID:', categoriaId);
        console.log('📁 Tipo do ID:', typeof categoriaId);
        
        // Tenta encontrar a categoria no Map
        let categoriaObj = categoriasMap.get(categoriaId);
        
        // Se não encontrou, tenta converter para número (caso o ID seja número)
        if (!categoriaObj && !isNaN(categoriaId)) {
            const numId = Number(categoriaId);
            categoriaObj = categoriasMap.get(numId);
            console.log('🔄 Tentando com ID numérico:', numId);
        }
        
        // Se ainda não encontrou, lista todas as categorias disponíveis
        if (!categoriaObj) {
            console.error('❌ Categoria NÃO encontrada no Map!');
            console.log('📁 Categorias disponíveis:', Array.from(categoriasMap.entries()));
            
            // Tenta recarregar as categorias
            console.log('🔄 Tentando recarregar categorias...');
            const { recarregarCategorias } = require('./modules/categorias.js');
            const categoriasRecarregadas = recarregarCategorias();
            console.log('📁 Categorias após recarregar:', categoriasRecarregadas);
            
            // Tenta buscar novamente
            categoriaObj = categoriasMap.get(categoriaId);
            
            if (!categoriaObj) {
                alert('Categoria inválida! Por favor, recarregue a página e tente novamente.');
                return;
            }
        }
        
        console.log('✅ Categoria válida encontrada:', categoriaObj);
        
        // Cria nova despesa
        const novaDespesa = new Despesa(
            titulo.trim(), 
            descricao || '', 
            parseFloat(valorPrevisto), 
            valorReal ? parseFloat(valorReal) : null, 
            categoriaId, // Passa o ID da categoria
            tagsSelecionadas, 
            data, 
            status || 'nao_paga'
        );
        
        console.log('💰 Nova despesa criada:', novaDespesa);
        
        // Atualiza estado
        state.despesas = [...state.despesas, novaDespesa];
        
        // Salva no localStorage
        salvarDespesas(state.despesas);
        console.log('💾 Despesas salvas no localStorage. Total:', state.despesas.length);
        
        // Limpa formulário
        document.querySelector('#tituloDespesa').value = '';
        document.querySelector('#descricaoDespesa').value = '';
        document.querySelector('#valorPrevistoDespesa').value = '';
        document.querySelector('#valorRealDespesa').value = '';
        document.querySelector('#dataDespesa').value = '';
        document.querySelector('#tagsSelecionadas').innerHTML = '';
        document.querySelector('#categoriaDespesa').value = '';
        document.querySelector('#statusDespesa').value = 'nao_paga';
        
        // Renderiza novamente
        render();
        
        console.log('✅ Despesa adicionada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar despesa:', error);
        alert(`Erro ao adicionar despesa: ${error.message}`);
    }
}

// Função para adicionar tag selecionada à despesa
function adicionarTagSelecionada() {
    console.log('🏷️ Tentando adicionar tag à despesa...');
    
    const select = elementos.tagsDisponiveis;
    if (!select) {
        console.error('❌ Select de tags não encontrado');
        alert('Erro: select de tags não encontrado');
        return;
    }
    
    const tagId = select.value;
    console.log('🏷️ Tag selecionada ID:', tagId);
    
    if (!tagId || tagId === '') {
        alert('Selecione uma tag primeiro!');
        return;
    }
    
    const tag = tagsMap.get(tagId);
    console.log('🏷️ Tag encontrada no Map:', tag);
    
    if (!tag) {
        console.error('❌ Tag não encontrada no Map:', tagId);
        console.log('🏷️ Tags disponíveis:', Array.from(tagsMap.entries()));
        alert('Tag não encontrada! Tente recarregar a página.');
        return;
    }
    
    // Verifica se já foi adicionada
    const tagExistente = document.querySelector(`#tagsSelecionadas .tag-item[data-id="${tagId}"]`);
    if (tagExistente) {
        alert('Tag já adicionada!');
        return;
    }
    
    // Cria o elemento da tag
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.dataset.id = tagId;
    tagElement.innerHTML = `
        ${tag.nome}
        <button type="button" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Adiciona ao container
    elementos.tagsSelecionadas.appendChild(tagElement);
    console.log('✅ Tag adicionada ao container:', tag.nome);
    
    // Limpa a seleção
    select.value = '';
}

// Atualiza select de categorias
function atualizarSelectCategorias() {
    const select = elementos.selectCategoria;
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    const categorias = listarCategorias();
    console.log('📁 Atualizando select com categorias:', categorias);
    
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = `${categoria.icone} ${categoria.nome}`;
        select.appendChild(option);
    });
}

// Atualiza select de tags
function atualizarSelectTags() {
    const select = elementos.tagsDisponiveis;
    if (!select) return;
    
    select.innerHTML = '';
    
    const tags = listarTags();
    console.log('🏷️ Atualizando select com tags:', tags);
    
    tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.nome;
        select.appendChild(option);
    });
}

// Renderiza listas de categorias e tags
function renderizarListasCategoriasTags() {
    // Categorias
    if (elementos.listaCategorias) {
        elementos.listaCategorias.innerHTML = '';
        listarCategorias().forEach(categoria => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${categoria.icone} ${categoria.nome}
                <button onclick="removerCategoriaHandler('${categoria.id}')">×</button>
            `;
            elementos.listaCategorias.appendChild(li);
        });
    }
    
    // Tags
    if (elementos.listaTags) {
        elementos.listaTags.innerHTML = '';
        listarTags().forEach(tag => {
            const li = document.createElement('li');
            li.innerHTML = `
                #${tag.nome}
                <button onclick="removerTagHandler('${tag.id}')">×</button>
            `;
            elementos.listaTags.appendChild(li);
        });
    }
}

// Handlers para remoção
window.removerCategoriaHandler = (id) => {
    if (confirm('Remover esta categoria?')) {
        removerCategoria(id);
        atualizarSelectCategorias();
        renderizarListasCategoriasTags();
    }
};

window.removerTagHandler = (id) => {
    if (confirm('Remover esta tag?')) {
        removerTag(id);
        atualizarSelectTags();
        renderizarListasCategoriasTags();
    }
};

// Funções de remoção
async function removerReceita(id) {
    if (!confirm('Deseja realmente remover esta receita?')) return;
    
    try {
        await deleteReceitaAPI(id);
        state.receitas = state.receitas.filter(r => r.id !== id);
        render();
    } catch (error) {
        console.error('❌ Erro ao remover receita:', error);
        alert('Erro ao remover receita. Tente novamente.');
    }
}

function removerDespesa(id) {
    if (!confirm('Deseja realmente remover esta despesa?')) return;
    
    state.despesas = state.despesas.filter(d => d.id !== id);
    salvarDespesas(state.despesas);
    render();
}

// Modal de edição
function abrirModalEdicaoReceita(id) {
    const receita = state.receitas.find(r => r.id === id);
    if (!receita || !elementos.modal || !elementos.modalContent) return;
    
    elementos.modalContent.innerHTML = `
        <h2>Editar Receita</h2>
        <input type="text" id="editTitulo" value="${receita.titulo || ''}" placeholder="Título">
        <textarea id="editDescricao" placeholder="Descrição">${receita.descricao || ''}</textarea>
        <div class="form-row">
            <input type="number" id="editValor" value="${receita.valor || 0}" placeholder="Valor">
            <select id="editMoeda">
                <option value="BRL" ${receita.moeda === 'BRL' ? 'selected' : ''}>R$ Real</option>
                <option value="USD" ${receita.moeda === 'USD' ? 'selected' : ''}>US$ Dólar</option>
                <option value="EUR" ${receita.moeda === 'EUR' ? 'selected' : ''}>€ Euro</option>
            </select>
        </div>
        <input type="date" id="editData" value="${receita.data || ''}">
        <button onclick="salvarEdicaoReceita('${id}')" class="btn-primary">Salvar</button>
        <button onclick="fecharModal()" class="btn-secondary">Cancelar</button>
    `;
    
    elementos.modal.style.display = 'block';
}

function abrirModalEdicaoDespesa(id) {
    const despesa = state.despesas.find(d => d.id === id);
    if (!despesa || !elementos.modal || !elementos.modalContent) return;
    
    const categoriasOptions = listarCategorias().map(cat => 
        `<option value="${cat.id}" ${despesa.categoria === cat.id ? 'selected' : ''}>${cat.icone} ${cat.nome}</option>`
    ).join('');
    
    elementos.modalContent.innerHTML = `
        <h2>Editar Despesa</h2>
        <input type="text" id="editTitulo" value="${despesa.titulo || ''}" placeholder="Título">
        <textarea id="editDescricao" placeholder="Descrição">${despesa.descricao || ''}</textarea>
        <div class="form-row">
            <input type="number" id="editValorPrevisto" value="${despesa.valorPrevisto || 0}" placeholder="Valor Previsto">
            <input type="number" id="editValorReal" value="${despesa.valorReal || ''}" placeholder="Valor Real">
        </div>
        <select id="editCategoria">
            <option value="">Selecione uma categoria</option>
            ${categoriasOptions}
        </select>
        <input type="date" id="editData" value="${despesa.data || ''}">
        <select id="editStatus">
            <option value="nao_paga" ${despesa.status === 'nao_paga' ? 'selected' : ''}>Não Paga</option>
            <option value="paga" ${despesa.status === 'paga' ? 'selected' : ''}>Paga</option>
        </select>
        <button onclick="salvarEdicaoDespesa('${id}')" class="btn-primary">Salvar</button>
        <button onclick="fecharModal()" class="btn-secondary">Cancelar</button>
    `;
    
    elementos.modal.style.display = 'block';
}

async function salvarEdicaoReceita(id) {
    try {
        const titulo = document.querySelector('#editTitulo')?.value;
        const descricao = document.querySelector('#editDescricao')?.value;
        const valor = document.querySelector('#editValor')?.value;
        const moeda = document.querySelector('#editMoeda')?.value;
        const data = document.querySelector('#editData')?.value;
        
        const updates = {
            titulo,
            descricao,
            valor: Number(valor),
            moeda,
            data
        };
        
        const receitaAtualizada = await patchReceitaAPI(id, updates);
        
        state.receitas = state.receitas.map(r => 
            r.id === id ? { ...r, ...updates } : r
        );
        
        fecharModal();
        render();
    } catch (error) {
        console.error('❌ Erro ao editar receita:', error);
        alert('Erro ao editar receita. Tente novamente.');
    }
}

function salvarEdicaoDespesa(id) {
    const titulo = document.querySelector('#editTitulo')?.value;
    const descricao = document.querySelector('#editDescricao')?.value;
    const valorPrevisto = document.querySelector('#editValorPrevisto')?.value;
    const valorReal = document.querySelector('#editValorReal')?.value;
    const categoria = document.querySelector('#editCategoria')?.value;
    const data = document.querySelector('#editData')?.value;
    const status = document.querySelector('#editStatus')?.value;
    
    state.despesas = state.despesas.map(d => 
        d.id === id 
            ? { 
                ...d, 
                titulo, 
                descricao, 
                valorPrevisto: Number(valorPrevisto),
                valorReal: valorReal ? Number(valorReal) : null,
                categoria, 
                data, 
                status 
              }
            : d
    );
    
    salvarDespesas(state.despesas);
    fecharModal();
    render();
}

function fecharModal() {
    if (elementos.modal) {
        elementos.modal.style.display = 'none';
    }
    if (elementos.modalContent) {
        elementos.modalContent.innerHTML = '';
    }
}

// FUNÇÕES DE DEBUG (acessíveis pelo console)
window.debugEstado = function() {
    console.log('🔍 ESTADO ATUAL:');
    console.log('💰 Receitas:', state.receitas.length);
    console.log('💸 Despesas:', state.despesas.length);
    console.log('📁 Categorias Map:', Array.from(categoriasMap.entries()));
    console.log('🏷️ Tags Map:', Array.from(tagsMap.entries()));
    
    if (state.despesas.length > 0) {
        console.log('🎨 Testando formatação da primeira despesa:');
        const primeira = state.despesas[0];
        const formatado = primeira.formatarExibicao(categoriasMap, tagsMap);
        console.log('✅ Formatado:', formatado);
    }
    return '✅ Debug concluído';
};

window.limparStorage = function() {
    if (confirm('Limpar todo o localStorage? Isso apagará todas as despesas, categorias e tags!')) {
        localStorage.clear();
        console.log('🧹 localStorage limpo');
        location.reload();
    }
};

// Expõe funções globalmente para os templates
window.removerReceita = removerReceita;
window.removerDespesa = removerDespesa;
window.editarReceita = abrirModalEdicaoReceita;
window.editarDespesa = abrirModalEdicaoDespesa;
window.fecharModal = fecharModal;
window.salvarEdicaoReceita = salvarEdicaoReceita;
window.salvarEdicaoDespesa = salvarEdicaoDespesa;

console.log('📝 App.js carregado com sucesso!');
