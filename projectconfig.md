# 创建项目

```shell
pnpm create @quick-start/electron [my-app] --template react-ts
```

[参考连接](https://cn.electron-vite.org/guide/)

# 配置eslint

vscode插件 `prettier-code formatter`

参考下面的 `.vscode/settings.json` 配置，缺啥补啥

```json
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": true, // 保存时format
  "prettier.requireConfig": true, // 强制使用工程配置，而不是默认配置
  "prettier.tabWidth": 2 // 缩进宽度
}
```

重点是`eslint.config.mjs` 有些eslint配置过于严格，小项目没有意义。

```json
rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    ...eslintPluginReactRefresh.configs.vite.rules,
    '@typescript-eslint/explicit-function-return-type': 'off', // 禁用函数必须显式声明返回类型的检查
    '@typescript-eslint/no-unused-vars': 'off', // 禁用未使用变量的检查
    'no-unused-vars': 'off', // 禁用基础ESLint的未使用变量检查，
    endOfLine: 'auto' // 换行符自动根据系统识别。
}
```

# 必装依赖以及配置

## scss

## router


# 数据库

添加字段

```shell
sqlite 'path-to-database'

alter table 'table-name'
add colum setting text not null default "";
```

改名

```json
ALTER TABLE old_table_name
RENAME TO new_table_name;
```

- [ ] 上传；record 模式添加卡片；删除卡片 更新 book.info 的 cards_count 字段；
- [ ] 当 finishreview 时，根据 review_type 更新 review_count 数组对应元素
- [ ] 更新 book setting review_mode，增/删 review_count 数组
- [ ] 重建 book info，根据card 构建 book info 数据