interface NodeMetaData {
  width: number
  height: number
  x: number
  y: number
}
// 缺失/构造时的meta_data
const default_meta_data: NodeMetaData = {
  width: 200,
  height: 150,
  x: 0,
  y: 0
}
interface props {
  meta_data: NodeMetaData
  onNodeWheel: (event: React.WheelEvent) => void
}

enum NodeControlState {
  Idle,
  Dragging,
  Animation
}

import { useState } from 'react'
import styles from './styles.module.scss'
const Node = ({ meta_data = default_meta_data, onNodeWheel }: props) => {
  const [state, set_state] = useState<NodeControlState>(NodeControlState.Idle)
  const [position, set_position] = useState<{ x: number; y: number }>({
    x: meta_data.x,
    y: meta_data.y
  })

  const handlePointerDown = (event: React.PointerEvent) => {
    set_state(NodeControlState.Dragging)
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }
  const handlePointerMove = (event: React.PointerEvent) => {
    if (state === NodeControlState.Dragging) {
      set_position({
        x: event.clientX,
        y: event.clientY
      })
    }
  }
  const handlePointerUp = (event: React.PointerEvent) => {
    set_state(NodeControlState.Idle)
  }
  const handlePointerLeave = (event: React.PointerEvent) => {
    set_state(NodeControlState.Idle)
  }
  return (
    <div
      className={styles['container']}
      onWheel={onNodeWheel}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${meta_data.width}px`,
        height: `${meta_data.height}px`
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
    ></div>
  )
}

export { Node, default_meta_data }
