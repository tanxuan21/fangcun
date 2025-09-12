import { bufferObjectToBlob, daysAfterToday, getTodayDate } from '@renderer/utils'
import {
  BookInfoInterface,
  BookInterface,
  BookSettingInterface,
  CardDataExtendType,
  CardDataType,
  UserReviewArrangement
} from '../types'
import { updateBookInfo } from './books'

const PREFIX = `${'http://localhost:3001'}/api/recite/cards`

export const get_card_by_card_id = async (card_id: number) => {
  const resp = await fetch(`${PREFIX}/get_card/${card_id}`, { method: 'GET' })
  const text = await resp.text()
  const data = JSON.parse(text, bufferFilter)
  return data
}

// 过滤buffer
export const bufferFilter = (key: string, value: any) => {
  if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
    return new Blob([new Uint8Array(value.data)], { type: 'audio/mpeg' })
  }
  return value
}

export const get_cards_by_book_id = async (book_id: number) => {
  const resp = await fetch(`${PREFIX}/get_book/${book_id}`, {
    method: 'GET'
  })
  const text = await resp.text()
  const data = JSON.parse(text, bufferFilter)
  return data
}

export const add_card = async (Q: string, A: string, book: BookInterface) => {
  const resp = await fetch(`${PREFIX}/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Q: Q,
      A: A,
      book_id: book.id
    })
  })
  // 不止cards_count++，每个reviews_type 的 count都要++
  await updateBookInfo({ id: book.id, info: book.info })
  const data = await resp.json()
  return data
}

export const add_cards_list = async (
  book: BookInterface,
  cards_list: { q: string; a: string }[]
) => {
  const resp = await fetch(`${PREFIX}/add/multiple/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cards_list,
      book_id: book.id
    })
  })

  await updateBookInfo({ id: book.id, info: book.info })
  return await resp.json()
}

export const update_card = async (card_id: number, updats: Partial<CardDataType>) => {
  const resp = await fetch(`${PREFIX}/update/${card_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updats)
  })
  return await resp.json()
}

export const uploadCardAudio = async (card_id: number, blob: Blob) => {
  const res = await fetch(`${PREFIX}/upload-audio/${card_id}`, {
    method: 'POST',
    body: blob
  })
  const data = await res.json()
  return data
}

export const delete_card = async (card_id: number, book: BookInterface) => {
  const resp = await fetch(`${PREFIX}/delete/${card_id}`, {
    method: 'DELETE'
  })
  await updateBookInfo({ id: book.id, info: book.info })
  return await resp.json()
}

// 复习

// 获取复习记录
export const get_card_review = async (
  card_id: number,
  start_date: string,
  end_date: string,
  review_type?: number
) => {
  const params = new URLSearchParams()
  if (review_type !== undefined) {
    params.append('review_type', review_type.toString())
  }
  const queryString = '?' + params.toString()

  const resp = await fetch(`${PREFIX}/review_get/${card_id}${queryString}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start_date,
      end_date
    })
  })
  return (await resp.json()) as {
    success: boolean
    message: string
    data: {
      id: number
      remember: number
      vague: number
      forget: number
      type: number
      card_id: number
      review_at: string
    }[]
  }
}

// 更新复习记录
export const update_card_review = async (
  card_id: number,
  memory_type: 'remember' | 'vague' | 'forget',
  review_type: number
) => {
  const resp = await fetch(`${PREFIX}/review_update/${card_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memory_type,
      review_type
    })
  })
  return await resp.json()
}

// 完成复习

export const finish_review = async (
  card_id: number,
  review_type: number,
  next_review_date: string,
  level: number,
  control: number
) => {
  const resp = await fetch(`${PREFIX}/finish_review/${card_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      review_type,
      next_review_date,
      level,
      control
    })
  })
  return await resp.json()
}

// 获取复习安排

export const get_review_arrangement = async (card_id: number, review_type?: number) => {
  const params = new URLSearchParams()

  if (review_type !== undefined) {
    params.append('review_type', review_type.toString())
  }
  const queryString = '?' + params.toString()
  const resp = await fetch(`${PREFIX}/review_arrangement/${card_id}${queryString}`, {
    method: 'GET'
  })
  return (await resp.json()) as {
    success: boolean
    message: string
    data: UserReviewArrangement[]
  }
}

