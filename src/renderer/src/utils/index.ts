export const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]] // 交换元素
  }
}

export function alignConfig(defaultConfig: any, userConfig: any): any {
  if (typeof defaultConfig !== 'object' || defaultConfig === null) {
    return typeof userConfig !== 'object' ? userConfig : defaultConfig // primitive or null
  }
  if (Array.isArray(defaultConfig)) {
    // 默认使用“覆盖”策略：如果用户提供的是数组，则用用户的；否则用默认
    return Array.isArray(userConfig) ? userConfig : defaultConfig
  }
  const result: any = {}
  for (const key of Object.keys(defaultConfig)) {
    if (key in userConfig) {
      result[key] = alignConfig(defaultConfig[key], userConfig[key])
    } else {
      result[key] = defaultConfig[key]
    }
  }
  return result
}
