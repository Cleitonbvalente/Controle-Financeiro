// js/modules/tags.js
import { salvarTags, carregarTags } from '../storage/localStorage.js';

// Classe Tag
export class Tag {
    constructor(nome) {
        this.id = Date.now() + Math.random();
        this.nome = nome;
    }
}

// Map para armazenar tags
export const tagsMap = new Map();

// Função para inicializar tags
export function initTags() {
    console.log('🔧 Inicializando tags...');
    const tagsSalvas = carregarTags();
    console.log('📥 Tags carregadas do storage:', tagsSalvas);
    
    // Limpa o Map antes de carregar
    tagsMap.clear();
    
    if (tagsSalvas.length === 0) {
        // Tags padrão
        const defaultTags = [
            new Tag('Urgente'),
            new Tag('Recorrente'),
            new Tag('Eventual'),
            new Tag('Essencial'),
            new Tag('Supérfluo'),
            new Tag('Trabalho'),
            new Tag('Pessoal'),
            new Tag('Lazer'),
            new Tag('Saúde'),
            new Tag('Educação')
        ];
        
        defaultTags.forEach(tag => {
            tagsMap.set(tag.id, tag);
        });
        console.log('✅ Tags padrão criadas:', defaultTags);
        // Salva tags padrão no localStorage
        salvarTags(Array.from(tagsMap.values()));
    } else {
        // Reconstrói cada tag como objeto Tag
        tagsSalvas.forEach(tag => {
            if (tag && tag.nome) {
                const novaTag = new Tag(tag.nome);
                novaTag.id = tag.id;
                tagsMap.set(tag.id, novaTag);
            }
        });
        console.log('✅ Tags restauradas:', Array.from(tagsMap.values()));
    }
    
    console.log('📁 Tags no Map:', Array.from(tagsMap.entries()));
}

// CRUD de Tags - ADICIONAR
export function adicionarTag(nome) {
    try {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome da tag é obrigatório');
        }
        
        // Verifica se já existe tag com mesmo nome
        const existe = Array.from(tagsMap.values()).some(
            tag => tag.nome.toLowerCase() === nome.trim().toLowerCase()
        );
        
        if (existe) {
            throw new Error('Já existe uma tag com este nome');
        }
        
        const tag = new Tag(nome.trim());
        tagsMap.set(tag.id, tag);
        salvarTags(Array.from(tagsMap.values()));
        console.log('✅ Tag adicionada:', tag);
        return tag;
    } catch (error) {
        console.error('❌ Erro ao adicionar tag:', error);
        throw error;
    }
}

// CRUD de Tags - REMOVER (VERSÃO CORRIGIDA)
export function removerTag(id) {
    try {
        console.log(`🗑️ Tentando remover tag com ID: ${id}`);
        console.log(`🔍 Tipo do ID: ${typeof id}, valor: ${id}`);
        
        // Converte para string para comparação
        const idString = String(id);
        
        // Verifica se a tag existe
        let tagExistente = null;
        for (let [key, value] of tagsMap.entries()) {
            if (String(key) === idString) {
                tagExistente = value;
                break;
            }
        }
        
        if (!tagExistente) {
            console.error('❌ Tag não encontrada no Map');
            console.log('📁 Tags disponíveis:', Array.from(tagsMap.keys()));
            throw new Error('Tag não encontrada');
        }
        
        console.log(`✅ Tag encontrada: ${tagExistente.nome} (ID: ${tagExistente.id})`);
        
        // Remove do Map
        const result = tagsMap.delete(tagExistente.id);
        
        if (result) {
            // Salva no localStorage
            salvarTags(Array.from(tagsMap.values()));
            console.log(`✅ Tag "${tagExistente.nome}" removida com sucesso`);
            console.log(`📊 Total de tags após remoção: ${tagsMap.size}`);
            return true;
        } else {
            throw new Error('Falha ao remover tag do Map');
        }
        
    } catch (error) {
        console.error('❌ Erro ao remover tag:', error);
        throw error;
    }
}

// CRUD de Tags - ATUALIZAR
export function atualizarTag(id, novoNome) {
    try {
        console.log(`✏️ Tentando atualizar tag ${id} para "${novoNome}"`);
        
        const tag = tagsMap.get(id);
        if (!tag) {
            throw new Error('Tag não encontrada');
        }
        
        // Verifica se o novo nome já existe em outra tag
        const existe = Array.from(tagsMap.values()).some(
            t => t.nome.toLowerCase() === novoNome.toLowerCase() && t.id !== id
        );
        
        if (existe) {
            throw new Error('Já existe uma tag com este nome');
        }
        
        const nomeAntigo = tag.nome;
        tag.nome = novoNome;
        salvarTags(Array.from(tagsMap.values()));
        console.log(`✅ Tag atualizada: "${nomeAntigo}" -> "${novoNome}"`);
        return tag;
    } catch (error) {
        console.error('❌ Erro ao atualizar tag:', error);
        throw error;
    }
}

// CRUD de Tags - LISTAR
export function listarTags() {
    const tags = Array.from(tagsMap.values());
    console.log('📋 Listando tags:', tags.map(t => ({ id: t.id, nome: t.nome })));
    return tags;
}

// CRUD de Tags - BUSCAR POR ID
export function getTag(id) {
    if (!id) {
        console.warn('⚠️ ID da tag não fornecido');
        return null;
    }
    
    // Converte para string para busca
    const idString = String(id);
    
    // Busca no Map comparando como string
    for (let [key, value] of tagsMap.entries()) {
        if (String(key) === idString) {
            console.log(`🔍 Tag encontrada: ${value.nome} (ID: ${key})`);
            return value;
        }
    }
    
    console.warn(`⚠️ Tag não encontrada para ID: ${id}`);
    return null;
}

// Função para recarregar tags do storage
export function recarregarTags() {
    console.log('🔄 Recarregando tags...');
    initTags();
    return listarTags();
}

// Função para verificar se uma tag está sendo usada em alguma despesa
export function tagEstaEmUso(tagId) {
    try {
        // Esta função precisa ser chamada com o estado das despesas
        // Será implementada no app.js
        console.log(`🔍 Verificando se tag ${tagId} está em uso...`);
        return false;
    } catch (error) {
        console.error('❌ Erro ao verificar uso da tag:', error);
        return false;
    }
}

// Função para limpar todas as tags (útil para testes)
export function limparTodasTags() {
    try {
        console.log('🧹 Limpando todas as tags...');
        tagsMap.clear();
        salvarTags([]);
        console.log('✅ Todas as tags foram removidas');
        return true;
    } catch (error) {
        console.error('❌ Erro ao limpar tags:', error);
        return false;
    }
}

// Exporta funções adicionais
export default {
    initTags,
    adicionarTag,
    removerTag,
    atualizarTag,
    listarTags,
    getTag,
    recarregarTags,
    tagEstaEmUso,
    limparTodasTags
};
