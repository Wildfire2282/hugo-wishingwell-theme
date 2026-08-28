# hugo-wishingwell-theme

[![Hugo ≥0.164](https://img.shields.io/badge/Hugo-%3E%3D0.164-315c7c)](https://gohugo.io) [![License MIT](https://img.shields.io/badge/License-MIT-8a8e91)](LICENSE)

WishingWell — restrained Hugo theme for Chinese technical writing. / 面向中文技术写作的克制型 Hugo 主题。

## Requirements / 环境要求

- Hugo Extended `≥0.164.0`
- `posts` as Page Bundles (`posts/<slug>/index.md`), `topics` + `tags` taxonomies / `posts` 为 Page Bundle，`topics` + `tags` 双分类
- Per post: one `topics`, non-empty `description`, ASCII `slug` and heading IDs (`## Title {#id}`) / 每篇：恰 1 个 `topics`、非空 `description`、小写 ASCII `slug` 与标题锚点

`validate-post.html` fails build on violation (`--panicOnWarning`) / 违规时构建熔断。

## Install / 安装

```sh
git submodule add https://github.com/Wildfire2282/hugo-wishingwell-theme.git themes/hugo-wishingwell-theme
```

```toml
# hugo.toml
theme = "hugo-wishingwell-theme"
```

Ref / 参考: `exampleSite/hugo.toml`.

## Content / 内容

```sh
hugo new content posts/my-post/index.md
```

```yaml
---
title: "Title / 标题"
slug: "my-post"          # ASCII, lowercase, hyphen / 小写 ASCII
description: "One-line summary / 一句话摘要"
topics: ["Engineering"]   # exactly one / 恰 1 项
tags: ["note"]
---
## Title {#my-post}
```

ASCII URLs: set `slug` + `url` on `topics/tags/_index.md`; Goldmark `autoIDType: github-ascii` / 中文分类需显式 `slug`+`url` 保证 ASCII。

## Build / 构建

```sh
# site / 站点
hugo --gc --minify --cleanDestinationDir --panicOnWarning --printPathWarnings
# theme check / 主题自检
hugo --source exampleSite --themesDir ../.. --theme hugo-wishingwell-theme --gc --minify --cleanDestinationDir --panicOnWarning --noBuildLock
```

## License / 许可

MIT. `exampleSite/content/` is sample content / 仅为示例内容。
