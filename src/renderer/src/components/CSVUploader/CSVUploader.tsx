import React, { ReactNode, useState } from 'react'
import Papa, { ParseResult } from 'papaparse'
import { message } from 'antd'

type CSVRow = Record<string, string>
const CSVUploader = ({
  className,
  styles,
  dragOverClassName,
  children,
  onReadComplete
}: {
  styles?: React.CSSProperties
  className?: string
  dragOverClassName?: string
  children?: ReactNode
  onReadComplete?: (result: ParseResult<CSVRow>) => void
}) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]

    if (file && file.type === 'text/csv') {
      readCSV(file)
    } else {
      messageApi.error('please upload csv file!')
    }
  }

  const readCSV = (file) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CSVRow>) => {
        onReadComplete && onReadComplete(results)
        // console.log('解析结果:', results)
      },
      error: (err) => {
        console.error('解析失败:', err)
        messageApi.error('parse csv file faild!')
      }
    })
  }

  return (
    <>
      {contextHolder}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${className} ${dragOver && dragOverClassName}`}
        style={styles}
        //   style={{
        //     border: '2px dashed #888',
        //     padding: '40px',
        //     textAlign: 'center',
        //     backgroundColor: dragOver ? '#eee' : '#fff',
        //     transition: 'background-color 0.3s',
        //     marginBottom: '20px'
        //   }}
      >
        {children}
        {/* 拖拽 CSV 文件到此区域上传
      {csvData.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>CSV 内容：</h3>
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((key, idx) => (
                  <th key={idx}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
      </div>
    </>
  )
}

export { CSVUploader }
