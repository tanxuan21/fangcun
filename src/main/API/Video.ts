import { BrowserWindow, dialog } from 'electron'

export const IPC_Video = (win: BrowserWindow) => ({
  'upload-video': async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'upload video',
      properties: ['openFile']
    })
  }
})
