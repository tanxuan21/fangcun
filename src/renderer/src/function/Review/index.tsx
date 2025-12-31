import { Template } from '@renderer/components/Layout/Template'
import layout_styles from './layout-styles.module.scss'
import styles from './styles.module.scss'
import Papa from 'papaparse'
import axios from 'axios'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useState } from 'react'
import { Button } from 'antd'

enum PageTags {
  Review = 0,
  Summary,
  Setting
}
export const Review = () => {
  const [files, setFiles] = useState<File[]>([])

  const ReadCSV = (file: File) => {
    // 文件读取器
    const reader = new FileReader()
    reader.onload = async (e) => {
      console.log('result', e.target?.result)
      const result = e.target?.result
      if (result) {
        const parse_result = Papa.parse<{ q: string; a: string }>(result as string, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // 自动类型转换
          transformHeader: (header) => header.trim(), // 清理表头
          transform: (value: string, field: string | number) => {
            // 自定义转换
            if (field === 'isActive') {
              return value.toLowerCase() === 'true'
            }
            return value
          }
        })

        // console.log('parse_result', parse_result.data)
        // console.log('parse_result', parse_result.errors)
        // 网络请求

        for (const item of parse_result.data) {
          const data = {
            type: 0,
            content: JSON.stringify({ q: item.q, a: item.a }, null, 2)
          }

          const resp = await axios.post('http://localhost:3001/api/review-items', data)
          console.log(resp)
        }
      }
    }
    reader.onerror = (e) => {
      console.log(e)
    }
    reader.readAsText(file)
  }

  const [currentPage, setCurrentPage] = useState<PageTags>(PageTags.Summary)
  return (
    <Template
      header={
        <header className={layout_styles['review-header']}>
          <input
            onChange={async (e) => {
              if (e.target.files) {
                setFiles(Array.from(e.target.files))
                const file = e.target.files[0]
                if (!file) return
                ReadCSV(file)
              }
            }}
            type="file"
            id="fileInput"
            accept=".txt,.csv,.json,.html,.js,.css,.xml"
          ></input>
          {/* <button
            onClick={() => {
              if (files && files.length >= 0) ReadCSV(files[0])
            }}
          >
            刷新文件
          </button> */}
          <div className={layout_styles['review-tags-wapper']}>
            <span onClick={() => setCurrentPage(PageTags.Review)}>review</span>
            <span onClick={() => setCurrentPage(PageTags.Summary)}>summary</span>
          </div>
        </header>
      }
      main={<MainPages currentPage={currentPage}></MainPages>}
      asider={<aside className={layout_styles['review-asider']}></aside>}
      footer={<footer className={layout_styles['review-footer']}></footer>}
    />
  )
}

interface Iqa {
  q: string
  a: string
}
interface ReviewItem {
  id: number
  type: number
  content: Iqa
  created_at: string
}

const SummaryPage = () => {
  const [summaryData, setSummaryData] = useState<ReviewItem[]>()
  useEffect(() => {
    ;(async () => {
      axios.get('http://localhost:3001/api/review-items').then((res) => {
        console.log('获取 summery 信息')
        const data = res.data['data'].map((item) => {
          return {
            ...item,
            content: JSON.parse(item.content)
          }
        })
        setSummaryData(data)
      })
    })()
  }, [])

  return (
    <div className={`${layout_styles['table-container']} ${layout_styles['fill-container']}`}>
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
            <th>created_at</th>
            <th>Oper</th>
          </tr>
        </thead>
        <tbody>
          {summaryData?.map((item) => (
            <tr key={item.id}>
              <td>{item.content.q}</td>
              <td>{item.content.a}</td>
              <td>{item.created_at}</td>
              <td>
                <button>del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ReviewPage = () => {
  useEffect(() => {
    ;(async () => {
      // 获取当天复习的数据
    })()
  }, [])
  return (
    <div className={`${layout_styles['review-main-container']} ${layout_styles['fill-container']}`}>
      <div className={layout_styles['review-content-container']}>
        <p className={layout_styles['review-q']}>
          什么是可见（透明）寄存器？CPU 基本寄存器里，哪些可见，哪些不可见？为什么？
        </p>
        <p className={layout_styles['review-a']}>王道书 王道书 5.1.2 p207</p>
      </div>
      <div className={layout_styles['review-operation-container']}>
        <div className={layout_styles['review-operation-button-rate-container']}>
          <Button type="primary">I can!</Button>
          <Button type="dashed">trying...</Button>
          <Button type="text" color="pink" variant="filled">
            I can't
          </Button>
        </div>
        <p className={layout_styles['textarea-reminder']}>
          something remark up about this review... ...
        </p>
        <TextArea rows={4} placeholder="I remenber... but..." />
      </div>
      <footer className={layout_styles['review-footer']}>
        <Button>submit</Button>
      </footer>
    </div>
  )
}
const MainPages = ({ currentPage }: { currentPage: PageTags }) => {
  switch (currentPage) {
    case PageTags.Summary:
      return <SummaryPage></SummaryPage>
      break
    case PageTags.Review:
      return <ReviewPage></ReviewPage>
      break
      defaule: return <div>Default</div>
    case PageTags.Setting:
      return <div>Setting</div>
      break
  }
}
