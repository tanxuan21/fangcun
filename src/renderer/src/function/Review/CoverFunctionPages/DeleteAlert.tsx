import { Button } from 'antd'
import { useReviewSet } from '../ctx'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'

export const DeleteAlter = () => {
  const { OperReviewItem, setCoverState } = useReviewSet()
  return (
    <div>
      Are you sure to delete this item?
      {/* TODO 未来写专门的 Content 渲染组件 */}
      <p>{OperReviewItem?.content.q}</p>
      <br />
      <p>{OperReviewItem?.content.a}</p>
      <br />
      <br />
      <Button
        danger
        color="red"
        type="primary"
        onClick={() => setCoverState(CoverLayerState.hidden)}
      >
        delete
      </Button>
      <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
    </div>
  )
}
