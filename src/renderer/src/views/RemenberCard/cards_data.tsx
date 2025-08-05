import { ReactNode, useContext, useState } from 'react'
import { createContext } from 'react'

//所有card的数据
export type CardDataType = {
  Q: string
  A: string
  id: string
}

// createContext 的类型标注必须和后面value的一致
const cards_data_content = createContext<
  | {
      cards: CardDataType[]
      set_cards: React.Dispatch<React.SetStateAction<CardDataType[]>>
    }
  | undefined
>(undefined)

export const CardsDataProvider = ({ children }: { children: ReactNode }) => {
  const [cards, set_cards] = useState<CardDataType[]>([])
  return (
    <cards_data_content.Provider
      value={{
        cards,
        set_cards
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
