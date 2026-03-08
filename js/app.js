import { Receita } from './receita.js'
import { Despesa } from './despesa.js'
import { salvarDados, carregarDados } from './storage.js'

let receitas = carregarDados("receitas")
let despesas = carregarDados("despesas")

let receitasFiltradas = [...receitas]
let despesasFiltradas = [...despesas]

const listaReceitas = document.getElementById("listaReceitas")
const listaDespesas = document.getElementById("listaDespesas")
const saldo = document.getElementById("saldo")

function atualizarTela(){

listaReceitas.innerHTML = ""
listaDespesas.innerHTML = ""

receitasFiltradas.forEach(r => {

const li = document.createElement("li")
li.innerHTML = `${r.titulo} - R$ ${r.valor}`

listaReceitas.appendChild(li)

})

despesasFiltradas.forEach(d => {

const li = document.createElement("li")
li.innerHTML = `${d.titulo} (${d.categoria}) - R$ ${d.valor}`

listaDespesas.appendChild(li)

})

calcularSaldo()

}

function calcularSaldo(){

const totalReceitas = receitasFiltradas.reduce((acc, r) => acc + Number(r.valor), 0)

const totalDespesas = despesasFiltradas.reduce((acc, d) => acc + Number(d.valor), 0)

const resultado = totalReceitas - totalDespesas

saldo.innerHTML = `R$ ${resultado}`

}

window.filtrarMes = function(){

const mesSelecionado = document.getElementById("filtroMes").value

if(!mesSelecionado){

receitasFiltradas = [...receitas]
despesasFiltradas = [...despesas]

}else{

receitasFiltradas = receitas.filter(r => r.data.startsWith(mesSelecionado))
despesasFiltradas = despesas.filter(d => d.data.startsWith(mesSelecionado))

}

atualizarTela()

}

window.adicionarReceita = function(){

const titulo = document.getElementById("tituloReceita")
const valor = document.getElementById("valorReceita")
const data = document.getElementById("dataReceita")

const receita = new Receita(
titulo.value,
valor.value,
data.value
)

receitas.push(receita)

salvarDados("receitas", receitas)

titulo.value = ""
valor.value = ""
data.value = ""

filtrarMes()

}

window.adicionarDespesa = function(){

const titulo = document.getElementById("tituloDespesa")
const valor = document.getElementById("valorDespesa")
const categoria = document.getElementById("categoriaDespesa")
const data = document.getElementById("dataDespesa")

const despesa = new Despesa(
titulo.value,
valor.value,
categoria.value,
data.value
)

despesas.push(despesa)

salvarDados("despesas", despesas)

titulo.value = ""
valor.value = ""
categoria.value = ""
data.value = ""

filtrarMes()

}

document.addEventListener("DOMContentLoaded", () => {

atualizarTela()

})
