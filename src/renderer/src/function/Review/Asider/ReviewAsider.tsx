import { useEffect, useRef, useState } from 'react'
import layout_styles from './styles.module.scss'
import { IReviewSet } from '../../../../../../types/review/review'
import { useReviewSet } from '../ctx'
import { ReviewItemAxios, ReviewSetAxios } from '../api'
import { DefaultSetting } from '../Setting/Setting'
import { EditableInput } from '@renderer/components/Editable/EditableInput/EditableInput'
import { ReadCSV } from '../utils/csv'
import { IconTail, Icon } from '../../../components/Icon/index'
import { Dropdown, Menu, MenuProps } from 'antd'
import { DeleteOutlined, FolderAddOutlined, UploadOutlined } from '@ant-design/icons'

export const ReviewAsider = () => {
  const [reviewSetList, setReviewSetList] = useState<IReviewSet[]>([])
  const { reviewSet, setReviewSet } = useReviewSet()
  useEffect(() => {
    ;(async () => {
      const data = await ReviewSetAxios.get('')
      const raw_list = data.data.data

      setReviewSetList([
        ...raw_list.map((item) => {
          try {
            // TODO 解析setting 格式。是否有误/缺失
            const setting = JSON.parse(item.setting)
            console.log('setting', setting)
            return { ...item, setting }
          } catch (e) {
            return { ...item, setting: DefaultSetting }
          }
        })
      ])
    })()
  }, [])

  const ReviewSetEntryItem = ({ item }: { item: IReviewSet }) => {
    const FileInputRef = useRef<HTMLInputElement>(null)
    const { ReviewItems, setReviewItems } = useReviewSet()
    const handleSelectUploadFile = (e) => {
      e.stopPropagation()
      if (FileInputRef.current) FileInputRef.current.click()
    }
    const handleDelete = async (e) => {
      // 删除锁：如果现在选中了，不允许删除。
      if (reviewSet?.id === item.id) {
        console.error('当前选中的，不允许删除')
        return
      }
      e.stopPropagation()
      const resp = await ReviewSetAxios.delete(``, { params: { set_id: item.id } })
      if (resp.status == 204) {
        setReviewSetList((prev) => [...reviewSetList.filter((item2) => item2.id !== item.id)])
      } else {
        console.log(resp)
      }
    }

    const handleUpload = async (e) => {
      if (e.target.files) {
        //   setFiles(Array.from(e.target.files))
        const file = e.target.files[0]
        if (!file) return
        ReadCSV(file, async (datas) => {
          for (const csv_item of datas) {
            const data = {
              type: 0,
              content: JSON.stringify({ q: csv_item.q, a: csv_item.a }),
              review_set_id: item.id
            }
            try {
              const resp = await ReviewItemAxios.post('', data)
              console.log(resp) // 如果报错 conflict 就不会添加到 set
            } catch (error) {
              const e = error as any
              console.log(e.response.data.message)
            }
          }
        })
        // 重置。
        e.target.value = ''
      }
    }

    const MenuItems: MenuProps['items'] = [
      {
        label: 'upload',
        icon: <UploadOutlined />,
        key: 'add',
        onClick: (e) => handleSelectUploadFile(e.domEvent)
      },
      {
        label: 'delete',
        icon: <DeleteOutlined />,
        key: 'delete',
        danger: true,
        onClick: (e) => handleDelete(e.domEvent)
      }
    ]
    return (
      <div
        className={layout_styles['review-set-entry-container']}
        onClick={() => {
          setReviewSet(item) // Ctx 设置 set
        }}
      >
        <p>{item.name}</p>
        {/* <button onClick={handleSelectUploadFile}>add</button> */}
        <input
          ref={FileInputRef}
          style={{ display: 'none' }}
          type="file"
          accept=".txt,.csv,.json,.html,.js,.css,.xml"
          onChange={handleUpload}
        />
        <Dropdown
          menu={{ items: MenuItems, onClick: (info) => info.domEvent.stopPropagation() }}
          trigger={['click']}
        >
          <span onClick={(e) => e.stopPropagation()}>
            <IconTail className={layout_styles['qita-icon']} IconName="#icon-qita"></IconTail>
          </span>
        </Dropdown>

        {/* <button onClick={handleDelete}>del</button> */}
      </div>
    )
  }
  return (
    <aside className={layout_styles['review-asider']}>
      {/* header 显示当前的 set */}
      <header className={layout_styles['review-asider-header']}>
        {reviewSet && (
          <>
            <EditableInput
              styles={{ fontSize: '20px', fontWeight: 'bold' }}
              text={reviewSet.name}
              updateText={(v) => {
                setReviewSet({ ...reviewSet, name: v })
              }}
              saveText={async (v) => {
                if (!v) return
                const resp = await ReviewSetAxios.put('', { id: reviewSet.id, name: v })
                console.log(resp)
                setReviewSet({ ...reviewSet, name: v })
                setReviewSetList(
                  reviewSetList.map((item) => (item.id === reviewSet.id ? { ...reviewSet } : item))
                )
              }}
            ></EditableInput>
            <br />
            <EditableInput
              styles={{ fontSize: '12px', color: '#777' }}
              text={reviewSet.description}
              updateText={(v) => {
                setReviewSet({ ...reviewSet, description: v })
              }}
              saveText={async (v) => {
                if (!v) return
                setReviewSet({ ...reviewSet, description: v })
                const resp = await ReviewSetAxios.put('', {
                  id: reviewSet.id,
                  description: v
                })
                console.log(resp)
              }}
            ></EditableInput>
            <p>create_at: {reviewSet.created_at}</p>
          </>
        )}
      </header>
      <main className={layout_styles['review-asider-main']}>
        {reviewSetList.map((item) => (
          <ReviewSetEntryItem item={item} key={item.id} />
        ))}
      </main>
      <footer className={layout_styles['review-asider-footer']}>
        <FolderAddOutlined
          style={{ fontSize: '20px' }}
          onClick={async () => {
            const defaultSet = {
              name: 'default' + Math.floor(Math.random() * 1000),
              description: 'default',
              setting: 'default'
            }
            const resp = await ReviewSetAxios.post('', defaultSet)
            console.log('add review set', resp.data)
            // 如果添加成功，同步更新前端列表
            if (resp.status == 201)
              setReviewSetList([...reviewSetList, { ...resp.data.data, setting: DefaultSetting }])
          }}
        />
      </footer>
    </aside>
  )
}
