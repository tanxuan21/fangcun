import { ElectronAPI } from '@electron-toolkit/preload'
import { Words } from '../main/words'
import fs from 'fs/promises'
declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveBase64ToFile: (base64Data: string, filename: string) => Promise<void>
      loadPic: (filename: string) => Promise<string>
      getWordsInstance: () => Words
      Word_load: () => Promise<void>
      readFile: (filepath) => Promise<string>
    }
  }
}
