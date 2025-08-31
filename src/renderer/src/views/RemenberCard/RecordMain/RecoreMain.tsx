import { useEffect, useRef, useState } from 'react'
import { useCardData } from '../CardsData'
import { CardDataType } from '../types'
import styles from '../styles.module.scss'
import { EditableFeild } from '../EditableFeild'
import { daysAfterToday, getTodayDate } from '@renderer/utils'
import { Icon } from '@renderer/components/Icon'
import { add_card, add_new_card_book_info_update, delete_card, update_card } from '../api/cards'
import { Dropdown } from 'antd'
import { CardListItem } from '../CardListItem/CardListItem'
import { Layout } from '../Layout/Layout'
// 记录组件
export const RecordMain = () => {
  const { cards, set_cards, book } = useCardData()
  const [edite_card, set_edite_card] = useState<CardDataType | null>(null)

  const q_ref = useRef<{ focus: () => void }>(null)
  // cards更新也要更新 edite_card?
  // 目前来看是的，否则，保存完之后会导致item的显示不更新
  useEffect(() => {
    if (!edite_card) return
    cards.forEach((x) => {
      if (x.id === edite_card.id) {
        set_edite_card(x)
      }
    })
  }, [cards])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key
      switch (key) {
        case 'ArrowLeft': {
          break
        }
        case 'ArrowRight': {
          break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  // 卡片组件，显示/编辑 edita_card
  const card = () => {
    return (
      <div
        onClick={(event) => {
          event?.stopPropagation()
        }}
        className={styles['record-main-wrapper']}
      >
        {edite_card && (
          <>
            <div className={styles['q']}>
              <EditableFeild
                ref={q_ref}
                className={styles['edite-feild']}
                value={edite_card.Q}
                onUpdate={(next: string) => {
                  set_cards((prev) =>
                    prev.map((x) => {
                      if (x.id === edite_card.id) {
                        return {
                          ...edite_card,
                          Q: next
                        }
                      }
                      return x
                    })
                  )
                }}
                onSave={async (next: string) => {
                  const resp = await update_card(parseInt(edite_card.id), {
                    Q: next
                  })
                  if (!resp.success) {
                    console.log(resp)
                    throw new Error(resp.message) // 扔给editablefeild 处理
                  }
                }}
              ></EditableFeild>
            </div>
            <div className={styles['a']}>
              <EditableFeild
                className={styles['edite-feild']}
                value={edite_card.A}
                onUpdate={(next: string) => {
                  set_cards((prev) =>
                    prev.map((x) => {
                      if (x.id === edite_card.id) {
                        return {
                          ...edite_card,
                          A: next
                        }
                      }
                      return x
                    })
                  )
                }}
                onSave={async (next: string) => {
                  const resp = await update_card(parseInt(edite_card.id), {
                    A: next
                  })
                  console.log(resp)

                  if (!resp.success) {
                    console.log(resp)
                    throw new Error(resp.message) // 扔给editablefeild 处理
                  }
                }}
                onTab={(event) => {
                  event.preventDefault()
                  ;(q_ref.current as { focus: () => void }).focus()
                }}
              ></EditableFeild>
            </div>
          </>
        )}
      </div>
    )
  }

  // 卡片列表
  const cards_list = () => {
    return (
      <div className={styles['record-drawer-wrapper']}>
        {/* 添加新卡片 */}
        <div
          className={`${styles['record-cards-list-add']} ${styles['card-list-item']}`}
          onClick={async () => {
            // 这里的问题是，book.info 根据里面已有的review_type++。
            // 所以，对新建的book，要求info的review_count的结构匹配setting的review_mode 里open字段为true
            add_new_card_book_info_update(book.info, 1) // 更新book info，添加一张卡片
            const resp = await add_card('question', 'answer', book)
            // 后端返回新添加的card_id，根据这个id修改前端
            set_cards((prev) => [
              ...prev,
              {
                id: resp.data.card_id,
                Q: 'question',
                A: 'answer',
                book_id: book.id,
                // 认为上次复习日期是昨天，才能安排今天复习
                review_at: daysAfterToday(-1)
              }
            ])
          }}
        >
          <Icon IconName="#icon-jia"></Icon>
        </div>
        {cards.map((item) => (
          <Dropdown
            key={item.id}
            trigger={['contextMenu']}
            menu={{
              items: [
                {
                  key: '1',
                  label: '删除',
                  danger: true,
                  icon: <Icon IconName="#icon-shanchu"></Icon>,
                  onClick: async () => {
                    add_new_card_book_info_update(book.info, -1) // 更新
                    const resp = await delete_card(parseInt(item.id), book)
                    if (resp.success) {
                      set_cards((prev) => prev.filter((x) => x.id !== item.id))
                    } else {
                      console.error(resp)
                    }
                  }
                }
              ]
            }}
          >
            {/* 卡片item */}
            <div>
              <CardListItem
                onClick={(event) => {
                  event.stopPropagation()
                  // 如果某元素正在被编辑，这时候要失焦
                  // 否则直接跳会有bug。失焦保存数据，切换editacard写入数据会冲突。
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur()
                  }

                  set_edite_card(item)
                }}
                active={edite_card?.id === item.id}
                content={item.Q}
              ></CardListItem>
            </div>
            {/* <div
              onClick={(event) => {
                event.stopPropagation()
                // 如果某元素正在被编辑，这时候要失焦
                // 否则直接跳会有bug。失焦保存数据，切换editacard写入数据会冲突。
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur()
                }

                set_edite_card(item)
              }}
              className={`${styles['card-list-item']} ${edite_card?.id === item.id && styles['card-list-item-active']}`}
            >
              <p>{item.Q}</p>
            </div> */}
          </Dropdown>
        ))}
      </div>
    )
  }
  return <Layout card={card()} cards_list={cards_list()}></Layout>
}
