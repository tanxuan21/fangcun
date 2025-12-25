import { Router, Request, Response } from 'express'
import path from 'path'
import { VideoStreamer } from './videoStreamer'
const router = Router()
const videoStreamer = new VideoStreamer()

// 视频文件存储目录
// const VIDEOS_DIR = path.join(process.cwd(), 'videos');
const VIDEOS_DIR = 'D:/FangCun/DB/test/video'

/**
 * 获取视频文件列表
 */
router.get('/videos', async (req: Request, res: Response) => {
  try {
    const videos = await videoStreamer.getVideoList(VIDEOS_DIR)
    res.json({
      success: true,
      data: videos.map((filename) => ({
        filename,
        url: `/api/video/stream/${encodeURIComponent(filename)}`
      }))
    })
  } catch (error) {
    console.error('获取视频列表时出错:', error)
    res.status(500).json({
      success: false,
      error: '获取视频列表失败'
    })
  }
})

/**
 * 流式传输单个视频文件
 */
router.get('/video/stream/:filename', async (req: Request, res: Response) => {
  try {
    const filename = decodeURIComponent(req.params.filename)
    const filePath = path.join(VIDEOS_DIR, filename)

    // 安全检查：防止路径遍历攻击
    // const normalizedPath = path.normalize(filePath)
    // console.log(normalizedPath)
    // if (!normalizedPath.startsWith(VIDEOS_DIR)) {
    //   res.status(403).json({ error: '禁止访问' })
    //   return
    // }

    await videoStreamer.streamVideo(filePath, req, res)
  } catch (error) {
    console.error('视频流请求时出错:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: '服务器内部错误' })
    }
  }
})

/**
 * 获取视频文件信息
 */
router.get('/video/info/:filename', async (req: Request, res: Response) => {
  try {
    const filename = decodeURIComponent(req.params.filename)
    const filePath = path.join(VIDEOS_DIR, filename)

    // 安全检查
    const normalizedPath = path.normalize(filePath)
    if (!normalizedPath.startsWith(VIDEOS_DIR)) {
      res.status(403).json({ error: '禁止访问' })
      return
    }

    const videoInfo = await videoStreamer.getVideoInfo(filePath)

    if (!videoInfo.exists) {
      res.status(404).json({ error: '视频文件不存在' })
      return
    }

    res.json({
      success: true,
      data: {
        filename,
        size: videoInfo.size,
        contentType: videoInfo.contentType,
        supportsRange: true
      }
    })
  } catch (error) {
    console.error('获取视频信息时出错:', error)
    res.status(500).json({ error: '获取视频信息失败' })
  }
})

export default router
