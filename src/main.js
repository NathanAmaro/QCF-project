const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const xl = require('excel4node');
const sequelize = require('sequelize')
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const db = require('./models/db')
const Movement = require('./models/movementModel')
const RMMReport = require('./reports')

const createWindow = () => {
    // Criando uma janela
    const mainWindow = new BrowserWindow({
        minHeight: 800,
        minWidth: 600,
        icon: path.join(__dirname, '../build/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            devTools: true,
        }
    })

    // Carregando o arquivo index.html na aplicação.
    mainWindow.loadFile('src/index.html')

    // Removendo a menu bar
    mainWindow.setMenu(null)

    // Abrir janela maximizada
    mainWindow.maximize()

}

// Este método será chamado quando o Electron terminar a
// inicialização e está pronto para criar janelas do navegador.
// Algumas APIs só podem ser usadas após a ocorrência desse evento.
app.on('ready', createWindow)

// Abra uma janela se nenhuma estiver aberta (macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Sai quando todas as janelas estiverem fechadas, exceto no macOS. Lá é comum
// para aplicativos e sua barra de menus permanecerem ativos até que o usuário saia
// explicitamente com Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Sincronizando a database
const syncDB = async () => {
    const database = db;

    try {
        const resultado = await database.sync({ alter: true });
    } catch (error) {
        throw new Error(error.message)
    }
}
syncDB()

// Criando a ponte config
ipcMain.handle('get-config', () => {
    // Lendo o arquivo config.json e exportando em uma variável
    var rawconfig = fs.readFileSync(path.join(__dirname, '../config.json'));
    var configJSON = JSON.parse(rawconfig);
    return configJSON
})

// Criando a ponte que altera o nome do usuário no arquivo config
ipcMain.handle('alter-username', (event, name) => {
    const data = {
        username: name
    }

    // Escrevendo o username no arquivo config
    fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(data, ['username'], 4), 'utf-8');
})

// Ponte que consulta o saldo de abertura do mês
ipcMain.handle('find-opening-balance', async (event, date) => {

    try {
        const movement = await Movement.findOne({
            where: {
                date: {
                    [sequelize.Op.like]: `%${moment(date, 'YYYY-MM-DD').format('MM')}/${moment(date, 'YYYY-MM-DD').format('YYYY')}`
                },
                openingBalance: 1
            }
        })
        return movement
    } catch (err) {
        throw new Error(err.message)
    }

})

