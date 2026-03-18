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
    
    // Primeiro, limpa o Map para evitar duplicatas
    categoriasMap.clear();
    
    const categoriasSalvas = carregarCategorias();
    console.log('📥 Categorias carregadas do storage:', categoriasSalvas);
    
    if (categoriasSalvas.length === 0) {
        // Categorias padrão
        const defaultCategorias = [
            new Categoria('Moradia', '🏠'),
            new Categoria('Alimentação', '🍔'),
            new Categoria('Transporte', '🚗'),
            new Categoria('Saúde', '🏥'),
            new Categoria('Educação', '📚'),
            new Categoria('Lazer', '🎮'),
            new Categoria('Outros', '📦')
        ];
        
        defaultCategorias.forEach(cat => {
            categoriasMap.set(cat.id, cat);
        });
        console.log('✅ Categorias padrão criadas:', defaultCategorias);
    } else {
        // Reconstrói cada categoria como objeto Categoria
        categoriasSalvas.forEach(cat => {
            // Verifica se já existe um objeto com métodos
            if (cat && cat.nome) {
                // Cria nova instância de Categoria com os dados salvos
                const categoria = new Categoria(cat.nome, cat.icone || '📁');
                categoria.id = cat.id; // Mantém o ID original
                categoriasMap.set(cat.id, categoria);
                console.log(`✅ Categoria restaurada: ${categoria.nome} (ID: ${categoria.id})`);
            }
        });
    }
    
    // Salva no localStorage para garantir consistência
    salvarCategorias(Array.from(categoriasMap.values()));
    console.log('📁 Categorias no Map:', Array.from(categoriasMap.entries()));
}

// CRUD de Categorias
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

export function removerCategoria(id) {
    try {
        if (!categoriasMap.has(id)) {
            throw new Error('Categoria não encontrada');
        }
        
        // Verifica se alguma despesa usa esta categoria (opcional)
        // Esta verificação pode ser feita no app.js se necessário
        
        const categoriaRemovida = categoriasMap.get(id);
        const result = categoriasMap.delete(id);
        salvarCategorias(Array.from(categoriasMap.values()));
        console.log('✅ Categoria removida:', categoriaRemovida?.nome);
        return result;
    } catch (error) {
        console.error('❌ Erro ao remover categoria:', error);
        throw error;
    }
}

export function listarCategorias() {
    const categorias = Array.from(categoriasMap.values());
    console.log('📋 Listando categorias:', categorias.map(c => ({ id: c.id, nome: c.nome, icone: c.icone })));
    return categorias;
}

export function getCategoria(id) {
    if (!id) {
        console.warn('⚠️ ID da categoria não fornecido');
        return null;
    }
    
    // Tenta buscar como string (pode ser que o ID seja número)
    const categoria = categoriasMap.get(id) || categoriasMap.get(String(id));
    
    if (!categoria) {
        console.warn(`⚠️ Categoria não encontrada para ID: ${id}`);
        console.log('📁 IDs disponíveis:', Array.from(categoriasMap.keys()));
    } else {
        console.log(`✅ Categoria encontrada: ${categoria.nome} (ID: ${id})`);
    }
    
    return categoria;
}

// Função para recarregar categorias do storage
export function recarregarCategorias() {
    console.log('🔄 Recarregando categorias...');
    initCategorias();
    return listarCategorias();
}
