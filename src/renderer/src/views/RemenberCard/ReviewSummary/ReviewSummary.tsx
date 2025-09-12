import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import styles from './styles.module.scss'
import { useCardData } from '../CardsData'
import { BookInterface, CardDataExtendType, DefaultBookInfo, reviewTypeId2ModeName } from '../types'
import { fetchCardsExtendInfo, get_cards_by_book_id } from '../api/cards'
import { useNavigate, useParams } from 'react-router-dom'
import { get_book_by_book_id } from '../api/books'
import { Dropdown } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { getDateDiffInDays, getTodayDate } from '@renderer/utils'

const filterFeilds = [
  'review_progress_count',
  'review_type',
  'review_count',
  'id',
  'book_id',
  'audio'
]

interface props {
  //   review_type_id: number
}
export const ReviewSummary = forwardRef(({}: props, ref) => {
  const { book_id } = useParams<{ book_id: string }>()
  useImperativeHandle(ref, () => ({}))
  const [cardsExtendData, setCardsExtendData] = useState<CardDataExtendType[]>([])

  const [review_type_id, set_review_type_id] = useState<number>(1)
  const [book, set_book] = useState<BookInterface>()
  const nav = useNavigate()
  // 拿数据
  useEffect(() => {
    ;(async function () {
      const cards = (await get_cards_by_book_id(parseInt(book_id as string))).data
      const book = (await get_book_by_book_id(parseInt(book_id as string))).data
      set_book(book)
      const cardsExtendList = await fetchCardsExtendInfo(cards, review_type_id, book.setting)
      //   console.log(cardsExtendList)

      setCardsExtendData(cardsExtendList)
    })()
  }, [review_type_id])
  return (
    <div className={`${styles['review-summary-container']}`}>
      <span
        onClick={() => {
          nav(-1)
        }}
      >
        返回
      </span>
      <Dropdown
        menu={{
          items: (function () {
            const items: ItemType[] = []
            book
              ? book.setting.review_mode.forEach((rm) => {
                  if (rm.open) {
                    items.push({
                      key: rm.mode_id,
                      label: rm.mode_name,
                      onClick: () => {
                        set_review_type_id(rm.mode_id)
                      }
                    })
                  }
                })
              : ''
            return items
          })()
        }}
      >
        <span>{reviewTypeId2ModeName[review_type_id]} mode</span>
      </Dropdown>

      {cardsExtendData.length && (
        <table className={styles['review-summary-table']}>
          <thead>
            <tr>
              {Object.keys(cardsExtendData[0])
                .filter((c) => !filterFeilds.includes(c))
                .map((c, i) => {
                  return <th key={i}>{c}</th>
                })}
            </tr>
          </thead>
          <tbody>
            {cardsExtendData.map((c) => {
              return (
                <tr key={c.id}>
                  {Object.keys(c)
                    .filter((c) => !filterFeilds.includes(c))
                    .map((attr, i) => {
                      let v = c[attr]
                      if (['review_at', 'review_arrangement'].includes(attr)) {
                        v = getDateDiffInDays(v, getTodayDate())
                        v = v === 0 ? '今天' : v > 0 ? `${v}天后` : `${Math.abs(v)}天前`
                      }
                      return <th key={i}>{v}</th>
                    })}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
})
