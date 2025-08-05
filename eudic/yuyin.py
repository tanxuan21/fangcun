# 한국 지금뭐 해요? 안녕하세요, 저는 한국인입니다
# こんにちは、私は日本人です
# Hello, I'm American
# 你好，我是香港人

import json
import edge_tts
import asyncio


async def list_voices():
    voices = await edge_tts.list_voices()
    for voice in voices:
        print(
            f"Name: {voice['Name']}, Gender: {voice['Gender']}, Locale: {voice['Locale']}")
    with open('eudic/meta/all-voice.json', 'w', encoding='utf-8')as f:
        json.dump(voices, f, ensure_ascii=False)


async def text_to_speech(text, output_file, voice="zh-CN-YunxiNeural"):
    """
    使用Edge TTS将文本转换为语音

    参数:
        text: 要转换的文本
        output_file: 输出音频文件路径(如: output.mp3)
        voice: 语音模型(默认使用云溪中文男声)
    """
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

if __name__ == "__main__":
    text = "한국 지금뭐 해요? 안녕하세요, 저는 한국인입니다"
    output_file = "eudic/audio/output.mp3"

    # asyncio.run(list_voices())
    # exit()
    # 运行异步函数
    asyncio.run(text_to_speech(text, output_file,
                voice="ko-KR-InJoonNeural"))
    print(f"语音文件已保存到: {output_file}")
