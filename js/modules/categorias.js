// js/modules/categorias.js
import { salvarCategorias, carregarCategorias } from '../storage/localStorage.js';

// Classe Categoria
export class Categoria {
    constructor(nome, icone = '📁') {
        this.id = Date.now() + Math.random();
        this.nome = nome;
        this.icone = icone;
    }
}

// Map para armazenar categorias
export const categoriasMap = new Map();

// Função para inicializar categorias
export function initCategorias() {
    console.log('🔧 Inicializando categorias...');
    
    // Limpa o Map antes de carregar
    categoriasMap.clear();
    
    const categoriasSalvas = carregarCategorias();
    console.log('📥 Categorias carregadas do storage:', categoriasSalvas);
    
    if (!categoriasSalvas || categoriasSalvas.length === 0) {
        // Categorias padrão
        const defaultCategorias = [
            new Categoria('Moradia', '🏠'),
            new Categoria('Alimentação', '🍔'),
            new Categoria('Transporte', '🚗'),
            new Categoria('Saúde', '🏥'),
            new Categoria('Educação', '📚'),
            new Categoria('Lazer', '🎮'),
            new Categoria('Trabalho', '💼'),
            new Categoria('Outros', '📦')
        ];
        
        defaultCategorias.forEach(cat => {
            categoriasMap.set(cat.id, cat);
        });
        console.log('✅ Categorias padrão criadas:', defaultCategorias);
        // Salva categorias padrão no localStorage
        salvarCategorias(Array.from(categoriasMap.values()));
    } else {
        // Reconstrói cada categoria como objeto Categoria
        categoriasSalvas.forEach(cat => {
            if (cat && cat.nome) {
                const categoria = new Categoria(cat.nome, cat.icone || '📁');
                categoria.id = cat.id;
                categoriasMap.set(cat.id, categoria);
                console.log(`✅ Categoria restaurada: ${categoria.nome} (ID: ${categoria.id})`);
            }
        });
    }
    
    console.log('📁 Categorias no Map:', Array.from(categoriasMap.entries()));
}

// CRUD de Categorias - ADICIONAR
export function adicionarCategoria(nome, icone = '📁') {
    try {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome da categoria é obrigatório');
        }
        
        // Verifica se já existe categoria com mesmo nome
        const existe = Array.from(categoriasMap.values()).some(
            cat => cat.nome.toLowerCase() === nome.trim().toLowerCase()
        );
        
        if (existe) {
            throw new Error('Já existe uma categoria com este nome');
        }
        
        const categoria = new Categoria(nome.trim(), icone);
        categoriasMap.set(categoria.id, categoria);
        salvarCategorias(Array.from(categoriasMap.values()));
        console.log('✅ Categoria adicionada:', categoria);
        return categoria;
    } catch (error) {
        console.error('❌ Erro ao adicionar categoria:', error);
        throw error;
    }
}

// CRUD de Categorias - REMOVER (VERSÃO CORRIGIDA)
export function removerCategoria(id) {
    try {
        console.log(`🗑️ Tentando remover categoria com ID: ${id}`);
        console.log(`🔍 Tipo do ID: ${typeof id}, valor: ${id}`);
        
        // Converte para string para comparação
        const idString = String(id);
        
        // Verifica se a categoria existe
        let categoriaExistente = null;
        for (let [key, value] of categoriasMap.entries()) {
            if (String(key) === idString) {
                categoriaExistente = value;
                break;
            }
        }
        
        if (!categoriaExistente) {
            console.error('❌ Categoria não encontrada no Map');
            console.log('📁 Categorias disponíveis:', Array.from(categoriasMap.keys()));
            throw new Error('Categoria não encontrada');
        }
        
        console.log(`✅ Categoria encontrada: ${categoriaExistente.icone} ${categoriaExistente.nome} (ID: ${categoriaExistente.id})`);
        
        // Remove do Map
        const result = categoriasMap.delete(categoriaExistente.id);
        
        if (result) {
            // Salva no localStorage
            salvarCategorias(Array.from(categoriasMap.values()));
            console.log(`✅ Categoria "${categoriaExistente.nome}" removida com sucesso`);
            console.log(`📊 Total de categorias após remoção: ${categoriasMap.size}`);
            return true;
        } else {
            throw new Error('Falha ao remover categoria do Map');
        }
        
    } catch (error) {
        console.error('❌ Erro ao remover categoria:', error);
        throw error;
    }
}

