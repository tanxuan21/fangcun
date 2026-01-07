import { Template } from '@renderer/components/Layout/Template'
import layout_styles from './layout-styles.module.scss'
import styles from './styles.module.scss'
import Papa from 'papaparse'
import axios, { AxiosError } from 'axios'
import TextArea from 'antd/es/input/TextArea'
import { useContext, useEffect, useRef, useState } from 'react'
import { Button, Empty, Tag, message } from 'antd'
import { getRelativeTime, GetTodayTimeBegin2End } from '@renderer/utils/time'
import {
  GetReviewItemsMode,
  IReviewItem,
  IReview,
  Iqa,
  IReviewSet
} from '../../../../../types/review/review'
import { ReviewContentTypeEnum, ReviewRate } from '../../../../../common/review/index'
import { ReviewAxios, ReviewItemAxios, ReviewSetAxios } from './api'
import { shuffleArray } from '@renderer/utils'
import { EditableInput } from '../../components/Editable/EditableInput/EditableInput'
import { ReviewSetContext, useReviewSet } from './ctx'
import React from 'react'
import { DefaultSetting, Setting } from './Setting'
import { CoverLayerState, CoverPageContainer } from '@renderer/components/CoverPageContainer'
import { CoverWindow, EditContent } from './CoverFunctionPages/EditContent'
import { ReviewCoverFunctionPage } from './CoverFunctionPages/ReviewCoverFunctionPage'
import { PageReviewItem } from './types'
import { set } from 'lodash'

enum PageTags {
  Review = 0,
  Summary,
  Setting
}

const ReadCSV = (file: File, handleData: (datas: any[]) => Promise<void>) => {
  // 文件读取器
  const reader = new FileReader()
  reader.onload = async (e) => {
    console.log('result', e.target?.result)
    const result = e.target?.result
    if (result) {
      const parse_result = Papa.parse<{ q: string; a: string }>(result as string, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // 自动类型转换
        transformHeader: (header) => header.trim(), // 清理表头
        transform: (value: string, field: string | number) => {
          // 自定义转换
          if (field === 'isActive') {
            return value.toLowerCase() === 'true'
          }
          return value
        }
      })
      handleData(parse_result.data)
    }
  }
  reader.onerror = (e) => {
    console.log(e)
  }
  reader.readAsText(file)
}

export const ReviewWithContext = () => {
  const [reviewSet, setReviewSet] = useState<IReviewSet | null>(null)
  const [coverState, setCoverState] = useState(CoverLayerState.hidden)
  const [ReviewItems, setReviewItems] = useState<PageReviewItem[]>([])
  useEffect(() => {
    ;(async () => {
      if (reviewSet && reviewSet.id !== -1) {
        // TODO 自动获取 review_items 方便后续引用
        // 粘贴自 Summary 组件，这个数据比较完整
        const resp = await ReviewSetAxios.get('/review-items', { params: { set_id: reviewSet.id } })
        const data = resp.data['data'].map((item) => {
          return {
            ...item,
            // 兼容 ReviewPage 所需要的字段
            worseSelect: ReviewRate.Ican,
            total_count: 1,
            remains: 1,
            content: JSON.parse(item.content)
          }
        })
        setReviewItems(data)
      }
    })()
  }, [reviewSet])
  return (
    <ReviewSetContext.Provider
      value={{
        reviewSet,
        setReviewSet,
        coverState,
        setCoverState,
        setReviewItems,
        ReviewItems
      }}
    >
      <Review></Review>
    </ReviewSetContext.Provider>
  )
}
export const Review = () => {
  const [files, setFiles] = useState<File[]>([])

  const [currentPage, setCurrentPage] = useState<PageTags>(PageTags.Summary)
  const FileInputRef = useRef<HTMLInputElement>(null)
  const [showAside, setShowAsider] = useState(true)
  const { coverState, setCoverState } = useReviewSet()

  // TODO 设置 set_id。 往后的所有步骤都随着 set_id 变更。
  return (
    <Template
      header={
        <header className={layout_styles['review-header']}>
          <div className={layout_styles['review-page-layout-function-wrapper']}>
            <span onClick={() => setShowAsider(!showAside)}>aside</span>
            <input
              style={{ display: 'none' }}
              ref={FileInputRef}
              onChange={async (e) => {
                if (e.target.files) {
                  setFiles(Array.from(e.target.files))
                  const file = e.target.files[0]
                  if (!file) return
                  ReadCSV(file, async (datas) => {
                    for (const item of datas) {
                      const data = {
                        type: 0,
                        content: JSON.stringify({ q: item.q, a: item.a }, null, 2)
                      }
                      const resp = await axios.post('http://localhost:3001/api/review-items', data)
                      console.log(resp)
                    }
                  })
                  e.target.value = ''
                }
              }}
              type="file"
              id="fileInput"
              accept=".txt,.csv,.json,.html,.js,.css,.xml"
            ></input>
            <span
              onClick={() => {
                if (FileInputRef.current) FileInputRef.current.click()
              }}
            >
              upload
            </span>
          </div>
          <div className={layout_styles['review-tags-wapper']}>
            <span onClick={() => setCurrentPage(PageTags.Review)}>review</span>
            <span onClick={() => setCurrentPage(PageTags.Summary)}>summary</span>
            <span onClick={() => setCurrentPage(PageTags.Setting)}>setting</span>
          </div>
        </header>
      }
      main={<MainPages currentPage={currentPage}></MainPages>}
      asider={showAside && <ReviewAsider></ReviewAsider>}
      footer={<footer className={layout_styles['review-footer']}></footer>}
      //   TODO 数据全部改为 Context。在 Conetxt 里，所有的组件都响应式更新。
      cover={<ReviewCoverFunctionPage></ReviewCoverFunctionPage>}
    />
  )
}

