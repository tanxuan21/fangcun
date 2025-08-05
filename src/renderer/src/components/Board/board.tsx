import { useState, useRef, useEffect } from 'react'
import React from 'react'
import styles from './styles.module.scss'

import { default_meta_data, Node, NodeControlState } from './Node/node'
import { Line } from './Line/line'
import { rect, rectangle_intersection, sort_point } from './utils'
import { PieMenu } from '../PieMenu/piemenu'
function Box({
  x = 0,
  y = 0,
  onBoxWheel
}: {
  x?: number
  y?: number
  onBoxWheel: (event: React.WheelEvent) => void
}) {
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
  Idle,
  Dragging,
  EditingLine,
  // EditingNode, // 编辑节点，也禁用拖拽。比如我要拖选节点文字这种操作
  Selecting,
  Animating
}

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
    drag_begin_position: point
    select_begin_postion: point
    wheel_value: number
    active_line: Line | null // 活动的line
  } = {
    scale: 1,
    translate: {
      x: 0,
      y: 0
    },
    translating: { x: 0, y: 0 },
    state: BoardControlState.Idle,
    drag_begin_position: { x: 0, y: 0 },
    select_begin_postion: { x: 0, y: 0 },
    wheel_value: 0,
    active_line: null
  }
  mounted_element: HTMLElement | null = null
  _selectingRafId: number | null = 0
  container = document.createElement('div') // 容器
  axes_canvas = document.createElement('canvas') // 坐标系canvas
  //   interaction_layer = document.createElement('div') // 交互层，用于绑定所有事件
  interaction_layer = this.container
  origin = document.createElement('div') // 原点，用于容纳一切画板元素
  widget_view = document.createElementNS('http://www.w3.org/2000/svg', 'svg') // 组件视图，渲染小组件，例如框选遮罩
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

  pie_menu = new PieMenu()

  NodeList: { [key: string]: Node } = {}
  SelectedNodeList: { [key: string]: Node } = {} // 选中的节点
  SelectedMainNode: Node | null = null
  EditingNode: Node | null = null
  // 清空集合
  deselectd_all = () => {
    for (const id in this.SelectedNodeList) {
      const _node = this.SelectedNodeList[id]
      _node.deselected()
    }
    this.SelectedNodeList = {}
    this.SelectedMainNode = null
  }

  set_editing_node(n: Node) {
    if (this.EditingNode) {
      this.EditingNode.content_p.contentEditable = 'false'
      this.EditingNode.content_p.style.pointerEvents = 'none'
    }
    this.EditingNode = n
    this.EditingNode.content_p.contentEditable = 'true'
    this.EditingNode.content_p.style.pointerEvents = 'all'
    this.EditingNode.content_p.focus()
    this.EditingNode.NodeState.state = NodeControlState.Editing
  }
  clear_editing_node() {
    if (this.EditingNode) {
      this.EditingNode.content_p.blur()
      this.EditingNode.content_p.contentEditable = 'false'
      this.EditingNode.content_p.style.pointerEvents = 'none' // 否则，单机p标签就会进入编辑模式，我的拦截就是笑话
      this.EditingNode.NodeState.state = NodeControlState.Idle

      this.EditingNode.deselected()
      // 删除
      if (this.SelectedMainNode === this.EditingNode) {
        this.SelectedMainNode = null
      }
      if (this.SelectedNodeList[this.EditingNode.id]) {
        delete this.SelectedNodeList[this.EditingNode.id]
      }
    }
    this.EditingNode = null
    // this.BoardState.state = BoardControlState.Idle
  }
  handle_select(node: Node, event?: PointerEvent) {
    if (!event) {
      this.SelectedMainNode?.set_selected_style()
      this.SelectedNodeList[node.id] = node
      this.SelectedMainNode = node
      node.set_selected_main_style()
      return
    }
    if (event.shiftKey) {
      this.SelectedMainNode?.set_selected_style()
      this.SelectedMainNode = node
      this.SelectedNodeList[node.id] = node
      node.set_selected_main_style()
    } else if (event.ctrlKey) {
      if (!this.SelectedNodeList[node.id]) return
      delete this.SelectedNodeList[node.id]
      node.deselected()
      // 特殊处理删除selected main的情况
      if (this.SelectedMainNode) {
        if (this.SelectedMainNode === node) {
          // 随便找一个让它变为main
          const ids = Object.keys(this.SelectedNodeList)
          if (ids.length) {
            // 防止减选为空了
            const id = ids[ids.length - 1]
            const n = this.SelectedNodeList[id]
            n.set_selected_main_style()
            this.SelectedMainNode = n
          } else {
            this.SelectedMainNode = null
          }
        }
      } else {
        console.warn('board:handle select !selectedmainnode')
      }
    } else {
      this.deselectd_all()
      this.SelectedNodeList[node.id] = node
      this.SelectedMainNode = node
      node.set_selected_main_style()
    }
    // console.log(this.SelectedMainNode, this.SelectedNodeList)
  }
  unit_pixel = 50 // 规定画布单位像素位50
  draw_unit_pixel = this.unit_pixel // 绘制的单位像素尺寸，离散的
  get_geometry() {
    return this.container.getBoundingClientRect()
  }
  get_origin_client_position() {
    const geo = this.get_geometry()
    return {
      x: geo.x + geo.width / 2 + this.BoardState.translate.x,
      y: geo.y + geo.height / 2 + this.BoardState.translate.y
    }
  }
  // 鼠标client 位置->绝对定位
  mouse_client_pos_to_absolute_pos(m_pos: point) {
    const origin = this.get_origin_client_position()
    return {
      x: (m_pos.x - origin.x) / this.BoardState.scale,
      y: (m_pos.y - origin.y) / this.BoardState.scale
    }
  }
  // 激活line
  active_line(l: Line) {
    this.BoardState.active_line = l
    this.BoardState.state = BoardControlState.EditingLine
    // this.interaction_layer.style.zIndex = `${10}`
  }
  // 取消激活line
  deactive_line() {
    this.BoardState.active_line = null
    this.BoardState.state = BoardControlState.Idle
    // this.interaction_layer.style.zIndex = ''
  }

  createNodes() {
    for (let i = 0; i < 5; i++) {
      const n = new Node(this)
      n.id = crypto.randomUUID()
      n.NodeState.x = Math.random() * 300 - 150
      n.NodeState.y = Math.random() * 300 - 150
      n.transformNode()
      this.NodeList[n.id] = n
      this.origin.appendChild(n.render())
    }
  }

  // 从文件导入
  import() {}
  // 导出为json
  export() {}
  // 挂载
  mount(element: HTMLElement) {
    element.innerHTML = '' // 防止重复挂载
    element.appendChild(this.render())

    window.addEventListener('resize', this.resize)

    this.resize()
    this.render_axes_canvas()
  }
  // 清理，绑定的事件之类的... ...
  unmount() {
    window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    const dpi = window.devicePixelRatio || 1
    const geo = this.get_geometry()
    this.axes_canvas.width = geo.width * dpi
    this.axes_canvas.height = geo.height * dpi

    this.render_axes_canvas()
  }
  render_axes_canvas() {
    const ctx = this.axes_canvas.getContext('2d')
    if (!ctx) {
      console.error(ctx, 'board axes_canvas !ctx')
      return
    }
    ctx.clearRect(0, 0, this.axes_canvas.width, this.axes_canvas.height)
    const geo = this.get_geometry()
    const dpi = window.devicePixelRatio || 1
    const unit_size = this.draw_unit_pixel * this.BoardState.scale // 连续的unit_size

    if (unit_size < this.unit_pixel / 2) {
      // 太小，放大
      this.draw_unit_pixel *= 2
    } else if (unit_size > this.unit_pixel * 2) {
      // 太大，缩小
      this.draw_unit_pixel /= 2
    }

    ctx.beginPath()

    // 设置一次样式
    ctx.fillStyle = '#ddd'

    const draw_row = (y: number) => {
      const x_origin = geo.width / 2 + this.BoardState.translating.x
      let x = x_origin
      // 向右
      while (x < geo.width) {
        if (x > 0) {
          ctx.moveTo(x * dpi + 4, y * dpi)
          ctx.arc(x * dpi, y * dpi, 4, 0, Math.PI * 2)
        }
        x += unit_size
      }
      // 向左
      while (x > 0) {
        if (x < geo.width) {
          ctx.moveTo(x * dpi + 4, y * dpi)
          ctx.arc(x * dpi, y * dpi, 4, 0, Math.PI * 2)
        }
        x -= unit_size
      }
    }
    const draw_axes = () => {
      const y_origin = geo.height / 2 + this.BoardState.translating.y
      let y = y_origin
      while (y > 0) {
        // 向上
        if (y < geo.height) {
          draw_row(y)
        }
        y -= unit_size
      }
      while (y < geo.height) {
        //向下
        if (y > 0) {
          draw_row(y)
        }
        y += unit_size
      }
    }

    draw_axes()
    // 一次性填充所有圆点
    ctx.fill()

    ctx.moveTo(0, 0)
    ctx.arc(
      dpi * (geo.width / 2 + this.BoardState.translating.x),
      dpi * (geo.height / 2 + this.BoardState.translating.y),
      9,
      0,
      Math.PI * 2
    )
    // ctx.fillStyle = '#f00'
    ctx.fill()
  }

  update_select_mask(m_pos: point) {
    // 先要排序。对鼠标位置和 pointerdown 保存的初始位置
    // 然后计算出来 x,y,width,height
    const selector_rectangle = sort_point(m_pos, this.BoardState.select_begin_postion)
    this.rect.setAttribute('x', `${selector_rectangle.nw.x}`)
    this.rect.setAttribute('y', `${selector_rectangle.nw.y}`)
    this.rect.setAttribute('width', `${selector_rectangle.se.x - selector_rectangle.nw.x}`)
    this.rect.setAttribute('height', `${selector_rectangle.se.y - selector_rectangle.nw.y}`)
    return selector_rectangle
  }
  render(): HTMLElement {
    // 容器
    // const containerRef = useRef<HTMLDivElement | null>(null)
    // 创建基础元素

    // 类样式
    this.container.classList.add(styles['container'])
    this.axes_canvas.classList.add(styles['axes-canvas'])
    this.interaction_layer.classList.add(styles['event-layer'])
    this.origin.classList.add(styles['origin'])
    this.widget_view.classList.add(styles['widget-view'])
    this.rect.classList.add(styles['select-mask'])

    // 层级关系
    this.container.appendChild(this.axes_canvas)
    this.container.appendChild(this.origin)
    this.container.appendChild(this.widget_view)

    // 创建半透明带边框的矩形

    this.rect.setAttribute('x', '50')
    this.rect.setAttribute('y', '50')
    this.rect.setAttribute('width', '100')
    this.rect.setAttribute('height', '100')
    this.rect.setAttribute('fill', 'rgba(29, 101, 255, 0.2)') // 半透明填充
    this.rect.setAttribute('stroke', '#007af4ff') // 边框颜色
    this.rect.setAttribute('stroke-dasharray', '5,4') // 5px实线，3px间隙
    this.rect.setAttribute('stroke-width', '2') // 边框宽度
    // this.rect.setAttribute('rx', '5') // 可选：圆角半径
    // this.rect.setAttribute('ry', '5') // 可选：圆角半径

    this.widget_view.appendChild(this.rect)

    let last_time = 0
    this.widget_view.onpointermove = (event: PointerEvent) => {
      event.stopPropagation()
      if (this.BoardState.state === BoardControlState.Selecting) {
        const selector_rectangle = this.update_select_mask({
          x: event.clientX,
          y: event.clientY
        })

        const now = performance.now()
        const selecting = () => {
          // 设置选择
          for (const id in this.NodeList) {
            // 这个顺序是根据nodelist里来的，而不是画布上的选中顺序。这个细节先放下。
            const node = this.NodeList[id]
            const node_rectangle = node.get_rectangle()
            if (rectangle_intersection(node_rectangle, selector_rectangle)) {
              this.handle_select(node) // 无鼠标事件的选择
            } else {
              node.deselected()
              if (this.SelectedNodeList[node.id]) {
                // 删掉未选中的node
                delete this.SelectedNodeList[node.id]
              }
            }
          }
        }
        if (now - last_time >= 30) {
          last_time = now
          selecting()
        }
      }
    }
    // this.container.appendChild(this.interaction_layer)

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
      this.origin.style.scale = `${this.BoardState.scale}`
      this.origin.style.translate = `${this.BoardState.translating.x}px ${this.BoardState.translating.y}px`
      this.render_axes_canvas()
    }

    // 事件交互
    const handlePointerDown = (event: MouseEvent) => {
      const pos = {
        x: event.clientX,
        y: event.clientY
      }
      if (BoardControlState.Animating === this.BoardState.state) return // 动画中事件禁用
      if (BoardControlState.EditingLine === this.BoardState.state) return // 连线，事件禁用
      if (event.metaKey || event.ctrlKey) {
        this.BoardState.state = BoardControlState.Selecting
        this.BoardState.select_begin_postion = pos
        this.rect.style.display = 'block'
        this.update_select_mask(pos)
        this.widget_view.style.zIndex = '50' // 暂时提升
        this.widget_view.style.pointerEvents = 'all'
        return
      }
      this.BoardState.drag_begin_position = pos
      set_state(BoardControlState.Dragging)
      // 不必区分的撤销操作，菜单隐藏，退出编辑等等
      this.clear_editing_node()
      if (event.button !== 2) this.pie_menu.hide_menu()
      // 区分点击/拖拽
      const timer = setInterval(() => {
        const dis =
          Math.abs(this.BoardState.translate.x - this.BoardState.translating.x) +
          Math.abs(this.BoardState.translate.y - this.BoardState.translating.y)
        if (dis <= 0) {
          // 撤销所有的当前活动任务
          this.deselectd_all()
        }
        clearInterval(timer)
      }, 80)
    }

    const handlePointerMove = (event: MouseEvent) => {
      const pos = {
        x: event.clientX,
        y: event.clientY
      }
      if (this.BoardState.state === BoardControlState.Dragging) {
        set_translate({
          x: pos.x - this.BoardState.drag_begin_position.x + this.BoardState.translate.x, // 使用保存的初始平移值
          y: pos.y - this.BoardState.drag_begin_position.y + this.BoardState.translate.y
        })
        transfromBoard()
      } else if (this.BoardState.state === BoardControlState.EditingLine) {
        const line = this.BoardState.active_line
        if (!line) {
          console.error('board !active line')
          return
        }
        // 移动线
        line.update({
          x: event.clientX,
          y: event.clientY
        })
      }
    }

    // up 只针对 dragging，别的事件不要去管
    const handlePointerUp = () => {
      if (this.BoardState.state === BoardControlState.Dragging) {
        set_state(BoardControlState.Idle)
        this.BoardState.translate = this.BoardState.translating
      }
      this.rect.style.display = 'none'
      this.widget_view.style.zIndex = ''
      this.widget_view.style.pointerEvents = 'none'

      //   console.log(this.SelectedMainNode, this.SelectedNodeList)
    }

    // 如果是leave，所有事件都要终止
    const handlePointerLeave = () => {
      if (this.BoardState.active_line) {
        this.origin.removeChild(this.BoardState.active_line.svg) // 有激活的line，就要移除
      }
      this.deactive_line()
      set_state(BoardControlState.Idle)
      this.BoardState.translate = this.BoardState.translating
      this.rect.style.display = 'none'
      this.widget_view.style.zIndex = ''
      this.widget_view.style.pointerEvents = 'none'
    }
    const handleWheel = (event: WheelEvent) => {
      this.BoardState.wheel_value += event.deltaY * 1e-3
      const last_scale = this.BoardState.scale
      const new_scale = mapping_wheel(this.BoardState.wheel_value)

      this.BoardState.scale = new_scale
      // 同时，要偏移。营造一种假象，似乎缩放中心在鼠标

      // 计算向量
      // 计算container的中心位置在client坐标系的位置
      // 获取鼠标位置
      if (this.interaction_layer) {
        const container_geo = this.interaction_layer.getBoundingClientRect()
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
        console.warn('Board containerRef is null')
      }
      this.render_axes_canvas()
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.stopPropagation()

      if (this.BoardState.active_line) {
        this.origin.removeChild(this.BoardState.active_line.svg) // 有激活的line，就要移除
      }
      this.deactive_line() // 右键取消。
    }
    this.interaction_layer.addEventListener('wheel', handleWheel)
    this.interaction_layer.onpointerdown = handlePointerDown
    this.interaction_layer.onpointermove = handlePointerMove
    this.interaction_layer.onpointerup = handlePointerUp
    this.interaction_layer.onpointerleave = handlePointerLeave
    this.interaction_layer.oncontextmenu = handleContextMenu

    // 菜单
    this.pie_menu.mount(this.container)

    return this.container
  }
}

export { Board }
