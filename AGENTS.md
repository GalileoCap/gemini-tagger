# Developer Preferences & Guidelines

## Build Tools & Package Manager
- Always use **pnpm** for this project (even if other tools are recommended)
- Commands: `pnpm dev:firefox`, `pnpm build:firefox`, `pnpm zip:firefox`

## Communication Style
- Be **concise** - answer directly, avoid unnecessary preamble
- If explaining concepts (like WXT, browser extension architecture), provide **clear explanations** at a beginner-friendly level
- Ask clarifying questions before making assumptions

## Git Commit Guidelines
- Make **small, focused commits** - each commit should represent one logical change
- When working on multiple changes, commit **one at a time** and ask for testing before continuing
- Use **detailed git commits** with the following prefixes:
  - `[feat]` - new working features or major changes
  - `[proto]` - work in progress / prototyping
  - `[fix]` - bug fixes that don't introduce new features
  - `[refactor]` - code cleaning and refactoring
  - `[docs]` - README and documentation updates

## Testing Workflow
- **Always ask user to test** after each change or small group of changes
- Run `pnpm dev:firefox` and wait for user feedback before making more changes
- Verify the extension works as expected before committing
- Only commit after user confirms the changes work

## Firefox Extension Context
- This project uses **WXT** framework
- Uses Manifest V3
- Target URL: `*://gemini.google.com/*`
- Key APIs: browser.storage.local, content scripts, CSS injection

## Current Project
- Firefox extension to tag/filter Gemini chat conversations
- Three-dots hover menu for tag management (click the menu, not right-click)
- Filter bar above conversation list
- Tags stored locally, auto-assigned pastel colors
- "deleted" tag for virtual deletion (hidden from main view, visible in Deleted filter)

## Future Considerations
- When adding new features, explain the concept before implementing
- Provide context on how extension APIs work when relevant
- Test changes with `pnpm dev:firefox` before committing
