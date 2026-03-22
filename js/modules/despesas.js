// Classe Despesa
export class Despesa {
    constructor(titulo, descricao, valorPrevisto, valorReal, categoria, tags, data, status) {
        this.id = Date.now();
        this.titulo = titulo;
        this.descricao = descricao;
        this.valorPrevisto = Number(valorPrevisto);
        this.valorReal = valorReal ? Number(valorReal) : null;
        this.categoria = categoria; // ID da categoria
        this.tags = tags || []; // Array de IDs de tags
        this.data = data;
        this.status = status || 'nao_paga';
        
        console.log('💰 Nova despesa criada:', {
            id: this.id,
            titulo: this.titulo,
            categoria: this.categoria,
            tags: this.tags,
            data: this.data
        });
    }
    
    // Método para pagar despesa
    pagar(valorReal) {
        this.status = 'paga';
        if (valorReal) {
            this.valorReal = Number(valorReal);
        }
        console.log('✅ Despesa paga:', this.id);
    }
    
    // Método para obter valor a ser considerado no balanço
    getValorBalanco() {
        const valor = this.status === 'paga' && this.valorReal ? this.valorReal : this.valorPrevisto;
        console.log(`💰 Valor balanço despesa ${this.id}: R$ ${valor}`);
        return valor;
    }
    
    // Método para formatar exibição
    formatarExibicao(categoriasMap, tagsMap) {
        console.log('🎨 Formatando despesa:', this.id);
        console.log('📁 Categoria ID:', this.categoria);
        console.log('🏷️ Tags IDs:', this.tags);
        
        // Busca a categoria pelo ID
        const categoria = categoriasMap.get(this.categoria);
        console.log('📁 Categoria encontrada:', categoria);
        
        // Busca as tags pelos IDs
        const tagsNomes = this.tags
            .map(tagId => {
                const tag = tagsMap.get(tagId);
                console.log(`🏷️ Tag ${tagId}:`, tag);
                return tag?.nome;
            })
            .filter(nome => nome) // Remove undefined
            .join(', ');
        
        console.log('🏷️ Tags nomes:', tagsNomes);
        
        // Formata a data
        let dataFormatada = 'Data inválida';
        try {
            dataFormatada = new Date(this.data).toLocaleDateString('pt-BR');
        } catch (e) {
            console.error('❌ Erro ao formatar data:', e);
        }
        
        return {
            titulo: this.titulo || 'Sem título',
            descricao: this.descricao || 'Sem descrição',
            valorPrevisto: `R$ ${(this.valorPrevisto || 0).toFixed(2)}`,
            valorReal: this.valorReal ? `R$ ${this.valorReal.toFixed(2)}` : 'Não paga',
            categoria: categoria ? `${categoria.icone} ${categoria.nome}` : 'Categoria não informada',
            tags: tagsNomes || 'Sem tags',
            data: dataFormatada,
            status: this.status === 'paga' ? '✅ Paga' : '⏳ Não Paga'
        };
    }
}
