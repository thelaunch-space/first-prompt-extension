# Edge-Docking Button UX

## Overview
The extension button now uses a smart edge-docking pattern that minimizes interference with bolt.new's preview pane while maintaining easy access.

## Button States

### Full Mode (Initial State)
- **Location**: Bottom-right corner
- **Size**: Auto width (with text "Generate First Prompt")
- **Appearance**: Full button with lightning bolt icon + text
- **Trigger**: Appears when bolt.new page is empty (no prompt entered)

### Compact Mode (After Prompt Entry)
- **Location**: Left edge, vertically centered
- **Size**: 40px width × 48px height
- **Appearance**: Lightning bolt icon only, edge-docked tab
- **Trigger**: Automatically activates when user enters text in prompt textarea

## Edge-Docking Behavior

### Default Position (Hidden)
- Button positioned at `left: -32px`
- Only 8px of the button is visible at the edge
- Creates a subtle tab that doesn't interfere with content

### Hover State (Revealed)
- Button slides out to `left: 0px`
- Full 40px width becomes visible
- Enhanced shadow effect for better visibility
- Smooth cubic-bezier transition (0.3s)

### Click Action
- Opens the questionnaire modal
- No dragging functionality (simplified UX)

## Visual Design

### Compact Mode Styling
- **Border Radius**: `0 8px 8px 0` (tab-like right edges)
- **Background**: Blue-purple gradient (matches brand)
- **Shadow**: Subtle blue glow
- **Icon**: Lightning bolt scaled to 110% for better visibility
- **Positioning**: Vertically centered on left edge

### Transitions
- Left position: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Box shadow: 0.3s ease
- SVG transform: 0.3s ease

## Why This Design?

1. **Non-Intrusive**: Only 8px visible by default, won't block preview pane
2. **Left-Side Positioning**: Preview pane is on the right, so left edge is optimal
3. **Discoverability**: Visible enough to be noticed, but not distracting
4. **Smooth Interactions**: Polished animations create premium feel
5. **No Dragging**: Simplified UX - users don't need to reposition it
6. **Persistent Access**: Always available when needed, auto-hides when not

## Technical Implementation

- State persisted in localStorage (`bolt_prompt_generator_mode`)
- Automatic detection of textarea content to trigger mode switch
- Clean separation between full and compact modes
- Event listeners for hover interactions
- Smooth CSS transitions for professional feel

## Future Enhancement
A custom lightning bolt PNG icon will replace the current SVG placeholder for brand consistency.
