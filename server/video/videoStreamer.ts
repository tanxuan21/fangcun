import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express'

export interface VideoRange {
  start: number
  end: number
}

export interface VideoStreamOptions {
  chunkSize?: number
  maxChunkSize?: number
}

export class VideoStreamer {
  private defaultChunkSize: number
  private maxChunkSize: number

  constructor(options: VideoStreamOptions = {}) {
    this.defaultChunkSize = options.chunkSize || 1024 * 1024 // 1MB
    this.maxChunkSize = options.maxChunkSize || 10 * 1024 * 1024 // 10MB
  }

  /**
   * 解析 Range 请求头
   */
  public parseRangeHeader(rangeHeader: string | undefined, fileSize: number): VideoRange | null {
    if (!rangeHeader) {
      return null
    }

    try {
      // Range 格式示例：bytes=0-1023
      const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/)

      if (!matches) {
        return null
      }

      const start = parseInt(matches[1], 10)
      const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1

      // 验证范围有效性
      if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
        return null
      }

      return { start, end }
    } catch (error) {
      console.error('解析 Range 头时出错:', error)
      return null
    }
  }

  /**
   * 获取视频文件信息
   */
  public async getVideoInfo(filePath: string): Promise<{
    size: number
    exists: boolean
    contentType: string
  }> {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve({ size: 0, exists: false, contentType: 'video/mp4' })
          } else {
            reject(err)
          }
          return
        }

        const extension = path.extname(filePath).toLowerCase()
        const contentType = this.getContentType(extension)

        resolve({
          size: stats.size,
          exists: true,
          contentType
        })
      })
    })
  }

  /**
   * 根据文件扩展名获取 Content-Type
   */
  private getContentType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.flv': 'video/x-flv',
      '.wmv': 'video/x-ms-wmv'
    }

    return mimeTypes[extension] || 'application/octet-stream'
  }

  /**
   * 流式传输视频文件
   */
  public async streamVideo(filePath: string, req: Request, res: Response): Promise<void> {
    try {
      // 检查文件是否存在
      const videoInfo = await this.getVideoInfo(filePath)

      if (!videoInfo.exists) {
        res.status(404).json({ error: '视频文件不存在' })
        return
      }

      const fileSize = videoInfo.size
      const contentType = videoInfo.contentType

      // 解析 Range 请求头
      const range = this.parseRangeHeader(req.headers.range, fileSize)

      // 设置响应头
      res.setHeader('Accept-Ranges', 'bytes')
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=31536000')

      if (!range) {
        // 如果没有 Range 头，返回整个文件
        res.setHeader('Content-Length', fileSize)
        res.status(200)

        const readStream = fs.createReadStream(filePath)
        readStream.pipe(res)
        return
      }

      // 处理 Range 请求
      const { start, end } = range
      const chunkSize = end - start + 1

      // 设置部分内容响应头
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      res.setHeader('Content-Length', chunkSize)
      res.status(206) // Partial Content

      // 创建可读流，只读取指定范围
      const readStream = fs.createReadStream(filePath, {
        start,
        end,
        highWaterMark: Math.min(chunkSize, this.defaultChunkSize)
      })

      // 处理流错误
      readStream.on('error', (error) => {
        console.error('读取视频流时出错:', error)
        if (!res.headersSent) {
          res.status(500).json({ error: '读取视频文件时出错' })
        }
      })

      // 管道传输数据
      readStream.pipe(res)
    } catch (error) {
      console.error('流式传输视频时出错:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: '服务器内部错误' })
      }
    }
  }

  /**
   * 获取视频文件列表
   */
  public async getVideoList(videosDir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(videosDir, (err, files) => {
        if (err) {
          reject(err)
          return
        }

        // 过滤出视频文件
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
        const videoFiles = files.filter((file) =>
          videoExtensions.includes(path.extname(file).toLowerCase())
        )

        resolve(videoFiles)
      })
    })
  }
}
