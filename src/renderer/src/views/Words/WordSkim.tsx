import { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { WordsInstance } from './words'
import { useNavigate } from 'react-router-dom'
export function WordSkim() {
  const handleForgot = () => {
    console.log('忘记')
  }
  const handleHazy = () => {
    console.log('模糊')
  }

  const handleRemember = () => {
    console.log('记得')
  }
  useEffect(() => {
    ;(async () => {
      // 获取数据
      const database_path: string = '/Users/tanxuan21/Documents/FangCun/data/words/data.json'

      //   const json_str = await window.api.readFile(database_path)
      //   console.log(json_str)

      //   const data = JSON.parse(json_str)

      const data = WordsInstance.data
      const all_words: string[] = []
      for (const word in data) {
        all_words.push(word)
      }

      // 绑定事件
      document.onkeydown = (event) => {
        switch (event.key.toUpperCase()) {
          case 'A': {
            handleForgot()
            break
          }
          case 'S': {
            handleHazy()
            break
          }
          case 'D': {
            handleRemember()
            const index = Math.floor(Math.random() * all_words.length)
            const _w = all_words[index]
            console.log(index, _w)
            set_word(_w)
            set_html_str(data[_w])
            break
          }
        }
      }
    })()
    return () => {}
  }, [])

  const [html_str, set_html_str] = useState<string>('')
  const [word, set_word] = useState<string>('')
  const nav = useNavigate()
  return (
    <div className={styles['container']}>
      <div className={styles['controll-button-group']}>
        <button
          onClick={() => {
            nav('/words/home')
          }}
        >
          主页
        </button>
      </div>
      {/* <h1 className={styles['word']}>word</h1>
      <hr />
      <p className={styles['phonetic']}>[word]</p>
      <p className={styles['interpretation']}>单词</p> */}
      <h1>{word}</h1>
      <div dangerouslySetInnerHTML={{ __html: html_str }}></div>

      <div className={styles['button-wapper']}>
        <button>forget</button>
        <button>hazy</button>
        <button>remember</button>
      </div>
    </div>
  )
}
