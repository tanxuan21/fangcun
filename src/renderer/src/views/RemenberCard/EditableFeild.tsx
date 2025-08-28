import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export const EditableFeild = forwardRef(
  (
    {
      value,
      onSave,
      onUpdate,
      onTab,
      className,
      onFocus
    }: {
      className?: string
      value: string
      onSave: (next: string) => Promise<void>
      onUpdate: (next: string) => void
      onFocus?: (event) => void
      onTab?: (event: React.KeyboardEvent<HTMLParagraphElement>) => void
    },
    ref
  ) => {
    const pref = useRef<HTMLParagraphElement>(null)
    const [draft, set_draft] = useState<string>(value)

    const [saving, set_saving] = useState<boolean>(false) // 保存的异步期间不要再次请求
    const [dirty, set_dirty] = useState<boolean>(false) // 脏标记，用户啥也没改就不要请求网络

    useImperativeHandle(ref, () => ({
      focus: () => {
        pref.current?.focus()
      }
    }))

    const handleBlur = async () => {
      if (!dirty || saving) return // 如果没有修改或者正在保存，直接返回。不要操作。
      set_saving(true)
      try {
        await onSave(draft)
        onUpdate(draft)
        set_dirty(false)
      } finally {
        set_saving(false)
      }
    }

    // 外部值变化才
    useEffect(() => {
      if (document.activeElement !== pref.current && pref.current) {
        set_draft(value)
        pref.current.textContent = value
      }
    }, [value])

    const handleInput = (e) => {
      set_dirty(true)
      set_draft(e.currentTarget.textContent ?? '')
    }
    return (
      <p
        className={className}
        style={{ outline: 'none' }}
        ref={pref}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === 'Tab' && onTab) {
            onTab(event)
          }
        }}
      ></p>
    )
  }
)
