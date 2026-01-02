// 定义响应数据结构接口
export interface IApiResponse<T = any> {
  code: number
  success: boolean
  data: T | null
  message: string
  timestamp: string
  errors?: any
  path?: string
}

// HTTP 状态码枚举
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}

// 响应配置选项接口
export interface ResponseOptions {
  includePath?: boolean
  includeTimestamp?: boolean
}

/**
 * API 响应类
 * 用于标准化 API 响应格式
 */
export class ApiResponse<T = any> {
  // 响应数据
  public data: T | null = null

  // 响应元数据
  public code: number
  public success: boolean
  public message: string
  public timestamp: string
  public errors?: any
  public path?: string

  /**
   * 构造函数
   * @param code - HTTP 状态码
   * @param data - 响应数据
   * @param message - 响应消息
   * @param options - 响应选项
   */
  constructor(
    code: number = HttpStatus.OK,
    data: T | null = null,
    message: string = 'Success',
    options: ResponseOptions = {}
  ) {
    // 第1行：设置状态码
    this.code = code

    // 第2行：根据状态码判断请求是否成功 (2xx 表示成功)
    this.success = code >= 200 && code < 300

    // 第3行：设置响应数据
    this.data = data

    // 第4行：设置响应消息
    this.message = message

    // 第5行：设置 ISO 格式的时间戳
    this.timestamp = new Date().toISOString()

    // 第6行：如果配置了包含路径，则设置请求路径
    if (options.includePath && typeof window === 'undefined') {
      // 这里通常会在响应包装器中设置，不是在构造函数中
    }
  }

  /**
   * 成功响应快捷方法
   * @param data - 响应数据
   * @param message - 成功消息
   * @param code - HTTP 状态码 (默认 200)
   */
  static success<T>(
    data: T,
    message: string = 'Success',
    code: number = HttpStatus.OK
  ): ApiResponse<T> {
    // 第7行：创建成功响应实例
    return new ApiResponse<T>(code, data, message)
  }

  /**
   * 错误响应快捷方法
   * @param message - 错误消息
   * @param code - HTTP 状态码 (默认 500)
   * @param errors - 详细错误信息
   */
  static error<T>(
    message: string = 'Error',
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: any
  ): ApiResponse<T> {
    // 第8行：创建错误响应实例
    const response = new ApiResponse<T>(code, null, message)

    // 第9行：如果有详细错误信息，添加到响应中
    if (errors) {
      response.errors = errors
    }

    // 第10行：返回错误响应
    return response
  }

  /**
   * 资源创建成功响应 (201 Created)
   */
  static created<T>(data: T, message: string = 'Resource created successfully'): ApiResponse<T> {
    // 第11行：使用 201 Created 状态码
    return this.success(data, message, HttpStatus.CREATED)
  }

  /**
   * 无内容响应 (204 No Content)
   */
  static noContent(message: string = 'No content'): ApiResponse {
    // 第12行：204 响应通常没有响应体
    return this.success(null, message, HttpStatus.NO_CONTENT)
  }

  /**
   * 错误请求响应 (400 Bad Request)
   */
  static badRequest<T>(message: string = 'Bad Request', errors?: any): ApiResponse<T> {
    // 第13行：客户端错误 - 请求格式错误
    return this.error(message, HttpStatus.BAD_REQUEST, errors)
  }

  /**
   * 未授权响应 (401 Unauthorized)
   */
  static unauthorized<T>(message: string = 'Unauthorized'): ApiResponse<T> {
    // 第14行：需要认证但未提供或认证失败
    return this.error(message, HttpStatus.UNAUTHORIZED)
  }

  /**
   * 禁止访问响应 (403 Forbidden)
   */
  static forbidden<T>(message: string = 'Forbidden'): ApiResponse<T> {
    // 第15行：认证成功但没有权限访问资源
    return this.error(message, HttpStatus.FORBIDDEN)
  }

  /**
   * 资源未找到响应 (404 Not Found)
   */
  static notFound<T>(message: string = 'Resource not found'): ApiResponse<T> {
    // 第16行：请求的资源不存在
    return this.error(message, HttpStatus.NOT_FOUND)
  }

  /**
   * 冲突响应 (409 Conflict)
   */
  static conflict<T>(message: string = 'Conflict'): ApiResponse<T> {
    // 第17行：请求与当前资源状态冲突
    return this.error(message, HttpStatus.CONFLICT)
  }

  /**
   * 无法处理的实体响应 (422 Unprocessable Entity)
   */
  static unprocessableEntity<T>(
    message: string = 'Unprocessable Entity',
    errors?: any
  ): ApiResponse<T> {
    // 第18行：请求格式正确但语义错误
    return this.error(message, HttpStatus.UNPROCESSABLE_ENTITY, errors)
  }

  /**
   * 发送响应到 Express Response 对象
   * @param res - Express Response 对象
   * @returns 发送的响应
   */
  send(res: any): any {
    // 第19行：构建响应对象
    const responseObject: IApiResponse<T> = {
      code: this.code,
      success: this.success,
      data: this.data,
      message: this.message,
      timestamp: this.timestamp
    }

    // 第20行：如果有错误信息，添加到响应对象
    if (this.errors) {
      responseObject.errors = this.errors
    }

    // 第21行：如果有路径信息，添加到响应对象
    if (this.path) {
      responseObject.path = this.path
    }

    // 第22行：设置 HTTP 状态码并发送 JSON 响应
    return res.status(this.code).json(responseObject)
  }

  /**
   * 转换为普通对象
   */
  toJSON(): IApiResponse<T> {
    // 第23行：将响应实例转换为 JSON 对象
    const json: IApiResponse<T> = {
      code: this.code,
      success: this.success,
      data: this.data,
      message: this.message,
      timestamp: this.timestamp
    }

    // 第24行：添加可选字段
    if (this.errors) json.errors = this.errors
    if (this.path) json.path = this.path

    // 第25行：返回 JSON 对象
    return json
  }
}