// CRUD de Categorias - ATUALIZAR
export function atualizarCategoria(id, novoNome, novoIcone = null) {
    try {
        console.log(`✏️ Tentando atualizar categoria ${id} para "${novoNome}"`);
        
        const categoria = categoriasMap.get(id);
        if (!categoria) {
            throw new Error('Categoria não encontrada');
        }
        
        // Verifica se o novo nome já existe em outra categoria
        const existe = Array.from(categoriasMap.values()).some(
            c => c.nome.toLowerCase() === novoNome.toLowerCase() && c.id !== id
        );
        
        if (existe) {
            throw new Error('Já existe uma categoria com este nome');
        }
        
        const nomeAntigo = categoria.nome;
        categoria.nome = novoNome;
        if (novoIcone) {
            categoria.icone = novoIcone;
        }
        
        salvarCategorias(Array.from(categoriasMap.values()));
        console.log(`✅ Categoria atualizada: "${nomeAntigo}" -> "${novoNome}"`);
        return categoria;
    } catch (error) {
        console.error('❌ Erro ao atualizar categoria:', error);
        throw error;
    }
}

// CRUD de Categorias - LISTAR
export function listarCategorias() {
    const categorias = Array.from(categoriasMap.values());
    console.log('📋 Listando categorias:', categorias.map(c => ({ id: c.id, nome: c.nome, icone: c.icone })));
    return categorias;
}

// CRUD de Categorias - BUSCAR POR ID
export function getCategoria(id) {
    if (!id) {
        console.warn('⚠️ ID da categoria não fornecido');
        return null;
    }
    
    // Converte para string para busca
    const idString = String(id);
    
    // Busca no Map comparando como string
    for (let [key, value] of categoriasMap.entries()) {
        if (String(key) === idString) {
            console.log(`🔍 Categoria encontrada: ${value.icone} ${value.nome} (ID: ${key})`);
            return value;
        }
    }
    
    console.warn(`⚠️ Categoria não encontrada para ID: ${id}`);
    return null;
}

// Função para recarregar categorias do storage
export function recarregarCategorias() {
    console.log('🔄 Recarregando categorias...');
    initCategorias();
    return listarCategorias();
}

// Função para verificar se uma categoria está sendo usada em alguma despesa
export function categoriaEstaEmUso(categoriaId, despesas) {
    try {
        console.log(`🔍 Verificando se categoria ${categoriaId} está em uso...`);
        
        if (!despesas || despesas.length === 0) {
            console.log('📊 Nenhuma despesa para verificar');
            return false;
        }
        
        const idString = String(categoriaId);
        const emUso = despesas.some(despesa => {
            const categoriaDespesa = despesa.categoria;
            return String(categoriaDespesa) === idString;
        });
        
        if (emUso) {
            console.log(`⚠️ Categoria está sendo usada em ${despesas.filter(d => String(d.categoria) === idString).length} despesa(s)`);
        } else {
            console.log('✅ Categoria não está em uso');
        }
        
        return emUso;
    } catch (error) {
        console.error('❌ Erro ao verificar uso da categoria:', error);
        return false;
    }
}

// Função para limpar todas as categorias (útil para testes)
export function limparTodasCategorias() {
    try {
        console.log('🧹 Limpando todas as categorias...');
        categoriasMap.clear();
        salvarCategorias([]);
        console.log('✅ Todas as categorias foram removidas');
        return true;
    } catch (error) {
        console.error('❌ Erro ao limpar categorias:', error);
        return false;
    }
}

// Exporta funções adicionais
export default {
    initCategorias,
    adicionarCategoria,
    removerCategoria,
    atualizarCategoria,
    listarCategorias,
    getCategoria,
    recarregarCategorias,
    categoriaEstaEmUso,
    limparTodasCategorias
};
