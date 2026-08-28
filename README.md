# 生成式许愿井

> 愿落深井，回响自来 — 给中文写作的安静 Hugo 主题。

**在线看**：https://wildfire2282.github.io/hugo-wishingwell-theme/

单仓双用：根目录就是完整网站，也能当主题放到别的 Hugo 站里用。零前端依赖，不装打包器，靠 Hugo 自己把 CSS/JS 打包指纹。

---

## 怎么用

**要 Hugo ≥0.164**

```sh
git clone https://github.com/Wildfire2282/hugo-wishingwell-theme.git
cd hugo-wishingwell-theme
hugo server -D   # http://localhost:1313
```

**当主题用**

```toml
# 你的 hugo.toml
theme = "hugo-wishingwell-theme"
```

最小配置抄 `themes/hugo-wishingwell-theme/exampleSite/hugo.toml` 就能跑。

**写文章**

```sh
hugo new content posts/my-note/index.md
```

```yaml
---
title: "标题"
slug: "my-note"
description: "一句话摘要"
topics: ["学习札记"]
tags: ["笔记"]
---
```

---

## 能做什么

- 首页、文章、主题、标签、归档、搜索、关于，手机也好用
- 目录高亮、阅读进度、相关文章、代码一键复制、明暗色

## 更多说明

- 设计：`themes/hugo-wishingwell-theme/docs/DESIGN.md`
- 工程：`docs/ENGINEERING.md`

## 许可

[MIT](LICENSE)
