// 背单词的类实例
// main 构造出来这个实例，直接送出去即可
import fs from 'fs/promises'
import path from 'path'
class Words {
  database_path: string = '/Users/tanxuan21/Documents/FangCun/data/words/data.json'
  data: {
    [key: string]: string
  } = {}

  async load() {
    const json_str = await fs.readFile(this.database_path, 'utf-8')
    this.data = JSON.parse(json_str)
  }
}

export { Words }
// https://downloads.freemdict.com/100G_Super_Big_Collection/%E8%8B%B1%E8%AF%AD/%E6%99%AE%E9%80%9A%E8%AF%8D%E5%85%B8/%5B%E8%8B%B1%E6%B1%89%E5%8F%8C%E5%90%91%5D/
