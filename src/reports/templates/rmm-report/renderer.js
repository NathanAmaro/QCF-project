// Execuções iniciais ao abrir o sistema
const initialVerif = async () => {

    await window.reportData.getData((_event, data) => {
        document.getElementById('username').innerHTML = `Usuário: ${data.username}`
        document.getElementById('emissonDate').innerHTML = `Emitido em: ${data.emissonDate}`
        document.getElementById('title-report').innerHTML = `Relatório de Movimentação Mensal - ${data.reference}`
        document.getElementById('cel-amount').innerHTML = `Quantidade: ${data.totalizers.amount}` 
        document.getElementById('cel-totalizers').innerHTML = data.totalizers.value



        data.movements.map((movement) => {
            const tbody = document.getElementById('tbody')
            const newRow = tbody.insertRow()
            newRow.classList.add('tr-tbody')
            const celNumber = newRow.insertCell(0).innerHTML = movement.id
            const celDate = newRow.insertCell(1).innerHTML = movement.date
            const celOpBalance = newRow.insertCell(2).innerHTML = movement.openingBalance
            const celType = newRow.insertCell(3).innerHTML = movement.type
            const celOrigin = newRow.insertCell(4).innerHTML = movement.origin
            const celOpDescription = newRow.insertCell(5).innerHTML = movement.description
            const celValue = newRow.insertCell(6).innerHTML = movement.value 
        })

        window.reportData.sendEndReport()
    })
}
initialVerif()