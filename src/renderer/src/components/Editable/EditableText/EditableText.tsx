import { CSSProperties, useState } from 'react'
import styles from './styles.module.scss'
interface props {
  Text: string // 初始的字符是什么
  className?: string // 类样式
  CustomStyles?: CSSProperties
  onChange: (string) => void // 更新函数，更新父组件里的textInit
  onEditedFinish: (string) => void // 编辑完毕函数，用于发送网络请求
}

export const EditableText = ({
  Text,
  className,
  CustomStyles,
  onChange,
  onEditedFinish
}: props) => {
  const [editable, set_editable] = useState<boolean>(false)

  return (
    <p
      style={CustomStyles}
      className={`${styles['editable-input-p']} ${className}`}
      onDoubleClick={() => {
        set_editable(true)
      }}
      onClick={(event) => {
        event.stopPropagation() // 暂时不区分 dbclick 和 click
      }}
    >
      {editable ? (
        <input
          className={`${styles['editable-input-input']} ${className}`}
          value={Text}
          onChange={(event) => {
            const new_text = (event.target as HTMLInputElement).value
            onChange(new_text)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              // 回车
              const new_text = (event.target as HTMLInputElement).value
              onEditedFinish(new_text)
              set_editable(false)
            }
          }}
          onBlur={(event) => {
            const new_text = (event.target as HTMLInputElement).value
            onEditedFinish(new_text)
            set_editable(false)
          }}
          type="text"
        />
      ) : (
        Text
      )}
    </p>
  )
}
