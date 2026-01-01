import { Template } from '@renderer/components/Layout/Template'
import layout_styles from './layout-styles.module.scss'
import styles from './styles.module.scss'
import Papa from 'papaparse'
import axios from 'axios'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useRef, useState } from 'react'
import { Button, Empty, Tag } from 'antd'
import { getRelativeTime, GetTodayTimeBegin2End } from '@renderer/utils/time'
import { GetReviewItemsMode } from '../../../../../types/review/review'
import { ReviewAxios, ReviewItemAxios } from './api'
import { shuffleArray } from '@renderer/utils'
import { cond, has, set } from 'lodash'

enum PageTags {
  Review = 0,
  Summary,
  Setting
}
export const Review = () => {
  const [files, setFiles] = useState<File[]>([])

  const ReadCSV = (file: File) => {
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
        for (const item of parse_result.data) {
          const data = {
            type: 0,
            content: JSON.stringify({ q: item.q, a: item.a }, null, 2)
          }

          const resp = await axios.post('http://localhost:3001/api/review-items', data)
          console.log(resp)
        }
      }
    }
    reader.onerror = (e) => {
      console.log(e)
    }
    reader.readAsText(file)
  }

  const [currentPage, setCurrentPage] = useState<PageTags>(PageTags.Summary)
  const FileInputRef = useRef<HTMLInputElement>(null)
  const [showAside, setShowAsider] = useState(true)
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
                  ReadCSV(file)

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
      asider={showAside && <aside className={layout_styles['review-asider']}></aside>}
      footer={<footer className={layout_styles['review-footer']}></footer>}
    />
  )
}

interface Iqa {
  q: string
  a: string
}
interface ReviewItem {
  id: number
  type: number
  content: Iqa
  created_at: string
  last_reviewed_at: string
  next_review_at: string
}
interface Review {
  id: number
  rate: number
  remark: string
  item_id: number
  created_at: string
}
const SummaryPage = () => {
  const [summaryData, setSummaryData] = useState<ReviewItem[]>()
  useEffect(() => {
    ;(async () => {
      axios.get('http://localhost:3001/api/review-items').then((res) => {
        console.log('获取 summery 信息')
        const data = res.data['data'].map((item) => {
          return {
            ...item,
            content: JSON.parse(item.content)
          }
        })
        setSummaryData(data)
      })
    })()
  }, [])

  const QAtd = ({ q, a }: { q: string; a: string }) => {
    return (
      <div className={layout_styles['summary-table-qatd']}>
        <div className={layout_styles['summary-table-q']}>{q}</div>
        <div className={layout_styles['summary-table-a']}>{a}</div>
      </div>
    )
  }
  // 根据 type 分发 content 组件
  const ContentTD = ({ id, type, content }: { id: number; type: number; content: Iqa }) => {
    return (
      <td className={` ${layout_styles['summary-table-content-td']}`}>
        <button className={layout_styles['summary-table-edit-button']}>edit</button>
        <QAtd q={content.q} a={content.a}></QAtd>
      </td>
    )
  }

  // state 组件
  const StateTag = ({ item }: { item: ReviewItem }) => {
    // 新添加的，未更新
    // 今天需要复习 next_review_at <= today
    // 今天复习完 last_reviewed_at === today
    // 今天不必复习 next_review_at > today && last_reviewed_at < today
    const nextDiff = getRelativeTime(item.next_review_at)
    const lastDiff = getRelativeTime(item.last_reviewed_at)
    if (nextDiff <= 0) return <Tag color="orange">today</Tag>
    if (lastDiff === 0) return <Tag color="green">today</Tag>
    if (lastDiff < 0) return <Tag color="blue">today</Tag>
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
      <table>
        <thead>
          <tr>
            <th>state</th>
            <th>Content</th>
            <th>created_at</th>
            <th>last_reviewed</th>
            <th>next_review</th>
            <th>Oper</th>
          </tr>
        </thead>
        <tbody>
          {summaryData?.map((item) => (
            <tr key={item.id}>
              <td>
                <StateTag item={item}></StateTag>
              </td>

              <ContentTD id={item.id} type={item.type} content={item.content}></ContentTD>

              <td>{item.created_at}</td>
              <td>{getRelativeTimeString(item.last_reviewed_at)}</td>
              <td>{getRelativeTimeString(item.next_review_at)}</td>
              <td>
                <button>del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

  enum ReviewRate {
    Icant = 0,
    trying = 1,
    Ican = 2,
    UnSelect
  }
  const [currentStage, setCurrentStage] = useState(ReviewStages.Disable)
  const [currentReviewItem, setCurrentReviewItem] = useState<ReviewItem>()
  const [currentReviewData, setCurrentReviewData] = useState<Partial<Review>>({
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
  const [reviewItemList, setReviewItemList] = useState<ReviewItem[]>([])
  const [ReviewQueue, setReviewQueue] = useState<number[]>([])
  const hasFetchedRef = useRef(false) // ref 标记，用于阻止严格模式下调用两次 useEffect 的副作用
  useEffect(() => {
    ;(async () => {
      try {
        // 这里是拦不住的。因为useEffect调用两次，两次调用之间不会有阻塞。所以
        // 两次调用都会看到空的 reviewItemQueue，并且请求数据
        if (hasFetchedRef.current) {
          console.warn('已经获取数据，请勿重复获取')
          return
        }
        hasFetchedRef.current = true
        const getParams: { mode: GetReviewItemsMode } = { mode: 'today-review' }
        const result = await ReviewItemAxios.get('', {
          params: getParams
        })
        const result_data = [
          ...result.data.data.map((item) => ({
            ...item,
            content: JSON.parse(item.content) // 解析 content
          }))
        ].filter((item) => {
          // 过滤掉不必复习的
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

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
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
        const item = reviewItemList[ReviewQueue.shift()]
        console.log('新item', item)
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
    if (currentStage === ReviewStages.Check) setCurrentStage(ReviewStages.Submitting)
    try {
      // TODO 网络请求成功，状态转移到 PrepareReviewItem
      const resp = await ReviewAxios.post('', {
        item_id: currentReviewDataRef.current.item_id,
        rate: currentReviewDataRef.current.rate,
        remark: currentReviewDataRef.current.remark
      })
      console.log('submit', resp)
      setCurrentStage(ReviewStages.PrepareReviewItem)
      clearCurrentReviewData()
      // 否则，Disable
    } catch (e) {
      setCurrentStage(ReviewStages.Disable)
      console.error(e)
    }
  }
  return (
    <div className={`${layout_styles['review-main-container']} ${layout_styles['fill-container']}`}>
      {currentStage === ReviewStages.Finish ? (
        <div>Conguratulaion! Finish</div>
      ) : (
        <>
          {/* 问题展示区 */}
          <div className={layout_styles['review-content-container']}>
            {currentReviewItem ? (
              <>
                <p className={layout_styles['review-q']}>{currentReviewItem.content.q}</p>
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
              {/* TODO 按钮组改为单选组 */}

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

const Setting = () => {
  return <div className={`${layout_styles['fill-container']}`}></div>
}
const MainPages = ({ currentPage }: { currentPage: PageTags }) => {
  switch (currentPage) {
    case PageTags.Summary:
      return <SummaryPage></SummaryPage>
      break
    case PageTags.Review:
      return <ReviewPage></ReviewPage>
      break
      defaule: return <div>Default</div>
    case PageTags.Setting:
      return <Setting></Setting>
      break
  }
}
