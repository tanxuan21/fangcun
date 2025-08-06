import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  saveBase64ToFile: async (base64Data, filename) => {
    return await ipcRenderer.invoke('save-base64-to-file', base64Data, filename)
  },
  loadPic: async (filemane) => {
    return await ipcRenderer.invoke('load-pic', filemane)
  },
  getWordsInstance: async () => {
    return await ipcRenderer.invoke('get-words-instance')
  },
  Word_load: async () => {
    return await ipcRenderer.invoke('Word:load')
  },
  readFile: async (filepath: string) => {
    return await ipcRenderer.invoke('readFile', filepath)
  },
  openTerminal: () => {
    return ipcRenderer.invoke('open-terminal')
  },
  fetchAudio: async (text: string, lang: string = 'en') => {
    return await ipcRenderer.invoke('fetch-audio', text, lang)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
