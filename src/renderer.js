// Execuções iniciais ao abrir o sistema
const initialVerif = async () => {

    // Lidando com o nome do usuário
    await handleUsernamer()

    // Requisitando os anos para preencher na referência
    await findReferences('years')
}
initialVerif()




/* Main page elements */

// Adicionando evento de Click no botão de exportar movimentos em XLSX
document.getElementById("export-movements-xlsx").addEventListener("click", async () => {
    const ref = getSelectedRef()

    if (ref) {
        Swal.fire({
            title: "Aviso",
            text: `Selecione o caminho para salvar o arquivo.`,
            icon: 'info',
            showConfirmButton: true,
            confirmButtonText: 'Ok',
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const returnExportXlsx = await window.movement.exportXlsx(ref)

                if (returnExportXlsx) {
                    Swal.fire({ title: "Informação", text: 'Arquivo gerado com sucesso.', icon: 'info', allowOutsideClick: false })
                }
            }
        })
    }
})
// Adicionando evento de Click no botão de exportar movimentos em PDF
document.getElementById("export-movements-pdf").addEventListener("click", async () => {
    const ref = getSelectedRef()
    const calcValuesResp = await window.movement.calcValues(ref)

    if (ref) {
        Swal.fire({
            title: "Aviso",
            text: `Selecione o caminho para salvar o arquivo.`,
            icon: 'info',
            showConfirmButton: true,
            confirmButtonText: 'Ok',
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                showLoading(true)
                await window.movement.exportPdf(ref, calcValuesResp)
                    .then((res) => {
                        showLoading(false)
                        Swal.fire({ title: "Sucesso", text: `Arquivo gerado com sucesso!`, icon: 'success', allowOutsideClick: false })
                    })
                    .catch((err) => {
                        showLoading(false)
                        Swal.fire({ title: "Informação", text: err.message.slice(52), icon: 'info', allowOutsideClick: false })
                    })
            }
        })
    }
})
// Adicionando evento de Click no botão de buscar movimentos
document.getElementById("button-search-movements").addEventListener("click", async () => {
    const titRefTotalizers = document.getElementById('title-reference-totalizers');

    const ref = getSelectedRef()

    if (!ref) { // Se a referência não estiver selecionada
        titRefTotalizers.innerHTML = ''
    } else { // Se a referência estiver selecionada
        let convertMonth = moment(`01/${ref.month}/2023`, 'DD/MM/YYYY').locale('pt-br').format('MMMM')
        titRefTotalizers.innerHTML = `${convertMonth[0].toUpperCase()}${convertMonth.slice(1)} de ${ref.year}`
        showLoading(true)
        await calValuesMovs(ref)
        await genMovsTable(ref)
        showLoading(false)
    }
})
// Adicionando evento de Click no botão de inserir novo movimento
document.getElementById("bt-new-register").addEventListener("click", () => {
    let dateMovementField = document.getElementById("date-movement")
    let now = moment().format("YYYY-MM-DD") // Capturando a data atual e mudando o formato

    // Mudando o valor do campo Data para a data atual
    dateMovementField.value = now

    // Exibindo o modal
    showModalInsert(true)
})
// Adicionando evento de Change no select de ano da referência
document.getElementById('select-year-reference').addEventListener("change", async (e) => {
    const selectMonth = document.getElementById('select-month-reference');
    const value = e.target.value

    if (value != '') {
        resetRef('month')
        await findReferences('months', value)
        selectMonth.disabled = false
    }
})
// Adicionando evento de Click no botão de pesquisar referências
document.getElementById('bt-refind-references').addEventListener("click", async () => {
    resetRef('all')
    await findReferences('years')
})
// Adicionando evento de Click no botão de alterar nome do usuário
document.getElementById('bt-send-alter-username').addEventListener("click", async () => {
    const inputUsername = document.getElementById('input-username')

    if (inputUsername.value) {
        await window.config.alterUsername(inputUsername.value)
            .then(async (res) => {
                await handleUsernamer()
                inputUsername.value = ''
            })
    }
})




/* Insert modal elements */

