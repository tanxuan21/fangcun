import { ElectronAPI } from '@electron-toolkit/preload'
import { Words } from '../main/words'
import fs from 'fs/promises'
import { API } from '../../type/API'
declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
