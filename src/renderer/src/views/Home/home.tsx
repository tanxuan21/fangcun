import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './styles.module.scss'
import { Button } from 'antd'

function FunctionItem({ function_name }: { function_name: string }) {
  return (
    <div className={styles['function-card']}>
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
          <FunctionItem function_name={'音视频切分'}></FunctionItem>
        </main>
      </div>
      <footer className={styles['home-container-footer']}></footer>
    </div>
  )
}
