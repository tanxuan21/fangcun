import * as googleTTS from 'google-tts-api'

async function textToSpeechGoogle(text: string, lang: string = 'en-US') {
  // 获取音频的 URL（Google TTS 会返回一个音频 URL）
  const base64 = await googleTTS.getAudioBase64(text, {
    lang: lang,
    slow: false,
    host: 'https://translate.google.com'
  })
  console.log(base64)
  // src={'data:audio/mpeg;base64,' + bs64}
  return 'data:audio/mpeg;base64,' + base64
}

export { textToSpeechGoogle }
