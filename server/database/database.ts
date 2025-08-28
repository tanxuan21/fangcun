import Database from 'better-sqlite3'
import { ReciteBooksDatabase } from '../recite/books'
import { ReciteCardsDatabase } from '../recite/card'

const db = Database('database.db')
// 因为要先将关联的父表创建出来，再创建子表。
// 所以必须在统一的一个 管理 db 的ts里创建好各个表实例
const ReciteDataBaseInstance = new ReciteBooksDatabase(db)
const ReciteCardsDataBaseInstance = new ReciteCardsDatabase(db)
export { ReciteDataBaseInstance, ReciteCardsDataBaseInstance }
