import { Input, InputNumber, Switch } from 'antd'
import { ReactNode, useState } from 'react'
import { Icon, IconTail, ExpandIconTail } from '../Icon/index'
import { MenuContainer } from '../Menu/MenuContainer'
import { MenuItem } from '../Menu/MenuItem'
import styles from './feild.module.scss'
import { randomHexColor } from '@renderer/utils/color'
import { Tabs } from '../Tabs/Tabs'
type FeildType = 'Number' | 'Boolean' | 'String' | 'State' | 'Tag'
type FeildContainer = 'Single' | 'Array'
interface StateItem {
  id: string
  stateName: string
  color: string
}
interface props {
  FeildContainerType?: FeildContainer
  onChangeDefaultValue: (value: any) => void
}

const FeildItem = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState({
    label: ''
  })
  return (
    <div className={`${styles['feild-item-container']}`}>
      <label htmlFor="">Feild Name</label>
      <Input
        value={data.label}
        onChange={(e) => {
          setData({ ...data, label: e.target.value })
        }}
      ></Input>
      {children}
    </div>
  )
}

interface Feild_Number {
  value?: string // 这个就是单位
  default_value?: number
}
interface Feild_String {
  default_value?: string
}
interface Feild_Boolean {
  default_value?: boolean
}
interface Feild_State {
  value?: StateItem[]
  default_value?: StateItem
}

type FeildValue = Feild_Number | Feild_Boolean | Feild_State | Feild_String
export const Feild = {
  Number: ({ onChangeDefaultValue }: props & Feild_Number) => (
    <div
      style={{
        display: 'flex'
      }}
      className={styles['feild-number-container']}
    >
      <InputNumber
        onChange={(v) => {
          onChangeDefaultValue(v)
        }}
      ></InputNumber>
      unit:<Input style={{ width: '60px' }}></Input>
    </div>
  ),
  Boolean: ({ onChangeDefaultValue }: props & Feild_Boolean) => (
    <div>
      <Switch
        onChange={(v) => {
          onChangeDefaultValue(v)
        }}
      ></Switch>
    </div>
  ),
  String: ({ onChangeDefaultValue }: props & Feild_String) => {
    // State 的
    return (
      <div>
        <Input
          onBlur={(e) => {
            onChangeDefaultValue(e.target.value)
          }}
          onPressEnter={(e) => {
            onChangeDefaultValue((e.target as HTMLInputElement).value)
          }}
        ></Input>
      </div>
    )
  },

  State: ({ onChangeDefaultValue }: props & Feild_State) => {
    const [selectedState, setSelectedState] = useState<StateItem | null>(null)
    const [states, setStates] = useState<StateItem[]>([
      { id: '1', stateName: 'state1', color: '#2bdcd9ff' },
      { id: '2', stateName: 'state2', color: '#7553f1ff' },
      { id: '3', stateName: 'state3', color: '#f3be4cff' },
      { id: '4', stateName: 'state4', color: '#f38583ff' }
    ])
    const [expand, setExpand] = useState<boolean>(false)
    return (
      <div className={styles['feild-state-container']}>
        <div className={styles['feild-state-innercontainer']}>
          {selectedState ? (
            <div className={styles['feild-state']} style={{ background: `${selectedState.color}` }}>
              {selectedState?.stateName}
            </div>
          ) : (
            <div />
          )}
          <MenuContainer
            onMenuMount={() => {
              setExpand(true)
            }}
            onMenuHide={() => {
              setExpand(false)
            }}
            id="State-Feild"
            trigger={['Click']}
            ui={states.map((item) => {
              return (
                <MenuItem
                  onClick={() => {
                    setSelectedState(item)
                    onChangeDefaultValue(item) // 外部回调
                  }}
                  id={item.id}
                  key={item.id}
                  className={styles['feild-state-tag-menu-item']}
                >
                  <span
                    className={styles['state-tag-color']}
                    style={{
                      backgroundColor: `${item.color}`
                    }}
                  ></span>
                  {item.stateName}
                  {item.id === selectedState?.id && (
                    <IconTail className={styles['confirm-icon']} IconName="#icon-queren"></IconTail>
                  )}
                </MenuItem>
              )
            })}
          >
            <ExpandIconTail expand={expand}></ExpandIconTail>
          </MenuContainer>
        </div>
        <div className={`${styles['feild-state-tag-editor-list']}`}>
          {states.map((s) => {
            return (
              <div key={s.id} className={styles['feild-state-tag-editor-item']}>
                <Input
                  value={s.stateName}
                  onChange={(e) => {
                    s.stateName = e.target.value
                    setStates((prev) => [...prev])
                  }}
                ></Input>
                <IconTail
                  IconName="#icon-shanchu"
                  onClick={() => {
                    // 如果选中的被删了，那就弃选
                    if (selectedState?.id === s.id) {
                      setSelectedState(null)
                    }
                    setStates((prev) =>
                      prev.filter((item) => {
                        return s.id !== item.id
                      })
                    )
                  }}
                  className={styles['icon-delete']}
                ></IconTail>
              </div>
            )
          })}

          <IconTail
            IconName="#icon-tianjia"
            onClick={() => {
              const new_state = {
                id: crypto.randomUUID(),
                stateName: 'new state',
                color: randomHexColor()
              }
              setStates((prev) => [...prev, new_state])
            }}
          ></IconTail>
        </div>
      </div>
    )
  }
  // Tag: ({ onChangeDefaultValue, FeildContainerType = 'single' }: props) => {
  //   const []
  //   const [tags, setTags] = useState<string[]>(['tag1', 'tag2', 'tag3', 'tag4'])
  //   return (
  //     <div>
  //       <IconTail IconName="#icon-zhankai"></IconTail>
  //     </div>
  //   )
  // }
}

