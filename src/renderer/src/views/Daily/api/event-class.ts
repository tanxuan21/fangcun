import axios from 'axios'
import { EventClass } from '../../../../../../type/daily'

const http = axios.create({
  baseURL: `${await window.api.getItem('API_URL')}/api/daily`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const EventClassAPI = {
  // 获取全部事件类
  getAll() {
    return http.get<{ data: EventClass[] }>('/event-class/get-all/').then((res) => res.data)
  },

  // 根据 ID 获取事件类
  getById(id: number): Promise<{ data: EventClass }> {
    return http.get(`/event-class/get/${id}`).then((res) => res.data)
  },

  // 添加事件类
  add(data: Omit<EventClass, 'id'>): Promise<{ id: number }> {
    return http.post('/event-class/add/', data).then((res) => res.data)
  },

  // 更新事件类
  update(id: number, updates: Partial<EventClass>): Promise<void> {
    return http.post(`/event-class/update/${id}`, updates).then((res) => res.data)
  },

  // 删除事件类
  delete(id: number): Promise<void> {
    return http.delete(`/event-class/delete/${id}`).then((res) => res.data)
  }
}
