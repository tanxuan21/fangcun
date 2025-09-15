import { AutoUpdaterAPI } from './API/AutoUpdater'
import { dialog_api } from './API/dialog'
import { file_api } from './API/Files'
import { SettingAPI } from './API/setting'
export type API = {
  saveBase64ToFile: (base64Data: string, filename: string) => Promise<void>
  loadPic: (filename: string) => Promise<string>
  Word_load: () => Promise<void>
  readFile: (filepath) => Promise<string>
  openTerminal: () => void
  fetchAudio: (text: string, lang: string) => Promise<string>
} & dialog_api &
  file_api &
  SettingAPI &
  AutoUpdaterAPI
