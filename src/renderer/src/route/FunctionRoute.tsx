import { RouteObject } from 'react-router-dom'
import { VideoSplitter } from '@renderer/function/VideoSplitter'
export const FunctionRoute: RouteObject[] = [
  { path: '/function/video-splitter', element: <VideoSplitter></VideoSplitter> }
]