// Adicionando evento de Click no botão de fechar modal de inserir movimento
document.getElementById("bt-close-modal-insert").addEventListener("click", () => showModalInsert(false))
// Adicionando evento de Click no botão de cancelar modal de inserir movimento
document.getElementById("bt-cancel-modal-insert").addEventListener("click", () => showModalInsert(false))
// Adicionando evento de submit no formulário
document.getElementById("form-modal").addEventListener("submit", (e) => formHandleInsert(e))
// Adicionando evento Click no checkbox do Saldo Inicial
document.getElementById("opening-balance").addEventListener("change", function (event) {
    let typeMovement = document.getElementById("type-movement")
    let switchTypeValueMovement = document.getElementById("switch-type-value-movement")

    handleOpeningBalanceChange(event.target.checked, typeMovement, switchTypeValueMovement)
})
// Adicionando evento Click no select do tipo de movimento
document.getElementById("type-movement").addEventListener("change", function (e) {
    let switchTypeValueMovement = document.getElementById("switch-type-value-movement")
    // Escondendo o Switch do valor
    switchTypeValueMovement.style.display = "none"
})
// Adicionando evento Change no input do valor do movimento
document.getElementById("value-movement").addEventListener("change", function (e) {
    let value = e.target.value
    // Setando duas casas decimais no valor informado
    e.target.value = parseFloat(value).toFixed(2)
})
// Adicionando evento Keydown no input do valor do movimento
document.getElementById("value-movement").addEventListener("keydown", function (e) {
    let value = e.target.value
    // Verificando se o tamanho do valor do input é maior ou igual a 8 dígitos
    if (value.length >= 8) {
        e.target.value = value.slice(0, 7)
    }

})




/* Alter modal elements */

// Adicionando evento de Click no botão de fechar modal de alterar movimento
document.getElementById("bt-close-modal-alter").addEventListener("click", () => showModalAlter(false))
// Adicionando evento de Click no botão de cancelar modal de alterar movimento
document.getElementById("bt-cancel-modal-alter").addEventListener("click", () => showModalAlter(false))
// Adicionando evento de submit no formulário
document.getElementById("form-modal-alter").addEventListener("submit", (e) => formHandleAlter(e))
// Adicionando evento Click no checkbox do Saldo Inicial
document.getElementById("opening-balance-alter").addEventListener("change", function (event) {
    let typeMovement = document.getElementById("type-movement-alter")
    let switchTypeValueMovement = document.getElementById("switch-type-value-movement-alter")

    handleOpeningBalanceChange(event.target.checked, typeMovement, switchTypeValueMovement)


})
// Adicionando evento Click no select do tipo de movimento
document.getElementById("type-movement-alter").addEventListener("change", function (e) {
    let switchTypeValueMovement = document.getElementById("switch-type-value-movement-alter")
    // Escondendo o Switch do valor
    switchTypeValueMovement.style.display = "none"
})
// Adicionando evento Change no input do valor do movimento
document.getElementById("value-movement-alter").addEventListener("change", function (event) {
    event.target.value = handleRoudValue(event.target.value)
})
// Adicionando evento Keydown no input do valor do movimento
document.getElementById("value-movement-alter").addEventListener("keydown", function (event) {
    event.target.value = handleLengthValue(event.target.value, 7)
})




/* Form submit functions */

/**
 * @description Função que lida com o Submit do Formulário de inserir movimento
 * @param {event} event Capturando o evento de submit do formulário
 */
