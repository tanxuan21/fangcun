import { useState } from 'react'
import styles from './tabs.module.scss'
export const Tabs = ({
  options,
  onChange,
  defaultOption = ''
}: {
  defaultOption?: string
  options: string[]
  onChange: (opt: string) => void
}) => {
  const TabsItem = ({
    option,
    activate,
    onClick
  }: {
    option: string
    activate: boolean
    onClick: () => void
  }) => {
    return (
      <span
        className={`${styles['tabs-item-container']} ${activate && styles['activate']}`}
        onClick={onClick}
      >
        {option}
      </span>
    )
  }
  const [option, setOption] = useState<string>(defaultOption)
  return (
    <div className={`${styles['tabs-container']}`}>
      {options.map((opt) => {
        return (
          <TabsItem
            key={opt}
            option={opt}
            onClick={() => {
              setOption(opt)
              onChange(opt)
            }}
            activate={opt === option}
          ></TabsItem>
        )
      })}
    </div>
  )
}
