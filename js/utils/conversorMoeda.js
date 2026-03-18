// Taxas de conversão fixas
const TAXAS_CONVERSAO = {
    USD: 5.00, // 1 USD = R$ 5,00
    EUR: 5.50  // 1 EUR = R$ 5,50
};

// Símbolos das moedas
const SIMBOLOS_MOEDA = {
    BRL: 'R$',
    USD: 'US$',
    EUR: '€'
};

// Função com closure para conversão
export function criarConversorMoeda() {
    const historicoConversoes = [];
    
    return {
        converterParaReal: (valor, moeda) => {
            if (moeda === 'BRL') return valor;
            
            const convertido = valor * (TAXAS_CONVERSAO[moeda] || 1);
            
            // Armazena no histórico (closure)
            historicoConversoes.push({
                valorOriginal: valor,
                moeda,
                convertido,
                data: new Date().toISOString()
            });
            
            return convertido;
        },
        
        getHistorico: () => [...historicoConversoes],
        
        formatarValor: (valor, moeda) => {
            const simbolo = SIMBOLOS_MOEDA[moeda] || 'R$';
            return `${simbolo} ${valor.toFixed(2)}`;
        }
    };
}
