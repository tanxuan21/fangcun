import Database from 'better-sqlite3'
import { db } from './sqlite'
import * as googleTTS from 'google-tts-api'

import fs from 'fs'
import https from 'https'
const a: number = 1
console.log('a', 1)
// function sqlite_test() {
//   // 创建表
//   db.prepare(
//     `
//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     age INTEGER
//   )
// `
//   ).run()

//   // 插入数据
//   const insert = db.prepare('INSERT INTO users (name, age) VALUES (?, ?)')
//   insert.run('Alice', 25)
//   insert.run('Bob', 30)

//   // 查询数据
//   const select = db.prepare('SELECT * FROM users')
//   const users = select.all()

//   // 封装为类

//   type User = { id: number; name: string; age: number }

//   class UserService {
//     private db = new Database('my-database.db')

//     constructor() {
//       this.db
//         .prepare(
//           `
//       CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL,
//         age INTEGER
//       )
//     `
//         )
//         .run()
//     }

//     create(name: string, age: number) {
//       return this.db.prepare('INSERT INTO users (name, age) VALUES (?, ?)').run(name, age)
//     }

//     findAll(): User[] {
//       return this.db.prepare('SELECT * FROM users').all() as User[]
//     }

//     findById(id: number): User | undefined {
//       return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User
//     }
//   }

//   console.log(users) // => [{ id: 1, name: 'Alice', age: 25 }, ...]
// }

function googletts_test() {
  const text = 'Hello, how are you today?'

  function textToSpeechGoogle(text: string) {
    // 获取音频的 URL（Google TTS 会返回一个音频 URL）
    console.log(googleTTS) // 打印出来是 undefined

    const url = googleTTS.getAudioUrl(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com'
    })

    // 下载音频并保存为文件
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream('output.mp3')
      response.pipe(fileStream)
      fileStream.on('finish', () => {
        console.log('Audio saved as output.mp3')
      })
    })
  }

  textToSpeechGoogle(text)
}

googletts_test()
