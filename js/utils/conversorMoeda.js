// js/utils/conversorMoeda.js

/**
 * Taxas de conversão fixas (1 unidade da moeda = valor em Real)
 * Atualizado em Março 2026
 */
const TAXAS_CONVERSAO = {
    BRL: 1.00,   // Real Brasileiro
    USD: 5.80,   // Dólar Americano
    EUR: 6.20    // Euro
};

/**
 * Símbolos das moedas
 */
const SIMBOLOS_MOEDA = {
    BRL: 'R$',
    USD: 'US$',
    EUR: '€'
};

/**
 * Nomes completos das moedas
 */
const NOMES_MOEDA = {
    BRL: 'Real Brasileiro',
    USD: 'Dólar Americano',
    EUR: 'Euro'
};

/**
 * Cores para exibição (opcional)
 */
const CORES_MOEDA = {
    BRL: '#4cc9f0',
    USD: '#f8961e',
    EUR: '#f72585'
};

/**
 * Conversor de Moedas com Closure
 * Mantém histórico de todas as conversões realizadas
 */
export function criarConversorMoeda() {
    // Histórico de conversões (preservado pela closure)
    const historicoConversoes = [];
    
    // Contador de conversões
    let totalConversoes = 0;
    
    return {
        /**
         * Converte um valor para Real Brasileiro
         * @param {number|string} valor - Valor a ser convertido
         * @param {string} moeda - Código da moeda (BRL, USD, EUR)
         * @returns {number} Valor convertido em Real
         */
        converterParaReal: (valor, moeda) => {
            // Validação de entrada
            if (valor === undefined || valor === null || valor === '') {
                console.warn(`⚠️ Valor inválido para conversão: ${valor}`);
                return 0;
            }
            
            const valorNumerico = Number(valor);
            if (isNaN(valorNumerico)) {
                console.warn(`⚠️ Valor não é um número: ${valor}`);
                return 0;
            }
            
            // Se já for Real, retorna o próprio valor
            if (moeda === 'BRL') {
                console.log(`💰 Sem conversão: ${valorNumerico} BRL = R$ ${valorNumerico.toFixed(2)}`);
                return valorNumerico;
            }
            
            // Verifica se a moeda é suportada
            const taxa = TAXAS_CONVERSAO[moeda];
            if (!taxa) {
                console.error(`❌ Moeda não suportada: ${moeda}`);
                return valorNumerico;
            }
            
            // Realiza a conversão
            const convertido = valorNumerico * taxa;
            totalConversoes++;
            
            // Registra no histórico (usando spread operator)
            historicoConversoes.push({
                id: totalConversoes,
                valorOriginal: valorNumerico,
                moedaOriginal: moeda,
                taxa: taxa,
                valorConvertido: convertido,
                data: new Date().toISOString(),
                timestamp: Date.now()
            });
            
            console.log(`💱 CONVERSÃO #${totalConversoes}: ${valorNumerico} ${moeda} (1 ${moeda} = R$ ${taxa.toFixed(2)}) = R$ ${convertido.toFixed(2)}`);
            
            return convertido;
        },
        
        /**
         * Converte um valor de Real para outra moeda
         * @param {number|string} valorReal - Valor em Real
         * @param {string} moedaDestino - Código da moeda de destino
         * @returns {number} Valor convertido na moeda de destino
         */
        converterDeReal: (valorReal, moedaDestino) => {
            const valorNum = Number(valorReal);
            if (isNaN(valorNum)) return 0;
            
            if (moedaDestino === 'BRL') return valorNum;
            
            const taxa = TAXAS_CONVERSAO[moedaDestino];
            if (!taxa) return valorNum;
            
            const convertido = valorNum / taxa;
            
            console.log(`💱 CONVERSÃO: R$ ${valorNum.toFixed(2)} = ${convertido.toFixed(2)} ${moedaDestino} (1 ${moedaDestino} = R$ ${taxa.toFixed(2)})`);
            
            return convertido;
        },
        
        /**
         * Formata um valor com o símbolo da moeda
         * @param {number|string} valor - Valor a ser formatado
         * @param {string} moeda - Código da moeda
         * @returns {string} Valor formatado (ex: R$ 100,00 ou US$ 50,00)
         */
        formatarValor: (valor, moeda) => {
            const valorNum = Number(valor);
            if (isNaN(valorNum)) {
                return `${SIMBOLOS_MOEDA[moeda] || 'R$'} 0,00`;
            }
            
            const simbolo = SIMBOLOS_MOEDA[moeda] || 'R$';
            const valorFormatado = valorNum.toFixed(2).replace('.', ',');
            
            return `${simbolo} ${valorFormatado}`;
        },
        
        /**
         * Formata um valor já em Real
         * @param {number|string} valor - Valor em Real
         * @returns {string} Valor formatado (ex: R$ 100,00)
         */
        formatarReal: (valor) => {
            const valorNum = Number(valor);
            if (isNaN(valorNum)) return 'R$ 0,00';
            return `R$ ${valorNum.toFixed(2).replace('.', ',')}`;
        },
        
        /**
         * Retorna a taxa de conversão de uma moeda
         * @param {string} moeda - Código da moeda
         * @returns {number} Taxa de conversão
         */
        getTaxa: (moeda) => {
            return TAXAS_CONVERSAO[moeda] || 1;
        },
        
        /**
         * Retorna o símbolo da moeda
         * @param {string} moeda - Código da moeda
         * @returns {string} Símbolo da moeda
         */
        getSimbolo: (moeda) => {
            return SIMBOLOS_MOEDA[moeda] || 'R$';
        },
        
        /**
         * Retorna o nome completo da moeda
         * @param {string} moeda - Código da moeda
         * @returns {string} Nome da moeda
         */
        getNome: (moeda) => {
            return NOMES_MOEDA[moeda] || 'Real Brasileiro';
        },
        
        /**
         * Retorna a cor associada à moeda
         * @param {string} moeda - Código da moeda
         * @returns {string} Cor em hexadecimal
         */
        getCor: (moeda) => {
            return CORES_MOEDA[moeda] || '#4cc9f0';
        },
        
        /**
         * Lista todas as moedas suportadas
         * @returns {Array} Lista de moedas com suas informações
         */
        listarMoedas: () => {
            return Object.keys(TAXAS_CONVERSAO).map(codigo => ({
                codigo: codigo,
                nome: NOMES_MOEDA[codigo],
                simbolo: SIMBOLOS_MOEDA[codigo],
                taxa: TAXAS_CONVERSAO[codigo],
                cor: CORES_MOEDA[codigo]
            }));
        },
        
        /**
         * Obtém o histórico de conversões
         * @returns {Array} Histórico completo de conversões
         */
        getHistorico: () => {
            return [...historicoConversoes]; // Retorna uma cópia usando spread operator
        },
        
        /**
         * Limpa o histórico de conversões
         */
        limparHistorico: () => {
            historicoConversoes.length = 0;
            totalConversoes = 0;
            console.log('🧹 Histórico de conversões limpo');
        },
        
        /**
         * Obtém estatísticas das conversões
         * @returns {Object} Estatísticas das conversões realizadas
         */
        getEstatisticas: () => {
            const totalConvertido = historicoConversoes.reduce((acc, c) => acc + c.valorConvertido, 0);
            const conversoesPorMoeda = {};
            
            historicoConversoes.forEach(c => {
                const moeda = c.moedaOriginal;
                conversoesPorMoeda[moeda] = (conversoesPorMoeda[moeda] || 0) + 1;
            });
            
            return {
                totalConversoes: totalConversoes,
                totalConvertido: totalConvertido,
                conversoesPorMoeda: conversoesPorMoeda,
                mediaPorConversao: totalConversoes > 0 ? totalConvertido / totalConversoes : 0,
                ultimaConversao: historicoConversoes[historicoConversoes.length - 1] || null
            };
        },
        
        /**
         * Atualiza a taxa de uma moeda (útil para futuras implementações)
         * @param {string} moeda - Código da moeda
         * @param {number} novaTaxa - Nova taxa de conversão
         * @returns {boolean} Sucesso da operação
         */
        atualizarTaxa: (moeda, novaTaxa) => {
            if (TAXAS_CONVERSAO[moeda]) {
                const taxaAntiga = TAXAS_CONVERSAO[moeda];
                TAXAS_CONVERSAO[moeda] = novaTaxa;
                console.log(`📊 Taxa do ${moeda} atualizada: ${taxaAntiga} → ${novaTaxa}`);
                return true;
            }
            console.warn(`⚠️ Moeda ${moeda} não encontrada para atualização`);
            return false;
        },
        
        /**
         * Converte e formata um valor de forma amigável
         * @param {number} valor - Valor original
         * @param {string} moeda - Moeda original
         * @returns {string} String formatada com conversão
         */
        converterEFormatar: (valor, moeda) => {
            const valorOriginal = Number(valor);
            const valorEmReal = this.converterParaReal(valorOriginal, moeda);
            
            if (moeda === 'BRL') {
                return this.formatarReal(valorEmReal);
            }
            
            return `${this.formatarValor(valorOriginal, moeda)} ≈ ${this.formatarReal(valorEmReal)}`;
        }
    };
}

// Cria uma instância padrão do conversor (Singleton)
const conversorPadrao = criarConversorMoeda();

// Exporta a instância padrão e a função de criação
export default conversorPadrao;
