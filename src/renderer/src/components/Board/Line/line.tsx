import { Board } from '../board'
import styles from './styles.module.scss'
import { Nail } from '../Node/node'
import { sort_point } from '../utils'
type LineType = 'One-Way' | 'Tow-Way'
interface point {
  x: number
  y: number
}
const svg_padding = 100 // svg的边缘
const MARKER_ID = 'board-line-arrow'
class Line {
  id: string = ''
  LineState: {
    nail_from: Nail | null
    nail_to: Nail | null
    type: LineType // 类型
    width: number
    height: number
    x: number
    y: number
    p1: point
    p2: point
    line_fill: string
  } = {
    nail_from: null,
    nail_to: null,
    type: 'One-Way',
    width: 200,
    height: 200,
    x: 0,
    y: 0,
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    line_fill: '#999'
  }
  svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  shadow_line = document.createElementNS('http://www.w3.org/2000/svg', 'line')

  constructor(n: Nail) {
    this.LineState.nail_from = n
    this.id = 'line_' + crypto.randomUUID()

    // 创建 marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const arrow_marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
    const triangle_path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    arrow_marker.setAttribute('id', MARKER_ID)
    arrow_marker.setAttribute('viewBox', '0 0 10 10')
    arrow_marker.setAttribute('refX', '0')
    arrow_marker.setAttribute('refY', '5')
    arrow_marker.setAttribute('markerWidth', '4')
    arrow_marker.setAttribute('markerHeight', '4')
    arrow_marker.setAttribute('orient', 'auto-start-reverse')
    triangle_path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
    triangle_path.setAttribute('fill', this.LineState.line_fill)
    arrow_marker.appendChild(triangle_path)
    defs.appendChild(arrow_marker)
    this.svg.appendChild(defs)
  }
  transfromLine() {
    const board = this.LineState.nail_from?.node?.board as Board
    const scale = board.BoardState.scale || 1
    this.svg.style.top = `${this.LineState.y}px`
    this.svg.style.left = `${this.LineState.x}px`
    this.svg.setAttribute('width', `${this.LineState.width}`)
    this.svg.setAttribute('height', `${this.LineState.height}`)
    this.line.setAttribute('x1', `${(this.LineState.p1.x + svg_padding) / scale}`)
    this.line.setAttribute('y1', `${(this.LineState.p1.y + svg_padding) / scale}`)
    this.line.setAttribute('x2', `${(this.LineState.p2.x + svg_padding) / scale}`)
    this.line.setAttribute('y2', `${(this.LineState.p2.y + svg_padding) / scale}`)
    this.shadow_line.setAttribute('x1', `${(this.LineState.p1.x + svg_padding) / scale}`)
    this.shadow_line.setAttribute('y1', `${(this.LineState.p1.y + svg_padding) / scale}`)
    this.shadow_line.setAttribute('x2', `${(this.LineState.p2.x + svg_padding) / scale}`)
    this.shadow_line.setAttribute('y2', `${(this.LineState.p2.y + svg_padding) / scale}`)
  }
  // 链接，传入两个client position
  link(from_pos: point, to_pos: point) {
    const board = this.LineState.nail_from?.node?.board as Board
    const scale = board.BoardState.scale || 1
    // 首先，这两个点不一定是左上 - 右下。先拆散：
    const { nw, se } = sort_point(from_pos, to_pos)
    // 根据 nw-se 将 svg 的矩形渲染出来
    const pos = board.mouse_client_pos_to_absolute_pos({
      x: nw.x - svg_padding,
      y: nw.y - svg_padding
    })
    ;((this.LineState.x = pos.x), (this.LineState.y = pos.y))

    const size = {
      x: (se.x - nw.x + 2 * svg_padding) / scale,
      y: (se.y - nw.y + 2 * svg_padding) / scale
    }
    ;((this.LineState.width = size.x), (this.LineState.height = size.y))

    // 画线
    // 先计算 client 坐标系 svg左上角 -> 点 的向量
    // 除一个scale即可
    const p1 = {
      x: from_pos.x - nw.x,
      y: from_pos.y - nw.y
    }
    const p2 = {
      x: to_pos.x - nw.x,
      y: to_pos.y - nw.y
    }
    const dir = {
      x: p2.x - p1.x,
      y: p2.y - p1.y
    }
    const dir_len = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
    if (dir_len > 1e-5) {
      dir.x = (dir.x / dir_len) * 25
      dir.y = (dir.y / dir_len) * 25
      this.LineState.p2 = {
        x: p2.x - dir.x,
        y: p2.y - dir.y
      }
    } else {
      this.LineState.p2 = p2
    }

    // 躲开箭头的距离，这里需要回避一下
    this.LineState.p1 = p1

    this.transfromLine()
  }

  // 只可能 update line 的两端.
  // 通过nail update，用于拖拽，resize node时通过node的nail调用
  update_from_nail(n: Nail) {
    if (n === this.LineState.nail_from) {
      // 另一个点是to
      const static_nail = this.LineState.nail_to as Nail
      this.link(n.get_client_pos(), static_nail.get_client_pos())
    } else if (n === this.LineState.nail_to) {
      // 另一个点是from
      const static_nail = this.LineState.nail_from as Nail
      this.link(static_nail.get_client_pos(), n.get_client_pos())
    } else {
      console.warn('line unknow activa_nail', this.LineState)
    }
  }
  // 用于创建新的 line，跟随鼠标移动
  update(m_pos: point) {
    const static_nail = this.LineState.nail_from as Nail
    this.link(static_nail.get_client_pos(), m_pos)
  }

  render() {
    this.svg.setAttribute('width', '200')
    this.svg.setAttribute('height', '200')
    this.svg.classList.add(styles['line-svg-container'])
    this.line.classList.add(styles['line'])
    this.shadow_line.classList.add(styles['shadow-line'])
    // 创建线条
    this.line.setAttribute('x1', '0')
    this.line.setAttribute('y1', '0')
    this.line.setAttribute('x2', '0')
    this.line.setAttribute('y2', '0')
    this.line.setAttribute('stroke-linecap', 'round')
    this.line.setAttribute('stroke', this.LineState.line_fill)
    this.line.setAttribute('stroke-width', '4')

    this.svg.appendChild(this.shadow_line)
    this.svg.appendChild(this.line)

    this.line.onpointerenter = () => {
      this.shadow_line.setAttribute('stroke-width', '10')
    }
    this.line.onpointerleave = () => {
      this.shadow_line.setAttribute('stroke-width', '3')
    }
    this.line.onpointerdown = (event: PointerEvent) => {
      if (event.altKey) {
        // 删除线
        const board = this.LineState.nail_from?.node?.board as Board
        board.origin.removeChild(this.svg)
        delete this.LineState.nail_from?.NailState.lines[this.id]
        delete this.LineState.nail_to?.NailState.lines[this.id]
      }
    }

    if (this.LineState.type === 'One-Way') {
      this.line.setAttribute('marker-end', `url(#${MARKER_ID})`)
    }
    // 线条的mousemove
    return this.svg
  }
}

export { Line }
