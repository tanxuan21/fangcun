import Database from 'better-sqlite3'

interface ReviewItem {
  id: number
  type: number
  content: string
  created_at: string
}
interface Review {
  id: number
  rate: number
  remark: string
  item_id: number
  created_at: string
}

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
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES review_items(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS review_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type INTEGER NOT NULL,
            content TEXT NOT NULL, -- 用 json 灵活定义各种题型吧 ... ....
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
    const result = stmt_check.get(type, content) as ReviewItem
    if (result) {
      return { success: false, id: result.id }
    }
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
}

export { ReviewDatabase }
