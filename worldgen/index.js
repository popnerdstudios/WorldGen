const { app, BrowserWindow, ipcMain } = require("electron");
const knex = require('knex')(require('./knexfile').development);
const fs = require('fs');
const path = require('path');

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
        size: worldData.size,
        hex_color: worldData.hexColor || '#404040' 
      });
      event.reply('add-world-response', { id: id, status: 'success' });
    } catch (error) {
      event.reply('add-world-response', { status: 'error', message: error.message });
    }
});


  ipcMain.on('get-world', async (event, worldId) => {
    try {
        const world = await knex('worlds').where({ id: worldId }).first();
        if (world) {
            event.reply('get-world-response', { status: 'success', data: world });
        } else {
            event.reply('get-world-response', { status: 'error', message: 'World not found' });
        }
    } catch (error) {
        event.reply('get-world-response', { status: 'error', message: error.message });
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

ipcMain.on('edit-world', async (event, updatedWorldData) => {
    try {
        await knex('worlds')
            .where({ id: updatedWorldData.id })
            .update({
                name: updatedWorldData.name,
                description: updatedWorldData.description,
                hex_color: updatedWorldData.hexColor
            });
        event.reply('edit-world-response', { status: 'success', id: updatedWorldData.id });
    } catch (error) {
        event.reply('edit-world-response', { status: 'error', message: error.message });
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


ipcMain.on('save-canvas-images', (event, data) => {
    const { mainCanvas, heightmapCanvas, thirdMapCanvas, folderPath } = data;

    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const saveImage = (base64Data, filename) => {
        const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
        fs.writeFileSync(path.join(folderPath, filename), buffer);
    };

    saveImage(mainCanvas, 'main-map.png');
    saveImage(heightmapCanvas, 'heightmap.png');
    saveImage(thirdMapCanvas, 'third-map.png');
});


