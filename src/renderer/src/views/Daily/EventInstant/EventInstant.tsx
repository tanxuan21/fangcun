import { useEffect, useState } from 'react'
import { EventClass, EventClassType, EventInstant } from '../../../../../../types/daily'
import { EventClassAPI } from '../api/event-class'
import { EditableInput } from '@renderer/components/Editable/EditableInput/EditableInput'
import { Button, DatePicker, Dropdown, Select, TimePicker, Switch, InputNumber } from 'antd'
import { replaceDateKeepTime, replaceTimeKeepDate } from '@renderer/utils'
import dayjs from 'dayjs'
import TextArea from 'antd/es/input/TextArea'
import { EventInstantAPI } from '../api/event-instant'
import EventInstantCardStyles from './event-instant.module.scss'
import { IconTail } from '@renderer/components/Icon'
import expandIconStyles from '@renderer/views/Daily/Dev/styles/expand-icon.module.scss'
type RenderEventInstant = EventInstant & { event_class?: EventClass }
type props = {
  data: EventInstant
  onClick?: () => void
  onDelete?: () => void
  onSave?: (newEventInstant: EventInstant) => void
} & { className?: string; styles?: React.CSSProperties }
const ExpandIcon = ({ onClick }: { onClick: () => void }) => {
  const [expand, setExpand] = useState<boolean>(false)
  return (
    <IconTail
      IconName="#icon-zhankai4"
      onClick={() => {
        setExpand(!expand)
        if (!expand) {
          onClick()
        }
      }}
      className={`${expandIconStyles['expand-icon']} ${expand && expandIconStyles['expand']}`}
    ></IconTail>
  )
}

