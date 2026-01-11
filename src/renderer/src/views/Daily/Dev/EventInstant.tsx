import { useState, useEffect } from 'react'
import { EventClass, EventClassType, EventInstant } from '../../../../../../types/daily'
import { EventInstantAPI } from '../api/event-instant'
import dayjs from 'dayjs'
import ListItemContainerStyles from './styles/ListItemContainer.module.scss'
import EventInstantCardStyles from './styles/EventInstantCard.module.scss'
import expandIconStyles from './styles/expand-icon.module.scss'
import { Button, DatePicker, Dropdown, Input, Select, TimePicker } from 'antd'
import { IconTail } from '@renderer/components/Icon'
import { EventClassAPI } from '../api/event-class'
import { EditableInput } from '../../../components/Editable/EditableInput/EditableInput'
import TextArea from 'antd/es/input/TextArea'
import { replaceDateKeepTime, replaceTimeKeepDate } from '@renderer/utils'

type RenderEventInstant = EventInstant & { event_class?: EventClass }
type props = {
  data: RenderEventInstant
  onDelete: () => void
  onSave: (newInstant: EventInstant) => void
} & {
  className?: string
  styles?: React.CSSProperties
}

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
      {/* <ExpandIcon
        onClick={() => {
          setShow(!show)
        }}
      ></ExpandIcon> */}
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
export const EventInstantCard = ({ data, onDelete, onSave }: props) => {
  const [dataCache, setDataCache] = useState<RenderEventInstant>(data)
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
      <p>urgent level: {dataCache.urgent_level}</p>
      <p>important level: {dataCache.important_level}</p>

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
      <footer>
        <Button
          variant="filled"
          color="danger"
          onClick={() => {
            onDelete()
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
            console.log(updates)
            await EventInstantAPI.update(dataCache.id, updates)
            // 必须更新data，否则下次比较还会继承这次的
            onSave(dataCache)
          }}
        >
          save
        </Button>
      </footer>
    </div>
  )
}
export function EventInstantPage() {
  const [eventInstantList, setEventInstantList] = useState<RenderEventInstant[]>([])
  useEffect(() => {
    ;(async function () {
      const _d = await EventInstantAPI.get('')
      setEventInstantList(_d.data)
      // 获取 event class 信息
    })()
  }, [])
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1
      }}
    >
      <header>
        <button
          onClick={async () => {
            const now = dayjs()
            const new_instant: EventInstant = {
              id: -1,
              event_class_id: null,
              event_name: 'new event',
              start_time: now.format('YYYY-MM-DD HH:mm:ss'),
              end_time: now.add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
              urgent_level: 0,
              important_level: 0,
              type: 'record',
              view_in_timeline: true,
              reminder_minutes_before: 0
            }
            const result = await EventInstantAPI.add(new_instant)
            new_instant.id = result.data.id
            console.log(result)

            setEventInstantList((prev) => [...prev, new_instant])
          }}
        >
          +
        </button>
      </header>
      <main style={{ height: '100%', minHeight: 0, flex: '1', overflow: 'scroll' }}>
        <div className={`${ListItemContainerStyles['list-item-container']}`}>
          {eventInstantList.map((item) => (
            <EventInstantCard
              key={item.id}
              data={item}
              onSave={(newInstant) => {
                setEventInstantList((prev) =>
                  prev.map((x) => (x.id === newInstant.id ? { ...newInstant } : x))
                )
              }}
              onDelete={() => {
                EventInstantAPI.delete(item.id)
                setEventInstantList((prev) => prev.filter((x) => x.id !== item.id))
              }}
            ></EventInstantCard>
          ))}
        </div>
      </main>
    </div>
  )
}
