import { BrowserWindow, dialog } from 'electron'
import fs from 'fs/promises'
import Papa from 'papaparse'
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
  },
  'import-csv-file': async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'import CSV file',
      filters: [{ extensions: ['csv'], name: 'CSV Files' }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) {
      return null
    }

    const filePath = filePaths[0]
    const fileContent = await fs.readFile(filePath, 'utf-8')

    // 使用 PapaParse 解析 CSV 为对象数组
    const result = Papa.parse(fileContent, {
      header: true, // 首行作为 key
      skipEmptyLines: true // 跳过空行
    })

    return result.data // 对象数组
  }
})