export const FeildContainer = ({
  type,
  onChangeDefaultValue
}: {
  type: FeildType
  onChangeDefaultValue: (v) => void
}) => {
  const [data, setData] = useState<{
    type: FeildType
    containerType: FeildContainer
    value: FeildValue | FeildValue[]
  }>({ type: type, containerType: 'Single', value: { value: '' } })
  return (
    <div className={`${styles['feild-container-container']}`}>
      <FeildItem>
        <Tabs
          defaultOption="Single"
          options={['Single', 'Array']}
          onChange={(opt) => {
            if (opt === 'Array') {
              if (!Array.isArray(data.value))
                setData({ ...data, value: [data.value], containerType: opt as FeildContainer })
            } else if (opt === 'Single') {
              if (Array.isArray(data.value))
                setData({
                  ...data,
                  value: data.value.length > 0 ? data.value[0] : { value: '' }, // 数组空了，给一个默认的对象
                  containerType: opt as FeildContainer
                })
            } else {
            }
          }}
        ></Tabs>
      </FeildItem>
      {data.containerType === 'Single' && (
        <Feild.Number onChangeDefaultValue={onChangeDefaultValue}></Feild.Number>
      )}
      {data.containerType === 'Array' &&
        (() => {
          if (!Array.isArray(data.value)) {
            // 不是array，要转变为Array
            const value = data.value as FeildValue
            setData({ ...data, value: [value] })
          }
          // 上面已经转为array了，后续不会出现类型问题。直接断言即可
          return (
            <div className={styles['feild-array-container']}>
              {(data.value as FeildValue[]).map((v, idx) => {
                return (
                  <div key={idx} className={styles['feild-array-item']}>
                    <Feild.Number
                      onChangeDefaultValue={() => {
                        onChangeDefaultValue
                      }}
                    ></Feild.Number>
                    <IconTail
                      IconName="#icon-qita"
                      className={styles['icon-more-option']}
                    ></IconTail>
                  </div>
                )
              })}
              <IconTail
                onClick={() => {
                  console.log(data)
                  setData({
                    ...data,
                    value: [...(data.value as FeildValue[]), { value: '' }]
                  })
                }}
                IconName="#icon-tianjia"
              ></IconTail>
            </div>
          )
        })()}
    </div>
  )
}
