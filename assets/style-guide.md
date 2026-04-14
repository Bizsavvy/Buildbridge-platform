# BuildBridge Web Handoff Guide

## 1. Logo Assets & Implementation
The logo consists of the bridge icon and the "BuildBridge" wordmark.

### File Specifications
| Asset | Dimensions | Export Format | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Logo** | 334px × 48px | `.svg` (Primary) | Navbar, Footer, Headers |
| **Logo @2x** | 668px × 96px | `.png` (Transparent) | High-density displays |
| **Logo @3x** | 1002px × 144px | `.png` (Transparent) | Mobile/Ultra-high density |
| **Favicon** | 128px × 48px | `.ico` or `.png` | Browser tabs & bookmarks |

### Implementation Rules
- **Bounding Box:** Use the tight 334px × 48px crop with zero internal padding. Spacing should be handled via CSS `padding` or `margin`.
- **Naming Convention:** `buildbridge-logo-primary.svg`
- **Alt Text:** `alt="BuildBridge - Home"`