const ReviewAsider = () => {
  const [reviewSetList, setReviewSetList] = useState<IReviewSet[]>([])
  const { reviewSet, setReviewSet } = useReviewSet()
  useEffect(() => {
    ;(async () => {
      const data = await ReviewSetAxios.get('')
      const raw_list = data.data.data

      setReviewSetList([
        ...raw_list.map((item) => {
          try {
            // TODO 解析setting 格式。是否有误/缺失
            const setting = JSON.parse(item.setting)
            console.log('setting', setting)
            return { ...item, setting }
          } catch (e) {
            return { ...item, setting: DefaultSetting }
          }
        })
      ])
    })()
  }, [])

  const ReviewSetEntryItem = ({ item }: { item: IReviewSet }) => {
    const FileInputRef = useRef<HTMLInputElement>(null)
    return (
      <div
        className={layout_styles['review-set-card-container']}
        onClick={() => {
          setReviewSet(item) // Ctx 设置 set
        }}
      >
        <p>{item.name}</p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (FileInputRef.current) FileInputRef.current.click()
          }}
        >
          add
        </button>
        <input
          ref={FileInputRef}
          style={{ display: 'none' }}
          type="file"
          accept=".txt,.csv,.json,.html,.js,.css,.xml"
          onChange={async (e) => {
            if (e.target.files) {
              //   setFiles(Array.from(e.target.files))
              const file = e.target.files[0]
              if (!file) return
              ReadCSV(file, async (datas) => {
                for (const csv_item of datas) {
                  const data = {
                    type: 0,
                    content: JSON.stringify({ q: csv_item.q, a: csv_item.a }, null, 2)
                  }
                  try {
                    const resp = await ReviewItemAxios.post('', data)
                    console.log(resp) // 如果报错 conflict 就不会添加到 set
                    if (resp.status == 200) {
                      // 怎么判断请求成功？
                      const resp1 = await ReviewSetAxios.post('/add-review-item', {
                        review_set_id: item.id,
                        review_item_id: resp.data.data.id // 返回一个id
                      })
                      console.log(resp1)
                    }
                  } catch (error) {
                    const e = error as any
                    console.log(e.response.data.message)
                  }
                }
              })
              // 重置。
              e.target.value = ''
            }
          }}
        />
        <button
          onClick={async (e) => {
            // 删除锁：如果现在选中了，不允许删除。
            if (reviewSet?.id === item.id) {
              console.error('当前选中的，不允许删除')
              return
            }
            e.stopPropagation()
            const resp = await ReviewSetAxios.delete(``, { params: { set_id: item.id } })
            if (resp.status == 204) {
              setReviewSetList((prev) => [...reviewSetList.filter((item2) => item2.id !== item.id)])
            } else {
              console.log(resp)
            }
          }}
        >
          del
        </button>
      </div>
    )
  }
  return (
    <aside className={layout_styles['review-asider']}>
      {/* header 显示当前的 set */}
      <header className={layout_styles['review-asider-header']}>
        {reviewSet && (
          <>
            <EditableInput
              styles={{ fontSize: '20px', fontWeight: 'bold' }}
              text={reviewSet.name}
              updateText={(v) => {
                setReviewSet({ ...reviewSet, name: v })
              }}
              saveText={async (v) => {
                if (!v) return
                const resp = await ReviewSetAxios.put('', { id: reviewSet.id, name: v })
                console.log(resp)
                setReviewSet({ ...reviewSet, name: v })
                setReviewSetList(
                  reviewSetList.map((item) => (item.id === reviewSet.id ? { ...reviewSet } : item))
                )
              }}
            ></EditableInput>
            <br />
            <EditableInput
              styles={{ fontSize: '12px', color: '#777' }}
              text={reviewSet.description}
              updateText={(v) => {
                setReviewSet({ ...reviewSet, description: v })
              }}
              saveText={async (v) => {
                if (!v) return
                setReviewSet({ ...reviewSet, description: v })
                const resp = await ReviewSetAxios.put('', {
                  id: reviewSet.id,
                  description: v
                })
                console.log(resp)
              }}
            ></EditableInput>
            <p>create_at: {reviewSet.created_at}</p>
          </>
        )}
      </header>
      <main className={layout_styles['review-asider-main']}>
        {reviewSetList.map((item) => (
          <ReviewSetEntryItem item={item} key={item.id} />
        ))}
      </main>
      <footer className={layout_styles['review-asider-footer']}>
        <button
          onClick={async () => {
            const defaultSet = {
              name: 'default' + Math.floor(Math.random() * 1000),
              description: 'default',
              setting: 'default'
            }
            const resp = await ReviewSetAxios.post('', defaultSet)
            console.log('add review set', resp.data)
            // 如果添加成功，同步更新前端列表
            if (resp.status == 201) setReviewSetList([...reviewSetList, resp.data.data])
          }}
        >
          add
        </button>
      </footer>
    </aside>
  )
}

