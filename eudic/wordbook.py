import requests
import json
from datetime import datetime


def make_headers():
    return {
        'User-Agent': 'Mozilla/5.0',
        'Authorization': 'NIS ZJxNRDq5WwwQ0ykksv30xMXHgLh3Xhjp+rokV4233HN52JOlXw11SQ==',
        'Content-Type': 'application/json'
    }


def get_all_word_books():
    url = f"https://api.frdic.com/api/open/v1/studylist/category?language=en"
    resp = requests.get(url=url, headers=make_headers()).json()
    return resp['data']
    # 写入元数据
    with open('eudic/database/meta.json', 'w', encoding='utf-8') as f:
        json.dump({
            'book_list': resp['data']}, f, ensure_ascii=False)


def add_new_word_books(name: str):
    url = f"https://api.frdic.com/api/open/v1/studylist/category"
    resp = requests.post(url, headers=make_headers(), data=json.dumps({
        "language": "en",
        "name": name
    })).json()
    return resp['data']


def add_new_word(word_book_id: str, word_list: list):
    url = f"https://api.frdic.com/api/open/v1/studylist/words"
    resp = requests.post(url, headers=make_headers(), data=json.dumps({
        "language": "en",
        "category_id": word_book_id,
        "words": word_list
    })).json()

    print(resp)


def get_today_str():
    return datetime.now().strftime('%Y-%m-%d')


if __name__ == "__main__":

    # add_new_word_books()

    # get_all_word_books()

    # print(get_date_str())
    # exit(0)
    # with open('eudic/database/2025-7-26.txt', 'r', encoding='utf-8') as f:
    #     words = [w.strip() for w in f.readlines()]
    #     add_new_word('133979939834218188', words)

    command_fail = False
    while True:
        today_str = get_today_str()
        print("what do you want to do?")
        print("press 'q' to quit. 'create' to create new book named today date string 'update' to post database to today book")
        cmd = input(">>>")
        command_fail = False
        if cmd.upper() == 'Q':
            exit(0)
        elif cmd == 'create':
            # 防止重复创建，先读取一下。
            books: list = get_all_word_books()
            for b in books:
                if b['name'] == today_str:
                    print(f"{b} Repeatedly create books. Command fail")
                    command_fail = True
                    break
            if command_fail:
                continue
            new_book = add_new_word_books(today_str)  # 新创建的单词本
            books.append(new_book)  # 添加进来
            meta_data = {}
            with open(f"eudic/database/meta.json", "r", encoding="utf-8") as f:
                meta_data = json.load(f)
            with open(f"eudic/database/meta.json", "w", encoding="utf-8") as f:
                meta_data['book_list'] = books
                json.dump(meta_data, f, ensure_ascii=False)
        elif cmd == 'update':
            try:
                meta_data = {}
                id = ''
                with open(f"eudic/database/meta.json", 'r', encoding='utf-8') as f:
                    meta_data = json.load(f)
                    print(meta_data)
                    command_fail = True
                    for b in meta_data['book_list']:
                        if b['name'] == today_str:
                            id = b['id']
                            command_fail = False  # 找到了，命令就成功
                            break
                if command_fail:
                    print(f"Please create book first. Command fail")
                    continue
                # 将所有单词全部加入到今天的单词本
                with open(f'eudic/database/{today_str}.txt', 'r', encoding='utf-8') as f:
                    words = [w.strip() for w in f.readlines()]
                    add_new_word(id, words)
            except Exception as e:
                print(f"[cmd update] error {e}")
        else:
            print(f"Invalid command. Ignored")
