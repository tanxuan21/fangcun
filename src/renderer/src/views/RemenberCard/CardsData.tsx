import { ReactNode, useContext, useEffect, useState } from 'react'
import { createContext } from 'react'
import { get_cards_by_book_id } from './api/cards'
import { get_book_by_book_id } from './api/books'
import { alignConfig, getTodayDate } from '@renderer/utils'
import {
  BookInterface,
  BookSettingInterface,
  CardDataType,
  DefaultBookInfo,
  DefaultBookSetting
} from './types'

// createContext 的类型标注必须和后面value的一致
const cards_data_content = createContext<
  | {
      book_id: number
      book: BookInterface
      cards: CardDataType[]
      set_cards: React.Dispatch<React.SetStateAction<CardDataType[]>>
      set_book: React.Dispatch<React.SetStateAction<BookInterface>>
      set_setting: (BookSettingInterface) => void // 这个api只是一个语法糖，可以快速的更新
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
  const [book, set_book] = useState<BookInterface>({
    id: 0,
    name: 'book name',
    description: '',
    created_at: Date.now(),
    updated_at: Date.now(),
    setting: DefaultBookSetting,
    info: DefaultBookInfo
  })
  //   const [setting, set_setting] = useState<BookSettingInterface>(DefaultBookSetting)
  useEffect(() => {
    ;(async function () {
      // 获取卡片列表
      const cards_list = await get_cards_by_book_id(book_id)
      set_cards(cards_list.data)

      // 获取书的配置
      const book = (await get_book_by_book_id(book_id)).data

      // 对齐配置，书的配置可能是空配置。
      // 这种前端填补default字段的设计可以减少后端的压力。
      const book_setting = alignConfig(DefaultBookSetting, book.setting)
      const book_info = alignConfig(DefaultBookInfo, book.info)
      book.setting = book_setting
      book.info = book_info
      // 设置book对象
      set_book(book)
    })()
  }, [book_id])
  const set_setting = (book_setting: BookSettingInterface) => {
    set_book({ ...book, setting: book_setting })
  }
  return (
    <cards_data_content.Provider
      value={{
        cards,
        set_cards,
        book_id,
        book,
        set_book,
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
