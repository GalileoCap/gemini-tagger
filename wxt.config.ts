import { defineConfig } from 'wxt';

export default defineConfig({
  browser: 'firefox',
  manifest: {
    name: 'Gemini Tagger',
    description: 'Add tags to Gemini conversations for organization and filtering',
    version: '0.1.0',
    permissions: ['storage'],
  },
});
