import React, { useState } from 'react'
import Papa, { ParseResult } from 'papaparse'
import { message } from 'antd'
const DragAndDropCSVUploader = () => {
  type CSVRow = Record<string, string>
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [dragOver, setDragOver] = useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]

    if (file && file.type === 'text/csv') {
      readCSV(file)
    } else {
      messageApi.success('please upload csv file!')
    }
  }

  const readCSV = (file) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CSVRow>) => {
        setCsvData(results.data)
        console.log('解析结果:', results.data)
      },
      error: (err) => {
        console.error('解析失败:', err)
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
        style={{
          border: '2px dashed #888',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: dragOver ? '#eee' : '#fff',
          transition: 'background-color 0.3s',
          marginBottom: '20px'
        }}
      >
        拖拽 CSV 文件到此区域上传
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
        )}
      </div>
    </>
  )
}

export default DragAndDropCSVUploader
