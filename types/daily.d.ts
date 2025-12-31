export type EventContent =
  | {
      unit: string // 单位
      value: number
    }
  | {
      value: {
        id: number
        content: string // 项目内容
      }[]
    }

export type EventClassType = 'goal' | 'record' | 'remaind'
export interface EventClass {
  id: number
  event_name: string
  instant_count: number // 此事件实例化出去的事件实例数目
  state: number // 目前置四个状态，1:废弃，太简单；2:合适；3:挑战；4:展望
  type: EventClassType // 目标型，未来期望做到的事件。这是一个长期的具体计划，不是时效的。比如，健身到达某个具体的指标，刷题达到某个指标等等。
  // 记录型，只是单纯的保存记录。也就是流水账
  // 提示型，结合移动设备，强实效性，做不到事件就会废弃。比如预约会议等等。
  view_in_timeline: boolean
  reminder_minutes_before: number
}

export interface EventClassSet {
  id: number
  set_name: string
  parent_id: number
  event_class_count: number // 有多少个event class
  remark: string
}

export interface EventInstant {
  id: number
  event_class_id: number | null // 事件类id，可以为null，可以不属于任何事件类，只是临时事件
  event_name: string // 事件名称
  location?: string // 地点
  remark?: string // 备注信息
  start_time: string // 开始时间，时-分-秒
  end_time: string // 结束时间，时-分-秒
  urgent_level: number // 紧急等级
  important_level: number // 提醒等级，这两个字段的灵感来源是，紧急-重要 四象限图。
  content?: EventContent
  type: EventClassType // 类型，
  view_in_timeline: boolean
  reminder_minutes_before: number
}

// 精准查询
export interface EventInstantQueryAccurate {
  event_class_id: number // 精准查询，event_class 的派生
  id: number // 精准查询，id
  start_time_gte: string
  start_time_lte: string
  end_time_gte: string
  end_time_lte: string
  urgent_level: number
  important_level: number
  journal_id: number
  type: number
}

export interface EventInstantQueryFuzzy {
  // 模糊查询字符串
  event_name: string
  location: string
  remark: string
}

export type EventInstantQuery = EventInstantQueryAccurate & EventInstantQueryFuzzy
