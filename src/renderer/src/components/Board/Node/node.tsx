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
export enum NodeControlState {
  Idle,
  Dragging,
  Animation,
  Editing
}

interface point {
  x: number
  y: number
}

const edg_width = 12
const edg_inner_width = 5
import styles from './styles.module.scss'
type resize_dir_handle_name = 'n' | 's' | 'w' | 'e' | 'nw' | 'ne' | 'se' | 'sw' | ''
import { Board } from '@renderer/components/Board/board'
import { Line } from '../Line/line'
import { rect } from '../utils'
// 钉子，钉在Node上。也可以理解为Node上的Line插槽
class Nail {
  node: Node | null = null
  constructor(n: Node) {
    this.node = n
  }
  NailState: {
    lines: { [key: string]: Line }
  } = { lines: {} }
  position: point = { x: 0, y: 0 }
  el = document.createElement('div')

  get_geo() {
    return this.el.getBoundingClientRect()
  }
  get_client_pos() {
    const geo = this.get_geo()
    return {
      x: geo.x + geo.width / 2,
      y: geo.y + geo.height / 2
    }
  }
  // 移动线
  transfromLine() {
    // console.log(this.NailState.lines)
    for (const i in this.NailState.lines) {
      const line = this.NailState.lines[i]
      line.update_from_nail(this)
    }
  }
  render() {
    this.el.classList.add(styles['nail-container'])
    // nail事件
    this.el.onpointerdown = (event: PointerEvent) => {
      //   event.stopImmediatePropagation()
      event.stopPropagation()
      this.el.setPointerCapture(event.pointerId)
      const board = this.node?.board as Board
      const active_line = board.BoardState.active_line
      if (active_line) {
        // 如果正在编辑line，说明这个nail是尾巴
        this.NailState.lines[active_line.id] = active_line
        const nail_from = active_line.LineState.nail_from as Nail
        nail_from.NailState.lines[active_line.id] = active_line
        active_line.LineState.nail_to = this
        active_line.line.style.pointerEvents = 'all'
        board.deactive_line()
      } else {
        // 否则，创建一个连接
        const l = new Line(this)
        // debug测试，从点中的nail创建svg
        // 记录元数据
        l.LineState.nail_from = this
        // this.NailState.lines.push(l) // 不要着急加入，后期再加入
        l.update({
          x: event.clientX,
          y: event.clientY
        })
        board.origin.appendChild(l.render())
        board.active_line(l) // 画板接入活动line
      }
    }
    return this.el
  }
}

class Node {
  id: string = ''
  board: Board | null = null
  NodeState: {
    state: NodeControlState
    width: number
    height: number
    begin_inner_position: {
      x: number
      y: number
    }
    _x: number
    _y: number
    x: number
    y: number
    resizing_handle: resize_dir_handle_name
    begin_geometry: {
      ne: point
      nw: point
      se: point
      sw: point
    }
    nails: {
      e: Nail | null
      w: Nail | null
      s: Nail | null
      n: Nail | null
    }
  } = {
    state: NodeControlState.Idle,
    width: 150,
    height: 100,
    x: 0,
    y: 0,
    _x: 0,
    _y: 0,
    begin_inner_position: {
      x: 0,
      y: 0
    },
    resizing_handle: '',
    begin_geometry: {
      ne: { x: 0, y: 0 },
      nw: { x: 0, y: 0 },
      se: { x: 0, y: 0 },
      sw: { x: 0, y: 0 }
    },
    nails: { e: null, w: null, s: null, n: null }
  }

