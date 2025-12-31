import Database from 'better-sqlite3'
import {
  EventClass,
  EventInstant,
  EventInstantQuery,
  EventInstantQueryAccurate,
  EventInstantQueryFuzzy
} from '../../types/daily'
const BOOL_FIELDS = new Set(['view_in_timeline'])

const processingBoolean = (keys, updates) => {
  const processedUpdates: Record<string, any> = {}
  for (const key of keys) {
    const val = updates[key as keyof Partial<EventInstant>]
    processedUpdates[key] = BOOL_FIELDS.has(key) ? (val ? 1 : 0) : val
  }
  return processedUpdates
}
class DailyDatabase {
  private readonly db: Database.Database

  private readonly event_class = 'event_class'
  private readonly event_class_set = 'event_class_set'
  private readonly event_instant = 'event_instant'
  private readonly feild = 'feild'
  private readonly record = 'record'
  constructor(db: Database.Database) {
    this.db = db
    this.createTable()
  }

  createTable() {
    this.db.exec(`
        PRAGMA foreign_keys = ON;
        -- 事件类表
        CREATE TABLE IF NOT EXISTS ${this.event_class} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL UNIQUE, -- event name 算是用户可以可视的标识一个类。它必须唯一。而且后续的类，对event name的修改，全部都会影响到
            -- 派生的/实例化的
            type TEXT CHECK (type IN ('goal','record','remaind')), -- 类型。目标型；记录型；提示型；
            instant_count INTEGER DEFAULT 0, -- 实例化类数目
            state INTEGER DEFAULT 2, -- 目前置四个状态，1:废弃，太简单；2:合适；3:挑战；4:展望
            reminder_minutes_before INTEGER DEFAULT 10, -- 提前几分钟提醒？
            repeat_function TEXT -- 重复函数。
        );
        -- 事件类集合表
        CREATE TABLE IF NOT EXISTS ${this.event_class_set} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            set_name TEXT NOT NULL,
            event_class_count INTEGER DEFAULT 0,
            remark TEXT,
            parent_set_id INTEGER NOT NULL,
            FOREIGN KEY (parent_set_id) REFERENCES ${this.event_class_set}(id)
        );

        -- 集合<->事件类关系表
        CREATE TABLE IF NOT EXISTS ${this.event_class}2${this.event_class_set} (
            ${this.event_class}_id INTEGER NOT NULL,
            ${this.event_class_set}_id INTEGER NOT NULL,
            level INTEGER NOT NULL, -- 记录 event-class 在这个集合内的数据。使用关系表确实会清晰很多
            PRIMARY KEY (${this.event_class}_id,${this.event_class_set}_id),
            FOREIGN KEY (${this.event_class}_id) REFERENCES ${this.event_class}(id),
            FOREIGN KEY (${this.event_class_set}_id) REFERENCES ${this.event_class_set}(id)
        );

        -- 事件实例表，必须从事件类实例化，可以是空类
        CREATE TABLE IF NOT EXISTS ${this.event_instant} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ${this.event_class}_id INTEGER,
            event_name TEXT NOT NULL, -- 继承自class。除非是空父类
            location TEXT,
            remark TEXT,
            start_time TEXT,
            end_time TEXT,
            urgent_level INTEGER DEFAULT 0,
            important_level INTEGER DEFAULT 0,
            content TEXT,
            type TEXT CHECK (type IN ('goal','record','remaind')),
            view_in_timeline INTEGER DEFAULT 1, -- 是否显示在timeline视图

            FOREIGN KEY (${this.event_class}_id) REFERENCES ${this.event_class}(id)
        );

        -- 字段 feild 表
        CREATE TABLE IF NOT EXISTS ${this.feild} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT CHECK (type IN('string','number','boolean','state','tag')),
            container TEXT CHECK (container IN ('single','array','map')),
            default_value TEXT, -- 创建实例之后的初始值
            value TEXT, -- 语义上，这个value是feild的value。比如，state的种类，tag种类，是一个string[]，后续可能添加 map 类型，那就是map的value的类型
            class_id INTEGER, -- 标记一个事件类，从属于一个事件类
            collaspe BOOLEAN, -- 是否折叠
            FOREIGN KEY (class_id) REFERENCES ${this.event_class}(id)
        );

        -- 字段 实例化，字段的记录
        CREATE TABLE IF NOT EXISTS ${this.record} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feild_id INTEGER NOT NULL, -- 是从哪个feild出来的
            instant_id INTEGER, -- 属于哪个实例
            value TEXT, -- json 格式的数据
            FOREIGN KEY (feild_id) REFERENCES ${this.feild}(id),
            FOREIGN KEY (instant_id) REFERENCES ${this.event_instant}(id)
        );
        
        `)
  }

