// js/services/despesaAPIService.js
const API_URL = 'http://localhost:3000';

/**
 * Serviço para gerenciar despesas via JSON Server
 * Mantém sincronia com localStorage como fallback
 */
export const despesaAPIService = {
    // Buscar todas as despesas da API
    async listar() {
        try {
            console.log('📥 Buscando despesas da API...');
            const response = await fetch(`${API_URL}/despesas`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const despesas = await response.json();
            console.log(`✅ ${despesas.length} despesas encontradas na API`);
            return despesas;
        } catch (error) {
            console.error('❌ Erro ao buscar despesas da API:', error);
            return [];
        }
    },
    
    // Buscar despesa por ID
    async buscarPorId(id) {
        try {
            console.log(`📥 Buscando despesa ${id}...`);
            
            // Converte para número se necessário
            const idNumerico = Number(id);
            if (isNaN(idNumerico)) {
                throw new Error(`ID inválido: ${id}`);
            }
            
            const response = await fetch(`${API_URL}/despesas/${idNumerico}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`⚠️ Despesa ${id} não encontrada`);
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const despesa = await response.json();
            console.log(`✅ Despesa ${id} encontrada:`, despesa);
            return despesa;
        } catch (error) {
            console.error(`❌ Erro ao buscar despesa ${id}:`, error);
            return null;
        }
    },
    
    // Adicionar despesa na API
    async adicionar(despesa) {
        try {
            console.log('📤 Adicionando despesa na API:', despesa);
            
            // Valida os dados antes de enviar
            if (!despesa.titulo || !despesa.valorPrevisto || !despesa.data) {
                throw new Error('Dados incompletos: título, valor previsto e data são obrigatórios');
            }
            
            const response = await fetch(`${API_URL}/despesas`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(despesa)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const novaDespesa = await response.json();
            console.log('✅ Despesa adicionada na API:', novaDespesa);
            return novaDespesa;
        } catch (error) {
            console.error('❌ Erro ao adicionar despesa na API:', error);
            throw error;
        }
    },
    
    // Atualizar despesa completa na API
    async atualizar(id, despesa) {
        try {
            console.log(`📤 Atualizando despesa ${id} na API...`);
            
            // Converte para número se necessário
            const idNumerico = Number(id);
            if (isNaN(idNumerico)) {
                throw new Error(`ID inválido: ${id}`);
            }
            
            // Verifica se a despesa existe antes de atualizar
            const existe = await this.buscarPorId(idNumerico);
            if (!existe) {
                throw new Error(`Despesa ${id} não encontrada para atualização`);
            }
            
            const response = await fetch(`${API_URL}/despesas/${idNumerico}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...despesa, id: idNumerico })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const despesaAtualizada = await response.json();
            console.log('✅ Despesa atualizada na API:', despesaAtualizada);
            return despesaAtualizada;
        } catch (error) {
            console.error('❌ Erro ao atualizar despesa na API:', error);
            throw error;
        }
    },
    
    // Atualização parcial na API (PATCH)
    async atualizarParcial(id, campos) {
        try {
            console.log(`📤 Atualizando parcialmente despesa ${id} na API...`);
            
            // Converte para número se necessário
            const idNumerico = Number(id);
            if (isNaN(idNumerico)) {
                throw new Error(`ID inválido: ${id}`);
            }
            
            // Verifica se há campos para atualizar
            if (Object.keys(campos).length === 0) {
                throw new Error('Nenhum campo fornecido para atualização');
            }
            
            const response = await fetch(`${API_URL}/despesas/${idNumerico}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campos)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const despesaAtualizada = await response.json();
            console.log('✅ Despesa atualizada parcialmente na API:', despesaAtualizada);
            return despesaAtualizada;
        } catch (error) {
            console.error('❌ Erro ao atualizar despesa parcialmente na API:', error);
            throw error;
        }
    },
    
    // Remover despesa da API (VERSÃO CORRIGIDA)
    async remover(id) {
        try {
            console.log(`🗑️ Removendo despesa ${id} da API...`);
            console.log(`🔍 Tipo do ID recebido: ${typeof id}, valor: ${id}`);
            
            // Converte para número se necessário (importante!)
            let idNumerico;
            if (typeof id === 'string') {
                idNumerico = parseInt(id, 10);
            } else {
                idNumerico = Number(id);
            }
            
            console.log(`🔍 ID convertido para número: ${idNumerico}, tipo: ${typeof idNumerico}`);
            
            // Verifica se o ID é válido
            if (isNaN(idNumerico)) {
                console.error(`❌ ID inválido após conversão: ${id}`);
                throw new Error(`ID inválido: ${id}. Não é um número válido.`);
            }
            
            // Primeiro verifica se a despesa existe
            try {
                const checkResponse = await fetch(`${API_URL}/despesas/${idNumerico}`);
                if (!checkResponse.ok) {
                    if (checkResponse.status === 404) {
                        console.log(`⚠️ Despesa ${idNumerico} não encontrada na API (já foi removida)`);
                        return { success: true, message: 'Despesa já removida' };
                    }
                    throw new Error(`Erro ao verificar despesa: HTTP ${checkResponse.status}`);
                }
                console.log(`✅ Despesa ${idNumerico} encontrada, prosseguindo com exclusão`);
            } catch (checkError) {
                console.warn('⚠️ Erro ao verificar despesa, tentando excluir mesmo assim:', checkError);
            }
            
            // Realiza a exclusão
            const response = await fetch(`${API_URL}/despesas/${idNumerico}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // DELETE pode retornar 200, 204 ou 404
            if (response.status === 404) {
                console.log(`⚠️ Despesa ${idNumerico} não encontrada na API (já foi removida)`);
                return { success: true, message: 'Despesa já removida' };
            }
            
            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.log(`✅ Despesa ${idNumerico} removida da API com sucesso`);
            return { success: true };
            
        } catch (error) {
            console.error('❌ Erro ao remover despesa da API:', error);
            // Em vez de lançar o erro, retorna um objeto com erro para tratamento adequado
            return { 
                success: false, 
                error: error.message,
                id: id
            };
        }
    },
    
    // Sincronizar localStorage com API
    async sincronizarComLocalStorage() {
        try {
            console.log('🔄 Sincronizando despesas com localStorage...');
            
            // Busca despesas da API
            const despesasAPI = await this.listar();
            
            // Salva no localStorage
            localStorage.setItem('despesas', JSON.stringify(despesasAPI));
            
            console.log(`✅ ${despesasAPI.length} despesas sincronizadas com localStorage`);
            return despesasAPI;
        } catch (error) {
            console.error('❌ Erro ao sincronizar:', error);
            return [];
        }
    },
    
    // Carregar do localStorage (fallback)
    carregarDoLocalStorage() {
        try {
            const despesas = localStorage.getItem('despesas');
            const parsed = despesas ? JSON.parse(despesas) : [];
            console.log(`📦 Carregadas ${parsed.length} despesas do localStorage`);
            return parsed;
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
            return [];
        }
    },
    
    // Limpar todas as despesas da API (útil para testes)
    async limparTodas() {
        try {
            console.log('🧹 Buscando todas despesas para limpar...');
            const despesas = await this.listar();
            
            console.log(`🗑️ Removendo ${despesas.length} despesas...`);
            const resultados = await Promise.all(
                despesas.map(d => this.remover(d.id))
            );
            
            const removidas = resultados.filter(r => r.success).length;
            console.log(`✅ ${removidas} despesas removidas com sucesso`);
            return { success: true, removidas };
        } catch (error) {
            console.error('❌ Erro ao limpar despesas:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Obter estatísticas das despesas
    async obterEstatisticas() {
        try {
            const despesas = await this.listar();
            
            const totalPrevisto = despesas.reduce((acc, d) => acc + (d.valorPrevisto || 0), 0);
            const totalReal = despesas.reduce((acc, d) => acc + (d.valorReal || 0), 0);
            const pagas = despesas.filter(d => d.status === 'paga').length;
            const naoPagas = despesas.filter(d => d.status === 'nao_paga').length;
            
            return {
                total: despesas.length,
                totalPrevisto,
                totalReal,
                pagas,
                naoPagas,
                diferenca: totalPrevisto - totalReal
            };
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return null;
        }
    }
};

// Exporta também uma instância padrão
export default despesaAPIService;
