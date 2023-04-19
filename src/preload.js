const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('config', {
    getConfig: () => ipcRenderer.invoke('get-config'),
    alterUsername: (name) => ipcRenderer.invoke('alter-username', name)
})

contextBridge.exposeInMainWorld('movement', {
    create: (formData) => ipcRenderer.invoke('create-movement', formData),
    delete: (id) => ipcRenderer.invoke('delete-movement', id),
    update: (id, formData) => ipcRenderer.invoke('update-movement', id, formData),
    find: (id) => ipcRenderer.invoke('find-movement', id),
    findDescriptions: (filter) => ipcRenderer.invoke('find-favorite-descriptions', filter),
    findOpBalance: (date) => ipcRenderer.invoke('find-opening-balance', date),
    findMovs: (reference) => ipcRenderer.invoke('find-movements', reference),
    findYears: () => ipcRenderer.invoke('find-reference-years'),
    findMonths: (year) => ipcRenderer.invoke('find-reference-months', year),
    calcValues: (reference) => ipcRenderer.invoke('totals-value-movements', reference),
    exportXlsx: (reference) => ipcRenderer.invoke('gen-xlsx-file', reference),
    exportPdf: (reference, totalizers) => ipcRenderer.invoke('gen-pdf-file', reference, totalizers)
})
