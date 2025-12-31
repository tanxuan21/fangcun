import { HttpStatus } from './response'

/**
 * 应用程序错误基类
 * 扩展了原生 Error 类，添加了 HTTP 状态码等属性
 */
export class AppError extends Error {
  // 第26行：HTTP 状态码
  public statusCode: number

  // 第27行：是否是操作错误（可预期的错误）
  public isOperational: boolean

  // 第28行：状态分类（'fail' 或 'error'）
  public status: string

  /**
   * 构造函数
   * @param message - 错误消息
   * @param statusCode - HTTP 状态码
   * @param isOperational - 是否是操作错误
   */
  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ) {
    // 第29行：调用父类 Error 的构造函数
    super(message)

    // 第30行：设置 HTTP 状态码
    this.statusCode = statusCode

    // 第31行：设置是否为操作错误
    this.isOperational = isOperational

    // 第32行：根据状态码前缀判断错误类型
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'

    // 第33行：捕获堆栈跟踪信息（排除构造函数调用）
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * 快捷方法：创建 400 Bad Request 错误
   */
  static badRequest(message: string = 'Bad Request'): AppError {
    // 第34行：创建客户端请求错误
    return new AppError(message, HttpStatus.BAD_REQUEST)
  }

  /**
   * 快捷方法：创建 401 Unauthorized 错误
   */
  static unauthorized(message: string = 'Unauthorized'): AppError {
    // 第35行：创建未认证错误
    return new AppError(message, HttpStatus.UNAUTHORIZED)
  }

  /**
   * 快捷方法：创建 403 Forbidden 错误
   */
  static forbidden(message: string = 'Forbidden'): AppError {
    // 第36行：创建权限不足错误
    return new AppError(message, HttpStatus.FORBIDDEN)
  }

  /**
   * 快捷方法：创建 404 Not Found 错误
   */
  static notFound(message: string = 'Not Found'): AppError {
    // 第37行：创建资源未找到错误
    return new AppError(message, HttpStatus.NOT_FOUND)
  }

  /**
   * 快捷方法：创建 409 Conflict 错误
   */
  static conflict(message: string = 'Conflict'): AppError {
    // 第38行：创建资源冲突错误
    return new AppError(message, HttpStatus.CONFLICT)
  }

  /**
   * 快捷方法：创建 422 Unprocessable Entity 错误
   */
  static unprocessableEntity(message: string = 'Unprocessable Entity'): AppError {
    // 第39行：创建无法处理的实体错误
    return new AppError(message, HttpStatus.UNPROCESSABLE_ENTITY)
  }
}
