const Modal = { //const indica que não haverá alteração - const = constant
    open(){
        // Abrir Modal
        // Adicionar a classe active ao Modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        // Fechar o Modal
        // Remover a classe active do Modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = { 
    get() { //pegar informações inseridas pelo usuário
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) //comando .parse() transforma o input de string para array 
        || [] //ou, se não encontrar o item, cria uma string vazia
    },
    set(transactions) { //guardar informações inseridas pelo usuário no storage da página
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) // "dev.finances:transactions" é o nome para consulta  e JSON.stringify transforma de array para string
    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction) {
        Transaction.all.push(transaction) //adicionar a todas transações
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1) // remove a transação

        App.reload()
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => { //arrow function é igual a function(transaction)
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => { //arrow function é igual a function(transaction)
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense" //se transaction.amount for maior que 0, considerar como income. Se não, será expense

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onCLick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100 //garantir que pontos e virgulas informados venham na formatação esperada
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-") //dividir data tirando "-"
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}` //garatnir que data tenha o formato dd/mm/aaaa | `` indica que return será em formato string
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "" //se signal for menor que 0, adcionar sinal negativo (-). Se não, não adicionar

        value = String(value).replace(/\D/g, "") //trocar todos os carcteres que não sejam numeros por nada

        value = Number(value) / 100 //adicionar virgulas

        value = value.toLocaleString("pt-BR", { //adicionar sinal da moeda
            style: "currency",
            currency: "EUR"
        })

        return signal + value
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatValues() { //formatar os dados
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields() { //validar se todas as informações foram preenchidas
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") { //confirma se os campos do formulário estão vazios ("||" indica "ou")
            throw new Error("Please fill in all required fields") //mostra erro se condição acima não foi atendida
        }
    },

    clearFields() { // limpar os campos do formulário após inserção
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction) // salvar transações informadas
            Form.clearFields()
            Modal.close() // fechar o Modal
        } catch (error) { //'captura' o erro e mostra na tela
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)   
        });
        
        DOM.updateBalance()

        Storage.set(Transaction.all) // atualizar o storage após cada input da transações
    },
    reload() {
        DOM.clearTransaction() //limpar entrada de dados antes de iniciar App novamente
        App.init()
    },
}

App.init()