async function formHandleInsert(event) {
    let form = document.getElementById("form-modal");
    // Evitando que o formulário recarregue a página
    event.preventDefault()

    // Reunindo dados dos campos do formulário
    const formData = {
        opBalance: form.elements["opening-balance"].checked,
        type: form.elements['type-movement'].value,
        date: form.elements['date-movement'].value,
        origin: form.elements['origin-movement'].value,
        value: form.elements['value-movement'].value,
        typeValue: form.elements['type-value-movement'].checked,
        description: form.elements['description-movement'].value,
    }

    await formValidate(formData)
        .then(async () => {
            // Confirmação de salvamento
            await Swal.fire({
                title: 'Deseja realmente salvar?',
                icon: 'question',
                showDenyButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Sim',
                denyButtonText: `Não`,
                confirmButtonColor: '#25678A',
                denyButtonColor: '#E05757',
                allowOutsideClick: false,
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Habilitando o loading para aguardar a resposta
                    showLoading(true)

                    if (formData.opBalance) {
                        const findOpBalance = await window.movement.findOpBalance(formData.date)
                        if (findOpBalance) {
                            // Desabilitando o loading após a resposta
                            showLoading(false)
                            Swal.fire({ title: "Erro", text: 'Já existe um lançamento de Saldo inicial para este mês.', icon: 'error', allowOutsideClick: false })
                            return
                        }
                    }

                    // Enviando os dados para a Bridge
                    const createMovement = await window.movement.create(formData)
                        .then((response) => {
                            // Desabilitando o loading após a resposta
                            showLoading(false)
                            Swal.fire({
                                title: "Sucesso",
                                text: `Registro salvo com sucesso! Deseja realizar outro lançamento?`,
                                icon: 'success',
                                footer: `Número: ${response.dataValues.id}`,
                                showDenyButton: true,
                                showConfirmButton: true,
                                confirmButtonText: 'Sim',
                                denyButtonText: `Não`,
                                allowOutsideClick: false
                            }).then(async (result) => {
                                if (result.isDenied) {
                                    // Fechando o modal
                                    showModalInsert(false)
                                } else if (result.isConfirmed) {
                                    // Resetando o formulário
                                    resetFormInsert()
                                    // setando a data atual no campo de Data
                                    form.elements['date-movement'].value = moment().format("YYYY-MM-DD")
                                }
                            })
                        })
                        .catch((error) => {
                            // Desabilitando o loading após a resposta
                            showLoading(false)

                            Swal.fire({ title: "Erro", text: `Erro ao tentar salvar o registro. Especificação do erro: ${error.message}`, icon: 'error', allowOutsideClick: false })
                        })
                } else if (result.isDenied) {
                    Swal.fire({ title: "Informação", text: 'O registro não foi salvo.', icon: 'info', allowOutsideClick: false })
                }
            })
        })
        .catch((error) => {
            Swal.fire({ title: "Erro", text: error.message, icon: 'error', allowOutsideClick: false })
        })
}

/**
 * @description Função que lida com o Submit do Formulário de alterar movimento
 * @param {event} event Capturando o evento de submit do formulário
 */
async function formHandleAlter(event) {
    const form = document.getElementById("form-modal-alter");
    const idMov = document.getElementById('id-mov-alter-modal').innerHTML
    // Evitando que o formulário recarregue a página
    event.preventDefault()

    // Reunindo dados dos campos do formulário
    const formData = {
        opBalance: form.elements["opening-balance-alter"].checked,
        type: form.elements['type-movement-alter'].value,
        date: form.elements['date-movement-alter'].value,
        origin: form.elements['origin-movement-alter'].value,
        value: form.elements['value-movement-alter'].value,
        typeValue: form.elements['type-value-movement-alter'].checked,
        description: form.elements['description-movement-alter'].value,
    }

    await formValidate(formData)
        .then(async () => {
            // Confirmação de salvamento
            await Swal.fire({
                title: 'Deseja realmente alterar?',
                icon: 'question',
                footer: `Número: ${idMov}`,
                showDenyButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Sim',
                denyButtonText: `Não`,
                confirmButtonColor: '#25678A',
                denyButtonColor: '#E05757',
                allowOutsideClick: false,
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Habilitando o loading para aguardar a resposta
                    showLoading(true)

                    if (formData.opBalance) {
                        const findOpBalance = await window.movement.findOpBalance(formData.date)
                        if (findOpBalance) {
                            if (findOpBalance.dataValues.id != idMov) {
                                // Desabilitando o loading após a resposta
                                showLoading(false)
                                Swal.fire({ title: "Erro", text: 'Já existe um lançamento de Saldo inicial para este mês.', icon: 'error', allowOutsideClick: false })
                                return
                            }
                        }
                    }

                    // Enviando os dados para a Bridge
                    const movement = await window.movement.update(idMov, formData)
                        .then((response) => {
                            // Desabilitando o loading após a resposta
                            showLoading(false)
                            Swal.fire({
                                title: "Sucesso",
                                text: `Registro alterado com sucesso!`,
                                icon: 'success',
                                footer: `Número: ${idMov}`,
                                allowOutsideClick: false
                            }).then(async (result) => {
                                showModalAlter(false)
                                // Resetando o formulário
                                resetFormAlter()
                            })
                        })
                        .catch((error) => {
                            // Desabilitando o loading após a resposta
                            showLoading(false)

                            Swal.fire({ title: "Erro", text: `Erro ao tentar alterar o registro. Especificação do erro: ${error.message}`, icon: 'error', allowOutsideClick: false })
                        })

                } else if (result.isDenied) {
                    Swal.fire({ title: "Informação", text: 'O registro não foi alterado.', icon: 'info', allowOutsideClick: false })
                }
            })
        })
        .catch((error) => {
            Swal.fire({ title: "Erro", text: error.message, icon: 'error', allowOutsideClick: false })
        })
}




