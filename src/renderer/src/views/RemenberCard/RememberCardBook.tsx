import { useNavigate, useParams } from 'react-router-dom'
import styles from './styles.module.scss'
import { Icon } from '../../components/Icon/index'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import { Dropdown, message } from 'antd'
import {
  add_card,
  delete_card,
  get_card_review,
  get_cards_by_book_id,
  update_card,
  update_card_review
} from './api/cards'
import { CardDataType, CardsDataProvider, useCardData } from './CardsData'

import { EditableFeild } from './EditableFeild'
import { Audio } from '../../components/Audio/Audio'
import { EdgeTTS } from 'edge-tts-universal'
import { getTodayDate, shuffleArray } from '@renderer/utils'
import { BookSettingPage, BookSettingPageAPI } from './BookSettingPage/BookSettingPage'

interface ReciteCardBookConfig {}
// 基础布局组件
const Layout = ({ card, cards_list }) => {
  const [expand, set_expand] = useState<boolean>(true)
  return (
    <>
      <div className={styles['main-wrapper']}>{card}</div>
      <div className={`${styles['drawer-wrapper']} ${expand && styles['drawer-wrapper-expand']}`}>
        <div
          className={`${styles['drawer-handle']} ${expand && styles['drawer-handle-expand']}`}
          onClick={(event) => {
            event.stopPropagation()
            set_expand(!expand)
          }}
        ></div>
        <div className={styles['cards-container']}>{cards_list}</div>
      </div>
    </>
  )
}

// 抽屉里的card list item
const CardListItem = ({
  active,
  content,
  onClick,
  children
}: {
  active: boolean
  content: string
  onClick: MouseEventHandler<HTMLDivElement>
  children?: React.ReactNode
}) => {
  return (
    <div
      onClick={onClick}
      className={`${styles['card-list-item']} ${active && styles['card-list-item-active']}`}
    >
      {children}
      <p>{content}</p>
    </div>
  )
}

// 配置
const ConfigPage = () => {}

