import { app } from 'electron'
import { SettingInterface } from '../../../type/API/setting'
import fs from 'fs/promises'
import path from 'path'
import { GetMainWindow } from '../MainWindow'

const DefaultSetting = {
  API_URL: 'http://localhost:3001/'
}

class Setting {
  private setting: SettingInterface
  private fileName = 'setting'
  private filePath = ''
  // 从文件系统里读取。不存在就创建。
  constructor() {
    // 默认值
    const settingFilePath = app.getPath('userData')
    console.log(settingFilePath)
    this.filePath = path.join(settingFilePath, this.fileName)
    this.setting = DefaultSetting
  }

  async init() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8')
      this.setting = JSON.parse(raw)
    } catch (e) {
      // 文件不存在
      console.warn('文件不存在或损坏，新建')
      await this.save()
    }
  }
  /** 获取某个字段 */
  getItem<K extends keyof SettingInterface>(key: K): SettingInterface[K] {
    return this.setting[key]
  }

  /** 设置某个字段 */
  async setItem<K extends keyof SettingInterface>(key: K, value: SettingInterface[K]) {
    this.setting[key] = value
    if (key === 'API_URL') {
      GetMainWindow()?.reload() // 更新了api，重启软件
    }
    await this.save()
  }

  /** 删除某个字段 */
  async removeItem<K extends keyof SettingInterface>(key: K) {
    delete this.setting[key]
    await this.save()
  }

  /** 返回所有配置 */
  getAll(): SettingInterface {
    return { ...this.setting }
  }

  /** 批量更新 */
  async setAll(next: Partial<SettingInterface>) {
    this.setting = { ...this.setting, ...next }
    await this.save()
  }

  /** 恢复默认 */
  async reset() {
    this.setting = DefaultSetting
    await this.save()
  }

  async save() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.setting, null, 2))
    } catch (e) {
      console.error('保存配置失败，恢复默认', e)
      this.setting = DefaultSetting
      await this.save()
    }
  }
}

let SettingInstance: Setting

export const IPC_Setting = async () => {
  // 初始化完毕
  SettingInstance = new Setting()
  await SettingInstance.init()

  return {
    'get-item': <K extends keyof SettingInterface>(event, key: K) => {
      const value = SettingInstance.getItem(key)
      return value
    },
    'set-item': async <K extends keyof SettingInterface>(
      event,
      key: K,
      value: SettingInterface[K]
    ) => {
      return SettingInstance.setItem(key, value)
    },
    'get-all': async (event) => {
      return SettingInstance.getAll()
    },
    'set-all': async (event, next: Partial<SettingInterface>) => {
      return SettingInstance.setAll(next)
    }
  }
}
export const generalCSP = () => {
  const address_str = [SettingInstance.getItem('API_URL')].join(' ')
  const csp = `
    default-src 'self' ${address_str};
    connect-src 'self' ${address_str} wss://speech.platform.bing.com;
    script-src 'self' ${address_str} https://at.alicdn.com/ 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: ${address_str};
    media-src 'self' data: blob: https://translate.google.com;
  `
  //   console.log(csp)
  return csp
}
export { Setting }
