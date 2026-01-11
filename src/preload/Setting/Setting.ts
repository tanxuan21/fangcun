import { ipcRenderer } from 'electron'
import { SettingAPI } from '../../../types/API/setting'

export const SettingExpose: () => SettingAPI = () => {
  return {
    getAll: async () => {
      return await ipcRenderer.invoke('get-all')
    },
    getItem: (key) => {
      return ipcRenderer.invoke('get-item', key)
    },
    setItem: async (key, value) => {
      return await ipcRenderer.invoke('set-item', key, value)
    },
    setAll: async (next) => {
      return await ipcRenderer.invoke('set-all', next)
    }
  }
}
