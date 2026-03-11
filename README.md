# Gemini Tagger

A Firefox extension to organize and filter your Gemini conversation history with tags.

## Features

- **Tag Conversations**: Right-click on any conversation to add, remove, or delete tags
- **Filter by Tags**: Use the filter bar to quickly find conversations by tag
- **Multi-Select**: Hold Ctrl/Cmd and click multiple filters to show conversations with ALL selected tags (intersection)
- **Virtual Deletion**: "Delete" a conversation without removing it - it's hidden from the main view but accessible via the Deleted filter
- **Persistent Storage**: All tags are stored locally in your browser and persist across sessions
- **Auto-Migration**: Tags are automatically migrated when the extension updates

## Installation

### From Firefox Add-ons

1. Download from [Firefox Add-ons](https://addons.mozilla.org/)
2. Click "Add to Firefox"
3. Grant permissions when prompted

### From Source

```bash
# Install dependencies
pnpm install

# Build for Firefox
pnpm build:firefox

# Or build and create ZIP for submission
pnpm zip:firefox
```

The built extension will be in `.output/firefox-mv3/`

### Loading in Firefox (Development)

```bash
# Start development server
pnpm dev:firefox
```

Then:
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on"
3. Navigate to `gemini-tagger/.output/firefox-mv3/` and select `manifest.json`

## Usage

### Adding Tags

1. Open the Gemini sidebar
2. Right-click on any conversation
3. Select "Add Tag" and enter a tag name
4. Press Enter to save

### Filtering

- Click "All" to show all non-deleted conversations
- Click a tag to filter by that tag
- Hold Ctrl/Cmd and click multiple tags to show only conversations that have ALL selected tags
- Click "Deleted" to show only deleted conversations

### Deleting (Virtual)

- Right-click a conversation → "Delete Chat"
- The conversation will be hidden from the main view
- Access it via the "Deleted" filter
- Click "Restore Chat" to unhide

## Permissions

- **storage**: Required to persist your tags locally

## Privacy

This extension stores all data locally in your browser. No data is sent to any external servers. See [PRIVACY.md](PRIVACY.md) for details.

## Building for Submission

```bash
# Create ZIP file for Firefox Add-ons submission
pnpm zip:firefox
```

Upload the resulting ZIP file to [Firefox Developer Hub](https://addons.mozilla.org/developers/)

## Version History

- **0.1.0**: Initial release with tag management and filtering
