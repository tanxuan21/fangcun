import path from 'path'
import fs from 'fs'

export const SavePic = async (event, base64Data, filename) => {
  try {
    // 去掉Data URL前缀
    const base64String = base64Data.replace(/^data:image\/png;base64,/, '')

    // 将Base64字符串转为Buffer
    const buffer = Buffer.from(base64String, 'base64')

    // 指定文件保存路径
    const filePath = path.join('D:\\FangCun\\fangcun\\temp', filename)

    // 保存文件
    await fs.promises.writeFile(filePath, buffer)
    return { success: true, filePath }
  } catch (error) {
    console.error('Error saving file:', error)
    return { success: false, error: 'error.message' }
  }
}

export const LoadPic = async (event, filename) => {
  const data = await fs.promises.readFile(path.join('D:\\FangCun\\fangcun\\temp', filename))
  return `data:image/png;base64,${data.toString('base64')}`
}
