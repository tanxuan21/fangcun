import TextArea from 'antd/es/input/TextArea'
import { ReviewContentType } from '../../../../../../types/review/review'
import { ReviewContentTypeEnum } from '../../../../../../common/review'
import styles from './window-page-skeleton-styles.module.scss'
import { useReviewSet } from '../ctx'
import { Button } from 'antd'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
import { MDXRender } from '../../../components/MarkdownRender/MDXRender'
import { QARender } from './ContetRenderer/QARender'

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
          <div className={styles['window-page-skeleton-container']}>
            <main>
              <QARender
                q={OperReviewItem.content.q}
                a={OperReviewItem.content.a}
                q_mode={'edit'}
                a_mode={'edit'}
                setA={(v) => {
                  OperReviewItem.content.a = v
                }}
                setQ={(v) => {
                  OperReviewItem.content.q = v
                }}
              ></QARender>
            </main>
            <footer>
              <Button type="primary" onClick={() => setCoverState(CoverLayerState.hidden)}>
                submit
              </Button>
              <Button>restore</Button>
              <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
            </footer>
          </div>
        )
      default:
        return <>未知类型</>
    }
  else return <></>
}
