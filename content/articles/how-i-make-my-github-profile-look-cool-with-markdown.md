---
slug: how-i-make-my-github-profile-look-cool-with-markdown
docId: FOLIO-2021-001
title: "How I Make My GitHub Profile Look Cool With Markdown"
coverImage: /article/how-i-make-my-github-profile-look-cool-with-markdown/thumbnail.jpg
date: October 28, 2021
readingTime: 4 min
tags:
  - GitHub
  - Markdown
  - Developer Portfolio
  - Workflow
excerpt: "Crafting an expressive and professional developer dossier using GitHub special repository profile features and clean markdown formatting."
---

Your GitHub profile is often the first technical footprint other engineers and hiring leads examine. By creating a repository matching your username, you unlock a custom front-page portfolio rendered directly from Markdown.

## Special Repository Initialization

### Activating the User Profile README

To initialize a profile README, create a new public repository matching your exact GitHub username (e.g. [github.com/zeetec20/zeetec20](https://github.com/zeetec20/zeetec20)).

GitHub recognizes this special pattern and provides a banner indicating that the README inside will be displayed at the top of your public profile page.

## Structure & Dynamic Widgets

### Markdown Formatting & Visual Anchors

An effective developer profile combines a clear editorial bio, current focus areas, primary technical proficiencies with SVG badges, and dynamic GitHub stat widgets.

```markdown:README.md
## Hello, I'm Firman Justisio Lestari 👋

- 🔭 Four years at the trade: TypeScript, React, Next.js & Bun runtimes
- 🌱 Currently exploring distributed systems, idempotency & Rust
- 💬 Reach out via Medium: [Firman's Medium](https://firmanlestari.medium.com)

### Technologies
<p>
  <img src="https://skillicons.dev/icons?i=ts,react,nextjs,tailwind,bun,redis,postgres" />
</p>
```
