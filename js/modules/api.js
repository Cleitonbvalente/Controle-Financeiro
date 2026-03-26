/**
 * Módulo de comunicação com a API JSON Server
 * Contém todas as funções para CRUD de receitas
 * Utiliza fetch com async/await e try/catch para tratamento de erros
 */

// URL base da API (json-server)
const API_URL = 'http://localhost:3000';

/**
 * CLOSURE: Função que retorna um objeto com métodos para fazer requisições
 * Contador de requisições é mantido no escopo da closure
 */
export function criarApiClient() {
    // Variável preservada pela closure
    let totalRequisicoes = 0;
    let historicoRequisicoes = [];
    
    /**
     * Função interna que tem acesso à variável totalRequisicoes
     * Isso é um exemplo de CLOSURE
     */
    async function fazerRequisicao(endpoint, options = {}) {
        // Incrementa o contador (closure)
        totalRequisicoes++;
        
        const url = `${API_URL}${endpoint}`;
        const requestInfo = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };
        
        // Adiciona body se existir e não for GET
        if (options.body && requestInfo.method !== 'GET') {
            requestInfo.body = JSON.stringify(options.body);
        }
        
        console.log(`📡 Requisição #${totalRequisicoes}: ${requestInfo.method} ${url}`);
        
        try {
            // ARROW FUNCTION dentro de TRY..CATCH
            const response = await fetch(url, requestInfo);
            
            // Verifica se a resposta foi bem sucedida
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Para DELETE, não há conteúdo
            if (requestInfo.method === 'DELETE') {
                historicoRequisicoes.push({
                    id: totalRequisicoes,
                    metodo: requestInfo.method,
                    url,
                    status: response.status,
                    data: new Date().toISOString()
                });
                return { success: true };
            }
            
            // Para outros métodos, retorna o JSON
            const data = await response.json();
            
            // Salva no histórico (usando spread operator)
            historicoRequisicoes = [
                ...historicoRequisicoes,
                {
                    id: totalRequisicoes,
                    metodo: requestInfo.method,
                    url,
                    status: response.status,
                    data: new Date().toISOString()
                }
            ];
            
            return data;
            
        } catch (error) {
            console.error(`❌ Erro na requisição #${totalRequisicoes}:`, error);
            
            // RELANÇA o erro para ser tratado por quem chamou
            throw new Error(`Falha na comunicação com a API: ${error.message}`);
        }
    }
    
    // Retorna um objeto com métodos (classe simulada)
    return {
        // Método para obter estatísticas (usa closure)
        getEstatisticas: () => ({
            totalRequisicoes,
            historico: [...historicoRequisicoes] // spread operator
        }),
        
        // Métodos CRUD para receitas
        getReceitas: () => fazerRequisicao('/receitas'),
        
        getReceita: (id) => fazerRequisicao(`/receitas/${id}`),
        
        createReceita: (receita) => fazerRequisicao('/receitas', {
            method: 'POST',
            body: receita
        }),
        
        updateReceita: (id, receita) => fazerRequisicao(`/receitas/${id}`, {
            method: 'PUT',
            body: receita
        }),
        
        patchReceita: (id, updates) => fazerRequisicao(`/receitas/${id}`, {
            method: 'PATCH',
            body: updates
        }),
        
        deleteReceita: (id) => fazerRequisicao(`/receitas/${id}`, {
            method: 'DELETE'
        })
    };
}

// Cria uma instância do cliente API (usando a CLOSURE)
const apiClient = criarApiClient();

/**
 * FUNÇÕES INDIVIDUAIS PARA CADA OPERAÇÃO
 * Usam a apiClient criada acima
 */

// GET - Buscar todas as receitas
export async function fetchReceitas() {
    console.log('📥 Buscando todas as receitas...');
    
    try {
        // Usa o método da apiClient
        const receitas = await apiClient.getReceitas();
        
        // MAP: Converte datas string para objetos Date se necessário
        const receitasFormatadas = receitas.map(receita => ({
            ...receita, // spread operator
            dataOriginal: receita.data,
            data: new Date(receita.data)
        }));
        
        console.log(`✅ ${receitas.length} receitas encontradas`);
        return receitasFormatadas;
        
    } catch (error) {
        console.error('❌ Erro ao buscar receitas:', error);
        // Retorna array vazio em caso de erro (graceful degradation)
        return [];
    }
}

// GET - Buscar uma receita específica
export async function fetchReceita(id) {
    console.log(`📥 Buscando receita ${id}...`);
    
    try {
        const receita = await apiClient.getReceita(id);
        
        if (!receita) {
            throw new Error('Receita não encontrada');
        }
        
        return {
            ...receita, // spread operator
            data: new Date(receita.data)
        };
        
    } catch (error) {
        console.error(`❌ Erro ao buscar receita ${id}:`, error);
        throw error; // Relança para ser tratado por quem chamou
    }
}

