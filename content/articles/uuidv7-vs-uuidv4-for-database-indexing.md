---
slug: uuidv7-vs-uuidv4-for-database-indexing
docId: FOLIO-2026-M631
title: "UUIDv7 vs UUIDv4 for database indexing"
coverImage: /article/uuidv7-vs-uuidv4-for-database-indexing/thumbnail.jpg
date: November 19, 2026
readingTime: 2 min
tags:
  - programming
  - software-engineering
  - identity
  - uuid
  - efficiency
excerpt: "Applications often use UUIDs as primary keys so they can generate unique IDs without relying on a central database sequence. UUIDv4 has been the usual default for years because it is random, widely su"
---

Applications often use UUIDs as primary keys so they can generate unique IDs without relying on a central database sequence. UUIDv4 has been the usual default for years because it is random, widely supported across languages and databases, and virtually collision-free. That randomness, however, hurts database index performance, which is the main problem UUIDv7 solves.

## 1. What makes UUIDv7 different?

UUIDv4 and UUIDv7 take up the same space: 128 bits (16 bytes), formatted as a 36-character string with hyphens. The difference is how those bits are laid out:

- UUIDv4 uses 122 random bits and reserves the remaining bits for version and variant information.
- UUIDv7 uses the first 48 bits for a Unix timestamp in milliseconds, leaving 74 bits for randomness and optional monotonicity mechanisms.

```
UUIDv4: 550e8400-e29b-41d4-a716-446655440000
UUIDv7: 019535d9-3df7-79fb-b466-fa907fa17f9e
```

Because the timestamp comes first, UUIDv7 values sort by creation time. The specification is published in [RFC 9562](https://datatracker.ietf.org/doc/rfc9562/) (May 2024).

## 2. Why this matters for B-tree indexing

Most relational databases use B-tree indexes. When you insert thousands of rows using UUIDv4, each new key can land anywhere in the tree, causing extra page splits, random page writes, and lower index utilization as the table grows.

With UUIDv7, the timestamp sits in the most significant bits, so newer IDs generally sort after older ones and land near the end of the index. In suitable workloads, that sequential insertion pattern improves locality and cache usage, cuts down on random page writes and page splits, and speeds up writes.

Sequential inserts will not speed up every query or eliminate B-tree searches. Also, IDs generated within the same millisecond are not guaranteed to sort in order unless the generator adds a counter or another monotonicity mechanism.

## 3. UUIDv7 support across languages, databases, and ORMs

Several languages, databases, and ORMs now support UUIDv7 natively, while others still rely on external packages or custom generators.

## Programming languages

[https://gist.github.com/zeetec20/7879e41ea1a06c14df023f18f89a0116](https://gist.github.com/zeetec20/7879e41ea1a06c14df023f18f89a0116)

## Database support

[https://gist.github.com/zeetec20/fad68186fe6c4c2d32a5305bd211e590](https://gist.github.com/zeetec20/fad68186fe6c4c2d32a5305bd211e590)

## ORM and query builder support

[https://gist.github.com/zeetec20/6fa48f923b510fd265d96c03d7079950](https://gist.github.com/zeetec20/6fa48f923b510fd265d96c03d7079950)

Most of these ORMs rely on application-side generators or database functions to produce UUIDv7 values rather than generating them natively.

## 4. Should you use UUIDv7?

For new applications, UUIDv7 is a strong default for primary keys, especially on large tables or workloads with frequent inserts. It keeps the 128-bit storage footprint of UUIDv4 while adding time-based ordering for better index locality.

UUIDv4 is still the better fit when you want to avoid exposing approximate creation timestamps in your IDs. For my own upcoming projects, I will default to UUIDv7 unless a specific requirement calls for another identifier strategy.
