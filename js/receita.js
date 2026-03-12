export class Receita{
constructor(titulo, valor, data){
this.id = Date.now()
this.titulo = titulo
this.valor = Number(valor)
this.data = data
}
}