/* Form validation functions */

/**
 * @description Função que lida com a mudança no estado do checkbox de Saldo inicial, modificando os campos necessários.
 * @param {boolean} param Parâmetro que controla a função
 * @param {element} typeMovement Recebe o combobox do Tipo de movimento
 * @param {element} switchTypeValueMovement Recebe o switch do Tipo de movimento
 */
function handleOpeningBalanceChange(param, typeMovement, switchTypeValueMovement) {
    if (param) {
        // Mostrando o Switch do valor
        switchTypeValueMovement.style.display = "block"
        // Desabilitando a seleção do tipo e voltando ao valor padrão
        typeMovement.disabled = true
        typeMovement.value = ''
    } else {
        // Escondendo o Switch do valor
        switchTypeValueMovement.style.display = "none"
        // Habilitando a seleção do tipo e voltando ao valor padrão
        typeMovement.disabled = false
    }
}
/**
 * @description Função que lida com a conversão de um valor para duas casas decimais
 * @param {string} value Valor que será convertido para duas casas decimais
 */
function handleRoudValue(value) {
    return value = parseFloat(value).toFixed(2)
}
/**
 * @description Função que lida com o tamanho de um Valor
 * @param {string} value Valor que será verificado
 * @param {number} length Tamanho máximo que o Valor pode chegar
 */
function handleLengthValue(value, length) {
    if (value.length >= length) {
        return value = value.slice(0, 8 - 1)
    } else {
        return value
    }
}
/**
 * @description Função que valida os campos necessários para envio do formulário
 * @param {object} formData 
 */
async function formValidate(formData) {

    // Verificando se o saldo inicial ou tipo de movimento está informado
    if (!formData.opBalance && formData.type === '') {
        throw new Error("É obrigatório selecionar o Tipo de movimento ou inidicar que se trata de um lançamento de saldo inicial.")
    }

    // Verificando se o campo Data está vazio
    if (formData.date === '') {
        throw new Error("O campo Data é obrigatório.")
    }

    // Verificando se o checkbox Saldo Inicial está marcado e se a Data está no primeiro dia do mês
    if (formData.opBalance) {
        let dateDay = moment(formData.date, "YYYY-MM-DD").format("DD")
        if (dateDay != 1) {
            throw new Error("Lançamentos de Saldo inicial somente são permitidos no primeiro dia do mês.")
        }
    }

    // Verificando se o Valor do movimento está preenchido e que é maior que zero
    if (formData.value == '') {
        throw new Error("O Valor do movimento é obrigatório.")
    } else if (parseFloat(formData.value) <= 0) {
        throw new Error("O Valor do movimento deve ser maior que zero.")
    }

    // Verificando se a Descrição do movimento está preenchida
    if (formData.description == '') {
        throw new Error("A Descrição do movimento é obrigatória.")
    }

}
/**
 * @description Função que lida com o reinício do formulário de inserir movimento
 */
function resetFormInsert() {
    let form = document.getElementById("form-modal");
    let switchTypeValueMovement = document.getElementById("switch-type-value-movement");
    let typeMovement = document.getElementById("type-movement");

    // Escondendo o Switch do valor
    switchTypeValueMovement.style.display = "none"
    // Habilitando a seleção do tipo e voltando ao valor padrão
    typeMovement.disabled = false
    // Resetando as informações do formulário
    form.reset()
}
/**
 * @description Função que lida com o reinício do formulário de alterar movimento
 */
