import { Button, Input } from 'antd'
import styles from './setting-styles.module.scss'
import { useEffect, useState } from 'react'
import { SettingInterface } from 'type/API/setting'
interface props {
  HideSettingPage: () => void
}
export const SettingPage = ({ HideSettingPage }: props) => {
  const [settingCache, setSettingCache] = useState<SettingInterface | null>(null)
  useEffect(() => {
    ;(async function () {
      setSettingCache(JSON.parse(JSON.stringify(await window.api.getAll())))
    })()
  }, [])
  return (
    <div className={styles['setting-outer']}>
      <div className={styles['setting-page-container']}>
        API url
        <Input
          onChange={(e) => {
            if (!settingCache) return
            settingCache.API_URL = e.target.value
            setSettingCache({ ...settingCache })
          }}
          value={settingCache?.API_URL}
          onBlur={(e) => {
            window.api.setItem('API_URL', e.target.value)
          }}
        ></Input>
        <Button
          onClick={() => {
            HideSettingPage()
          }}
        >
          exit
        </Button>
      </div>
    </div>
  )
}
