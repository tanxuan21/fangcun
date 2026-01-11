import { Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useReviewSet } from '../ctx'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
import { MDXRender } from '../../../components/MarkdownRender/MDXRender'
import { useState } from 'react'
import { ReviewItemAxios, ReviewSetAxios } from '../api'
import { ReviewContentTypeEnum } from '../../../../../../common/review'
import styles from './window-page-skeleton-styles.module.scss'
import { QARender } from './ContetRenderer/QARender'
export const AddContent = () => {
  const { setCoverState } = useReviewSet()
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const { reviewSet } = useReviewSet()
  return (
    <div className={styles['window-page-skeleton-container']}>
      <main>
        <QARender q={q} a={a} setQ={setQ} setA={setA} q_mode={'edit'} a_mode={'edit'}></QARender>
      </main>
      <footer>
        <Button
          type="primary"
          onClick={async () => {
            if (!reviewSet) {
              alert('没有 review set，错误')
              return
            }
            try {
              console.log('submit', q, a)
            } catch (e) {
              // TODO 弹窗报错
            }
            setCoverState(CoverLayerState.hidden)
          }}
        >
          submit
        </Button>
        <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
      </footer>
    </div>
  )
}
