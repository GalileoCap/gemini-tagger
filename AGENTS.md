# Developer Preferences & Guidelines

## IMPORTANT: Git Branching & Workflow Rules
- `main` and `dev` branches are READ‑ONLY. Do not commit directly to these branches.
- For each feature or fix:
  1. Fork a new branch from `dev` (use `git worktree` to create a dedicated worktree).
 2. Use a short, descriptive branch name.
 3. Work inside the worktree and commit small, focused changes.
 4. **Before committing any change:** run formatting, linting, and automated tests locally.
 5. When the feature is complete:
     - Ask the user to validate and perform manual testing of the full feature.
     - If not approved, continue iterating on the same working branch.
     - If approved: rebase the working branch onto `dev`, run formatting/lint/tests again, then squash & merge into `dev`.
     - Delete the feature worktree after merge.

## Commit Message Conventions
- Use concise, descriptive commit messages and the following prefixes:
  - `[feat]` - new working features or major changes
  - `[proto]` - work in progress / prototyping
  - `[fix]` - bug fixes that don't introduce new features
  - `[refactor]` - code cleaning and refactoring
  - `[docs]` - README and documentation updates

## Build Tools & Package Manager
- Always use `pnpm` for this project (even if other tools are recommended).
- Common scripts:
  - `pnpm dev:firefox` — run extension in Firefox for development
  - `pnpm build:firefox` — build production bundle for Firefox
  - `pnpm zip:firefox` — package a ZIP for AMO
  - `pnpm lint` — run linters (if configured)
  - `pnpm test` — run automated tests (if configured)

## Communication & Testing
- Be concise; answer directly and avoid unnecessary preamble.
- Run `pnpm dev:firefox` while developing and ask the user to validate the completed feature before integration.
- Always run formatting, linting, and automated tests before making commits and again after rebasing before merging.

## Firefox Extension Context
- Framework: WXT (Manifest V3)
- Target URL: `*://gemini.google.com/*`
- Key APIs: `browser.storage.local`, content scripts, CSS injection

## Current Project Overview
- Firefox extension to tag/filter Gemini chat conversations
- Right-click context menu for tag management (Add Tag, Remove Tag, Delete Chat)
- Filter bar above conversation list with multi-select (Ctrl+Click for intersection)
- Gray tags (no colors) for subtle appearance
- `deleted` tag for virtual deletion (hidden from main view, accessible via Deleted filter)

## Future Considerations
- When adding new features, explain the concept before implementing.
- Provide context on how extension APIs work when relevant.
- Test changes with `pnpm dev:firefox` and automated tests before committing.
