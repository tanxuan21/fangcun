import Input, { InputRef } from 'antd/es/input/Input'
import { useRef, useState } from 'react'
type props = {
  text: string
  updateText: (v: string) => void // 更新，更新前端数据，对于onChange
  saveText: (v: string) => void // 保存，提交网络请求，对应EnterPress，Blur
  disable?: boolean
} & { className?: string; styles?: React.CSSProperties }
export const EditableInput = ({
  disable = false,
  saveText,
  updateText,
  text,
  className,
  styles
}: props) => {
  const [state, set_state] = useState<'editing' | 'edited'>('edited')
  const [isComposition, setIsComposition] = useState<boolean>(false)
  //   const [textCache, setTextCache] = useState<string>(text)
  const handleFinishEdit = (e) => {
    saveText(e.target.value)
    // setTextCache(e.target.value)
    set_state('edited')
  }
  const inputRef = useRef<InputRef>(null)
  return (
    <div
      className={`${className}`}
      style={{ ...styles, cursor: disable ? 'not-allowed' : '' }}
      onDoubleClick={() => {
        if (disable) return
        set_state('editing')
        // 确保组件都渲染完成再focus
        const t = setTimeout(() => {
          inputRef.current?.focus()
          clearTimeout(t)
        }, 30)
      }}
    >
      {!disable && state === 'editing' && (
        <Input
          ref={inputRef}
          defaultValue={text}
          onChange={(e) => {
            updateText(e.target.value)
          }}
          onBlur={handleFinishEdit}
          onPressEnter={(e) => {
            if (!isComposition) {
              handleFinishEdit(e)
            }
          }}
          onCompositionStart={() => {
            setIsComposition(true)
          }}
          onCompositionEnd={() => {
            setIsComposition(false)
          }}
        ></Input>
      )}
      {state === 'edited' && <p>{text}</p>}
    </div>
  )
}
