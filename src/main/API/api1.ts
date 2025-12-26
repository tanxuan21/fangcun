import { BrowserWindow, dialog } from 'electron'

export const IPC_api1 = (win: BrowserWindow) => ({
  'upload-video0': async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'upload video',
      properties: ['openFile']
    })
  },
  'remove-video0': async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'upload video',
      properties: ['openFile']
    })
  }
})
