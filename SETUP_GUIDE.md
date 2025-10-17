# Quick Setup Guide

## 1. OpenRouter API Key Configuration

The extension requires an OpenRouter API key to generate prompts using AI.

### Get Your API Key
1. Go to https://openrouter.ai
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-...`)

### Add to Supabase
The API key is automatically configured as a secret in your Supabase project. However, if you need to update it:

1. Go to your Supabase project dashboard
2. Click on "Edge Functions" in the left sidebar
3. Add a new secret:
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key

Note: Edge Function secrets are automatically available as environment variables.

## 2. Database Setup

Database tables and Edge Functions are already deployed and configured:

### Tables Created
- `extension_users` - User accounts
- `prompt_generations` - Usage tracking

### Edge Functions Deployed
- `auth` - Authentication (signup, login, verify)
- `generate-prompt` - AI prompt generation
- `track-usage` - Usage analytics

You can view these in your Supabase dashboard.

## 3. Build and Install Extension

### Build the Extension
```bash
npm install
npm run build:extension
```

This will:
1. Install all dependencies
2. Build the React components
3. Bundle the content script
4. Copy manifest and icons to `dist/` folder

### Install in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `dist` folder from this project
6. Extension icon should appear in your toolbar

## 4. Test the Extension

1. Navigate to https://bolt.new
2. You should see a "Generate First Prompt" button in the bottom-right
3. Click it to open the modal
4. Create an account (first time)
5. Complete the questionnaire
6. Generate and copy your optimized prompt

## 5. Environment Variables

The `.env` file should contain:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values are automatically configured when using the Supabase integration.

## Common Issues

### Extension button doesn't appear
- Refresh the bolt.new page
- Check that extension is enabled in `chrome://extensions/`
- Open DevTools console and check for errors

### Prompt generation fails
- Verify OpenRouter API key is set correctly
- Check you have credits on OpenRouter account
- View Edge Function logs in Supabase dashboard

### Authentication errors
- Clear browser localStorage and try again
- Check Supabase URL and keys in `.env`
- Verify Edge Functions are deployed

## Support

If you encounter issues:
1. Check browser console for errors
2. Review Supabase Edge Function logs
3. Verify all environment variables are set
4. Ensure OpenRouter API key has available credits
