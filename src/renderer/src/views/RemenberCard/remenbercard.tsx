import styles from './styles.module.scss'
import { CardUnit } from './CardUnit/cardunit'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon/index'
import { AddIcon } from '@renderer/assets/icon'
import { CardDataType, CardsDataProvider, useCardData } from './cards_data'
import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import { useNavigate } from 'react-router-dom'
import { bs64 } from './audio'

enum ModeState {
  Recite,
  Record,
  Dictation
}

enum LanguageState {
  English,
  Korean,
  Japanese,
  Honkong
}

const language_content = {
  [LanguageState[LanguageState.English]]: 'English',
  [LanguageState[LanguageState.Korean]]: '한',
  [LanguageState[LanguageState.Japanese]]: '日本語',
  [LanguageState[LanguageState.Honkong]]: '香港'
}

function RemenberCard() {
  const [remember_card_config, set_remember_card_config] = useState<{
    mode: ModeState
    language: LanguageState
  }>({
    mode: ModeState.Record,
    language: LanguageState.English
  })
  const [hide_all_cards_preview_ctn, set_hied_all_cards_preview_ctn] = useState<boolean>(false)
  const audio_ref = useRef<HTMLAudioElement | null>(null)
  const { cards, set_cards } = useCardData()

  const [question_content, set_question_content] = useState<string>('')
  const [answer_content, set_answer_content] = useState<string>('')

  const question_content_ref = useRef('')
  const answer_content_ref = useRef('')

  const nav = useNavigate()
  useEffect(() => {
    question_content_ref.current = question_content
  }, [question_content])
  useEffect(() => {
    answer_content_ref.current = answer_content
  }, [answer_content])

  const [editing_item_id, set_editing_item_id] = useState<string>('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleSave()
        if (!editing_item_id) {
          // 没有editing，直接创建
          handleAddCard()
        } else {
          cards.forEach((item, index) => {
            if (item.id === editing_item_id) {
              if (index >= cards.length - 1) {
                // 最后一个
                handleAddCard()
              } else {
                handleEdit(cards[index + 1])
              }
            }
          })
        }
      } else if (event.key === 'ArrowLeft') {
        handleSave()
        if (!editing_item_id) {
          if (cards.length > 0) handleEdit(cards[0])
          else handleAddCard()
        }
        cards.forEach((item, index) => {
          if (item.id === editing_item_id) {
            // 命中
            if (index === 0) {
              handleEdit(cards[cards.length - 1])
            } else {
              handleEdit(cards[index - 1])
            }
          }
        })
      } else if (event.shiftKey && event.ctrlKey && event.key === '~') {
        window.api.openTerminal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [answer_content, question_content, cards, editing_item_id])

  const [audio_src, set_audio_src] = useState<string>('')
  useEffect(() => {
    ;(async function () {
      //const base64 = await window.api.fetchAudio('안녕하세요, 저는 광주 출신입니다', 'ko')
      set_audio_src(bs64)
    })()
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

  const DropDownMenuLabel = (text: string) => {
    return <p className={styles['drop-down-menu-label']}>{text}</p>
  }

  return (
    <div className={styles['container']}>
      {audio_src && (
        <audio autoPlay ref={audio_ref} loop>
          <source type="audio/mpeg" src={audio_src} />
          not support
        </audio>
      )}
      <menu className={styles['menu']}>
        <span
          className={styles['menu-item']}
          onClick={() => {
            nav(-1)
          }}
        >
          返回
        </span>
        {(function () {
          const pattern_items = [
            {
              key: '模式-背诵',
              label: DropDownMenuLabel('背诵'),
              onClick: () => {
                set_remember_card_config({
                  ...remember_card_config,
                  mode: ModeState.Recite
                })
              }
            },
            {
              key: '模式-录入',
              label: DropDownMenuLabel('录入'),
              onClick: () => {
                set_remember_card_config({
                  ...remember_card_config,
                  mode: ModeState.Record
                })
              }
            },
            {
              key: '模式-听写',
              label: DropDownMenuLabel('听写'),
              onClick: () => {
                set_remember_card_config({
                  ...remember_card_config,
                  mode: ModeState.Dictation
                })
              }
            }
          ]

          const language = [
            {
              key: '语言-英文',
              label: DropDownMenuLabel(language_content[LanguageState[LanguageState.English]]),
              onClick: () => {
                set_remember_card_config({
                  ...remember_card_config,
                  language: LanguageState.English
                })
              }
            },
            {
              key: '语言-日文',
              label: DropDownMenuLabel(language_content[LanguageState[LanguageState.Japanese]]),
              onClick: () => {
                set_remember_card_config({
                  ...remember_card_config,
                  language: LanguageState.Japanese
                })
              }
            },
            {
              key: '语言-韩文',
              label: DropDownMenuLabel(language_content[LanguageState[LanguageState.Korean]]),
              onClick: () => {
                set_remember_card_config({
                  ...remember_card_config,
                  language: LanguageState.Korean
                })
              }
            },
            {
              key: '语言-粤语',
              label: DropDownMenuLabel(language_content[LanguageState[LanguageState.Honkong]]),
              onClick: () => {
                set_remember_card_config({
                  ...remember_card_config,
                  language: LanguageState.Honkong
                })
              }
            }
          ]

          return (
            <>
              {' '}
              <span className={styles['menu-item']}>设置</span>
              <Dropdown menu={{ items: language }}>
                <span className={styles['menu-item']}>
                  {language_content[LanguageState[remember_card_config.language]]}
                </span>
              </Dropdown>
              {/* 生成语音 进行错误控制 */}
              <span className={styles['menu-item']}>工具</span>
              {/* 背诵 / 录入 */}
              <Dropdown menu={{ items: pattern_items }}>
                <span className={styles['menu-item']}>模式</span>
              </Dropdown>
            </>
          )
        })()}
      </menu>
      <main className={styles['main-wapper']}>
        {editing_item_id &&
          (() => {
            switch (remember_card_config.mode) {
              case ModeState.Recite: {
                return (
                  <>
                    <CardUnit
                      editable={false}
                      key={`${editing_item_id}-Q`}
                      content={question_content}
                      onClick={() => {}}
                    ></CardUnit>
                    <CardUnit
                      editable={false}
                      key={`${editing_item_id}-Q`}
                      content={question_content}
                      onClick={() => {}}
                    ></CardUnit>
                  </>
                )
              }
              case ModeState.Record: {
                return (
                  <>
                    <CardUnit
                      editable={true}
                      key={`${editing_item_id}-Q`}
                      content={question_content}
                      set_content={(c: string) => {
                        set_question_content(c)
                      }}
                    ></CardUnit>
                    <CardUnit
                      editable={true}
                      key={`${editing_item_id}-A`}
                      content={answer_content}
                      set_content={(c: string) => {
                        set_answer_content(c)
                      }}
                    ></CardUnit>
                  </>
                )
              }
            }
          })()}
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

export function RemenberCardContent() {
  return (
    <CardsDataProvider>
      <RemenberCard></RemenberCard>
    </CardsDataProvider>
  )
}

// async function main({ params }: Args): Promise<Output> {
//   // 构建输出对象
//   const content = params['content']
//   const raw = params['raw']
//   const xhs = params['xhs']

//   const like = xhs['likedCount']
//   const share = xhs['shareCount']
//   const collect = xhs['collectdCount']
//   const commend = xhs['commentCount']
//   const desc = xhs['desc']
//   const url = params['url']

//   const record = {
//     feild: {
//       url: url,
//       like: like,
//       share: share,
//       collect: collect,
//       commend: commend,
//       desc: desc,
//       raw: raw,
//       content: content
//     }
//   }
//   const ret = {
//     records: [record]
//   }

//   return ret
// }
