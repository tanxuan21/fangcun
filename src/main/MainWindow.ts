import { BrowserWindow } from 'electron'

let mainWindow: null | BrowserWindow = null

export const GetMainWindow = () => {
  return mainWindow
}

export const SetMainWindow = (w) => {
  mainWindow = w
}