// 记录组件
const RecordMain = () => {
  const { cards, set_cards, book_id } = useCardData()
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
        <div
          className={`${styles['record-cards-list-add']} ${styles['card-list-item']}`}
          onClick={async () => {
            const resp = await add_card('question', 'answer', book_id)
            // 后端返回新添加的card_id，根据这个id修改前端
            set_cards((prev) => [
              ...prev,
              {
                id: resp.data.card_id,
                Q: 'question',
                A: 'answer',
                book_id
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
                    const resp = await delete_card(parseInt(item.id))
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

// 背诵组件
const ReciteMain = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const { cards, setting } = useCardData()
  // 当前的背诵卡片
  const [recite_card, set_recite_card] = useState<CardDataType | null>(null)
  // 队列，将要复习的卡片index队列
  const recite_card_idx_queue_ref = useRef<number[]>(cards.map((_item, index) => index))
  // 复习的信息
  const [reviews, set_reviews] = useState<
    { id: number; remember: number; vague: number; forget: number; card_id: number }[]
  >([])

  interface review_record {
    id: number
    remember: number
    vague: number
    forget: number
    card_id: number
    review_at: string
  }

  // 每次card更新，重新拿数据。
  useEffect(() => {
    if (cards.length) set_recite_card(cards[0])
    recite_card_idx_queue_ref.current = cards.map((_item, index) => index)
    ;(async function () {
      const _reviews: review_record[] = []
      for (const c of cards) {
        const data = await get_card_review(parseInt(c.id), getTodayDate(), getTodayDate())
        if (data.success) {
          if (data.data.length === 1) {
            _reviews.push(data.data[0])
          } else if (data.data.length < 1) {
            _reviews.push({
              id: 0,
              remember: 0,
              vague: 0,
              forget: 0,
              card_id: parseInt(c.id),
              review_at: getTodayDate()
            })
          } else {
            _reviews.push(data.data[0])
            console.warn(data)
          }
        } else {
          console.error('get review data error', data)
        }
      }
      set_reviews(_reviews)
    })()
  }, [cards])

  // 下一个 recite card，同时确定，当前的 recite card 接下来要看几次。
  // 注意，是接下来看几次，而不是继续累加。继续累加很恐怖的。

  const next = (review_count: number = 0) => {
    const recite_card_idx_queue = recite_card_idx_queue_ref.current
    // 掐头。
    const head = recite_card_idx_queue.shift() as number

    // 先找一下，目前的队列里已经有几个head
    let head_count = 0
    for (const id of recite_card_idx_queue) {
      if (id === head) {
        head_count++
      }
    }
    // 最多要 review次。
    for (let i = 0; i < review_count - head_count; i++) {
      recite_card_idx_queue.push(head)
    }
    // 洗牌
    shuffleArray(recite_card_idx_queue)
    // 检查是否空
    if (recite_card_idx_queue.length) {
      set_recite_card(cards[recite_card_idx_queue[0]])
    } else {
      set_recite_card(null)
      finished()
    }
  }

  const finished = () => {
    console.log('恭喜🎉 复习结束！')
    messageApi.success('恭喜🎉 复习结束！')
    recite_card_idx_queue_ref.current = cards.map((_item, index) => index) // 恢复。如果用户想再复习一轮的话。
  }

  const card = () => {
    const [anserCardState, setAnserCardState] = useState<'ready' | 'show' | 'leave'>('ready')
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case ' ': {
            handle_show_answer()
            break
          }
          case 'q': {
            handle_remember()
            break
          }
          case 'w': {
            handle_vague()
            break
          }
          case 'e': {
            handle_forget()
            break
          }
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }, [cards, anserCardState])
    // 当记录成功之后，再修改ui
    const handle_remember = async () => {
      if (anserCardState !== 'show' || recite_card === null) return // 没显示答案不能跳

      // 网络请求
      const resp = await update_card_review(parseInt(recite_card.id), 'remember')
      if (resp.success) {
        setAnserCardState('leave')
        next()
        set_reviews((prev) =>
          prev.map((item) => {
            if (item.card_id === parseInt(recite_card.id)) {
              return { ...item, remember: item.remember + 1 }
            }
            return item
          })
        )
      } else {
        messageApi.error('recite review update error!')
        console.error(resp)
      }
    }
    const handle_vague = async () => {
      if (anserCardState !== 'show' || recite_card === null) return // 没显示答案不能跳
      // 网络请求
      const resp = await update_card_review(parseInt(recite_card.id), 'vague')
      if (resp.success) {
        setAnserCardState('leave')
        next(2)
        set_reviews((prev) =>
          prev.map((item) => {
            if (item.card_id === parseInt(recite_card.id)) {
              return { ...item, vague: item.vague + 1 }
            }
            return item
          })
        )
      } else {
        messageApi.error('recite review update error!')
        console.error(resp)
      }
    }
    const handle_forget = async () => {
      if (anserCardState !== 'show' || recite_card === null) return // 没显示答案不能跳
      // 网络请求
      const resp = await update_card_review(parseInt(recite_card.id), 'forget')
      if (resp.success) {
        setAnserCardState('leave')
        next(2)
        set_reviews((prev) =>
          prev.map((item) => {
            if (item.card_id === parseInt(recite_card.id)) {
              return { ...item, forget: item.forget + 1 }
            }
            return item
          })
        )
      } else {
        messageApi.error('recite review update error!')
        console.error(resp)
      }
    }
    const handle_show_answer = () => {
      // 动画没放完不能跳
      if (anserCardState !== 'ready') return
      setAnserCardState('show')
    }

    const answerWrapperRef = useRef<HTMLDivElement>(null)
    const answerCardRef = useRef<HTMLDivElement>(null)

    // 控制动画
    useEffect(() => {
      const anserWrapper = answerWrapperRef.current
      const anserCard = answerCardRef.current
      if (anserWrapper && anserCard) {
        anserWrapper.ontransitionend = (event) => {
          if (event.propertyName === 'translate') {
            if (anserCardState === 'leave') {
              anserWrapper.style.transition = 'none'
              // 去除动画，下一帧再修改状态。
              requestAnimationFrame(() => {
                setAnserCardState('ready')
              })
              // 离开动画播放完毕，再回到ready。必须播放完毕动画才行
            } else if (anserCardState === 'ready') {
              anserCard.innerText = recite_card?.A ?? ''
              // 下一帧恢复，同步浏览器引擎的动画机制
              requestAnimationFrame(() => {
                anserWrapper.style.transition = ''
              })
            }
          }
        }

        //
        if (anserCardState === 'ready') {
          anserCard.innerText = recite_card?.A ?? ''
          anserWrapper.style.transition = 'none'

          requestAnimationFrame(() => {
            anserWrapper.style.transition = ''
          })
        }
      }

      return () => {
        if (anserWrapper && anserCard) {
          anserWrapper.ontransitionend = null
        }
      }
    }, [recite_card, anserCardState])
    return (
      recite_card && (
        <div className={styles['recite-main-wrapper']}>
          <div className={styles['recite-main-card-wrapper']}>
            {recite_card && (
              <>
                <div className={styles['q']}>
                  {recite_card.Q}
                  {setting.audio_model && (
                    <Audio
                      src={null}
                      content={recite_card.Q}
                      voice_model={setting.audio_model}
                    ></Audio>
                  )}
                </div>
                <div
                  ref={answerWrapperRef}
                  className={styles['a-wrapper']}
                  style={{
                    opacity: anserCardState === 'show' ? 1 : 0,
                    translate:
                      anserCardState === 'ready'
                        ? `${window.innerWidth}px`
                        : anserCardState === 'show'
                          ? `${(Math.random() - 0.5) * 50}px`
                          : `${-window.innerWidth}px`,
                    rotate:
                      anserCardState === 'show'
                        ? `${(Math.random() - 0.5) * 15}deg`
                        : `${(Math.random() - 0.5) * 15}deg`
                  }}
                >
                  <div ref={answerCardRef} className={`${styles['a']}`}>
                    {/* {recite_card.A} */}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles['recite-button-wrapper']}>
            {anserCardState === 'show' && (
              <>
                <button onClick={handle_remember} className={styles['remember-button']}>
                  remember
                </button>
                <button onClick={handle_vague} className={styles['vague-button']}>
                  vague
                </button>
                <button onClick={handle_forget} className={styles['forget-button']}>
                  forget
                </button>
              </>
            )}
            {anserCardState !== 'show' && (
              <>
                <button onClick={handle_show_answer} className={styles['show-answer-button']}>
                  show answer
                </button>
              </>
            )}
          </div>
        </div>
      )
    )
  }
  const cards_list = () => {
    return (
      <>
        {contextHolder}
        <div className={styles['recite-drawer-wrapper']}>
          {cards.map((item, index) => (
            <CardListItem
              key={item.id}
              content={item.Q}
              onClick={() => {
                // 应该不能让它有事件，否则会破坏背诵活动
                // set_recite_card(item)
              }}
              active={item.id === recite_card?.id}
            >
              {
                //
                <div className={styles['cards-list-item-review-state-container']}>
                  <span className={`${styles['review-label']} ${styles['remember-count-label']}`}>
                    {reviews[index] ? reviews[index].remember : 0}
                  </span>
                  <span className={`${styles['review-label']} ${styles['vague-count-label']}`}>
                    {reviews[index] ? reviews[index].vague : 0}
                  </span>
                  <span className={`${styles['review-label']} ${styles['forget-count-label']}`}>
                    {reviews[index] ? reviews[index].forget : 0}
                  </span>
                </div>
              }
            </CardListItem>
          ))}
        </div>
      </>
    )
  }
  return <Layout card={card()} cards_list={cards_list()}></Layout>
}
// 听写组件
const DictationMain = () => {
  const card = () => {
    ;<></>
  }
  const cards_list = () => {
    return <></>
  }
  return <Layout card={card()} cards_list={cards_list()}></Layout>
}

// 反向背诵
const ReciteReverse = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const { cards, setting } = useCardData()
  // 当前的背诵卡片
  const [recite_card, set_recite_card] = useState<CardDataType | null>(null)
  // 队列，将要复习的卡片index队列
  const recite_card_idx_queue_ref = useRef<number[]>(cards.map((_item, index) => index))
  // 复习的信息
  const [reviews, set_reviews] = useState<
    { id: number; remember: number; vague: number; forget: number; card_id: number }[]
  >([])

  interface review_record {
    id: number
    remember: number
    vague: number
    forget: number
    card_id: number
    review_at: string
  }

  // 每次card更新，重新拿数据。
  useEffect(() => {
    if (cards.length) set_recite_card(cards[0])
    recite_card_idx_queue_ref.current = cards.map((_item, index) => index)
    ;(async function () {
      const _reviews: review_record[] = []
      //   for (const c of cards) {
      //     const data = await get_card_review(parseInt(c.id), getTodayDate(), getTodayDate())
      //     if (data.success) {
      //       if (data.data.length === 1) {
      //         _reviews.push(data.data[0])
      //       } else if (data.data.length < 1) {
      //         _reviews.push
      // {
      //           id: 0,
      //           remember: 0,
      //           vague: 0,
      //           forget: 0,
      //           card_id: parseInt(c.id),
      //           review_at: getTodayDate()
      //         }
      //)
      //       } else {
      //         _reviews.push(data.data[0])
      //         console.warn(data)
      //       }
      //     } else {
      //       console.error('get review data error', data)
      //     }
      //   }
      for (const c of cards) {
        _reviews.push({
          id: 0,
          remember: 0,
          vague: 0,
          forget: 0,
          card_id: parseInt(c.id),
          review_at: getTodayDate()
        })
      }
      set_reviews(_reviews)
    })()
  }, [cards])

  // 下一个 recite card，同时确定，当前的 recite card 接下来要看几次。
  // 注意，是接下来看几次，而不是继续累加。继续累加很恐怖的。

  const next = (review_count: number = 0) => {
    const recite_card_idx_queue = recite_card_idx_queue_ref.current
    // 掐头。
    const head = recite_card_idx_queue.shift() as number

    // 先找一下，目前的队列里已经有几个head
    let head_count = 0
    for (const id of recite_card_idx_queue) {
      if (id === head) {
        head_count++
      }
    }
    // 最多要 review次。
    for (let i = 0; i < review_count - head_count; i++) {
      recite_card_idx_queue.push(head)
    }
    // 洗牌
    shuffleArray(recite_card_idx_queue)
    // 检查是否空
    if (recite_card_idx_queue.length) {
      set_recite_card(cards[recite_card_idx_queue[0]])
    } else {
      set_recite_card(null)
      finished()
    }
  }

  const finished = () => {
    console.log('恭喜🎉 复习结束！')
    messageApi.success('恭喜🎉 复习结束！')
    recite_card_idx_queue_ref.current = cards.map((_item, index) => index) // 恢复。如果用户想再复习一轮的话。
  }

  const card = () => {
    const [anserCardState, setAnserCardState] = useState<'ready' | 'show' | 'leave'>('ready')
    // 绑定键盘快捷键事件
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case ' ': {
            handle_show_answer()
            break
          }
          case 'q': {
            handle_remember()
            break
          }
          case 'w': {
            handle_vague()
            break
          }
          case 'e': {
            handle_forget()
            break
          }
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }, [cards, anserCardState])
    // 当记录成功之后，再修改ui
    // 标注事件
    const handle_remember = async () => {
      if (anserCardState !== 'show' || recite_card === null) return // 没显示答案不能跳
      // 网络请求
      const resp = await update_card_review(parseInt(recite_card.id), 'remember')
      if (resp.success) {
        setAnserCardState('leave')
        next()
        set_reviews((prev) =>
          prev.map((item) => {
            if (item.card_id === parseInt(recite_card.id)) {
              return { ...item, remember: item.remember + 1 }
            }
            return item
          })
        )
      } else {
        messageApi.error('recite review update error!')
        console.error(resp)
      }
      set_audio_autoplay(false)
    }
    const handle_vague = async () => {
      if (anserCardState !== 'show' || recite_card === null) return // 没显示答案不能跳
      // 网络请求
      const resp = await update_card_review(parseInt(recite_card.id), 'vague')
      if (resp.success) {
        setAnserCardState('leave')
        next(2)
        set_reviews((prev) =>
          prev.map((item) => {
            if (item.card_id === parseInt(recite_card.id)) {
              return { ...item, vague: item.vague + 1 }
            }
            return item
          })
        )
      } else {
        messageApi.error('recite review update error!')
        console.error(resp)
      }
      set_audio_autoplay(false)
    }
    const handle_forget = async () => {
      if (anserCardState !== 'show' || recite_card === null) return // 没显示答案不能跳
      // 网络请求
      const resp = await update_card_review(parseInt(recite_card.id), 'forget')
      if (resp.success) {
        setAnserCardState('leave')
        next(2)
        set_reviews((prev) =>
          prev.map((item) => {
            if (item.card_id === parseInt(recite_card.id)) {
              return { ...item, forget: item.forget + 1 }
            }
            return item
          })
        )
      } else {
        messageApi.error('recite review update error!')
        console.error(resp)
      }
      set_audio_autoplay(false)
    }
    const handle_show_answer = () => {
      // 动画没放完不能跳
      if (anserCardState !== 'ready') return
      setAnserCardState('show')
      set_audio_autoplay(true)
      AudioRef.current?.play()
    }

    const answerWrapperRef = useRef<HTMLDivElement>(null)
    const answerCardRef = useRef<HTMLDivElement>(null)
    const AudioRef = useRef<{ play: () => void }>(null)
    const [audio_autoplay, set_audio_autoplay] = useState<boolean>(false)
    // 控制动画
    useEffect(() => {
      const anserWrapper = answerWrapperRef.current
      const anserCard = answerCardRef.current
      if (anserWrapper && anserCard) {
        anserWrapper.ontransitionend = (event) => {
          if (event.propertyName === 'translate') {
            if (anserCardState === 'leave') {
              anserWrapper.style.transition = 'none'
              // 去除动画，下一帧再修改状态。
              requestAnimationFrame(() => {
                setAnserCardState('ready')
              })
              // 离开动画播放完毕，再回到ready。必须播放完毕动画才行
            } else if (anserCardState === 'ready') {
              anserCard.innerText = recite_card?.Q ?? ''
              // 下一帧恢复，同步浏览器引擎的动画机制
              requestAnimationFrame(() => {
                anserWrapper.style.transition = ''
              })
            }
          }
        }

        //
        if (anserCardState === 'ready') {
          anserCard.innerText = recite_card?.Q ?? ''
          anserWrapper.style.transition = 'none'

          requestAnimationFrame(() => {
            anserWrapper.style.transition = ''
          })
        }
      }

      return () => {
        if (anserWrapper && anserCard) {
          anserWrapper.ontransitionend = null
        }
      }
    }, [recite_card, anserCardState])
    return (
      recite_card && (
        <div className={styles['recite-main-wrapper']}>
          <div className={styles['recite-main-card-wrapper']}>
            {recite_card && (
              <>
                <div className={styles['q']}>
                  {/* 这是recite reverse，需要反转内容 */}
                  {recite_card.A}
                </div>
                <div
                  ref={answerWrapperRef}
                  className={styles['a-wrapper']}
                  style={{
                    opacity: anserCardState === 'show' ? 1 : 0,
                    translate:
                      anserCardState === 'ready'
                        ? `${window.innerWidth}px`
                        : anserCardState === 'show'
                          ? `${(Math.random() - 0.5) * 50}px`
                          : `${-window.innerWidth}px`,
                    rotate:
                      anserCardState === 'show'
                        ? `${(Math.random() - 0.5) * 15}deg`
                        : `${(Math.random() - 0.5) * 15}deg`
                  }}
                >
                  <div className={`${styles['a']}`}>
                    {/* {recite_card.A} */}
                    <span ref={answerCardRef}></span>
                    {setting.audio_model && (
                      <Audio
                        ref={AudioRef}
                        src={null}
                        autoPlay={audio_autoplay}
                        content={recite_card.Q}
                        voice_model={setting.audio_model}
                      ></Audio>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles['recite-button-wrapper']}>
            {anserCardState === 'show' && (
              <>
                <button onClick={handle_remember} className={styles['remember-button']}>
                  remember
                </button>
                <button onClick={handle_vague} className={styles['vague-button']}>
                  vague
                </button>
                <button onClick={handle_forget} className={styles['forget-button']}>
                  forget
                </button>
              </>
            )}
            {anserCardState !== 'show' && (
              <>
                <button onClick={handle_show_answer} className={styles['show-answer-button']}>
                  show answer
                </button>
              </>
            )}
          </div>
        </div>
      )
    )
  }
  const cards_list = () => {
    return (
      <>
        {contextHolder}
        <div className={styles['recite-drawer-wrapper']}>
          {cards.map((item, index) => (
            <CardListItem
              key={item.id}
              content={item.A}
              onClick={() => {
                // 应该不能让它有事件，否则会破坏背诵活动
                // set_recite_card(item)
              }}
              active={item.id === recite_card?.id}
            >
              {
                //
                <div className={styles['cards-list-item-review-state-container']}>
                  <span className={`${styles['review-label']} ${styles['remember-count-label']}`}>
                    {reviews[index] ? reviews[index].remember : 0}
                  </span>
                  <span className={`${styles['review-label']} ${styles['vague-count-label']}`}>
                    {reviews[index] ? reviews[index].vague : 0}
                  </span>
                  <span className={`${styles['review-label']} ${styles['forget-count-label']}`}>
                    {reviews[index] ? reviews[index].forget : 0}
                  </span>
                </div>
              }
            </CardListItem>
          ))}
        </div>
      </>
    )
  }
  return <Layout card={card()} cards_list={cards_list()}></Layout>
}

// app主体
export const RememberCardBooks = () => {
  const { book_id } = useParams<{ book_id: string }>()
  const [mode, set_mode] = useState<'Record' | 'Recite' | 'Dictation' | 'ReciteReverse'>('Recite')
  const nav = useNavigate()
  const BookSettingPageRef = useRef<BookSettingPageAPI>(null)
  return (
    <div className={styles['remember-card-app-container']}>
      <CardsDataProvider book_id={parseInt(book_id as string)}>
        <header>
          <Icon
            IconName="#icon-zhankai"
            style={{ rotate: '90deg' }}
            className={styles['icon']}
            onClick={() => {
              nav(-1)
            }}
          ></Icon>
          <span>{mode} Mode</span>

          <div className={styles['header-icon-group']}>
            {/* 修改模式 */}
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 1,
                    label: '录入',
                    onClick: () => {
                      set_mode('Record')
                    }
                  },
                  {
                    key: 2,
                    label: '读',
                    onClick: () => {
                      set_mode('Recite')
                    }
                  },
                  {
                    key: 4,
                    label: '写',
                    onClick: () => {
                      set_mode('ReciteReverse')
                    }
                  },
                  {
                    key: 3,
                    label: '听',
                    onClick: () => {
                      set_mode('Dictation')
                    }
                  },
                  {
                    key: 5,
                    label: '说（敬请期待）',
                    onClick: () => {
                      set_mode('Dictation')
                    },
                    disabled: true
                  }
                ]
              }}
            >
              {/* 必须套一层，否则dropdown会出问题 */}
              <span className={styles['icon']}>
                <Icon IconName="#icon-fenjifenlei"></Icon>
              </span>
            </Dropdown>
            <Icon
              onClick={() => {
                BookSettingPageRef.current?.pop()
              }}
              className={styles['icon']}
              IconName="#icon-shezhi"
            ></Icon>
          </div>
        </header>

        <main>
          {(function () {
            switch (mode) {
              case 'Record': {
                return <RecordMain />
              }
              case 'Recite': {
                return <ReciteMain />
              }
              case 'Dictation': {
                return <DictationMain />
              }
              case 'ReciteReverse': {
                return <ReciteReverse></ReciteReverse>
              }
            }
          })()}
        </main>
        <footer>book_id:{book_id}</footer>

        <BookSettingPage ref={BookSettingPageRef}></BookSettingPage>
      </CardsDataProvider>
    </div>
  )
}
