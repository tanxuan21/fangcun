import { useRef, useState } from 'react'
import { CardDataType } from '../types'
import { Dropdown } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { uploadCardAudio } from '../api/cards'
import { model_dict } from '../BookSettingPage/BookSettingPage'
import { Audio } from '@renderer/components/Audio/Audio'
export const AudioPicker = ({
  content,
  onLoaded,
  edite_card
}: {
  edite_card: CardDataType
  content: string
  onLoaded?: (blob: Blob) => Promise<void>
}) => {
  // 下拉菜单单选
  const [voice_model, set_voice_model] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(edite_card && edite_card.audio)
  const AudioRef = useRef()
  return (
    <>
      {edite_card ? (
        <Dropdown
          placement="bottomLeft"
          arrow
          menu={{
            items: (function () {
              const items: ItemType[] = []
              items.push({
                key: 'commit',
                label: 'commit',
                onClick: async () => {
                  if (blob) {
                    const data = await uploadCardAudio(parseInt(edite_card.id), blob)
                    console.log(blob, '保存后端', data)
                  }
                }
              })
              items.push({
                type: 'divider'
              })

              for (const language in model_dict) {
                for (const model of model_dict[language]) {
                  items.push({
                    key: model,
                    label: model,
                    onClick: () => {
                      set_voice_model(model)
                    }
                  })
                }
              }
              items.push({
                key: 'no audio',
                label: 'no audio',
                onClick: () => {
                  set_voice_model(null)
                }
              })
              return items
            })()
          }}
        >
          <div>
            <Audio
              type="record"
              autoPlay={false}
              ref={AudioRef}
              style={{ margin: 0 }}
              blob={blob}
              onLoaded={async (b) => {
                setBlob(b)
                onLoaded && (await onLoaded(b))
              }}
              content={content}
              voice_model={voice_model === null ? '' : voice_model}
            ></Audio>
          </div>
        </Dropdown>
      ) : (
        <></>
      )}
    </>
  )
}
