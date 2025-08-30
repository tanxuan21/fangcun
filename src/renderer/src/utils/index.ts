export const getTodayDate = () => {
  const now = new Date()
  return formatDate(now)
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

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function fade(color: string, alpha: number): string {
  // 确保 alpha 值在 0 到 1 之间
  alpha = Math.min(Math.max(alpha, 0), 1)

  // 检查颜色格式
  if (color.startsWith('rgba')) {
    // 如果是 rgba，直接调整 alpha
    return color.replace(/rgba\((\d+), (\d+), (\d+), (\d+\.?\d*)\)/, (match, r, g, b, a) => {
      return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(parseFloat(a), 0), 1) * alpha})`
    })
  }

  if (color.startsWith('rgb')) {
    // 如果是 rgb，转换为 rgba 并设置 alpha
    return color.replace(/rgb\((\d+), (\d+), (\d+)\)/, (match, r, g, b) => {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    })
  }

  if (color.startsWith('#')) {
    // 如果是 hex 颜色，转换为 rgb 再设置 alpha
    const hex = color.slice(1) // 去掉 '#'
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    const color_string = `rgba(${r}, ${g}, ${b}, ${alpha})`
    console.log(color_string)
    return color_string
  }

  throw new Error('Unsupported color format')
}
export function addDaysToDate(dateStr: string, d: number): string {
  // 解析日期字符串为 Date 对象
  const date = new Date(dateStr)
  // 计算新的日期
  date.setDate(date.getDate() + d)
  // 格式化为 YYYY-MM-DD 字符串
  return formatDate(date)
}
export function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份从0开始，所以需要加1
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function daysAfterToday(d: number): string {
  if (d < 0) {
    console.warn('d < 0', d)
  }
  const date = new Date()
  date.setDate(date.getDate() + d)
  return formatDate(date)
}
