# Developer Preferences & Guidelines

## Build Tools & Package Manager
- Always use **pnpm** for this project (even if other tools are recommended)
- Commands: `pnpm dev:firefox`, `pnpm build:firefox`, `pnpm zip:firefox`

## Communication Style
- Be **concise** - answer directly, avoid unnecessary preamble
- If explaining concepts (like WXT, browser extension architecture), provide **clear explanations** at a beginner-friendly level
- Ask clarifying questions before making assumptions

## Git Commit Guidelines
- **Never combine multiple changes into one commit** - each commit should address ONE specific change
- When user requests multiple changes, implement and test ONE at a time, commit it, then ask for testing before continuing
- Use **detailed git commits** with the following prefixes:
  - `[feat]` - new working features or major changes
  - `[proto]` - work in progress / prototyping  
  - `[fix]` - bug fixes that don't introduce new features
  - `[refactor]` - code cleaning and refactoring
  - `[docs]` - README and documentation updates

## Testing Workflow
- **Implement ONE change at a time**
- **Ask user to test** after each change
- Run `pnpm dev:firefox` and wait for user feedback
- Only commit after user confirms the change works correctly
- If multiple changes are requested, complete and test each one separately before moving to the next

## Firefox Extension Context
- This project uses **WXT** framework
- Uses Manifest V3
- Target URL: `*://gemini.google.com/*`
- Key APIs: browser.storage.local, content scripts, CSS injection

## Current Project
- Firefox extension to tag/filter Gemini chat conversations
- Right-click context menu for tag management (Add Tag, Remove Tag, Delete Chat)
- Filter bar above conversation list with multi-select (Ctrl+Click for intersection)
- Gray tags (no colors) for subtle appearance
- "deleted" tag for virtual deletion (hidden from main view, visible in Deleted filter)

## Future Considerations
- When adding new features, explain the concept before implementing
- Provide context on how extension APIs work when relevant
- Test changes with `pnpm dev:firefox` before committing
