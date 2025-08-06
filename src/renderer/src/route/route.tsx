import { NotFound } from '@renderer/components/NotFound/notfound'
import { Home } from '@renderer/views/Home/home'
import { RemenberCardApp } from '@renderer/views/RemenberCard/RememberCardApp'
import { RemenberCardContent } from '@renderer/views/RemenberCard/remenbercard'
import { RouteObject, useRoutes } from 'react-router-dom'

export const route: RouteObject[] = [
  {
    path: '/',
    element: <Home></Home>
  },
  { path: '*', element: <NotFound></NotFound> },
  {
    path: '/app/remember-card/',
    element: <RemenberCardApp></RemenberCardApp>
  },
  {
    path: '/app/remember-card/content',
    element: <RemenberCardContent></RemenberCardContent>
  }
]

export const Route = () => {
  const element = useRoutes(route)
  return element
}
