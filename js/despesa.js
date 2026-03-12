export class Despesa{
constructor(titulo, valor, categoria, data){
this.id = Date.now()
this.titulo = titulo
this.valor = Number(valor)
this.categoria = categoria
this.data = data
this.status = "não paga"

}
}
