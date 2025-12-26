import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { LoadPic, SavePic } from './SavePic'
import fs from 'fs/promises'
import { createTerminal } from './terminal/terminal'
import { textToSpeechGoogle } from './fetch_audio'
import { IPCMAIN_HANDLE } from './IPCMAIN'
import { dialog_api } from '../../type/API/dialog'
import { IPC_Dialog } from './Dialog/Dialog'
import { IPC_File } from './File/File'
import { generalCSP, IPC_Setting } from './Setting/Setting'
import { GetMainWindow, SetMainWindow } from './MainWindow'
import { ListenUpdateEvent } from './AutoUpdater/AutoUpdater'
import { IPC_Video } from './Video/Video'
import { BIND_IPCMAIN_HANDLE } from './general'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    title: 'fangcun',
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      additionalArguments: []
    }
  })
  SetMainWindow(mainWindow)

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [generalCSP()]
      }
    })
  })

  mainWindow.setMenu(null)
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      console.error('mainWindow null')
      return
    }
    mainWindow.show()
    mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // 处理index.html
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  const mainWindow = GetMainWindow() // 获取MainWindow

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('save-base64-to-file', SavePic)
  ipcMain.handle('load-pic', LoadPic)

  ipcMain.handle('readFile', async (_event, filepath: string) => {
    const str = await fs.readFile(filepath, 'utf-8')
    return str
  })
  ipcMain.handle('open-terminal', () => {
    createTerminal(mainWindow as BrowserWindow)
  })

  ipcMain.handle('fetch-audio', (_event, text: string, lang: string) => {
    return textToSpeechGoogle(text, lang)
  })

  if (mainWindow) {
    IPCMAIN_HANDLE(IPC_File(mainWindow))
    IPCMAIN_HANDLE(IPC_Dialog(mainWindow))
    IPCMAIN_HANDLE(IPC_Video(mainWindow))
    ListenUpdateEvent(mainWindow)
    BIND_IPCMAIN_HANDLE(mainWindow)
  } else console.error('null mainWindow', mainWindow)
  IPCMAIN_HANDLE(await IPC_Setting()) // 软件设置 API

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
