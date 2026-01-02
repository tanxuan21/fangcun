import { RouteObject } from 'react-router-dom'
import { VideoSplitter } from '@renderer/function/VideoSplitter'
import { Review } from '@renderer/function/Review'
export const FunctionRoute: RouteObject[] = [
  { path: '/function/video-splitter', element: <VideoSplitter></VideoSplitter> },
  { path: 'function/review', element: <Review></Review> }
]
