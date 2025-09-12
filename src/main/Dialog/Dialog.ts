import { dialog, ipcMain } from 'electron'

// 只建立 key 和 function 的映射，届时使用ipcMain.handle逐一绑定
export const IPC_Dialog = (win: Electron.BaseWindow) => ({
  'select-folder': async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    return result.filePaths
  }
})
