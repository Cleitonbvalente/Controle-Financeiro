import { criarConversorMoeda } from '../utils/conversorMoeda.js';

const conversor = criarConversorMoeda();

// Classe Receita
export class Receita {
    constructor(titulo, descricao, valor, moeda, data) {
        this.id = Date.now() + Math.random();
        this.titulo = titulo;
        this.descricao = descricao;
        this.valorOriginal = Number(valor); 
        this.moeda = moeda;
        this.data = data;
        
        // Converte para Real imediatamente
        this.valorEmReal = conversor.converterParaReal(this.valorOriginal, this.moeda);
        
        console.log(`💰 Nova receita criada: ${this.valorOriginal} ${this.moeda} = R$ ${this.valorEmReal.toFixed(2)}`);
    }
    
    // Método para obter valor em Real (getter)
    getValorEmReal() {
        return this.valorEmReal;
    }
    
    // Método para obter valor original
    getValorOriginal() {
        return this.valorOriginal;
    }
    
    // Método para formatar exibição
    formatarExibicao() {
        return {
            titulo: this.titulo,
            descricao: this.descricao,
            valorOriginal: `${this.getValorOriginalFormatado()}`,
            valorConvertido: `R$ ${this.valorEmReal.toFixed(2)}`,
            moeda: this.moeda,
            data: new Date(this.data).toLocaleDateString('pt-BR'),
            taxa: conversor.getTaxa(this.moeda)
        };
    }
    
    getValorOriginalFormatado() {
        return conversor.formatarValor(this.valorOriginal, this.moeda);
    }
    
    getMesAno() {
        if (!this.data) return '';
        return this.data.substring(0, 7);
    }
}

// Função para converter dados da API para objeto Receita
export function converterParaReceita(dadosAPI) {
    console.log(`🔄 Convertendo dados da API para Receita:`, dadosAPI);
    
    const receita = new Receita(
        dadosAPI.titulo,
        dadosAPI.descricao || '',
        dadosAPI.valor,
        dadosAPI.moeda || 'BRL',
        dadosAPI.data
    );
    
    // Mantém o ID original da API
    receita.id = dadosAPI.id;
    
    console.log(`✅ Receita convertida: ${receita.titulo} - ${receita.getValorOriginalFormatado()} = ${receita.getValorEmReal().toFixed(2)}`);
    
    return receita;
}
