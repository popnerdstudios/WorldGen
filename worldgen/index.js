const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
app.on("ready", ()=>{
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadURL(`${app.getAppPath()}\\build\\index.html`)
})
