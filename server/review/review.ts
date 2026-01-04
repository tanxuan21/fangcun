import Database from 'better-sqlite3'
import type { GetReviewItemsMode, IReview, IReviewItem } from '../../types/review/review.d.ts'

import { GetTodayTimeBegin2End } from '../utils/time'
import { daysAfterToday, getTodayDate } from '../utils'
import { formatDateTime } from '../../src/renderer/src/utils/index'
import { ReviewRate } from '../../common/review/index'

class ReviewDatabase {
  private readonly db: Database.Database
  constructor(db: Database.Database) {
    this.db = db
    this.create_table()
  }
  create_table() {
    this.db.exec(
      `
        CREATE TABLE IF NOT EXISTS review (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rate INTEGER NOT NULL,  -- 用户对该 item 这次复习的掌握程度
            remark TEXT,            -- 用户对这次复习的备注
            item_id INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (item_id) REFERENCES review_items(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS review_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level INTEGER DEFAULT 0, -- 掌握程度评分。根据此安排下次复习
            type INTEGER NOT NULL,
            content TEXT NOT NULL, -- 用 json 灵活定义各种题型吧 ... ....
            last_reviewed_at TEXT DEFAULT (datetime('now', 'localtime')), -- 上次复习时间
            next_review_at TEXT DEFAULT (datetime('now', 'localtime')),   -- 安排的下次复习时间
            arrange_review_at TEXT DEFAULT (datetime('now', 'localtime')), -- 更新复习安排。这个是为了防止重复更新的。一天只允许更新一次。
            updated_at TEXT DEFAULT (datetime('now', 'localtime')),         -- 更新时间
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
        `
    )
  }

  add_review(item_id: number, rate: number, remark?: string) {
    const stmt = this.db.prepare(
      `
        INSERT INTO review (item_id, rate, remark) VALUES (?, ?, ?);
        `
    )
    stmt.run(item_id, rate, remark)
  }
  get_all_reviews(item_id: number) {
    const stmt = this.db.prepare(
      `
        SELECT * FROM review WHERE item_id = ?;
        `
    )
    return stmt.all(item_id)
  }
  delete_review(id: number) {
    const stmt = this.db.prepare(
      `
        DELETE FROM review WHERE id = ?;
        `
    )
    stmt.run(id)
  }
  update_review(id: number, updates: { rate: number; remark: string }) {
    const stmt = this.db.prepare(
      `
        UPDATE review SET rate = ?, remark = ? WHERE id = ?;
        `
    )
    stmt.run(updates.rate, updates.remark, id)
  }
  add_review_item(type: number, content: string) {
    // 先检查数据库是否存在
    const stmt_check = this.db.prepare(
      `
        SELECT * FROM review_items WHERE type = ? AND content = ?;
        `
    )
    const result = stmt_check.get(type, content) as IReviewItem
    if (result) {
      return { success: false, id: result.id }
    }
    // 添加
    const stmt = this.db.prepare(
      `
        INSERT INTO review_items (type, content) VALUES (?, ?);
        `
    )
    const insert = stmt.run(type, content)
    return {
      id: insert.lastInsertRowid,
      success: true
    }
  }
  get_all_review_items() {
    const stmt = this.db.prepare(
      `
        SELECT * FROM review_items;
        `
    )
    return stmt.all()
  }

  get_review_items_with_mode(mode: GetReviewItemsMode, set_id: number) {
    if (mode === 'all') return this.get_all_review_items()
    else if (mode === 'today-review') {
      // 获取今天应该复习的列表
      // next_review_at <= 今天 || last_reviewed_at === 今天 （复习计划早于等于今天 或者 今天已经复习的）
      const { begin, end } = GetTodayTimeBegin2End()
      // 还要查询是否再review_set，如何多表查询？
      const stmt = this.db.prepare(`
            SELECT ri.* 
            FROM review_items ri
            WHERE ri.id IN (
                SELECT review_item_id 
                FROM review_items2review_set 
                WHERE review_set_id = ?
            )
            AND (
                (ri.last_reviewed_at >= ? AND ri.last_reviewed_at <= ?)
                OR ri.next_review_at <= ?
            )
            ORDER BY ri.next_review_at ASC
        `)

      return stmt.all(set_id, begin, end, end)
    }
  }
  delete_review_item(id: number) {
    const stmt = this.db.prepare(
      `
        DELETE FROM review_items WHERE id = ?;
        `
    )
    stmt.run(id)
  }
  update_review_item(id: number, updates: { type: number; content: string }) {
    const stmt = this.db.prepare(
      `
        UPDATE review_items SET type = ?, content = ? WHERE id = ?;
        `
    )
    stmt.run(updates.type, updates.content, id)
  }

  arrange_review_item(id: number) {
    const { begin, end } = GetTodayTimeBegin2End()
    // 取出今天的 review 数据，review_item 数据
    const getreview = this.db.prepare(
      'SELECT * FROM review WHERE item_id = ? AND created_at >= ? AND created_at <= ?;'
    )
    const reviews = getreview.all(id, begin, end) as IReview[]
    console.log('reviews:', reviews)
    const review_item = this.db
      .prepare('SELECT * FROM review_items WHERE id = ?;')
      .get(id) as IReviewItem
    // 如果 review_item 的 arrange_review_at === today，不做处理。
    if (review_item.arrange_review_at === getTodayDate())
      return { message: `id: ${id} today-review-already-arranged` }

    // 简单策略：获取今天最差的那个 rate，然后
    let worst_rate = ReviewRate.Ican
    for (const rv of reviews) {
      if (rv.rate === ReviewRate.UnSelect)
        throw new Error('用户未选择复习等级，请选择复习等级，这个review数据不应该接收。检查代码')
      if (rv.rate < worst_rate) worst_rate = rv.rate
    }
    // 根据这个rate，更新level
    let new_level = review_item.level + worst_rate - 1 // trying 保持 level；Ican't 减一； Ican 加一
    new_level = Math.min(Math.max(new_level, 0), 23)
    // TODO 获取 setting。根据 setting 里的配置表，根据 level 获取下次复习时间
    const level2days = {
      0: 1,
      1: 2,
      2: 3, // diff = 1
      3: 5,
      4: 7,
      5: 9, // diff = 2
      6: 12,
      7: 15,
      8: 18, // diff = 3
      9: 22,
      10: 26,
      11: 30, // diff = 4
      12: 32,
      13: 36,
      14: 42, // diff = 5
      15: 50,
      16: 60,
      17: 70,
      18: 80, // diff = 6
      19: 90,
      20: 100,
      21: 120,
      22: 140, // diff = 7
      23: 160
    }
    const todayTimeStr = formatDateTime()
    const next_review_at = daysAfterToday(level2days[new_level])
    const stmt = this.db.prepare(
      'UPDATE review_items SET arrange_review_at = ?,last_reviewed_at=?,next_review_at=?,updated_at=?,level=?  WHERE id = ?;'
    )
    stmt.run(todayTimeStr, todayTimeStr, next_review_at, todayTimeStr, new_level, id)

    return {
      new_level,
      next_review_at,
      message: `id: ${id} arranged-success`
    }
  }
}

export { ReviewDatabase }
