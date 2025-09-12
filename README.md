# fangcun

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```




方法二：使用 ResizeObserver + 二分算法手动实现
借鉴上面的思路，你可以用 ResizeObserver 检测内容或容器尺寸变化，然后用 JS 动态调整字体大小，直到内容刚好适应容器。
核心思路：
设定一个目标字体范围（如 [10px, 60px]）。
使用二分查找方法，找到一个字体大小使得内容既不溢出容器，又不留过多空白。
每次输入或尺寸变化时重新计算。
参考文档说明：auto‑text‑size 就是用类似思路实现的，高效又精确。
GitHub

[auto-text-size](https://github.com/sanalabs/auto-text-size?utm_source=chatgpt.com)


# book 配置

**语音模型**
对于语言学习的情况。
添加一个无语音的选项，用于复习那些非语言类的记忆内容

**复习模式**
读 Q->A
写 A->Q
听 voice(Q) -> Q

**记忆等级**

> 用户手工添加

level 1: 1 day
level 2: 2 day
...
level 10: 10 day
+

level infinity: 100 day

> 这个是给规划记忆的策略使用的。 也就是遗忘曲线。用户可以自己设置遗忘曲线。软件也提供默认配置
> 1. 选择忘记，回退一个等级，复习时间为回退后等级对应的天数 / 2
> 2. 选择模糊，保持等级。复习时间为当前等级对应天数 / 2
> 3. 选择记得，进一个等级。
> 4. 到达配置的最高等级，往后的复习间隔为 level infinity
> 5. 对于那些模糊/忘记的单词，很可能在后面的复习中，会出现：本来模糊的，背着背着选择遗忘了；或者本来遗忘的，背着背着慢慢的模糊了。这些情况，最终等待卡片复习完毕之后，取出这次复习的用户行为。按照选择忘记/模糊的比例，计算出来下次复习的日期。写入 cards_review_arrangement 表。

**当日模糊重现次数**
当天复习的单词，如果选择了模糊，往后需要做对多少次算完成今天的复习任务；
**当日忘记重现次数**
当天复习的单词，如果选择了忘记，往后需要做对多少次算完成今天的复习任务；

**按照计划/随便翻翻**
随便翻翻什么都不会修改。不会影响复习计划的更新。


TODO 写完卡片的每类复习条目记录

TODO 复习算法

TODO recite 模式，drawer内部的card list item 角落提示当前单词的背诵状态：

1. 一遍过（牢记）
2. 通过
3. 正在进行中
4. 不需要复习

TODO 数据展示，复习情况总结


```css
@mixin recite-button {
    outline: none;
    padding: 10px;
    border: none;
    background: #0000;
    cursor: pointer;
    position: relative;
}

@mixin button-after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30%;
    height: 3px;
    transition: width 0.3s ease;
    border-radius: 10px;
}

&>.remember-button {
    @include recite-button();

    &::after {
    @include button-after();
    background: $remember-green;
    }

    &:hover::after {
    width: 80%;
    }

}
```