# hugo-wishingwell-theme

[![Hugo ≥0.164](https://img.shields.io/badge/Hugo-%3E%3D0.164-315c7c)](https://gohugo.io) [![License MIT](https://img.shields.io/badge/License-MIT-8a8e91)](LICENSE)

**演示站**：https://wildfire2282.github.io/hugo-wishingwell-theme/

面向中文技术写作的克制型 Hugo 主题。

## 环境要求

- Hugo Extended `≥0.164.0`
- `posts` 为 Page Bundle（`posts/<slug>/index.md`），`topics` + `tags` 双分类
- 每篇：恰 1 个 `topics`、非空 `description`、小写 ASCII `slug` 与标题锚点（`## 标题 {#id}`）

违规时 `validate-post.html` 触发 `--panicOnWarning` 熔断。

## 安装

```sh
git submodule add https://github.com/Wildfire2282/hugo-wishingwell-theme.git themes/hugo-wishingwell-theme
```

```toml
# hugo.toml
theme = "hugo-wishingwell-theme"
```

参考：`exampleSite/hugo.toml`。

## 内容

```sh
hugo new content posts/my-post/index.md
```

```yaml
---
title: "标题"
slug: "my-post"          # 小写 ASCII，连字符
description: "一句话摘要"
topics: ["工程实践"]      # 恰 1 项
tags: ["笔记"]
---
## 标题 {#my-post}
```

中文分类需显式 `slug` + `url` 保证 ASCII（Goldmark `autoIDType: github-ascii`）。

## 构建

```sh
# 站点
hugo --gc --minify --cleanDestinationDir --panicOnWarning --printPathWarnings
# 主题自检
hugo --source exampleSite --themesDir ../.. --theme hugo-wishingwell-theme --gc --minify --cleanDestinationDir --panicOnWarning --noBuildLock
```

## 许可

MIT。
