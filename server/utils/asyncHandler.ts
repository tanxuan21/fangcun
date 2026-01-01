import { NextFunction, RequestHandler, Request, Response } from 'express'
import { ApiResponse, HttpStatus } from './response'
import { AppError } from './AppError'
// 包装器配置选项接口
export interface WrapperOptions {
  successCode?: number // 默认为200
  errorCode?: number // 默认为500
  formatResponse?: boolean // 默认为true 是否自动格式化响应
  includePath?: boolean // 默认为false 是否包含请求路径
  includeStackTraceInDev?: boolean // 默认为false 是否在开发环境返回错误堆栈信息
}

// 定义异步请求处理函数类型
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>
export function asyncWrapper(
  handler: AsyncRequestHandler,
  options: WrapperOptions
): RequestHandler {
  return async (req, res, next) => {
    // 第45行：解构配置选项，设置默认值
    const {
      successCode = HttpStatus.OK,
      errorCode = HttpStatus.INTERNAL_SERVER_ERROR,
      formatResponse = true,
      includePath = true,
      includeStackTraceInDev = true
    } = options

    // 核心函数体
    try {
      const result = await handler(req, res, next)
      // console.log(`[${req.method}] ${req.originalUrl}:`, result)
      // 检查是否已经发送了响应，退出
      if (res.headersSent) return

      if (formatResponse && result !== undefined) {
        const response = new ApiResponse(successCode, result, 'Success', { includePath })
        if (includePath) response.path = req.originalUrl

        response.send(res)
        // 如果不需要格式化响应，且处理器没有返回结果，由处理器自行处理响应
      }
    } catch (error) {
      console.error(
        `[Error] ${req.method} ${req.originalUrl}:`,
        error instanceof Error ? error.message : error
      )
      // 是否已经发送
      if (res.headersSent) return
      // 错误状态码
      let statusCode = errorCode
      let message = 'Internal Server Error'
      let errors: any = undefined
      let isOperational = false

      // 处理不同类型的错误
      if (error instanceof AppError) {
        // 如果是应用程序自定义错误
        statusCode = error.statusCode
        message = error.message
        isOperational = error.isOperational
      } else if (error instanceof Error) {
        // 如果是原生 Error 对象
        message = error.message
      } else if (typeof error === 'string') {
        // 如果是字符串错误
        message = error
      } else if (error && typeof error === 'object') {
        // 如果是对象错误，尝试提取状态码和消息
        if ('statusCode' in error && typeof error.statusCode === 'number') {
          statusCode = error.statusCode
        }
        if ('message' in error && typeof error.message === 'string') {
          message = error.message
        }
        if ('errors' in error) {
          errors = error.errors
        }
      }
      // 创建错误响应
      const errorResponse = new ApiResponse(statusCode, null, message, { includePath })
      // 设置路径信息
      if (includePath) {
        errorResponse.path = req.originalUrl
      }
      // 设置错误详情
      if (errors) {
        errorResponse.errors = errors
      }
      // 开发环境下包含堆栈信息
      if (
        includeStackTraceInDev &&
        process.env.NODE_ENV === 'development' &&
        error instanceof Error
      ) {
        errorResponse.errors = {
          ...(errorResponse.errors || {}),
          stack: error.stack
        }
      }
      // 发送响应
      errorResponse.send(res)
    }
  }
}
/**
 * 快捷方法：GET 请求包装器
 */
export function GET(handler: AsyncRequestHandler, options: WrapperOptions = {}): RequestHandler {
  // 第68行：专门用于 GET 请求的包装器
  return asyncWrapper(handler, options)
}

/**
 * 快捷方法：POST 请求包装器
 */
export function POST(handler: AsyncRequestHandler, options: WrapperOptions = {}): RequestHandler {
  // 第69行：专门用于 POST 请求的包装器
  return asyncWrapper(handler, {
    successCode: HttpStatus.CREATED, // POST 通常返回 201
    ...options
  })
}

/**
 * 快捷方法：PUT 请求包装器
 */
export function PUT(handler: AsyncRequestHandler, options: WrapperOptions = {}): RequestHandler {
  // 第70行：专门用于 PUT 请求的包装器
  return asyncWrapper(handler, options)
}

/**
 * 快捷方法：DELETE 请求包装器
 */
export function DELETE(handler: AsyncRequestHandler, options: WrapperOptions = {}): RequestHandler {
  // 第71行：专门用于 DELETE 请求的包装器
  return asyncWrapper(handler, {
    successCode: HttpStatus.NO_CONTENT, // DELETE 通常返回 204
    ...options
  })
}

/**
 * 快捷方法：PATCH 请求包装器
 */
export function PATCH(handler: AsyncRequestHandler, options: WrapperOptions = {}): RequestHandler {
  // 第72行：专门用于 PATCH 请求的包装器
  return asyncWrapper(handler, options)
}

// 中间件

/**
 * 中间件：扩展 Response 对象
 * 为 Express Response 添加自定义响应方法
 */

export type ExtendResponse = Response & {
  // 添加自定义响应方法
  apiSuccess: <T>(data: T, message?: string, statusCode?: number) => void
  apiError: (message: string, statusCode?: number, errors?: any) => void
}
export function extendResponse(req: Request, res: Response & ExtendResponse, next: NextFunction) {
  // 第73行：为 Response 对象添加 apiSuccess 方法
  res.apiSuccess = function <T>(
    data: T,
    message: string = 'Success',
    statusCode: number = HttpStatus.OK
  ) {
    // 第74行：创建成功响应并发送
    const response = ApiResponse.success(data, message, statusCode)
    response.path = req.originalUrl
    response.send(res)
  }

  // 第75行：为 Response 对象添加 apiError 方法
  res.apiError = function (
    message: string = 'Error',
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: any
  ) {
    // 第76行：创建错误响应并发送
    const response = ApiResponse.error(message, statusCode, errors)
    response.path = req.originalUrl
    response.send(res)
  }

  // 第77行：继续处理下一个中间件
  next()
}
