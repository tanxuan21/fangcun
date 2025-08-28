import csv
import edge_tts
from .config import model_dict
from playsound import playsound
import time
from .WordsDataBase import WordsDataBase
from datetime import datetime


def today_datestr():
    return datetime.strftime(datetime.now(), "%Y_%m_%d")


def text_to_speech(text, output_file, voice="zh-CN-YunxiNeural"):
    """
    使用Edge TTS将文本转换为语音

    参数:
        text: 要转换的文本
        output_file: 输出音频文件路径(如: output.mp3)
        voice: 语音模型(默认使用云溪中文男声)
    """
    try:
        communicate = edge_tts.Communicate(text, voice)
        communicate.save_sync(output_file)
        return True
    except Exception as e:
        print(f"{text} transfer fail {e}")
        return False


if __name__ == "__main__":
    with open("recite/input.csv", 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        db = WordsDataBase('korean')

        for r in reader:
            word = r['words']
            interpretation = r['interpretation']
            # 第一个模型
            audio_model1 = model_dict['ko'][0]
            audio1_url = f"recite/audios/{word}-{1}.mp3"
            text_to_speech(
                word, audio1_url, voice=audio_model1)
            print(f"{word} {interpretation} {audio_model1}")

            time.sleep(.1)
            playsound(audio1_url)

            # 第二个模型
            audio_model2 = model_dict['ko'][1]
            audio2_url = f"recite/audios/{word}-{2}.mp3"
            text_to_speech(
                word, audio2_url, voice=audio_model2)
            print(f"{word} {interpretation} {audio_model2}")
            time.sleep(.1)
            playsound(audio2_url)

            # 添加单词条目
            db.add_word(f"words_{today_datestr()}", word,
                        interpretation, audio1_url, audio2_url)
