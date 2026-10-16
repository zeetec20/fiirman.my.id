---
id: monthexpense
code: PRJ-001-MNTH
title: "MonthExpense: Local-First Expense Logger & Receipt Scanner"
badge: PRODUCTION
year: "2026"
category: Systems
featured: true
image: "/images/monthexpense-mockup.webp"
imageAlt: "MonthExpense expense ledger and receipt scanner interface"
techStack:
  - React 19
  - Hono
  - Cloudflare Workers
  - Workers AI
  - PaddleOCR (WASM)
  - Google Sheets API
demo: "https://monthexpense.fiirman.my.id/"
repo: "https://github.com/zeetec20/monthexpense"
docs: ""
order: 1
---

MonthExpense is an open-source, local-first expense logger. Receipts are scanned in-browser with PaddleOCR (WebAssembly), voice notes are transcribed, and both are structured into transactions by Workers AI (Llama 3.1 8B), then synced straight to the user's own Google Spreadsheet, with no proprietary database and zero tracking.

> **ARCHITECTURAL DISPATCH**
> React 19 client and Hono API compile into a single Cloudflare Workers bundle with Workers Static Assets and a Workers AI binding.
