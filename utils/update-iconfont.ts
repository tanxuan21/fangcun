// download-iconfont.js
const fs = require('fs')
const https = require('https')

// https://at.alicdn.com/t/c/font_4422611_2mn6x5gm64n.js
const PROJECT_ID = 'YOUR_PROJECT_ID'

const ICONFONT_URL = `${'https:'}//at.alicdn.com/t/c/font_4422611_k68n3s1jtpq.js
`

const OUTPUT_FILE = 'src/renderer/src/assets/icon/iconfont.js'

https
  .get(ICONFONT_URL, (res) => {
    const file = fs.createWriteStream(OUTPUT_FILE)
    res.pipe(file)
    file.on('finish', () => {
      file.close()
      console.log('Iconfont 文件下载完成！')
    })
  })
  .on('error', (err) => {
    console.error('下载失败:', err)
  })
