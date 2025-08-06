import { is } from '@electron-toolkit/utils'
import { BrowserWindow } from 'electron'
import path from 'path'

function createTerminal(parentWindow: BrowserWindow) {
  const t = new BrowserWindow({
    width: 400,
    height: 300,
    parent: parentWindow,
    modal: false, // 不是模态窗口，不阻塞父窗口
    show: false, // 加载完显示
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  t.setMenu(null)
  if (is.dev) {
    const terminal_url = process.env['ELECTRON_RENDERER_URL'] + '/terminal/terminal.html'
    t.loadURL(terminal_url)
  } else {
    t.loadFile(path.join(__dirname, '../../renderer/terminal/terminal.html'))
  }

  t.once('ready-to-show', () => {
    t.show()
  })
}

export { createTerminal }
