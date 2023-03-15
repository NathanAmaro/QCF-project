
// Consulta inicial ao iniciar o sistema
const initialVerifications = async () => {
    const configBridgeResp = await window.configBridge.config()
    return { configBridgeResp }
}
initialVerifications().then(async (resp) => {
    const usernameElement = document.getElementById('username-element')
    usernameElement.innerText = resp.configBridgeResp.username

    await findReferences('years')
})

//Função que remove options do select conforme seu ID
function removeOptions(selectId) {
    document.querySelectorAll(`#${selectId} option`).forEach((option) => {
        if (option.value != '') {
            option.remove()
        }
    })
}

//Função que gera as linhas da tabela
function genMovsTable(movements) {
    const lineBodyTable = document.getElementById("table-body");
    lineBodyTable.innerHTML = ''

    movements.map((movement) => {
        const element = document.createElement('div')
        element.classList.add('table-tr')
        element.innerHTML = `
        <div class="table-td">
            <button class="bt-delete-mov" onclick="deleteMov(event)"><img src="../build/trash-fill-red-500.svg" width="20" height="20" alt="Icon trash" /></button>
            <button class="bt-edit-mov"><img src="../build/pencil-fill-blue-500.svg" width="20" height="20" alt="Icon trash" /></button>
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
}

// Função que busca os movimentos da referência selecionada
async function findMovements(reference) {
    const movements = await window.movement.findMovs(reference)
    genMovsTable(movements)
}

/**
 * @description Função que reseta os campos da referência
 * @param {string. Esperado: 'year'; 'month'; 'all'} type
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

/**
 * @description Função que busca as referências e preenche os Combobox
 * @param string Esperado: 'years'; 'months' 
 * @param string Esperado: ano da referencia
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
 * @description Função que controla o modal de loading
 * @param boolean
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

// Função que captura a referência selecionada
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

// Função que controla o reset do formulário
function resetForm() {
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

// Função que controla o modal de inserir movimento
function showModal(param) {
    let modal = document.getElementById("overlay-modal");

    if (param) {
        // Abrindo o modal
        modal.style.display = "flex"
    } else if (!param) {
        // Resetando o formulário
        resetForm()
        // Fechando o modal
        modal.style.display = "none";
    }

}

// Função que controla o menu de exportações
function showMenuExports(param) {
    let menu = document.getElementById("menu-exports");

    if (param) {
        // Abrindo o modal
        menu.style.display = "flex"
    } else if (!param) {
        // Fechando o modal
        menu.style.display = "none";
    }

}

// Função que busca os totais de despesa e receita dos movimentos da referência
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

// Função que lida com o evento de exclusão de movimento na tabela
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
                console.log(returnExportXlsx)
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
                    Swal.fire({title: "Sucesso", text: `Arquivo gerado com sucesso!`, icon: 'success', allowOutsideClick: false})
                })
                .catch((err) => {
                    showLoading(false)
                    Swal.fire({ title: "Erro", text: 'Ocorreu um erro ao processar o arquivo.', icon: 'error', allowOutsideClick: false })
                })
            }
        })
    }
})

// Adicionando evento de Click no botão de buscar movimentos
document.getElementById("button-search-movements").addEventListener("click", async () => {
    const titRefTotalizers = document.getElementById('title-reference-totalizers');

    const ref = getSelectedRef()
    let convertMonth = moment(`01/${ref.month}/2023`, 'DD/MM/YYYY').locale('pt-br').format('MMMM')

    if (!ref) {
        titRefTotalizers.innerHTML = ''
    } else {
        titRefTotalizers.innerHTML = `${convertMonth[0].toUpperCase()}${convertMonth.slice(1)} de ${ref.year}`
    }

    showLoading(true)
    await calValuesMovs(ref)
    await findMovements(ref)
    showLoading(false)
})

// Adicionando evento de Click no botão de inserir novo movimento
document.getElementById("bt-new-register").addEventListener("click", () => {
    let dateMovementField = document.getElementById("date-movement")
    let now = moment().format("YYYY-MM-DD") // Capturando a data atual e mudando o formato

    // Mudando o valor do campo Data para a data atual
    dateMovementField.value = now

    // Exibindo o modal
    showModal(true)
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

// Adicionando evento de Click no botão de fechar modal
document.getElementById("bt-close-modal").addEventListener("click", () => showModal(false))

// Adicionando evento de Click no botão de cancelar modal
document.getElementById("bt-cancel-modal").addEventListener("click", () => showModal(false))

// Adicionando evento de submit no formulário
document.getElementById("form-modal").addEventListener("submit", (e) => formHandle(e))

// Adicionando evento Click no checkbox do Saldo Inicial
document.getElementById("opening-balance").addEventListener("change", function (e) {
    let typeMovement = document.getElementById("type-movement")
    let switchTypeValueMovement = document.getElementById("switch-type-value-movement")

    if (e.target.checked) {
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

// Função que lida com o Submit do Formulário
async function formHandle(event) {
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
                                    showModal(false)
                                } else if (result.isConfirmed) {
                                    // Resetando o formulário
                                    resetForm()
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