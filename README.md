# 💰 Gestão Financeira Pessoal

Sistema completo para controle financeiro pessoal desenvolvido para a disciplina de Desenvolvimento Web - IFCE Campus Aracati.

## 📋 Sobre o Projeto

Sistema de gestão financeira para desenvolvedor web freelancer, permitindo o registro e gerenciamento completo de receitas e despesas com suporte a múltiplas moedas, categorias e tags.

## ✨ Funcionalidades

### 📊 Receitas
- ✅ Cadastro completo (título, descrição, valor, moeda, data)
- ✅ Listagem com filtro por mês
- ✅ Edição total e parcial
- ✅ Exclusão
- ✅ Suporte a múltiplas moedas (BRL, USD, EUR)
- ✅ Conversão automática para Real
- ✅ Integração com JSON Server (API Fake)

### 💸 Despesas
- ✅ Cadastro completo (título, descrição, valor previsto, valor real, categoria, tags, data, status)
- ✅ Listagem com filtro por mês
- ✅ Busca por título, descrição ou categoria
- ✅ Edição total e parcial
- ✅ Exclusão
- ✅ Status de pagamento (paga/não paga)
- ✅ Cálculo automático do valor do balanço
- ✅ Persistência no LocalStorage

### 🏷️ Categorias e Tags
- ✅ Gerenciamento completo de categorias (CRUD)
- ✅ Gerenciamento completo de tags (CRUD)
- ✅ Ícones personalizados para categorias
- ✅ Seleção de categorias em despesas
- ✅ Múltiplas tags por despesa

### 📈 Dashboard
- ✅ Balanço atual do mês
- ✅ Totais de receitas e despesas
- ✅ Filtro por mês
- ✅ Interface responsiva
- ✅ Cards interativos

## 🚀 Tecnologias Utilizadas

### Front-end
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização com Flexbox/Grid
- **JavaScript (ES6+)** - Lógica da aplicação

### Armazenamento
- **LocalStorage** - Persistência de despesas, categorias e tags
- **JSON Server** - API Fake para receitas

### Ferramentas
- **Git** - Controle de versão
- **Conventional Commits** - Padrão de commits

## 📚 Conceitos JavaScript Explorados

### Estruturas de Dados
- ✅ **Classes** - `Receita`, `Despesa`, `Categoria`, `Tag`
- ✅ **Map()** - Armazenamento de categorias e tags em memória
- ✅ **Arrays** - Listas de receitas e despesas

### Métodos de Array
- ✅ **reduce()** - Cálculo de totais e balanço
- ✅ **filter()** - Filtros por mês e busca
- ✅ **map()** - Transformação de dados
- ✅ **sort()** - Ordenação por data
- ✅ **find()** - Busca de itens para edição

### Programação Funcional
- ✅ **Arrow Functions** - Em todo o código
- ✅ **Spread Operator** - Atualização de estado
- ✅ **Template Literals** - Renderização dinâmica
- ✅ **Destructuring** - Extração de dados

### Assincronismo
- ✅ **Async/Await** - Requisições à API
- ✅ **fetch()** - Comunicação com JSON Server
- ✅ **try/catch** - Tratamento de erros

### Padrões e Boas Práticas
- ✅ **Closure** - Contador de requisições na API
- ✅ **IIFE** - Inicialização do sistema
- ✅ **Módulos (import/export)** - Organização do código
- ✅ **Event Delegation** - Gerenciamento de eventos
- ✅ **let e const** - Escopo adequado
- ✅ **for/of e forEach** - Iteração

## 🎨 Layout

O layout foi desenvolvido com:
- Design responsivo (mobile-first)
- Cards interativos com hover effects
- Cores diferenciadas para receitas (verde) e despesas (vermelho)
- Gradientes suaves no fundo
- Animações CSS
- Modal para edições
