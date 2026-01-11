import { useEffect, useState } from 'react'
import { EventClass, EventClassType } from '../../../../../../types/daily'
import { EventClassAPI } from '../api/event-class'
import { EditableInput } from '../../../components/Editable/EditableInput/EditableInput'
import { Dropdown } from 'antd'
import EventClassCardStyles from './styles/EventClassCard.module.scss'
import ListItemContainerStyles from './styles/ListItemContainer.module.scss'
const EventClassStateMapping = {
  1: 'abandon',
  2: 'eazy',
  3: 'suitable',
  4: 'periscopic'
}

export function EventClassCard({
  data,
  onUpdate,
  onDelete
}: {
  onUpdate?: (new_data: EventClass) => void
  onDelete?: () => void
  data: EventClass
}) {
  const [dataCache, setDataCache] = useState<EventClass>(data)
  return (
    <div className={`${EventClassCardStyles['event-class-card-container']}`}>
      <EditableInput
        saveText={async (v) => {
          EventClassAPI.update(dataCache.id, {
            event_name: v
          })
          setDataCache({ ...dataCache, event_name: v })
        }}
        updateText={(v) => {
          dataCache.event_name = v
        }}
        text={dataCache.event_name}
      ></EditableInput>
      <p>instant count: {dataCache.instant_count}</p>
      <Dropdown
        trigger={['click']}
        menu={{
          items: Object.keys(EventClassStateMapping).map((k) => ({
            key: k,
            label: `${k} ${EventClassStateMapping[k]}`,
            onClick: () => {
              EventClassAPI.update(dataCache.id, { state: parseInt(k) })
              setDataCache({ ...dataCache, state: parseInt(k) })
            }
          }))
        }}
      >
        <p>event state: {`${dataCache.state} ${EventClassStateMapping[dataCache.state]}`}</p>
      </Dropdown>

      <Dropdown
        trigger={['click']}
        menu={{
          items: ['record', 'goal', 'remaind'].map((t) => ({
            key: t,
            label: t,
            onClick: () => {
              dataCache.type = t as EventClassType
              EventClassAPI.update(dataCache.id, { type: dataCache.type })
              setDataCache({ ...dataCache, type: t as EventClassType })
            }
          }))
        }}
      >
        <p>event type: {dataCache.type}</p>
      </Dropdown>
      {/* 更多菜单 */}
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'instantiation',
              label: 'instantiation'
            },
            { type: 'divider' },
            {
              key: 'delete',
              label: 'delete',
              danger: true,
              onClick: () => {
                onDelete && onDelete()
              }
            }
          ]
        }}
      >
        <section className={`${EventClassCardStyles['more']}`}>...</section>
      </Dropdown>
    </div>
  )
}

// 页面
export function EventClassPage() {
  const [eventClassList, setEventClassList] = useState<EventClass[]>([])
  useEffect(() => {
    ;(async function () {
      const _d = await EventClassAPI.getAll()
      setEventClassList(_d.data)
    })()
  }, [])
  return (
    <div>
      <header>
        <button
          onClick={async () => {
            // 防止重名冲突
            const eventNameSet = new Set(eventClassList.map((ec) => ec.event_name))
            let i = 1
            while (eventNameSet.has(`new event class ${i}`)) i++
            const new_e: EventClass = {
              event_name: `new event class ${i}`,
              state: 2,
              instant_count: 0,
              type: 'record',
              id: -1,
              view_in_timeline: true,
              reminder_minutes_before: 0
            }
            const resp = await EventClassAPI.add(new_e)
            new_e.id = resp.id
            setEventClassList((prev) => [...prev, new_e])
          }}
        >
          +
        </button>
      </header>
      <main>
        <div className={`${ListItemContainerStyles['list-item-container']}`}>
          {eventClassList.map((item) => (
            <EventClassCard
              key={item.id}
              data={item}
              onDelete={() => {
                console.log('delete', item.id)

                EventClassAPI.delete(item.id)
                setEventClassList((prev) => prev.filter((x) => x.id !== item.id))
              }}
            ></EventClassCard>
          ))}
        </div>
      </main>
    </div>
  )
}
