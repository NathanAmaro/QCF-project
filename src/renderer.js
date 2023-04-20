// Execuções iniciais ao abrir o sistema
const initialVerif = async () => {
    // Buscando o combobox do ano da referência
    const selectYear = document.getElementById('select-year-reference');

    // Lidando com o nome do usuário
    await handleUsernamer()

    // Requisitando os anos para preencher na referência
    await findReferences('years', selectYear)
}
initialVerif()




/* Main page elements */

// Adicionando evento de Click no botão de exportar movimentos em XLSX
document.getElementById("export-movements-xlsx").addEventListener("click", async () => {
    const selectYear = document.getElementById('select-year-reference');
    const selectMonth = document.getElementById('select-month-reference');

    const ref = getSelectedRef(selectYear, selectMonth)

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
    const selectYear = document.getElementById('select-year-reference');
    const selectMonth = document.getElementById('select-month-reference');
    const ref = getSelectedRef(selectYear, selectMonth)
    
    if (ref) {
        const calcValuesResp = await window.movement.calcValues(ref)
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
    const selectYear = document.getElementById('select-year-reference');
    const selectMonth = document.getElementById('select-month-reference');
    const titRefTotalizers = document.getElementById('title-reference-totalizers');

    const ref = getSelectedRef(selectYear, selectMonth)

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
    const dateMovementField = document.getElementById("date-movement")
    const now = moment().format("YYYY-MM-DD") // Capturando a data atual e mudando o formato

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
        resetRef('month', '', selectMonth)
        await findReferences('months', selectMonth, value)
        selectMonth.disabled = false
    }
})
// Adicionando evento de Click no botão de pesquisar referências
document.getElementById('bt-refind-references').addEventListener("click", async () => {
    // Buscando o combobox do ano da referência
    const selectYear = document.getElementById('select-year-reference');
    // Buscando o combobox do mês da referência
    const selectMonth = document.getElementById('select-month-reference');

    resetRef('all', selectYear, selectMonth)

    await findReferences('years', selectYear)
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
// Adicionando evento de Click no botão de copiar saldo de referência selecionada
document.getElementById("bt-copy-final-balance").addEventListener("click", () => showModalReference(true))
// Adicionando evento de Click no botão de localizar descrição favoritada
document.getElementById("bt-get-description").addEventListener("click", () => showModalGetDescription(true, 'description-movement'))
// Adicionando evento de submit no formulário
document.getElementById("form-modal").addEventListener("submit", (e) => formHandleInsert(e))
// Adicionando evento Click no checkbox do Saldo Inicial
document.getElementById("opening-balance").addEventListener("change", function (event) {
    const typeMovement = document.getElementById("type-movement")
    const switchTypeValueMovement = document.getElementById("switch-type-value-movement")

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
// Adicionando evento de Click no botão de localizar descrição favoritada
document.getElementById("bt-get-description-alter").addEventListener("click", () => showModalGetDescription(true, 'description-movement-alter'))
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
    let value = event.target.value
    // Setando duas casas decimais no valor informado
    event.target.value = parseFloat(value).toFixed(2)
})
// Adicionando evento Keydown no input do valor do movimento
document.getElementById("value-movement-alter").addEventListener("keydown", function (event) {
    let value = event.target.value
    // Verificando se o tamanho do valor do input é maior ou igual a 8 dígitos
    if (value.length >= 8) {
        event.target.value = value.slice(0, 7)
    }
})




/* Reference modal elements */

// Adicionando evento de Click no botão de fechar modal de selecionar referência
document.getElementById("bt-close-modal-reference").addEventListener("click", () => {
    const selectYear = document.getElementById('select-year-modal-reference');
    const selectMonth = document.getElementById('select-month-modal-reference');

    showModalReference(false)

    resetRef('all', selectYear, selectMonth)
})
// Adicionando evento de Click no botão de cancelar modal de selecionar referência
document.getElementById("bt-cancel-modal-reference").addEventListener("click", () => {
    const selectYear = document.getElementById('select-year-modal-reference');
    const selectMonth = document.getElementById('select-month-modal-reference');

    showModalReference(false)

    resetRef('all', selectYear, selectMonth)
})
// Adicionando evento de Change no select de ano da referência
document.getElementById('select-year-modal-reference').addEventListener("change", async (e) => {
    const selectMonth = document.getElementById('select-month-modal-reference');
    const value = e.target.value

    if (value != '') {
        resetRef('month', '', selectMonth)
        await findReferences('months', selectMonth, value)
        selectMonth.disabled = false
    }
})
// Adicionando evento de Click no botão de cancelar modal de selecionar referência
document.getElementById("bt-submit-modal-reference").addEventListener("click", async () => {
    const selectYear = document.getElementById('select-year-modal-reference');
    const selectMonth = document.getElementById('select-month-modal-reference');

    // Capturando a informação da referência selecionada
    const reference = getSelectedRef(selectYear, selectMonth)
    // Consultando no banco de dados os valores referentes a referência selecionada
    const calcValuesResp = await window.movement.calcValues(reference)
    // Enviando as informações para a função que lida com a cópia de saldo final
    handleCopyFinalBalance(calcValuesResp, reference)
})




/* Get description modal elements */

// Adicionando evento de Click no botão de fechar modal de buscar descrição
document.getElementById("bt-close-modal-getdescription").addEventListener("click", () => showModalGetDescription(false))
// Adicionando evento de Click no botão de cancelar modal de buscar descrição
document.getElementById("bt-cancel-modal-getdescription").addEventListener("click", () => showModalGetDescription(false))
// Adicionando evento de Click no botão de filtrar descrição no modal de buscar descrição
document.getElementById("bt-filter-description").addEventListener("click", () => {
    const inputFilter = document.getElementById('search-description')
    genFavoriteDescriptions(inputFilter.value)
})
// Adicionando evento de Click no botão de cancelar modal de buscar descrição
document.getElementById("bt-submit-modal-getdescription").addEventListener("click", () => handleGetFavoriteDescription())
// Variável responsável por guardar o ID do elemento que receberá a descrição favoritada
var idElemFavoriteDescription = ''


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
        favoriteDescription: form.elements['favorite-description'].checked,
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
        favoriteDescription: form.elements['favorite-description-alter'].checked
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
        const leng = length-1
        return value = value.slice(0, leng)
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
                    form.elements['favorite-description-alter'].checked = values.favoriteDescription

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
 * @description Função que lida com o preenchimento da tabela de descrições favoritas
 * @param {string} filter Parâmetro que recebe o filtro a ser considerado ao localizar as descrições
 */
async function genFavoriteDescriptions(filter) {
    const table = document.getElementById('table-descriptions')
    table.innerHTML = ''
    const descriptions = await window.movement.findDescriptions(filter)
    if (descriptions) {
        descriptions.map((description) => {
            const row = table.insertRow();
            row.classList.add('tr-search-description')
            row.addEventListener('click', (event) => {
                const rowParent = event.target.parentNode
                if (!rowParent.classList.contains('tr-search-description-selected')) {
                    cleanClass('tr-search-description-selected')
                    rowParent.classList.add('tr-search-description-selected')
                } else {
                    rowParent.classList.remove('tr-search-description-selected')
                }
                
            })
            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            const cell = row.insertCell();
            cell.classList.add('td-search-description')
            // Add some text to the new cells:
            cell.innerHTML = description;
        })
    }
}
/**
 * @description Função que lida com a busca das referências no banco de dados e preenche os combobox
 * @param {string} type Opções: 'years'; 'months' 
 * @param {element} elem Parâmetro que recebe o combobox a ser preenchido com as informações coletadas a partir do parâmetro type
 * @param {string} year Parâmetro que recebe o ano da referencia
*/
async function findReferences(type, elem, year) {

    showLoading(true)

    if (type === 'years') {
        // Consultando a ponte
        const findYearsResp = await window.movement.findYears()
        // Percorrendo e preenchendo a lista de anos
        findYearsResp.map((year) => {
            // Criando a nova option
            let newOption = new Option(year, year);
            // Enviando a nova option para o select
            elem.add(newOption, undefined);
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
            elem.add(newOption, undefined);
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
/**
 * @description Função que lida com a cópia do saldo final de uma referência
 * @param {number} value Valor que será informado no movimento
 * @param {object} reference Objeto que contém a referência selecionada
 */
function handleCopyFinalBalance(value, reference) {
    // Capturando os elementos da tela de inserir movimento
    const opBalance = document.getElementById('opening-balance')
    const typeMovement = document.getElementById("type-movement")
    const switchTypeValueMovement = document.getElementById("switch-type-value-movement")
    const dateMovementField = document.getElementById("date-movement")
    const originMovementField = document.getElementById('origin-movement')
    const switchMovementField = document.getElementById('type-value-movement')
    const valueMovementField = document.getElementById('value-movement')
    const descMovementField = document.getElementById('description-movement')
    // Capturando os elementos da referência
    const selectYear = document.getElementById('select-year-modal-reference');
    const selectMonth = document.getElementById('select-month-modal-reference');

    // Setando o checkbox como true
    opBalance.checked = true
    // Lidando com a inabilitação dos campos quando o checkbox for alterado
    handleOpeningBalanceChange(true, typeMovement, switchTypeValueMovement)

    // Capturando somente o ano e mês atual
    const dateNow = moment().format("YYYY-MM-DD").slice(0, 7)
    // Adicionando o dia 01 no ano e mês atual e setando no campo de data
    dateMovementField.value = `${dateNow}-01`

    // Convertendo o mês selecionado na referência para Fev
    const convertMonth = moment(`01/${reference.month}/2023`, 'DD/MM/YYYY').locale('pt-br').format('MMM')
    // Setando a informação no campo Origem da tela de inserir movimento
    originMovementField.value = `${convertMonth[0].toUpperCase()}${convertMonth.slice(1)}/${reference.year}`


    // Verificando se o valor final da referência é Despesa ou Receita
    if (value.finalBalance > 0) {
        switchMovementField.checked = false
    } else {
        switchMovementField.checked = true
    }
    // Setando o valor final no campo Valor da tela de inserir movimento
    valueMovementField.value = handleRoudValue(handleLengthValue(Math.abs(value.finalBalance), 7))


    // Setando uma descrição padrão no movimento
    descMovementField.value = 'Lançamento de saldo inicial'

    // Fechando o modal de selecionar a referência
    showModalReference(false)

    // Resetando a referência selecionada
    resetRef('all', selectYear, selectMonth)
}
/**
 * @description Função que lida com a cópia de uma descrição favoritada
 */
function handleGetFavoriteDescription() {
    const lineSelected = document.querySelectorAll('.tr-search-description-selected')
    const elementText = document.getElementById(idElemFavoriteDescription)
    if (lineSelected.length === 1) {
        const description = lineSelected[0].childNodes[0].innerHTML
        elementText.value = description
        showModalGetDescription(false)
    } else {
        Swal.fire({ title: "Erro", text: 'Selecione alguma informação para continuar.', icon: 'error', allowOutsideClick: false })
    }

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
 * @description Função que abre ou fecha o modal de selecionar referência
 * @param {boolean} param Esperado: true, false
 */
async function showModalReference(param) {
    // Buscando o modal de selecionar referência
    const modal = document.getElementById("overlay-modal-reference");
    // Buscando o combobox do ano da referência
    const selectYear = document.getElementById('select-year-modal-reference');

    if (param) {
        // Preenchendo o combobox de anos da referência
        await findReferences('years', selectYear)
        // Depois de preencher o combobox, mostrar o modal
        modal.style.display = "flex"
    } else if (!param) {
        // Fechando o modal
        modal.style.display = "none";
    }

}
/**
 * @description Função que abre ou fecha o modal de buscar descrição
 * @param {boolean} show Esperado: true, false
 * @param {string} elemID Esperado: ID do elemento que receberá o texto da descrição selecionada
 */
 async function showModalGetDescription(show, elemID) {
    // Buscando o modal de buscar descrição
    const modal = document.getElementById("overlay-modal-getdescription")
    const element = document.getElementById(elemID)
    const inputSearch = document.getElementById('search-description')

    if (show && element) {
        genFavoriteDescriptions()
        idElemFavoriteDescription = elemID
        // Depois de preencher o combobox, mostrar o modal
        modal.style.display = "flex"
    } else if (!show) {
        inputSearch.value = ''
        idElemFavoriteDescription = ''
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
 * @param {element} elemYear Combobox que contém o ano da referência
 * @param {element} elemMonth Combobox que contém o mês da referência
 * @returns {object} Retorna um objeto contendo o ano e o mês da referência selecionada
 */
function getSelectedRef(elemYear, elemMonth) {

    if (!elemYear.value) {
        Swal.fire({ title: "Erro", text: 'É obrigatório selecionar o Ano da referência', icon: 'error', allowOutsideClick: false })
    } else if (!elemMonth.value) {
        Swal.fire({ title: "Erro", text: 'É obrigatório selecionar o Mês da referência', icon: 'error', allowOutsideClick: false })
    }

    const ref = {
        year: elemYear.value,
        month: elemMonth.value
    }
    if (ref.year || ref.month) {
        return ref
    }
    return undefined
}
/**
 * @description Função que reseta os campos da referência
 * @param {string} type Opções: 'year'; 'month'; 'all'
 * @param {element} elemYear Combobox que será resetado caso as opções de type sejam 'year' ou 'all'
 * @param {element} elemMonth Combobox que será resetado caso as opções de type sejam 'month' ou 'all'
*/
function resetRef(type, elemYear, elemMonth) {

    switch (type) {
        case 'year':
            // Voltando o combobox ao valor padrão
            elemYear.value = ''
            // Limpando as options do combobox
            removeOptions(elemYear.id)
            break;
        case 'month':
            // Voltando o combobox ao valor padrão
            elemMonth.value = ''
            // Limpando as options do combobox
            removeOptions(elemMonth.id)
            break;
        case 'all':
            // Voltando o combobox ao valor padrão
            elemYear.value = ''
            elemMonth.value = ''
            // Limpando as options do combobox
            removeOptions(elemYear.id)
            removeOptions(elemMonth.id)
            // Desabilitando o combobox do mês da referência
            elemMonth.disabled = true
            break;
    }
}
/**
 * @description Função que limpa classe de todos elementos que a possui
 * @param {string} className Nome da classe que será limpa
*/
function cleanClass(className) {
    const elements = document.querySelectorAll(`.${className}`)
    elements.forEach((element) => {
        element.classList.remove(className)
    })
    
}