function resetFormAlter() {
    let form = document.getElementById("form-modal-alter");
    let switchTypeValueMovement = document.getElementById("switch-type-value-movement-alter");
    let typeMovement = document.getElementById("type-movement-alter");

    // Escondendo o Switch do valor
    switchTypeValueMovement.style.display = "none"
    // Habilitando a seleção do tipo e voltando ao valor padrão
    typeMovement.disabled = false
    // Resetando as informações do formulário
    form.reset()
}




/* Specials functions */

/**
 * 
 * @param {event} event Evento disparado pelo click do botão de excluir movimento localizado na tabela de movimentos
 */
async function deleteMov(event) {
    const button = event.target.parentElement
    const td = button.parentElement
    const tr = td.parentElement
    const idColumn = tr.children['td-id-movement']
    if (idColumn) {
        const idMov = idColumn.innerHTML

        await Swal.fire({
            title: 'Deseja realmente excluir o registro?',
            icon: 'question',
            showDenyButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sim',
            footer: `Número: ${idMov}`,
            denyButtonText: `Não`,
            confirmButtonColor: '#25678A',
            denyButtonColor: '#E05757',
            allowOutsideClick: false,
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Habilitando o loading para aguardar a resposta
                showLoading(true)

                await window.movement.delete(idMov)
                    .then((resp) => {

                        // Desabilitando o loading após a resposta
                        showLoading(false)
                        Swal.fire({
                            title: "Sucesso",
                            text: 'Registro excluído com sucesso!',
                            icon: 'success',
                            allowOutsideClick: false,
                            footer: `Número: ${idMov}`,
                        })
                    }).catch((error) => {
                        // Desabilitando o loading após a resposta
                        showLoading(false)

                        Swal.fire({ title: "Erro", text: `Erro ao tentar excluir o registro. Especificação do erro: ${error.message}`, icon: 'error', allowOutsideClick: false })
                    })

            } else if (result.isDenied) {
                Swal.fire({ title: "Informação", text: 'Operação cancelada.', icon: 'info', allowOutsideClick: false })
            }
        })
    }
}
/**
 * 
 * @param {event} event Evento disparado pelo click do botão de alterar movimento localizado na tabela de movimentos
 */
async function alterMov(event) {
    const button = event.target.parentElement
    const td = button.parentElement
    const tr = td.parentElement
    const idColumn = tr.children['td-id-movement']
    const numberField = document.getElementById('id-mov-alter-modal')
    const form = document.getElementById("form-modal-alter")
    const typeMovement = document.getElementById("type-movement-alter")
    const switchTypeValueMovement = document.getElementById("switch-type-value-movement-alter")

    if (idColumn) {
        showLoading(true)
        const idMov = idColumn.innerHTML

        // Consultando a ponte
        await window.movement.find(idMov)
            .then((res) => {
                if (res) {
                    const values = res.dataValues

                    // Setando o número do movimento na tela de alteração
                    numberField.innerHTML = idMov
                    // Habilitando o switch de valor caso o movimento seja de Saldo inicial
                    handleOpeningBalanceChange(values.openingBalance, typeMovement, switchTypeValueMovement)

                    // Setando os valores recuperados do banco de dados nos campos do formulário
                    form.elements['opening-balance-alter'].checked = values.openingBalance
                    form.elements['type-movement-alter'].value = values.openingBalance ? '' : values.type === 'Despesa' ? 'D' : 'R'
                    form.elements['date-movement-alter'].value = moment(values.date, 'DD-MM-YYYY').format('YYYY-MM-DD')
                    form.elements['origin-movement-alter'].value = values.origin
                    form.elements['value-movement-alter'].value = handleRoudValue(values.value)
                    form.elements['type-value-movement-alter'].checked = values.type === 'Despesa' ? true : false
                    form.elements['description-movement-alter'].value = values.description

                    showLoading(false)
                    showModalAlter(true)
                } else {
                    throw new Error('Nenhum resultado encontrado para o ID selecionado.')
                }
            })
            .catch((error) => {
                showLoading(false)
                Swal.fire({ title: "Erro", text: `Erro ao tentar localizar o registro. Especificação do erro: ${error.message}`, icon: 'error', allowOutsideClick: false })
            })
    } else {
        Swal.fire({ title: "Erro", text: `Não foi possível capturar o número do movimento.`, icon: 'error', allowOutsideClick: false })
    }
}
/**
 * @description Função que lida com a busca e geração de linhas na tabela de movimentos
 * @param {object} reference Objeto contendo o ano e mês da referência. Ex.: {year: 2023, month: 1}
 */
