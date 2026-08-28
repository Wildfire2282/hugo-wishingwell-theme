# hugo-wishingwell-theme

[![Hugo ≥0.164](https://img.shields.io/badge/Hugo-%3E%3D0.164-315c7c)](https://gohugo.io) [![License MIT](https://img.shields.io/badge/License-MIT-8a8e91)](LICENSE)

WishingWell — a restrained Hugo theme for Chinese technical writing. Paper × ink × well-blue, one accent, no radius except pill, motion only for feedback.

> **Well / Ripple / Coin** — page is the well, list is the mouth, hero coin drop is the single identity animation.

## Requirements

*   Hugo `≥0.164.0`, `theme = "hugo-wishingwell-theme"`
*   One section: `posts` (Page Bundles `posts/<slug>/index.md`)
*   Two taxonomies: `topics` + `tags`
*   Per post: exactly one `topics`, non-empty `description`, lowercase ASCII `slug`, ASCII heading IDs (`## Title {#id}`)

`validate-post.html` fails the build on violation (`--panicOnWarning`).

## Install

Copy `hugo-wishingwell-theme/` to your site's `themes/`:

```toml
# hugo.toml
theme = "hugo-wishingwell-theme"
```

Minimal reference: `exampleSite/hugo.toml`.

## Content

```sh
hugo new content posts/my-post/index.md
```

```yaml
topics: ["Engineering"]
tags: ["debugging"]
featured: false   # true → featured on home (latest wins)
toc: true
related: true
dropCap: false
```

ASCII URLs enforced: set `slug` on posts and `slug + url` on `topics/tags/_index.md`; Goldmark `autoIDType: github-ascii`.

## Build

```sh
hugo --gc --minify --cleanDestinationDir --panicOnWarning --printPathWarnings
# theme self-check
hugo --source themes/hugo-wishingwell-theme/exampleSite --themesDir ../.. \
  --theme hugo-wishingwell-theme --gc --minify --cleanDestinationDir --panicOnWarning
```

## Design System

Tokens in `assets/css/tokens/`:

*   **Primitives**: paper / ink / well ramps in `hsl()` + type `12-72` + spacing `4-256` (RUI, neighbor ≥25%) + `400/600` weights + `1px/2px` borders + `.05-.8` opacities + 5 shadows
*   **Semantic**: `--paper/--surface/--code-bg/--text-*/--border-*/--accent*` + `--overlay-fab/--tap-highlight` etc. Components may only reference semantic + scale, never `--wp-*` or hard-coded `hex`/`color-mix`.

Full spec: `docs/DESIGN.md` (`§3` pipeline, `§4` tokens, `§5` type, `§6` motion, `§7` components).

## Engineering

Single-file vanilla JS (`assets/js/main.js` → `fingerprint defer`), Hugo Pipes `Concat → minify → fingerprint` single `main.min.*.css`. See `docs/ENGINEERING.md` in the repository root for directory, artifact and CI contracts.

## License

MIT. See `LICENSE`. `exampleSite/content/` is sample content, not covered unless noted.
