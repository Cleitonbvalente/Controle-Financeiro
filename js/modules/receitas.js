import { criarConversorMoeda } from '../utils/conversorMoeda.js';

const conversor = criarConversorMoeda();

// Classe Receita
export class Receita {
    constructor(titulo, descricao, valor, moeda, data) {
        this.id = Date.now() + Math.random();
        this.titulo = titulo;
        this.descricao = descricao;
        this.valor = Number(valor);
        this.moeda = moeda;
        this.data = data;
        this.valorConvertido = conversor.converterParaReal(this.valor, moeda);
    }
    
    // Método para atualizar valor
    atualizarValor(novoValor, novaMoeda) {
        this.valor = Number(novoValor);
        this.moeda = novaMoeda || this.moeda;
        this.valorConvertido = conversor.converterParaReal(this.valor, this.moeda);
    }
    
    // Método para formatar exibição
    formatarExibicao() {
        return {
            titulo: this.titulo,
            descricao: this.descricao,
            valorOriginal: conversor.formatarValor(this.valor, this.moeda),
            valorConvertido: `R$ ${this.valorConvertido.toFixed(2)}`,
            data: new Date(this.data).toLocaleDateString('pt-BR')
        };
    }
}