  // 获取所有事件类
  get_all_event_class() {
    return this.db
      .prepare(
        `
        SELECT * FROM ${this.event_class}`
      )
      .all()
  }
  // 根据id获取事件类
  get_event_class(event_class_id: number) {
    return this.db.prepare(`SELECT * FROM ${this.event_class} WHERE id=?`).get(event_class_id)
  }
  // 添加事件类
  add_event_class(data: EventClass) {
    let id = -1
    this.db.transaction(() => {
      const keys = Object.keys(data).filter((k) => k !== 'id')

      const processedData = processingBoolean(keys, data)
      id = this.db
        .prepare(
          `
        INSERT INTO ${this.event_class} (${keys.join(',')}) VALUES (${keys // 过滤掉id，id不能手工设置
          .map((k) => `@${k}`)
          .join(',')})
        `
        )
        .run(processedData).lastInsertRowid as number // 拿到返回的id，再返回
    })() // 调用！
    return id
  }

  // 查找事件类的实例化事件实例
  get_instant_event_class(event_class_id: number) {
    return this.db
      .prepare(
        `
        SELECT * FROM ${this.event_instant} WHERE ${this.event_class}_id = ? 
        `
      )
      .all(event_class_id)
  }

  // 删除事件类
  delete_event_class(event_class_id: number) {
    this.db.transaction(() => {
      // 找到所有的集合id
      const set_ids = this.db
        .prepare(
          `
            SELECT ${this.event_class_set}_id FROM ${this.event_class}2${this.event_class_set} WHERE ${this.event_class}_id = ?`
        )
        .all(event_class_id)
      // 删除关系表
      this.db
        .prepare(
          `DELETE FROM ${this.event_class}2${this.event_class_set} WHERE ${this.event_class}_id = ?`
        )
        .run(event_class_id)
      // 删除event class
      const d = this.db
        .prepare(
          `
        DELETE FROM ${this.event_class} WHERE id = ?
        `
        )
        .run(event_class_id)
      // 更新set表，count减一
      const decrement = this.db.prepare(`
        UPDATE ${this.event_class_set} SET event_class_count = event_class_count - 1 WHERE id = ?
        `)
      for (const item of set_ids) {
        decrement.run(item[`${this.event_class_set}_id`])
      }
      // 实例化的类的父类引用也置空
      this.db
        .prepare(
          `
            UPDATE ${this.event_instant} SET ${this.event_class}_id = NULL WHERE ${this.event_class}_id IN (
            SELECT ${this.event_class}_id FROM ${this.event_instant} WHERE ${this.event_class}_id = ?
            )
            `
        )
        .run(event_class_id)
    })()
  }
  // 更新事件类
  update_event_class(event_class_id: number, updates: Partial<EventClass>) {
    const allowFeild = new Set(['event_name', 'type', 'state']) // 更新白名单
    this.db.transaction(() => {
      this.db
        .prepare(
          `
        UPDATE ${this.event_class} SET ${Object.keys(updates)
          .filter((k) => allowFeild.has(k))
          .map((k) => `${k} = @${k}`)
          .join(', ')} WHERE id = @id
        `
        )
        .run({ ...updates, id: event_class_id })
      if (updates['event_name']) {
        // 更新所有实例的event name。
        this.db
          .prepare(
            `
            UPDATE ${this.event_instant} SET event_name = ? WHERE ${this.event_class}_id = ?
          `
          )
          .run(updates.event_name, event_class_id)
      }
    })()
  }
  // parent_eve
  // ===========================================================

