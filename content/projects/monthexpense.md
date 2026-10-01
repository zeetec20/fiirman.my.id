---
id: monthexpense
code: PRJ-002-MNTH
title: "MonthExpense — Mobile-First Intelligent Expense Logger"
badge: PRODUCTION
year: "2026"
category: Systems
featured: true
image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
imageAlt: "MonthExpense mobile receipt scanner and expense ledger"
techStack:
  - React 19
  - Hono
  - Cloudflare Workers
  - TypeScript
  - Tailwind CSS
  - Vite
demo: "https://monthexpense.pages.dev"
repo: "https://github.com/zeetec20/monthexpense"
docs: ""
order: 2
---

A high-performance, mobile-first expense logger engineered for frictionless transaction recording. Users can scan paper receipts via client-side OCR or record voice memos, which are parsed and validated into structured financial data.

Built with complete local-first privacy: data is stored on-device and synchronized directly to the user's personal Google Sheets with zero third-party database exposure.

> **ARCHITECTURAL DISPATCH**  
> Full-stack Hono architecture deployed on Cloudflare Workers and Pages with client-side OCR worker, voice capture fallback, and automated Google Sheets synchronization.
