---
title: "样式陈列 · 一览许愿井的全部笔墨"
slug: "style-showcase"
description: "一文陈列主题的全部排版与组件样式：标题、链接、引用、列表、代码、表格与图文。"
date: 2026-08-28T10:00:00+08:00
lastmod: 2026-08-28T10:00:00+08:00
draft: false
topics:
  - "工程实践"
tags:
  - "主题样式"
  - "Markdown"
  - "排版"
featured: true
toc: true
related: true
---

> 一览纸墨的边界，让层次由排版与留白建立，而非装饰堆叠。

井水蓝仅作点睛，文字层级以墨色深浅表达。本文陈列 prose、标题、链接、引用、列表、代码、表格、图片与分隔线的全部样式。

## 一级标题之外：二级标题 {#heading-h2}

二级标题用于章节的承转，字号 `--step-4`，上距 `1.75rem`，下距 `0.5rem`，`scroll-margin-top` 已避开吸顶头部。

### 三级标题：细节的收敛 {#heading-h3}

三级标题 `--step-2`，用于章节内的再分段。

#### 四级标题：更细的说明 {#heading-h4}

四级标题 `--step-1`，用于技术细节与参数说明。

##### 五级标题 {#heading-h5}

五级与六级共用 `--text-sm`，仅作层级兜底。

###### 六级标题 {#heading-h6}

六级标题与五级同级，默认不单独强调。

## 段落与行内样式 {#paragraph-inline}

正文采用 `--font-serif` 宋体系，`17—18.5px/1.9`，量度 `720px`，`letter-spacing 0.01em`。**加粗**以 `600` 字重表达，不用斜体。`行内代码`以 `--code-bg` 衬底，`0.15em 0.4em` 内距。外部链接如 [Hugo 官网](https://gohugo.io) / [Refactoring UI](https://www.refactoringui.com) 悬停时下划线由淡转实。删除线 ~~已废弃~~ 与高亮 `==mark==`（如主题未启用则按普通文本渲染）可用于对比。

中文与 `code`、数字 `2026` 混排时，不做强制空格，交由字体原生处理。

## 引用 {#blockquote}

> 首字以「起头，左缘 `2px --accent`，衬底 `8% accent-wash`，文字 `hsl(206,18%,32%)`，最大宽度 `60em` 收敛。[INFERENCE] 暗色下沿用同款纹理，深浅由纸面对比自然区分。
>
> 第二段引用，用于验证 `blockquote p` 的段距与嵌套样式。

## 列表 {#lists}

### 无序列表

- 第一级：功能也会产生维护成本
  - 第二级：提示与插件的增量
    - 第三级：每次启动时加载的决定
- 第一级：让默认行为重新可见
- 第一级：安静的命令行

### 有序列表

1. 提出能够被证伪的假设
2. 选择成本最低且信息量足够的观测
3. 根据结果保留或排除假设
   1. 嵌套有序：等待时间正常
   2. 嵌套有序：排除该假设

### 任务列表

- [x] 已完成：井口涟漪
- [ ] 待完成：硬币落水
- [ ] 待完成：纸落墨沉

## 代码 {#code}

行内 `const paper = "var(--paper)"` 与块级配合，顶栏显示语言标签与复制按钮（`JS` 增强，无 `JS` 时按钮隐藏）。

```go
// 单一分页入口，见 layouts/_partials/paginator.html
{{ $paginator := false }}
{{ if .Paginator }}
  {{ $paginator = .Paginator }}{{/* 已由 head.html 创建则复用，避免二次 Paginate */}}
{{ end }}
if err != nil {
    return fmt.Errorf("topics 恰 1 项: %w", err)
}
```

```js
// 主题切换：单一键 ww-theme
const THEME_KEY = "ww-theme";
document.documentElement.setAttribute("data-theme", t);
```

```css
/* RUI 间距：4 8 12 16 24 32 48 64 … 邻比≥25% */
.hero { min-height: 360px; /* RUI豁免: 画布 */ }
```

```text
假设：数据库连接池已经耗尽
观测：连接等待时间与活动连接数
结果：等待时间正常，排除该假设
```

未指定语言的围栏：

```
plain fences without language
  keep indentation
```

## 表格 {#table}

| 令牌 | 值 | 用途 | 对比度 |
|---|---|---|---|
| `--paper` | `hsl(60,16%,96%)` | 页面底 | — |
| `--border-control` | `hsl(206,3%,51%)` | 控件描边 | `3.66:1` |
| `--accent` | `hsl(206,43%,34%)` | 井水蓝点睛 | `4.5:1` |

| 功能 | 桌面 | 移动 | 备注 |
|---|---|---|---|
| 版心 | `min(1180, 100%-gutter*2)` | `16px + safe-area` | `max-width: calc(100% - env(...))` |
| 量度 | `720px ≈ 45em` | 同上 | `45–75` 字符 |
| 头高 | `82px` | `56px` | `--header-h` |

横向超宽表格将出现 `table-scroll` 出血（`margin: -gutter; width: calc(100%+gutter*2)`）与滚动阴影：

| 列A | 列B | 列C | 列D | 列E | 列F | 列G | 列H |
|---|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| a | b | c | d | e | f | g | h |

## 图片与图注 {#figure}

![涟漪示意](https://picsum.photos/seed/wishingwell/800/400)

*图：`figure` 上下 `1.4rem`，`img` 以 `1px --border-default` 细框承载，`figcaption` `12px/1.5` 弱化。*

## 分隔线 {#hr}

---

涟漪纹由 `data-uri` 绘制，色值 `hsl+wash 8%` 豁免；移动端退化为 `64px×1px` 实线。

## 脚注与细节 {#footnote}

正文 `16–18px/1.9`，`段距 1rem`，列表 `0.5rem`，表格 `8×12`，`chroma` 行内 `0.15em`。焦点环 `2px + 3px offset` 以 `--accent`，选区 `well-200` 成对定义前景墨色。

## 收束 {#conclusion}

所有层次皆在 `primitives → semantic → components` 分层中取用，`--wp-*` 不越层，`color-mix` 仅在 `semantic` 沉淀。详见 `themes/hugo-wishingwell-theme/docs/DESIGN.md §4–§7.1`。
