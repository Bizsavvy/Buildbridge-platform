# Brand Logo and Favicon Update

This plan outlines the integration of the BuildBridge brand logo into the main navigation header and the setup of the favicon, ensuring alignment with the platform's branding.

## Proposed Changes

### 1. Asset Migration (Public Directory)
Next.js requires static assets (like images served directly via URL or used as favicons) to be located in the `public` directory.
- Copy `assets/logo/buildbridge-logo-primary.svg.svg` to `public/buildbridge-logo-primary.svg` for easier referencing and cleaner URLs.
- Copy `assets/favicon/buildbridge-favicon.png.png` to `public/buildbridge-favicon.png`.

### 2. Header Update (`src/components/layout/Navbar.tsx`)
- Import the `Image` component from `next/image`.
- Replace the current fallback logo block (the `Hammer` icon from `lucide-react` and possibly the text "BuildBridge") with the `buildbridge-logo-primary.svg` image.
- Set responsive dimensions (e.g., using `width` and `height` based on the SVG's aspect ratio) to fit perfectly within the navigation bar.

### 3. Favicon Configuration (`src/app/layout.tsx`)
- Update the `metadata` object exported from `src/app/layout.tsx` to include the new favicon configuration.
- Ensure the `icons` property points to the newly copied favicon in the public directory (`/buildbridge-favicon.png`).

## Open Questions
- Does the `buildbridge-logo-primary.svg.svg` asset include the "BuildBridge" text (wordmark), or is it just the brand icon? If it's a wordmark, I will remove the hardcoded "BuildBridge" text currently in the `Navbar`.

## Verification Plan

### Manual Verification
- Spin up the Next.js development server to verify the navbar renders the logo with correct proportions without distortion on desktop and mobile.
- Open the site in a browser to confirm that the new favicon displays on the browser tab.
