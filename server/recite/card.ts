import Database from 'better-sqlite3'
import { daysAfterToday, getTodayDate } from '../utils'

type MemoryType = 'remember' | 'forget' | 'vague'
interface CardRecord {
  id?: number
  Q: string
  A: string
  book_id: number
  created_at: string
  updated_at: string
}

interface UserReviewRecord {
  id: number
  remember: number
  vague: number
  forget: number
  card_id: number
  review_at: string
  type: number
}

interface UserReviewArrangement {
  id: number
  card_id: number
  type: number
  level: number
  review_date: string
  review_at: string
}

class ReciteCardsDatabase {
  private readonly db: Database.Database
  //   private readonly db_name = 'cards_temp'
  private readonly card_table_name = 'cards'
  private readonly card_user_review_record_table_name = 'cards_user_review_record'
  private readonly card_review_arrangment_table_name = 'cards_review_arrangement'
  constructor(db: Database.Database) {
    this.db = db
    this.create_table()
  }

  // 创建表
  create_table() {
    this.db.exec(
      ` -- 卡片表
        CREATE TABLE IF NOT EXISTS ${this.card_table_name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Q TEXT NOT NULL,
            A TEXT NOT NULL,
            book_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );

        -- 用户复习行为记录表
        CREATE TABLE IF NOT EXISTS ${this.card_user_review_record_table_name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            remember INTEGER DEFAULT 0,
            vague INTEGER DEFAULT 0,
            forget INTEGER DEFAULT 0,
            type INTEGER NOT NULL, -- 复习啥？听说读写四个类别。未来可能拓展新的类别
            card_id INTEGER NOT NULL, -- 复习情况关联某个卡片
            review_at TEXT NOT NULL, -- 这个字段记录复习的时间。以天为单位，某天的复习情况，日期格式 %Y-%m-%d
            UNIQUE(review_at, card_id,type), -- 联合唯一约束
            FOREIGN KEY (card_id) REFERENCES ${this.card_table_name}(id) ON DELETE CASCADE
            );
        
        -- 用户一旦添加卡片，相应的就要创建这个复习安排标识。
        -- 听，说，读，写 四个维度，对应于 1，2，3，4 四个标识
        CREATE TABLE IF NOT EXISTS ${this.card_review_arrangment_table_name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_id INTEGER NOT NULL, -- 复习的卡片id
            type INTEGER NOT NULL, -- 复习啥？听说读写四个类别。未来可能拓展新的类别
            level INTEGER NOT NULL, -- 等级。根据等级和用户的记忆情况计算后面的复习间隔
            review_date TEXT NOT NULL, -- 下次复习的时间。每次进入软件获取比这个时间前的词，就是要复习的
            review_at TEXT NOT NULL,-- 复习的时间。标记这个 card 的 这个 type 完成今天复习了
            UNIQUE(card_id,type), -- 联合唯一约束
            FOREIGN KEY(card_id) REFERENCES ${this.card_table_name}(id) ON DELETE CASCADE
        )
            `
    )
  }

  // 添加卡片记录
  add_card(Q: string, A: string, book_id: number) {
    const datestr = getTodayDate()
    const info = this.db
      .prepare(
        `
        INSERT INTO ${this.card_table_name} (Q,A,book_id,created_at,updated_at) 
        VALUES (?,?,?,?,?)
        `
      )
      .run(Q, A, book_id, datestr, datestr)
    // 添加复习安排
    // 有几种复习方案呢？这个是个变数
    return info.lastInsertRowid as number
  }

  // 批量添加卡片记录，上传csv会用到
  add_cards_list(cards_list: { q: string; a: string }[], book_id: number) {
    // 创建事务
    // 批次insert
    // 返回成功/失败
    const datestr = getTodayDate()
    const stmt = this.db.prepare(`
    INSERT INTO ${this.card_table_name} (Q,A,book_id,created_at,updated_at) VALUES (?,?,?,?,?)
    `)
    try {
      const info = this.db.transaction((cards: { q: string; a: string }[]) => {
        for (const c of cards) {
          stmt.run(c.q, c.a, book_id, datestr, datestr)
        }
        return cards.length
      })(cards_list)
      return {
        success: true,
        data: info
      }
    } catch (e) {
      return {
        success: false,
        data: e
      }
    }
  }

  // 修改卡片记录，传递进来几个字段就改几个字段
  update_card(updates: Partial<CardRecord>) {
    if (Object.keys(updates).length === 0) {
      return false
    }
    const setClause = Object.keys(updates)
      .filter((key) => key !== 'id') // 必须过滤掉id字段，id字段作为主键不能改。
      .map((key) => `${key} = @${key}`)
      .join(',')
    this.db
      .prepare(
        `
        UPDATE ${this.card_table_name} SET ${setClause} WHERE id = @id`
      )
      .run(updates)
  }