const SummaryPage = () => {
  // 总数据
  //   const [summaryData, setSummaryData] = useState<IReviewItem[]>()
  const { ReviewItems } = useReviewSet()
  enum SummaryType {
    // 切换检视类型
    review_items = 0,
    reviews
  }

  const [currentSummaryType, setCurrentSummaryType] = useState(SummaryType.review_items)

  // 复习数据
  const [currentReviewItemId, setCurrentReviewItemId] = useState<number>(0)
  const [reviewsList, setReviewList] = useState<IReview[]>([])
  useEffect(() => {
    ;(async () => {
      const res = await ReviewAxios.get('', {
        params: {
          item_id: currentReviewItemId
        }
      })
      setReviewList(res.data.data)
    })()
  }, [currentReviewItemId])

  const QA = ({ q, a }: { q: string; a: string }) => {
    return (
      <div className={layout_styles['summary-table-qatd']}>
        <div className={layout_styles['summary-table-q']}>{q}</div>
        <div className={layout_styles['summary-table-a']}>{a}</div>
      </div>
    )
  }
  // 根据 type 分发 content 组件
  const ContentTD = ({ id, type, content }: { id: number; type: number; content: Iqa }) => {
    const { setCoverState } = useReviewSet()
    return (
      <td className={` ${layout_styles['summary-table-content-td']}`}>
        <button
          onClick={() => {
            setCoverState(CoverLayerState.visible)
          }}
          className={layout_styles['summary-table-edit-button']}
        >
          edit
        </button>
        <QA q={content.q} a={content.a}></QA>
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
        <button onClick={() => setCurrentSummaryType(SummaryType.review_items)}>back</button>
        <button
          onClick={async () => {
            if (ReviewItems)
              for (const item of ReviewItems) {
                await ReviewItemAxios.delete('', { params: { id: item.id } })
              }
          }}
        >
          del all
        </button>
      </header>
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

                    <ContentTD id={item.id} type={item.type} content={item.content}></ContentTD>

                    <td>{item.created_at}</td>
                    <td>{getRelativeTimeString(item.last_reviewed_at)}</td>
                    <td>{getRelativeTimeString(item.next_review_at)}</td>
                    <td>{item.level}</td>
                    <td>{getRelativeTimeString(item.arrange_review_at)}</td>
                    <td>
                      <div className={layout_styles['operation-container']}>
                        <button>del</button>
                        <button
                          onClick={() => {
                            setCurrentReviewItemId(item.id)
                            setCurrentSummaryType(SummaryType.reviews)
                          }}
                        >
                          review
                        </button>
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
    </div>
  )
}

const ReviewPage = () => {
  enum ReviewStages {
    Disable = 0, // 不可用。比如出现网络错误等情况
    PrepareReviewItem, // 程序准备复习数据，从队列里获取
    // 准备完毕，自动转移到复习界面
    Review, // 面对问题复习
    // 按按钮，选择自己是否掌握
    Check, // 检查答案，是是否掌握
    // 填写评论，必要时修改掌握按钮，提交此次复习
    Submitting, // 网络请求中
    Finish
  }
  const { reviewSet, setReviewSet, ReviewItems } = useReviewSet()

  const [currentStage, setCurrentStage] = useState(ReviewStages.Disable)
  const [currentReviewItem, setCurrentReviewItem] = useState<PageReviewItem>()
  const [currentReviewItemIdx, setCurrentReviewItemIdx] = useState<number>(0)
  const [currentReviewData, setCurrentReviewData] = useState<Partial<IReview>>({
    rate: ReviewRate.UnSelect,
    remark: '',
    item_id: -1
  })
  // 为了键盘事件的引用
  const currentStageRef = useRef(currentStage)
  const currentReviewDataRef = useRef(currentReviewData)
  useEffect(() => {
    currentStageRef.current = currentStage
  }, [currentStage])
  useEffect(() => {
    currentReviewDataRef.current = currentReviewData
  }, [currentReviewData])
  const clearCurrentReviewData = () => {
    setCurrentReviewData({
      rate: ReviewRate.UnSelect,
      remark: '',
      item_id: -1
    })
  }
  const [reviewItemList, setReviewItemList] = useState<
    PageReviewItem[] // 需要一个最差的选择，根据此来更新 level。
  >([])
  const [ReviewQueue, setReviewQueue] = useState<number[]>([])
  const hasFetchedRef = useRef(false) // ref 标记，用于阻止严格模式下调用两次 useEffect 的副作用
  useEffect(() => {
    ;(async () => {
      try {
        // 这里是拦不住的。因为useEffect调用两次，两次调用之间不会有阻塞。所以
        // 两次调用都会看到空的 reviewItemQueue，并且请求数据
        // if (hasFetchedRef.current) {
        //   console.warn('已经获取数据，请勿重复获取')
        //   return
        // }
        // hasFetchedRef.current = true
        // if (!reviewSet) {
        //   console.error('没有reviewSet，请选择')
        //   return
        // }
        // const getParams: { mode: GetReviewItemsMode; review_set_id: number } = {
        //   mode: 'today-review',
        //   review_set_id: reviewSet.id
        // }
        // const result = await ReviewItemAxios.get('', {
        //   params: getParams
        // })
        // const result_data = [
        //   ...result.data.data.map((item) => ({
        //     ...item,
        //     worseSelect: ReviewRate.Ican,
        //     total_count: 1,
        //     remains: 1,
        //     content: JSON.parse(item.content) // 解析 content
        //   }))
        // ].filter((item) => {
        //   // 过滤掉不必复习的。也就是今天已经复习过的
        //   const { begin, end } = GetTodayTimeBegin2End()
        //   const condition = item.last_reviewed_at >= begin && item.last_reviewed_at <= end
        //   return !condition
        // })
        const result_data = ReviewItems.filter((item) => {
          // 过滤掉不必复习的。也就是今天已经复习过的
          const { begin, end } = GetTodayTimeBegin2End()
          const condition = item.last_reviewed_at >= begin && item.last_reviewed_at <= end
          return !condition
        })
        // console.log(result, result_data)
        // 设置前端数据...
        setReviewItemList(result_data)
        for (let i = 0; i < result_data.length; i++) ReviewQueue.push(i)
        shuffleArray(ReviewQueue)
        setCurrentStage(ReviewStages.PrepareReviewItem)
      } catch (e) {
        setCurrentStage(ReviewStages.Disable)
        console.error(e)
      }
    })()

    // 快捷键事件
    const handleKeyDown = (e: KeyboardEvent) => {
      const StateTransfer = () => {
        if (currentStageRef.current === ReviewStages.Review) {
          setCurrentStage(ReviewStages.Check)
        }
      }
      console.log(e.key)
      if (e.key === 'q') {
        StateTransfer()
        setCurrentReviewData({ ...currentReviewDataRef.current, rate: ReviewRate.Icant })
      } else if (e.key === 'w') {
        StateTransfer()
        setCurrentReviewData({ ...currentReviewDataRef.current, rate: ReviewRate.trying })
      } else if (e.key === 'e') {
        StateTransfer()
        setCurrentReviewData({ ...currentReviewDataRef.current, rate: ReviewRate.Ican })
      } else if (e.key === 'Enter') {
        // 提交
        if (currentStageRef.current === ReviewStages.Check) {
          handleSubmit(currentStageRef.current)
        }
      }
    }

    //window.addEventListener('keydown', handleKeyDown)

    return () => {
      //window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  useEffect(() => {
    if (currentStage === ReviewStages.PrepareReviewItem) {
      try {
        // 生成队列取出item，状态转移到 Review
        // 判断队列空
        if (ReviewQueue.length === 0) {
          setCurrentStage(ReviewStages.Finish)
          return
        }
        const idx = ReviewQueue.shift()!
        setCurrentReviewItemIdx(idx)
        const item = reviewItemList[idx]
        // console.log('新item', item, ReviewQueue)
        setCurrentReviewItem(item)
        // currentReviewData.item_id = item.id
        setCurrentReviewData({ ...currentReviewData, item_id: item.id })
        setCurrentStage(ReviewStages.Review)
        // 获取失败，转移到Disable状态
      } catch (e) {
        setCurrentStage(ReviewStages.Disable)
        console.error(e)
      }
    }
  }, [currentStage])

  // 按钮高阶函数
  const btnFn = (rateType: ReviewRate) => {
    return () => {
      if (currentStage === ReviewStages.Review) {
        setCurrentStage(ReviewStages.Check)
      }
      if (currentStage === ReviewStages.Check || currentStage === ReviewStages.Review)
        setCurrentReviewData({ ...currentReviewData, rate: rateType })
    }
  }

  const handleSubmit = async (currentStage: ReviewStages) => {
    // 不必要写这个参数，可以直接访问 ref 但是既然已经传入了，算了。
    if (currentStage !== ReviewStages.Check) return
    setCurrentStage(ReviewStages.Submitting)
    try {
      const resp = await ReviewAxios.post('', {
        item_id: currentReviewDataRef.current.item_id,
        rate: currentReviewDataRef.current.rate,
        remark: currentReviewDataRef.current.remark
      })
      //console.log('submit', resp)
      console.log(ReviewQueue)
      // TODO 根据setting的内容，将不会的内容传入队尾，继续复习
      if (currentReviewDataRef.current.rate === ReviewRate.trying) {
        // 这里容易犯一个逻辑错误。用户选择 trying，就是希望后面再复习两次。如果队列里不足两次，向队尾插入到两次；如果大于等于两次，算了。

        let count = 0
        for (const i of ReviewQueue) if (i === currentReviewItemIdx) count++

        while (count < reviewSet?.setting['review_count']['trying']) {
          count++
          ReviewQueue.push(currentReviewItemIdx)
        }
        setReviewQueue([...ReviewQueue])

        // 这里得设置 ReviewItemList 的内容
        if (currentReviewItem)
          setCurrentReviewItem({ ...currentReviewItem, remains: count, total_count: count })
        setReviewItemList([
          ...reviewItemList.map((item, idx) => {
            if (idx === currentReviewItemIdx) return { ...item, remains: count, total_count: count }
            return item
          })
        ])
      } else if (currentReviewDataRef.current.rate === ReviewRate.Icant) {
        let count = 0
        for (const i of ReviewQueue) if (i === currentReviewItemIdx) count++
        while (count < reviewSet?.setting['review_count']['Icant']) {
          count++
          ReviewQueue.push(currentReviewItemIdx)
        }
        setReviewQueue([...ReviewQueue])
        if (currentReviewItem)
          setCurrentReviewItem({ ...currentReviewItem, remains: count, total_count: count })
        setReviewItemList([
          ...reviewItemList.map((item, idx) => {
            if (idx === currentReviewItemIdx) return { ...item, remains: count, total_count: count }
            return item
          })
        ])
      } else if (currentReviewDataRef.current.rate === ReviewRate.Ican) {
        if (currentReviewItem)
          setCurrentReviewItem({ ...currentReviewItem, remains: currentReviewItem.remains - 1 })
        setReviewItemList([
          ...reviewItemList.map((item, idx) => {
            if (idx === currentReviewItemIdx) return { ...item, remains: item.remains - 1 }
            return item
          })
        ])
      }

      const arrange_resp = await ReviewItemAxios.post('/arrange', {
        id: currentReviewDataRef.current.item_id
      })
      console.log('arrange', arrange_resp)

      setCurrentStage(ReviewStages.PrepareReviewItem)
      clearCurrentReviewData()
    } catch (e) {
      setCurrentStage(ReviewStages.Disable)
      console.error(e)
    }
  }
  return (
    <div className={`${layout_styles['review-main-container']} ${layout_styles['fill-container']}`}>
      {currentStage === ReviewStages.Finish ? (
        <div className={layout_styles['review-finish-page-container']}>Congratulation! Finish</div>
      ) : (
        <>
          {/* 问题展示区 */}
          <div className={layout_styles['review-content-container']}>
            {currentReviewItem ? (
              <>
                <p className={layout_styles['review-q']}>
                  {currentReviewItem.content.q}
                  <span
                    className={layout_styles['review-item-progresser']}
                  >{`${currentReviewItem.total_count - currentReviewItem.remains}/${currentReviewItem.total_count}`}</span>
                </p>
                {currentStage === ReviewStages.Check && (
                  <p className={layout_styles['review-a']}>{currentReviewItem.content.a}</p>
                )}
              </>
            ) : (
              <Empty description="waiting..." />
            )}
          </div>
          {/* 操作区 */}
          <div className={layout_styles['review-operation-container']}>
            <div className={layout_styles['review-operation-button-rate-container']}>
              <button
                className={`${layout_styles['button']} ${layout_styles['Icant']} ${currentReviewData.rate === ReviewRate.Icant ? layout_styles['active'] : layout_styles['idle']}`}
                onClick={btnFn(ReviewRate.Icant)}
              >
                I can't
              </button>
              <button
                className={`${layout_styles['button']} ${layout_styles['trying']} ${currentReviewData.rate === ReviewRate.trying ? layout_styles['active'] : layout_styles['idle']}`}
                onClick={btnFn(ReviewRate.trying)}
              >
                trying...
              </button>

              <button
                className={`${layout_styles['button']} ${layout_styles['Ican']} ${currentReviewData.rate === ReviewRate.Ican ? layout_styles['active'] : layout_styles['idle']}`}
                onClick={btnFn(ReviewRate.Ican)}
              >
                I can!
              </button>
            </div>
            <p className={layout_styles['textarea-reminder']}>
              something remark up about this review... ...
            </p>
            <TextArea
              rows={4}
              onChange={(e) => {
                currentReviewData.remark = e.target.value
                setCurrentReviewData({ ...currentReviewData })
              }}
              value={currentReviewData.remark}
              placeholder="I remenber... but..."
            />
          </div>
          <footer className={layout_styles['review-footer']}>
            <Button onClick={() => handleSubmit(currentStage)}>submit</Button>
          </footer>
        </>
      )}
    </div>
  )
}

const MainPages = ({ currentPage }: { currentPage: PageTags }) => {
  const { reviewSet, setReviewSet } = useReviewSet()
  switch (currentPage) {
    case PageTags.Summary:
      return <SummaryPage></SummaryPage>
      break
    case PageTags.Review:
      return <ReviewPage key={reviewSet && reviewSet.id}></ReviewPage> // ReviewPage 强制刷新。
      break
      defaule: return <div>Default</div>
    case PageTags.Setting:
      return <Setting></Setting>
      break
  }
}
