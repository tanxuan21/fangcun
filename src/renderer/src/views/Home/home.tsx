import { useNavigate } from 'react-router-dom'
import styles from './styles.module.scss'

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
    <div className={styles['home-container']}>
      <header className={styles['home-container-header']}></header>
      <div className={styles['home-container-wrapper']}>
        <aside className={styles['home-container-aside']}></aside>
        <main className={styles['home-container-main']}>
          <FunctionItem
            function_name={'音视频切分'}
            route_url="/function/video-splitter"
          ></FunctionItem>
        </main>
      </div>
      <footer className={styles['home-container-footer']}></footer>
    </div>
  )
}
