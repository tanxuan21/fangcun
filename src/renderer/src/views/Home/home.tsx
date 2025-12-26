import { useNavigate } from 'react-router-dom'
import styles from './styles.module.scss'
import { Template } from '@renderer/components/Layout/Template'

function FunctionItem({ function_name, route_url }: { function_name: string; route_url: string }) {
  const nav = useNavigate()
  return (
    <div
      className={styles['function-card']}
      onClick={() => {
        if (route_url) nav(route_url)
        else console.warn('required route url')
      }}
    >
      <h3>{function_name}</h3>
    </div>
  )
}

export function Home() {
  return (
    <Template
      header={<header className={styles['home-container-header']}></header>}
      asider={<aside className={styles['home-container-aside']}></aside>}
      main={
        <main className={styles['home-container-main']}>
          <FunctionItem
            function_name={'跟读素材切分'}
            route_url="/function/video-splitter"
          ></FunctionItem>
          <FunctionItem function_name={'背语群'} route_url=""></FunctionItem>
          <button
            onClick={() => {
              window.api.UploadVideo2(1, 's')
            }}
          >
            测试预编译
          </button>
        </main>
      }
      footer={<footer className={styles['home-container-footer']}></footer>}
    />
  )
}
