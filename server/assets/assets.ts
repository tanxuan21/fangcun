// 资产类

import Database from 'better-sqlite3'

interface AssetsInterface {
  id: number
  name: string
  key: string
  meta_type: string
  meta_data: string
  file_type: string
  created_at: Date
  updated_at: Date
}

const assets_type = ['string', 'image', 'audio', 'url', 'video', 'null'] as const

type AssetsType = (typeof assets_type)[number]

class AssetsDatabase {
  db_name: string = ''
  private readonly db: Database.Database
  constructor(db: Database.Database) {
    this.db = db
  }

  private create_table() {
    this.db.exec(
      `
        CREATE TABLE assets_types (
        type TEXT PRIMARY KEY -- 直接使用type作为主键
        );

        INSERT INTO assets_types (name) VALUES ${assets_type.map((t) => `("${t}")`).join()};
        -- 未来新增数据，直接在这里insert即可
        `
    )
    // 考虑未来的拓展，如果我要管理大量的
    this.db.exec(`
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, -- 文件名，给人类看的
            key TEXT UNIQUE NOT NULL, -- 键，用于查找文件。

            -- 有的资产是小文件，比如字符串，小的音频啥的，可以直接使用meta_data，meta_type来存储。
            -- 有的资产是大文件，比如pdf，video，那就使用文件。meta_type 写 file_url ，前端用 file_type 来 parse
            meta_type TEXT NOT NULL, -- 与类型表关联，标识文件类型
            meta_data BLOB, -- 二进制数据
            file_type TEXT NOT NULL, 

            -- 创建，修改日期
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            -- 关联约束
            FOREIGN KEY (meta_type) REFERENCES assets_types (type),
            FOREIGN KEY (file_type) REFERENCES assets_types (type)
        );

        -- 资产集合表 与 资产与集合从属关系表，
        -- 每个资产并非有父集；若有也可能并非只有一个父集。所以不能简单的在资产表上进行一个 parent id 外键约束。

        CREATE TABLE IF NOT EXISTS assets_set (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS assets_relation (
            assets_id INTEGER NOT NULL,
            assets_set_id INTEGER NOT NULL,
            FOREIGN KEY (assets_id) REFERENCES assets(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (assets_set_id) REFERENCES assets_set(id) ON DELETE CASCADE ON UPDATE CASCADE,
            PRIMARY (assets_id, assets_set_id)

        );
        -- 索引表，更快速的查找。对开发者透明。
        CREATE INDEX idx_assets_relation_assets_id      ON assets_relation(assets_id);
        CREATE INDEX idx_assets_relation_assets_set_id  ON assets_relation(assets_set_id);

        PRAGMA foreign_keys = ON; -- 必须打开。
        `)
  }
  // 添加资产
  insert_assets(
    name: string,
    key: string,
    meta_type: AssetsType,
    meta_data: Blob,
    file_type: AssetsType
  ) {
    const insert = this.db.prepare(
      `
        INSERT INTO assets (name,key,meta_type,meta_data,file_type) VALUE (?,?,?,?,?)
        `
    )
    insert.run(name, key, meta_type, meta_data, file_type)
  }
  // 更新资产
  update_assets() {}
  // 删除资产
  delete_assets() {}
  // 获取资产
  fetch_assets(id: number) {
    const get = this.db.prepare(`
        SELECT * FROM assets WHERE id = (?)
        `)
    return get.all(id)
  }

  // 创建资产集
  create_assets_set() {}
  // 删除资产集
  delete_assets_set() {}
  // 添加资产进资产集
  add_asset_into_assets_set() {}
  // 删除资产集里的资产
  delete_asset_from_assets_set() {}
}

export { AssetsDatabase, AssetsInterface }
