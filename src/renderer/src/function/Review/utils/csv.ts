import Papa from 'papaparse'

export const ReadCSV = (file: File, handleData: (datas: any[]) => Promise<void>) => {
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
      handleData(parse_result.data)
    }
  }
  reader.onerror = (e) => {
    console.log(e)
  }
  reader.readAsText(file)
}
