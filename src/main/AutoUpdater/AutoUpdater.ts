import { BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
export const IPC_AutoUpdater = (win: BrowserWindow) => {
  return {}
}

export const ListenUpdateEvent = (mainWindow: BrowserWindow) => {
  autoUpdater.on('update-available', () => {
    // 有可用新版本触发
    mainWindow.webContents.send('update_available')
  })

  // 下载完成
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded')
  })

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall()
  })
}
