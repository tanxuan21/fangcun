import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EdgeTTS } from 'edge-tts-universal'
import { Icon, IconTail } from '@renderer/components/Icon'
import styles from './styles.module.scss'
import { message } from 'antd'

interface AudioProps {
  content: string
  voice_model: string
  blob: Blob | null
  className?: string
  style?: React.CSSProperties
  autoPlay?: boolean
  onLoaded: (b: Blob) => Promise<void>
}

export const Audio = forwardRef(
  (
    { blob, onLoaded, content, voice_model, className, style, autoPlay = true }: AudioProps,
    ref
  ) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const audioRef = useRef<HTMLAudioElement>(null)

    useImperativeHandle(ref, () => ({
      play: () => {
        const audio = audioRef.current
        if (!audio || isLoading) return // 正在加载，也不播放。
        audio.currentTime = 0
        audio.play()
      }
    }))
    useEffect(() => {
      console.log(content, blob)

      if (!content) {
        setAudioUrl(null)
        return
      }
      if (blob) {
        setAudioUrl(URL.createObjectURL(blob))
        return
      } else {
        ;(async () => {
          try {
            setIsLoading(true)
            const tts = new EdgeTTS(content, voice_model)
            const result = await tts.synthesize()
            setIsLoading(false)
            await onLoaded(result.audio)
            console.log(`${content} 保存音频！`)
          } catch (e) {
            messageApi.error(`${e}`)
          }
        })()
      }
    }, [content, voice_model, blob])

    return (
      <div className={`${styles['audio-container']} ${className}`} style={style}>
        {contextHolder}
        <IconTail
          onClick={() => {
            const audio = audioRef.current
            if (!audio) return
            audio.currentTime = 0
            audio.play()
          }}
          className={`${styles['audio-icon']} ${isLoading && styles['audio-loading']} `}
          IconName="#icon-shengyin"
        ></IconTail>
        <audio autoPlay={autoPlay} ref={audioRef} src={audioUrl ?? undefined} controls={false} />
      </div>
    )
  }
)
