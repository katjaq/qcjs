const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
//const Menu = electron.Menu
const app = electron.app
const path = require('path')
const url = require('url')
const ipc = require('electron').ipcMain

const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1200, height: 600})

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
}

ipc.on('asynchronous-message', function (event, path) {
    var arr = fs.readdirSync(path);
    var dir = [];
    for(f in arr) {
        if(arr[f].slice(0,4)=='sub-') {
            dir.push(arr[f]);
        }
    }
    event.sender.send('asynchronous-reply', JSON.stringify(dir))
})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
    createWindow();
    //const menu = Menu.buildFromTemplate(template)
    //Menu.setApplicationMenu(menu)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
