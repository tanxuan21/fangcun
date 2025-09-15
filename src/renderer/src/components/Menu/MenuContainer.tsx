// import { MenuContext } from './MenuContent'
import { ReactNode, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './menu-styles.module.scss'
import { getOpenMenuId, subscribe, useMenu } from './MenuContent'
type MenuTriggerType = 'Hover' | 'Click' | 'ContextMenu'
interface props {
  id: string
  trigger?: MenuTriggerType[]
  ui: ReactNode
  children: ReactNode
  className?: string
  onMenuHide?: () => void // 菜单隐藏，这个是当隐藏动画开始时
  onMenuUnMount?: () => void // 隐藏动画结束后，菜单dom移除
  onMenuOpen?: () => void // 菜单打开调用，打开动画结束时
  onMenuMount?: () => void // 菜单dom挂载时
  Styles?: React.CSSProperties
}

export const MenuContainer: React.FC<props> = ({
  id,
  trigger = ['ContextMenu'],
  ui,
  children,
  className,
  onMenuHide,
  onMenuUnMount,
  onMenuMount,
  onMenuOpen,
  Styles
}: props) => {
  //   const { openMenuId, setOpenMenuId } = useContext(MenuContext)
  const { openMenuId, setOpenMenuId } = useMenu()
  const [triggerPoint, setTriggerPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const MenuRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  // ====== 绑定触发方式 ======
  const isOpen = openMenuId === id
  const [animating, setAnimation] = useState<boolean>(false)

  const triggerProps: any = {}
  if (trigger.includes('Click')) {
    triggerProps.onClick = (e: React.MouseEvent) => {
      if (animating) return
      e.stopPropagation()
      if (openMenuId === id) {
        setOpenMenuId(null)
      } else {
        setTriggerPoint({ x: e.clientX, y: e.clientY })
        setOpenMenuId(id)
      }
    }
  }
  if (trigger.includes('ContextMenu')) {
    triggerProps.onContextMenu = (e: React.MouseEvent) => {
      if (animating) return
      e.preventDefault()
      setTriggerPoint({ x: e.clientX, y: e.clientY })
      setOpenMenuId(id)
    }
  }
  if (trigger.includes('Hover')) {
    triggerProps.onMouseEnter = (e: React.MouseEvent) => {
      if (animating) return
      if (openMenuId === id) return // 本来就有菜单，不要重复显示菜单。只针对于hover事件
      setTriggerPoint({ x: e.clientX, y: e.clientY })
      setOpenMenuId(id)
    }
    triggerProps.onMouseLeave = () => {
      if (animating) return
      setOpenMenuId(null)
    }
  }

  // ====== 定位：测量并修正溢出 ======
  useLayoutEffect(() => {
    if (visible && MenuRef.current) {
      const rect = MenuRef.current.getBoundingClientRect()
      let left = triggerPoint.x
      let top = triggerPoint.y
      if (left + rect.width > window.innerWidth) {
        left = window.innerWidth - rect.width
      }
      if (top + rect.height > window.innerHeight) {
        top = window.innerHeight - rect.height
      }
      setPosition({ left, top })
    }
  }, [visible, triggerPoint])

  // ====== 点击外部关闭 ======
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (MenuRef.current && !MenuRef.current.contains(e.target as Node)) {
        hideMenu()
      }
    }
    const hideMenu = () => {
      setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    window.addEventListener('resize', hideMenu)
    window.addEventListener('wheel', hideMenu)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('wheel', hideMenu)
      window.removeEventListener('resize', hideMenu)
    }
  }, [isOpen, setOpenMenuId])

  // ====== 控制挂载：isOpen => visible ======
  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      onMenuMount && onMenuMount()
    }
  }, [isOpen])

  // isOpen (true) -> visible (true) -> mount -> show animation
  // isOpen (false) -> hide animation -> transition end -> visible (false) -> unmount
  // ====== 动画：0 -> scrollHeight -> auto ======
  const transition_time = 0.3
  useEffect(() => {
    // 等待渲染页面（menu-container）之后，再做事情
    requestAnimationFrame(() => {
      const el = MenuRef.current
      if (!el) return
      if (visible) {
        // 显示
        // 获取高度
        el.style.height = 'auto'
        el.scrollHeight // 触发浏览器的强制渲染
        const { height } = el.getBoundingClientRect() // 获取渲染得到的高度数据
        // 设置为0高度
        el.style.height = '0px'
        el.style.transition = `height ${transition_time}s, opacity ${transition_time}s`
        el.addEventListener('transitionstart', (event: TransitionEvent) => {
          if (event.propertyName === 'height') {
            setAnimation(true)
          }
        })
        el.addEventListener('transitionend', (event: TransitionEvent) => {
          if (event.propertyName === 'height') {
            setAnimation(false)
            onMenuOpen && onMenuOpen()
          }
        })
        // 不要让滚动事件被window截获
        el.addEventListener('wheel', (evet) => {
          evet.stopPropagation()
        })
        // 下一帧开始，正式播放展开动画
        requestAnimationFrame(() => {
          ;((el.style.height = `${height}px`), (el.style.opacity = '1'))
        })
      }
    })
  }, [visible])

  useEffect(() => {
    const el = MenuRef.current
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'height') {
        setVisible(false)
        setAnimation(false)
        onMenuUnMount && onMenuUnMount() // 菜单dom卸载调用
      }
    }
    if (el && !isOpen) {
      el.style.transition = `height ${transition_time}s, opacity ${transition_time}s`
      el.addEventListener('transitionend', handleTransitionEnd)
      el.addEventListener('transitionstart', (event: TransitionEvent) => {
        if (event.propertyName === 'height') {
          onMenuHide && onMenuHide()
          setAnimation(true)
        }
      })
      requestAnimationFrame(() => {
        ;((el.style.height = '0px'), (el.style.opacity = '0'))
      })
    }
  }, [isOpen])
  return (
    <div style={{ display: 'inline-block' }} {...triggerProps}>
      {children}
      {visible && (
        <div
          style={{ ...Styles, ...position }} // 避免闪烁
          className={`${styles['fangcun-menu-page-container']} ${className}`}
          ref={MenuRef}
        >
          {ui}
        </div>
      )}
    </div>
  )
}
