# WishingWell 工程规范

> 本文档是仓库唯一的工程事实源（Single Source of Truth）。所有构建、目录、配置、样式、脚本、CI 决策以本文为准；与 `themes/hugo-wishingwell-theme/docs/DESIGN.md`（视觉语言）与 `docs/COMMENTS.md`（注释规范）共同构成 `AGENTS.md` 索引的三支柱。

---

## 1. 定位与边界

*   **仓库形态**：单仓双身份——根为可部署站点（`https://wildfire2282.github.io/hugo-wishingwell-theme/`），`themes/hugo-wishingwell-theme/` 为可分发主题，`exampleSite/` 为主题的最小可用示例。
*   **Hugo 基线**：`≥0.164.0`（`module.hugoVersion.min`），模板使用新目录约定 `_partials / _markup`，`theme = "hugo-wishingwell-theme"`（非 `modules.imports`，保持零门槛）。
*   **零第三方前端依赖**：CSS 由 Hugo Pipes 合并压缩指纹，JS 单文件 `vanilla`，不引入打包器、框架、图标库。

---

## 2. 目录与产物契约

```
.
├── archetypes/posts.md          # 文章脚手架（中文示例话题，需改英文 slug）
├── content/posts/*/index.md     # Page Bundle 必需；每篇 exactly one topic
├── themes/hugo-wishingwell-theme/
│   ├── assets/{css,js}/         # 唯一可信样式/脚本源
│   ├── layouts/{_partials,_markup}/
│   ├── static/favicon.svg
│   ├── exampleSite/{content,hugo.toml,public(IGNORED)}
│   └── docs/DESIGN.md
├── hugo.toml                    # 部署配置（见 §3）
├── static/_headers              # Cloudflare/_headers 示例（非主题文件，发布前按域审核）
├── .gitattributes
└── .github/workflows/build.yml

**产物永不入仓**（`.gitignore`）：

```
/public/ /resources/ /_gen/ .hugo_build.lock
resources/_gen/
themes/**/public/ themes/**/resources/ themes/**/_gen/ themes/**/.hugo_build.lock
```

验证：`git ls-files | grep public` 必须 0；`hugo --cleanDestinationDir` 后 `git check-ignore` 命中 `themes/**/public`。

---

## 3. 配置规范

*   **双 `hugo.toml` 同步**：根 `hugo.toml`（部署）与 `themes/.../exampleSite/hugo.toml`（分发最小集）除 `baseURL / params.description|tagline` 外必须一致。CI 以 `normalize()`（剔除三键并 `sort`）做 `diff -u` 门禁。
*   **关键段**（任何一处漂移即视为发布阻塞）：
    *   `taxonomies: topic="topics" tag="tags"`、`permalinks posts="/posts/:slug/"`、`outputs home=["HTML","JSON"]` + `outputFormats.JSON`（`search.json`）、`related` 三索引（`topics 100 / tags 80 / date 10`）、`markup.highlight github noClasses`、`goldmark parser autoIDType github-ascii`、`pagination pagerSize 10`、`menus.main` 四项。
*   **`theme.toml`**：`name + version (1.0.0) + license MIT + tags/features + min_version/minVersion 0.164.0 + [author]`；`version` 每次发版必 bump，`CHANGELOG.md` 同步。

---

由 `layouts/_partials/validate-post.html` 在 `single.html` 首行调用，六条 `errorf` 任何一条触发即 `hugo --panicOnWarning` 失败：

1.  `topics` 恰 1 项（`len ==1`，`GetTerms` 校验）
2.  `topics` 参数在站点真实存在（三级回退 `GetPage/urlize/Taxonomies` 校验幽灵分类）
3.  `description` 非空
4.  `slug` 非空（`leaf-bundle` 陷阱：`index.md → slug 'index'`）
5.  `slug` 符合 `^[a-z0-9]+(-[a-z0-9]+)*$`
6.  全部 `Fragments.Identifiers` 符合 `^[A-Za-z0-9][A-Za-z0-9_-]*$`（非 ASCII 标题 ID 禁止）

另有 `warnf`：重复 `slug` 仅告警（避免历史数据阻断）。

`archetypes/posts.md` 已预置 `slug: "{{ .Name }}"`（规避 `ContentBaseName → index` 陷阱），新建后必须手工改英文 `slug` 与 `topics/url`。

## 5. 样式架构

### 5.1 管线

`layouts/_partials/head.html: $sheets` 显式顺序 → `resources.Get` → `resources.Concat "css/main.css"` → `minify` → `fingerprint` 输出单指纹 `main.min.*.css`；新增组件必须同步登记到 `$sheets`，否则 `warnf "missing css"`。

### 5.2 分层

| 层 | 目录 | 职责 | 可引用 |
|---|---|---|---|
| `tokens/primitives.css` | `::root` | 原始刻度：色板 ramp、字体栈、字号/间距/动效/层级/阴影 | 无 |
| `tokens/semantic.css` | `::root` + `[data-theme="dark"]` | 语义映射：`--paper/--surface/--code-bg/--text-*/--border-*/--accent*` | `primitives` + 自身 `color-mix` 派生 |
| `base/reset.css` `typography.css` | 全局 | 重置、焦点、版心、排版 | `semantic` + 刻度 |
| `components/*.css` | 组件 | 单文件单组件，按页面结构命名 | `semantic` + 刻度，**禁** `var(--wp-*)`、**禁** `color-mix`、**禁** 硬编码色/时长 |
| `utilities/motion.css` `print.css` | 工具 | 全部 `@keyframes` 与 `prefers-reduced-motion` 兜底 | — |

**审查红线**（CI 强制）：

*   组件层 `color-mix` 命中 → 失败（派生必须沉淀为 `--border-muted/--overlay-fab/--tap-highlight` 等语义）
*   非 `primitives/semantic/syntax/print` 中出现 `#[hex]` → 失败（`data-uri 豁免` 需注释 `豁免`/`data-uri`）

### 5.3 刻度（Refactoring UI 对齐）

*   **间距** `4,8,12,16,24,32,48,64,96,128,192,256`（邻比 ≥25%），仅提供 `--space-1…12`。
*   **字阶** `12/14/16/18/20/24/30/36/48/60/72`（`--text-xs..7xl`），流式 `clamp --step--1..5` 端点 snap，无 `em`（`measure` 例外）。
*   **字重** 仅 `400 / 600`（`--weight-normal/bold`），弱化靠颜色/字号。
*   **边框** `1px / 2px`（`--border-width/thick`）， functional `2px` 保证 `3:1`。
*   **不透明度** `.05/.1/.2/.4/.6/.8`（`--opacity-1..6`）。
*   **行高** `1 / 1.25 / 1.5 / 1.75`（`--leading-tight/snug/normal/loose`），`--measure 720px≈45em`。
*   **阴影** 5 阶 `hsla(.2)` 按 `z-header/progress/skip` 选。

---

*   **单文件** `assets/js/main.js`（`defer` + `fingerprint`），职责分区以 `/* ===== */` 显式分隔：Hero 状态机 / 抽屉导航 + 遮罩 + 滚动锁 + 焦点回弹 / 滚动驱动（进度/头部/目录高亮/回顶，`rAF` 节流）/ 代码复制（`navigator.clipboard`）/ 搜索（`fetch + Abort 10s` + `debounce 120ms` + `score 8/5/1`）/ 主题切换（`ww-theme` 单一键）/ 目录弹层 / 滚动入场 `IntersectionObserver`。
*   **键名** `ww-theme`（单一真相源）。
*   **可访问性**：`reducedMotion` 与 `canHover` 媒体查询分支；所有平滑滚动前 `if (reducedMotion.matches) behavior="auto"`。

---

## 7. 构建与 CI

| 命令 | 用途 |
|---|---|
| `hugo server -D` | 本地预览 |
| `hugo --gc --minify --cleanDestinationDir --panicOnWarning --printPathWarnings` | 严格发布（PR 门禁同） |
| `hugo --source themes/.../exampleSite --themesDir ../.. --theme hugo-wishingwell-theme --gc --minify --cleanDestinationDir --panicOnWarning --noBuildLock` | 主题示例校验 |

**GitHub Actions `build.yml`**（`concurrency: hugo-${{ref}}`）：

1. `Install Hugo 0.164.0`（`curl + sha256sum --check`）
2. `Guard tracked artifacts`（`git ls-files --error-unmatch`）
3. `Lint config sync`（双 `hugo.toml` diff）
4. `Lint CSS token`（三检）
5. 双 `hugo` 构建
6. `Check ASCII URLs`（`%C/%E/%D + %E4..` 双检）
7. `Report bundle size`（`ls -lh public/css|js | du -sh`）

产物指纹示例：`main.min.827581d4fefe7fe9967f02363841c0b706ff26458b3a0f9b54e2f63de1fd211d.css 62KB / main.min.a9a4d392...js 11KB`。

---

## 8. 可访问性与发布清单

*   基线不可回退：`skip-link`、`focus-visible (2px + 3px offset)`、`aria-current="page|location"`、`role="status"`、`prefers-reduced-motion` 全局瞬时化。
*   PR 自检：`[ ] 根与 exampleSite 构建 0 警告` `[ ] URL ASCII` `[ ] 桌面/移动` `[ ] 键盘/减少动画` `[ ] 无产物/密钥入仓`（见 `.github/pull_request_template.md`）。
*   发版：`theme.toml:version` + `CHANGELOG.md 0.x.0` + `git tag v0.x.0` + `GitHub Release`（`LICENSE MIT` 主体，`content/` 示例另授权）。

---

*本文与 `themes/hugo-wishingwell-theme/docs/DESIGN.md`（视觉）与 `docs/COMMENTS.md`（注释）互为索引，详见 `AGENTS.md`。*
