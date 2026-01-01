/**
 * 比较给定时间与当前时间，返回相对时间描述
 * @param timeString 格式如 "2026-01-01 03:00:41"
 * @returns 相对时间描述，如 "x天前"、"x天后"、"今天"
 */
export function getRelativeTime(timeString: string): number {
  // 解析输入的时间字符串
  const inputTime = new Date(timeString)

  // 获取当前时间
  const now = new Date()

  // 计算两个日期的日期部分（忽略时间）
  const inputDate = new Date(inputTime.getFullYear(), inputTime.getMonth(), inputTime.getDate())
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 计算日期差（以天为单位）
  const timeDiff = inputDate.getTime() - currentDate.getTime()
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

  return dayDiff
  // 根据差值返回相应的描述
  //   if (dayDiff === 0) {
  //     return '今天'
  //   } else if (dayDiff > 0) {
  //     return `${dayDiff}天后`
  //   } else {
  //     return `${Math.abs(dayDiff)}天前`
  //   }
}

/**
 * 增强版本：包含时间部分的比较，如果是今天显示具体时间差
 * @param timeString 格式如 "2026-01-01 03:00:41"
 * @returns 相对时间描述
 */
export function getRelativeTimeDetailed(timeString: string): string {
  const inputTime = new Date(timeString)
  const now = new Date()

  // 计算完整的时间差（毫秒）
  const timeDiff = inputTime.getTime() - now.getTime()

  // 计算天数差（基于日期部分）
  const inputDate = new Date(inputTime.getFullYear(), inputTime.getMonth(), inputTime.getDate())
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayDiff = Math.floor((inputDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) {
    // 如果是今天，计算小时差
    const hourDiff = Math.floor(timeDiff / (1000 * 60 * 60))

    if (hourDiff === 0) {
      // 如果是同一小时，计算分钟差
      const minuteDiff = Math.floor(timeDiff / (1000 * 60))

      if (minuteDiff === 0) {
        const secondDiff = Math.floor(timeDiff / 1000)
        if (secondDiff >= 0) {
          return secondDiff === 0 ? '现在' : `${secondDiff}秒后`
        } else {
          return `${Math.abs(secondDiff)}秒前`
        }
      } else if (minuteDiff > 0) {
        return `${minuteDiff}分钟后`
      } else {
        return `${Math.abs(minuteDiff)}分钟前`
      }
    } else if (hourDiff > 0) {
      return `${hourDiff}小时后`
    } else {
      return `${Math.abs(hourDiff)}小时前`
    }
  } else if (dayDiff > 0) {
    return `${dayDiff}天后`
  } else {
    return `${Math.abs(dayDiff)}天前`
  }
}

// 测试示例
// const testCases = [
//   '2026-01-01 03:00:41', // 未来的某个日期
//   '2025-12-31 23:59:59', // 过去的某个日期
//   new Date().toISOString().replace('T', ' ').substring(0, 19) // 当前时间
// ]

// console.log('简单版本:')
// testCases.forEach((timeStr) => {
//   console.log(`${timeStr} -> ${getRelativeTime(timeStr)}`)
// })

// console.log('\n详细版本:')
// testCases.forEach((timeStr) => {
//   console.log(`${timeStr} -> ${getRelativeTimeDetailed(timeStr)}`)
// })

// 或者直接导出一个默认函数
// export function formatRelativeTime(timeString: string, detailed: boolean = false): string {
//   return detailed ? getRelativeTimeDetailed(timeString) : getRelativeTime(timeString)
// }

export function GetTodayTimeBegin2End(): { begin: string; end: string } {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return {
    begin: `${year}-${month}-${day} 00:00:00`,
    end: `${year}-${month}-${day} 23:59:59`
  }
}
