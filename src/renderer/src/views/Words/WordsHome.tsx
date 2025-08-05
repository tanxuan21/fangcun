import { useNavigate } from 'react-router-dom'

export const WordsHome = () => {
  const nav = useNavigate()
  return (
    <div>
      <button
        onClick={() => {
          nav('/words/recordwords')
        }}
      >
        添加
      </button>
      <button
        onClick={() => {
          nav('/words/wordskim')
        }}
      >
        刷词
      </button>
      <button
        onClick={() => {
          nav('/')
        }}
      >
        查看数据
      </button>
    </div>
  )
}
