# WishingWell 设计语言

WishingWell 的视觉决策全部沉淀于此。改样式之前先读这份文档;改完之后若规则变化,先更新本文档。
## 1. 概念隐喻

主题名为「许愿井」,所有视觉元素围绕同一空间叙事展开:

| 隐喻 | 含义 | 视觉载体 |
|------|------|----------|
| 井 | 内容沉淀之处 | 页面本身;列表页是井口 |
| 涟漪 | 思想投井后的传播 | 列表页头涟漪图、分隔线纹样、投币动画的六层扩散 |
| 硬币 | 每一篇记录 | Hero 投币动画(身份性瞬间,全站唯一编排动画) |

装饰性 SVG 均为线稿风格:细描边、等宽数字标注(如 `RIPPLE/001`)。它们是"图纸",不是插画——克制原则在装饰层的体现。

## 2. 三原则

### 克制
层次由排版与留白建立,而非装饰堆叠。具体约束:
- 全站仅一个强调色(井水蓝),且只用于点睛:强调短线、链接、焦点环、当前状态
- 无圆角(除胶囊形 `--radius-pill` 与圆形标记)、无大面积投影、无渐变按钮
- 动效只做反馈,不做表演;全站唯一长动画是 Hero 投币(一次性播放)

### 回响
一切交互必有细腻回应,但响应时间不超过 300ms:
- 导航悬停:下划线自左向右生长
- 文章行悬停:左侧指示针伸出 + 纸面微亮
- 正文链接悬停:下划线由淡至实
- 区块悬停:标签下的强调短线缓缓拉长(450ms,唯一的慢回应,刻意为之)

### 纸墨
暖纸底 × 墨色字 × 井水蓝点缀。文字层级靠墨色深浅表达,共四级:
主文 `--text-primary` → 说明 `--text-secondary` → 元数据 `--text-meta` → 弱化 `--text-faint`

## 3. CSS 架构

```
assets/css/
├── tokens/
│   ├── primitives.css   # 原始刻度:色板 ramp、字体栈、字号、间距、动效、层级
│   └── semantic.css     # 语义映射:表面、文字层级、边框层级、强调色系
├── base/
│   ├── reset.css        # 重置、焦点、选区、版心、进度条、滚动条
│   └── typography.css   # 展示标题与眉题的全局排版规则
├── syntax.css           # chroma 语法高亮(hugo gen chromastyles 生成)
├── components/          # 一个组件一个文件,按页面结构命名
└── utilities/
    ├── motion.css       # 全部 @keyframes + prefers-reduced-motion 兜底
    └── print.css        # 打印样式
```

**组装管线**(`_partials/head.html`):显式顺序 `resources.Get` → `resources.Concat` → `minify` → `fingerprint`,输出单个指纹文件。新增组件文件时必须同步登记到 head.html 的 `$sheets` 切片。

**分层规则:**
- 组件样式只允许引用语义层 token 与动效/间距/字号刻度
- 禁止直接引用 `--wp-*` 色板原语
- 禁止硬编码颜色、时长、缓动;装饰性内联 SVG data-uri 中的色值除外(无法引用变量),但必须取自当前调色板并在注释中说明
- 关键帧只写在 `utilities/motion.css`;组件文件里只有 animation 引用

## 4. 色彩 Token

### 原始色板(primitives.css)

纸 —— 暖灰纸面:

| token | 值 | 用途 |
|---|---|---|
| `--wp-paper-0` | `#ffffff` | 纯白(抬升表面基色) |
| `--wp-paper-50` | `#f7f7f4` | 页面底色 |
| `--wp-paper-125` | `#eff0ed` | 代码底 |
| `--wp-paper-300` | `#dedfd9` | 分隔线 |
| `--wp-paper-400` | `#b5b8b5` | 控件描边 |
| `--wp-paper-500` | `#969a9d` | 弱化文字 |

墨 —— 文字与强结构线:`900 #181a1b`(主文)→ `500 #686b6d`(说明)→ `450 #62676a`(元数据)。

井水蓝 —— 唯一强调色:`500 #315c7c`(主)、`600 #27495f`(悬停加深)、`700 #1e394b`(按压)、`200 #cbdbe5`(选区)、`050–100`(浅衬底)。

### 语义层(semantic.css)

