import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveBase64ToFile: (base64Data: string, filename: string) => Promise<void>
      loadPic: (filename: string) => Promise<string>
    }
  }
}
