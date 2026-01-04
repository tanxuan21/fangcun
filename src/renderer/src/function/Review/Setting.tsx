import { useEffect } from 'react'
import { useReviewSet } from './ctx'
import layout_styles from './layout-styles.module.scss'
import { Input, InputNumber } from 'antd'
import { set } from 'lodash'
import { ReviewSetAxios } from './api'

export const DefaultSetting = {
  review_count: {
    trying: 2,
    Icant: 3
  },
  level2days: {
    0: 1,
    1: 2,
    2: 3, // diff = 1
    3: 5,
    4: 7,
    5: 9, // diff = 2
    6: 12,
    7: 15,
    8: 18, // diff = 3
    9: 22,
    10: 26,
    11: 30, // diff = 4
    12: 32,
    13: 36,
    14: 42, // diff = 5
    15: 50,
    16: 60,
    17: 70,
    18: 80, // diff = 6
    19: 90,
    20: 100,
    21: 120,
    22: 140, // diff = 7
    23: 160
  },
  // 为了 audio 等等其他资源
  plugins: {}
}

export const Setting = () => {
  const { reviewSet, setReviewSet } = useReviewSet()
  useEffect(() => {
    console.log(reviewSet)
  }, [])
  return (
    <div
      className={`${layout_styles['fill-container']} ${layout_styles['setting-page-container']}`}
    >
      {reviewSet && (
        <>
          <header>
            <button
              onClick={async () => {
                const resp = await ReviewSetAxios.put('', {
                  id: reviewSet.id,
                  setting: JSON.stringify(reviewSet.setting)
                })
                console.log(resp)
              }}
            >
              save
            </button>
            <button onClick={() => setReviewSet({ ...reviewSet, setting: DefaultSetting })}>
              restore default
            </button>
            <button>abandon</button>
            <button></button>
          </header>
          <hr />
          <div className={layout_styles['review-count-container']}>
            <div className={layout_styles['review-count-item']}>
              trying:{' '}
              <InputNumber
                value={reviewSet.setting['review_count']['trying']}
                onChange={(v) => {
                  setReviewSet({
                    ...reviewSet,
                    setting: {
                      ...reviewSet.setting,
                      review_count: {
                        ...reviewSet.setting['review_count'],
                        trying: v
                      }
                    }
                  })
                }}
              ></InputNumber>
            </div>
            <div className={layout_styles['review-count-item']}>
              Icant:{' '}
              <InputNumber
                value={reviewSet.setting['review_count']['Icant']}
                onChange={(v) => {
                  setReviewSet({
                    ...reviewSet,
                    setting: {
                      ...reviewSet.setting,
                      review_count: {
                        ...reviewSet.setting['review_count'],
                        Icant: v
                      }
                    }
                  })
                }}
              ></InputNumber>
            </div>
          </div>
          <hr />
          <div className={layout_styles['level2days-container']}>
            {Object.keys(reviewSet.setting['level2days']).map((k) => {
              return (
                <div className={layout_styles['level2days-item']} key={k}>
                  level: {k}
                  <InputNumber
                    value={reviewSet.setting['level2days'][k]}
                    onChange={(v) => {
                      setReviewSet({
                        ...reviewSet,
                        setting: {
                          ...reviewSet.setting,
                          level2days: {
                            ...reviewSet.setting['level2days'],
                            [k]: v
                          }
                        }
                      })
                    }}
                  ></InputNumber>
                  <button>add</button>
                  <button
                    onClick={() => {
                      const idxs = Object.keys(reviewSet.setting['level2days'])
                        .map((i) => parseInt(i))
                        .sort((a, b) => a - b)
                      const days: number[] = []
                      const new_map = {}
                      for (let i = 0; i < idxs.length; i++) {
                        if (parseInt(k) === idxs[i]) continue // 删掉 k 的 days
                        days.push(reviewSet.setting['level2days'][idxs[i]] as number)
                      }
                      for (let i = 0; i < days.length; i++) {
                        new_map[idxs[i]] = days[i]
                      }
                      setReviewSet({
                        ...reviewSet,
                        setting: {
                          ...reviewSet.setting,
                          level2days: new_map
                        }
                      })
                    }}
                  >
                    del
                  </button>
                </div>
              )
            })}
          </div>
          <hr />
        </>
      )}
    </div>
  )
}
