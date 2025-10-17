# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension that injects into bolt.new pages to help users generate optimized first prompts through a guided 6-step questionnaire. The extension uses React for UI, Supabase for backend/database, and OpenRouter (Claude Haiku 4.5) for AI-powered prompt generation.

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
1. Run `npm run build:extension` (always required after code changes)
2. Go to `chrome://extensions/`
3. Click the reload/refresh icon on the extension card (circular arrow)
4. Refresh the bolt.new page (F5 or Cmd/Ctrl+R)

**Important Notes:**
- You do NOT need to remove and re-upload the extension
- Just reload the extension in `chrome://extensions/` (step 3)
- Only manifest.json changes might require re-uploading (though reload usually works)
- This workflow is much faster than removing/re-adding

### Environment Setup
Required `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** For extension builds, these are hard-coded in `vite.config.ts` to be bundled into the extension. The `.env` file is primarily for local development mode.

Required Supabase secret (set via dashboard or CLI):
```
OPENROUTER_API_KEY=sk-or-v1-...
```

## Architecture

### Entry Point & Injection
- `src/extension/content.tsx` is the content script entry point
- `BoltPromptGenerator` class handles button injection and modal lifecycle
- **Smart Button UX**: Dual-mode button system
  - **Full mode**: Appears bottom-right when bolt.new page is empty
  - **Compact mode**: Transforms to left-edge tab after user enters a prompt
  - Auto-hides to left edge (-32px), slides out on hover in compact mode
  - Button mode persists in localStorage (`bolt_prompt_generator_mode`)
  - MutationObserver watches textarea for prompt input to trigger transformation
- Modal uses React portal pattern (creates separate DOM root)

### Component Hierarchy
```
content.tsx (BoltPromptGenerator)
  └── ModalContainer.tsx (Main orchestrator)
      ├── AuthForm.tsx (Signup/login)
      ├── LoadingScreen.tsx (Adaptive progress - syncs with API response time)
      └── Questionnaire steps:
          ├── Step1ProjectType.tsx
          ├── Step2Audience.tsx
          ├── Step3PainPoints.tsx (Pain points the project solves)
          ├── Step4Description.tsx (Natural language solution description)
          ├── Step5Adaptive.tsx (Dynamic questions based on project type)
          ├── Step6Design.tsx (Visual style and aesthetic)
          └── PromptPreview.tsx (Edit, regenerate, refine, copy)
```

### State Management Pattern
- `ModalContainer` maintains all questionnaire state
- Uses React hooks for state management
- Authentication token stored in localStorage as `bolt_prompt_generator_token`
- Step navigation: 1 → 2 → 3 → 4 → 5 → 6 → preview
- Progress bar shows "Step X of 6" with animated gradient

### API Communication
- `src/extension/api.ts` contains all Supabase Edge Function calls
- API client pattern with centralized header management
- Token automatically included in requests when `includeAuth: true`
- Supabase session access_token used for authentication

### Backend (Supabase Edge Functions)
- `supabase/functions/auth/index.ts`: Signup, login, token verification
  - Uses Supabase Auth (`auth.admin.createUser`, `signInWithPassword`)
  - Routes: `/signup`, `/login`, `/verify`
- `supabase/functions/generate-prompt/index.ts`: AI prompt generation via OpenRouter
  - Constructs meta-prompt following thelaunch.space format
  - Injects project-specific technical requirements (Expo for mobile, Manifest V3 for extensions)
  - Uses `anthropic/claude-haiku-4.5` model (67% cheaper than Sonnet, 2x faster)
  - Enforces step-by-step thinking for comprehensive requirements coverage
  - Prevents AI from generating extra sections beyond required format
- `supabase/functions/track-usage/index.ts`: Usage tracking (edited, copied)

### Database Schema
```
auth.users (Supabase Auth built-in):
  - id, email, encrypted_password, created_at, last_sign_in_at
  - Uses Supabase's native authentication system

