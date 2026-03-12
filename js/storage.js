export function salvarDados(receitas, despesas){

try{

localStorage.setItem("receitas", JSON.stringify(receitas))

localStorage.setItem("despesas", JSON.stringify(despesas))

}catch(erro){

console.error("Erro ao salvar dados:", erro)

}

}

export function carregarDados(){

try{

const receitas = JSON.parse(localStorage.getItem("receitas")) || []

const despesas = JSON.parse(localStorage.getItem("despesas")) || []

return {receitas, despesas}

}catch(erro){

console.error("Erro ao carregar dados:", erro)

return {receitas:[], despesas:[]}

}

}
