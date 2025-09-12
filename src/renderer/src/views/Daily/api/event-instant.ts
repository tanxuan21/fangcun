import axios from 'axios'
import { EventInstant } from 'type/daily'

const http = axios.create({
  baseURL: 'http://localhost:3001/api/daily',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const EventInstantAPI = {
  get(query_str: string) {
    return http
      .get<{ data: EventInstant[] }>(`/event-instant/get/${query_str}`)
      .then((res) => res.data)
  },
  add(data: Omit<EventInstant, 'id'>): Promise<{ data: { id: number } }> {
    return http.post('/event-instant/add/', data).then((res) => res.data)
  },
  update(id: number, data: Partial<EventInstant>) {
    return http.post(`/event-instant/update/${id}`, data).then((res) => res.data)
  },
  delete(id: number) {
    return http.delete(`/event-instant/delete/${id}`).then((res) => res.data)
  }
}
