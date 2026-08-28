# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-29

初始发布。

### Added
- 单仓双身份：根为可部署站点（`https://wildfire2282.github.io/hugo-wishingwell-theme/`），`themes/hugo-wishingwell-theme/` 为可分发主题，`exampleSite/` 为最小可用示例；Hugo `≥0.164.0`，零第三方前端依赖
- 设计系统：`primitives → semantic → components` 三层 Token，RUI 间距 `4-256` / 字阶 `12-72` / 双字重 `400/600` / 5 阶阴影 / 层级与动效，`hsl` 色板与 `color-mix` 语义封装
- 页面：响应式首页（Hero 涟漪 + 投币）、列表 / 文章 / 主题 / 标签 / 归档 / 搜索（`search.json`）/ 关于 / 404
- 阅读：目录滚动高亮、相关文章（`topics 100 / tags 80 / date 10`）、阅读进度、首字下沉、代码块复制、图片/表格渲染钩子
- 搜索：`fetch + Abort 10s + debounce 120ms + score 8/5/1`
- 主题：明/暗色（`ww-theme` / `data-theme`）、`prefers-reduced-motion` 全局兜底
- 排版：三类字体（标题黑体 / 正文系统默认 / 功能宋体）、量度 `720px / 920px`、中文行高与展示标题收紧
- 移动端：`720px` 主断点 + `900px` 折叠 + `380px` 极窄兜底，装饰裁剪与纵向节奏压缩，触控目标 ≥44px
- 内容校验：`validate-post.html` 6 条 `errorf` 熔断（`topics 恰1 / description 非空 / slug ASCII / heading ID ASCII`）与 `slug` 重复告警；`hugo.toml` / `exampleSite/hugo.toml` 双配置同步校验
- CI：`Guard artifacts` / `Config sync` / `CSS Token lint` / 双站点构建 / `ASCII URL` / `Bundle size` 六步门禁，`pages.yml` 自动部署至 GitHub Pages
- 部署：`static/_headers` 安全头示例与 `Cache-Control: immutable`（`css/js`），`enableRobotsTXT` 与 `sitemap`
- 可访问性：`skip-link` / `focus-visible` / `aria-current` / `role="status"` / `reduced-motion` 基线
