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

export const get_card_review = async (card_id: number, start_date: string, end_date: string) => {
  const resp = await fetch(`${PREFIX}/review_get/${card_id}`, {
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
      card_id: number
      review_at: string
    }[]
  }
}

export const update_card_review = async (
  card_id: number,
  type: 'remember' | 'vague' | 'forget'
) => {
  const resp = await fetch(`${PREFIX}/review_update/${card_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type
    })
  })
  return await resp.json()
}
