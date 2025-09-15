import { ipcRenderer } from 'electron'
import { AutoUpdaterAPI } from '../../../type/API/AutoUpdater'

export const AutoUpdaterExpose: () => AutoUpdaterAPI = () => {
  return {
    onUpdateAvaliable: (callback) => ipcRenderer.on('update_abvaliable', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
    restartApp: () => ipcRenderer.send('restart_app')
  }
}
