const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
app.on("ready", ()=>{
    mainWindow = new BrowserWindow({
        width: 850,
        height: 500,
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadURL(`${app.getAppPath()}\\build\\index.html`)
})
