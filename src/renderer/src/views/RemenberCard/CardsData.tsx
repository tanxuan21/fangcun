import { ReactNode, useContext, useEffect, useState } from 'react'
import { createContext } from 'react'
import { get_cards_by_book_id } from './api/cards'
import { get_book_by_book_id } from './api/books'
import { alignConfig } from '@renderer/utils'
import { BookSettingInterface, DefaultBookSetting } from './types'

//所有card的数据
export type CardDataType = {
  Q: string
  A: string
  id: string
  book_id: number
}

// createContext 的类型标注必须和后面value的一致
const cards_data_content = createContext<
  | {
      book_id: number
      cards: CardDataType[]
      setting: BookSettingInterface
      set_cards: React.Dispatch<React.SetStateAction<CardDataType[]>>
      set_setting: React.Dispatch<React.SetStateAction<BookSettingInterface>>
    }
  | undefined
>(undefined)

export const CardsDataProvider = ({
  book_id,
  children
}: {
  book_id: number
  children: ReactNode
}) => {
  const [cards, set_cards] = useState<CardDataType[]>([])
  const [setting, set_setting] = useState<BookSettingInterface>(DefaultBookSetting)
  useEffect(() => {
    ;(async function () {
      const cards_list = await get_cards_by_book_id(book_id)
      set_cards(cards_list.data)
      // 获取书的配置
      const book = (await get_book_by_book_id(book_id)).data
      const book_setting = alignConfig(DefaultBookSetting, JSON.parse(book.setting))
      set_setting(book_setting)
    })()
  }, [book_id])
  return (
    <cards_data_content.Provider
      value={{
        cards,
        set_cards,
        book_id,
        setting,
        set_setting
      }}
    >
      {children}
    </cards_data_content.Provider>
  )
}

export const useCardData = () => {
  const ctx = useContext(cards_data_content)
  if (!ctx) throw new Error('useCardData must be used within golbalprovider')
  return ctx
}