| token | 定义 | 规则 |
|---|---|---|
| `--paper` / `--surface` | 页面底 / 抬升表面 | 卡片、悬停行用 `--surface-veil`(55% 半透明),避免生硬色块 |
| `--code-bg` / `--code-bar-bg` | 代码底 / 顶栏衬底 | 顶栏 `72%` 浅灰（基于 `--wp-paper-100`），禁止组件直引原语 |
| `--accent-wash` | 强调色 6% 水洗 | 标签悬停衬底等极浅背景 |
| `--accent-line` | 强调色 18% | 装饰性图形、未激活下划线 |
| `--focus-ring-color` | = accent | 焦点环一律 2px + offset 3px,不得省略 |
| `--selection-bg` | well-200 | 选区必须成对定义前景墨色 |

新增颜色需求时:先进原始 ramp 找相邻刻度;确实缺位才加新刻度并更新本表。所有 `--wp-*` 已改写为 `hsl()`（如 `--wp-paper-50: hsl(60,16%,96%) /* #f7f7f4 */`），禁止新增 hex，禁止运行时 `color-mix` 现调 tint——先入 ramp 再引用语义层。

#### 4.1 Refactoring UI 对齐 — HSL
`SKILL.md § Color` 要求 `hsl()` 而非 hex：`hsl(206,43%,34%)` 与 `hsl(204,29%,55%)` 可见相关，`#315c7c` 与 `#6b93ae` 不可见。所有纸/墨/井 ramp 已等值 hsl 化（ΔE=0），旧 hex 留注释供回滚。

#### 4.2 间距（RUI 4,8,12,16,24,32,48,64,96,128,192,256…）
采用 `4,8,12,16,24,32,48,64,96,128,192,256`，相邻比 ≥25%（24→32=33%, 32→48=50%）；仅提供 `--space-1…12`，新增间距一律就近取整。

#### 4.3 边框与不透明度（RUI 固定档位）
`--border-width 1px` / `--border-width-thick 2px`（控件 2px 满足 WCAG 1.4.11 3:1 识别需求，装饰线 1px 豁免）；`--opacity-1..6` 为 `.05/.1/.2/.4/.6/.8` 固定档位，替代随手滑块；`--radius 4px` 中性圆角仅用于控件（代码复制按钮），`--radius-pill 999px` 胶囊；纹理噪点 `opacity .32` 固定。

#### 4.4 阴影（5 阶克制抬升）
`--shadow-1..5` 对应 `hsla(0,0%,0%,.2)` 1px3/4px6/5px15/10px24/15px35；组件按 z 轴选，非按审美选。`header.is-scrolled` 用 `--shadow-1`，其余预留。

#### 4.5 行高与层级
`--leading-tight 1`（≥36px 标题）/ `--leading-snug 1.25`（20–30px）/ `--leading-normal 1.5`（正文窄量度）/ `--leading-loose 1.75`（小字/宽栏）；配合 `--measure 720px≈45em`（45–75 字符区间）与 `--measure-wide 920px`。

#### 4.6 语义层增量（RUI 映射）
`--border-control` 已校正：亮色 `var(--wp-ink-400) #7d8184` 3.66:1 vs --surface 达 3:1（原 `--wp-paper-400 #b5b8b5` 仅2.0:1）；暗色 `hsl(206,6%,57%)`5.15:1 vs --surface。新增 `--border-muted/--overlay-fab/--overlay-scrim/--backdrop-soft/--code-row-alt/--scroll-fade/--tap-highlight` 均封装自 `--paper/--border-default/--code-bg/--accent` 的 `color-mix` 派生，组件禁止直调 `color-mix`；`--tap-highlight` 同时用于 `reset.css` 触屏高亮。

## 5. 排版

三类字体，各司其职，**不得混用**，不再保留其他字体类型：

