import { Router } from 'express'
import { ReviewDataBaseInstance } from '../database/database'
import { makeSuccessRep } from '../utils'
import { GET, POST, ExtendResponse } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'
import Response from 'express'

const router = Router()
export default router

// router.get('/review-items', (req, res) => {
//   try {
//     const result = ReviewDataBaseInstance.get_all_review_items()
//     makeSuccessRep(res, result)
//   } catch (e) {
//     res.status(500).send(e.message)
//   }
// })

// 调试中间件：打印所有到达此路由器的请求
router.use((req, res, next) => {
  console.log(`[Router Debug] ${req.method} ${req.originalUrl}`)
  console.log('请求路径:', req.path)
  console.log('请求URL:', req.url)
  next()
})

router.get(
  '/review-items',
  GET(async (req, res) => {
    return ReviewDataBaseInstance.get_all_review_items()
  })
)

router.post(
  '/review-items',
  POST(async (req, res: ExtendResponse) => {
    const result = ReviewDataBaseInstance.add_review_item(req.body.type, req.body.content)
    // if (!result.success) {
    //   throw AppError.conflict(`${result.id} already exists`)
    // }
    if (!result.success) res.apiSuccess(`id: ${result.id} already exists`)
    else res.apiSuccess({ id: result.id })
  })
)

router.put('/review-items', (req, res) => {
  try {
    const result = ReviewDataBaseInstance.update_review_item(req.body.id, req.body.updates)
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.delete('/review-items', (req, res) => {
  try {
    const result = ReviewDataBaseInstance.delete_review_item(req.body.id)
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.get('/reviews', (req, res) => {
  const item_id = req.query['item_id']
  // 检查是否为字符串
  if (!item_id || typeof item_id !== 'string') {
    res.status(400).send('item_id is required and must be a string')
    return
  }
  try {
    const result = ReviewDataBaseInstance.get_all_reviews(parseInt(item_id))
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.post('/reviews', (req, res) => {
  try {
    const result = ReviewDataBaseInstance.add_review(
      req.body.item_id,
      req.body.rate,
      req.body.remark
    )
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.put('/reviews', (req, res) => {
  try {
    const result = ReviewDataBaseInstance.update_review(req.body.id, req.body.updates)
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.delete('/reviews', (req, res) => {
  try {
    const result = ReviewDataBaseInstance.delete_review(req.body.id)
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.get('/reviews/:item_id', (req, res) => {
  try {
    const item_id = req.params['item_id']
    const result = ReviewDataBaseInstance.get_all_reviews(parseInt(item_id))
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})
