import { BrowserWindow, dialog } from 'electron'
import fs from 'fs/promises'
export const IPC_File = (win: BrowserWindow) => ({
  'save-csv-file': async (event, book_name: string, content) => {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'save CSV file',
      defaultPath: `${book_name}.csv`,
      filters: [{ extensions: ['csv'], name: 'CSV Files' }]
    })

    if (!canceled && filePath) {
      fs.writeFile(filePath, content, 'utf-8')
      return filePath
    }
    return null
  }
})
