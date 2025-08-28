import sqlite3
import time
from datetime import datetime

from playsound import playsound
from .utils import play


def today_datestr():
    return datetime.strftime(datetime.now(), "%Y_%m_%d")


class WordsDataBase:
    def __init__(self, db_name):
        self.conn = sqlite3.connect(f"recite/database/{db_name}.db")
        self.cursor = self.conn.cursor()
        self.db_name = db_name
        self.create_today_table()

    def create_today_table(self):
        datastr = today_datestr()
        # 单词表
        self.cursor.execute(f'''
                       CREATE TABLE IF NOT EXISTS words_{datastr}
                       (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           word TEXT NOT NULL UNIQUE,
                           interpretation TEXT NOT NULL,
                           audio1 BLOB,
                           audio2 BLOB,
                       )
                       '''
                            )
        # 复习表
        self.cursor.execute(f'''
                       CREATE TABLE IF NOT EXISTS review_logs_{datastr}
                       (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           word_id INTEGER NOT NULL,
                           review_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           status INTEGER NOT NULL, -- 0=忘记，1=模糊，2=记得
                           elapsed_days INTEGER, -- 距离上次复习
                           next_review_days INTEGER, -- 建议下次复习
                           FOREIGN KEY (word_id) REFERENCES words_{datastr}(id)
                       )
                       ''')
        self.conn.commit()

    # 添加词条
    def add_word(self, table_name: str, word, interpretation, audio1_url: str, audio2_url: str):
        def read_blob(url: str):
            with open(url, 'rb') as f:
                return f.read()
        try:
            a1 = read_blob(audio1_url)
            a2 = read_blob(audio2_url)
            self.cursor.execute(f'''
                                INSERT INTO {table_name}
                                (
                                    word,interpretation,audio1,audio2
                                )
                                VALUES
                                (?,?,?,?)
                                ON CONFLICT(word) DO UPDATE SET
                                    interpretation = excluded.interpretation,
                                    audio1 = excluded.audio1,
                                    audio2 = excluded.audio2,
                                ''', (word, interpretation, a1, a2))
            self.conn.commit()
        except Exception as e:
            print(f"上传失败，错误{e}")

    def fetch_words(self, table_name: str):
        self.cursor.execute(
            f"SELECT word,interpretation,audio1,audio2 FROM {table_name}")
        rows = self.cursor.fetchall()
        return rows

    def play_all_audio(self):
        table_name = f"words_{today_datestr()}"
        rows = self.fetch_words(table_name)
        for row in rows:
            word, interpretation, audio1, audio2 = row
            print(f"{word} {interpretation}")
            play(word, 1, audio1)
            time.sleep(1)
            play(word, 2, audio2)
            continue

            with open(f"recite/audios/{word}-1.mp3", 'wb') as f:
                f.write(audio1)
            with open(f"recite/audios/{word}-2.mp3", 'wb') as f:
                f.write(audio2)
            playsound(f"recite/audios/{word}-1.mp3")
            time.sleep(.1)
            playsound(f"recite/audios/{word}-2.mp3")