// POST - Adicionar nova receita
export async function addReceitaAPI(receita) {
    console.log('📤 Adicionando nova receita:', receita);
    
    try {
        // Validação dos dados
        if (!receita.titulo || !receita.valor || !receita.data) {
            throw new Error('Dados incompletos: título, valor e data são obrigatórios');
        }
        
        // Garante que a receita tenha todos os campos necessários
        const novaReceita = {
            titulo: receita.titulo,
            descricao: receita.descricao || '',
            valor: Number(receita.valor),
            moeda: receita.moeda || 'BRL',
            data: receita.data,
            // TEMPLATE LITERAL para criar ID temporário (substituído pela API)
            tempId: `temp_${Date.now()}`
        };
        
        // Envia para a API
        const receitaCriada = await apiClient.createReceita(novaReceita);
        
        console.log('✅ Receita adicionada com sucesso:', receitaCriada);
        return receitaCriada;
        
    } catch (error) {
        console.error('❌ Erro ao adicionar receita:', error);
        throw error; // Relança para tratamento na UI
    }
}

// PUT - Atualizar receita completa
export async function updateReceitaAPI(id, receita) {
    console.log(`📤 Atualizando receita ${id} (completa):`, receita);
    
    try {
        if (!id) {
            throw new Error('ID não fornecido para atualização');
        }
        
        // Verifica se a receita existe primeiro
        const existe = await apiClient.getReceita(id).catch(() => null);
        if (!existe) {
            throw new Error(`Receita ${id} não encontrada`);
        }
        
        // FORMAT: Garante que todos os campos obrigatórios existem
        const receitaAtualizada = {
            id, // Mantém o ID original
            titulo: receita.titulo,
            descricao: receita.descricao || '',
            valor: Number(receita.valor),
            moeda: receita.moeda || 'BRL',
            data: receita.data
        };
        
        const resultado = await apiClient.updateReceita(id, receitaAtualizada);
        
        console.log('✅ Receita atualizada com sucesso:', resultado);
        return resultado;
        
    } catch (error) {
        console.error(`❌ Erro ao atualizar receita ${id}:`, error);
        throw error;
    }
}

// PATCH - Atualização parcial da receita
export async function patchReceitaAPI(id, updates) {
    console.log(`📤 Atualizando receita ${id} (parcial):`, updates);
    
    try {
        if (!id) {
            throw new Error('ID não fornecido para atualização parcial');
        }
        
        // Validação: pelo menos um campo para atualizar
        if (Object.keys(updates).length === 0) {
            throw new Error('Nenhum campo fornecido para atualização');
        }
        
        // FILTER: Remove campos undefined ou null
        const updatesFiltrados = Object.keys(updates)
            .filter(key => updates[key] !== undefined && updates[key] !== null)
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});
        
        // Converte valor para número se existir
        if (updatesFiltrados.valor) {
            updatesFiltrados.valor = Number(updatesFiltrados.valor);
        }
        
        console.log('📦 Updates filtrados:', updatesFiltrados);
        
        const resultado = await apiClient.patchReceita(id, updatesFiltrados);
        
        console.log('✅ Receita atualizada parcialmente:', resultado);
        return resultado;
        
    } catch (error) {
        console.error(`❌ Erro na atualização parcial da receita ${id}:`, error);
        throw error;
    }
}

// DELETE - Remover receita
export async function deleteReceitaAPI(id) {
    console.log(`🗑️ Removendo receita ${id}...`);
    
    try {
        if (!id) {
            throw new Error('ID não fornecido para remoção');
        }
        
        // Confirma que a receita existe antes de deletar
        const receita = await apiClient.getReceita(id).catch(() => null);
        if (!receita) {
            console.log(`⚠️ Receita ${id} não encontrada, pode já ter sido removida`);
            return { success: true, message: 'Receita já removida' };
        }
        
        const resultado = await apiClient.deleteReceita(id);
        
        console.log(`✅ Receita ${id} removida com sucesso`);
        return resultado;
        
    } catch (error) {
        console.error(`❌ Erro ao remover receita ${id}:`, error);
        throw error;
    }
}

/**
 * FUNÇÕES AUXILIARES
 */

// Função para verificar saúde da API
export async function verificarApiSaude() {
    console.log('🏥 Verificando saúde da API...');
    
    try {
        const start = Date.now();
        const response = await fetch(`${API_URL}/receitas?_limit=1`);
        const latency = Date.now() - start;
        
        if (response.ok) {
            console.log(`✅ API saudável (latência: ${latency}ms)`);
            return {
                saudavel: true,
                latencia: latency,
                status: response.status
            };
        } else {
            throw new Error(`Status ${response.status}`);
        }
    } catch (error) {
        console.error('❌ API indisponível:', error);
        return {
            saudavel: false,
            erro: error.message
        };
    }
}

// Função para obter estatísticas da API Client (usando a closure)
export function getApiStats() {
    const stats = apiClient.getEstatisticas();
    console.log('📊 Estatísticas da API:', stats);
    return stats;
}

/**
 * EXEMPLO DE USO DE MAP COM API
 * Mapa de cache para evitar requisições desnecessárias
 */
const cacheReceitas = new Map();

export async function fetchReceitaComCache(id) {
    // Verifica se está no cache (uso do Map)
    if (cacheReceitas.has(id)) {
        console.log(`🎯 Receita ${id} encontrada no cache`);
        return cacheReceitas.get(id);
    }
    
    // Se não estiver no cache, busca da API
    console.log(`🔄 Buscando receita ${id} da API (cache miss)`);
    const receita = await fetchReceita(id);
    
    // Armazena no cache (Map)
    cacheReceitas.set(id, receita);
    
    return receita;
}

// Função para limpar cache
export function limparCacheReceitas() {
    cacheReceitas.clear();
    console.log('🧹 Cache de receitas limpo');
}

// Exporta também o cliente para uso direto se necessário
export default apiClient;
