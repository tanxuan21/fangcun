import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './styles.module.scss'
import { EditableText } from '../../components/Editable/EditableText/EditableText'
import { BookInterface, DefaultBookInfo, DefaultBookSetting } from './types'
import { addBook, deleteBook, get_all_books, updateBookInfo } from './api/books'
import { Icon, IconTail } from '@renderer/components/Icon'
import { Dropdown, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { CSVUploader } from '@renderer/components/CSVUploader/CSVUploader'
import {
  add_cards_list,
  add_new_card_book_info_update,
  get_cards_by_book_id,
  rebuild_book_info
} from './api/cards'
import { alignConfig } from '@renderer/utils'
import { NotifySpirit } from '../../components/NotifySpirit/NotifySpirit'
import Papa from 'papaparse'

const formatDateManual = (timestamp: number): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1) // 月份 0-11 → +1
  const day = String(date.getDate())
  return `${year}年 ${month}月 ${day}日`
}

function BookItem({
  book,
  onUpdateBook,
  onRequestSave,
  onDelete
}: {
  book: BookInterface
  onUpdateBook: (book: BookInterface) => void
  onRequestSave: () => void
  onDelete: (id: number) => void
}) {
  const nav = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  const review_count = useMemo(() => {
    let total_review_count = 0
    for (let i = 0; i < book.info.reviews_count.length; i++) {
      total_review_count += book.info.reviews_count[i].count
    }
    return total_review_count
  }, [book])
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'import',
            label: <>import</>,
            icon: <Icon IconName="#icon-daoru"></Icon>,
            onClick: async () => {
              const data = await window.api.ImportCSVFile()
              if (data) {
                if (data.length) {
                  if (data[0]['q'] && data[0]['a']) {
                    add_new_card_book_info_update(book.info, data.length) // 更新 book.info 对象数据
                    onUpdateBook({ ...book, info: { ...book.info } }) // 更新 info 对象，react 重新渲染组件
                    await add_cards_list(book, data as { q: string; a: string }[]) // 添加
                  } else messageApi.error('csv data format error!')
                } else messageApi.warning('empty csv file!')
              } else messageApi.error(`import error!`)
            }
          },
          {
            key: 'export',
            label: <>export</>,
            icon: <Icon IconName="#icon-export"></Icon>,
            onClick: async () => {
              const data = (await get_cards_by_book_id(book.id)).data.map((item) => {
                return { q: item.Q, a: item.A }
              })
              const csv = Papa.unparse(data)
              const path = await window.api.SaveCSVFile(book.name, csv)
              if (path) {
                messageApi.success(`save successfully! ${path}`)
              } else {
                messageApi.error(`save failed!`)
              }
            }
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: <>delete</>,
            icon: <Icon IconName="#icon-shanchu"></Icon>,
            danger: true,
            onClick: () => {
              deleteBook(book.id)
              onDelete(book.id)
            }
          }
        ],
        style: { width: '120px' }
      }}
      trigger={['contextMenu']}
    >
      <div
        className={styles['book']}
        key={book.id}
        onClick={() => {
          nav(`/app/remember-card/${book.id}`)
        }}
      >
        {contextHolder}
        {review_count > 0 && <NotifySpirit count={review_count}></NotifySpirit>}
        <CSVUploader
          onReadComplete={async (result) => {
            // 检查是否格式正确：
            const field = result.meta.fields
            if (field?.includes('a') && field.includes('q')) {
              add_new_card_book_info_update(book.info, result.data.length) // 更新 book.info 对象，然后可以写入后端
              await add_cards_list(book, result.data as { q: string; a: string }[]) // 添加
            } else {
              // 弹出，格式错误弹框
              messageApi.error('csv data format error!')
            }
          }}
          dragOverClassName={styles['book-csv-uploader-dropover']}
          className={styles['book-csv-uploader']}
        >
          <EditableText
            className={styles['book-name']}
            Text={book.name}
            onChange={(new_text: string) => {
              onUpdateBook({ ...book, name: new_text })
            }}
            onEditedFinish={(new_text: string) => {
              onRequestSave()
            }}
          ></EditableText>
          <br />
          <EditableText
            className={styles['book-description']}
            Text={book.description}
            onChange={(new_text: string) => {
              onUpdateBook({ ...book, description: new_text })
            }}
            onEditedFinish={(new_text: string) => {
              onRequestSave()
            }}
          ></EditableText>
          <br />
          <p className={styles['book-info-item']}>cards count: {book.info.cards_count}</p>
          <p className={styles['book-info-item']}>
            created_at: {formatDateManual(book.created_at)}
          </p>
          <p className={styles['book-info-item']}>
            modifyed_at: {formatDateManual(book.updated_at)}
          </p>
        </CSVUploader>
      </div>
    </Dropdown>
  )
}

