import styles from './styles.module.scss'
import { CardUnit } from './CardUnit/cardunit'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon/index'
import { AddIcon } from '@renderer/assets/icon'
import { CardDataType, CardsDataProvider, useCardData } from './cards_data'

export function RemenberCard() {
  const [hide_all_cards_preview_ctn, set_hied_all_cards_preview_ctn] = useState<boolean>(false)

  const { cards, set_cards } = useCardData()

  const [question_content, set_question_content] = useState<string>('')
  const [answer_content, set_answer_content] = useState<string>('')

  const question_content_ref = useRef('')
  const answer_content_ref = useRef('')

  useEffect(() => {
    question_content_ref.current = question_content
  }, [question_content])
  useEffect(() => {
    answer_content_ref.current = answer_content
  }, [answer_content])

  const [editing_item_id, set_editing_item_id] = useState<string>('')

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 保存并新建
    // if (event.metaKey && event.key === 'Enter') {
    // }
    // if (event.key === 'Tab') {
    //   console.log('next')
    // }
    if (event.key === 'ArrowRight') {
      handleAddCard()
    }
  }, [])
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 添加卡片
  const handleAddCard = () => {
    // 不能先save再add，这会导致竞态写入，每次都会忽略save。
    // 又不能暴力使用timeout。这会导致闪烁。直接拆开写算了。
    const new_id = crypto.randomUUID()
    const new_card = {
      id: new_id,
      A: '',
      Q: ''
    }
    const _current_card: CardDataType = {
      id: editing_item_id,
      A: answer_content,
      Q: question_content
    }
    console.log(_current_card)

    set_cards((prev) =>
      [...prev, new_card].map((item) => {
        if (item.id === editing_item_id) {
          return _current_card
        }
        return item
      })
    )
    handleEdit(new_card)
  }

  // 保存当前编辑的item
  const handleSave = () => {
    if (!editing_item_id) {
      return
    } else {
      const item: CardDataType = {
        id: editing_item_id,
        A: answer_content,
        Q: question_content
      }
      set_cards((prev) =>
        prev.map((_itm) => {
          if (item.id === _itm.id) {
            return item
          }
          return _itm
        })
      )
    }
  }

  // 编辑当前
  const handleEdit = (item: CardDataType) => {
    set_editing_item_id(item.id)
    set_answer_content(item.A)
    set_question_content(item.Q)
  }

  return (
    <div className={styles['container']}>
      <menu className={styles['menu']}>
        <span className={styles['menu-item']}>设置</span>
        <span className={styles['menu-item']}>确认</span>
        <span className={styles['menu-item']}>语言</span>
      </menu>
      <main className={styles['main-wapper']}>
        {editing_item_id && (
          <>
            <CardUnit
              key={`${editing_item_id}-Q`}
              content={question_content}
              set_content={(c: string) => {
                set_question_content(c)
              }}
            ></CardUnit>
            <CardUnit
              key={`${editing_item_id}-A`}
              content={answer_content}
              set_content={(c: string) => {
                set_answer_content(c)
              }}
            ></CardUnit>
          </>
        )}
      </main>

      {/* 显隐贴纸*/}
      <div
        className={`${styles['footer-handle']} ${hide_all_cards_preview_ctn && styles['footer-handle-hiden']}`}
        onClick={() => {
          set_hied_all_cards_preview_ctn(!hide_all_cards_preview_ctn)
        }}
      ></div>

      <footer
        onClick={() => {
          handleSave()
          set_editing_item_id('')
        }}
        className={`${styles['all-cards-container']} ${hide_all_cards_preview_ctn ? styles['all-card-container-hidden'] : ''}`}
      >
        {/* 预览卡片 */}
        <div className={styles['add-page']} onClick={handleAddCard}>
          <span className={styles['add-icon']}>+</span>
        </div>
        {cards.map((item, index) => {
          return (
            <div
              key={item.id}
              className={`${styles['card-preview']} ${editing_item_id === item.id && styles['card-preview-editing']}`}
              onClick={(event) => {
                event.stopPropagation()
                // 先保存上一个编辑的card。
                handleSave()
                // 然后再切换到现在点击的，如果是自己，就不切换。这会有bug
                if (item.id === editing_item_id) return
                handleEdit(item)
              }}
            >
              <span>{item.Q}</span>
            </div>
          )
        })}
      </footer>
    </div>
  )
}
