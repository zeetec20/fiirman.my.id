---
id: lazymacfan
code: PRJ-002-LZFN
title: "lazymacfan: macOS TUI Fan Controller & Background Thermal Agent"
badge: PRODUCTION
year: "2026"
category: Systems
featured: false
image: "/images/lazymacfan-mockup.webp"
imageAlt: "lazymacfan terminal UI fan control dashboard"
techStack:
  - TypeScript
  - Bun
  - OpenTUI
  - React 19
  - AppleSMC / IOHID
  - launchd
demo: "https://github.com/zeetec20/lazymacfan/releases"
repo: "https://github.com/zeetec20/lazymacfan"
docs: ""
order: 2
---

lazymacfan is a macOS terminal UI and a persistent background controller for system fans on Apple Silicon and Intel Macs. The OpenTUI interface and the daemon communicate over a Unix domain socket, so quitting the terminal leaves manual RPM targets or custom temperature curves running, with hardware clamping to each fan's supported range, a 95 °C emergency override, and a fail-safe handback to macOS automatic control on shutdown.

> **ARCHITECTURAL DISPATCH**
> Universal Mach-O binaries (arm64 + x86_64) reach AppleSMC and IOHIDEventSystemClient through a setuid helper, installed via Homebrew and supervised by launchd.