prompt_generations:
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - project_type (text)
  - target_audience (text)
  - pain_points (text) - User's target audience pain points
  - project_description (text) - Natural language solution description
  - core_features (jsonb, nullable) - Retained for backward compatibility
  - adaptive_answers (jsonb)
  - design_preferences (jsonb)
  - generated_prompt (text)
  - was_edited (boolean, default false)
  - was_copied (boolean, default false)
  - created_at (timestamptz)
```

### Types (src/extension/types.ts)
```typescript
interface QuestionnaireData {
  projectType: string;
  customProjectType?: string;
  targetAudience: string;
  painPoints: string;              // Step 3
  projectDescription: string;       // Step 4
  adaptiveAnswers: Record<string, any>;
  designPreferences: {
    style: string;
    colors?: string;
    customStyle?: string;
  };
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 'preview';
```

## Key Implementation Details

### Vite Configuration
- Dual-mode config: `mode === 'extension'` vs regular build
- Extension mode: Bundles `src/extension/content.tsx` as entry point
- Output: `content.js` and `content.css` to `dist/`
- `emptyOutDir: false` to preserve previous build artifacts
- Environment variables hard-coded in extension mode for bundling

### Build Process
1. Vite bundles content script in extension mode
2. `scripts/build-extension.js` post-build script:
   - Copies `public/manifest.json` to `dist/`
   - Copies custom brand PNG icons (16, 32, 48, 128) from `public/` to `dist/`
3. Manifest references `style.css` but build outputs `content.css` (known discrepancy)

### Authentication Flow
1. User clicks button → Modal opens
2. Check localStorage for token (`bolt_prompt_generator_token`)
3. If token exists, verify with `/auth/verify` endpoint
4. If no token or invalid, show `AuthForm`
5. On signup/login:
   - Supabase Auth creates/validates user
   - Session access_token stored in localStorage
   - User proceeds to questionnaire

### Prompt Generation Flow
1. User completes 6 steps → data collected in `QuestionnaireData` interface
2. Click "Generate" → Shows `LoadingScreen` component with adaptive progress
3. LoadingScreen displays smooth, time-based progress:
   - 0-3 seconds: Fast progress (0-50%)
   - 3-6 seconds: Slower progress (50-70%)
   - 6-10 seconds: Crawl to 85%
   - 10-15 seconds: Very slow to 92%
   - 15+ seconds: Barely moves (92-96%)
   - Never reaches 100% until API responds
4. `apiClient.generatePrompt(data)` calls edge function
5. Edge function:
   - Constructs meta-prompt following thelaunch.space format
   - Adds project-specific technical requirements (Expo for mobile, Manifest V3 for extensions)
   - Calls OpenRouter API with Claude Haiku 4.5
   - Uses all collected user data: project type, audience, pain points, description, adaptive answers, design preferences
   - Enforces step-by-step thinking and comprehensive coverage of functional requirements
   - Restricts output to only required sections (no implementation timelines or extra details)
   - Saves generation to database with generation ID
6. When API responds:
   - `ModalContainer` signals completion to `LoadingScreen` via `onComplete` prop
   - Progress smoothly animates from current percentage to 100% over 500ms
   - Minimum 2 second display time enforced (prevents jarring flashes on very fast responses)
   - After completion animation, transitions to `PromptPreview`
7. User can edit, regenerate with refinement instructions, or copy

### thelaunch.space Format (Meta-Prompt Structure)
The AI generates prompts with these sections:
- **Objective**: 2-3 sentences describing what to build
- **Target Audience**: Who will use this (from Step 2)
- **Design Principles**: Visual aesthetic, responsiveness, premium feel (from Step 6)
- **Functional Requirements**: User stories format: "<user_type> should be able to <action> so that <purpose>"
  - Informed by pain points (Step 3) and project description (Step 4)
- **Business Logic**: If applicable (from Step 5 adaptive answers)

Critical rules enforced:
- Prioritize BREADTH over DEPTH
- Think deep, think step by step, cover all possible functional requirements needed to solve pain points
- Focus on WHAT, not HOW
- Use clear user story format
- Include responsive design requirements
- Mention Tailwind CSS and React (or Expo for mobile apps)
- For mobile apps: Explicitly require Expo framework
- For Chrome extensions: Explicitly require Manifest V3 format
- ONLY generate required sections (Objective, Target Audience, Design Principles, Functional Requirements, Business Logic)
- Do NOT add implementation timelines, technical stack details, or other irrelevant sections

### Adaptive Questions (Step 5)
Dynamic questions rendered based on `projectType` selected in Step 1. Each project type has unique questions to gather relevant context:
- **Chrome Extension**: Permissions needed, page interaction, data storage
- **Micro-SaaS**: Authentication requirements, pricing model, integrations
- **Mobile App**: Platform (iOS/Android/both), offline functionality, notifications
- **Landing Page**: Call-to-action, form fields, conversion goals
- **Other**: General implementation considerations

### Adaptive Loading Screen (LoadingScreen.tsx)
The loading screen uses a sophisticated adaptive algorithm that provides smooth, realistic progress feedback without fixed durations:

**Key Features:**
- **Logarithmic Progress Curve**: Uses `calculateProgress()` function with diminishing returns over time
- **Time-Based Calculation**: Progress updates every 100ms based on elapsed seconds since start
- **Never Reaches 100% Early**: Progress caps at 96% until API actually responds
- **Smooth Completion**: When `onComplete` prop becomes true, animates remaining progress to 100% over 500ms using ease-out curve

**Implementation Details:**
- **State Management**:
  - `progress`: Current progress percentage (0-100)
  - `startTime`: Timestamp when loading began (Date.now())
  - `currentMessageIndex`: Which message to display (0-5)
  - `isCompleting`: Boolean flag indicating completion animation is running

- **Progress Calculation** (`calculateProgress` function):
  ```typescript
  0-3s:   (elapsed / 3) * 50          // Linear to 50%
  3-6s:   50 + ((elapsed - 3) / 3) * 20      // Linear to 70%
  6-10s:  70 + ((elapsed - 6) / 4) * 15      // Linear to 85%
  10-15s: 85 + ((elapsed - 10) / 5) * 7      // Linear to 92%
  15s+:   92 + (4 * (1 - exp(-overtime/10))) // Exponential approach to 96%
  ```

- **Message System**:
  - 6 messages with `minTime` thresholds (0s, 3s, 6s, 9s, 12s, 16s)
  - Messages update based on elapsed time, not progress percentage
  - Final message: "Almost there, finalizing details..." for long generations

- **Completion Flow**:
  1. Parent (`ModalContainer`) sets `onComplete={true}` when API responds
  2. Loading screen enters `isCompleting` state
  3. Animates from current progress to 100% using ease-out cubic curve
  4. Updates heading text to "Prompt ready!"
  5. Parent waits 800ms for animation, then shows preview

**Integration with ModalContainer:**
- `handleGenerate()` sets `isApiComplete` state when API responds
- Minimum 2 second display time prevents flash on very fast responses
- Passes `onComplete={isApiComplete}` prop to LoadingScreen
- Waits additional 800ms after completion for smooth transition to preview

### Smart Button UX (content.tsx)
The button has two modes that adapt to user context:

**Full Mode (Initial State):**
- Position: bottom-right (24px from edges)
- Size: Auto width with text visible
- Text: "Generate First Prompt" with gradient
- Icon: Custom brand icon (icon32.png) loaded via chrome.runtime.getURL()
- Triggers when: Page is empty (no prompt entered)

**Compact Mode (After Prompt Entry):**
- Position: left edge, vertically centered (transform: translateY(-50%))
- Size: 40px × 48px (icon only)
- Hidden state: left: -32px (8px visible)
- Hover state: left: 0px (fully visible)
- Icon: Same custom brand icon scaled to fit
- Triggers when: User enters text in any textarea
- Transitions: Smooth cubic-bezier animations

**Implementation:**
- MutationObserver watches DOM for textarea changes
- Checks textarea.value.trim().length > 0
- Mode persists across page reloads via localStorage
- No dragging functionality (simplified UX)

## Important Constraints

### Security
- Uses Supabase Auth for authentication (not custom SHA-256)
- Session tokens are Supabase JWT access_tokens
- Row Level Security enabled but bypassed by service role key in edge functions (by design)
- Never commit API keys or secrets
- OpenRouter API key stored as Supabase secret

### Chrome Extension Permissions
- Manifest V3 format (`public/manifest.json`)
- Only requests: `storage` and `host_permissions` for `https://bolt.new/*`
- Minimal permissions by design
- Content script runs at `document_idle`

### API Dependencies
- OpenRouter API requires active key with credits
- Uses `anthropic/claude-haiku-4.5` model
- Cost: ~$0.003-0.01 per prompt generation (67% cheaper than Sonnet)
- Response time: 2x faster than Claude 3.5 Sonnet
- Supabase project must be active with edge functions enabled

## Common Tasks

### Adding a New Questionnaire Step
1. Create component in `src/extension/components/Step[N][Name].tsx`
2. Add step to `ModalContainer.tsx` step navigation logic (switch statement)
3. Update `QuestionnaireData` interface in `src/extension/types.ts`
4. Update progress bar calculation (currently `/6` in ModalContainer)
5. Modify `apiClient.generatePrompt()` to include new data field
6. Update meta-prompt in `supabase/functions/generate-prompt/index.ts`
7. Update database schema if persistent storage needed

### Modifying Project Types or Design Styles
- **Step1ProjectType.tsx**: Update `PROJECT_TYPES` array and `getProjectIcon()` function
- **Step5Adaptive.tsx**: Add corresponding adaptive questions for new project type
- **Step6Design.tsx**: Update `DESIGN_STYLES` array with new options
- **generate-prompt/index.ts**: Add technical requirements if needed

### Changing AI Model or Provider
- Edit `supabase/functions/generate-prompt/index.ts`
- Update OpenRouter model identifier in fetch body
- Adjust meta-prompt structure if model has different capabilities
- Test with different temperature/max_tokens settings

### Modifying Smart Button Behavior
- Edit `content.tsx` → `BoltPromptGenerator` class
- Adjust positioning in `transformToCompact()` and `transformToFull()`
- Modify hover behavior in `enableEdgeHover()` and related handlers
- Update CSS transitions and animations in `injectButton()`
- Change trigger conditions in `checkForPromptInput()`

### Custom Icon Usage Strategy
The extension uses custom brand icons (blue-to-purple gradient) throughout for consistent branding:

**Icon Sizes and Purposes:**
- `icon16.png`: Browser toolbar and notifications
- `icon32.png`: Injected button on bolt.new pages (content.tsx)
- `icon48.png`: Modal headers (ModalContainer, AuthForm, LoadingScreen)
- `icon128.png`: Chrome Web Store listing and extension management

**Loading Icons from Components:**
```typescript
const iconUrl = chrome.runtime.getURL('icon48.png');
<img src={iconUrl} alt="Bolt Prompt Generator" />
```

**Web Accessible Resources:**
All icons are included in manifest.json's web_accessible_resources to enable content script access.

**Brand Consistency:**
- Icons follow the extension's gradient design language (blue #3B82F6 to purple #8B5CF6)
- Displayed in key user touchpoints: button, auth, loading, and modal header
- Replaces generic Lucide icons for stronger brand identity

### Debugging Extension Issues
1. Check browser console (F12) on bolt.new page
2. Verify extension is enabled in `chrome://extensions/`
3. Check for content script injection (look for bolt-prompt-generator-btn element)
4. Verify Supabase Edge Function logs in dashboard
5. Ensure OpenRouter API key is configured and has credits
6. Verify `.env` variables are correct (for dev mode)
7. Check if button mode is stuck in localStorage (clear if needed)

## Development Notes

### Component Testing
Use `npm run dev` to test individual components in isolation, but note that this runs the web app (index.html), not the extension. For actual extension testing, always use `npm run build:extension` and load in Chrome.

### CSS Bundling
- Uses Tailwind CSS with PostCSS
- `src/index.css` imports Tailwind directives
- Bundled into `content.css` in extension build
- All styles scoped to modal overlay (z-index: 999999)
- Button uses z-index: 999998

### TypeScript Configuration
- `tsconfig.app.json`: Extension code config
- `tsconfig.node.json`: Build scripts config
- `@types/chrome`: Chrome extension APIs type definitions

### Modal Isolation
Modal is completely isolated from bolt.new's DOM:
- Separate React root created via ReactDOM.createRoot()
- High z-index (999999)
- Fixed positioning with backdrop blur
- Self-contained styling (no conflicts with bolt.new styles)
- Portal pattern ensures clean unmounting
- Custom brand icon (icon48.png) displayed in modal header for consistent branding

### Loading Experience (Adaptive Algorithm)
- **LoadingScreen** uses an adaptive progress algorithm that syncs with actual API response time
- **Custom Brand Icon**: Displays pulsing icon48.png instead of generic spinner for brand consistency
- **No Fixed Duration**: Progress is calculated based on elapsed time using logarithmic curve
- **Progress Zones**:
  - 0-3s: Fast (0% → 50%) - responsive for quick generations
  - 3-6s: Moderate (50% → 70%) - maintains user confidence
  - 6-10s: Slow (70% → 85%) - shows continued progress
  - 10-15s: Very slow (85% → 92%) - patient waiting
  - 15s+: Asymptotic (92% → 96%) - never stalls completely
- **Completion Animation**: When API responds, progress smoothly animates to 100% over 500ms
- **Minimum Display Time**: 2 seconds minimum prevents jarring flashes on very fast API responses
- **No Looping**: Progress never resets or loops, regardless of how long API takes
- **Message System**: Time-based messages (not progress-based) cycle through 6 states
- **Benefits**:
  - Fast responses (3-5s) complete quickly without artificial delays
  - Slow responses (15-30s) show gradual progress without reaching 100% prematurely
  - Professional UX that adapts to actual backend performance
  - User never sees progress bar loop or reset

### File Organization
Key files and their purposes:
```
src/extension/
  ├── content.tsx              # Entry point, button injection, modal lifecycle
  ├── api.ts                   # API client for edge function calls
  ├── types.ts                 # TypeScript interfaces
  └── components/
      ├── ModalContainer.tsx   # Main orchestrator, state management (displays icon48.png)
      ├── AuthForm.tsx         # Authentication UI (displays icon48.png)
      ├── LoadingScreen.tsx    # Generation loading UI (displays icon48.png)
      ├── Step[1-6]*.tsx       # Questionnaire steps
      └── PromptPreview.tsx    # Final prompt display and actions

supabase/
  ├── functions/
  │   ├── auth/               # Authentication endpoints
  │   ├── generate-prompt/    # AI prompt generation
  │   └── track-usage/        # Usage analytics
  └── migrations/             # Database schema changes

public/
  ├── manifest.json           # Chrome extension manifest
  └── icon*.png              # Custom brand icons (16, 32, 48, 128)

scripts/
  └── build-extension.js     # Post-build script for extension
```

## Troubleshooting

### Button Not Appearing
- Check if content script loaded (inspect bolt.new page → Sources tab)
- Verify URL matches `https://bolt.new/*`
- Check console for injection errors

### Authentication Issues
- Clear localStorage: `bolt_prompt_generator_token`
- Verify Supabase project is active
- Check edge function logs for auth errors

### Generation Failures
- Verify OpenRouter API key is set in Supabase secrets
- Check OpenRouter account has credits
- Review edge function logs for API errors
- Ensure user is authenticated (valid token)

### Button Mode Stuck
- Clear localStorage: `bolt_prompt_generator_mode`
- Refresh page to reset to default (full mode)

### Build Issues
- Delete `dist/` folder and rebuild
- Verify all dependencies installed (`npm install`)
- Check for TypeScript errors (`npm run typecheck`)