  // 获取事件实例
  get_event_instant(conditions: EventInstantQuery) {
    // 根据查询参数，构造sqlite查询条件语句
    const condition2sqlite: Record<keyof EventInstantQuery, any> = {
      id: 'id = @id',
      event_class_id: `${this.event_class}_id = @event_class_id`,
      start_time_gte: `start_time >= @start_time_gte`,
      start_time_lte: `start_time <= @start_time_lte`,
      end_time_gte: `end_time >= @end_time_gte`,
      end_time_lte: `end_time <= @end_time_lte`,
      urgent_level: `urgent_level = @urgent_level`,
      important_level: `important_level = @important_level`,
      journal_id: `journal_id = @journal_id`,
      type: `type=@type`,
      event_name: `event_name LIKE @event_name`,
      location: `location LIKE @location`,
      remark: `remark LIKE @remark`
    }
    const where: string[] = [
      '1=1',
      ...Object.keys(conditions)
        .filter((c) => condition2sqlite[c]) // 必须过滤，否则后面的join会出问题
        .map((c) => condition2sqlite[c])
    ]
    return this.db
      .prepare(
        `
        SELECT * FROM ${this.event_instant} WHERE ${where.join(' AND ')}`
      )
      .all(conditions) as EventInstant[]
  }

  // 添加事件实例
  add_event_instant(data: EventInstant) {
    let id = -1
    this.db.transaction(() => {
      const keys = Object.keys(data).filter((k) => k !== 'id')

      const processedData = processingBoolean(keys, data)
      const result = this.db
        .prepare(
          `
        INSERT INTO ${this.event_instant} (${keys.join(',')}) VALUES (${keys
          .map((k) => `@${k}`)
          .join(',')})
        `
        )
        .run(processedData)
      if (result.lastInsertRowid) id = result.lastInsertRowid as number

      // 实例计数器 + 1
      if (data.event_class_id) {
        this.db
          .prepare(
            `
                UPDATE ${this.event_class} SET instant_count = instant_count + 1 WHERE id = ?
                `
          )
          .run(data.event_class_id)
      }
    })()

    return { id }
  }

  // 更新事件实例
  update_event_instant(event_instant_id: number, updates: Partial<EventInstant>) {
    const allowFileds = new Set([
      'event_name',
      'location',
      'remark',
      'start_time',
      'end_time',
      'urgent_level',
      'important_level',
      'content',
      'journal_id',
      'type',
      'event_class_id',
      'view_in_timeline', // 这个字段是boolean
      'reminder_minutes_before'
    ])

    this.db.transaction(() => {
      const keys = Object.keys(updates).filter((k) => allowFileds.has(k))

      if (keys.length <= 0) {
        console.error('keys no allow!', updates)
      } else {
        // 原来的实例计数器-1
        if (keys.includes('event_class_id')) {
          const old_class_id = this.db
            .prepare(
              `
                SELECT event_class_id FROM ${this.event_instant} WHERE id = ?
                `
            )
            .get(event_instant_id)['event_class_id']
          console.log(old_class_id, updates.event_class_id) // 打印出来的两个总是一样的，导致计数每次+1 -1 抵消。

          if (old_class_id !== null) {
            this.db
              .prepare(
                `
                UPDATE ${this.event_class} SET instant_count = instant_count -1 WHERE id = ?
                `
              )
              .run(old_class_id)
          }
        }
        // 更新事件实例记录

        // 处理数据，boolean 类型
        const processedUpdates = processingBoolean(keys, updates)
        this.db
          .prepare(
            `
        UPDATE ${this.event_instant} SET ${keys.map((k) => `${k} = @${k}`)} WHERE id = @id
        `
          )
          .run({ ...processedUpdates, id: event_instant_id })
        // 事件类实例计数器+1
        this.db
          .prepare(`UPDATE ${this.event_class} SET instant_count = instant_count + 1 WHERE id = ?`)
          .run(updates['event_class_id'])
      }
    })()
  }

  // 删除事件实例
  delete_event_instant(event_instant_id: number) {
    this.db.transaction(() => {
      // 必须先更新 event_class 派生 计数器
      this.db
        .prepare(
          `
        UPDATE ${this.event_class} SET instant_count = instant_count - 1
        WHERE id = (
            SELECT ${this.event_class}_id FROM ${this.event_instant} WHERE id = ?
        )
        `
        )
        .run(event_instant_id)
      // 删除事件实例
      this.db
        .prepare(
          `
        DELETE FROM ${this.event_instant} WHERE id = ?
        `
        )
        .run(event_instant_id)
    })()
  }
}

export { DailyDatabase }
