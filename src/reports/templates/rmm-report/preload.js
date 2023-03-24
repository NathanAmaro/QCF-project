const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('reportData', {
    getData: (callback) => ipcRenderer.on('report-data', callback),
    sendEndReport: () => ipcRenderer.send('report-end')
})