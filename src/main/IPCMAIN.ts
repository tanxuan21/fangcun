import { ipcMain, IpcMainInvokeEvent } from "electron";

export function IPCMAIN_HANDLE(mapping: { [key: string]: (event: IpcMainInvokeEvent, ...args: any[]) => any }) {
  for (const key in mapping) {
    ipcMain.handle(key,mapping[key])
  }
}
