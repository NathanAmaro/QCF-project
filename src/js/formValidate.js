async function formValidate(formData) {
    console.log(formData)

    // Verificando se o saldo inicial ou tipo de movimento está informado
    if (!formData.opBalance && formData.type === '' ) {
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