import { useState, useRef, useEffect } from 'react'
import React from 'react'
import styles from './styles.module.scss'
import { default_meta_data, Node } from './Node/index'
function Box({
  x = 0,
  y = 0,
  onBoxWheel
}: {
  x?: number
  y?: number
  onBoxWheel: (event: React.WheelEvent) => void
}) {
  const handleWheel = (event: React.WheelEvent) => {
    // event.stopPropagation()
  }
  return (
    <div
      style={{
        width: '200px',
        height: '150px',
        background: '#aaa',
        border: '1px solid',
        translate: '-50% -50%',
        top: `${y}px`,
        left: `${x}px`,
        position: 'absolute'
      }}
      onWheel={onBoxWheel}
    ></div>
  )
}

enum BoardControlState {
  Dragging,
  Idle,
  Animating
}

// context + ref 的方案
// interface BoardContextValue {
//   scaleRef: React.RefObject<number>
//   translateRef: React.RefObject<{ x: number; y: number }>
// }

// const BoardContext = React.createContext<BoardContextValue | null>(null)

// class Board {
//   BoardState: {
//     scale: number
//     translate: {
//       x: number
//       y: number
//     }
//   } = {
//     scale: 1,
//     translate: {
//       x: 0,
//       y: 0
//     }
//   }
//   render() {
//     // 容器
//     const containerRef = useRef<HTMLDivElement | null>(null)

//     // 保存画布的初始平移值，滚轮值
//     const translateRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
//     const wheelvalueRef = useRef<number>(0)

//     const [state, set_state] = useState(BoardControlState.Idle)

//     // 鼠标开始拖拽时记录初始位置
//     // 实时translate scale
//     const [begin_position, set_begin_position] = useState({ x: 0, y: 0 })
//     const [translate, set_translate] = useState<{ x: number; y: number }>({
//       x: 0,
//       y: 0
//     })
//     const [scale, set_scale] = useState<number>(1)

//     useEffect(() => {
//       this.BoardState.scale = scale
//     }, [scale])
//     useEffect(() => {
//       this.BoardState.translate = translate
//     }, [translate])

//     const mapping_wheel = (wheel_value: number) => {
//       if (wheel_value >= 0) {
//         return wheel_value + 1
//       } else {
//         return Math.exp(wheel_value)
//       }
//     }
//     const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
//       if (BoardControlState.Animating === state) return // 动画中事件禁用
//       const pos = {
//         x: event.clientX,
//         y: event.clientY
//       }

//       // 记录初始位置和当前平移值
//       set_begin_position(pos)
//       translateRef.current = { ...translate } // 保存当前平移值
//       set_state(BoardControlState.Dragging)
//       //   console.log('mousedown', translate)
//     }

//     const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
//       if (state === BoardControlState.Dragging) {
//         const pos = {
//           x: event.clientX,
//           y: event.clientY
//         }
//         set_translate({
//           x: pos.x - begin_position.x + translateRef.current.x, // 使用保存的初始平移值
//           y: pos.y - begin_position.y + translateRef.current.y
//         })
//       }
//     }

//     const handleMouseUp = () => {
//       set_state(BoardControlState.Idle)
//       translateRef.current = { ...translate }

//       //   console.log('mouseup', translate)
//     }

//     const handleMouseLeave = () => {
//       set_state(BoardControlState.Idle)
//     }
//     const handleWheel = (event: React.WheelEvent) => {
//       wheelvalueRef.current += event.deltaY * 1e-3
//       const last_scale = scale
//       const new_scale = mapping_wheel(wheelvalueRef.current)

//       set_scale(new_scale)

//       //   console.log('scale', scale)
//       // 同时，要偏移。营造一种假象，似乎缩放中心在鼠标

