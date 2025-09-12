import { useState } from 'react'
import { EventClassPage } from './EventClass'
import { EventInstantPage } from './EventInstant'

const mapper = {
  1: { node: <EventClassPage></EventClassPage>, text: 'event class' },
  2: { node: <EventInstantPage></EventInstantPage>, text: 'event instant' }
}
export function DailyDev() {
  const [id, set_id] = useState<number>(1)
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header>
        {Object.keys(mapper).map((k) => (
          <button
            key={k}
            onClick={() => {
              set_id(parseInt(k))
            }}
          >
            {mapper[k].text}
          </button>
        ))}
        {/* <button>event class</button> */}
      </header>
      <main style={{ width: '100%', height: '100%', flex: '1' }}>{mapper[id]['node']}</main>
    </div>
  )
}