  private click_count: number = 0
  private click_timeout: number | null = null
  private resetClicks = () => {
    this.click_count = 0
    if (this.click_timeout) {
      clearTimeout(this.click_timeout)
      this.click_timeout = null
    }
  }
  constructor(b: Board) {
    this.board = b
  }
  // 应用变换到渲染
  transformNode() {
    this.node_container.style.width = `${this.NodeState.width}px`
    this.node_container.style.height = `${this.NodeState.height}px`
    this.node_container.style.top = `${this.NodeState.y}px`
    this.node_container.style.left = `${this.NodeState.x}px`
  }
  transfromLine() {
    for (const key in this.NodeState.nails) {
      const n = this.NodeState.nails[key] as Nail
      n.transfromLine()
    }
  }
  get_rectangle(): rect {
    const geo = this.node_container.getBoundingClientRect()
    return {
      nw: {
        x: geo.x,
        y: geo.y
      },
      se: {
        x: geo.x + geo.width,
        y: geo.y + geo.height
      }
    }
  }
  node_container = document.createElement('div')
  content_p = document.createElement('p') // 双击container，可以切换到editing状态，阻止拖拽事件。但是双击这个东西，无法正常组织
  node_edges = {
    n: document.createElement('div'),
    w: document.createElement('div'),
    s: document.createElement('div'),
    e: document.createElement('div'),
    ne: document.createElement('div'),
    sw: document.createElement('div'),
    se: document.createElement('div'),
    nw: document.createElement('div')
  }

  set_selected_style() {
    this.node_container.classList.remove(styles['selected-main'])
    this.node_container.classList.add(styles['selected'])
  }
  set_selected_main_style() {
    this.node_container.classList.remove(styles['selected'])
    this.node_container.classList.add(styles['selected-main'])
  }
  deselected() {
    this.node_container.classList.remove(styles['selected'])
    this.node_container.classList.remove(styles['selected-main'])
  }

