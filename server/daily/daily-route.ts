import { Router, Request } from 'express'
import { DailyDataBaseInstance } from '../database/database'
import { makeSuccessRep } from '../utils'
import { EventInstantQuery } from '../../types/daily'
const router = Router()

// 获取所有事件类
router.get(`/event-class/get-all/`, (req, res) => {
  makeSuccessRep(res, DailyDataBaseInstance.get_all_event_class())
})

// 根据id获取事件类
router.get(`/event-class/get/:eventClassId`, (req: Request, res) => {
  const event_class_id = req.params['eventClassId']
  if (event_class_id) {
    makeSuccessRep(res, DailyDataBaseInstance.get_event_class(parseInt(event_class_id)))
  }
})

// 添加事件类
router.post(`/event-class/add/`, (req, resp) => {
  const id = DailyDataBaseInstance.add_event_class(req.body)
  makeSuccessRep(resp, {
    id
  })
})

// 更新事件类
router.post(`/event-class/update/:eventClassId`, (req, resp) => {
  const event_class_id = req.params['eventClassId']
  DailyDataBaseInstance.update_event_class(parseInt(event_class_id), req.body)
  makeSuccessRep(resp)
})

// 删除事件类
router.delete(`/event-class/delete/:eventClassId`, (req, res) => {
  const id = req.params['eventClassId']
  DailyDataBaseInstance.delete_event_class(parseInt(id))
  makeSuccessRep(res)
})

// ============================================
// 获取所有事件实例
router.get(`/event-instant/get/`, (req: Request, res) => {
  const query = req.query
  const conditions = query as unknown as EventInstantQuery
  console.log(query)
  const result = DailyDataBaseInstance.get_event_instant(conditions)
  makeSuccessRep(res, result)
})

// 添加事件实例
router.post(`/event-instant/add/`, (req, res) => {
  const result = DailyDataBaseInstance.add_event_instant(req.body)
  makeSuccessRep(res, result)
})

// 更新事件实例
router.post(`/event-instant/update/:eventInstantId`, (req, res) => {
  const eventInstantId = req.params.eventInstantId
  DailyDataBaseInstance.update_event_instant(parseInt(eventInstantId), req.body)
  makeSuccessRep(res)
})
// 删除事件实例
router.delete(`/event-instant/delete/:eventInstantId`, (req, res) => {
  const eventInstantId = req.params.eventInstantId
  DailyDataBaseInstance.delete_event_instant(parseInt(eventInstantId))
  makeSuccessRep(res)
})

// ========================================================
// 字段
export default router
