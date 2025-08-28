import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EdgeTTS } from 'edge-tts-universal'
import { Icon } from '@renderer/components/Icon'
import styles from './styles.module.scss'
import { message } from 'antd'

interface AudioProps {
  content: string
  voice_model: string
  src: string | null
  className?: string
  style?: React.CSSProperties
  autoPlay?: boolean
}

export const Audio = forwardRef(
  ({ src, content, voice_model, className, style, autoPlay = true }: AudioProps, ref) => {
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
      if (!content) {
        setAudioUrl(null)
        return
      }

      ;(async () => {
        try {
          setIsLoading(true)
          //   const tts = new EdgeTTS(content, voice_model, { rate: '+20%', pitch: '+5Hz' })
          const tts = new EdgeTTS(content, voice_model)
          const result = await tts.synthesize()
          const audio_url = URL.createObjectURL(result.audio)
          setAudioUrl(audio_url)
          setIsLoading(false)
        } catch (e) {
          messageApi.error(`${e}`)
        }
      })()
    }, [content, voice_model])

    return (
      <div className={`${styles['audio-container']} ${className}`} style={style}>
        {contextHolder}
        <Icon
          onClick={() => {
            const audio = audioRef.current
            if (!audio) return
            audio.currentTime = 0
            audio.play()
          }}
          className={`${styles['audio-icon']} ${isLoading && styles['audio-loading']} `}
          IconName="#icon-shengyin"
        ></Icon>
        <audio autoPlay={autoPlay} ref={audioRef} src={audioUrl ?? undefined} controls={false} />
      </div>
    )
  }
)
