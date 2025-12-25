import { useState } from 'react'
import styles from './tag-header.module.scss'
export const TagsHeader = ({
  tags,
  className,
  style,
  onSelected
}: {
  tags: { id: string; tag: string }[]
  className?: string
  style?: React.CSSProperties
  onSelected?: (id: string) => void
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const TagItem = ({
    onSelected,
    content,
    activate
  }: {
    onSelected: (tag: string) => void
    content: string
    activate: boolean
  }) => {
    return (
      <p
        onClick={() => {
          onSelected(content)
        }}
        className={`${styles['tag-header-item']} ${activate && styles['activate']}`}
      >
        {content}
      </p>
    )
  }
  return (
    <div className={`${styles['tag-header-container']} ${className}`} style={{ ...style }}>
      {tags.map((t, index) => {
        return (
          <TagItem
            onSelected={() => {
              setCurrentIndex(index)
              onSelected && onSelected(tags[index].id)
            }}
            content={t.tag}
            activate={t === tags[currentIndex]}
            key={t.id}
          ></TagItem>
        )
      })}
    </div>
  )
}
