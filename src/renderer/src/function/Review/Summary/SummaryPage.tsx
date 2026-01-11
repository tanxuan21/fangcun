import { useEffect, useState } from 'react'
import { useReviewSet } from '../ctx'
import layout_styles from './styles.module.scss'
import { IReview, IReviewItem } from '../../../../../../types/review/review'
import { ReviewAxios, ReviewItemAxios } from '../api'
import { PageReviewItem } from '../types'
import { CoverLayerState } from '@renderer/components/CoverPageContainer'
import { getRelativeTime } from '@renderer/utils/time'
import { Tag } from 'antd'
import { MDXRender } from '../../../components/MarkdownRender/MDXRender'
import { IconTail, IconTailHover, Icon } from '../../../components/Icon/index'
export const SummaryPage = () => {
  // 总数据
  //   const [summaryData, setSummaryData] = useState<IReviewItem[]>()
  const { ReviewItems, setReviewSet, reviewSet } = useReviewSet()
  enum SummaryType {
    // 切换检视类型
    review_items = 0,
    reviews
  }

  const [currentSummaryType, setCurrentSummaryType] = useState(SummaryType.review_items)

  // 进入这个 page 就要重新获取 ReviewItems。
  useEffect(() => {
    if (reviewSet) setReviewSet({ ...reviewSet })
  }, [])

  // 复习数据
  const [currentReviewItemId, setCurrentReviewItemId] = useState<number>(0)
  const [reviewsList, setReviewList] = useState<IReview[]>([])
  const fetchData = async () => {
    const res = await ReviewAxios.get('', {
      params: {
        item_id: currentReviewItemId
      }
    })
    setReviewList(res.data.data)
  }
  useEffect(() => {
    fetchData()
  }, [currentReviewItemId])

  const QA = ({ q, a }: { q: string; a: string }) => {
    return (
      <div className={layout_styles['summary-table-qatd']}>
        <div className={layout_styles['summary-table-q']}>
          <MDXRender markdown={q} mode="preview"></MDXRender>
        </div>
        <div className={layout_styles['summary-table-a']}>
          <MDXRender markdown={a} mode="preview"></MDXRender>
        </div>
      </div>
    )
  }
  const { setCoverState, setOperReviewItem, setOperType } = useReviewSet()
  // TODO 根据 type 分发 content 组件
  const ContentTD = ({ item }: { item: PageReviewItem }) => {
    return (
      <td className={` ${layout_styles['summary-table-content-td']}`}>
        {/* <button
          onClick={() => {
            setCoverState(CoverLayerState.visible)
            setOperReviewItem(item) // 设置当前操作 item
            setOperType('edit') // 设置当前操作类型
          }}
          className={layout_styles['summary-table-edit-button']}
        >
          edit
        </button> */}
        <IconTailHover
          className={layout_styles['summary-table-edit-button']}
          onClick={() => {
            setCoverState(CoverLayerState.visible)
            setOperReviewItem(item) // 设置当前操作 item
            setOperType('edit') // 设置当前操作类型
          }}
          IconName="#icon-bianji"
        ></IconTailHover>
        <QA q={item.content.q} a={item.content.a}></QA>
      </td>
    )
  }

  // state 组件
  const StateTag = ({ item }: { item: IReviewItem }) => {
    // 新添加的，未更新
    // 今天需要复习 next_review_at <= today
    // 今天复习完 last_reviewed_at === today
    // 今天不必复习 next_review_at > today && last_reviewed_at < today
    const nextDiff = getRelativeTime(item.next_review_at)
    const lastDiff = getRelativeTime(item.last_reviewed_at)
    if (lastDiff === 0) return <Tag color="green">finish</Tag>
    if (nextDiff <= 0) return <Tag color="orange">today</Tag>
    if (lastDiff < 0) return <Tag color="blue">future</Tag>
    return <Tag color="red">unsave</Tag>
  }

  const getRelativeTimeString = (timeString: string) => {
    const relativeTime = getRelativeTime(timeString)
    if (relativeTime === 0) return '今天'
    else if (relativeTime > 0) return `${relativeTime}天后`
    else return `${Math.abs(relativeTime)}天前`
  }
  return (
    <div
      className={`${layout_styles['summary-table-container']} ${layout_styles['fill-container']}`}
    >
      <header className={layout_styles['controller-header']}>
        <section className={layout_styles['left-group']}>
          <IconTailHover
            onClick={() => setCurrentSummaryType(SummaryType.review_items)}
            IconName="#icon-shouqi"
          ></IconTailHover>
          <IconTailHover
            IconName="#icon-shuaxin"
            onClick={() => {
              if (reviewSet) setReviewSet({ ...reviewSet })
            }}
          ></IconTailHover>
        </section>
        <section className={layout_styles['right-group']}>
          <IconTailHover
            onClick={() => {
              setCoverState(CoverLayerState.visible)
              setOperType('add')
            }}
            IconName="#icon-jia"
          ></IconTailHover>
        </section>
        {/* <button
          onClick={async () => {
            if (ReviewItems)
              for (const item of ReviewItems) {
                await ReviewItemAxios.delete('', { params: { id: item.id } })
              }
          }}
        >
          del all
        </button> */}
      </header>
      <main>
        {ReviewItems && (
          <>
            {currentSummaryType === SummaryType.review_items ? (
              <table>
                <thead>
                  <tr>
                    <th>state</th>
                    <th>Content</th>
                    <th>created_at</th>
                    <th>last_reviewed</th>
                    <th>next_review</th>
                    <th>level</th>
                    <th>arrange_at</th>
                    <th>Oper</th>
                  </tr>
                </thead>
                <tbody>
                  {ReviewItems?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <StateTag item={item}></StateTag>
                      </td>

                      <ContentTD item={item}></ContentTD>

                      <td>{item.created_at}</td>
                      <td>{getRelativeTimeString(item.last_reviewed_at)}</td>
                      <td>{getRelativeTimeString(item.next_review_at)}</td>
                      <td>{item.level}</td>
                      <td>{getRelativeTimeString(item.arrange_review_at)}</td>
                      <td>
                        <div className={layout_styles['operation-container']}>
                          <IconTailHover
                            onClick={() => {
                              setCoverState(CoverLayerState.visible)
                              setOperType('delete')
                              setOperReviewItem(item)
                            }}
                            IconName="#icon-shanchu"
                            className={layout_styles['icon']}
                          ></IconTailHover>

                          <IconTailHover
                            onClick={() => {
                              setCurrentReviewItemId(item.id)
                              setCurrentSummaryType(SummaryType.reviews)
                            }}
                            IconName="#icon-a-fuxi-line"
                            className={layout_styles['icon']}
                          ></IconTailHover>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>create_at</th>
                      <th>rate</th>
                      <th>remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsList.map((item) => (
                      <tr key={item.id}>
                        <td>{item.created_at}</td>
                        <td>{item.rate}</td>
                        <td>{item.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
