// 设置页
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import styles from './BookSettingPage.module.scss'
import { Button, Checkbox, Dropdown, Form, InputNumber, Radio, Select, Switch } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { useCardData } from '../CardsData'
import { BookSettingInterface, DefaultBookSetting } from '../types'
import { Icon, IconTail } from '@renderer/components/Icon'
import { updateBookInfo } from '../api/books'

export interface BookSettingPageAPI {
  pop: () => void
}

interface props {}

export const BookSettingPage = forwardRef(({}: props, ref) => {
  const { setting, set_setting, book_id } = useCardData()
  const [setting_page_state, set_setting_page_state] = useState<'show' | 'hide'>('hide')
  const [setting_cache, set_setting_cache] = useState<BookSettingInterface>(setting)
  useImperativeHandle(ref, () => ({
    pop: () => {
      set_setting_page_state('show')
    }
  }))

  const model_dict = {
    en: ['en-US-AvaNeural', 'en-US-AndrewNeural'],
    ko: ['ko-KR-InJoonNeural', 'ko-KR-SunHiNeural'],
    hk: ['zh-HK-HiuGaaiNeural', 'zh-HK-WanLungNeural'],
    jp: ['ja-JP-KeitaNeural', 'ja-JP-NanamiNeural']
  }

  // 这个不会引起循环更新。
  useEffect(() => {
    set_setting_cache(setting)
  }, [setting, set_setting_page_state])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        set_setting_page_state('hide')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  return (
    <div
      className={`${styles['setting-container']} ${setting_page_state === 'hide' && styles['hide']}`}
    >
      <div className={styles['setting-inner-container']}>
        <Form className={styles['form-container']}>
          <Form.Item label="audio model">
            <Select
              value={setting_cache.audio_model}
              onChange={(v) => {
                set_setting_cache({ ...setting_cache, audio_model: v })
              }}
              options={(function () {
                const items: { value: string; label: React.ReactNode }[] = []
                for (const language in model_dict) {
                  for (const model of model_dict[language]) {
                    items.push({ value: model, label: model })
                  }
                }
                items.push({ value: '', label: 'no audio' })
                return items
              })()}
            ></Select>
          </Form.Item>

          <Form.Item label="review mode">
            {setting_cache.review_mode.map((item) => (
              <Checkbox
                key={item.mode_id}
                onChange={() =>
                  set_setting_cache({
                    ...setting_cache,
                    review_mode: setting_cache.review_mode.map((rv) =>
                      rv.mode_id === item.mode_id ? { ...rv, open: !rv.open } : rv
                    )
                  })
                }
                checked={item.open}
              >
                {item.mode_name}
              </Checkbox>
            ))}
          </Form.Item>

          <Form.Item label="vague review count">
            <InputNumber
              onChange={(v) => {
                set_setting_cache({ ...setting_cache, vague_review_count: v || 0 })
              }}
              value={setting_cache.vague_review_count}
            ></InputNumber>
          </Form.Item>
          <Form.Item label="forget review count">
            <InputNumber
              onChange={(v) => {
                set_setting_cache({ ...setting_cache, forget_review_count: v || 0 })
              }}
              value={setting_cache.forget_review_count}
            ></InputNumber>
          </Form.Item>
          <Form.Item label="record maner">
            <Switch
              value={setting_cache.arrange_review}
              onChange={(v) => {
                set_setting_cache({ ...setting_cache, arrange_review: v })
              }}
            ></Switch>
          </Form.Item>
          {setting_cache.memory_level.map((item) => {
            return (
              <Form.Item key={item.level} label={`level: ${item.level > 0 ? item.level : '∞'}`}>
                <div className={styles['form-item-inner-wrapper']}>
                  <InputNumber
                    onChange={(v) => {
                      set_setting_cache({
                        ...setting_cache,
                        memory_level: setting_cache.memory_level.map((m) =>
                          m.level === item.level ? { ...m, review_delay: v || 0 } : m
                        )
                      })
                    }}
                    value={item.review_delay}
                  ></InputNumber>{' '}
                  review after days
                  {/* 无穷的那个不能删 */}
                  {item.level > 0 && (
                    <div className={styles['memory-level-edit-btn-wrapper']}>
                      {/* 这一天往后的每一天，level + 1 */}
                      <IconTail
                        onClick={() => {
                          const new_memory_level: { level: number; review_delay: number }[] = []
                          setting_cache.memory_level.forEach((m, i) => {
                            if (m.level <= item.level) {
                              new_memory_level.push(m)
                            } else {
                              new_memory_level.push({
                                review_delay: m.review_delay,
                                level: m.level + 1
                              })
                            }
                          })
                          // 加入的一个
                          new_memory_level.push({
                            review_delay: item.review_delay,
                            level: item.level + 1
                          })
                          // 排序
                          new_memory_level.sort((a, b) => {
                            return a.level - b.level
                          })
                          // ∞ level 置换
                          const ifin = new_memory_level.shift()
                          if (ifin) new_memory_level.push(ifin)
                          // 设置缓存
                          set_setting_cache({ ...setting_cache, memory_level: new_memory_level })
                        }}
                        className={styles['icon-tianjia']}
                        IconName="#icon-tianjia"
                      />
                      {/* 删到只剩一个非 ∞ level了，不能继续删了。否则没法加回来了。 */}
                      {setting_cache.memory_level.length > 2 && (
                        <IconTail
                          onClick={() => {
                            const new_memory_level: { level: number; review_delay: number }[] = []
                            setting_cache.memory_level.forEach((m, i) => {
                              if (m.level < item.level) {
                                new_memory_level.push(m)
                              } else if (m.level > item.level) {
                                new_memory_level.push({
                                  review_delay: m.review_delay,
                                  level: m.level - 1
                                })
                              }
                            })
                            // 排序
                            new_memory_level.sort((a, b) => {
                              return a.level - b.level
                            })
                            // ∞ level 置换
                            const ifin = new_memory_level.shift()
                            if (ifin) new_memory_level.push(ifin)
                            // 设置缓存
                            set_setting_cache({ ...setting_cache, memory_level: new_memory_level })
                          }}
                          className={styles['icon-shanchu']}
                          IconName="#icon-shanchu"
                        />
                      )}
                    </div>
                  )}
                </div>
              </Form.Item>
            )
          })}
        </Form>
        <footer className={styles['btn-group']}>
          {/* 恢复默认设置 */}
          <Button
            color="danger"
            variant="filled"
            onClick={async () => {
              const resp = await updateBookInfo({ id: book_id, setting: DefaultBookSetting })
              if (resp.success) {
                set_setting_page_state('hide')
                set_setting(DefaultBookSetting) // 将缓存区写入正式配置
              } else {
                console.error('保存错误')
              }
            }}
          >
            restore
          </Button>
          {/* 放弃设置，只是退出罢了 */}
          <Button
            onClick={() => {
              set_setting_page_state('hide')
            }}
          >
            abandon
          </Button>
          <Button
            color="cyan"
            variant="solid"
            onClick={async () => {
              // 成功，退出设置页。
              const resp = await updateBookInfo({ id: book_id, setting: setting_cache })
              if (resp.success) {
                set_setting_page_state('hide')
                set_setting(setting_cache) // 将缓存区写入正式配置
              } else {
                console.error('保存错误')
              }
            }}
          >
            commit
          </Button>
        </footer>
      </div>
    </div>
  )
})
