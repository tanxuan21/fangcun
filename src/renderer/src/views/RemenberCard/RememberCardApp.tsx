import { useEffect, useRef, useState } from 'react'
import styles from './styles.module.scss'
import { EditableText } from '../../components/EditableText/EditableText'
import { BookInterface, DefaultBookSetting } from './types'
import { addBook, deleteBook, get_all_books, updateBookInfo } from './api/books'
import { Icon } from '@renderer/components/Icon'
import { Dropdown, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { CSVUploader } from '@renderer/components/CSVUploader/CSVUploader'
import { add_cards_list } from './api/cards'

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
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'delete',
            label: <>删除</>,
            icon: <Icon IconName="#icon-shanchu"></Icon>,
            danger: true,
            onClick: () => {
              console.log('delete', book.id)
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
        <CSVUploader
          onReadComplete={async (result) => {
            // 检查是否格式正确：
            const field = result.meta.fields
            if (field?.includes('a') && field.includes('q')) {
              add_cards_list(book.id, result.data as { q: string; a: string }[])
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
              //   console.log('onchange', new_text)
            }}
            onEditedFinish={(new_text: string) => {
              onRequestSave()
              //   console.log('editfinished', new_text)
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
          <p className={styles['book-created-at']}>创建于： {formatDateManual(book.created_at)}</p>
          <p className={styles['book-updated-at']}>修改于： {formatDateManual(book.updated_at)}</p>
        </CSVUploader>
      </div>
    </Dropdown>
  )
}

export function RemenberCardApp() {
  const [books_list, set_books_list] = useState<BookInterface[]>([])
  useEffect(() => {
    ;(async function () {
      const data = await get_all_books()
      set_books_list(data.data)
    })()
  }, [])
  return (
    <div className={styles['books-container']}>
      <header className={styles['books-container-header']}>
        <Icon
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
                  id: resp.data.book_id
                }
              ])
            } else {
              console.error('add book error', resp)
            }
          }}
          IconName="#icon-jia"
          className={styles['add-book-icon']}
        ></Icon>
      </header>

      <CSVUploader
        className={styles['new-book-csv-uploader']}
        dragOverClassName={styles['new-book-csv-uploader-dropover']}
        onReadComplete={(data) => {
          console.log('new book', data)
        }}
      >
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
                  updateBookInfo(item)
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
      </CSVUploader>
      {/* <DragAndDropCSVUploader></DragAndDropCSVUploader> */}

      <footer className={styles['books-container-footer']}></footer>
    </div>
  )
}
