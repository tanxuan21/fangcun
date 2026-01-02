import { ApiResponse } from '../server/utils/response'

// 扩展 Express Response 类型
declare global {
  namespace Express {
    interface Response {
      // 添加自定义响应方法
      apiSuccess: <T>(data: T, message?: string, statusCode?: number) => void
      apiError: (message: string, statusCode?: number, errors?: any) => void
    }
  }
}
