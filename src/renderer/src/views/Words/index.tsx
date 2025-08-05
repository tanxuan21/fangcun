import { HashRouter, useRoutes } from 'react-router-dom'
import { route } from './route'
const Route = () => {
  const element = useRoutes(route)
  return element
}
const WordsAPP = () => {
  return (
    <HashRouter>
      <Route></Route>
    </HashRouter>
  )
}

export { WordsAPP }
