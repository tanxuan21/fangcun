import { MainLayOut } from './views/Layout/MainLayOut'
import { SettingPage } from './views/Setting/Setting'

function App(): React.JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      <MainLayOut></MainLayOut>
    </div>
  )
}

export default App
