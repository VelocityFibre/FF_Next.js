# VF Brand Assets

This directory should contain the Velocity Fibre brand assets.

## Required Files:

### Logo Files
- `vf-logo.svg` - Primary VF logo (SVG format preferred)
- `vf-logo.png` - PNG version of the logo (transparent background)
- `vf-logo-white.svg` - White version for dark backgrounds
- `vf-logo-icon.svg` - Icon-only version (for favicon/small spaces)

### Favicon Files
- `favicon.ico` - Standard favicon
- `favicon-16x16.png` - 16px favicon
- `favicon-32x32.png` - 32px favicon
- `apple-touch-icon.png` - Apple touch icon (180x180px)

## Current Status
- Using placeholder gradient logo in the application
- Ready to replace with actual VF brand assets when provided

## How to Add Logo:
1. Place your VF logo files in this directory
2. Update `src/components/ui/VFLogo.tsx` to reference the actual logo:
   ```tsx
   <img src="/assets/vf/vf-logo.svg" alt="Velocity Fibre" />
   ```
3. Update `index.html` to use VF favicon when VF theme is active

## Brand Colors (Currently Used):
- Primary: #ec4899 (Pink)
- Gradient: Purple (#a855f7) → Pink (#ec4899) → Orange (#f97316)
- Sidebar Background: #1e293b (Slate-800)
- Text on Dark: #f8fafc (Slate-50)