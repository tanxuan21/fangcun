import { getTodayDate } from '@renderer/utils'

export interface BookInterface {
  created_at: number
  description: string
  id: number
  name: string
  setting: BookSettingInterface
  updated_at: number
}
export interface BookSettingInterface {
  audio_model: string // 允许不填，不填代表不使用发音
  review_mode: {
    mode_name: BookReciteModeName
    mode_id: number // 用于存数据库的type字段
    open: boolean
  }[]
  memory_level: {
    level: number // level:-1 标识 level infinity
    review_delay: number
  }[]
  vague_review_count: number
  forget_review_count: number

  arrange_review: boolean // 随便翻翻还是记录用户行为
}

export type BookReciteModeName = 'read' | 'write' | 'listen' | 'record'
export const DefaultBookSetting: BookSettingInterface = {
  audio_model: '',
  review_mode: [
    {
      mode_name: 'read',
      mode_id: 1,
      open: true
    },
    {
      mode_name: 'write',
      mode_id: 2,
      open: true
    },
    {
      mode_name: 'listen',
      mode_id: 3,
      open: true
    }
  ],
  memory_level: [
    { level: 1, review_delay: 1 },
    { level: 2, review_delay: 2 },
    { level: 3, review_delay: 3 },
    { level: 4, review_delay: 4 },
    { level: 5, review_delay: 5 },
    { level: 6, review_delay: 6 },
    { level: 7, review_delay: 7 },
    { level: 8, review_delay: 8 },
    { level: 9, review_delay: 9 },
    { level: 10, review_delay: 10 },
    { level: -1, review_delay: 100 }
  ],
  vague_review_count: 2,
  forget_review_count: 3,

  arrange_review: false // 随便翻翻还是记录用户行为
}

export interface UserReviewRecord {
  id: number
  remember: number
  vague: number
  forget: number
  card_id: number
  review_at: string
  type: number
}

export const DefaultUserReviewRecord: UserReviewRecord = {
  id: 0,
  remember: 0,
  vague: 0,
  forget: 0,
  card_id: 0,
  review_at: getTodayDate(),
  type: 1
}

export interface UserReviewArrangement {
  id: number
  card_id: number
  type: number
  level: number
  review_date: string
}
