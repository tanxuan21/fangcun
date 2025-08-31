import { Request, Response } from 'express'

export const ReqServerErrorFilter = (fn: Function) => {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: 'server internal error',
        error
      })
    }
  }
}

export const makeSuccessRep = (resp: Response, data?: any) => {
  if (data) {
    resp.status(200).json({
      success: true,
      message: 'ok',
      data
    })
  } else {
    resp.status(200).json({
      success: true,
      message: 'ok'
    })
  }
}

// 422 检查，检查是否 body 内部的字段合适
export const HTTP_422_check = (body, feild: string[]) => {
  try {
    for (const i in feild) {
      if (body[feild[i]] === undefined) {
        return false
      }
    }
    return true
  } catch (e) {
    return false
  }
}

export const Make422Resp = (resp: Response) => {
  resp.status(422).json({
    success: false,
    message: 'feild error'
  })
}

export const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
export function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份从0开始，所以需要加1
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function daysAfterToday(d: number): string {
  if (d < 0) {
    console.warn('d < 0', d)
  }
  const date = new Date()
  date.setDate(date.getDate() + d)
  return formatDate(date)
}
