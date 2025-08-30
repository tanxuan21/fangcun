## 卡片本管理

### 卡片本配置对象

```json
{
    audio_model:string, // 允许不填，不填代表不使用发音
    review_mode:{
        mode_name:string,
        mode_id:number, // 用于存数据库的type字段
        open:boolean,
    }[]
    memory_level:{
            level:number, // level:-1 标识 level infinity
            review_delay:number,
        }[],
    vague_review_count:number,
    forget_review_count:number,

    arrange_review:boolean, // 随便翻翻还是记录用户行为
}
```

```js

const DefaultBookSetting : BookSettingInterface = {
    audio_model:"",
    review_mode:[{
        mode_name:'read',
        mode_id:1,
        open:true,
    },{
        mode_name:'write',
        mode_id:2,
        open:true
    },{
        mode_name:'listen',
        mode_id:3,
        open:true
    }],
    memory_level:[
        {level:1,review_delay:1},
        {level:2,review_delay:2},
        {level:3,review_delay:3},
        {level:4,review_delay:4},
        {level:5,review_delay:5},
        {level:6,review_delay:6},
        {level:7,review_delay:7},
        {level:8,review_delay:8},
        {level:9,review_delay:9},
        {level:10,review_delay:10},
        {level:-1,review_delay:100},
    ],
    vague_review_count:2,
    forget_review_count:3,

    arrange_review:false, // 随便翻翻还是记录用户行为
}

```


### 添加卡片本

post `/api/recite/books/add/`
添加卡片本

request

```json
{
    book_name?:string,
    description?:string,
    setting?:string, // 配置对象。前端自己填默认的配置对象
}
```

respone
返回book id，用于前端更新

```json
{
    book_id:number
}
```

### 删除卡片本

delete `/api/recite/books/delete/:book_id`。
根据`book_id`删除卡片本

### 更新卡片本信息

post `/api/recite/books/update/:book_id`

要更新啥填啥

```json
{
    description?:string,
    name?:string,
    setting?:string,
}
```

### 获取所有卡片本

get `/api/recite/books/get/`

### 根据卡片本id获取卡片本

get `/api/recite/books/get/:book_id`

## 卡片
`/api/recite/cards`

### 获取卡片

get `/api/recite/cards/get_card/:card_id`
根据 `card_id` 获取卡片

get `/api/recite/cards/get_book/:book_id`
根据 `book_id` 获取所有卡片


### 添加卡片

post `/api/recite/cards/add/`

添加一个新卡片

request

```json
{
    Q:string,
    A:string,
    book_id:number
}
```

respone

```json
{
    card_id:number
}
```

### 批量添加卡片

post `/api/recite/cards/multiple/`

批量添加卡片

request

```json
{
    cards_list:{q:string,a:string}[],
    book_id:number
}
```

### 更新卡片

post `/api/recite/cards/update/:card_id`

更新一个新卡片，更新啥字段就填啥字段，不更新的字段就不写。

```json
{
  id: number
  Q: string
  A: string
  book_id: number
  updated_at: string
  review_at: string
}
```

### 删除卡片

delete `/api/recite/cards/delete/:card_id`

根据 card_id 删除一个卡片


## 复习

### 更新复习记录
post `/api/recite/cards/review_update/:card_id`

根据 card_id 和 用户选择的记忆情况，更新复习表

```json
{
    memory_type:"remember"|"vague"|"forget",
    review_type:number
}
```

### 获取复习记录

post `/api/recite/cards/review_get/:card_id`

根据 card_id 获取复习记录

query params

|   参数名    |                                 用途                                  |
| :---------: | :-------------------------------------------------------------------: |
| review_type | 获取特定review_type的复习安排。如果不填，那就是获取所有类型的复习安排 |

request:

```json
{
    start_date:string,
    end_date:string,
}
```

respone:

```json
{
    "success": true,
    "message": "ok",
    "data": [
        {
            "id": 1,
            "remember": 2,
            "vague": 1,
            "forget": 2,
            "type":1,
            "card_id": 1,
            "review_at": "2025-08-24"
        },
        ...
    ]
}
```

可能找到一个空数组。前端自行处理。


## 复习安排

### 结束复习

post `/api/recite/card/finish_review/:card_id`

结束复习，将今天的日期写入 `card` 的 `review_at`
同时，**前端计算下次需要复习的日期，和这个单词更新后的level**，一并写入。

request 

```json
{
    review_type:number,
    next_review_date:string,
    level:number,
    control:number,
}
```


control 是一个二进制数。标识权限控制。
| 位数（低->高） |     控制     |                 简介                  |
| :------------: | :----------: | :-----------------------------------: |
|       1        | 更新复习日期 | 更新 cards 表里存的最近一天的复习日期 |
|       2        |   安排复习   |        根据当天的情况安排复习         |


### 获取安排

get `/api/recite/card/review_arrangement/:card_id`

query params

|   参数名    |                                 用途                                  |
| :---------: | :-------------------------------------------------------------------: |
| review_type | 获取特定review_type的复习安排。如果不填，那就是获取所有类型的复习安排 |


response

```json
[
    {
        id: number
        card_id: number
        type: number
        level: number
        review_date: string
    }...
]
```