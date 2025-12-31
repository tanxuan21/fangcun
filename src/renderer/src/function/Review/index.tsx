import { Template } from '@renderer/components/Layout/Template'
import layout_styles from './layout-styles.module.scss'
import styles from './styles.module.scss'
import Papa from 'papaparse'
import axios from 'axios'
import { useEffect, useState } from 'react'

enum PageTags {
  Review = 0,
  Summary
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
          <button
            onClick={() => {
              if (files && files.length >= 0) ReadCSV(files[0])
            }}
          >
            刷新文件
          </button>
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
    <div
      className={`${layout_styles['table-container']} ${layout_styles['review-main-container']}`}
    >
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
  return <div className={layout_styles['review-main-container']}>Review</div>
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
  }
}
