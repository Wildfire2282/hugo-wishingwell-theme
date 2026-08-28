---
title: "开始使用 Wishpond"
slug: "hello-wishpond"
description: "一篇用于验证主题文章布局和内容约束的示例文章。"
date: 2026-01-01T09:00:00+08:00
lastmod: 2026-01-01T09:00:00+08:00
draft: false
topics:
  - "主题设计"
tags:
  - "Hugo"
featured: true
toc: true
related: true
---

Wishpond 为中文长文阅读保留清晰、安静的内容空间。

## 内容结构 {#content-structure}

每篇文章需要摘要、英文 slug 和一个主题。

## 发布检查 {#release-checks}

发布前运行严格构建，确保模板和内容约束全部通过。

| 检查项 | 要求 |
| --- | --- |
| 文章 slug | 小写 ASCII |
| 标题 ID | ASCII |

![Wishpond 水波示意图](ripple.svg)
