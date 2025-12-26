import { BrowserWindow, dialog } from 'electron'

export const IPC_api2 = (win: BrowserWindow) => ({
  'upload-video2': async (event, a: number, b: string) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'upload video',
      properties: ['openFile']
    })
  },
  'remove-video2': async (event, c: boolean, d: string[]) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'upload video',
      properties: ['openFile']
    })
  }
})
