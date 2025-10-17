# Important Configuration Notes

## OpenRouter API Key - REQUIRED

The extension **will not work** without an OpenRouter API key configured. This key is needed to generate prompts using AI.

### How to Get and Configure:

1. **Get API Key**:
   - Visit https://openrouter.ai
   - Sign up or log in to your account
   - Go to API Keys section
   - Create a new API key
   - Copy the key (format: `sk-or-v1-...`)

2. **Add to Supabase**:
   Since Edge Functions are already deployed, you need to add the API key as a secret:

   **Option A: Via Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Click "Edge Functions" in the sidebar
   - Click "Manage secrets" or go to Settings
   - Add a new secret:
     - Name: `OPENROUTER_API_KEY`
     - Value: Your OpenRouter API key

   **Option B: Via Supabase CLI** (if you have it installed)
   ```bash
   supabase secrets set OPENROUTER_API_KEY=your_api_key_here
   ```

3. **Verify Configuration**:
   - After adding the secret, redeploy the Edge Functions:
   ```bash
   # No need to redeploy - secrets are automatically available
   ```
   - The `generate-prompt` Edge Function will now use the API key

### Cost Considerations

- OpenRouter charges per token usage
- The extension uses Claude 3.5 Sonnet model
- Typical cost per prompt generation: $0.01-0.03
- Monitor your usage at https://openrouter.ai/activity

## Database Structure

The following tables are created in your Supabase database:

### `extension_users`
- Stores user accounts for the extension
- Uses SHA-256 password hashing
- Tracks login history

### `prompt_generations`
- Logs all generated prompts
- Tracks user actions (edited, copied)
- Enables usage analytics and future billing

## Security Notes

1. **Authentication**: The extension uses a simple token-based auth system
   - Tokens are stored in localStorage
   - Service role key is used for backend operations
   - RLS is enabled but bypassed by service role (by design)

2. **Password Security**: Uses SHA-256 hashing
   - For production, consider upgrading to bcrypt
   - Current implementation is sufficient for MVP

3. **API Keys**:
   - Never commit API keys to git
   - Store only in Supabase secrets
   - Environment variables are not accessible in Edge Functions

## Extension Permissions

The extension requests:
- `storage`: To cache authentication tokens
- `host_permissions` for `https://bolt.new/*`: To inject content script

These are minimal permissions required for functionality.

## Development vs Production

### Current Build (Production-Ready)
- All components are production builds
- CSS is minified
- JavaScript is bundled and optimized
- Extension size: ~185KB

### For Development
If you want to develop the extension:
1. Make changes to files in `src/extension/`
2. Run `npm run build:extension`
3. Go to `chrome://extensions/`
4. Click "Reload" on the extension
5. Refresh bolt.new page

## Troubleshooting Checklist

Before reporting issues, verify:

- [ ] OpenRouter API key is configured in Supabase
- [ ] Environment variables in `.env` are correct
- [ ] Extension is enabled in Chrome
- [ ] You're on the correct URL (https://bolt.new)
- [ ] Browser console shows no errors
- [ ] Supabase Edge Functions are deployed
- [ ] You have OpenRouter credits available

## Next Steps After Setup

1. Load extension in Chrome
2. Visit https://bolt.new
3. Click "Generate First Prompt" button
4. Create an account
5. Complete the questionnaire
6. Generate your first prompt
7. Copy and use in Bolt.new

## Support Resources

- OpenRouter Docs: https://openrouter.ai/docs
- Supabase Docs: https://supabase.com/docs
- Chrome Extension Docs: https://developer.chrome.com/docs/extensions/

## Future Enhancements

Consider implementing:
- Usage quotas per user
- Premium tiers with different models
- Prompt template library
- Team collaboration
- Analytics dashboard
- Export prompt history
