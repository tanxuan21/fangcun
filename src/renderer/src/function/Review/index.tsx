import { Template } from '@renderer/components/Layout/Template'
import layout_styles from './layout-styles.module.scss'
import styles from './styles.module.scss'
import Papa from 'papaparse'
import axios from 'axios'
import { useState } from 'react'
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
          <button
            onClick={() => {
              axios.get('http://localhost:3001/api/review-items').then((res) => {
                console.log(res.data)
              })
            }}
          >
            获取文件
          </button>
        </header>
      }
      main={<div>Review</div>}
      asider={<aside className={layout_styles['review-asider']}></aside>}
      footer={<footer className={layout_styles['review-footer']}></footer>}
    />
  )
}
