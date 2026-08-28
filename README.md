# hugo-wishingwell-theme

[![Hugo ≥0.164](https://img.shields.io/badge/Hugo-%3E%3D0.164-315c7c)](https://gohugo.io) [![License MIT](https://img.shields.io/badge/License-MIT-8a8e91)](LICENSE)

WishingWell — restrained Hugo theme for Chinese technical writing.

## Requirements

- Hugo Extended `≥0.164.0`
- `posts` as Page Bundles (`posts/<slug>/index.md`), `topics` + `tags` taxonomies
- Per post: one `topics`, non-empty `description`, ASCII `slug`, ASCII heading IDs

## Install

```sh
git submodule add https://github.com/Wildfire2282/hugo-wishingwell-theme.git themes/hugo-wishingwell-theme
```

```toml
# hugo.toml
theme = "hugo-wishingwell-theme"
```

Ref: `exampleSite/hugo.toml`.

## Content

```sh
hugo new content posts/my-post/index.md
```

```yaml
---
title: "Title"
slug: "my-post"
description: "One-line summary"
topics: ["Engineering"]
tags: ["note"]
---
## Title {#my-post}
```

## Build

```sh
hugo --gc --minify --cleanDestinationDir --panicOnWarning --printPathWarnings
# theme check
hugo --source exampleSite --themesDir ../.. --theme hugo-wishingwell-theme --gc --minify --cleanDestinationDir --panicOnWarning --noBuildLock
```

## License

MIT. `exampleSite/content/` is sample content.
