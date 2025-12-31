export interface AutoUpdaterAPI {
  onUpdateAvaliable: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => void
  onUpdateDownloaded: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => void
  restartApp: () => void
}
