# 生成式许愿井

> 愿落深井，回响自来 — 面向中文写作的精炼 Hugo 主题。

**演示站点**：https://wildfire2282.github.io/hugo-wishingwell-theme/

本项目采用单仓双形态架构，根目录即为可部署站点，`themes/hugo-wishingwell-theme` 可作为独立主题集成至任意 Hugo 站点。无第三方前端依赖，样式与脚本经由 Hugo Pipes 完成合并、压缩与指纹化处理。

---

## 快速开始

**环境要求**：Hugo Extended ≥ 0.164.0

```sh
git clone https://github.com/Wildfire2282/hugo-wishingwell-theme.git
cd hugo-wishingwell-theme
hugo server -D
# 访问 http://localhost:1313
```

**作为主题集成**

```toml
# hugo.toml
theme = "hugo-wishingwell-theme"
```

完整最小配置请参阅 `themes/hugo-wishingwell-theme/exampleSite/hugo.toml`。

**创建内容**

```sh
hugo new content posts/my-article/index.md
```

```yaml
---
title: "标题"
slug: "my-article"
description: "一句话摘要"
topics: ["学习札记"]
tags: ["笔记"]
---
```

---

## 特性

- 涵盖首页、文章、主题、标签、归档、搜索与关于页面，具备完善的响应式适配
- 目录高亮、阅读进度、相关推荐、代码复制与明暗色切换

## 相关文档

- 设计规范：`themes/hugo-wishingwell-theme/docs/DESIGN.md`
- 工程规范：`docs/ENGINEERING.md`

## 许可

[MIT](LICENSE)
