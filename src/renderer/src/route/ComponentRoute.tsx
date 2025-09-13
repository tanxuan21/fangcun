import { MenuDemo } from '@renderer/components/Menu/Demo'
import { ComponentHome } from '@renderer/views/Component/Component'
import { RouteObject } from 'react-router-dom'
// 组件 Router，记录开发过程
export const ComponentRoute: RouteObject[] = [
  {
    path: '/component/',
    element: <ComponentHome></ComponentHome>
  }
]
