import { Button } from 'antd'
import { useReviewSet } from '../ctx'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
import styles from './window-page-skeleton-styles.module.scss'
import { MDXRender } from '../../../components/MarkdownRender/MDXRender'
import { QARender } from './ContetRenderer/QARender'
export const DeleteAlter = () => {
  const { OperReviewItem, setCoverState } = useReviewSet()
  return (
    <div className={styles['window-page-skeleton-container']}>
      <header>Are you sure to delete this item?</header>
      <main>
        {/* TODO 未来写专门的 Content 渲染组件 */}
        <QARender
          q={OperReviewItem?.content.q}
          a={OperReviewItem?.content.a}
          q_mode={'preview'}
          a_mode={'preview'}
        ></QARender>
      </main>
      <footer>
        <Button
          danger
          color="red"
          type="primary"
          onClick={() => setCoverState(CoverLayerState.hidden)}
        >
          delete
        </Button>
        <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
      </footer>
    </div>
  )
}
