---
slug: how-to-merge-or-modify-type-on-typescript
docId: FOLIO-2023-001
title: "How to Merge or Modify Types in TypeScript"
coverImage: /article/how-to-merge-or-modify-type-on-typescript/thumbnail.jpg
date: February 17, 2023
readingTime: 4 min
tags:
  - TypeScript
  - Type Systems
  - Utility Types
  - Omit
  - Generics
excerpt: "Using utility types like Omit and intersection types to extend, overwrite, and safely compose complex TypeScript object types."
---

Static typing in TypeScript dramatically eliminates runtime bugs by predicting input and output shapes. However, complex interfaces frequently require surgical modifications — stripping fields, altering nullability, or merging schemas.

## The Overwrite Generic Pattern

### Composing Omit & Intersection Types

When adapting existing API contracts or database models, we often need to overwrite specific keys without rewriting the entire type definition.

By combining TypeScript's built-in `Omit<T, K>` with intersection types (`&`), we can create a reusable `Overwrite<A, B>` generic utility.

```typescript:types.ts
// Generic utility to replace properties in A with properties from B
type Overwrite<A, B> = Omit<A, keyof B> & B;

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// Modify 'id' to be optional/nullable for draft creation
type DraftUser = Overwrite<User, { id?: null }>;
```

## Practical Usage in Data Layers

### Type-Safe Component Props & Mutations

Using `Overwrite` ensures that when the upstream `User` model changes (e.g. adding a new field), all downstream modified types inherit the change automatically while preserving your customized overrides.

```typescript:user-service.ts
const draft: DraftUser = {
  name: "Firman",
  email: "jusles363@gmail.com",
  createdAt: new Date().toISOString(),
  // id is optional and omitted cleanly!
};
```
