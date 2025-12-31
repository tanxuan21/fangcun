export interface SettingInterface {
  API_URL: string
}

type K = keyof Settinginterface

export interface SettingAPI {
  getItem: (key: K) => SettingInterface[K]
  setItem: (key: K, value: SettingInterface[K]) => Promise<void>
  getAll: () => Promise<SettingInterface>
  setAll: (next: Partial<SettingInterface>) => Promise<void>
}
