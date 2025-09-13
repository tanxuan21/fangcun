import { Menu, Splitter } from 'antd'
import styles from './styles.module.scss'
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { ItemType, MenuItemType } from 'antd/es/menu/interface'
import { MenuContainer } from '@renderer/components/Menu/MenuContainer'
import { MenuDemo } from '@renderer/components/Menu/Demo'
import { ReactNode, useState } from 'react'

export const ComponentHome = () => {
  const items: (ItemType<MenuItemType> & Record<string, any>)[] = [
    // {
    //   key: 'sub1',
    //   label: 'Navigation One',
    //   icon: <MailOutlined />,
    //   children: [
    //     {
    //       key: 'g1',
    //       label: 'Item 1',
    //       type: 'group',
    //       children: [
    //         { key: '1', label: 'Option 1' },
    //         { key: '2', label: 'Option 2' }
    //       ]
    //     },
    //     {
    //       key: 'g2',
    //       label: 'Item 2',
    //       type: 'group',
    //       children: [
    //         { key: '3', label: 'Option 3' },
    //         { key: '4', label: 'Option 4' }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   key: 'sub2',
    //   label: 'Navigation Two',
    //   icon: <AppstoreOutlined />,
    //   children: [
    //     { key: '5', label: 'Option 5' },
    //     { key: '6', label: 'Option 6' },
    //     {
    //       key: 'sub3',
    //       label: 'Submenu',
    //       children: [
    //         { key: '7', label: 'Option 7' },
    //         { key: '8', label: 'Option 8' }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   type: 'divider'
    // },
    // {
    //   key: 'sub4',
    //   label: 'Navigation Three',
    //   icon: <SettingOutlined />,
    //   children: [
    //     { key: '9', label: 'Option 9' },
    //     { key: '10', label: 'Option 10' },
    //     { key: '11', label: 'Option 11' },
    //     { key: '12', label: 'Option 12' }
    //   ]
    // },
    // {
    //   key: 'grp',
    //   label: 'Group',
    //   type: 'group',
    //   children: [
    //     { key: '13', label: 'Option 13' },
    //     { key: '14', label: 'Option 14' }
    //   ]
    // }

    {
      key: 'menu',
      label: 'Menu',
      children: [
        {
          key: 'menu-container',
          label: 'menu-container',
          element: <MenuDemo></MenuDemo>
        }
      ]
    }
  ]

  // 点击菜单会返回一个path
  const fetchElement = (path: string[]) => {
    let array = items
    let obj: any = null
    for (let i = path.length - 1; i >= 0; i--) {
      const key = path[i]
      // 找到 array 里 key 为 obj 的对象
      const idx = array.findIndex((item) => item.key === key)
      obj = array[idx]
      array = obj.children
    }
    return obj && obj.element ? obj.element : <>not found</>
  }

  const [keyPath, setKeyPath] = useState<string[]>([])
  return (
    <div className={styles['component-container']}>
      <Splitter style={{ width: '100%', height: '100%' }}>
        <Splitter.Panel defaultSize={'20%'} max={'40%'} min={'15%'}>
          <Menu
            // style={{ backgroundColor: '#dddddd33' }}
            onClick={(e) => {
              setKeyPath(e.keyPath)
            }}
            mode="inline"
            items={items}
          ></Menu>
        </Splitter.Panel>
        <Splitter.Panel>{fetchElement(keyPath)}</Splitter.Panel>
      </Splitter>
    </div>
  )
}
