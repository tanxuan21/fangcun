import { Board } from './board'

export default function () {
  // 创建Board对象
  return <>{new Board().render()}</>
}
