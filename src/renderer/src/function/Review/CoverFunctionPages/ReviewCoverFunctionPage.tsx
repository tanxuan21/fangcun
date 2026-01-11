import { CoverLayerState, CoverPageContainer } from '@renderer/components/CoverPageContainer'
import { useReviewSet } from '../ctx'
import { EditContent } from './EditContent'
import { CoverWindow } from './CoverWindow/CoverWindow'
import { ReviewContentTypeEnum } from '../../../../../../common/review'
import { CoverFunctionType } from '../types'
import { AddContent } from './AddContent'
import { DeleteAlter } from './DeleteAlert'

export const ReviewCoverFunctionPage = () => {
  const { coverState, setCoverState, OperType } = useReviewSet()

  const handleCallback = () => {
    switch (OperType) {
      case 'add':
        return <AddContent></AddContent>
      case 'edit':
        return <EditContent></EditContent>
      case 'delete':
        return <DeleteAlter></DeleteAlter>
      default:
        return <></>
    }
  }

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
            {handleCallback()}
          </CoverWindow>
        </div>
      }
    />
  )
}
