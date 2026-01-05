import TextArea from 'antd/es/input/TextArea'
import { ReviewContentType } from '../../../../../../types/review/review'
import { ReviewContentTypeEnum } from '../../../../../../common/review'
import styles from './styles.module.scss'
interface props {
  type: ReviewContentTypeEnum
  content: ReviewContentType
}
export const EditContent = ({ type, content }: props) => {
  switch (type) {
    case ReviewContentTypeEnum.qa:
      return (
        <div>
          <TextArea
            rows={4}
            placeholder="请输入问题"
            value={content.q}
            onChange={(e) => {
              content.q = e.target.value
            }}
          />
          <TextArea rows={4} placeholder="请输入答案" value={content.a} onChange={(e) => {}} />
        </div>
      )
    default:
      return <>未知类型</>
  }
}

export const CoverWindow = ({
  handleClose,
  children
}: {
  handleClose?: () => void
  children: React.ReactNode
}) => {
  return (
    <div className={styles['cover-window']}>
      {/* 关闭按钮 */}
      <header className={styles['cover-window-header']}>
        <button onClick={handleClose}>close</button>
      </header>
      <main className={styles['cover-window-main']}>{children}</main>
    </div>
  )
}
