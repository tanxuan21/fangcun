import { useEffect, useState } from 'react'
import { WordsInstance } from './words'
export const RecordWords = () => {
  const [mentions, set_mentions] = useState<string[]>([])
  /**
   * 模糊匹配（基于字符串包含）
   * @param input 用户输入
   * @param wordList 单词列表
   * @param caseSensitive 是否区分大小写（默认不区分）
   * @returns 匹配的单词列表
   */
  function fuzzyMatch(input: string, wordList: string[], caseSensitive: boolean = false): string[] {
    const normalizedInput = caseSensitive ? input : input.toLowerCase()
    return wordList.filter((word) => {
      const normalizedWord = caseSensitive ? word : word.toLowerCase()
      return normalizedWord.includes(normalizedInput)
    })
  }
  useEffect(() => {}, [])
  return (
    <div>
      {/* 输入下拉菜单提示 */}
      <div>
        <input
          type="text"
          onChange={(e) => {
            const v = e.target.value
            // 搜索，模糊匹配
          }}
        />
        <div>
          {mentions.map((item) => (
            <p>{item}</p>
          ))}
        </div>
      </div>
      {/* 显示列表 */}
      <div></div>
      {/* 来源 */}
    </div>
  )
}
