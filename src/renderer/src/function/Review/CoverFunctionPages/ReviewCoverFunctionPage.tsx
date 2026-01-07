import { CoverLayerState, CoverPageContainer } from '@renderer/components/CoverPageContainer'
import { useReviewSet } from '../ctx'
import { CoverWindow, EditContent } from './EditContent'
import { ReviewContentTypeEnum } from '../../../../../../common/review'

export const ReviewCoverFunctionPage = () => {
  const { coverState, setCoverState } = useReviewSet()
  return (
    <CoverPageContainer
      state={coverState}
      children={
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CoverWindow handleClose={() => setCoverState(CoverLayerState.hidden)}>
            <EditContent type={ReviewContentTypeEnum.qa} content={{ q: 'q', a: 'a' }}></EditContent>
          </CoverWindow>
        </div>
      }
    />
  )
}
