import { RouteObject } from 'react-router-dom'
import { WordsHome } from './WordsHome'
import { WordSkim } from './WordSkim'
import { RecordWords } from './RecordWords'
export const route: RouteObject[] = [
  { path: '/', element: <WordsHome></WordsHome> },
  { path: '/words/home', element: <WordsHome></WordsHome> },
  { path: '/words/wordskim', element: <WordSkim></WordSkim> },
  { path: '/words/recordwords', element: <RecordWords></RecordWords> }
]
