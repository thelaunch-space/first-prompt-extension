# Bolt.new First Prompt Generator - Chrome Extension

A Chrome extension that helps Bolt.new users create optimized first prompts through a guided questionnaire, reducing token waste and improving project success rates.

## Features

- **Guided Questionnaire**: 5-step process to capture project requirements
- **Smart Prompt Generation**: AI-powered prompt creation using OpenRouter
- **User Authentication**: Secure signup/login system with usage tracking
- **Adaptive Questions**: Dynamic questions based on project type
- **Prompt Refinement**: Edit, regenerate, or refine generated prompts
- **One-Click Copy**: Copy optimized prompts directly to Bolt.new

## Installation

### Prerequisites

1. Node.js 18+ installed
2. Chrome browser
3. Supabase account (already configured)
4. OpenRouter API key

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Configure OpenRouter API Key**:
   The extension requires an OpenRouter API key to generate prompts. Add it to your Supabase environment:
   - Go to your Supabase project dashboard
   - Navigate to Project Settings > Edge Functions
   - Add secret: `OPENROUTER_API_KEY` with your API key value
   - Get your API key from https://openrouter.ai

4. **Build the extension**:
   ```bash
   npm run build:extension
   ```

5. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Usage

1. Navigate to https://bolt.new in Chrome
2. Look for the "Generate First Prompt" button in the bottom-right corner
3. Click the button to open the questionnaire modal
4. Sign up or log in (first-time users)
5. Complete the 5-step questionnaire:
   - **Step 1**: Select project type
   - **Step 2**: Define target audience
   - **Step 3**: List core features (2-5)
   - **Step 4**: Answer adaptive questions based on project type
   - **Step 5**: Choose design style and preferences
6. Review the generated prompt
7. Optionally edit, regenerate, or refine the prompt
8. Click "Copy to Bolt.new" to copy the optimized prompt
9. Paste into Bolt.new and start building

## Architecture

### Frontend (Chrome Extension)
- **Content Script**: Injects button and modal into bolt.new pages
- **React Components**: Modal UI with 5-step questionnaire flow
- **State Management**: React hooks for managing questionnaire data
- **API Client**: Communicates with Supabase Edge Functions

### Backend (Supabase)
- **Database**:
  - `extension_users`: User accounts and authentication
  - `prompt_generations`: Usage tracking and prompt history
- **Edge Functions**:
  - `auth`: Handles signup, login, and token verification
  - `generate-prompt`: AI prompt generation via OpenRouter
  - `track-usage`: Tracks user actions (edit, copy)

### AI Integration
- **OpenRouter API**: Uses Claude 3.5 Sonnet for prompt generation
- **Meta-Prompting**: Structures requests to generate Bolt.new-optimized prompts
- **thelaunch.space Format**: Follows best practices for AI coding tools

## Development

### Project Structure
```
/src/extension/
  /components/      # React components for UI
    - AuthForm.tsx
    - Step1ProjectType.tsx
    - Step2Audience.tsx
    - Step3Features.tsx
    - Step4Adaptive.tsx
    - Step5Design.tsx
    - PromptPreview.tsx
    - ModalContainer.tsx
  - content.tsx     # Content script entry point
  - api.ts          # API client for Supabase
  - types.ts        # TypeScript interfaces
/supabase/
  /functions/       # Edge Functions
    - auth/
    - generate-prompt/
    - track-usage/
/public/
  - manifest.json   # Chrome extension manifest
  - icon*.png       # Extension icons
```

### Build Commands

- `npm run dev` - Start development server (for testing components)
- `npm run build` - Build production web app
- `npm run build:extension` - Build Chrome extension
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

## Security

- Passwords are hashed using SHA-256 before storage
- Token-based authentication for API requests
- Row Level Security (RLS) enabled on all database tables
- CORS configured for Supabase Edge Functions
- No sensitive data exposed in client-side code

## Troubleshooting

### Extension doesn't appear on bolt.new
- Check that the extension is enabled in `chrome://extensions/`
- Verify the extension has permissions for `https://bolt.new/*`
- Refresh the bolt.new page

### Authentication fails
- Verify Supabase URL and keys are correct in `.env`
- Check browser console for error messages
- Ensure Edge Functions are deployed

### Prompt generation fails
- Verify OpenRouter API key is configured in Supabase
- Check that you have OpenRouter credits available
- Review Edge Function logs in Supabase dashboard

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)

## Future Enhancements

- Usage quotas and billing tiers
- Prompt templates library
- Team collaboration features
- Analytics dashboard
- Export prompt history
- Browser extension for other browsers (Firefox, Edge)

## License

MIT License

## Support

For issues and feature requests, please contact the development team.
