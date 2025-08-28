// 创建卡片

import { Router, Response, Request } from 'express'
import { HTTP_422_check, Make422Resp, makeSuccessRep, ReqServerErrorFilter } from '../utils'
import { ReciteCardsDataBaseInstance } from '../database/database'

const router = Router()

// 添加卡片
router.post(
  '/add/',
  ReqServerErrorFilter((req, res: Response) => {
    const data = req.body
    if (HTTP_422_check(data, ['Q', 'A', 'book_id'])) {
      const card_id = ReciteCardsDataBaseInstance.add_card(data['Q'], data['A'], data['book_id'])
      makeSuccessRep(res, {
        card_id
      })
    } else {
      Make422Resp(res)
    }
  })
)

router.post(
  '/add/multiple/',
  ReqServerErrorFilter((req: Request, res: Response) => {
    const data = req.body
    const result = ReciteCardsDataBaseInstance.add_cards_list(data['cards_list'], data['book_id'])
    if (result.success) {
      makeSuccessRep(res, result.data)
    } else {
      res.status(500).json({
        data: result.data
      })
    }
  })
)

// 删除卡片
router.delete(
  '/delete/:card_id',
  ReqServerErrorFilter((req: Request, res: Response) => {
    const card_id = parseInt(req.params.card_id)
    if (card_id) {
      ReciteCardsDataBaseInstance.delete_card(card_id)
      makeSuccessRep(res)
    } else {
      res.status(400).json({
        success: false,
        message: 'card_id illegal'
      })
    }
  })
)

// 更新卡片
router.post(
  '/update/:card_id',
  ReqServerErrorFilter((req: Request, res: Response) => {
    const card_id = parseInt(req.params.card_id)
    if (card_id) {
      ReciteCardsDataBaseInstance.update_card({ ...req.body, id: card_id })
      makeSuccessRep(res)
    } else {
      res.status(400).json({
        success: false,
        message: 'illegal card_id'
      })
    }
  })
)
// 查询卡片
router.get(
  '/get_card/:card_id',
  ReqServerErrorFilter((req: Request, resp: Response) => {
    const card_id = parseInt(req.params.card_id)
    if (card_id) {
      const card = ReciteCardsDataBaseInstance.fetch_cards_by_card_id(card_id)
      makeSuccessRep(resp, card)
    } else {
      resp.status(400).json({
        success: false,
        message: 'illegal card_id'
      })
    }
  })
)

router.get(
  '/get_book/:book_id',
  ReqServerErrorFilter((req: Request, resp: Response) => {
    const book_id = parseInt(req.params.book_id)
    if (book_id) {
      const cards = ReciteCardsDataBaseInstance.fetch_cards_by_book_id(book_id)
      makeSuccessRep(resp, cards)
    } else {
      resp.status(400).json({
        success: false,
        message: 'illegal card_id'
      })
    }
  })
)

// 更新复习记录

router.post(
  '/review_update/:card_id',
  ReqServerErrorFilter((req: Request, resp: Response) => {
    const body = req.body
    const card_id = parseInt(req.params.card_id)
    if (card_id) {
      if (HTTP_422_check(body, ['type'])) {
        ReciteCardsDataBaseInstance.add_review_record(card_id, body['type'])
        makeSuccessRep(resp)
      } else {
        Make422Resp(resp)
      }
    } else {
      resp.status(400).json({
        success: false,
        message: 'illegal card_id'
      })
    }
  })
)

// 获取复习记录
router.post(
  '/review_get/:card_id',
  ReqServerErrorFilter((req: Request, res: Response) => {
    const card_id = parseInt(req.params.card_id)
    if (card_id) {
      const body = req.body
      const reviews = ReciteCardsDataBaseInstance.get_review_record(
        card_id,
        body['start_date'],
        body['end_date']
      )
      makeSuccessRep(res, reviews)
    } else {
      Make422Resp(res)
    }
  })
)
export default router
