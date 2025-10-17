# Project Structure

## Overview
This project contains a Chrome extension that integrates with Bolt.new to help users generate optimized first prompts.

## Directory Structure

```
bolt-prompt-generator/
├── src/
│   ├── extension/              # Chrome extension source code
│   │   ├── components/         # React components
│   │   │   ├── AuthForm.tsx           # Login/signup form
│   │   │   ├── ModalContainer.tsx     # Main modal orchestrator
│   │   │   ├── PromptPreview.tsx      # Prompt display and actions
│   │   │   ├── Step1ProjectType.tsx   # Project type selection
│   │   │   ├── Step2Audience.tsx      # Target audience selection
│   │   │   ├── Step3Features.tsx      # Core features input
│   │   │   ├── Step4Adaptive.tsx      # Adaptive questions
│   │   │   └── Step5Design.tsx        # Design preferences
│   │   ├── api.ts              # Supabase API client
│   │   ├── content.tsx         # Content script entry point
│   │   └── types.ts            # TypeScript interfaces
│   ├── App.tsx                 # Main app component (for dev)
│   ├── main.tsx                # App entry point (for dev)
│   └── index.css               # Global styles (Tailwind)
│
├── supabase/
│   └── functions/              # Supabase Edge Functions
│       ├── auth/               # Authentication endpoints
│       │   └── index.ts        # Signup, login, verify
│       ├── generate-prompt/    # AI prompt generation
│       │   └── index.ts        # OpenRouter integration
│       └── track-usage/        # Usage tracking
│           └── index.ts        # Edit and copy tracking
│
├── public/
│   ├── manifest.json           # Chrome extension manifest
│   ├── icon16.png              # Extension icon (16x16)
│   ├── icon48.png              # Extension icon (48x48)
│   └── icon128.png             # Extension icon (128x128)
│
├── scripts/
│   └── build-extension.js      # Extension build script
│
├── dist/                       # Built extension (generated)
│   ├── content.js              # Bundled content script
│   ├── style.css               # Bundled styles
│   ├── manifest.json           # Copied manifest
│   └── icon*.png               # Copied icons
│
├── .env                        # Environment variables (Supabase)
├── package.json                # NPM dependencies and scripts
├── vite.config.ts              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
│
└── Documentation
    ├── README.md               # Main documentation
    ├── SETUP_GUIDE.md          # Quick setup instructions
    ├── IMPORTANT_NOTES.md      # Configuration requirements
    └── PROJECT_STRUCTURE.md    # This file
```

## Key Files Explained

### Extension Core

**`src/extension/content.tsx`**
- Entry point for the Chrome extension
- Injects the "Generate First Prompt" button into bolt.new
- Creates and manages the modal overlay
- Handles React root mounting/unmounting

**`src/extension/components/ModalContainer.tsx`**
- Main orchestrator for the entire flow
- Manages authentication state
- Handles step navigation (1-5 + preview)
- Coordinates API calls for prompt generation
- Manages loading and error states

**`src/extension/api.ts`**
- API client for Supabase Edge Functions
- Handles authentication (signup, login, verify)
- Manages prompt generation requests
- Tracks usage analytics
- Stores auth tokens in localStorage

### React Components

**Authentication**
- `AuthForm.tsx` - Handles signup and login with validation

**Questionnaire Steps**
- `Step1ProjectType.tsx` - Project category selection
- `Step2Audience.tsx` - Target audience definition
- `Step3Features.tsx` - Core features list (2-5 items)
- `Step4Adaptive.tsx` - Dynamic questions based on project type
- `Step5Design.tsx` - Visual style and color preferences

**Preview & Actions**
- `PromptPreview.tsx` - Display, edit, regenerate, refine, copy

### Backend (Supabase)

**Edge Functions**

**`supabase/functions/auth/index.ts`**
- Endpoints: `/signup`, `/login`, `/verify`
- Handles user authentication
- SHA-256 password hashing
- Token generation and verification
- Database: `extension_users` table