//       // 计算向量
//       // 计算container的中心位置在client坐标系的位置
//       // 获取鼠标位置
//       if (containerRef) {
//         const container_geo = (containerRef.current as HTMLElement).getBoundingClientRect()
//         const container_center = {
//           x: container_geo.width / 2 + container_geo.x,
//           y: container_geo.height / 2 + container_geo.y
//         }
//         const origin_client_pos = {
//           x: container_center.x + translate.x,
//           y: container_center.y + translate.y
//         }
//         const to_mouse_vector = {
//           x: event.clientX - origin_client_pos.x,
//           y: event.clientY - origin_client_pos.y
//         }
//         // const len = Math.sqrt(
//         //   to_mouse_vector.x * to_mouse_vector.x + to_mouse_vector.y * to_mouse_vector.y
//         // )
//         // 数学计算... ...s
//         const normalize_to_mouse_vector = {
//           x: to_mouse_vector.x * (1 - new_scale / last_scale),
//           y: to_mouse_vector.y * (1 - new_scale / last_scale)
//         }

//         set_translate({
//           x: translate.x + normalize_to_mouse_vector.x,
//           y: translate.y + normalize_to_mouse_vector.y
//         })
//       } else {
//         console.log('Board containerRef is null')
//       }
//     }

//     return (
//       <div className={styles['container']} ref={containerRef}>
//         {/* 坐标层 */}
//         <canvas></canvas>
//         {/* 事件层 */}
//         <div
//           className={styles['event-layer']}
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           onMouseLeave={handleMouseLeave}
//           onWheel={handleWheel}
//         ></div>
//         {/* 源点 */}
//         <div
//           className={styles['origin']}
//           style={{
//             translate: `${translate.x}px ${translate.y}px`,
//             scale: `${scale}`
//           }}
//         >
//           <Node meta_data={default_meta_data} onNodeWheel={handleWheel}></Node>
//           <Node
//             meta_data={{
//               x: 150,
//               y: 0,
//               width: 50,
//               height: 50
//             }}
//             onNodeWheel={handleWheel}
//           ></Node>
//         </div>
//       </div>
//     )
//   }
// }

type point = {
  x: number
  y: number
}

class Board {
  BoardState: {
    scale: number
    translate: point
    translating: point
    state: BoardControlState
    begin_position: point
    wheel_value: number
  } = {
    scale: 1,
    translate: {
      x: 0,
      y: 0
    },
    translating: { x: 0, y: 0 },
    state: BoardControlState.Idle,
    begin_position: { x: 0, y: 0 },
    wheel_value: 0
  }
  container_element: HTMLElement | null = null
  // 挂载
  mount(element: HTMLElement) {
    element.innerHTML = ''
    element.appendChild(this.render())
  }

