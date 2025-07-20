import { useEffect, useRef, useState } from 'react'
import { debounce, dropWhile } from 'lodash'
import styles from './styles.module.scss'
import Spline from 'typescript-cubic-spline'
import { calculateBSpline } from './BSpline'
export default function DrawTable() {
  const [canvas_size, set_canvas_size] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600
  })
  const canvas_element = useRef<HTMLCanvasElement | null>(null)
  // 缓存变量
  const [is_drawing, set_is_drawing] = useState<boolean>(false)
  const [is_pointer_in_canvas, set_is_pointer_in_canvas] = useState<boolean>(false)
  const [pointer_pos, set_pointer_pos] = useState<{ x: number; y: number }>({ x: 110, y: 0 })
  const [ctx, set_ctx] = useState<CanvasRenderingContext2D | null>(null)
  const [canvas_geomatry, set_canvas_geomatry] = useState<DOMRect | null>(null)
  let scale: number = 1

  let pen_size = 7
  let pen_color = `#000`
  useEffect(() => {
    if (canvas_element.current) {
      // 处理分辨率
      const dpr = window.devicePixelRatio || 1

      canvas_element.current.style.width = `${canvas_size.width}px`
      canvas_element.current.style.height = `${canvas_size.height}px`
      canvas_element.current.style.scale = `${scale}`
      canvas_element.current.width = canvas_size.width * dpr
      canvas_element.current.height = canvas_size.height * dpr
      // 变量缓存
      let _ctx = canvas_element.current.getContext('2d')
      set_ctx(_ctx)
      if (_ctx) {
        _ctx.fillStyle = 'blue'
        _ctx.fillRect(20, 20, 150, 100)

        const points = [
          { x: 50, y: 50 },
          { x: 100, y: 500 },
          { x: 200, y: 500 },
          { x: 300, y: 100 },
          { x: 400, y: 400 },
          { x: 500, y: 700 }
        ]
        points.forEach((elements) => {
          draw_dot(_ctx, elements.x, elements.y, 3, '#00f')
        })
        const cv = calculateBSpline(points, 3, 1e3)
        cv.forEach((element) => {
          draw_dot(_ctx, element.x, element.y, 2, '#f00')
        })

        const points1 = [
          { x: 100, y: 500 },
          { x: 200, y: 500 },
          { x: 300, y: 100 },
          { x: 400, y: 400 },
          { x: 500, y: 700 },
          { x: 600, y: 200 },
          { x: 700, y: 400 },
          { x: 700, y: 400 }
        ]
        calculateBSpline(points1, 3, 1e3).forEach((elements) => {
          draw_dot(_ctx, elements.x, elements.y, 2, '#00f')
        })
      }
      set_canvas_geomatry(canvas_element.current.getBoundingClientRect())
    }

    // resize事件
    const handleResize = debounce(() => {
      set_canvas_geomatry(canvas_element.current?.getBoundingClientRect() as DOMRect)
    }, 500)

    window.addEventListener('resize', handleResize)
    ;(async function () {
      const data = await window.api.loadPic('canvas.png')
      const image = new Image()
      image.src = data
      let ctx = canvas_element.current?.getContext('2d') as CanvasRenderingContext2D
      //ctx.drawImage(image, 0, 0)
    })()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const draw_dot = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ) => {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  return (
    <div
      className={styles['container']}
      onWheel={(event) => {
        console.log(event.deltaY)
      }}
    >
      <div className={styles['origin']}>
        <canvas
          onPointerEnter={() => {
            set_is_pointer_in_canvas(true)
          }}
          onPointerLeave={() => {
            set_is_pointer_in_canvas(false)
          }}
          onPointerDown={(event) => {
            event.preventDefault()
            set_is_drawing(true)
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            event.preventDefault()
            set_pointer_pos({ x: event.clientX, y: event.clientY })
            if (canvas_geomatry && ctx) {
              const dpr = window.devicePixelRatio || 1

              if (!is_drawing) return

              const color = `hsla(${Math.random() * 360},80%,60%,0.5)`
              const radius = event.pressure * pen_size + 0.1
              draw_dot(
                ctx,
                ((event.clientX - canvas_geomatry.x) * dpr) / scale,
                ((event.clientY - canvas_geomatry.y) * dpr) / scale,
                radius,
                pen_color
              )
            } else {
              console.error('canvas_geomatry:', canvas_geomatry, 'ctx:', ctx)
            }
          }}
          onPointerUp={(event) => {
            event.preventDefault()
            set_is_drawing(false)
            event.currentTarget.releasePointerCapture(event.pointerId)
          }}
          className={styles['canvas']}
          ref={canvas_element}
        ></canvas>
        <canvas className={styles['nib-layer']}></canvas>
      </div>
      <div
        style={{
          width: `${pen_size}px`,
          height: `${pen_size}px`,
          top: `${pointer_pos.y}px`,
          left: `${pointer_pos.x}px`,
          display: is_pointer_in_canvas ? 'block' : 'none'
        }}
        className={styles['nib']}
      ></div>
      <button
        onClick={() => {
          const image_file = canvas_element.current?.toDataURL('image/png') as string
          window.api.saveBase64ToFile(image_file, 'canvas.png')
        }}
      >
        保存
      </button>
      <button
        onClick={() => {
          if (ctx) {
            ctx.clearRect(0, 0, 1e5, 1e5)
          }
        }}
      >
        清除
      </button>
    </div>
  )
}
