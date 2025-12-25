import express, { Request, Response } from 'express'

import cors from 'cors'
import { exit } from 'node:process'
import booksRouter from './recite/books-routes'
import dailyRouter from './daily/daily-route'
import cardsRouter from './recite/cards-routes'
import videoRouter from './video/video-router'
// import AssetsRouter from './assets/assets-router'
const app = express()

const PORT = 3001

app.use(
  cors({
    origin: [`http://localhost:5173`]
  })
)
app.use(express.json())

app.use('/api/recite/books', booksRouter)
app.use('/api/recite/cards', cardsRouter)
app.use('/api/daily', dailyRouter)
// app.use('/api/assets')
app.use('/api', videoRouter)

app.get('/api', (req: Request, res: Response) => {
  console.log(req)
  res.json({ message: 'Electron + Express API' })
})

app.listen('3001', () => {
  console.log(`Express server running on http://localhost:${PORT}`)
})
// test() // 测试数据库，应该会给数据库添加一些东西。
/**
// 在渲染进程中
fetch('http://localhost:3001/api')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => console.error('Error connecting to server:', err));
 */
