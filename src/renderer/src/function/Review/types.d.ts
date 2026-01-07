export type PageReviewItem = IReviewItem & {
  remains: number // 还剩几次今天的复习结束？结束时 remains 减到 0  时 更新 next_review_at last_reviewed_at
  total_count: number // 用户今天还需要复习几次？根据 worseSelect 更新
  worseSelect: number // 今天用户最差的选择，按钮/键盘 更新
}

export type CoverFunctionType = 'add' | 'edit' | 'delete'
