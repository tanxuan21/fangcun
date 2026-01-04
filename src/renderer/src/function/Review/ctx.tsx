import { createContext, ReactNode, useContext } from 'react'
import { IReviewSet } from '../../../../../types/review/review'
import React from 'react'

// 定义 Context 类型
interface ReviewSetContextType {
  reviewSet: IReviewSet | null
  setReviewSet: (reviewSet: IReviewSet) => void
}

// 创建 Context，确保类型正确
export const ReviewSetContext = createContext<ReviewSetContextType | undefined>(undefined)

// Provider 组件
interface ReviewSetProviderProps {
  children: ReactNode
}

export const ReviewSetProvider: React.FC<ReviewSetProviderProps> = ({ children }) => {
  const [reviewSet, setReviewSet] = React.useState<IReviewSet | null>(null)

  return (
    <ReviewSetContext.Provider value={{ reviewSet, setReviewSet }}>
      {children}
    </ReviewSetContext.Provider>
  )
}

// 自定义 Hook - 修复版本
export const useReviewSet = () => {
  const ctx = useContext(ReviewSetContext)
  if (!ctx) {
    throw new Error('useReviewSet must be used within ReviewSetProvider')
  }
  return ctx
}