// 事件类选择器
const EventClassSelector = ({
  dataCache,
  styles,
  onChange,
  placeholder
}: {
  dataCache: RenderEventInstant
  styles?: React.CSSProperties
  placeholder?: string
  onChange: (v: string) => void
}) => {
  const [opt, setOpt] = useState<{ value: string; label: React.ReactNode }[]>([])
  const [show, setShow] = useState<boolean>(false)
  useEffect(() => {
    ;(async function () {
      const resp = await EventClassAPI.getAll()
      setOpt([
        { label: 'null event class', value: `${0}` },
        ...resp.data.map((ec) => ({
          label: ec.event_name,
          value: `${ec.id}`
        }))
      ])
    })()
  }, [])
  return (
    <>
      {true && (
        <Select
          showSearch
          optionFilterProp="label"
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e)
            setShow(false)
          }}
          style={styles}
          options={opt}
        ></Select>
      )}
    </>
  )
}
const EventInstantCom = {
  Editor({ data, onDelete, onSave }: props) {
    const [dataCache, setDataCache] = useState<RenderEventInstant>({ ...data })
    useEffect(() => {
      ;(async function () {
        if (dataCache.event_class_id) {
          const resp = (await EventClassAPI.getById(dataCache.event_class_id)).data
          setDataCache({ ...dataCache, event_class: resp })
        }
      })()
    }, [])
    return (
      <div className={`${EventInstantCardStyles['event-instant-card-container']}`}>
        <p>id: {dataCache.id}</p>
        {/* 事件类 */}
        <section>
          event class: {dataCache.event_class_id ? dataCache.event_class?.event_name : 'null'}
          <EventClassSelector
            styles={{ minWidth: '200px' }}
            placeholder={dataCache.event_class?.event_name}
            dataCache={dataCache}
            onChange={async (v) => {
              if (v === '0') {
                setDataCache({ ...dataCache, event_class_id: null })
              } else {
                if (parseInt(v) !== dataCache.event_class_id) {
                  if (dataCache.event_class) {
                    dataCache.event_class.instant_count--
                  }
                  const resp = await EventClassAPI.getById(parseInt(v))
                  resp.data.instant_count++ // 前端手工添加实例引用
                  setDataCache({
                    ...dataCache,
                    event_name: resp.data.event_name, // 如果修改了父类，event name 也会随之改变
                    event_class_id: parseInt(v),
                    event_class: resp.data
                  })
                }
              }
            }}
          ></EventClassSelector>
        </section>
        {/* 事件名 */}
        <section>
          event name:
          <EditableInput
            disable={dataCache.event_class_id !== null}
            updateText={(v) => {
              dataCache.event_name = v
            }}
            saveText={(v) => {
              setDataCache({ ...dataCache, event_name: v })
            }}
            text={dataCache.event_name}
          ></EditableInput>
        </section>
        {/* 位置 */}
        <section>
          location:
          <EditableInput
            text={dataCache.location || '___'}
            updateText={(v) => {
              dataCache.location = v
            }}
            saveText={(v) => {
              setDataCache({ ...dataCache, location: v })
            }}
          ></EditableInput>
        </section>
        {/* 时间 */}
        <section style={{ display: 'flex', fontSize: '10px', gap: '7px' }}>
          <DatePicker
            onChange={(v) => {
              const str = v.format('YYYY-MM-DD')
              dataCache.start_time = replaceDateKeepTime(dataCache.start_time, str)
            }}
            defaultValue={dayjs(dataCache.start_time)}
          ></DatePicker>
          <TimePicker
            onChange={(v) => {
              const str = v.format('HH:mm:ss')
              dataCache.start_time = replaceTimeKeepDate(dataCache.start_time, str)
            }}
            defaultValue={dayjs(dataCache.start_time)}
          ></TimePicker>
          -
          <TimePicker
            onChange={(v) => {
              const str = v.format('HH:mm:ss')
              dataCache.end_time = replaceTimeKeepDate(dataCache.end_time, str)
            }}
            defaultValue={dayjs(dataCache.end_time)}
          ></TimePicker>
          <DatePicker
            onChange={(v) => {
              const str = v.format('YYYY-MM-DD')
              dataCache.end_time = replaceDateKeepTime(dataCache.end_time, str)
            }}
            defaultValue={dayjs(dataCache.end_time)}
          ></DatePicker>
        </section>
        {/* 紧急程度 */}
        <section>
          urgent level:
          <InputNumber
            value={dataCache.urgent_level}
            onChange={(v) => {
              dataCache.urgent_level = v || 0
              setDataCache({ ...dataCache })
            }}
          ></InputNumber>
        </section>
        {/* 重要程度 */}
        <section>
          important level:{' '}
          <InputNumber
            value={dataCache.important_level}
            onChange={(v) => {
              dataCache.important_level = v || 0
              setDataCache({ ...dataCache })
            }}
          ></InputNumber>
        </section>
        {/* 类型 */}
        <section>
          type: {dataCache.type}
          <Dropdown
            menu={{
              items: ['record', 'goal', 'remaind'].map((t) => ({
                key: t,
                label: t,
                onClick: () => {
                  dataCache.type = t as EventClassType
                  // EventInstantAPI.update(dataCache.id, { type: dataCache.type })
                  setDataCache({ ...dataCache }) // 重新渲染
                }
              }))
            }}
          >
            <div style={{ width: '20px', height: '20px' }}>
              <ExpandIcon onClick={() => {}}></ExpandIcon>
            </div>
          </Dropdown>
        </section>
        {/* 是否显示在timeline？ */}
        <section>
          view in timeline
          <Switch
            value={dataCache.view_in_timeline}
            onChange={(v) => {
              dataCache.view_in_timeline = v
              setDataCache({ ...dataCache })
            }}
          ></Switch>
        </section>
        {/* 提前多少时间提示 */}
        <section>
          remain minutes before{' '}
          <InputNumber
            value={dataCache.reminder_minutes_before}
            onChange={(v) => {
              dataCache.reminder_minutes_before = v || 0
              setDataCache({ ...dataCache })
            }}
          ></InputNumber>
        </section>
        {/* remark */}
        <div>
          remark:
          <TextArea
            onChange={(e) => {
              dataCache.remark = e.target.value
            }}
            showCount
            placeholder="remark"
            style={{ height: 120, resize: 'none' }}
          ></TextArea>
        </div>

        {/* 按钮组 */}
        <footer>
          <Button
            variant="filled"
            color="danger"
            onClick={() => {
              onDelete && onDelete()
            }}
          >
            delete
          </Button>
          <Button>cancel</Button>
          <Button
            variant="filled"
            color="primary"
            onClick={async () => {
              // 比对和data的差异，防止浪费
              const updates: Partial<EventInstant> = {}
              Object.keys(data).forEach((k) => {
                if (data[k] !== dataCache[k]) {
                  updates[k] = dataCache[k]
                }
              })
              console.log(updates, dataCache, data)
              await EventInstantAPI.update(dataCache.id, updates)
              // 必须更新data，否则下次比较还会继承这次的
              onSave && onSave({ ...dataCache }) // 这里也要展开，必须让 dataCache 和 data 不是一个对象，这里的比对才有意义。
            }}
          >
            save
          </Button>
        </footer>
      </div>
    )
  },
  DayView({ timeSectionHeight = 60, data, onClick }: props & { timeSectionHeight?: number }) {
    return (
      <div
        onClick={onClick}
        className={EventInstantCardStyles['event-instant-timeline-view-container']}
        style={{
          height: `${dayjs(data.end_time).diff(dayjs(data.start_time), 'minute')}px`,
          top: `${dayjs(data.start_time).diff(dayjs(data.start_time).startOf('day'), 'minute')}px`
        }}
      >
        {data.event_name}
      </div>
    )
  },
  DiaryView({ data, onClick }: props) {
    return (
      <div
        onClick={onClick}
        className={EventInstantCardStyles['event-instant-diary-view-container']}
      >
        {data.event_name}
      </div>
    )
  }
}

export { EventInstantCom }
