export function salvarDados(chave, dados){

try{

localStorage.setItem(chave, JSON.stringify(dados))

}catch(error){

console.log("Erro ao salvar", error)

}

}

export function carregarDados(chave){

try{

const dados = localStorage.getItem(chave)

return dados ? JSON.parse(dados) : []

}catch(error){

console.log("Erro ao carregar", error)
return []

}

}
