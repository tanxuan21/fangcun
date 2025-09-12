import { EventInstant } from 'type/daily'
import styles from './DayView.module.scss'
import { EventInstantCom } from '../EventInstant/EventInstant'
interface props {
  eventInstantList: EventInstant[]
  onActiveEventInstant: (newEventInstant: EventInstant) => void
  addNewEventInstant?: (hour: number) => void
}

export const DiaryView = ({
  eventInstantList,
  onActiveEventInstant,
  addNewEventInstant
}: props) => {
  return (
    <div className={`${styles['diary-container']}`}>
      {eventInstantList
        .filter((ei) => !ei.view_in_timeline)
        .map((ei) => (
          <EventInstantCom.DiaryView
            key={ei.id}
            onClick={() => {
              onActiveEventInstant(ei)
            }}
            data={ei}
          ></EventInstantCom.DiaryView>
        ))}
    </div>
  )
}
