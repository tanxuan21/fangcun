import { Button, Splitter } from 'antd'
import styles from './DayView.module.scss'
import { useEffect, useState } from 'react'
import { EventInstantAPI } from '../api/event-instant'
import { EventInstantCom } from '../EventInstant/EventInstant'
import { EventInstant } from 'type/daily'
import { CurrentPointer } from '../CurrentPointer/CurrentPointer'
import dayjs from 'dayjs'
import { IconTail } from '@renderer/components/Icon'
import { daysAfterdays, daysAfterToday } from '@renderer/utils'
import { DiaryView } from './DiaryView'

const TimeSection = ({ onClick }: { onClick?: () => void }) => {
  return <section onClick={onClick} className={styles['time-section']}></section>
}

const DayView = ({
  eventInstantList,
  onActiveEventInstant, // 激活事件，用于编辑
  addNewEventInstant, // 添加新事件实例
  onUpdateDay
}: {
  eventInstantList: EventInstant[]
  onActiveEventInstant: (newEventInstant: EventInstant) => void
  addNewEventInstant?: (hour: number) => void
  onUpdateDay?: (daystr: string) => void
}) => {
  const [dayStrCache, setDayStrCache] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [displayMode, setDisplayMode] = useState<'timeline' | 'diary'>('timeline')
  return (
    <div className={styles['day-view-main-container']}>
      <header>
        <Button
          className={`${styles['today-button']}`}
          onClick={() => {
            const today = dayjs().format('YYYY-MM-DD')
            setDayStrCache(today)
            onUpdateDay && onUpdateDay(today)
          }}
        >
          Today
        </Button>
        <section className={`${styles['header-button-group']}`}>
          <IconTail
            size={10}
            className={`${styles['last-day-icon']} ${styles['icon']}`}
            IconName="#icon-zhankai"
            onClick={() => {
              const last_day = daysAfterdays(dayStrCache, -1)
              setDayStrCache(last_day)
              onUpdateDay && onUpdateDay(last_day)
            }}
          ></IconTail>
          <IconTail
            size={10}
            className={`${styles['select-day-icon']} ${styles['icon']}`}
            IconName="#icon-rili"
          ></IconTail>
          <IconTail
            size={10}
            className={`${styles['next-day-icon']} ${styles['icon']}`}
            IconName="#icon-zhankai"
            onClick={() => {
              const next_day = daysAfterdays(dayStrCache, 1)
              setDayStrCache(next_day)
              onUpdateDay && onUpdateDay(next_day)
            }}
          ></IconTail>
        </section>
        {dayStrCache}
        <p
          className={`${styles['mode']}`}
          onClick={() => {
            if (displayMode === 'timeline') setDisplayMode('diary')
            if (displayMode === 'diary') setDisplayMode('timeline')
          }}
        >
          {displayMode}
        </p>
      </header>
      <main>
        {displayMode === 'timeline' && (
          <>
            <aside>
              {Array(24)
                .fill(0)
                .map((o, i) => (
                  <div key={i}>{i > 0 && <span>{`${i} ${i < 12 ? 'AM' : 'PM'}`}</span>}</div>
                ))}
            </aside>
            <div>
              {Array(24)
                .fill(0)
                .map((o, i) => (
                  <TimeSection
                    onClick={() => {
                      addNewEventInstant && addNewEventInstant(i)
                    }}
                    key={i}
                  ></TimeSection>
                ))}
              {eventInstantList
                .filter((ei) => ei.view_in_timeline)
                .map((ei) => (
                  <EventInstantCom.DayView
                    key={ei.id}
                    data={ei}
                    onClick={() => {
                      onActiveEventInstant(ei)
                    }}
                  />
                ))}
              <CurrentPointer></CurrentPointer>
            </div>
          </>
        )}
        {displayMode === 'diary' && (
          <DiaryView
            onActiveEventInstant={(ei) => {
              onActiveEventInstant(ei)
            }}
            addNewEventInstant={() => {}}
            eventInstantList={eventInstantList}
          />
        )}
      </main>
      <footer></footer>
    </div>
  )
}

export const DayViewPage = () => {
  const [eventInstantList, setEventInstantList] = useState<EventInstant[]>([])
  const [editingInstant, setEditingInstant] = useState<EventInstant | null>(null)
  const [dayStr, setDayStr] = useState<string>(dayjs().format('YYYY-MM-DD'))

  const handleFetchEventInstant = async (daystr: string) => {
    // 获取所有**今天**发生的事件
    const startOfDay = dayjs(daystr).startOf('day').format('YYYY-MM-DD HH:mm:ss')
    const endOfDay = dayjs(daystr).endOf('day').format('YYYY-MM-DD HH:mm:ss')
    const resp = await EventInstantAPI.get(`?start_time_gte=${startOfDay}&end_time_lte=${endOfDay}`)
    setEventInstantList(resp.data)
  }
  useEffect(() => {
    ;(async function () {
      await handleFetchEventInstant(dayStr) // 默认获取今天的事件实例
    })()
  }, [dayStr]) // 日期一旦更新，立刻重新获取
  return (
    <div className={styles['day-view-container']}>
      <header>
        <span>EventClass</span> <span>EventInstant</span>
      </header>
      <main>
        <Splitter>
          <Splitter.Panel>
            {editingInstant && (
              <EventInstantCom.Editor
                key={editingInstant.id}
                data={editingInstant}
                onDelete={async () => {
                  await EventInstantAPI.delete(editingInstant.id)
                  setEditingInstant(null)
                  setEventInstantList((prev) => prev.filter((ei) => ei.id !== editingInstant.id))
                }}
                // 更新外部参数
                onSave={async (newEventInstant) => {
                  setEventInstantList((prev) =>
                    prev.map((ei) => (ei.id === newEventInstant.id ? newEventInstant : ei))
                  )
                  setEditingInstant(newEventInstant)
                }}
              />
            )}
          </Splitter.Panel>
          <Splitter.Panel>
            <DayView
              addNewEventInstant={async (hour) => {
                const ni: EventInstant = {
                  id: -1,
                  event_class_id: null,
                  event_name: 'new event',
                  start_time: `${dayStr} ${hour}:00:00`,
                  end_time: `${dayStr} ${hour}:59:59`,
                  urgent_level: 0,
                  important_level: 0,
                  type: 'record',
                  reminder_minutes_before: 10,
                  view_in_timeline: true
                }
                const result = await EventInstantAPI.add(ni)
                ni.id = result.data.id
                setEventInstantList((prev) => [...prev, ni])
              }}
              eventInstantList={eventInstantList}
              onUpdateDay={(daystr) => {
                setDayStr(daystr)
                setEditingInstant(null)
              }}
              onActiveEventInstant={(newEventInstant) => {
                console.log(newEventInstant)

                setEditingInstant(newEventInstant)
              }}
            ></DayView>
          </Splitter.Panel>
        </Splitter>
      </main>
      <footer></footer>
    </div>
  )
}