export function RemenberCardApp() {
  const [books_list, set_books_list] = useState<BookInterface[]>([])
  const [messageApi, contextHolder] = message.useMessage()
  useEffect(() => {
    ;(async function () {
      const data = await get_all_books()
      const _books_list = data.data
      // 对齐 book 的 info，setting 字段
      for (let i = 0; i < _books_list.length; i++) {
        _books_list[i].setting = alignConfig(DefaultBookSetting, _books_list[i].setting)
        const info = _books_list[i].info
        _books_list[i].info = alignConfig(DefaultBookInfo, info)
      }
      set_books_list(_books_list)
    })()
  }, [])
  return (
    <div className={styles['books-container']}>
      {contextHolder}
      <header className={styles['books-container-header']}>
        {/* 添加新书 */}
        <IconTail
          onClick={async () => {
            const resp = await addBook()
            console.log(resp)

            if (resp.success) {
              set_books_list((prev) => [
                ...prev,
                {
                  name: 'new book',
                  description: 'description',
                  created_at: Date.now(),
                  updated_at: Date.now(),
                  setting: DefaultBookSetting,
                  id: resp.data.book_id,
                  info: DefaultBookInfo
                }
              ])
            } else {
              console.error('add book error', resp)
            }
          }}
          IconName="#icon-jia"
          className={styles['add-book-icon']}
        ></IconTail>
        {/* 重建book info */}
        <div className={styles['header-icon-group-wrapper']}>
          <IconTail
            className={styles['icon']}
            onClick={async () => {
              const _books_list: BookInterface[] = []
              for (const book of books_list) {
                //   console.log(book)
                const data = await rebuild_book_info(book)
                _books_list.push(data)
                // 更新book的数据
                const resp = await updateBookInfo({ info: data.info, id: data.id })
                if (!resp.success) messageApi.error(resp.message)
              }
              set_books_list(_books_list)
            }}
            IconName="#icon-zhongjian"
          />
        </div>
      </header>

      {/* <CSVUploader
        className={styles['new-book-csv-uploader']}
        dragOverClassName={styles['new-book-csv-uploader-dropover']}
        onReadComplete={(data) => {
          console.log('new book', data)
        }}
      >

      </CSVUploader> */}
      <main className={styles['book-items-wapper']}>
        {books_list.map((item, index) => {
          return (
            <BookItem
              key={item.id}
              book={item}
              onUpdateBook={(book) => {
                set_books_list((prev) =>
                  prev.map((prev_item) => (prev_item.id === book.id ? { ...book } : prev_item))
                )
              }}
              onRequestSave={async () => {
                updateBookInfo({ id: item.id, name: item.name, description: item.description })
              }}
              onDelete={(id: number) => {
                set_books_list((prev) =>
                  prev.filter((item) => {
                    return item.id !== id
                  })
                )
              }}
            ></BookItem>
          )
        })}
      </main>
      {/* <DragAndDropCSVUploader></DragAndDropCSVUploader> */}

      <footer className={styles['books-container-footer']}></footer>
    </div>
  )
}
