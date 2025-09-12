import { dialog_api } from './API/dialog'
import { file_api } from './API/Files'
export type API = {
  saveBase64ToFile: (base64Data: string, filename: string) => Promise<void>
  loadPic: (filename: string) => Promise<string>
  Word_load: () => Promise<void>
  readFile: (filepath) => Promise<string>
  openTerminal: () => void
  fetchAudio: (text: string, lang: string) => Promise<string>
} & dialog_api &
  file_api
