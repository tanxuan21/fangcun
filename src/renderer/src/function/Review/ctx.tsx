import { createContext, ReactNode, useContext } from 'react'
import { IReviewItem, IReviewSet } from '../../../../../types/review/review'
import React from 'react'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
import { set } from 'lodash'
import { CoverFunctionType } from './types'

// 定义 Context 类型
interface ReviewSetContextType {
  reviewSet: IReviewSet | null
  setReviewSet: (reviewSet: IReviewSet) => void
  coverState: CoverLayerState // 用于 CoverPage的显藏
  setCoverState: (state: CoverLayerState) => void
  // CoverPage 临时参数
  OperReviewItem: IReviewItem | null
  setOperReviewItem: (item: IReviewItem | null) => void
  OperType: CoverFunctionType
  setOperType: (type: CoverFunctionType) => void
  // 这本书的数据
  ReviewItems: IReviewItem[]
  setReviewItems: (items: IReviewItem[]) => void
}

// 创建 Context，确保类型正确
export const ReviewSetContext = createContext<ReviewSetContextType | undefined>(undefined)

// 自定义 Hook - 修复版本
export const useReviewSet = () => {
  const ctx = useContext(ReviewSetContext)
  if (!ctx) {
    throw new Error('useReviewSet must be used within ReviewSetProvider')
  }
  return ctx
}
