import TextArea from 'antd/es/input/TextArea'
import { ReviewContentType } from '../../../../../../types/review/review'
import { ReviewContentTypeEnum } from '../../../../../../common/review'
import styles from './styles.module.scss'
import { useReviewSet } from '../ctx'
import { Button } from 'antd'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
interface props {
  type: ReviewContentTypeEnum
  content: ReviewContentType
}
export const EditContent = () => {
  // 拿数据
  const { OperReviewItem, setCoverState } = useReviewSet()
  if (OperReviewItem)
    switch (OperReviewItem.type) {
      case ReviewContentTypeEnum.qa:
        return (
          <div>
            <TextArea
              rows={4}
              value={OperReviewItem.content.q}
              onChange={(e) => {
                OperReviewItem.content.q = e.target.value
              }}
            />
            <TextArea rows={4} value={OperReviewItem.content.a} onChange={(e) => {}} />

            <Button onClick={() => setCoverState(CoverLayerState.hidden)}>submit</Button>
            <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
            <Button>restore</Button>
          </div>
        )
      default:
        return <>未知类型</>
    }
  else return <></>
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
