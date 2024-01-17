const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
app.on("ready", ()=>{
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            zoomFactor: 1.0,
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadURL(`${app.getAppPath()}\\build\\index.html`)
})
