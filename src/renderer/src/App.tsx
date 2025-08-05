import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import DrawTable from './components/DrawTable/index'
import BoardTest from './components/Board/test'
import { ATest } from './demo/classcomp/a'
import { Board } from './components/Board/board'
import { DrawerMenu } from './components/DrawerMenu'
import { useEffect, useRef } from 'react'
import { WordSkim } from './views/Words/WordSkim'
import { WordsAPP } from './views/Words'
import { BoardReact } from './components/Board/index'
import { RemenberCardTest } from './views/RemenberCard/test'
function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const APP_REF = useRef<HTMLDivElement | null>(null) // 挂载点引用
  //   useEffect(() => {
  //     if (APP_REF.current) {
  //       const b = new Board()
  //       b.createNodes() // 创建子节点 debug使用
  //       b.mount(APP_REF.current) // 挂载
  //     }
  //   }, [])
  return (
    <div
      style={{
        width: '100%',
        height: '100%'
      }}
      ref={APP_REF}
    >
      {/* <DrawerMenu></DrawerMenu> */}
      {/* <WordSkim></WordSkim> */}
      {/* <WordsAPP></WordsAPP> */}
      <RemenberCardTest></RemenberCardTest>
      {/* <BoardReact></BoardReact> */}
    </div>
  )
}

export default App
