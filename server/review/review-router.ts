import { Router } from 'express'
import { ReviewDataBaseInstance, ReviewSetDataBaseInstance } from '../database/database'
import { makeSuccessRep } from '../utils'
import { GET, POST, ExtendResponse, PUT, DELETE } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'
import { GetReviewItemsMode } from '../../types/review/review'
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
    const mode = req.query['mode'] as GetReviewItemsMode
    const review_set_id = req.query['review_set_id']
    if (!review_set_id || typeof review_set_id !== 'string')
      throw AppError.badRequest('review_set_id is required')
    if (mode)
      return ReviewDataBaseInstance.get_review_items_with_mode(mode, parseInt(review_set_id))
    return ReviewDataBaseInstance.get_all_review_items()
  })
)

router.post(
  '/review-items',
  POST(async (req, res: ExtendResponse) => {
    console.log('req.body:', req.body)
    const result = ReviewDataBaseInstance.add_review_item(req.body.type, req.body.content)
    ReviewSetDataBaseInstance.add_review_item_to_review_set(
      parseInt(req.body.review_set_id),
      result.id
    )
    if (!result.success) {
      throw AppError.conflict(`${result.id} already exists`)
    }
    if (!result.success) res.apiSuccess(`id: ${result.id} already exists`)
    else res.apiSuccess({ id: result.id })
  })
)

router.put('/review-items', (req, res) => {
  try {
    console.log('req.body:', req.body)
    const result = ReviewDataBaseInstance.update_review_item(req.body.id, req.body.updates)
    makeSuccessRep(res, result)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.delete(
  '/review-items',
  DELETE(async (req, res) => {
    const id = req.query['id']
    if (!id || typeof id !== 'string') throw AppError.badRequest('id is required')
    return ReviewDataBaseInstance.delete_review_item(parseInt(id))
  })
)

router.post(
  '/review-items/arrange',
  POST(async (req, res) => {
    return ReviewDataBaseInstance.arrange_review_item(req.body.id)
  })
)

router.get(
  '/reviews',
  GET(async (req, res) => {
    const item_id = req.query['item_id']
    if (!item_id || typeof item_id !== 'string') {
      throw AppError.badRequest('item_id is required')
    }
    return ReviewDataBaseInstance.get_all_reviews(parseInt(item_id))
  })
)

router.post(
  '/reviews',
  POST(async (req, res) => {
    const result = ReviewDataBaseInstance.add_review(
      req.body.item_id,
      req.body.rate,
      req.body.remark
    )
    return 'success!'
  })
)

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

// =====================================================================================================================

router.get(
  '/review-set',
  GET(async (req, res) => {
    return ReviewSetDataBaseInstance.get_all_review_sets()
  })
)

router.post(
  '/review-set',
  POST(async (req, res) => {
    return ReviewSetDataBaseInstance.add_review_set(
      req.body.name,
      req.body.description,
      req.body.setting
    )
  })
)

router.put(
  '/review-set',
  PUT(async (req, res) => {
    return ReviewSetDataBaseInstance.update_review_set(req.body)
  })
)

router.delete(
  '/review-set',
  DELETE(async (req, res) => {
    const set_id = req.query['set_id']
    if (!set_id || typeof set_id !== 'string') throw AppError.badRequest('set_id is required')
    return ReviewSetDataBaseInstance.delete_review_set(parseInt(set_id))
  })
)

router.post(
  '/review-set/add-review-item',
  POST(async (req, res) => {
    return ReviewSetDataBaseInstance.add_review_item_to_review_set(
      req.body.review_set_id,
      req.body.review_item_id
    )
  })
)
router.delete(
  '/review-set/delete-review-item',
  DELETE(async (req, res) => {
    return ReviewSetDataBaseInstance.delete_review_item_from_review_set(
      req.body.review_set_id,
      req.body.review_item_id
    )
  })
)

router.get(
  '/review-set/review-items',
  GET(async (req, res) => {
    const set_id = req.query['set_id']
    if (!set_id || typeof set_id !== 'string') throw AppError.badRequest('set_id is required')
    return ReviewSetDataBaseInstance.get_all_review_items_in_review_set(parseInt(set_id))
  })
)

router.delete(
  '/review-set/review-items',
  DELETE(async (req, res) => {
    const set_id = req.query['set_id']
    if (!set_id || typeof set_id !== 'string') throw AppError.badRequest('set_id is required')
    const item_id = req.query['item_id']
    if (!item_id || typeof item_id !== 'string') throw AppError.badRequest('item_id is required')
    return ReviewSetDataBaseInstance.delete_review_item_from_review_set(
      parseInt(set_id),
      parseInt(item_id)
    )
  })
)