async function genMovsTable(reference) {
    await window.movement.findMovs(reference)
        .then((resp) => {
            const lineBodyTable = document.getElementById("table-body");

            // Limpando as linhas antes de gerar novas linhas
            lineBodyTable.innerHTML = ''

            resp.map((movement) => {
                const element = document.createElement('div')
                element.classList.add('table-tr')
                element.innerHTML = `
                <div class="table-td">
                    <button class="bt-delete-mov" onclick="deleteMov(event)"><img src="../build/trash-fill-red-500.svg" width="20" height="20" alt="Icon trash" /></button>
                    <button class="bt-edit-mov" onclick="alterMov(event)"><img src="../build/pencil-fill-blue-500.svg" width="20" height="20" alt="Icon trash" /></button>
                </div>
                <div class="table-td" id="td-id-movement">${movement.id}</div>
                <div class="table-td">${movement.date}</div>
                <div class="table-td" style="background-color: var(--color-${movement.type == 'Despesa' ? 'red' : 'blue'}-500);">${movement.openingBalance ? 'Saldo inicial' : movement.type}</div>
                <div class="table-td">${movement.origin}</div>
                <div class="table-td">${movement.description}</div>
                <div class="table-td">R$ ${parseFloat(movement.value).toFixed(2).toString().replace('.', ',')}</div>
            `
                lineBodyTable.appendChild(element)
            })
        }).catch((error) => {
            Swal.fire({ title: "Erro", text: `Erro ao tentar localizar movimentos. Especificação do erro: ${error.message}`, icon: 'error', allowOutsideClick: false })
        })
}
/**
 * @description Função que lida com a busca das referências no banco de dados e preenche os combobox
 * @param {string} type Opções: 'years'; 'months' 
 * @param {string} year Parâmetro que recebe o ano da referencia
*/
async function findReferences(type, year) {
    const selectYear = document.getElementById('select-year-reference');
    const selectMonth = document.getElementById('select-month-reference');

    showLoading(true)

    if (type === 'years') {
        // Consultando a ponte
        const findYearsResp = await window.movement.findYears()
        // Percorrendo e preenchendo a lista de anos
        findYearsResp.map((year) => {
            // Criando a nova option
            let newOption = new Option(year, year);
            // Enviando a nova option para o select
            selectYear.add(newOption, undefined);
        })
    } else if (type === 'months') {
        // Consultando a ponte
        const findMonthsResp = await window.movement.findMonths(year)

        // Percorrendo e preenchendo a lista de meses
        findMonthsResp.map((month) => {
            // Obtendo o nome do mês
            let convertMonth = moment(`01/${month}/2023`, 'DD/MM/YYYY').locale('pt-br').format('MMMM')
            // Transformando a primeira letra do mês em maiúscula
            let upperFirstLetterMonth = `${convertMonth[0].toUpperCase()}${convertMonth.slice(1)}`
            // Criando a nova option
            let newOption = new Option(upperFirstLetterMonth, parseInt(month));
            // Enviando a nova option para o select
            selectMonth.add(newOption, undefined);
        })
    }
    showLoading(false)
}
/**
 * @description Função que busca os totais de despesa e receita dos movimentos da referência
 * @param {object} reference Objeto contendo o ano e mês da referência. Ex.: {year: 2023, month: 1}
 */