// Criando a ponte create-movement
ipcMain.handle('create-movement', async (event, formData) => {
    // Formatando a data do movimento
    const dateFormated = moment(formData.date, 'YYYY-MM-DD').format('DD/MM/YYYY')

    // Formatando o tipo de movimento
    const typeFormated = () => {
        if (!formData.opBalance) { // Se não for um lançamento de saldo inicial
            let type = formData.type === 'D' ? 'Despesa' : 'Receita'
            return type
        } else { // Se for um lançamento de saldo inicial
            let type = formData.typeValue === true ? 'Despesa' : 'Receita'
            return type
        }
    }

    try {
        const movement = await Movement.create({
            openingBalance: formData.opBalance,
            date: dateFormated,
            type: typeFormated(),
            origin: formData.origin,
            value: formData.value,
            description: formData.description,
            favoriteDescription: formData.favoriteDescription,
        })
        return movement
    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que busca informações de um movimento por seu ID
ipcMain.handle('find-movement', async (event, idMov) => {
    try {
        const movement = await Movement.findOne({
            where: {
                id: idMov
            }
        })

        return movement
    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que busca informações de um movimento por seu ID
ipcMain.handle('find-favorite-descriptions', async (event, filter) => {
    try {
        const movements = await Movement.findAll({
            attributes: ['description'],
            group: 'description',
            where: {
                description: {
                    [sequelize.Op.like]: filter ? `%${filter}%` : '%%'
                },
                favoriteDescription: true
            }
        })
        let descriptions = []
        // Percorrendo os elementos da consulta
        movements.map((element) => {
            descriptions.push(element.dataValues.description)
        })
        return descriptions
    } catch (err) {
        throw new Error(err.message)
    }
})

// Criando a ponte create-movement
ipcMain.handle('delete-movement', async (event, id) => {

    try {
        const movement = await Movement.destroy({
            where: {
                id: id
            }
        })

        db.query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='movements'");

        return movement
    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que altera informações do movimento
ipcMain.handle('update-movement', async (event, idMov, formData) => {
    // Formatando a data do movimento
    const dateFormated = moment(formData.date, 'YYYY-MM-DD').format('DD/MM/YYYY')

    // Formatando o tipo de movimento
    const typeFormated = () => {
        if (!formData.opBalance) { // Se não for um lançamento de saldo inicial
            let type = formData.type === 'D' ? 'Despesa' : 'Receita'
            return type
        } else { // Se for um lançamento de saldo inicial
            let type = formData.typeValue === true ? 'Despesa' : 'Receita'
            return type
        }
    }

    try {
        const movement = await Movement.update({
            openingBalance: formData.opBalance,
            date: dateFormated,
            type: typeFormated(),
            origin: formData.origin,
            value: formData.value,
            description: formData.description,
        }, {
            where: {
                id: idMov
            }
        })
    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que busca todos os anos
ipcMain.handle('find-reference-years', async () => {
    try {
        const refs = await Movement.findAll({
            attributes: ['date'],
            group: 'date'
        })
        let listYears = []
        // Percorrendo os elementos da consulta e formatando as datas
        refs.map((element) => {
            let date = element.dataValues.date
            listYears.push(moment(date, "DD/MM/YYYY").format('YYYY'))
        })
        // Removendo duplicatas
        listYears = [...new Set(listYears)]

        return listYears

    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que busca todas os meses de algum ano
ipcMain.handle('find-reference-months', async (event, year) => {
    try {
        const refs = await Movement.findAll({
            where: {
                date: {
                    [sequelize.Op.like]: `%/${year}`
                }
            },
            attributes: ['date'],
            group: 'date'
        })
        let listMonths = []
        // Percorrendo os elementos da consulta e formatando as datas
        refs.map((element) => {
            let date = element.dataValues.date
            listMonths.push(moment(date, "DD/MM/YYYY").format('MM'))
        })
        // Removendo duplicatas
        listMonths = [...new Set(listMonths)]

        return listMonths

    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que busca todos os movimentos de um determinado mês
ipcMain.handle('find-movements', async (event, reference) => {
    const convertNumberMonth = String(reference.month).padStart(2, '0');
    try {
        const movements = await Movement.findAll({
            where: {
                date: {
                    [sequelize.Op.like]: `%${convertNumberMonth}/${reference.year}`
                }
            },
            order: [
                ['openingBalance', 'DESC'],
                ['date', 'ASC'],
                ['id', 'ASC'],
            ],
        })
        const listMovs = []
        movements.map((movement) => {
            listMovs.push(movement.dataValues)
        })

        return listMovs
    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que calcula os valores de receita e despesa da referência
ipcMain.handle('totals-value-movements', async (event, reference) => {

    const convertNumberMonth = String(reference.month).padStart(2, '0');
    try {
        const movements = await Movement.findAll({
            attributes: ['id', 'openingBalance', 'type', 'value'],
            where: {
                date: {
                    [sequelize.Op.like]: `%${convertNumberMonth}/${reference.year}`
                }
            }
        })
        const valuesDesp = []
        const valuesReceit = []
        const valueOpeningBalance = { desp: 0, receit: 0 }
        movements.map((movement) => {
            if (!movement.dataValues.openingBalance) {
                if (movement.dataValues.type === 'Despesa') {
                    valuesDesp.push(movement.dataValues.value)
                } else if (movement.dataValues.type === 'Receita') {
                    valuesReceit.push(movement.dataValues.value)
                }
            } else {
                if (movement.dataValues.type === 'Despesa') {
                    valueOpeningBalance.desp = movement.dataValues.value
                } else if (movement.dataValues.type === 'Receita') {
                    valueOpeningBalance.receit = movement.dataValues.value
                }
            }
        })
        const totalDesp = valuesDesp.reduce((a, b) => a + b, 0)
        const totalReceit = valuesReceit.reduce((a, b) => a + b, 0)

        const calcFinalBalance = (valueOpeningBalance.receit + totalReceit) - (valueOpeningBalance.desp + totalDesp)

        return { despesa: totalDesp, receita: totalReceit, finalBalance: calcFinalBalance }
    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que gera o arquivo XLSX dos movimentos da referência selecionada
ipcMain.handle('gen-xlsx-file', async (event, reference) => {
    const convertNumberMonth = String(reference.month).padStart(2, '0');
    const fileName = moment().format('DD-MM-YYYY-HH-mm')

    try {
        const movements = await Movement.findAll({
            where: {
                date: {
                    [sequelize.Op.like]: `%${convertNumberMonth}/${reference.year}`
                }
            },
            order: [
                ['openingBalance', 'DESC'],
                ['date', 'ASC'],
                ['id', 'ASC'],
            ],
        })
        const listMovs = []
        movements.map((movement) => {
            listMovs.push(movement.dataValues)
        })

        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Planilha 1');

        await dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        }).then(result => {
            if (result.canceled) {
                return false
            }
            const headingColumnNames = Object.keys(movements[0].dataValues)

            let headingColumnIndex = 1; //diz que começará na primeira linha
            headingColumnNames.forEach(heading => { //passa por todos itens do array
                // cria uma célula do tipo string para cada título
                ws.cell(1, headingColumnIndex++).string(heading);
            });

            let rowIndex = 2; //começa na linha 2
            listMovs.forEach(record => { //passa por cada item do data
                let columnIndex = 1; //diz para começar na primeira coluna
                //transforma cada objeto em um array onde cada posição contém as chaves do objeto (name, email, cellphone)
                Object.keys(record).forEach(columnName => {
                    //cria uma coluna do tipo string para cada item
                    if (columnName === 'value' || columnName === 'id') {
                        ws.cell(rowIndex, columnIndex++).number(record[columnName])
                    } else {
                        ws.cell(rowIndex, columnIndex++).string(record[columnName].toString())
                    }
                });
                rowIndex++; //incrementa o contador para ir para a próxima linha
            });

            wb.write(`${result.filePaths}/${fileName}.xlsx`)
        }).catch(err => {
            throw new Error(err.message)
        })

    } catch (err) {
        throw new Error(err.message)
    }
})

// Ponte que gera o arquivo PDF dos movimentos da referência selecionada
ipcMain.handle('gen-pdf-file', async (event, reference, totalizers) => {

    ipcMain.removeAllListeners(['gen-pdf-file'])

    // Lendo o arquivo config.json e salvando em uma variável
    const rawconfig = fs.readFileSync(path.join(__dirname, '../config.json'));
    const configJSON = JSON.parse(rawconfig);

    const emissionDate = moment().format('DD/MM/YYYY HH:mm')

    const convertNumberMonth = String(reference.month).padStart(2, '0');
    const convertMonth = moment(`01/${convertNumberMonth}/${reference.year}`, 'DD/MM/YYYY', 'pt-br').format('MMMM')

    try {
        const movements = await Movement.findAll({
            where: {
                date: {
                    [sequelize.Op.like]: `%${convertNumberMonth}/${reference.year}`
                }
            },
            order: [
                ['openingBalance', 'DESC'],
                ['date', 'ASC'],
                ['id', 'ASC'],
            ],
        })
        const listMovs = []
        movements.map((movement) => {
            // Convertendo a flag de saldo inicial
            movement.dataValues.openingBalance ? movement.dataValues.openingBalance = 'Sim' : movement.dataValues.openingBalance = 'Não'

            // Convertendo o valor para duas casas decimais
            movement.dataValues.value = parseFloat(movement.dataValues.value).toFixed(2).toString().replace('.', ',')
            listMovs.push(movement.dataValues)
        })

        await dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        }).then(async (result) => {
            if (!result.canceled) {
                await RMMReport({
                    username: configJSON.username,
                    emissonDate: emissionDate,
                    reference: `${convertMonth[0].toUpperCase()}${convertMonth.slice(1)}/${reference.year}`,
                    movements: listMovs,
                    totalizers: {
                        amount: listMovs.length,
                        value: parseFloat(totalizers.finalBalance).toFixed(2).toString().replace('.', ',')
                    }
                }, result.filePaths)
                    .then((res) => {
                        return 'Arquivo gerado com sucesso!'
                    })
                    .catch((err) => {
                        throw new Error(err.message)
                    })
            } else {
                throw new Error('Operação cancelada')
            }

        }).catch(err => {
            throw new Error(err.message)
        })

    } catch (err) {
        throw new Error(err.message)
    }
})