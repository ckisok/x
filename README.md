# wrx 魏如雪

## store 数据结构

### chapter

```js
const chapters = [
    {
        bid: 'c5c32170813ab7177g0181ae', // bookId 的编码值, keypath
        chapters: [
            {
                cid: 'e4d32d5015e4da3b7fbb1fa', // chapterUid 的编码值
                chapterUid: '',
                version: 0, // 版本(时间戳)，不同的版本需要不同的 utils 工具类
                '/web/book/chapter/e_0': '',
                '/web/book/chapter/e_1': '',
                '/web/book/chapter/e_2': '',
                '/web/book/chapter/e_3': '',
                '/web/book/chapter/t_0': '',
                '/web/book/chapter/t_1': '',
            },
        ],
    }
]
```

### toc

```js
const tocs = [
    {
        bid: 'c5c32170813ab7177g0181ae', // bookId 的编码值, keypath
        bookId: '3300028078', // 原始 bookId
        toc: [], // 目录数据
    },
]
```

### detail

```js
const details = [
    {
        bid: 'c5c32170813ab7177g0181ae', // bookId 的编码值, keypath
        bookId: '3300028078', // 原始 bookId
        detail: [], // 详情数据
    },
]
```

## todo

- css url抹除，避免生成 epub 格式时报警告
- 重复图下载(已解决)
- epub 文件压缩
- 目录层级