| 类别 | Token | 栈 | 职责 | 示例 |
|---|---|---|---|---|
| **标题** | `--font-title` | 黑体 `"PingFang SC", "Heiti SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif` | 标题 | `page-header/article/error h1` `prose h1~h6` `section-label h2` `post-row h2/h3` |
| **正文** | `--font-body` | 系统默认 `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | 正文、摘要、导语、说明、提示、表格正文 | `prose p/blockquote/figcaption/table td` `article-deck` `page-intro` `post-row body` `search body` |
| **功能** | `--font-functional` | 宋体 `ui-serif, Georgia, "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", SimSun, serif` | 按钮、导航、分页、标签、元数据、代码、首页大标题例外 | `header/nav/toc/pagination/footer` `tag/meta` `code/pre` `hero h1 例外` |

> **原则：** 标题黑体承担层级，正文系统默认承担连续阅读，功能宋体承担结构与强调。例外：首页 Hero 大标题（网站名）用功能宋体。仅提供三类字体。


**中文规则:**
- 正文行高 2.0(移动端 1.95);UI 行高 ≤1.75
- 展示级标题字距收紧至 `-0.05em` ~ `-0.075em`（黑体特性，标题 HeiTi 收紧以显分量）
- 不使用斜体强调(中文无此传统),用字重或颜色
- 标题锚点滚动余量:`scroll-margin-top: calc(var(--header-h) + 16px)`

**量度(measure)**:正文 `--measure: 720px`;文章头 `--measure-wide: 920px`。任何长文本容器不得超过量度。`prose` 段距已由 `0.9em` → `1rem` / 标题 `1.6/1.3/1.1em` → `1.75/1.25/1rem`（HR#2 禁 em，标题随断点独立收敛）。

## 6. 动效

### Token

| token | 值 | 适用 |
|---|---|---|
| `--dur-fast` | 150ms | 颜色、边框等即时反馈 |
| `--dur-base` | 250ms | 位移、生长类变换(指示针、下划线、菜单) |
| `--dur-slow` | 450ms | 区块级慢回应(section-label 短线) |
| `--dur-hero` | 5000ms | 投币编排专用,不得挪用 |

缓动只用两条:`--ease-out`(入场与反馈)、`--ease-in-out`(少用)。线性仅用于 dashoffset 揭示。

新增关键帧:`rise-in`(滚动入场,12px 上移 + fade,`--dur-slow`)与 `ink-settle`(页面头涟漪纸落墨,700ms 线性)。入场编排由 JS IntersectionObserver 给 `.post-row` / `.featured-post` / `.section-label` 加 `.reveal`→`.is-revealed`;`html.js` 下未揭示元素 `opacity:0`,无 JS 与 reduced-motion 下不隐藏(reduced-motion 全局兜底把动画压为瞬时)。

### 规则
1. 只对 `opacity` / `transform` / 颜色类属性做过渡;禁止过渡布局属性(width 例外:指示针类刻意生长)
2. 悬停动效包在 `@media (hover: hover) and (pointer: fine)` 内,触屏不做粘滞悬停
3. 新增 keyframes 一律进 `utilities/motion.css`
4. `prefers-reduced-motion: reduce` 下全站退化为瞬时——新动效无需单独适配,但不得用 `!important` 绕过兜底
5. JS 侧平滑滚动前必须检查 `reducedMotion.matches`


## 7. 组件规范摘要
| 组件 | 关键规则 |
|---|---|
| **Header** | 吸顶 + 毛玻璃（桌面）；`.is-scrolled` 后浮现底边框与 `--shadow-1`；强调短线恒定；移动端见 §7.1 |
| **Hero** | 全站唯一叙事：噪点 + 水深渐变 + 投币动画；移动端见 §7.1 |
| **Theme toggle** | `昼 / 夜` mono 双选项，`data-active` = `--text-primary` + accent 下划线；移动端收纳至抽屉底部 |
| **Article** | 头部 `space-8/space-4` → 分隔线 `2px --border-default` 上下各 `space-8` 对称 → 双栏 `720+180 gap 32-64`；移动端见 §7.1 |
| **Section label** | mono 小标签 + 序号圆圈；悬停短线拉至 92px（桌面独有） |
| **Post row / Featured** | 三栏网格 72/1fr/180；悬停指示针 10px + `--surface-lift`；精选 2px 左缘条；移动端单列紧凑见 §7.1 |
| **Pagination** | 页码 44px 见方，当前页 `2px --accent` + `--accent-wash`；移动端保持 `--tap-min` |
| **Prose** | `16-18px/1.9` 段距 `1rem` 标题 `1.75/0.5…` 递减；移动端见 §7.1 |
| **TOC** | 桌面 sticky 右栏；移动端 FAB + 弹层见 §7.1 |
| **Back-to-top** | 文章页滚过一屏浮现；移动端 `16px+safe`，有 FAB 时 `72px+safe` |
| **Footer** | 单行：版权 + 必要链接；移动端纵向堆叠 |
| **404** | 复用涟漪图 error 变体 |

### 7.1 移动端（≤720px）—— 稳定性优先的精简纵排

> 目标：保持隶书标题 / 井水蓝点睛 / mono 元数据可辨识；余下装饰一律去除，版心 `16px` + 纵向一维流，压缩空隙 30–40% 提升首屏信息密度。

**兼容性基线**
- 断点仅 `720px` 主阈 + `900px` 布局折叠 + `380px` 极窄兜底；不引入容器查询 / subgrid / `:has` 关键路径（`:has` 仅作增强，功能以 `.is-open/.is-locked` 类为准）。
- 视口单位 `100vh` 回退 + `100dvh` 增强；`env(safe-area-inset-*)` 全面预留；`height: -webkit-fill-available` 兜底旧 WebKit。
- `backdrop-filter` 仅桌面保留，移动端抽屉/遮罩一律实色 `var(--paper)`，规避低端机合成层闪烁与性能回退。
- 动效仅 `opacity/transform/color`，`prefers-reduced-motion` 全局瞬时兜底不绕过。

**装饰裁剪（移动端 display:none 或中性化）**
`hero::before/::after`、`wish-drop`、`ripple-art`、`site-header::after`、`prose blockquote::before`、`prose hr` 涟漪纹、`section-label` 悬停长线、`post-row/featured` 悬停指示针与 lift 背景——全部在 `720px` 下隐藏或置为实线中性样式。保留：隶书标题、井水蓝左缘/链接色、2px→1px 结构分隔线、mono 日期。

**纵向节奏（压缩 30–40%，RUI 刻度内收敛）**
- `hero`：`min-height 240→200px`，`padding space-8→space-5`，`eyebrow space-6→space-3`，`tagline` 上距 `space-6→space-3`，`nav` 上距 `space-7→space-4`。
- `page-header`：`padding space-12/space-10→space-6/space-5`，`eyebrow space-8→space-3`，`intro space-6→space-3`。
- `article-header`：`padding space-10/space-8→space-6/space-3`，标题 `clamp(26,8vw,34)` 紧凑 `1.15` 行高，`deck space-4→space-2`，`meta space-4→space-2`；分隔线 `padding-top space-8→space-4` 中性化。
- `prose`：`font-size --step-1→--text-base(16)`，`line-height 1.9→1.68`，段距 `1rem→0.7rem`，标题 `h2 1.75/0.5→1.0/0.3 h3 1.25/0.4→0.9/0.25`，`blockquote` 去「起头」，`hr` 居中细线 `64px×1px`。
- `post-list`：`section-label padding-block space-4→space-2`，`featured space-10→space-4`，行内 `gap space-4→space-1`，卡片 `padding space-4/space-3→space-3/space-3`。
- `archive/search/pagination/footer` 同步收敛：年/月 `space-7/9→space-6/5`，分页 `space-10→space-5`，搜索框 `space-12→space-5`。

**密度**
- 单列一维流：`featured/post-row/archive-month/term-grid` 均 `grid 1fr`，日期 `mono xs` 紧贴标题，摘要 `14px/1.5 clamp2` 不占多行。
- 触控目标仍 ≥`--tap-min 44px`（`post-row a`/`related-item`/`archive-month a`/`pagination number` 保留），但行高与上下空白压缩，使首屏多容纳 1–2 条。
- 表格/代码块出血 `calc(100%+gutter*2)` 保留，内距改为 `var(--shell-gutter)` 对齐版心，避免横向浪费。

## 8. 工程约定

- Hugo ≥ 0.164;模板使用新版目录约定(`_partials`、`_markup`)
- 零第三方前端依赖;JS 单文件 vanilla,CSS 经 Pipes 合并压缩
- 可访问性基线不可回退:skip-link、focus-visible、aria-current、role="status"、reduced-motion
- 构建验证:`hugo --gc --minify --cleanDestinationDir --panicOnWarning`
- 改动 checklist:token 是否复用 → 动效是否走 token → reduced-motion 是否仍成立 → 本文档是否需要更新 → 自定义属性是否均在 RUI 刻度（间距/字号/阴影/圆角）→ 颜色是否 hsl 且无运行时生成 → dark 块是否仅覆盖语义层 → 移动端是否经 §7.1 三项校验（装饰已裁剪 / 纵向已压缩 / 触控≥44px）