**`supabase/functions/generate-prompt/index.ts`**
- Generates optimized prompts using AI
- OpenRouter integration (Claude 3.5 Sonnet)
- Meta-prompt construction
- Saves to `prompt_generations` table
- Supports refinement instructions

**`supabase/functions/track-usage/index.ts`**
- Tracks user actions (edited, copied)
- Updates `prompt_generations` records
- Enables usage analytics

### Build Configuration

**`vite.config.ts`**
- Dual-mode configuration (app vs extension)
- Extension mode: Bundles content.tsx
- Output configuration for Chrome extension format
- CSS bundling strategy

**`scripts/build-extension.js`**
- Post-build script
- Copies manifest.json to dist/
- Creates extension icons
- Prepares dist/ folder for Chrome

**`public/manifest.json`**
- Chrome Extension Manifest V3
- Defines permissions and content scripts
- Configures extension metadata

## Data Flow

### User Journey
1. User clicks button on bolt.new
2. Modal opens → Check authentication
3. If not logged in → Show AuthForm
4. If logged in → Show Step 1
5. User completes 5 steps
6. Generate prompt via Edge Function
7. Edge Function calls OpenRouter API
8. Display prompt in preview
9. User can edit, regenerate, or copy
10. Copy to clipboard → Track usage

### API Flow
```
Extension → Supabase Edge Function → Action
     ↓
AuthForm → auth/signup or auth/login → Create/verify user
     ↓
Generate → generate-prompt → OpenRouter → Return prompt
     ↓
Track → track-usage → Update database
```

### Database Schema
```
extension_users
├── id (uuid, PK)
├── email (text, unique)
├── password_hash (text)
├── created_at (timestamptz)
└── last_login (timestamptz)

prompt_generations
├── id (uuid, PK)
├── user_id (uuid, FK → extension_users)
├── project_type (text)
├── target_audience (text)
├── core_features (jsonb)
├── adaptive_answers (jsonb)
├── design_preferences (jsonb)
├── generated_prompt (text)
├── was_edited (boolean)
├── was_copied (boolean)
└── created_at (timestamptz)
```

## Build Outputs

### Development Build
```bash
npm run dev
```
- Starts Vite dev server on http://localhost:5173
- Hot module replacement
- For testing components in isolation

### Production Build
```bash
npm run build
```
- Creates optimized web app in `dist/`
- Not used for extension

### Extension Build
```bash
npm run build:extension
```
- Creates Chrome extension in `dist/`
- Bundles `content.js` and `style.css`
- Copies manifest and icons
- Ready to load in Chrome

## Environment Variables

**`.env`** (Required)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Supabase Secrets** (Required)
```
OPENROUTER_API_KEY=sk-or-v1-...
```
(Set via Supabase dashboard or CLI)

## Installation Locations

**Chrome Extensions Page**
- URL: `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select: `{project_root}/dist/`

**Active Extension**
- Appears on: https://bolt.new
- Button location: Bottom-right corner
- Modal: Centered overlay

## Development Workflow

1. Make changes to `src/extension/` files
2. Run `npm run build:extension`
3. Go to `chrome://extensions/`
4. Click reload icon on extension
5. Refresh bolt.new page
6. Test changes

## Dependencies

### Core
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling

### UI Components
- lucide-react - Icons

### Backend
- @supabase/supabase-js - Database client
- Supabase Edge Functions - Serverless API
- OpenRouter - AI API gateway

## File Sizes (Approximate)

- `content.js`: 171 KB (52 KB gzipped)
- `style.css`: 14 KB (3 KB gzipped)
- Total extension: ~185 KB

## Browser Compatibility

- Chrome: ✅ (Primary target)
- Edge: ✅ (Chromium-based)
- Brave: ✅ (Chromium-based)
- Firefox: ❌ (Manifest V3 differences)
- Safari: ❌ (Different extension format)
