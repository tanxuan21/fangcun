import { Router, Response, Request } from 'express'
import { ReciteDataBaseInstance } from '../database/database'
import { makeSuccessRep, ReqServerErrorFilter } from '../utils'

const router = Router()

// 获取所有卡片本
router.get(
  '/get/',
  ReqServerErrorFilter((req, res: Response) => {
    const books = ReciteDataBaseInstance.get_all_books()
    makeSuccessRep(res, books)
  })
)

router.get(
  '/get/:book_id',
  ReqServerErrorFilter((req: Request, res) => {
    const book_id = parseInt(req.params['book_id'])
    const book = ReciteDataBaseInstance.get_book(book_id)
    makeSuccessRep(res, book)
  })
)
// 删除卡片本
router.delete(
  '/delete/:book_id',
  ReqServerErrorFilter((req: Request, res: Response) => {
    const book_id = parseInt(req.params.book_id)
    if (book_id) {
      ReciteDataBaseInstance.delete_book(book_id)
      makeSuccessRep(res)
      return
    } else {
      res.status(400).json({
        success: false,
        message: 'illegal params'
      })
    }
  })
)

// 更新卡片本信息
router.post(
  '/update/:book_id',
  ReqServerErrorFilter((req: Request, resp: Response) => {
    const book_id = parseInt(req.params.book_id)
    const updates = req.body
    console.log(updates)

    ReciteDataBaseInstance.update_book_info(book_id, updates)
    makeSuccessRep(resp)
  })
)

// 添加卡片本
router.post(
  '/add/',
  ReqServerErrorFilter(async (req: Request, res: Response) => {
    const { name, description } = req.body
    const book_id = ReciteDataBaseInstance.add_book(name, description)
    makeSuccessRep(res, {
      book_id
    })
  })
)

export default router
