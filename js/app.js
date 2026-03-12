import {Receita} from "./receita.js"
import {Despesa} from "./despesa.js"
import {salvarDados, carregarDados} from "./storage.js"
import {categorias} from "./categorias.js"

// IIFE
// Usada para inicialização do sistema
(function(){
console.log("Sistema de Controle Financeiro iniciado")
})()

// carregando dados
let {receitas, despesas} = carregarDados()

// DOM
// seleciona os elementos
const listaReceitas = document.querySelector("#listaReceitas")
const listaDespesas = document.querySelector("#listaDespesas")
const saldoEl = document.querySelector("#saldo")
const mesFiltro = document.querySelector("#mesFiltro")

// eventos
document.querySelector("#btnReceita")
.addEventListener("click", adicionarReceita)

document.querySelector("#btnDespesa")
.addEventListener("click", adicionarDespesa)

mesFiltro.addEventListener("change", render)

// adicionar receita
function adicionarReceita(){

const titulo = document.querySelector("#tituloReceita").value
const valor = document.querySelector("#valorReceita").value
const data = document.querySelector("#dataReceita").value

if(!titulo || !valor){
alert("Preencha todos os campos")
return
}

const receita = new Receita(titulo, Number(valor), data)

// spread operator
// adiciona nova receita ao array
receitas = [...receitas, receita]

salvarDados(receitas, despesas)

document.querySelector("#tituloReceita").value = ""
document.querySelector("#valorReceita").value = ""
document.querySelector("#dataReceita").value = ""

render()

}

// adicionar despesa
function adicionarDespesa(){

const titulo = document.querySelector("#tituloDespesa").value
const valor = document.querySelector("#valorDespesa").value
const categoria = document.querySelector("#categoriaDespesa").value
const data = document.querySelector("#dataDespesa").value

if(!titulo || !valor){
alert("Preencha todos os campos")
return
}

const despesa = new Despesa(titulo, Number(valor), categoria, data)

despesas.push(despesa)

salvarDados(receitas, despesas)

document.querySelector("#tituloDespesa").value = ""
document.querySelector("#valorDespesa").value = ""
document.querySelector("#categoriaDespesa").value = ""
document.querySelector("#dataDespesa").value = ""

render()
}

function render(){

listaReceitas.innerHTML = ""
listaDespesas.innerHTML = ""

let receitasFiltradas = receitas
let despesasFiltradas = despesas

const mes = mesFiltro.value

// filter
// filtra receitas e despesas pelo mês selecionado
if(mes){
receitasFiltradas = receitas.filter(r => r.data.startsWith(mes))
despesasFiltradas = despesas.filter(d => d.data.startsWith(mes))
}

// sort
// Ordena as receitas pela data
receitasFiltradas.sort((a,b)=> new Date(b.data) - new Date(a.data))

// for of
// Percorre todas as receitas filtradas
for(const r of receitasFiltradas){

const li = document.createElement("li")

li.innerHTML = `
${r.titulo} - R$ ${r.valor} - ${r.data}
<span style="cursor:pointer;margin-left:10px" onclick="editarReceita(${r.id})">✏️</span>
<span style="cursor:pointer;margin-left:5px;color:red" onclick="removerReceita(${r.id})">❌</span>
`

listaReceitas.appendChild(li)

}

// foreach
// Percorre todas as despesas filtradas
despesasFiltradas.forEach(d => {

const icone = categorias.get(d.categoria) || ""

const li = document.createElement("li")

li.innerHTML = `
${icone} ${d.titulo} - R$ ${d.valor} - ${d.data}
<span style="cursor:pointer;margin-left:10px" onclick="editarDespesa(${d.id})">✏️</span>
<span style="cursor:pointer;margin-left:5px;color:red" onclick="removerDespesa(${d.id})">❌</span>
`

listaDespesas.appendChild(li)

})

// atualiza saldo
calcularSaldo()

}

// reduce
// calcula o saldo total
function calcularSaldo(){

const totalReceitas = receitas.reduce((acc, r) => acc + Number(r.valor), 0)
const totalDespesas = despesas.reduce((acc, d) => acc + Number(d.valor), 0)

saldoEl.innerText = `Saldo: R$ ${totalReceitas - totalDespesas}`

}

/* find */
function buscarDespesa(id){

return despesas.find(d => d.id === id)

}

/* remover receita */
function removerReceita(id){
if(!confirm("Deseja realmente remover esta receita?")){
return
}
receitas = receitas.filter(r => r.id !== id)
salvarDados(receitas, despesas)

render()

}

/* remover despesa */
function removerDespesa(id){
if(!confirm("Deseja realmente remover esta despesa?")){
return
}
despesas = despesas.filter(d => d.id !== id)
salvarDados(receitas, despesas)
render()

}

/* editar receita */
function editarReceita(id){

const receita = receitas.find(r => r.id === id)

const novoTitulo = prompt("Editar título:", receita.titulo)
const novoValor = prompt("Editar valor:", receita.valor)

if(novoTitulo !== null){
receita.titulo = novoTitulo
}

if(novoValor !== null){
receita.valor = Number(novoValor)
}

salvarDados(receitas, despesas)

render()

}

/* editar despesa */
function editarDespesa(id){

const despesa = despesas.find(d => d.id === id)

const novoTitulo = prompt("Editar título:", despesa.titulo)
const novoValor = prompt("Editar valor:", despesa.valor)

if(novoTitulo !== null){
despesa.titulo = novoTitulo
}

if(novoValor !== null){
despesa.valor = Number(novoValor)
}

salvarDados(receitas, despesas)

render()

}

/* closure */
// exemplo de closure para contagem acumulada
function criarContador(){
let total = 0
return valor => {
total += valor
return total
}
}

window.removerReceita = removerReceita
window.removerDespesa = removerDespesa
window.editarReceita = editarReceita
window.editarDespesa = editarDespesa

render()
