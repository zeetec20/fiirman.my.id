---
slug: whats-git-stash
docId: FOLIO-2023-002
title: "What's git stash?"
coverImage: /article/whats-git-stash/thumbnail.jpg
date: June 11, 2023
readingTime: 4 min
tags:
  - Git
  - Version Control
  - Workflow
  - Developer Productivity
excerpt: "Saving unfinished work temporarily without polluting git commit history: a tactical guide to managing, inspecting, and applying stashes."
---

Software development demands frequent context switching. Urgent hotfixes, pull request reviews, and spontaneous meetings often arise before code is ready to commit. `git stash` shelves uncommitted changes cleanly.

## Git File Lifecycles & Stashing

### Shelving Dirty Workspaces Instantly

In Git, files transition between states: Untracked, Unmodified, Modified, and Staged. When you need to switch branches immediately without committing half-finished work, standard `git checkout` will fail if conflicts exist.

Running `git stash` records the modified index and working directory changes to a local stack, reverting your working tree to the clean HEAD commit.

```bash:terminal
# Basic stash of modified tracked files
git stash

# Include untracked files
git stash -u

# Stash with descriptive message
git stash save "WIP: redis idempotency middleware refactor" -u
```

## Listing, Inspecting & Applying Stashes

### Stack Management & Inspection

To inspect previously saved stashes without applying them, use `git stash list` and `git stash show`.

When ready to resume work, `git stash pop` restores the changes and removes the entry from the stash stack, while `git stash apply` leaves the stash entry intact.

```bash:terminal
# List all stashed entries
git stash list

# View diff of the most recent stash
git stash show -p stash@{0}

# Restore and remove from stack
git stash pop stash@{0}
```

> **Pro-Tip: Stash Branching**
> If you stashed changes and the current branch evolved significantly, run `git stash branch new-feature-branch` to create a new branch from the stash commit and apply the changes cleanly.
