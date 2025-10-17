# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension that injects into bolt.new pages to help users generate optimized first prompts through a guided 5-step questionnaire. The extension uses React for UI, Supabase for backend/database, and OpenRouter (Claude 3.5 Sonnet) for AI-powered prompt generation.

## Essential Commands

### Build & Development
```bash
npm install                  # Install dependencies
npm run build:extension      # Build Chrome extension (outputs to dist/)
npm run dev                  # Start dev server for component testing (not for extension)
npm run lint                 # Run ESLint
npm run typecheck            # TypeScript type checking
```

### Testing Extension Changes
After making code changes:
1. Run `npm run build:extension`
2. Go to `chrome://extensions/`
3. Click reload icon on the extension
4. Refresh bolt.new page

### Environment Setup
Required `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Required Supabase secret (set via dashboard or CLI):
```
OPENROUTER_API_KEY=sk-or-v1-...
```

## Architecture

### Entry Point & Injection
- `src/extension/content.tsx` is the content script entry point
- `BoltPromptGenerator` class handles button injection and modal lifecycle
- Button is injected at bottom-right of bolt.new pages
- Modal uses React portal pattern (creates separate DOM root)

### Component Hierarchy
```
content.tsx (BoltPromptGenerator)
  └── ModalContainer.tsx (Main orchestrator)
      ├── AuthForm.tsx (Signup/login)
      └── Questionnaire steps:
          ├── Step1ProjectType.tsx
          ├── Step2Audience.tsx
          ├── Step3Features.tsx (2-5 features required)
          ├── Step4Adaptive.tsx (Dynamic questions based on project type)
          ├── Step5Design.tsx
          └── PromptPreview.tsx (Edit, regenerate, refine, copy)
```

### State Management Pattern
- `ModalContainer` maintains all questionnaire state
- Uses React hooks for state management
- Authentication token stored in localStorage as `bolt_prompt_generator_token`
- Step navigation: 1 → 2 → 3 → 4 → 5 → preview

### API Communication
- `src/extension/api.ts` contains all Supabase Edge Function calls
- API client pattern with centralized header management
- Token automatically included in requests when `includeAuth: true`

### Backend (Supabase Edge Functions)
- `supabase/functions/auth/index.ts`: Signup, login, token verification
- `supabase/functions/generate-prompt/index.ts`: AI prompt generation via OpenRouter
- `supabase/functions/track-usage/index.ts`: Usage tracking (edited, copied)

### Database Schema
```
extension_users:
  - id, email, password_hash (SHA-256), created_at, last_login

prompt_generations:
  - id, user_id (FK), project_type, target_audience, core_features (jsonb)
  - adaptive_answers (jsonb), design_preferences (jsonb), generated_prompt (text)
  - was_edited, was_copied, created_at
```

## Key Implementation Details

### Vite Configuration
- Dual-mode config: `mode === 'extension'` vs regular build
- Extension mode: Bundles `src/extension/content.tsx` as entry point
- Output: `content.js` and `content.css` to `dist/`
- `emptyOutDir: false` to preserve previous build artifacts

### Build Process
1. Vite bundles content script in extension mode
2. `scripts/build-extension.js` post-build script:
   - Copies `manifest.json` to dist/
   - Generates placeholder SVG icons (16, 48, 128)

### Authentication Flow
1. User clicks button → Modal opens
2. Check localStorage for token
3. If token exists, verify with `/auth/verify`
4. If no token or invalid, show `AuthForm`
5. On signup/login, store token and show questionnaire

### Prompt Generation Flow
1. User completes 5 steps → data collected in `QuestionnaireData` interface
2. Click "Generate" → `apiClient.generatePrompt(data)`
3. Edge function constructs meta-prompt following thelaunch.space format
4. OpenRouter API called with Claude 3.5 Sonnet
5. Generated prompt saved to database with generation ID
6. Returns to `PromptPreview` component

### thelaunch.space Format (Meta-Prompt Structure)
The AI generates prompts with these sections:
- **Objective**: 2-3 sentences describing what to build
- **Target Audience**: Who will use this
- **Design Principles**: Visual aesthetic, responsiveness, premium feel
- **Functional Requirements**: User stories format: "<user_type> should be able to <action> so that <purpose>"
- **Business Logic**: If applicable

Critical rules enforced:
- Prioritize BREADTH over DEPTH
- Focus on WHAT, not HOW
- Use clear user story format
- Include responsive design requirements
- Mention Tailwind CSS and React

### Adaptive Questions (Step 4)
Dynamic questions rendered based on `projectType` selected in Step 1. Each project type has unique questions to gather relevant context (e.g., SaaS asks about authentication, e-commerce asks about payment integration).

## Important Constraints

### Security
- Passwords hashed with SHA-256 (consider bcrypt for production)
- Token-based auth using custom implementation (not Supabase Auth)
- Row Level Security enabled but bypassed by service role key (by design)
- Never commit API keys or secrets

### Chrome Extension Permissions
- Manifest V3 format
- Only requests: `storage` and `host_permissions` for `https://bolt.new/*`
- Minimal permissions by design

### API Dependencies
- OpenRouter API requires active key with credits
- Uses `anthropic/claude-3.5-sonnet` model
- Cost: ~$0.01-0.03 per prompt generation

## Common Tasks

### Adding a New Questionnaire Step
1. Create component in `src/extension/components/Step[N][Name].tsx`
2. Add step to `ModalContainer.tsx` step navigation logic
3. Update `QuestionnaireData` interface in `types.ts`
4. Modify `apiClient.generatePrompt()` to include new data
5. Update meta-prompt in `supabase/functions/generate-prompt/index.ts`

### Modifying Project Types or Design Styles
- Step1ProjectType.tsx: Update `projectTypes` array
- Step4Adaptive.tsx: Add corresponding adaptive questions
- Step5Design.tsx: Update `designStyles` array

### Changing AI Model or Provider
- Edit `supabase/functions/generate-prompt/index.ts`
- Update OpenRouter model identifier
- Adjust meta-prompt structure if needed

### Debugging Extension Issues
1. Check browser console (F12) on bolt.new page
2. Verify extension is enabled in `chrome://extensions/`
3. Check Supabase Edge Function logs in dashboard
4. Ensure OpenRouter API key is configured and has credits
5. Verify `.env` variables are correct

## Development Notes

### Component Testing
Use `npm run dev` to test individual components in isolation, but note that this runs the web app (index.html), not the extension. For actual extension testing, always use `npm run build:extension` and load in Chrome.

### CSS Bundling
- Uses Tailwind CSS with PostCSS
- `index.css` imports Tailwind directives
- Bundled into `content.css` in extension build
- All styles scoped to modal overlay (z-index: 999999)

### TypeScript Configuration
- `tsconfig.app.json`: Extension code config
- `tsconfig.node.json`: Build scripts config
- `@types/chrome` for Chrome extension APIs

### Modal Isolation
Modal is completely isolated from bolt.new's DOM:
- Separate React root
- High z-index (999999)
- Fixed positioning
- Self-contained styling
