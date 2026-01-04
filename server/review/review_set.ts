import Database from 'better-sqlite3'
import { IReviewSet } from '../../types/review/review'

class ReviewSetDatabase {
  private readonly db: Database.Database
  constructor(db: Database.Database) {
    this.db = db
    this.create_table()
  }
  create_table() {
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS review_set (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                updated_at TEXT DEFAULT (datetime('now', 'localtime')),
                setting TEXT NOT NULL DEFAULT "{}" -- 设置字段，非常重要。控制后续的很多细节
            );
        -- review_items 表 和 review_set 表 关联表
        CREATE TABLE IF NOT EXISTS review_items2review_set (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_set_id INTEGER NOT NULL,
            review_item_id INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            UNIQUE (review_set_id, review_item_id), -- review_set_id 和 review_item_id 组合唯一
            FOREIGN KEY (review_set_id) REFERENCES review_set(id) ON DELETE CASCADE,
            FOREIGN KEY (review_item_id) REFERENCES review_items(id) ON DELETE CASCADE
        )
    `
    )
  }
  add_review_set(name: string, description: string, setting: string) {
    const stmt = this.db.prepare(
      `INSERT INTO review_set (name, description,setting) VALUES (?, ?,?) RETURNING *`
    )
    return stmt.get(name, description, setting)
  }
  get_all_review_sets() {
    const stmt = this.db.prepare(`SELECT * FROM review_set`)
    return stmt.all()
  }
  delete_review_set(id: number) {
    const stmt = this.db.prepare(`DELETE FROM review_set WHERE id = ?`)
    return stmt.run(id)
  }
  update_review_set(updates: IReviewSet) {
    // 根据 updates 的字段生成 更新语句
    const setClause = Object.keys(updates)
      .filter((key) => key !== 'id') // 必须过滤掉id字段，id字段作为主键不能改。
      .map((key) => `${key} = @${key}`)
      .join(',')
    const stmt = this.db.prepare(`UPDATE review_set SET ${setClause} WHERE id = @id`)
    return stmt.run(updates)
  }

  // 给 review_set 添加 review_item
  add_review_item_to_review_set(review_set_id: number, review_item_id: number) {
    const stmt = this.db.prepare(
      `INSERT INTO review_items2review_set (review_set_id, review_item_id) VALUES (?, ?)`
    )
    return stmt.run(review_set_id, review_item_id)
  }
  // 获取集的所有review_item
  get_all_review_items_in_review_set(review_set_id: number) {
    const stmt = this.db.prepare(`SELECT * FROM review_items2review_set WHERE review_set_id = ?`)
    const map = stmt.all(review_set_id) // 映射
    // 根据 map 里的 review_item_id 获取 review_item
    return map.map((item) => {
      const get_review_item = this.db.prepare(`SELECT * FROM review_items WHERE id = ?`)
      return get_review_item.get(item['review_item_id'])
    })
  }
  // 只是删除set 和 item的关系，不是删除review_item
  delete_review_item_from_review_set(review_set_id: number, review_item_id: number) {
    const stmt = this.db.prepare(
      `DELETE FROM review_items2review_set WHERE review_set_id = ? AND review_item_id = ?`
    )
    return stmt.run(review_set_id, review_item_id)
  }
}
export { ReviewSetDatabase }