  render() {
    // 创建element

    // 类名
    this.node_container.classList.add(styles['node-container'])

    const resize_mapping = {
      w: (event: PointerEvent) => {
        const client_origin = this.board?.get_origin_client_position() as point
        const scale = this.board?.BoardState.scale as number
        this.NodeState.x = (event.clientX - client_origin.x) / scale
        this.NodeState.width = (-event.clientX + this.NodeState.begin_geometry.se.x) / scale
      },
      n: (event: PointerEvent) => {
        const client_origin = this.board?.get_origin_client_position() as point
        const scale = this.board?.BoardState.scale as number
        this.NodeState.y = (event.clientY - client_origin.y) / scale
        this.NodeState.height = (-event.clientY + this.NodeState.begin_geometry.se.y) / scale
      },
      e: (event: PointerEvent) => {
        const scale = this.board?.BoardState.scale as number
        this.NodeState.width = (event.clientX - this.NodeState.begin_geometry.nw.x) / scale
      },
      s: (event: PointerEvent) => {
        const scale = this.board?.BoardState.scale as number
        this.NodeState.height = (event.clientY - this.NodeState.begin_geometry.nw.y) / scale
      }
    }

    // 根据一个键，获取nail
    const get_nail: (key: string) => Nail = (key: string) => {
      for (const e in this.NodeState.nails) {
        if (key.includes(e)) {
          return this.NodeState.nails[e]
        }
      }
      console.warn('node edg:get nail fail')
      return this.NodeState.nails.e
    }

    // node 边缘组件
    for (const e in this.node_edges) {
      const el = this.node_edges[e] as HTMLElement

      el.classList.add(styles['node-edge'])

      el.onpointerdown = (event: PointerEvent) => {
        event.stopImmediatePropagation()
        event.stopPropagation()
        el.setPointerCapture(event.pointerId)
        // 如果此时board有activeline，这个点击事件就是连接line而不是为了resize。
        // 这里做一个事件分发
        const active_line = this.board?.BoardState.active_line
        if (active_line) {
          // line 已连接
          const to_nail = get_nail(e)
          const from_nail = active_line.LineState.nail_from as Nail
          from_nail.NailState.lines[active_line.id] = active_line
          active_line.LineState.nail_to = to_nail
          to_nail.NailState.lines[active_line.id] = active_line
          active_line.line.style.pointerEvents = 'all'
          this.board?.deactive_line()
        } else {
          this.NodeState.resizing_handle = e as resize_dir_handle_name
          // 计算四个点的client初始坐标
          const geo = this.node_container.getBoundingClientRect()
          this.NodeState.begin_geometry.nw = { x: geo.x, y: geo.y }
          this.NodeState.begin_geometry.ne = { x: geo.x + geo.width, y: geo.y }
          this.NodeState.begin_geometry.sw = { x: geo.x, y: geo.y + geo.height }
          this.NodeState.begin_geometry.se = { x: geo.x + geo.width, y: geo.y + geo.height }
        }
      }
      el.onpointerup = () => {
        this.NodeState.resizing_handle = ''
      }
      el.onpointerleave = () => {
        this.NodeState.resizing_handle = ''
      }

      // enter 捕捉到 nail
      el.onpointerenter = (event: PointerEvent) => {
        const line = this.board?.BoardState.active_line
        if (line) {
          const from_nail = line.LineState.nail_from as Nail
          const to_nail = get_nail(e)
          line.link(from_nail.get_client_pos(), to_nail.get_client_pos())
        }
      }
      el.onpointermove = (event: PointerEvent) => {
        event.stopPropagation()
        if (this.NodeState.resizing_handle) {
          for (const n in resize_mapping) {
            if (this.NodeState.resizing_handle.includes(n)) {
              resize_mapping[n](event)
            }
          }
          this.transformNode()
          this.transfromLine()
        }
      }
    }

    // north
    this.node_edges.n.style.height = `${edg_width}px`
    this.node_edges.n.style.top = `${edg_inner_width - edg_width}px`
    this.node_edges.n.style.cursor = `n-resize`
    // west
    this.node_edges.w.style.width = `${edg_width}px`
    this.node_edges.w.style.left = `${edg_inner_width - edg_width}px`
    this.node_edges.w.style.cursor = `w-resize`
    // south
    this.node_edges.s.style.height = `${edg_width}px`
    this.node_edges.s.style.bottom = `${edg_inner_width - edg_width}px`
    this.node_edges.s.style.cursor = `s-resize`
    // east
    this.node_edges.e.style.width = `${edg_width}px`
    this.node_edges.e.style.right = `${edg_inner_width - edg_width}px`
    this.node_edges.e.style.cursor = `e-resize`

    // north-west
    this.node_edges.nw.style.width = `${edg_width}px`
    this.node_edges.nw.style.height = `${edg_width}px`
    this.node_edges.nw.style.top = `${edg_inner_width - edg_width}px`
    this.node_edges.nw.style.left = `${edg_inner_width - edg_width}px`
    this.node_edges.nw.style.cursor = `nw-resize`
    // north-east
    this.node_edges.ne.style.width = `${edg_width}px`
    this.node_edges.ne.style.height = `${edg_width}px`
    this.node_edges.ne.style.top = `${edg_inner_width - edg_width}px`
    this.node_edges.ne.style.right = `${edg_inner_width - edg_width}px`
    this.node_edges.ne.style.cursor = `ne-resize`
    // south-east
    this.node_edges.se.style.width = `${edg_width}px`
    this.node_edges.se.style.height = `${edg_width}px`
    this.node_edges.se.style.bottom = `${edg_inner_width - edg_width}px`
    this.node_edges.se.style.right = `${edg_inner_width - edg_width}px`
    this.node_edges.se.style.cursor = `se-resize`
    // south-west
    this.node_edges.sw.style.width = `${edg_width}px`
    this.node_edges.sw.style.height = `${edg_width}px`
    this.node_edges.sw.style.bottom = `${edg_inner_width - edg_width}px`
    this.node_edges.sw.style.left = `${edg_inner_width - edg_width}px`
    this.node_edges.sw.style.cursor = `sw-resize`

    // 默认p标签内容

    this.content_p.classList.add(styles['content-p'])
    this.content_p.contentEditable = 'false'
    this.node_container.appendChild(this.content_p)

    // this.content_p.onpointerdown = (event: PointerEvent) => {
    //   event.stopPropagation()
    // }

    const handlePointerDown = (event: PointerEvent) => {
      event.stopPropagation()
      if (this.NodeState.state === NodeControlState.Editing) return
      // 拖拽开始
      this.NodeState.state = NodeControlState.Dragging
      // const target = event.currentTarget as HTMLElement
      this.node_container.setPointerCapture(event.pointerId)
      // 计算开始坐标，相对于左上角。
      const geo = this.node_container.getBoundingClientRect()
      this.NodeState.begin_inner_position = {
        x: event.clientX - geo.x,
        y: event.clientY - geo.y
      }

      // 如果100ms之后，move的曼哈顿距离不足5pixel，判定为选择，而不是拖拽
      const tolerence = 0
      const timer = setInterval(() => {
        const dis =
          Math.abs(this.NodeState._x - this.NodeState.x) +
          Math.abs(this.NodeState._y - this.NodeState.y)
        if (dis <= tolerence) {
          // this.node_container.classList.toggle(styles['selected'])
          this.board?.handle_select(this, event)
        }
        clearInterval(timer)
      }, 100)

      // 单击事件判定
      this.click_count++
      if (this.click_count === 1) {
        this.click_timeout = window.setTimeout(() => {
          if (this.click_count === 1) {
            // 这是单击事件
          }
          this.resetClicks()
        }, 300)
      } else if (this.click_count === 2) {
        this.resetClicks()
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      event.stopPropagation()
      if (this.NodeState.state === NodeControlState.Editing) return
      if (!this.board) {
        console.error('Node !board', this.board)
        return
      }
      if (this.NodeState.state === NodeControlState.Dragging) {
        const board_geo = this.board.get_geometry()
        const board_scale = this.board.BoardState.scale
        const origin_center = {
          x: board_geo.x + board_geo.width / 2 + this.board.BoardState.translate.x,
          y: board_geo.y + board_geo.height / 2 + this.board.BoardState.translate.y
        }
        const last_x = this.NodeState.x
        const last_y = this.NodeState.y
        this.NodeState.x =
          (-this.NodeState.begin_inner_position.x + event.clientX - origin_center.x) / board_scale
        this.NodeState.y =
          (-this.NodeState.begin_inner_position.y + event.clientY - origin_center.y) / board_scale
        const delta_x = this.NodeState.x - last_x
        const delta_y = this.NodeState.y - last_y

        // 选中的node一起移动
        if (this.board.SelectedNodeList[this.id]) {
          for (const id in this.board.SelectedNodeList) {
            if (id === this.id) continue
            const node = this.board.SelectedNodeList[id]
            // delta 应用到其他选中的node上
            node.NodeState.x += delta_x
            node.NodeState.y += delta_y
            node.transformNode()
            node.transfromLine()
          }
        }

        this.transformNode()
        this.transfromLine()
      }
    }
    const handlePointerLeave = (event: PointerEvent) => {
      event.stopPropagation()
      this.NodeState.state = NodeControlState.Idle
      this.NodeState._x = this.NodeState.x
      this.NodeState._y = this.NodeState.y
    }
    const handlePointerUp = (event: PointerEvent) => {
      event.stopPropagation()
      if (this.NodeState.state === NodeControlState.Editing) return // 这个太几把坑爹了，
      // pointerdown -> dbclick -> pointerup 又将state改回idle了。吗的
      this.NodeState.state = NodeControlState.Idle

      this.NodeState._x = this.NodeState.x
      this.NodeState._y = this.NodeState.y
    }

    const handledbclick = (event: MouseEvent) => {
      if (this.click_timeout) {
        clearTimeout(this.click_timeout)
        this.click_timeout = null
      }
      this.resetClicks()

      this.board?.set_editing_node(this) // 白板控制当前编辑节点
      this.NodeState.state = NodeControlState.Editing
      console.log('editing', this, this.NodeState.state, NodeControlState.Editing)
    }
    // node_container.onwheel = this.board.
    this.node_container.onpointerdown = handlePointerDown
    this.node_container.onpointermove = handlePointerMove
    this.node_container.onpointerleave = handlePointerLeave
    this.node_container.onpointerup = handlePointerUp
    this.node_container.ondblclick = handledbclick

    for (const e in this.node_edges) {
      const node_edg = this.node_edges[e] as HTMLDivElement
      this.node_container.appendChild(node_edg)
    }

    // 默认钉子
    const nail_e = new Nail(this)
    const nail_w = new Nail(this)
    const nail_n = new Nail(this)
    const nail_s = new Nail(this)
    this.node_edges.e.appendChild(nail_e.render())
    this.node_edges.w.appendChild(nail_w.render())
    this.node_edges.n.appendChild(nail_n.render())
    this.node_edges.s.appendChild(nail_s.render())
    this.NodeState.nails.e = nail_e
    this.NodeState.nails.w = nail_w
    this.NodeState.nails.n = nail_n
    this.NodeState.nails.s = nail_s

    // 返回node
    return this.node_container
  }
}

export { Node, default_meta_data, Nail }
