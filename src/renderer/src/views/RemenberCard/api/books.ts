import { BookInterface } from '../types'

const PREFIX = async () => {
  const url = await window.api.getItem('API_URL')
  return `${url}/api/recite/books`
}
export const updateBookInfo = async (bookitem: Partial<BookInterface> & { id: number }) => {
  const resp = await fetch(`${await PREFIX()}/update/${bookitem.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookitem)
  })
  return await resp.json()
}

export const addBook = async () => {
  const resp = await fetch(`${await PREFIX()}/add/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  const data = await resp.json()
  return data
}

export const deleteBook = async (book_id: number) => {
  const resp = await fetch(`${await PREFIX()}/delete/${book_id}`, {
    method: 'DELETE'
  })
  const data = await resp.json()

  return data
}

export const get_book_by_book_id = async (book_id: number) => {
  const resp = await fetch(`${await PREFIX()}/get/${book_id}`, {
    method: 'GET'
  })
  const data = await resp.json()
  data.data.setting = JSON.parse(data.data.setting)
  data.data.info = JSON.parse(data.data.info)
  return data
}

export const get_all_books = async () => {
  const resp = await fetch(`${await PREFIX()}/get/`, {
    method: 'GET'
  })
  const data = await resp.json()
  for (const d of data.data) {
    d.setting = JSON.parse(d.setting)
    d.info = JSON.parse(d.info)
  }
  return data
}
