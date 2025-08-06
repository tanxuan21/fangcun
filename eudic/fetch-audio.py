'''
测试，通过csv将其转化为音频
'''
import csv
import edge_tts
import asyncio
import sqlite3
import io
import datetime
from pathlib import Path
from .config import model_dict

transfer_fail_Q = set()


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


class RememberCardDatabase:
    def __init__(self, db_name: str):
        self.db_name = db_name
        self.conn = sqlite3.connect(self.db_name)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        self.create_table()

    def create_table(self):
        self.cursor.execute(f"CREATE TABLE IF NOT EXISTS {self.db_name}(\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            language TEXT NOT NULL,\
            date DATE NOT NULL,\
            name TEXT\
            )")

        self.conn.commit()


class LanguageVoiceDatabase:
    def __init__(self, db_name: str):
        self.db_name = db_name
        self.conn = sqlite3.connect(self.db_name)  # 数据连接
        self.conn.row_factory = sqlite3.Row  # 结果作为字典返回
        self.cursor = self.conn.cursor()  # 数据库游标，具体操作
        self.create_table()

    def create_table(self):
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS languagevoice(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Q TEXT NOT NULL,
            audio BLOB NOT NULL,
            A TEXT NOT NULL,
            date DATE NOT NULL,
            language TEXT NOT NULL
        )
        ''')
        self.conn.commit()

    def insert_word(self, Q: str, A: str, language: str, audio_file_path: str):
        with open(audio_file_path, 'rb') as file:
            file_data = file.read()
            self.cursor.execute('''
            INSERT INTO languagevoice (Q,audio,A,date,language)
            VALUES (?,?,?,?,?)
                                ''', (Q, file_data, A, datetime.date.today().strftime("%Y-%m-%d"), language))
            self.conn.commit()

    def update_word(self, Q: str, A: str, language: str, audio_file_path: str):
        with open(audio_file_path, 'rb') as file:
            file_data = file.read()
            # update 会 update 所有的
            self.cursor.execute('''
            UPDATE languagevoice 
            SET audio = ?, A = ?, date = ?,language = ?
            WHERE Q = ?
                                ''', (file_data, A, datetime.date.today().strftime("%Y-%m-%d"), language, Q))
            self.conn.commit()

    def save_word(self, Q: str, A: str, language: str, audio_file_path: str, over_write: bool):
        if over_write and self.fetch_word(Q):
            self.update_word(Q, A, language, audio_file_path)
            return
        self.insert_word(Q, A, language, audio_file_path)

    def fetch_word(self, Q: str):
        self.cursor.execute('SELECT * FROM languagevoice WHERE Q = ?', (Q,))
        res = self.cursor.fetchone()
        if res:
            return dict(res)
        return None


db = LanguageVoiceDatabase('eudic/languageaudio.db')


def main(args: list):
    qa_file_name = args[0]
    overwrite = '-f' in args or '--force' in args
    path = Path(f"eudic/recite-data/{qa_file_name}.csv")
    if not path.exists():
        print("文件不存在")
        return False
    with open(f"eudic/recite-data/{qa_file_name}.csv", 'r', encoding='utf-8-sig') as f:
        file_info = qa_file_name.split('_')
        language = file_info[1]
        date_str = file_info[0]

        print(f"获取语言 {language} 音频")
        if not language in model_dict:
            print(f"检查语言，未识别语言 {qa_file_name}")
            exit(0)
        reader = csv.DictReader(f)
        header = reader.fieldnames
        # 构建索引，去重

        index_table = {}

        for r in reader:
            if (index_table.get(r['Q'], None)):
                print(f"repeatly add. old:{index_table[r['Q']]} new:{r}")
            index_table[r['Q']] = r

        # 获取音频
        # print(index_table)
        sccessful_count = 0
        for w in index_table:
            Q = index_table[w]['Q']
            A = index_table[w]['A']
            # 跳过重复的情况
            if db.fetch_word(Q) and not overwrite:
                print(f"{Q} 已存在，跳过")
                continue
            # 去单词库里查找，是否已经存在
            audio_file_path = f"eudic/audio/{Q}.mp3"
            # 获取音频
            # 获取失败的处理，可能是单词错误，可能是参数错误
            res = text_to_speech(
                text=Q, output_file=audio_file_path, voice=model_dict[language][0])
            if res:
                # 存入数据库
                print(f"fetch speech {Q} sccessful!")
                db.save_word(Q, A, language, audio_file_path,
                             over_write=overwrite)
                sccessful_count += 1
                # 删除文件
                if Path(audio_file_path).exists:
                    Path(audio_file_path).unlink()
            else:
                transfer_fail_Q.add(Q)
        # 保存今天词书

    # 写入转化失败单词
    print(f"写入转化失败单词... {len(transfer_fail_Q)}个转化失败 {sccessful_count}个成功")
    with open(f"eudic/recite-data/tts-fail.csv", 'w', newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=['Q', 'A'])
        writer.writeheader()
        for q in transfer_fail_Q:
            writer.writerow(index_table[q])

    # 读取测试
    # w = db.fetch_word('composition')
    # if w:
    #     with open(f"eudic/audio/{w['Q']}-from-db.mp3", 'wb') as f:
    #         f.write(w['audio'])


def read(Q: str):
    w = db.fetch_word(Q)
    if w:
        with open(f"eudic/audio/{w['Q']}-from-db.mp3", 'wb') as f:
            f.write(w['audio'])
    else:
        print(f"no found {Q}")


if __name__ == "__main__":
    cmd = ""
    while True:
        cmd = input(">>>").strip()
        cmd = cmd.split()
        if len(cmd) <= 0:
            continue
        func = cmd[0]
        args = cmd[1:]
        if func.upper() == 'Q':
            exit(0)
        elif func == 'run':
            if len(args) > 0:
                main(args)
            else:
                print(f"缺少参数 {cmd}")
        elif func == 'read':
            if len(args) > 0:
                read(args[0])
            else:
                print(f"缺少参数 {cmd}")
        else:
            print(f"无效命令")
            continue
