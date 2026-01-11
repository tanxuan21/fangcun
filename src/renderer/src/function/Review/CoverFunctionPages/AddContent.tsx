import { Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useReviewSet } from '../ctx'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
import { MDXRender } from '../../../components/MarkdownRender/MDXRender'
import { useState } from 'react'
import { ReviewItemAxios, ReviewSetAxios } from '../api'
import { ReviewContentTypeEnum } from '../../../../../../common/review'

export const AddContent = () => {
  const { setCoverState } = useReviewSet()
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const { reviewSet } = useReviewSet()
  return (
    <div>
      {/* <TextArea placeholder="please typing question"></TextArea>
      <TextArea placeholder="please typing answer"></TextArea> */}
      <MDXRender mode="edit" markdown={q} onChange={(v) => setQ(v)}></MDXRender>
      <MDXRender mode="edit" markdown={a} onChange={(v) => setA(v)}></MDXRender>
      <Button
        type="primary"
        onClick={async () => {
          if (!reviewSet) {
            alert('没有 review set，错误')
            return
          }
          try {
            const resp = await ReviewItemAxios.post('', {
              type: ReviewContentTypeEnum.qa,
              content: { q, a }
            })
            await ReviewSetAxios.post('/add-review-item', {
              review_set_id: reviewSet.id,
              review_item_id: resp.data.id
            })
          } catch (e) {
            // TODO 弹窗报错
          }
          setCoverState(CoverLayerState.hidden)
        }}
      >
        submit
      </Button>
      <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
    </div>
  )
}
