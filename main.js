const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// listen for app to be ready
app.on('ready', function(){
    // create new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true
        }
    });
    // load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        rotocol: 'file:',
        slashes: true
    }));
    // quit app when closed (for all windows)
    mainWindow.on('closed', function(){
        app.quit();
    });

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu)
});

// creating add window
function createAddWindow(){
    //create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add shopping list',
        webPreferences: {
            nodeIntegration: true
        }
    });
    // load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        rotocol: 'file:',
        slashes: true
    }));
    // collection rubber
    addWindow.on('close', function(){
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close;
})

// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+W' :
                'Ctrl+W',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// add dev tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developertools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}