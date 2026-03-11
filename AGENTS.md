# Developer Preferences & Guidelines

## Build Tools & Package Manager
- Always use **pnpm** for this project (even if other tools are recommended)
- Commands: `pnpm dev:firefox`, `pnpm build:firefox`, `pnpm zip:firefox`

## Communication Style
- Be **concise** - answer directly, avoid unnecessary preamble
- If explaining concepts (like WXT, browser extension architecture), provide **clear explanations** at a beginner-friendly level
- Ask clarifying questions before making assumptions
- Use **detailed git commits** with the following prefixes:
  - `[feat]` - new working features or major changes
  - `[proto]` - work in progress / prototyping
  - `[fix]` - bug fixes that don't introduce new features
  - `[refactor]` - code cleaning and refactoring
  - `[docs]` - README and documentation updates

## Firefox Extension Context
- This project uses **WXT** framework
- Uses Manifest V3
- Target URL: `*://gemini.google.com/*`
- Key APIs: browser.storage.local, content scripts, CSS injection

## Current Project
- Firefox extension to tag/filter Gemini chat conversations
- Right-click menu for tag management
- Filter bar above conversation list
- Tags stored locally, auto-assigned colors
- Default tag: "misc"

## Future Considerations
- When adding new features, explain the concept before implementing
- Provide context on how extension APIs work when relevant
- Test changes with `pnpm dev:firefox` before committing
