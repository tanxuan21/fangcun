import { UserReviewArrangement } from '../types'

const PREFIX = `${'http://localhost:3001'}/api/recite/cards`

export const get_card_by_card_id = async (card_id: number) => {
  const resp = await fetch(`${PREFIX}/get_card/${card_id}`, { method: 'GET' })
  const data = await resp.json()
  return data
}

export const get_cards_by_book_id = async (book_id: number) => {
  const resp = await fetch(`${PREFIX}/get_book/${book_id}`, {
    method: 'GET'
  })
  const data = await resp.json()
  return data
}

export const add_card = async (Q: string, A: string, book_id: number) => {
  const resp = await fetch(`${PREFIX}/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Q: Q,
      A: A,
      book_id: book_id
    })
  })
  const data = await resp.json()
  return data
}

export const add_cards_list = async (book_id: number, cards_list: { q: string; a: string }[]) => {
  const resp = await fetch(`${PREFIX}/add/multiple/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cards_list,
      book_id
    })
  })
  return await resp.json()
}

export const update_card = async (
  card_id: number,
  updats: Partial<{
    id: number
    Q: string
    A: string
    book_id: number
    updated_at: string
    review_at: string
  }>
) => {
  const resp = await fetch(`${PREFIX}/update/${card_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updats)
  })
  return await resp.json()
}

export const delete_card = async (card_id: number) => {
  const resp = await fetch(`${PREFIX}/delete/${card_id}`, {
    method: 'DELETE'
  })
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
