import random
from colorama import init, Fore, Back, Style


def general_table():
    table = []
    for i in range(5, 20):
        for j in range(1, 20):
            if i+j <= 10:
                continue
            table.append((i, j))
            if i == j:
                continue
            table.append((j, i))  # 各种顺序都是重要的
    table = list(set(table))
    random.shuffle(table)
    return table


def paseInt(v):
    try:
        v_int = int(v)
        return v_int
    except Exception as e:
        print(f"{v} {e}")
        return -25535


if __name__ == "__main__":

    table = general_table()
    print(table)
    while len(table) > 0:
        t = table[0]
        is_right = False
        ans = paseInt(input(f"{t[0]} + {t[1]}\n"))
        if ans == t[0] + t[1]:
            is_right = True
            print(f"{Fore.GREEN}right{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}error{Style.RESET_ALL}")
            table.append(t)
            print(f"answer: {t[0]+t[1]}\n")
        table.pop(0)  # 不论答对答错都要删掉。
        print("\n")
# 错误的扔到后面，

'''
7 + 9 = 16
7 + 4 = 11
'''
