const { BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

const RMMReport = async (data, pathFile) => {
  const fileName = moment().format('DD-MM-YYYY-HH-mm-ss')

  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, './templates/rmm-report/preload.js'),
      devTools: false,
    }
  })

  window.loadFile(path.join(__dirname, './templates/rmm-report/index.html'))


  window.webContents.on('did-finish-load', () => {
    window.webContents.send('report-data', data)

  });

  var options = {
    printBackground: true,
    pageSize: 'A4',
    margins: {
      top: 0.4,
      bottom: 0.4,
      left: 0.4,
      right: 0.4,
    },
    scale: 0.85
  }

  ipcMain.on('report-end', (event) => {

    const winPDF = BrowserWindow.fromWebContents(event.sender)

    winPDF.webContents.printToPDF(options).then((data) => {
      fs.writeFileSync(`${pathFile}/${fileName}.pdf`, data, error => {
        if (error) throw error
      })
    }).catch((error) => {
      throw new error
    })
  })
}

module.exports = RMMReport