// 取数组的首个元素
export function ArrTopFilter<T>(arr: T[], defaultValue: T): T {
  if (arr.length < 1) {
    return defaultValue
  } else if (arr.length === 1) {
    return arr[0]
  } else {
    console.warn(arr)
    return arr[0]
  }
}

// 获取所有cards的数据
// setting 是拿来判断是否要真的从后端那数据的（也不知道未来会怎么样
export const fetchCardsExtendInfo = async (
  cards: CardDataType[],
  review_type_id: number,
  setting: BookSettingInterface
) => {
  const cards_extend: CardDataExtendType[] = []
  for (const c of cards) {
    // 获取用户review 记录
    const item: CardDataExtendType = {
      id: c.id,
      Q: c.Q,
      A: c.A,
      review_at: daysAfterToday(-1),
      book_id: c.book_id,
      remember: 0,
      vague: 0,
      forget: 0,
      review_type: review_type_id,
      review_count: 1, // 今天还需复习几次，前端的辅助数据。每次构建需要根据forget/vague写入这个count。
      review_progress_count: 0,
      review_arrangement: getTodayDate(),
      created_at: c.created_at,
      updated_at: c.updated_at,
      level: 1,
      audio: c.audio
    }
    // 如果是随便看看，那就不必要请求持久数据
    if (setting.arrange_review) {
      // 拿卡片的记忆状态
      {
        const resp = await get_card_review(
          parseInt(c.id),
          getTodayDate(),
          getTodayDate(),
          review_type_id
        )
        if (resp.success) {
          const card_review_user_record = ArrTopFilter<{
            remember: number
            forget: number
            vague: number
          }>(resp.data, { remember: 0, forget: 0, vague: 0 })
          item.remember = card_review_user_record.remember
          item.vague = card_review_user_record.vague
          item.forget = card_review_user_record.forget
          // 同时更新 review_count。 如果复习一半退出再进来，要求 review count 也要对上
          if (item.forget) item.review_count = setting.forget_review_count
          else if (item.vague) item.review_count = setting.vague_review_count
        } else {
          console.error('get review data error', resp)
        }
      }
      // 获取复习安排，单词等级
      {
        const resp = await get_review_arrangement(parseInt(c.id), review_type_id)
        if (resp.success) {
          const card_review_arrangement = ArrTopFilter<{
            level: number
            review_date: string
            review_at: string
          }>(resp.data, { level: 1, review_date: getTodayDate(), review_at: daysAfterToday(-1) })
          item.level = card_review_arrangement.level
          item.review_arrangement = card_review_arrangement.review_date
          item.review_at = card_review_arrangement.review_at
        } else {
          console.error('get review arrangement error', resp)
        }
      }
    }
    cards_extend.push(item)
  }
  return cards_extend
}

export const rebuild_book_info = async (book: BookInterface) => {
  const rebuild_book: BookInterface = JSON.parse(JSON.stringify(book))

  rebuild_book.setting.arrange_review = true // 必须假装要记录，才能向后端要数据
  rebuild_book.info.reviews_count = [] // 重建，清空原来的数据
  // 遍历每一个 review_mode，只有那些打开了的 review_mode 才进行统计。
  for (const item of rebuild_book.setting.review_mode) {
    if (item.open) {
      const cards = (await get_cards_by_book_id(rebuild_book.id)).data
      const cardsExtendList = await fetchCardsExtendInfo(cards, item.mode_id, rebuild_book.setting)
      rebuild_book.info.cards_count = cardsExtendList.length
      const review_count_item = { review_type_id: item.mode_id, count: 0 }
      // 记录这个模式下的需要复习的单词
      for (const card of cardsExtendList) {
        // 复习安排的时间小于等于今天 并且 最近复习日期不是今天
        if (card.review_arrangement <= getTodayDate() && card.review_at !== getTodayDate()) {
          review_count_item.count++
        }
      }
      rebuild_book.info.reviews_count.push(review_count_item)
    }
  }
  // 恢复
  rebuild_book.setting.arrange_review = book.setting.arrange_review
  return rebuild_book
}

// 前端更新之后再来请求
export const add_new_card_book_info_update = (info: BookInfoInterface, count: number) => {
  info.cards_count += count
  for (const r of info.reviews_count) {
    r.count += count
  }
}

// 复习完毕更新
export const reduce_review_type_count = (info: BookInfoInterface, review_type_id: number) => {
  for (const rv of info.reviews_count) {
    if (rv.review_type_id === review_type_id) {
      rv.count = Math.max(0, rv.count - 1)
    }
  }
}
