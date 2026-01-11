import { Button } from 'antd'
import { useReviewSet } from '../ctx'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
import styles from './window-page-skeleton-styles.module.scss'
import { MDXRender } from '../../../components/MarkdownRender/MDXRender'
import { QARender } from './ContetRenderer/QARender'
import { ReviewItemAxios } from '../api'
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
          onClick={async () => {
            try {
              if (!OperReviewItem) throw new Error('OperReviewItem is null')
              const resp = await ReviewItemAxios.delete('', { params: { id: OperReviewItem.id } })
              console.log(resp.data)
              setCoverState(CoverLayerState.hidden)
            } catch (e) {
              alert('删除失败')
              console.log(e)
            }
          }}
        >
          delete
        </Button>
        <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
      </footer>
    </div>
  )
}