async function calValuesMovs(reference) {
    const totalReceit = document.getElementById('total-receit')
    const totalDesp = document.getElementById('total-desp')
    const finalBalanceTable = document.getElementById('final-balance-table');
    const tableFooterTd = document.getElementById('table-footer-td')

    const calcValuesResp = await window.movement.calcValues(reference)
    totalReceit.innerHTML = parseFloat(calcValuesResp.receita).toFixed(2).toString().replace('.', ',')
    totalDesp.innerHTML = parseFloat(calcValuesResp.despesa).toFixed(2).toString().replace('.', ',')
    finalBalanceTable.innerHTML = parseFloat(calcValuesResp.finalBalance).toFixed(2).toString().replace('.', ',')

    if (calcValuesResp.finalBalance >= 0) {
        tableFooterTd.classList.remove('desp-color')
        tableFooterTd.classList.add('receit-color')
    } else {
        tableFooterTd.classList.remove('receit-color')
        tableFooterTd.classList.add('desp-color')
    }
}
/**
 * @description Função que lida com o nome do usuário, buscando das configurações e setando no campo
 */
async function handleUsernamer() {
    await window.config.getConfig()
        .then(async (resp) => {
            const usernameElement = document.getElementById('username-element')
            usernameElement.innerText = resp.username
        })
}



/* Utilities functions */

/**
 * @description Remove todos elementos "option" do elemento "select", retornando para o valor padrão.
 * @param {string} selectId 
 */
function removeOptions(selectId) {
    document.querySelectorAll(`#${selectId} option`).forEach((option) => {
        if (option.value != '') {
            option.remove()
        }
    })
}
/**
 * @description Função que controla o modal de loading
 * @param {boolean} param
 */
function showLoading(param) {
    let loading = document.getElementById("overlay-loading");

    if (param) {
        // Abrindo o modal de loading
        loading.style.display = 'flex'
    } else if (!param) {
        // Fechando o modal de loading
        loading.style.display = 'none'
    }

}
/**
 * @description Função que abre ou fecha o modal de inserir movimento
 * @param {boolean} param Esperado: true, false
 */
function showModalInsert(param) {
    let modal = document.getElementById("overlay-modal-insert");

    if (param) {
        // Abrindo o modal
        modal.style.display = "flex"
    } else if (!param) {
        // Resetando o formulário
        resetFormInsert()
        // Fechando o modal
        modal.style.display = "none";
    }

}
/**
 * @description Função que abre ou fecha o modal de alterar movimento
 * @param {boolean} param Esperado: true, false
 */
function showModalAlter(param) {
    let modal = document.getElementById("overlay-modal-alter");

    if (param) {
        // Abrindo o modal
        modal.style.display = "flex"
    } else if (!param) {
        // Resetando o formulário
        resetFormAlter()
        // Fechando o modal
        modal.style.display = "none";
    }

}
/**
 * @description Função que lida com a captura das informações da referência selecionada
 * @returns {object} Retorna um objeto contendo o ano e o mês da referência selecionada
 */
function getSelectedRef() {
    const selectYear = document.getElementById('select-year-reference');
    const selectMonth = document.getElementById('select-month-reference');

    if (!selectYear.value) {
        Swal.fire({ title: "Erro", text: 'É obrigatório selecionar o Ano da referência', icon: 'error', allowOutsideClick: false })
    } else if (!selectMonth.value) {
        Swal.fire({ title: "Erro", text: 'É obrigatório selecionar o Mês da referência', icon: 'error', allowOutsideClick: false })
    }

    const ref = {
        year: selectYear.value,
        month: selectMonth.value
    }
    if (ref.year || ref.month) {
        return ref
    }
    return undefined
}
/**
 * @description Função que reseta os campos da referência
 * @param {string} type Opções: 'year'; 'month'; 'all'
*/
function resetRef(type) {
    const selectYear = document.getElementById('select-year-reference');
    const selectMonth = document.getElementById('select-month-reference');

    switch (type) {
        case 'year':
            // Voltando o combobox ao valor padrão
            selectYear.value = ''
            // Limpando as options do combobox
            removeOptions('select-year-reference')
            break;
        case 'month':
            // Voltando o combobox ao valor padrão
            selectMonth.value = ''
            // Limpando as options do combobox
            removeOptions('select-month-reference')
            break;
        case 'all':
            // Voltando o combobox ao valor padrão
            selectYear.value = ''
            selectMonth.value = ''
            // Limpando as options do combobox
            removeOptions('select-year-reference')
            removeOptions('select-month-reference')
            // Desabilitando o combobox do mês da referência
            selectMonth.disabled = true
            break;
    }
}