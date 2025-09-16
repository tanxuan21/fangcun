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
  type?: 'recite' | 'record' // 两个模式，recite模式只接受blob；record模式接受所有参数，任何一个参数的改变都会带来
  // 重新获取blob
}

export const Audio = forwardRef(
  (
    {
      type = 'recite',
      blob,
      onLoaded,
      content,
      voice_model,
      className,
      style,
      autoPlay = true
    }: AudioProps,
    ref
  ) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const audioRef = useRef<HTMLAudioElement>(null)

    const load = async (content: string, voice_model: string) => {
      try {
        setIsLoading(true)
        const tts = new EdgeTTS(content, voice_model)
        const result = await tts.synthesize()
        setIsLoading(false)
        await onLoaded(result.audio)
        // console.log(`${content} 保存音频！`)
      } catch (e) {
        messageApi.error(`${e}`)
      }
    }
    useImperativeHandle(ref, () => ({
      play: () => {
        const audio = audioRef.current
        if (!audio || isLoading) return // 正在加载，也不播放。
        audio.currentTime = 0
        audio.play()
      },
      reload: load
    }))
    // content/voice_model变化，必须重新获取。
    useEffect(() => {
      if (type === 'recite') return // 背诵模式，不获取任何的audio
      console.log(content, voice_model, blob)

      if (!content) {
        // 必须有文字，或者有模型才获取音频
        setAudioUrl(null)
        return
      }
      if (!voice_model) {
        return
      }
      load(content, voice_model) // 加载音频
    }, [content, voice_model])

    // 如果外部给了blob，那就使用外部的。加快速度
    useEffect(() => {
      if (blob !== null) setAudioUrl(URL.createObjectURL(blob))
    }, [blob])

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
