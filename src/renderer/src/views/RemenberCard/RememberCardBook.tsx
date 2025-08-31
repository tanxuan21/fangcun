import { useNavigate, useParams } from 'react-router-dom'
import styles from './styles.module.scss'
import { Icon, IconTail } from '../../components/Icon/index'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Dropdown, message } from 'antd'
import {
  fetchCardsExtendInfo,
  finish_review,
  reduce_review_type_count,
  update_card_review
} from './api/cards'
import { CardsDataProvider, useCardData } from './CardsData'
import { Audio } from '../../components/Audio/Audio'
import { daysAfterToday, delay, fade, getTodayDate, shuffleArray } from '@renderer/utils'
import { BookSettingPage, BookSettingPageAPI } from './BookSettingPage/BookSettingPage'
import { BookReciteModeName, BookSettingInterface, CardDataExtendType, CardDataType } from './types'
import { ProgressPoints } from './ProgressPoints/ProgressPoints'
import { FinishReview } from './FinishReviewPage/FinishReviewPage'
import { CardListItem } from './CardListItem/CardListItem'
import { Layout } from './Layout/Layout'
import { RecordMain } from './RecordMain/RecoreMain'
import { updateBookInfo } from './api/books'

// 卡片对组件
// 复习使用
// 卡片对的职能:
// - 提交当前卡片的记忆状态
// - 显示当前卡片，以及动画
// 必须要有recite card，不然不能显示
const CardPair = ({
  recite_card, // 当前背诵的卡片
  handleRemember,
  handleForget,
  handleShow,
  handleVague,
  onReady, // 新卡片准备好了的事件。这是为了动画的一个拖鞋
  review_type_id, // 当前是哪个模式的卡片。实际的渲染也肯能根据这个模式有细微的变化
  Q,
  A // 内容物
}: {
  review_type_id: number
  recite_card: CardDataType
  handleRemember: () => Promise<void>
  handleVague: () => Promise<void>
  handleForget: () => Promise<void>
  handleShow: () => void
  onReady: () => void
  Q: React.ReactNode
  A: React.ReactNode
}) => {
  const [anserCardState, setAnserCardState] = useState<'ready' | 'show' | 'leave'>('ready')

  const [messageApi, contextHolder] = message.useMessage()
  const { cards, book } = useCardData()

  const [disableOpera, setDisableOpera] = useState<boolean>(false)

  // 快捷键事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 这里的事件要绑定组件内部生成的事件，而不是传递进来的事件
      const keyMapping = {
        ' ': handle_show_answer,
        q: handle_remember,
        w: handle_vague,
        e: handle_forget
      }
      if (keyMapping[event.key]) {
        keyMapping[event.key]()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cards, anserCardState])

  // 动画事件
  useEffect(() => {
    const handleTransitionEnd = (event: TransitionEvent) => {
      const answerWrapper = answerWrapperRef.current
      if (event.propertyName === 'translate' && answerWrapper) {
        if (anserCardState === 'leave') {
          // 自动**无动画**回到ready
          answerWrapper.style.transition = 'none'
          requestAnimationFrame(() => {
            setAnserCardState('ready')
            // 回到ready之后，恢复动画
            requestAnimationFrame(() => {
              answerWrapper.style.transition = ''
              onReady()
            })
          })
        }
      }
    }
    window.addEventListener('transitionend', handleTransitionEnd)
    return () => {
      window.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [recite_card, anserCardState]) // 记得加上 anserCardState。否则不会更新状态
  // 当记录成功之后，再修改ui

  // 高阶函数，创建handleRemenber,handleVague,handeForget的函数
  const ReviewStateHandleMaker = (memory_type: 'remember' | 'vague' | 'forget') => {
    const MemoryStateMapping = {
      remember: handleRemember,
      vague: handleVague,
      forget: handleForget
    }
    return async () => {
      // 没显示答案 / 压根没有recite card / 被禁用（动画中） 啥也不做
      if (anserCardState !== 'show' || recite_card === null || disableOpera) return
      // 在等待期间，禁止操作
      setDisableOpera(true)
      // 网络请求
      // 设置是否安排复习，还是随便逛逛
      const resp = book.setting.arrange_review
        ? await update_card_review(parseInt(recite_card.id), memory_type, review_type_id)
        : {
            success: true,
            message: '未记录复习数据'
          }
      if (resp.success) {
        await MemoryStateMapping[memory_type]() // 调用 UI 前端数据更变函数
        // 我期望等待UI更新之后，再把卡片移走
        setAnserCardState('leave') // 网络请求成功，改变UI
      } else {
        messageApi.error(resp.message)
        console.error(resp)
      }
      setDisableOpera(false)
    }
  }

  const handle_remember = ReviewStateHandleMaker('remember')
  const handle_vague = ReviewStateHandleMaker('vague')
  const handle_forget = ReviewStateHandleMaker('forget')
  const handle_show_answer = () => {
    if (anserCardState !== 'ready' || disableOpera) return
    setAnserCardState('show')
    handleShow()
  }

  const answerWrapperRef = useRef<HTMLDivElement>(null)

  const generalAnswerWrapperStyle = useMemo(() => {
    return {
      opacity: anserCardState === 'show' ? 1 : 0,
      translate:
        anserCardState === 'ready'
          ? `${window.innerWidth}px`
          : anserCardState === 'show'
            ? `${(Math.random() - 0.5) * 50}px`
            : `${-window.innerWidth}px`,
      // rotate: `${(Math.random() - 0.5) * 15}deg`
      rotate:
        anserCardState === 'ready'
          ? `${(Math.random() - 0.5) * 15}deg`
          : `${(Math.random() - 0.5) * 15}deg`
    }
  }, [anserCardState])

  // 控制动画

  return (
    <>
      {contextHolder}
      <div className={styles['recite-main-wrapper']}>
        <div className={styles['recite-main-card-wrapper']}>
          <>
            <div className={styles['q']}>{Q}</div>
            {/* 必须做一个wrapper，带着整个card 内容做动画。ref也是为了transitionend事件 */}
            <div
              ref={answerWrapperRef}
              className={styles['a-wrapper']}
              style={generalAnswerWrapperStyle}
            >
              <div className={`${styles['a']}`}>{A}</div>
            </div>
          </>
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
    </>
  )
}

// 卡片预览组件
const CardList = ({
  recite_card,
  CardsExtend,
  review_type_id
}: {
  recite_card: CardDataExtendType | null
  CardsExtend: CardDataExtendType[]
  review_type_id: number
}) => {
  const [messageApi, contextHolder] = message.useMessage()
  // 透明度计算函数，根据用户的操作记录，计算出来一个透明度。1-10 为计算的
  const alpha = (min: number, max: number, dis: number, v: number) => {
    return Math.min(Math.max(v, min), max) / dis
  }
  function getBrightness(color) {
    const rgb = color.match(/\d+/g).map(Number)
    // 用 RGB 的平均值来估算颜色的亮度
    return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114
  }
  const color = (color: string) => {}
  return (
    <>
      {/* {contextHolder} */}
      <div className={styles['recite-drawer-wrapper']}>
        {CardsExtend &&
          CardsExtend.map((item, index) => (
            <CardListItem
              key={item.id}
              content={
                review_type_id === 1 ? (
                  item.Q
                ) : review_type_id === 2 ? (
                  item.A
                ) : (
                  <Icon style={{ color: '#888' }} IconName="#icon-shengyin"></Icon>
                )
              }
              onClick={() => {}}
              active={item.id === recite_card?.id}
            >
              <>
                {
                  // 当日用户数据
                  // 不必复习 card.review_arrangement > today 添加一个灰色蒙层
                  // 正在复习 card.review_arrangement <= today && card.review_at !== today
                  // 复习完毕 card.review_at === today
                  item.review_arrangement <= getTodayDate() &&
                    item.review_at !== getTodayDate() && (
                      <div className={styles['cards-list-item-review-state-container']}>
                        <span
                          className={`${styles['review-label']} ${styles['remember-count-label']}`}
                          style={{
                            backgroundColor: fade(
                              'rgb(11, 173, 111)',
                              alpha(1, 11, 11, CardsExtend[index].remember)
                            ),
                            color:
                              alpha(1, 11, 11, CardsExtend[index].remember) < 0.5 ? '#555' : '#fff'
                          }}
                        >
                          {CardsExtend ? CardsExtend[index].remember : 0}
                        </span>
                        <span
                          className={`${styles['review-label']} ${styles['vague-count-label']}`}
                          style={{
                            backgroundColor: fade(
                              'rgba(255, 213, 0, 1)',
                              alpha(1, 11, 11, CardsExtend[index].vague)
                            ),
                            color:
                              alpha(1, 11, 11, CardsExtend[index].vague) < 0.5 ? '#555' : '#fff'
                          }}
                        >
                          {CardsExtend ? CardsExtend[index].vague : 0}
                        </span>
                        <span
                          className={`${styles['review-label']} ${styles['forget-count-label']}`}
                          style={{
                            backgroundColor: fade(
                              'rgb(224, 50, 19)',
                              alpha(1, 11, 11, CardsExtend[index].forget)
                            ),
                            color:
                              alpha(1, 11, 11, CardsExtend[index].forget) < 0.5 ? '#555' : '#fff'
                          }}
                        >
                          {CardsExtend ? CardsExtend[index].forget : 0}
                        </span>
                      </div>
                    )
                }
                {item.review_arrangement > getTodayDate() && (
                  <div
                    className={`${styles['cards-list-item-cover']} ${styles['no-review-today']}`}
                  ></div>
                )}
                {item.review_at === getTodayDate() && (
                  <div className={`${styles['cards-list-item-cover']} ${styles['review-done']}`}>
                    <Icon className={styles['icon-qveren']} IconName="#icon-queren1" />
                  </div>
                )}
              </>
            </CardListItem>
          ))}
      </div>
    </>
  )
}

// ===========================================================================================

const ReciteMain = ({ review_type_id }: { review_type_id: number }) => {
  const [messageApi, contextHolder] = message.useMessage()
  const { cards, book } = useCardData()
  // 当前的背诵卡片
  const [recite_card, set_recite_card] = useState<CardDataExtendType | null>(null)
  // 卡片缓存，为了动画的妥协
  const [recite_card_cache, set_recite_card_cache] = useState<CardDataExtendType | null>(
    recite_card
  )
  const [CardsExtend, setCardsExtend] = useState<CardDataExtendType[]>([])
  // 队列，将要复习的卡片index队列
  const recite_card_idx_queue_ref = useRef<number[]>([])

  const [finished_review, set_finished_review] = useState<boolean>(false)
  // 根据review_type_id -> QA 组件的mapping

  const AudioRef = useRef<{ play: () => void }>(null)
  const [audio_auto_play, set_audio_auto_play] = useState<boolean>(false)
  const review_type_id2QA = {
    // read
    1: {
      Q: (
        <>
          {recite_card_cache && (
            <>
              {recite_card_cache.Q}
              {book.setting.audio_model && (
                <Audio
                  ref={AudioRef}
                  src={null}
                  content={recite_card_cache.Q}
                  voice_model={book.setting.audio_model}
                ></Audio>
              )}
              {
                <ProgressPoints
                  className={styles['progress-points-class']}
                  count={recite_card?.review_count || 0}
                  progress={recite_card?.review_progress_count || 0}
                ></ProgressPoints>
              }
            </>
          )}
        </>
      ),
      A: (
        <>
          {recite_card_cache?.A}
          <ProgressPoints
            className={styles['progress-points-class']}
            count={recite_card?.review_count || 0}
            progress={recite_card?.review_progress_count || 0}
          ></ProgressPoints>
        </>
      )
    },
    // write
    2: {
      Q: (
        <>
          {recite_card_cache && recite_card_cache.A}{' '}
          <ProgressPoints
            className={styles['progress-points-class']}
            count={recite_card?.review_count || 0}
            progress={recite_card?.review_progress_count || 0}
          ></ProgressPoints>
        </>
      ),
      A: (
        <>
          {recite_card_cache && (
            <>
              <span>{recite_card_cache.Q}</span>
              {book.setting.audio_model && (
                <Audio
                  ref={AudioRef}
                  src={null}
                  autoPlay={audio_auto_play}
                  content={recite_card_cache.Q}
                  voice_model={book.setting.audio_model}
                ></Audio>
              )}
              <ProgressPoints
                className={styles['progress-points-class']}
                count={recite_card?.review_count || 0}
                progress={recite_card?.review_progress_count || 0}
              ></ProgressPoints>
            </>
          )}
        </>
      )
    },
    // listen
    3: {
      Q: (
        <>
          {recite_card_cache && (
            <Audio
              ref={AudioRef}
              src={null}
              autoPlay={audio_auto_play}
              content={recite_card_cache.Q}
              voice_model={book.setting.audio_model}
            ></Audio>
          )}
          <ProgressPoints
            className={styles['progress-points-class']}
            count={recite_card?.review_count || 0}
            progress={recite_card?.review_progress_count || 0}
          ></ProgressPoints>
        </>
      ),
      A: (
        <>
          {recite_card_cache && (
            <>
              {recite_card_cache.Q} {recite_card_cache.A}
              {
                <ProgressPoints
                  className={styles['progress-points-class']}
                  count={recite_card?.review_count || 0}
                  progress={recite_card?.review_progress_count || 0}
                ></ProgressPoints>
              }
            </>
          )}
        </>
      )
    }
  }
  // 这些数据是用于前端交互的数据。包括复习数据，复习安排数据等等。

  // 每次card更新，重新拿数据。
  // 可能是record了新的card。
  // reviews是前端维护的一份数据，它和card对齐。
  // 必须传递review_type_id，只针对这一个组件使用
  useEffect(() => {
    // 队列
    recite_card_idx_queue_ref.current = cards.map((_item, index) => index)
    ;(async function () {
      const _cards_extend: CardDataExtendType[] = await fetchCardsExtendInfo(
        cards,
        review_type_id,
        book.setting
      )
      setCardsExtend(_cards_extend)
      // 写入背诵队列。跳过那些今天已经复习完毕的
      const _queue: number[] = []
      for (let i = 0; i < _cards_extend.length; i++) {
        const card = _cards_extend[i]
        if (card.review_arrangement <= getTodayDate() && card.review_at !== getTodayDate()) {
          _queue.push(i)
        }
      }

      // 创建完前端的extend数据，写入recite card
      // 如果今天的背诵队列是空的，那说明背完了。
      if (_queue.length)
        (set_recite_card(_cards_extend[_queue[0]]), set_recite_card_cache(_cards_extend[_queue[0]]))
      else finished()
      recite_card_idx_queue_ref.current = _queue

      console.log(_cards_extend)
    })()
    // 复习安排记录
  }, [cards, book.setting])

  const getMemoryLevelReviewDelay = (setting: BookSettingInterface, level: number) => {
    for (const m of setting.memory_level) {
      if (m.level === level) return m.review_delay
    }
    console.error('getMemoryLevelData fail, level not in setting')
    return 1
  }

  // 安排下次复习时间
  const ArrangeNextReviewDate = (card: CardDataExtendType) => {
    const remember = card.remember
    const vague = card.vague
    const forget = card.forget
    const arrangement = { level: card.level, review_date: card.review_arrangement }
    const highest_level = book.setting.memory_level.length - 1 // 最高等级
    if (forget > 0) {
      // 回退一个等级，注意考虑无穷级回退，最小级小于1级
      if (arrangement.level === -1) arrangement.level = highest_level
      else arrangement.level = Math.max(1, arrangement.level) //最小不小于一级。设定一级是最低级
    } else if (vague > 0) {
      // 保持等级，什么都不做
    } else {
      // 进等级考虑无穷级
      if (arrangement.level === highest_level || arrangement.level === -1) arrangement.level = -1
      else arrangement.level++
    }

    // 根据等级计算下次复习时间
    if (forget + vague === 0) {
      // 这个单词一遍过，只有remember。按照进级的天数复习
      // 按照权值算出来的东西大概是小数，我期望取整数部分，同时最小也要是一天之后。
      arrangement.review_date = daysAfterToday(
        Math.max(1, Math.floor(getMemoryLevelReviewDelay(book.setting, arrangement.level)))
      )
    } else {
      // 说明这个词今天数次忘记/模糊。根据忘记/模糊的比例，计算延迟的复习日期
      const factor_forget = forget / (forget + vague)
      const factor_vague = vague / (forget + vague)
      // 按照权值算出来的东西大概是小数，我期望取整数部分，同时最小也要是一天之后。
      arrangement.review_date = daysAfterToday(
        Math.max(
          1,
          Math.floor(
            factor_forget * getMemoryLevelReviewDelay(book.setting, arrangement.level) + // 忘记，使用更新后的level的review_delay
              factor_vague * getMemoryLevelReviewDelay(book.setting, arrangement.level) // 模糊，使用当前的review_delay
          )
        )
      )
    }
    return arrangement
  }

  // 下一个 recite card，同时确定，当前的 recite card 接下来要看几次。
  // 注意，是接下来看几次，而不是继续累加。继续累加很恐怖的。
  // 这个 review_count 根据setting来做
  const next = async (memory_type: 'remember' | 'vague' | 'forget') => {
    if (recite_card === null) {
      messageApi.error('null recite_card')
      console.error('null recite_card')
      return
    }
    // 拿到review_count
    const review_count =
      memory_type === 'forget'
        ? book.setting.forget_review_count
        : memory_type === 'vague'
          ? book.setting.vague_review_count
          : 0

    const recite_card_idx_queue = recite_card_idx_queue_ref.current
    // 掐头。
    const head = recite_card_idx_queue.shift() as number
    // 更新 cards 数据
    const new_recite_card = {
      ...recite_card
    }
    new_recite_card[memory_type]++
    // 旧的review_progress_count
    // const old_progress_count = new_recite_card.review_progress_count
    if (review_count === 0) {
      new_recite_card.review_progress_count++
      set_recite_card(new_recite_card)
      setCardsExtend((prev) =>
        prev.map((item) => {
          if (item.id === recite_card.id) {
            return new_recite_card
          }
          return item
        })
      )
      // 如果更新后 review_progress_cout === review_count ，这个卡片已经复习完毕。可以提出相关的网络请求api
      // TODO finish_review
      if (new_recite_card.review_progress_count === new_recite_card.review_count) {
        // 计算下次复习时间
        new_recite_card.review_at = getTodayDate() // 记得更新 card 数据 review_at 更新今天的日期为复习日
        const arrangement = ArrangeNextReviewDate(new_recite_card)
        // 如果是随便逛逛，不发送网络请求请求
        if (book.setting.arrange_review) {
          // 完成复习，写入复习数据更新
          const resp = await finish_review(
            parseInt(new_recite_card.id),
            new_recite_card.review_type,
            arrangement.review_date,
            arrangement.level,
            0
          )
          // book info 减去对应 review_type 的count
          reduce_review_type_count(book.info, new_recite_card.review_type)
          // 更新book的info数据
          await updateBookInfo({ id: book.id, info: book.info })
          if (resp.success) {
          } else {
            messageApi.error(resp.message)
          }
        }
      }
    } else {
      ;((new_recite_card.review_progress_count = 0), (new_recite_card.review_count = review_count))
      set_recite_card(new_recite_card)
      setCardsExtend((prev) =>
        prev.map((item) => {
          if (item.id === recite_card.id) {
            return new_recite_card
          }
          return item
        })
      )
      // 背诵队列里，添加将要复习的count
      // 遍历，记录有多少个head
      let head_count = 0
      recite_card_idx_queue.forEach((item) => {
        if (item === head) head_count++
      })
      for (let i = 0; i < review_count - head_count; i++) {
        recite_card_idx_queue.push(head)
      }
    }

    // 延迟，等待前端的界面更新
    await delay(450)
    console.log('next', new_recite_card)

    // 洗牌
    shuffleArray(recite_card_idx_queue)
    // 取出队头的卡片
    if (recite_card_idx_queue.length) {
      // 这里又有一个bug
      // 如果，队头的卡片恰好就是刚刚变更的，这里是拿不到最新值的。必须做判断
      const next_recite_card = CardsExtend[recite_card_idx_queue[0]]
      if (next_recite_card.id === new_recite_card.id) {
        set_recite_card(new_recite_card)
      } else {
        set_recite_card(next_recite_card)
      }
    } else {
      set_recite_card(null)
      finished()
    }
  }

  const finished = () => {
    console.log('恭喜🎉 复习结束！')
    messageApi.success('恭喜🎉 复习结束！')
    set_finished_review(true)
    // recite_card_idx_queue_ref.current = cards.map((_item, index) => index) // 恢复。如果用户想再复习一轮的话。
    // 统计
  }

  return (
    <Layout
      card={
        <>
          {contextHolder}
          {finished_review ? (
            <FinishReview></FinishReview>
          ) : (
            recite_card_cache && (
              <CardPair
                review_type_id={review_type_id}
                recite_card={recite_card_cache}
                handleRemember={async () => {
                  await next('remember')
                }}
                handleForget={async () => {
                  await next('forget')
                }}
                handleVague={async () => {
                  await next('vague')
                }}
                handleShow={() => {
                  if (review_type_id === 2) {
                    AudioRef.current?.play()
                    set_audio_auto_play(true)
                  }
                }}
                onReady={() => {
                  set_recite_card_cache(recite_card)
                  set_audio_auto_play(false)
                }}
                Q={review_type_id2QA[review_type_id].Q}
                A={review_type_id2QA[review_type_id].A}
              />
            )
          )}
        </>
      }
      cards_list={
        <CardList
          review_type_id={review_type_id}
          recite_card={recite_card_cache}
          CardsExtend={CardsExtend}
        ></CardList>
      }
    ></Layout>
  )
}

const RememberCardBooksInner = () => {
  const { book } = useCardData()
  const [mode, set_mode] = useState<BookReciteModeName>('record')
  const ReciteMode2Component: { [key: string]: React.ReactNode } = {
    record: <RecordMain />,
    write: <ReciteMain key={2} review_type_id={2} />,
    read: <ReciteMain key={1} review_type_id={1} />,
    listen: <ReciteMain key={3} review_type_id={3} />
  }
  const nav = useNavigate()
  const BookSettingPageRef = useRef<BookSettingPageAPI>(null)
  return (
    <div className={styles['remember-card-app-container']}>
      <header>
        <IconTail
          IconName="#icon-zhankai"
          style={{ rotate: '90deg' }}
          className={styles['icon']}
          onClick={() => {
            nav(-1)
          }}
        ></IconTail>
        <span>{mode} Mode</span>

        <div className={styles['header-icon-group']}>
          <IconTail IconName="#icon-info" className={styles['icon']}></IconTail>
          {/* 修改模式 */}
          <Dropdown
            trigger={['click']}
            menu={{
              items: (function () {
                const items = [
                  {
                    key: -1,
                    label: 'record',
                    onClick: () => {
                      set_mode('record')
                    }
                  }
                ]
                book.setting.review_mode.forEach((rm) => {
                  if (rm.open) {
                    items.push({
                      key: rm.mode_id,
                      label: rm.mode_name,
                      onClick: () => {
                        set_mode(rm.mode_name)
                      }
                    })
                  }
                })
                return items
              })()
            }}
          >
            {/* 必须套一层，否则dropdown会出问题 */}
            <span className={styles['icon']}>
              <IconTail IconName="#icon-fenjifenlei"></IconTail>
            </span>
          </Dropdown>
          <IconTail
            onClick={() => {
              BookSettingPageRef.current?.pop()
            }}
            className={styles['icon']}
            IconName="#icon-shezhi"
          ></IconTail>
        </div>
      </header>

      <main>{ReciteMode2Component[mode]}</main>
      <footer>
        <p>book_id:{book.id}</p>
        {!book.setting.arrange_review && <p>warning: your review will not be recorded!</p>}
      </footer>

      <BookSettingPage ref={BookSettingPageRef}></BookSettingPage>
    </div>
  )
}

// app主体
export const RememberCardBooks = () => {
  const { book_id } = useParams<{ book_id: string }>()
  return (
    <CardsDataProvider book_id={parseInt(book_id as string)}>
      <RememberCardBooksInner />
    </CardsDataProvider>
  )
}
