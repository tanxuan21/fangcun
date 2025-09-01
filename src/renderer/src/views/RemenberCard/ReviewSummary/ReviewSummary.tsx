import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import styles from './styles.module.scss'
import { useCardData } from '../CardsData'
import { CardDataExtendType } from '../types'
import { fetchCardsExtendInfo } from '../api/cards'

interface props {}
export const ReviewSummary = forwardRef(({}: props, ref) => {
  const [isShow, setIsShow] = useState<boolean>(false)
  useImperativeHandle(ref, () => ({
    show: () => {
      setIsShow(true)
    },
    troggleShow: () => {
      setIsShow(!isShow)
    }
  }))

  const { book, cards } = useCardData()
  const [cardsExtendData, setCardsExtendData] = useState<CardDataExtendType[]>([])
  // 拿数据
  useEffect(() => {
    ;(async function () {
      const _cardextent = await fetchCardsExtendInfo(cards, 1, book.setting)
      console.log(_cardextent)
      setCardsExtendData(_cardextent)
    })()
  }, [cards])
  return (
    <div
      className={`${styles['review-summary-container']} ${isShow && styles['review-summary-show']}`}
    >
      <span
        onClick={() => {
          setIsShow(false)
        }}
      >
        返回
      </span>
      {/* 
      {cardsExtendData.map((c) => (
        <p key={c.id}>
          Q:{c.Q} A:{c.A} review_at:{c.review_at} review arrangement:{c.review_arrangement}
        </p>
      ))} */}
      <table>
        <thead>
          <tr>
            <th>Q</th>
            <th>A</th>
            <th>review at</th>
            <th>review arrangement</th>
          </tr>
        </thead>
        <tbody>
          {cardsExtendData.map((c) => {
            return (
              <tr key={c.id}>
                <th>{c.Q}</th>
                <th>{c.A}</th>
                <th>{c.review_at}</th>
                <th>{c.review_arrangement}</th>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
})
