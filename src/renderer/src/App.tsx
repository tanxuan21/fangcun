import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import DrawTable from './components/DrawTable/index'
import BoardTest from './components/Board/test'
function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      {/* <DrawTable></DrawTable>
       */}
      <BoardTest></BoardTest>
    </>
  )
}

export default App
