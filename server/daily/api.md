# 事件类

有两种事件
1. 实效事件，必须在某个时间做的事件
2. 积累事件，只要做完了即可。也可以采取更加松弛的策略，只要每天做了即可。

- 事件名
- 事件类型
- 所属分类id
- 默认事件内容

```ts

interface Feild {
    "id":number,
    "name":string, // 同名 name，子类的会覆盖父类的。这是后面的逻辑
    "type":"string" | "number" | "boolean" | "state" | "tag", // boolean 是两个单选； state 是多个单选；tag 是多个多选；是否需要合并？
    "container":"single"|"array"
    "default_value":any,
    "value":any, // 根据type，前端解析
    "class_id":number, // 所属类id，不一定是用在event上。未来可能用在多处
    "collapse":boolean, // 是否折叠，不一定子类都要显示这些数据
}

interface FeildInstant { // 字段实例
    "id":number,
    "feild_id":number,
    "value":any,
    "instant_id":number, // 属于哪个实例的，不一定是事件实例
}

interface EventClass {
    "id":number,
    "event_name":string,// event name 可以算是这个类的id。用户必须仔细考量。
    "instant_count":number, // 此事件实例化出去的事件实例数目
    "state":number,// 目前置四个状态，1:废弃，太简单；2:合适；3:挑战；4:展望
    "type":EventClassType,
    "view_in_timeline":boolean,
    "reminder_minutes_before":number,
}
```

> 想要实现的效果
> 两种事件，一种是健身的事件，每天做了多少个俯卧撑。这就是数值类事件。
> 第二类就是，要每天都学数学。但是具体学了啥，这个事情没法用数值量化，他就是项目类型。

如果修改 EventClass的 `event_name`，所有 derive 的事件实例都要更名。

#### 获取所有事件类

get `/event-class/get-all/`

#### 获取事件类

get `/event-class/get/:event-class-id`

#### 添加事件类

- 更新父类 `derive_count`

post `/event-class/add/`

respone:

```json
{
    "id":number
}
```

#### 删除事件类

delete `/event-class/delete/:event-class-id`

- 同时更新**派生事件计数器**
- 同时更新**实例事件计数器**
- 所有
- 减去集合的 `event_class_count`

#### 更新事件类

- (如果更新了`event_name`)更新所有派生事件的event_name

post `/event-class/update/:event-class-id`

request:

```json
{
    "event_name"?:string,
    "default_content"?:string,
}
```

---

#### 更新父集

post `/event-class/update-set/:event-class-id`

- 更新父集`event_class_count`数目

request:

```json
{
    "set_id":number[],
}
```

#### 移出所有集合

post `/event-class/remove-all-set/`

- 移出之后加入未分类集合
- 减去所有set的`event_class_count`
request:

```json
{
    "event_class_id":number[]
}
```

## 事件类管理树状视图

> 用户痛点：
> 面对一大片的散列的事件item，难以管理。使用树进行分类管理。
>
> 事件，可能有一个进阶的过程。一个集合的几个事件，就还是拿俯卧撑来说，它有不同的进阶退阶动作。这些都可以用一个集内的level来表示
> 

每个事件都有一个父集，集之间可以使用树状视图进行管理。**树状视图管理的是集，每个事件可以出现在多个集里**

```ts
interface EventClassSet {
    "id":number,
    "set_name":string,
    "parent_id":number,
    "event_class_count":number,
    "remark":string,
    // "event_class_list":{ // 记录所有的子事件类信息，废弃，使用关系表实现
    //     [key:number]:{
    //         "level":number
    //     }
    // }
}
```

#### 添加集合

post `/event-set/add/`

respone:

```json
{
    id:number
}
```

#### 删除集合

delete `/event-set/:event-set-id`

- 集合内的元素，如果有没有父集的，就拿到无分类里
- 递归删除所有的集的子集。
respone:

```json
{
    'event_class_id':number[] // 返回那些没有分类的元素，前端把它们移到未分类集
}
```

#### 更新集合信息

post `/event-set/update/:event-set-id`

request

```json
{
    set_name?:string,
    parent_id?:string,
    remark?:string,
    event_class_list?:string, // 后端严查数据更改，只能改不能改长度
}
```

#### 获取所有集合

get `/event-set/get-all/`

#### 获取单个集合

get `/event-set/get/:event-set-id`

# 事件实例

是每天对事件的记录，对于实效事件，需要提示我做。对于积累事件，更多的是用来分析。但是也要生成一个实效事件来提醒我做。（如果我某天超过某个时间都没有去填记录的话）

```ts
interface EventInstant {
    "id":number,
    "event_class_id":number|null, // 事件类id，可以为null，可以不属于任何事件类，只是临时事件
    "event_name":string, // 事件名称
    "location":string, // 地点
    "remark":string, // 备注信息
    "start_time":string, // 开始时间，年-月-日-时-分-秒
    "end_time":string, // 结束时间，年-月-日-时-分-秒
    "urgent_level":number, // 紧急等级
    "important_level":number,// 提醒等级，这两个字段的灵感来源是，紧急-重要 四象限图。
    "content":EventContent,
    "journal_id":string,// 可以根据时间推出来
    "type":number,// 类型，继承自 event_class。
    "view_in_timeline":boolean, // 是否显示在时间轴视图

}
```

## 日历表视图

## 日记视图

```ts
interface Journal {
    "id":number,
    "date":string,// 日期
    "content":string,// 内容
}
```

#### 获取事件实例

get `/event-instant/get/?`

如果有

```ts
// 精准查询
interface EventInstantQuery {
    event_class_id:number; // 精准查询，event_class 的派生
    id:number // 精准查询，id
    start_time_gte:string,
    start_time_lte:string,
    end_time_gte:string,
    end_time_lte:string,
    urgent_level:number,
    important_level:number,
    journal_id:number,
    type:number

}

interface EventInstantQuery {
    // 模糊查询字符串
    event_name:string 
    location:string
    remark:string
}

```

#### 添加事件实例

post `/event-instant/add/`

response:

```json
{
    id:number
}
```

#### 删除事件实例

delete `/event-instant/delete/:eventInstantId`

#### 修改事件实例

post `/event-instant/update/:eventInstantId`

request:

```json
{

}
```

## 需要添加的字段

**`type`** 事件类型。一共有四种类型。

**1. 事件记录** 流水账，记录今天实现了什么。用于那种攻坚目标。
**2. 事件提示** 用于提醒。比如，取快递，洗衣服；会议；约会等等实效性事件。
**3. 事件待办** 流水账的提示形式。比如，明天有什么要做的事情，今天写事件待办。

**`repeat_function`** 重复函数。`type` 为 **事件提示，事件待办**的重复函数。比如，永远重复，每天记得护肤，按时睡觉，按时起床。也有的事件按周重复，比如上课提醒。

ok **`view_in_timeline`** 是否显示在timeline视图
> 为什么不使用事件类型： remind - record 来区分，这是一个信息展示的字段，不是用作功能。我发现功能和展示是两个部分。并不是功能表示一切。

**`reminder_minites_before`** 
有效约束：`type` 为 **事件提示提** 前多少分钟提示。

事件类型系统：
