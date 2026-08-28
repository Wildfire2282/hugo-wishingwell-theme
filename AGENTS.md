# AGENTS.md — WishingWell 代理工作手册

> 面向人类与 AI 代理的**唯一入口**。进入本仓前必读本文，完成改动后按本文自检。三大规范文档为事实源，本文仅作索引与执行契约。

---

## 1. 身份与裁定

*   **你**是本仓的受托代理（load-bearing），默认走** informed action**：能用工具自证的，不向用户二次确认。
*   **用户的观测为真**：用户报告的报错/现象即 ground truth，不为否定而重跑校验；失败即按报告直接修复。
*   **完成才停止**：每轮回复必须推进任务，`completion` 仅在可交付物就绪后触发；`todo` 边界、阶段切换不是停止条件。

---

## 2. 三大规范索引（必读顺序）

|#|文档|解决什么|何时读|
|---|---|---|---|
|1|`docs/ENGINEERING.md`|**工程事实**：目录/配置/构建/CI/产物/可访问性基线/发布|改 `.gitignore / .github / layouts/_partials/head.html / 构建命令` 前|
|2|`docs/DESIGN.md`|**视觉语言**：三原则（克制/回响/纸墨）、`primitives → semantic → components` 分层、四套字阶、动效与组件规约|改 `assets/css/**`、新增组件、`$sheets`、色板/间距/阴影/圆角 前|
|3|`docs/COMMENTS.md`|**注释契约**：文件头/节头/行尾格式、`hsl+wash 8%` 豁免写法、`TODO/@deprecated/HACK` 债务标记、Go Template/JS 分区规范|新增 `--*`、写 `CSS/JS/Template`、标债务、写 `豁免` 时|

> 规则演进：**改样式先改 `DESIGN.md`，改后再同步本文索引**（`DESIGN.md:3` 原文要求）。

---

## 3. 技能与工具选择

*   **通用安装**：`bun/pnpm/npm` 优先 `bun`，`Python` 走 `uv`，`Rust` 走 `cargo binstall`，系统级 `apt-get -y --no-install-recommends`；禁止 `sudo npm -g / sudo pip / --break-system-packages`。
*   **文件操作**：读大文件用 `read:offset/limit`，目录用 `read`（非 `ls`），搜结构用 `ast_grep`，跨文件重命名用 `lsp rename`。
*   **探索**：多轮发现走 `task + scout` 子代理，避免逐文件 `read`。
*   **安全扫描**：`xd://security_scan`（`preflight/start/status`），`cloud_*` 需 `cloud_configuration_id`。
*   **浏览器**：仅 JS/鉴权场景用 `browser open→run`，静态内容用 `read URL`。

---

## 4. 工作流（Scope → Research → Decompose → Implement → Verify → Cleanup）

1.  **Scope**：多文件改动先画计划（`todo init`，3+ 步骤必建）。
2.  **Research**：复用既有模式；改导出符号前必 `lsp references`；工具报错/文件过期后重读。
3.  **Decompose**：`todo` 与首个 `read/edit` 同批次；独立切片并行 `task`。
4.  **Implement**：修**源**不压症状；全量迁移调用点并移除废弃路径；同文件内优先，忌无谓新文件。
5.  **Verify**：非平凡改动必须可证——**实验**跑输出、`Web UI` 用 `browser` 目视、`Bug` 复现→修复→再验、`永久特性` 跑既有契约测试；冒烟只跑受影响路径。
6.  **Cleanup**：验后清脚手架/测试/文档；一次性实验不补测试。

---

## 5. 语气与输出

*   证据优先、简洁技术化：每句为事实、决策或风险；默认片段式，少仪式感。
*   结论先行，证据继之；不确定时明示权衡，选笨/安全方案。
*   终轮可用 `LaTeX($/$$)` 与 `mermaid`，仅用于真实结构/公式。

---

```
docs/ENGINEERING.md                          # 工程规范（纯主题、产物隔离、exampleSite 构建）
docs/DESIGN.md                               # 设计语言（tokens 分层、RUI 刻度、动效、组件摘要）
docs/COMMENTS.md                             # 注释规范（文件头/节头/豁免/债务标记/Go Template）
exampleSite/hugo.toml                        # 主题最小可用配置（站点仓复用相同关键段）
assets/css/tokens/{primitives,semantic}.css   # 唯一刻度源（禁组件直引 --wp-*）
layouts/_partials/head.html                   # $sheets 指纹管线（新增组件登记点）
.github/workflows/build.yml                  # concurrency + Guard + Token lint + ASCII URL
.github/pull_request_template.md
```

> 站点内容与部署已分离至 `~/workspace/wishingwell-blog`（独立 git 仓，`hugo.toml` + `content/` + `static/_headers`，GitHub → Cloudflare Pages）。本仓仅保留 `exampleSite/` 作为主题预览。

---

## 7. 改动检查清单（粘贴至 PR 描述）

```md
- [ ] 视觉：DESIGN.md 已更新（新增 --* 或动效/组件规则）
- [ ] 注释：按 docs/COMMENTS.md 补文件头/对比度/豁免/债务标记
- [ ] 构建：hugo --source exampleSite --gc --minify --cleanDestinationDir --panicOnWarning --printPathWarnings 0 警告
- [ ] 可访问性：skip-link / focus-visible / aria-current / reduced-motion 未回退
- [ ] 产物：public/ resources/_gen/ exampleSite/public/ 未入仓（git ls-files 0）
- [ ] RUI：spacing/type 均走刻度，hex 仅 hsl+/* #hex */，无运行时 color-mix 现调
```

---

*本手册版本与 `docs/ENGINEERING.md` 及 `docs/DESIGN.md` 联动，任何一处更新需同步 bump `AGENTS.md` 顶注时间戳。*
