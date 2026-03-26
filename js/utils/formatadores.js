export function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

export function formatarMoeda(valor, moeda = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: moeda
    }).format(valor);
}
