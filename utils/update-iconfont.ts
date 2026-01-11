// download-iconfont.js
const fs = require('fs')
const https = require('https')

// https://at.alicdn.com/t/c/font_4422611_2mn6x5gm64n.js
const PROJECT_ID = 'YOUR_PROJECT_ID'

const OUTPUT_FILE = 'src/renderer/src/assets/icon/iconfont.js'
const main = () => {
  const params = process.argv
  if (params.length < 3) {
    console.error('params error!', params)
    return
  }

  const address = params[2]
  const ICONFONT_URL = `https:${address}`
  console.log(`fetch ${ICONFONT_URL}`)
  https
    .get(ICONFONT_URL, (res: any) => {
      const file = fs.createWriteStream(OUTPUT_FILE)
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log('Iconfont 文件下载完成！')
      })
    })
    .on('error', (err: any) => {
      console.error('下载失败:', err)
    })
}
main()
