import {Receita} from "./receita.js"
import {Despesa} from "./despesa.js"
import {salvarDados, carregarDados} from "./storage.js"
import {categorias} from "./categorias.js"

(function(){

console.log("Sistema de Controle Financeiro iniciado")

})()


let {receitas, despesas} = carregarDados()


const listaReceitas = document.querySelector("#listaReceitas")
const listaDespesas = document.querySelector("#listaDespesas")
const saldoEl = document.querySelector("#saldo")
const mesFiltro = document.querySelector("#mesFiltro")


document.querySelector("#btnReceita")
.addEventListener("click", adicionarReceita)

document.querySelector("#btnDespesa")
.addEventListener("click", adicionarDespesa)

mesFiltro.addEventListener("change", render)


function adicionarReceita(){

const titulo = document.querySelector("#tituloReceita").value
const valor = document.querySelector("#valorReceita").value
const data = document.querySelector("#dataReceita").value

if(!titulo || !valor){

alert("Preencha todos os campos")

return
}

const receita = new Receita(titulo, valor, data)

receitas = [...receitas, receita]

salvarDados(receitas, despesas)

render()

}


function adicionarDespesa(){

const titulo = document.querySelector("#tituloDespesa").value
const valor = document.querySelector("#valorDespesa").value
const categoria = document.querySelector("#categoriaDespesa").value
const data = document.querySelector("#dataDespesa").value

if(!titulo || !valor){

alert("Preencha todos os campos")

return

}

const despesa = new Despesa(titulo, valor, categoria, data)

despesas.push(despesa)

salvarDados(receitas, despesas)

render()

}


function render(){

listaReceitas.innerHTML = ""
listaDespesas.innerHTML = ""

let receitasFiltradas = receitas
let despesasFiltradas = despesas

const mes = mesFiltro.value

if(mes){

receitasFiltradas = receitas.filter(r => r.data.startsWith(mes))

despesasFiltradas = despesas.filter(d => d.data.startsWith(mes))

}


receitasFiltradas.sort((a,b)=> new Date(b.data) - new Date(a.data))


for(const r of receitasFiltradas){

const li = document.createElement("li")

li.innerHTML = `${r.titulo} - R$ ${r.valor} - ${r.data}`

listaReceitas.appendChild(li)

}


despesasFiltradas.forEach(d => {

const icone = categorias.get(d.categoria) || ""

const li = document.createElement("li")

li.innerHTML = `${icone} ${d.titulo} - R$ ${d.valor} - ${d.data}`

listaDespesas.appendChild(li)

})

calcularSaldo()

}


function calcularSaldo(){

const totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0)

const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0)

saldoEl.innerText = `Saldo: R$ ${totalReceitas - totalDespesas}`

}


function buscarDespesa(id){

return despesas.find(d => d.id === id)

}


function criarContador(){

let total = 0

return valor => {

total += valor

return total
}
}

render()