  render(): HTMLElement {
    // 容器
    // const containerRef = useRef<HTMLDivElement | null>(null)
    // 创建基础元素
    const container = document.createElement('div')
    const axes_canvas = document.createElement('canvas')
    const interaction_layer = document.createElement('div')
    const origin = document.createElement('div')

    // 类样式
    container.classList.add(styles['container'])
    axes_canvas.classList.add(styles['canvas'])
    interaction_layer.classList.add(styles['event-layer'])
    origin.classList.add(styles['origin'])

    // 层级关系
    container.appendChild(axes_canvas)
    container.appendChild(interaction_layer)
    container.appendChild(origin)

    // 工具函数
    const set_state = (s: BoardControlState) => {
      this.BoardState.state = s
    }
    const set_translate = (t) => {
      this.BoardState.translating = t
    }

    const mapping_wheel = (wheel_value: number) => {
      if (wheel_value >= 0) {
        return wheel_value + 1
      } else {
        return Math.exp(wheel_value)
      }
    }
    const transfromBoard = () => {
      origin.style.scale = `${this.BoardState.scale}`
      origin.style.translate = `${this.BoardState.translating.x}px ${this.BoardState.translating.y}px`
    }

    // 事件交互
    const handleMouseDown = (event: MouseEvent) => {
      if (BoardControlState.Animating === this.BoardState.state) return // 动画中事件禁用
      const pos = {
        x: event.clientX,
        y: event.clientY
      }

      // 记录初始位置和当前平移值
      //   set_begin_position(pos)
      this.BoardState.begin_position = pos
      set_state(BoardControlState.Dragging)
      //   console.log('mousedown', translate)
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (this.BoardState.state === BoardControlState.Dragging) {
        const pos = {
          x: event.clientX,
          y: event.clientY
        }
        set_translate({
          x: pos.x - this.BoardState.begin_position.x + this.BoardState.translate.x, // 使用保存的初始平移值
          y: pos.y - this.BoardState.begin_position.y + this.BoardState.translate.y
        })
        transfromBoard()
      }
    }

    const handleMouseUp = () => {
      set_state(BoardControlState.Idle)
      this.BoardState.translate = this.BoardState.translating
      //   console.log('mouseup', translate)
    }

    const handleMouseLeave = () => {
      set_state(BoardControlState.Idle)
      this.BoardState.translate = this.BoardState.translating
    }
    const handleWheel = (event: WheelEvent) => {
      this.BoardState.wheel_value += event.deltaY * 1e-3
      const last_scale = this.BoardState.scale
      const new_scale = mapping_wheel(this.BoardState.wheel_value)

      this.BoardState.scale = new_scale

      //   console.log('scale', scale)
      // 同时，要偏移。营造一种假象，似乎缩放中心在鼠标

      // 计算向量
      // 计算container的中心位置在client坐标系的位置
      // 获取鼠标位置
      if (interaction_layer) {
        const container_geo = interaction_layer.getBoundingClientRect()
        const container_center = {
          x: container_geo.width / 2 + container_geo.x,
          y: container_geo.height / 2 + container_geo.y
        }
        const origin_client_pos = {
          x: container_center.x + this.BoardState.translating.x,
          y: container_center.y + this.BoardState.translating.y
        }
        const to_mouse_vector = {
          x: event.clientX - origin_client_pos.x,
          y: event.clientY - origin_client_pos.y
        }
        // const len = Math.sqrt(
        //   to_mouse_vector.x * to_mouse_vector.x + to_mouse_vector.y * to_mouse_vector.y
        // )
        // 数学计算... ...s
        const normalize_to_mouse_vector = {
          x: to_mouse_vector.x * (1 - new_scale / last_scale),
          y: to_mouse_vector.y * (1 - new_scale / last_scale)
        }

        set_translate({
          x: this.BoardState.translating.x + normalize_to_mouse_vector.x,
          y: this.BoardState.translating.y + normalize_to_mouse_vector.y
        })
        this.BoardState.translate = this.BoardState.translating
        transfromBoard()
      } else {
        console.log('Board containerRef is null')
      }
    }

    interaction_layer.onwheel = handleWheel
    interaction_layer.onmousedown = handleMouseDown
    interaction_layer.onmousemove = handleMouseMove
    interaction_layer.onmouseup = handleMouseUp
    interaction_layer.onmouseleave = handleMouseLeave

    const box = document.createElement('div')
    box.classList.add(styles['node'])
    origin.appendChild(box)

    return container

    // return (
    //   <div className={styles['container']} ref={containerRef}>
    //     {/* 坐标层 */}
    //     <canvas></canvas>
    //     {/* 事件层 */}
    //     <div
    //       className={styles['event-layer']}
    //       onMouseDown={handleMouseDown}
    //       onMouseMove={handleMouseMove}
    //       onMouseUp={handleMouseUp}
    //       onMouseLeave={handleMouseLeave}
    //       onWheel={handleWheel}
    //     ></div>
    //     {/* 源点 */}
    //     <div
    //       className={styles['origin']}
    //       style={{
    //         translate: `${translate.x}px ${translate.y}px`,
    //         scale: `${scale}`
    //       }}
    //     >
    //       <Node meta_data={default_meta_data} onNodeWheel={handleWheel}></Node>
    //       <Node
    //         meta_data={{
    //           x: 150,
    //           y: 0,
    //           width: 50,
    //           height: 50
    //         }}
    //         onNodeWheel={handleWheel}
    //       ></Node>
    //     </div>
    //   </div>
    // )
  }
}

export { Board }
