// Funções para salvar dados no localStorage com try..catch

export function salvarDados(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
    } catch (error) {
        console.error(`Erro ao salvar ${chave}:`, error);
        throw new Error(`Não foi possível salvar os dados de ${chave}`);
    }
}

export function carregarDados(chave, valorPadrao = []) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : valorPadrao;
    } catch (error) {
        console.error(`Erro ao carregar ${chave}:`, error);
        return valorPadrao;
    }
}

// Funções específicas
export function salvarReceitas(receitas) {
    salvarDados('receitas', receitas);
}

export function carregarReceitas() {
    return carregarDados('receitas', []);
}

export function salvarDespesas(despesas) {
    salvarDados('despesas', despesas);
}

export function carregarDespesas() {
    return carregarDados('despesas', []);
}

export function salvarCategorias(categorias) {
    salvarDados('categorias', categorias);
}

export function carregarCategorias() {
    return carregarDados('categorias', []);
}

export function salvarTags(tags) {
    salvarDados('tags', tags);
}

export function carregarTags() {
    return carregarDados('tags', []);
}