  uploadCardAudio(card_id: number, buffer: Buffer) {
    this.db
      .prepare(`UPDATE ${this.card_table_name} SET audio = ? WHERE id = ?;`)
      .run(buffer, card_id)
  }
  // 删除卡片
  delete_card(card_id) {
    this.db
      .prepare(
        `
        DELETE FROM ${this.card_table_name} WHERE id = ?
        `
      )
      .run(card_id)
  }

  // 根据id获取卡片
  fetch_cards_by_card_id(card_id: number) {
    return this.db
      .prepare(
        `
        SELECT * FROM ${this.card_table_name} WHERE id = ?
        `
      )
      .get(card_id)
  }
  // 根据书获取卡片
  fetch_cards_by_book_id(book_id: number) {
    return this.db
      .prepare(
        `
        SELECT * FROM ${this.card_table_name} WHERE book_id = ?
        `
      )
      .all(book_id)
  }

  // 卡片今天完成复习
  // 我觉得这个让前端来更新比较好。前端它不必来来回回的读数据。如果硬要在后端更新review日期，那么会面临要读book表的问题。这不好，这会破坏class的封装
  // 如果前端选择了不更新记忆数据，那就不要调用这个方法
  finished_review(
    card_id: number,
    review_type: number,
    next_review_date: string,
    level: number,
    control: number
  ) {
    // 写入复习安排
    this.db
      .prepare(
        `
        INSERT OR REPLACE INTO ${this.card_review_arrangment_table_name}
        (card_id,type,review_date,level,review_at) VALUES (?,?,?,?,?)`
      )
      .run(card_id, review_type, next_review_date, level, getTodayDate())
    // 更新 book info
  }

  // 获取卡片的复习安排
  get_review_arrangement(card_id: number, review_type: number) {
    return this.db
      .prepare(
        `SELECT * FROM "${this.card_review_arrangment_table_name}"
        WHERE card_id = ? AND type = ?
        `
      )
      .all(card_id, review_type) as UserReviewArrangement[]
  }

  // 添加复习记录，用户行为
  add_review_record(card_id: number, memory_type: MemoryType, review_type_id: number) {
    const datestr = getTodayDate()
    // 查找：今天的，card_id匹配的记录。
    // 保证 (review_at,card_id) 联合唯一
    const record = this.db
      .prepare(
        `
        SELECT id, remember,vague,forget FROM ${this.card_user_review_record_table_name}
        WHERE card_id = ? AND review_at = ? AND type = ?
        `
      )
      .get(card_id, datestr, review_type_id) as UserReviewRecord | undefined

    if (record) {
      // 存在则更新
      this.updateReviewRecord(record.id, memory_type, review_type_id)
    } else {
      // 否则创建
      this.insertReviewRecord(card_id, memory_type, review_type_id)
    }

    // 根据type，将对应字段+1，写回原记录。
  }

  // 获取某个时间范围的复习记录
  get_review_record(card_id: number, start_date: string, end_date: string) {
    return this.db
      .prepare(
        `
        SELECT * FROM "${this.card_user_review_record_table_name}" 
        WHERE card_id = ? AND
            review_at >= ? AND
            review_at <= ?
            ORDER BY review_at ASC, id ASC
        `
      )
      .all(card_id, start_date, end_date) as UserReviewRecord[]
  }

  // 更新复习记录。当天的，选择记得，忘记等等... ...
  // 用户选择了某个记忆形式，要记录下来
  private updateReviewRecord(review_id: number, memory_type: MemoryType, review_type_id: number) {
    this.db
      .prepare(
        `
        UPDATE ${this.card_user_review_record_table_name}
        SET ${memory_type} = ${memory_type} + 1
        WHERE id = ? AND type = ?
        `
      )
      .run(review_id, review_type_id)
  }
  // 插入新的复习记录
  private insertReviewRecord(card_id: number, memory_type: MemoryType, review_type_id: number) {
    const initialValues: Omit<UserReviewRecord, 'id'> = {
      remember: memory_type === 'remember' ? 1 : 0,
      vague: memory_type === 'vague' ? 1 : 0,
      forget: memory_type === 'forget' ? 1 : 0,
      card_id,
      review_at: getTodayDate(),
      type: review_type_id
    }
    this.db
      .prepare(
        `
        INSERT INTO ${this.card_user_review_record_table_name} (remember,vague,forget,card_id,review_at,type)
        VALUES (@remember, @vague, @forget, @card_id, @review_at,@type)
        `
      )
      .run(initialValues)
  }
}
export { ReciteCardsDatabase }
