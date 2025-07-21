import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import DrawTable from './components/DrawTable/index'
import BoardTest from './components/Board/test'
import { ATest } from './demo/classcomp/a'
import { Board } from './components/Board'
import { useEffect, useRef } from 'react'
function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const APP_REF = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (APP_REF.current) {
      const b = new Board()
      b.mount(APP_REF.current)
    }
  }, [])
  return (
    <div
      style={{
        width: '100%',
        height: '100%'
      }}
      ref={APP_REF}
    >
      {/* <DrawTable></DrawTable>
       */}
      {/* <BoardTest></BoardTest> */}
      {/* <ATest></ATest> */}
    </div>
  )
}

export default App
