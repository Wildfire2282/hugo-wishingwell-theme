# 代码注释最佳实践

> 注释不是翻译代码，而是记录**意图、边界与债务**。本规范适用于本仓全部 `CSS / JS / Go Template (Hugo)` 与 `Markdown front-matter`；与 `docs/ENGINEERING.md` 及 `themes/hugo-wishingwell-theme/docs/DESIGN.md` 共同受 `AGENTS.md` 索引。

---

## 1. 原则

1.  **解释 Why，不复述 What**：`// 水平居中` 是噪声；`// 需 -16px 对齐隶书标题的字距收紧` 是意图。
2.  **可删不如可读**：能用命名与结构自解释的，不写注释；需注释的，说明“何时可删”（`TODO(@name): … until …`）。
3.  **中文为先**：面向中文技术写作的主题，注释以中文为主，术语（`Hugo / a11y / RUI`）保留英文原词。
4.  **与设计系统绑定**：涉及 `spacing / type / color / shadow` 必注 `RUI 刻度` 或 `DESIGN.md §`，硬编码必须加 `豁免` 理由。
5.  **债务显性化**：`@deprecated / HACK / FIXME` 必须带 `转化路径` 与 `过期条件`，禁止裸 `// hack`。

---

## 2. 通用格式

```css
/* ==========================================================================
   组件名 · 层级 / 职责（一行使命）
   --------------------------------------------------------------------------
   一段话说明该文件在管线中的位置与禁令；多行时用 70 字符换行。
   ========================================================================== */
```

*   **块头**：每个 CSS/JS 文件首块必备，含 `使命 | 输入 | 禁令 | 关联文档`。
*   **节头**：`/* ---- 区块名 ---- */` 统一 `4 横线`，节内空一行。
*   **行尾**：仅用于 `/* #hex */` 回滚值、`/* 1.34:1 decorative */` 对比度、`/* alias: was 80→64 */` 迁移，不作逻辑解释。
*   **标点**：中文注释用全角 `。`，中英混排时英文术语两侧留半角空格。

---

## 3. CSS（本仓主体）

### 3.1 Tokens 层

每个 `custom property` 行尾必有 `/* 语义 + 对比度/别名 */`：

```css
--wp-paper-50: hsl(60,16%,96%) /* #f7f7f4 */;
--border-control: var(--wp-ink-400) /* 3.66:1 vs --surface 达 WCAG 1.4.11 3:1; 原 2.0:1 过浅 */;
--space-20: var(--space-8) /* alias: was 80px → 64px */;
```

*   **色板**：`hsl()` + `/* #hex */` 双写，回滚用 `ΔE=0`。
*   **语义派生**：`color-mix` 仅允许在 `semantic.css`，行尾注 `/* 55% 半透明避免生硬色块 */`。

### 3.2 组件层

节头后首行说明**不变量**：

```css
/* ---- 头部 · 吸顶毛玻璃，滚动后 is-scrolled 浮现边框与 --shadow-1 ---- */
.site-header { position: sticky; top: 0; z-index: var(--z-header); }
```

硬编码**豁免**必须写成：

```css
/* data-uri 色值取自调色板 --wp-paper-400 (#b5b8b5) 描边 / --accent (#315c7c) 圆点，无法引用变量，例外豁免 */
.prose hr { background: url("data:image/svg+xml,…#b5b8b5…"); }
```

禁止：

```css
/* 居中 */                /* 复述 */
/* TODO */                /* 无人无期 */
color: #315c7c;           /* 裸 hex，未走 token */
```

推荐：

```css
/* 熔断：分页不存在时整块不渲染，见 _partials/pagination.html:2 */
.pagination { gap: var(--space-6); }
```

### 3.3 工具层

`motion.css` 每个 `@keyframes` 前注 `/* 触发者：.hero.is-playing → ripple-six 5s 线性，end target 监听 animationName */`。

---

## 4. JavaScript（`assets/js/main.js` 单文件）

*   **分区头**：`/* ========== Hero 投币状态机 ========== */`，单区 ≤80 行，超限即拆 IIFE。
*   **状态机**：首行注释列状态表：`pending → playing → has-played (initialPlayFinished + hoverArmed)`。
*   **存储键**：`const THEME_KEY="ww-theme"` 单一键。
*   **可访问性**：任何 `scrollTo({behavior:"smooth"})` 前置 `/* reducedMotion.matches → auto */`。

