import styles from './styles.module.scss'
import { Navigator } from '../../components/Navigator/Navigator'
import React from 'react'
import { HashRouter } from 'react-router-dom'
import { Route } from '../../route/route'

export const MainLayOut = () => {
  return (
    <div className={styles['main-layout-container']}>
      <HashRouter>
        <aside className={styles['main-layout-aside']}>
          <Navigator></Navigator>
        </aside>
        <main className={styles['main-layout-main']}>
          <Route></Route>
        </main>
      </HashRouter>
    </div>
  )
}
