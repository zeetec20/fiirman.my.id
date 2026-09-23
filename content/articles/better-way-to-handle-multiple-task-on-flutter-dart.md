---
slug: better-way-to-handle-multiple-task-on-flutter-dart
docId: FOLIO-2022-001
title: "Better Way to Handle Multiple Tasks on Flutter / Dart"
coverImage: /article/better-way-to-handle-multiple-task-on-flutter-dart/thumbnail.jpg
date: August 16, 2022
readingTime: 5 min
tags:
  - Flutter
  - Dart
  - Concurrency
  - Isolates
  - Mobile
excerpt: "Concurrency in Dart: executing parallel asynchronous tasks and heavy computations without blocking the Flutter UI thread."
---

Concurrency is the ability to deal with multiple things at once. In Flutter, running heavy computational tasks on the main isolate introduces stutter and dropped frames. Mastering `Future.wait` and Dart Isolates unlocks fluid application performance.

## The Pitfall of Sequential Awaits

### Parallelizing Independent Async Futures

A common anti-pattern in asynchronous Dart is awaiting independent network calls sequentially. If each network request requires 500ms, five sequential awaits freeze progress for 2.5 seconds.

By executing independent futures concurrently using `Future.wait`, all operations execute in parallel, reducing total latency to the slowest single request.

```dart:concurrent_futures.dart
// Sequential (Slow: ~1500ms)
var user = await fetchUser();
var posts = await fetchPosts();
var stats = await fetchStats();

// Concurrent with Future.wait (Fast: ~500ms)
final results = await Future.wait([
  fetchUser(),
  fetchPosts(),
  fetchStats(),
]);
```

## Heavy Computation with Dart Isolates

### Offloading CPU Load Off the UI Thread

Dart is single-threaded by default, operating on an event loop. For CPU-bound tasks such as image filtering, JSON deserialization of massive payloads, or cryptographic hashing, compute isolates prevent UI thread freezes.

```dart:isolate_worker.dart
import 'package:flutter/foundation.dart';

// Spawn a separate isolate to decode large JSON
Future<List<Item>> parseItemsInBackground(String rawJson) async {
  return await compute(decodeAndParseJson, rawJson);
}
```

> **Performance Benchmark**
> Transitioning sequential async fetching to `Future.wait` yielded an average 68% decrease in initial screen loading time.
