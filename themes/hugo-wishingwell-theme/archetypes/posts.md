---
title: "{{ replace .Name `-` ` ` | title }}"
# 注意：leaf-bundle 陷阱 — 若使用 .File.ContentBaseName，执行 hugo new posts/my-post/index.md 时
# ContentBaseName 为 "index"，会导致 slug 错误为 "index"；改用 .Name 始终取目录名/文件名（不含扩展名）
slug: "{{ .Name }}"
description: "一句话摘要，必填；将显示于列表与 SEO 描述。"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
topics:
  - "学习札记"
tags: []
featured: false
toc: true
related: true
dropCap: false
---
