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
    
    if (tagsSalvas.length === 0) {
        // Tags padrão
        const defaultTags = [
            new Tag('Urgente'),
            new Tag('Recorrente'),
            new Tag('Eventual'),
            new Tag('Essencial'),
            new Tag('Supérfluo'),
            new Tag('Trabalho'),
            new Tag('Pessoal')
        ];
        
        defaultTags.forEach(tag => {
            tagsMap.set(tag.id, tag);
        });
        console.log('✅ Tags padrão criadas:', defaultTags);
    } else {
        // Reconstrói cada tag como objeto Tag
        tagsSalvas.forEach(tag => {
            // Cria nova instância de Tag com os dados salvos
            const novaTag = new Tag(tag.nome);
            novaTag.id = tag.id; // Mantém o ID original
            tagsMap.set(tag.id, novaTag);
        });
        console.log('✅ Tags restauradas:', Array.from(tagsMap.values()));
    }
    
    // Salva no localStorage
    salvarTags(Array.from(tagsMap.values()));
}

// CRUD de Tags
export function adicionarTag(nome) {
    try {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome da tag é obrigatório');
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

export function removerTag(id) {
    try {
        if (!tagsMap.has(id)) {
            throw new Error('Tag não encontrada');
        }
        const result = tagsMap.delete(id);
        salvarTags(Array.from(tagsMap.values()));
        console.log('✅ Tag removida:', id);
        return result;
    } catch (error) {
        console.error('❌ Erro ao remover tag:', error);
        throw error;
    }
}

export function atualizarTag(id, novoNome) {
    try {
        const tag = tagsMap.get(id);
        if (!tag) {
            throw new Error('Tag não encontrada');
        }
        
        tag.nome = novoNome;
        salvarTags(Array.from(tagsMap.values()));
        console.log('✅ Tag atualizada:', tag);
        return tag;
    } catch (error) {
        console.error('❌ Erro ao atualizar tag:', error);
        throw error;
    }
}

export function listarTags() {
    const tags = Array.from(tagsMap.values());
    console.log('📋 Listando tags:', tags);
    return tags;
}

export function getTag(id) {
    if (!id) {
        console.warn('⚠️ ID da tag não fornecido');
        return null;
    }
    const tag = tagsMap.get(id);
    console.log(`🔍 Buscando tag ${id}:`, tag);
    return tag;
}
