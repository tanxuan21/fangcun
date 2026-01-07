import { Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useReviewSet } from '../ctx'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'

export const AddContent = () => {
  const { setCoverState } = useReviewSet()
  return (
    <div>
      <TextArea placeholder="please typing question"></TextArea>
      <TextArea placeholder="please typing answer"></TextArea>
      <Button type="primary" onClick={() => setCoverState(CoverLayerState.hidden)}>
        submit
      </Button>
      <Button onClick={() => setCoverState(CoverLayerState.hidden)}>discard</Button>
    </div>
  )
}
