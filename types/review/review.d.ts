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
  updated_at: string
}
export interface IReview {
  id: number
  rate: number
  remark: string
  item_id: number
  created_at: string
}
