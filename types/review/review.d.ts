import { ReviewRate } from '../../common/review/index'
// 获取 review-items 的模式字面量

// 所有的 | 今天复习的 |
export type GetReviewItemsMode = 'all' | 'today-review'

interface Iqa {
  q: string
  a: string
}
export type ReviewContentType = Iqa

// 数据库字段类型
export interface IReviewItem {
  id: number
  level: number
  type: number
  content: ReviewContentType
  last_reviewed_at: string
  next_review_at: string
  created_at: string
  arrange_review_at: string
  updated_at: string
}
export interface IReview {
  id: number
  rate: ReviewRate
  remark: string
  item_id: number
  created_at: string
}

export interface IReviewSet {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  setting: any
}

export interface IReviewSet2ReviewItem {
  id: number
  review_item_id: number
  review_set_id: number
  created_at: string
}
