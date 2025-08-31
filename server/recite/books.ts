import Database from 'better-sqlite3'
interface BookSettingInterface {
  audio_model: string // 允许不填，不填代表不使用发音
  review_mode: {
    mode_name: string
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
const DefaultBookSetting: BookSettingInterface = {
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
// 背诵数据库
class ReciteBooksDatabase {
  private readonly db: Database.Database
  constructor(db: Database.Database) {
    this.db = db // 使用统一的db来使用
    this.create_table()
  }

  private create_table() {
    this.db.exec(
      `
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            setting TEXT NOT NULL DEFAULT "{}",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `
    )
  }
  // 添加新书
  add_book(name?: string, description?: string, setting?: BookSettingInterface) {
    const insert = this.db.prepare(`
        INSERT INTO books (name,description,created_at,updated_at,setting) VALUES (?,?,?,?,?)`)
    const info = insert.run(
      name || 'new book',
      description || 'description of book',
      Date.now(),
      Date.now(),
      setting || DefaultBookSetting
    )
    return info.lastInsertRowid // 要返回那个index才对
  }
  // 更新本子信息，想更新啥更新啥。
  update_book_info(book_id: number, updates) {
    const update_allow_feilds = ['name', 'description', 'setting', 'info']
    // 将updates的每一个元素搞成string
    for (const key in updates) {
      if (key === 'setting' || key === 'info') updates[key] = JSON.stringify(updates[key])
    }
    // console.log(book_id, updates)

    const set_str = Object.keys(updates)
      .filter((k) => update_allow_feilds.includes(k))
      .map((k) => `${k} = @${k}`)
      .join(',')
    if (!set_str) {
      console.warn('无效更新请求', book_id, updates)
      return
    }
    this.db
      .prepare(
        `
        UPDATE books SET ${set_str}
        WHERE id = @id;
        `
      )
      .run({ ...updates, id: book_id })
  }
  // 删除本子
  delete_book(id: number) {
    const del = this.db.prepare('DELETE FROM books WHERE id = ?')
    del.run(id)
  }
  // 获取所有书籍
  get_all_books() {
    const get = this.db.prepare('SELECT * FROM books')
    return get.all()
  }

  // 通过id获取单本书
  get_book(book_id: number) {
    return this.db
      .prepare(
        `
        SELECT * FROM books WHERE id = ?;
        `
      )
      .get(book_id)
  }
  // 检查书id是否存在
  private is_bookid_exsist(book_id: number) {
    const checkbook = this.db
      .prepare(`SELECT EXISTS(SELECT 1 FROM books WHERE id = ?) AS exists`)
      .get(book_id) as { exists: number }
    return checkbook.exists === 1
  }

  // 一对卡片并不是 一个资产 --> 一个资产
  // 而是 多个资产 --> 多个资产

  close() {
    this.db.close()
  }
}

export { ReciteBooksDatabase }
