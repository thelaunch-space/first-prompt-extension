# Custom Lightning Bolt Icon Integration Guide

## Overview
This guide explains how to replace the placeholder SVG lightning bolt with your custom PNG icon.

## Steps to Integrate Custom Icon

### 1. Prepare Your Icon
- **Format**: PNG (with transparency)
- **Recommended Size**: 48x48px or 64x64px (will be scaled appropriately)
- **Color**: White or light color (displays on blue-purple gradient background)
- **File Name**: `lightning-bolt.png`

### 2. Add Icon to Project
Place your PNG file in the `public/` directory:
```
/public/lightning-bolt.png
```

### 3. Update content.tsx

#### Current Code (Line 177-180):
```typescript
this.button.innerHTML = `
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.3s ease;">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
  <span style="transition: opacity 0.3s ease, width 0.3s ease; font-weight: 600; letter-spacing: -0.01em;">
    Generate First <span style="background: linear-gradient(135deg, #ffffff 0%, #60A5FA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">Prompt</span>
  </span>
`;
```

#### Replace With:
```typescript
this.button.innerHTML = `
  <img
    src="${chrome.runtime.getURL('lightning-bolt.png')}"
    alt="Lightning bolt"
    width="22"
    height="22"
    style="transition: transform 0.3s ease; filter: brightness(0) invert(1);"
  />
  <span style="transition: opacity 0.3s ease, width 0.3s ease; font-weight: 600; letter-spacing: -0.01em;">
    Generate First <span style="background: linear-gradient(135deg, #ffffff 0%, #60A5FA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">Prompt</span>
  </span>
`;
```

### 4. Update manifest.json
Add the icon to `web_accessible_resources` in `/public/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Bolt.new First Prompt Generator",
  "version": "1.0.0",
  "description": "Generate optimized first prompts for bolt.new",
  "permissions": ["storage"],
  "host_permissions": ["https://bolt.new/*"],
  "content_scripts": [
    {
      "matches": ["https://bolt.new/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["lightning-bolt.png"],
      "matches": ["https://bolt.new/*"]
    }
  ],
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

### 5. Update build script
Modify `/scripts/build-extension.js` to copy the icon:

```javascript
// Add after copying manifest.json
if (fs.existsSync(path.join(__dirname, '../public/lightning-bolt.png'))) {
  fs.copyFileSync(
    path.join(__dirname, '../public/lightning-bolt.png'),
    path.join(__dirname, '../dist/lightning-bolt.png')
  );
  console.log('✓ Copied lightning-bolt.png');
}
```

### 6. Rebuild Extension
```bash
npm run build:extension
```

### 7. Reload in Chrome
1. Go to `chrome://extensions/`
2. Click reload icon on your extension
3. Refresh bolt.new page

## Notes

- The `filter: brightness(0) invert(1);` CSS ensures the icon appears white on the colored background
- Remove this filter if your PNG is already white/light colored
- The icon will scale appropriately in both full and compact modes
- Transition effects will work seamlessly with the PNG

## Fallback
If no custom icon is provided, the SVG placeholder will continue to work perfectly.
