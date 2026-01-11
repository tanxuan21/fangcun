# 复习系统 API 文档

## 概述
本 API 提供复习项目（Review Items）和复习集合（Review Sets）的管理功能，支持 CRUD 操作。

## 基础信息
- **基础路径**: `/api/review`
- **响应格式**: JSON
- **错误码**: 使用标准 HTTP 状态码

---

## 1. 复习项目管理 (Review Items)

### 1.1 获取复习项目列表
**GET** `/review-items`

**查询参数**:
| 参数名          | 类型   | 必填 | 说明                                    |
| --------------- | ------ | ---- | --------------------------------------- |
| `mode`          | string | 否   | 获取模式，可选值见 `GetReviewItemsMode` |
| `review_set_id` | string | 是   | 复习集合 ID                             |

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "word",
      "content": "example content",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**错误响应**:
- 400: `review_set_id` 参数缺失或格式错误

---

### 1.2 创建复习项目
**POST** `/review-items`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "type": "word",
  "content": "要学习的内容",
  "review_set_id": 1
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1
  }
}
```

**错误响应**:
- 409: 项目已存在
- 400: 请求体格式错误

---

### 1.3 更新复习项目
**PUT** `/review-items`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "id": 1,
  "updates": {
    "type": "sentence",
    "content": "更新后的内容"
  }
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "changes": 1
  }
}
```

---

### 1.4 删除复习项目
**DELETE** `/review-items`

**查询参数**:
| 参数名 | 类型   | 必填 | 说明        |
| ------ | ------ | ---- | ----------- |
| `id`   | string | 是   | 复习项目 ID |

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "deleted": true
  }
}
```

**错误响应**:
- 400: `id` 参数缺失

---

### 1.5 重新安排复习项目
**POST** `/review-items/arrange`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "id": 1
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": "安排成功"
}
```

---

## 2. 复习记录管理 (Reviews)

### 2.1 获取复习记录
**GET** `/reviews`

**查询参数**:
| 参数名    | 类型   | 必填 | 说明        |
| --------- | ------ | ---- | ----------- |
| `item_id` | string | 是   | 复习项目 ID |

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "item_id": 1,
      "rate": 5,
      "remark": "掌握良好",
      "reviewed_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**备用路径**:
- **GET** `/reviews/:item_id` - 使用路径参数

---

### 2.2 创建复习记录
**POST** `/reviews`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "item_id": 1,
  "rate": 4,
  "remark": "还需加强"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": "success!"
}
```

---

### 2.3 更新复习记录
**PUT** `/reviews`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "id": 1,
  "updates": {
    "rate": 3,
    "remark": "更新后的备注"
  }
}
```

---

### 2.4 删除复习记录
**DELETE** `/reviews`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "id": 1
}
```

---

## 3. 复习集合管理 (Review Sets)

### 3.1 获取复习集合列表
**GET** `/review-set`

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "英语单词",
      "description": "每日必背单词",
      "setting": {},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 3.2 创建复习集合
**POST** `/review-set`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "name": "新集合",
  "description": "集合描述",
  "setting": {
    "daily_target": 20,
    "review_interval": "7d"
  }
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "新集合"
  }
}
```

---

### 3.3 更新复习集合
**PUT** `/review-set`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "id": 1,
  "name": "更新后的名称",
  "description": "更新后的描述",
  "setting": {
    "daily_target": 30
  }
}
```

---

### 3.4 删除复习集合
**DELETE** `/review-set`

**查询参数**:
| 参数名   | 类型   | 必填 | 说明        |
| -------- | ------ | ---- | ----------- |
| `set_id` | string | 是   | 复习集合 ID |

**错误响应**:
- 400: `set_id` 参数缺失

---

### 3.5 向集合添加复习项目
**POST** `/review-set/add-review-item`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "review_set_id": 1,
  "review_item_id": 5
}
```

---

### 3.6 从集合移除复习项目
**DELETE** `/review-set/delete-review-item`

**请求头**:
```http
Content-Type: application/json
```

**请求体**:
```json
{
  "review_set_id": 1,
  "review_item_id": 5
}
```

**备用路径**:
- **DELETE** `/review-set/review-items` - 使用查询参数

**查询参数版**:
```
DELETE /review-set/review-items?set_id=1&item_id=5
```

---

### 3.7 获取集合内的复习项目
**GET** `/review-set/review-items`

**查询参数**:
| 参数名   | 类型   | 必填 | 说明        |
| -------- | ------ | ---- | ----------- |
| `set_id` | string | 是   | 复习集合 ID |

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "word",
      "content": "单词内容"
    }
  ]
}
```

---

## 数据结构说明

### 复习项目 (Review Item)
```typescript
interface ReviewItem {
  id: number;
  type: string; // 项目类型，如 "word", "sentence" 等
  content: string; // 具体内容
  created_at: string; // 创建时间
}
```

### 复习记录 (Review)
```typescript
interface Review {
  id: number;
  item_id: number;
  rate: number; // 评分，通常 1-5
  remark?: string; // 备注
  reviewed_at: string; // 复习时间
}
```

### 复习集合 (Review Set)
```typescript
interface ReviewSet {
  id: number;
  name: string;
  description?: string;
  setting: object; // 自定义设置
  created_at: string;
}
```

---

## 使用示例

### 完整流程示例
1. **创建复习集合**
```bash
curl -X POST http://localhost:3000/api/review/review-set \
  -H "Content-Type: application/json" \
  -d '{"name": "我的单词本", "description": "每日背诵"}'
```

2. **添加复习项目到集合**
```bash
curl -X POST http://localhost:3000/api/review/review-items \
  -H "Content-Type: application/json" \
  -d '{"type": "word", "content": "abandon", "review_set_id": 1}'
```

3. **进行复习并记录**
```bash
curl -X POST http://localhost:3000/api/review/reviews \
  -H "Content-Type: application/json" \
  -d '{"item_id": 1, "rate": 4, "remark": "记忆良好"}'
```

---

## 注意事项
1. 所有 ID 参数都需要转换为字符串传递
2. 时间格式使用 ISO 8601 字符串
3. 建议使用统一的错误处理中间件
4. 调试模式下会打印请求日志

## 错误码参考
- 200: 成功
- 400: 请求参数错误
- 404: 资源不存在
- 409: 资源冲突（如已存在）
- 500: 服务器内部错误