```js
// 坏
if (dark) toggle.setAttribute("aria-pressed","true"); // 设置属性

// 好
// 同步昼夜开关的 aria-pressed 与 data-active 下划线，见 DESIGN.md §7 “Theme toggle”
const syncThemeToggle = () => { … }
```

禁止 `console.log` 留存；`TODO` 必须 `TODO(#123): 描述 + 预期移除版本`。

---

*   **文件头** `{{/* 夜井:首帧前设定 data-theme；见 head.html:6 */}}` — 解释**为何内联**（避免 FOUC）与**为何 unsafe-inline**（CSP `_headers` 已放行）。
*   **分页熔断**：`{{/* 分页 canonical：head 先于 main 渲染，此处创建 paginator；list/term 复用 .Paginator 避免二次 Paginate */}}`
*   **校验**：`validate-post.html` 每条 `errorf` 前置 `{{/* 恰 1 topic / 非空 description / ASCII slug / ASCII heading ID */}}`。
*   **性能**：`$sheets` 显式顺序后 `Concat → minify → fingerprint`，行尾注 `/* 指纹用于 immutable Cache-Control */`。

```go-html
{{/* 坏：无上下文 */}}
{{ $paginator = .Paginate .RegularPagesRecursive }}

{{/* 好：说明 double-Paginate 风险 */}}
{{ $paginator = .Paginator }} {{/* 已由 head.html 创建则复用，避免 panicOnWarning */}}
{{ if not $paginator }}{{ $paginator = .Paginate $pages }}{{ end }}
```

---

## 6. Markdown / Front-matter

每篇 `content/posts/*/index.md` 首部保留：

```yaml
---
# title: 人读标题（可中文）；slug: 英文 ASCII（校验）；description: 列表与 SEO 必需；topics: 恰 1
title: "……"
slug: "english-slug"
description: "一句话摘要，必填"
topics: ["工程实践"]
---
## 中文标题 {#english-anchor-id}
```

标题 ID 行尾必有 `{#english}`；新增 `topics/tags/_index.md` 需显式 `slug + url (ASCII)`。

---

## 7. 债务标记

| 标记 | 含义 | 必备字段 | 示例 |
|---|---|---|---|
| `@deprecated` | 兼容旧命名 | `was A→B` + 移除版本 | `--space-20: var(--space-8) /* alias: was 80→64; remove in 1.0 */` |
| `HACK` | 绕过限制 | 原因 + 恢复条件 | `/* HACK: Safari 不支持 :has，用 html.is-nav-open 兜底；待 baselines 2025 */` |
| `FIXME` | 已知缺陷 | 复现 + 优先级 | `/* FIXME: prose 120px hr 未 snap 到 128，待视觉复核 P2 */` |
| `TODO(#id)` | 计划中 | 负责人 + 期限 | `/* TODO(#42,@kiw99): 翻译 DESIGN.md RUI 章节至双语 2026-09 */` |

禁止裸 `hack / fix / tmp`。

---

## 8. 反模式清单

| 坏 | 为什么 | 好 |
|---|---|---|
| `/* 修复 bug */` | 无信息 | `/* 修复 head/list 双 Paginate 导致 single 页 panicOnWarning，见 #123 */` |
| `color: #fff; // 白色` | 复述 | `color: var(--surface) /* #fff raised, vs --text-primary 15:1 */` |
| `gap: 8px; // 间距` | 未走刻度 | `gap: var(--space-2) /* 8 = RUI 第二阶，邻比 100% */` |
| 注释块内再套 `/* */` | 截断 | 用 `//` 或 `{{/* */}}` 分层嵌套 |
| 大段注释复述代码 20 行 | 淹没有效信息 | 抽为 `DESIGN.md §`，代码处仅引 `/* 见 DESIGN.md §7 “Prose” */` |

---

## 9. 检查清单（提交前）

- [ ] 每个新增 `--*` 有语义与对比度/别名注释
- [ ] 组件层无裸 `hex / color-mix / em(字阶) / 500+700`
- [ ] 文件头 mission 与禁令完整
- [ ] 豁免行含 `豁免`/`data-uri`/`alias` 关键词（CI 白名单）
- [ ] `TODO/FIXME/HACK` 带编号与移除条件

*本规范由 `docs/ENGINEERING.md §5` 与 `themes/.../docs/DESIGN.md §3-8` 联动，修改任一需同步 `AGENTS.md` 索引。*
