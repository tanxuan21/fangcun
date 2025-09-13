import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
export const PreProcessing = () => {
  const nonceIcon = crypto.randomBytes(16).toString('base64')
  const nonceApp = crypto.randomBytes(16).toString('base64')

  async function loadIndexHtml(nonceIcon: string, nonceApp: string) {
    const indexPath = path.join(__dirname, '../renderer/index.html')
    let html = await fs.readFile(indexPath, 'utf8')
    html = html
      .replace('nonce="iconfont"', `nonce="${nonceIcon}"`)
      .replace('nonce="app"', `nonce="${nonceApp}"`)
    return html
  }
}
