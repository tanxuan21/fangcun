import styles from './styles.module.scss'
import { Navigator } from '../../components/Navigator/Navigator'
import React, { useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { Route } from '../../route/route'
import { SettingPage } from '../Setting/Setting'

export const MainLayOut = () => {
  const [showSettingPage, setShowSettingPage] = useState<boolean>(false)
  return (
    <div className={styles['main-layout-container']}>
      <HashRouter>
        <aside className={styles['main-layout-aside']}>
          <Navigator
            ShowSettingPage={() => {
              setShowSettingPage(true)
            }}
          ></Navigator>
        </aside>
        <main className={styles['main-layout-main']}>
          <Route></Route>
        </main>
      </HashRouter>
      {showSettingPage && (
        <SettingPage
          HideSettingPage={() => {
            setShowSettingPage(false)
          }}
        ></SettingPage>
      )}
    </div>
  )
}
