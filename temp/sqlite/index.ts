// db.ts
import Database from 'better-sqlite3'

// 初始化数据库（如果文件不存在会自动创建）
const db = new Database('my-database.db')

export { db }
