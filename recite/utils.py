from datetime import datetime
from playsound import playsound
import os


def today_datestr():
    return datetime.strftime(datetime.now(), "%Y_%m_%d")


CACHE_PATH = "recite/audios/"

# 根据blob播放，但是需要查找缓存


def play(word: str, index: int, audio_blob):
    audio_cache_path = f"{CACHE_PATH}{word}-{index}.mp3"
    if not os.path.exists(audio_cache_path):
        print("写入文件... ...")
        with open(audio_cache_path, 'wb')as f:
            f.write(audio_blob)
    playsound(audio_cache_path)
