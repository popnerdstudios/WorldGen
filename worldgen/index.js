const { app, BrowserWindow, ipcMain } = require("electron");
const knex = require('knex')(require('./knexfile').development);

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
});

ipcMain.on('add-world', async (event, worldData) => {
    try {
      const [id] = await knex('worlds').insert({
        name: worldData.name,
        description: worldData.description,
        size: worldData.size
      });
      event.reply('add-world-response', { id: id, status: 'success' });
    } catch (error) {
      event.reply('add-world-response', { status: 'error', message: error.message });
    }
  });

ipcMain.on('get-worlds', async (event) => {
    try {
        const worlds = await knex('worlds').select('*');
        event.reply('get-worlds-response', { status: 'success', data: worlds });
    } catch (error) {
        event.reply('get-worlds-response', { status: 'error', message: error.message });
    }
});

ipcMain.on('delete-world', async (event, worldId) => {
    try {
        await knex('worlds').where({ id: worldId }).delete();
        event.reply('delete-world-response', { status: 'success', id: worldId });
    } catch (error) {
        event.reply('delete-world-response', { status: 'error', message: error.message });
    }
});

