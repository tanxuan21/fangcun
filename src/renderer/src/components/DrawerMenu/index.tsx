import { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { execPath } from 'process'

enum FolderState {
  expand,
  fold,
  disable
}

function Folder({ data, level }: { data: AssetsItem; level: number }) {
  // 展开，收起，搜索
  const [state, set_state] = useState<FolderState>(FolderState.fold)
  return (
    <>
      {/* 文件头 */}
      <li className={styles['folder-handle']}>
        <button
          onClick={() => {
            if (state === FolderState.expand) {
              set_state(FolderState.fold)
            }
            if (state === FolderState.fold) {
              set_state(FolderState.expand)
            }
          }}
        >
          {state === FolderState.expand ? '展开' : '折叠'}
        </button>
        {data.name}
      </li>
      {/* 子文件列表 */}
      <ul
        className={styles['folder-container']}
        style={{
          height: state === FolderState.expand ? 'auto' : 0,
          overflow: state === FolderState.expand ? '' : 'hidden'
        }}
      >
        {data.sub_assets ? (
          data.sub_assets.map((item) => {
            if (item.is_folder) {
              return <Folder level={level + 1} key={item.name} data={item}></Folder>
            }
            return <File level={level + 1} key={item.name} data={item}></File>
          })
        ) : (
          <></>
        )}
      </ul>
    </>
  )
}
function File({ data, level }: { data: AssetsItem; level: number }) {
  const [state, set_state] = useState<boolean>(false)
  const [name, set_name] = useState<string>(data.name)
  return (
    <li className={styles['file-item-container']}>
      {/* 为了美观，hover 撑满整个容器，必须搞一个子元素来 */}
      <div
        onDoubleClick={() => {
          set_state(true)
        }}
        className={styles['file-item']}
        style={{ marginLeft: `-${level * 20}px`, paddingLeft: `${level * 20}px`, width: '100%' }}
      >
        {data.name}
      </div>
      {state && (
        <input
          className={styles['file-item-input']}
          onKeyDown={(event) => {
            console.log(event)
            if (event.code === 'Enter') {
              set_state(false)
            }
          }}
          value={name}
          onChange={(e) => {
            set_name(e.target.value)
          }}
          type="text"
        />
      )}
    </li>
  )
}

interface AssetsItem {
  is_folder: boolean
  name: string
  sub_assets?: AssetsItem[]
}
export function DrawerMenu() {
  const [data, set_data] = useState<AssetsItem[]>([
    {
      is_folder: true,
      name: 'folder1',
      sub_assets: [
        { is_folder: false, name: 'file1-1' },
        { is_folder: false, name: 'file1-2' },
        {
          is_folder: true,
          name: 'folder1-3',
          sub_assets: [
            { is_folder: false, name: 'file1-3-1' },
            { is_folder: false, name: 'file1-3-2' },
            { is_folder: false, name: 'file1-3-3' }
          ]
        },
        { is_folder: false, name: 'file1-4' }
      ]
    },
    { is_folder: false, name: 'file2' }
  ])

  return (
    <div className={styles['drawer-container']}>
      {data.map((item) => {
        if (item.is_folder) {
          return <Folder level={1} key={item.name} data={item}></Folder>
        } else {
          return <File level={1} data={item} key={item.name}></File>
        }
      })}
    </div>
  )
}
