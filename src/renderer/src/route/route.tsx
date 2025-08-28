import { BoardReact } from '@renderer/components/Board'
import { NotFound } from '@renderer/components/NotFound/notfound'
import { Table } from '@renderer/components/Table/Table'
import { Home } from '@renderer/views/Home/home'
import { RememberCardBooks } from '@renderer/views/RemenberCard/RememberCardBook'
import { RemenberCardApp } from '@renderer/views/RemenberCard/RememberCardApp'
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
    path: '/app/remember-card/:book_id',
    element: <RememberCardBooks></RememberCardBooks>
  },
  {
    path: '/app/board/',
    element: <BoardReact />
  },
  {
    path: '/app/table',
    element: <Table></Table>
  }
]

export const Route = () => {
  const element = useRoutes(route)
  return element
}
