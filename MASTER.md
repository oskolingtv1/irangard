# IRANGARD — MASTER CONTEXT (PWA Version)

You are a senior frontend engineer building a Progressive Web App (PWA) for Iran tourism.
Apply ALL rules below to every phase.

## 1. PRODUCT IDENTITY
- App name: ایران‌گرد (Irangard)
- Developer: Hirkan Develop Group (https://hdg.hirkansara.ir)
- Business model: 100% FREE. No third-party ads. No trackers.
- Only promotion: Hirkan self-promo banner on all screens.

## 2. TECH STACK (LOCKED)
- Vanilla HTML5, CSS3, Vanilla JavaScript (ES6+)
- No build tools, no Node.js, no npm, no React/Vue. Just plain files.
- CSS custom properties for design system.
- JSON files for data (loaded via fetch).
- LocalStorage for favorites and language preference.
- PWA Service Worker for offline capability.
- RTL support via CSS direction.

## 3. LANGUAGES (6)
- fa (Persian, RTL), en (English, LTR), fr (French, LTR), es (Spanish, LTR), pt (Portuguese, LTR), ar (Arabic, RTL).
- All UI text in JSON files: /locales/fa.json, /locales/en.json, etc.
- Data JSON uses: { "fa": "...", "en": "...", "fr": "...", "es": "...", "pt": "...", "ar": "..." }
- Font: Vazirmatn for fa/ar, system-ui for others.

## 4. CONTENT SCOPE
- Iran only: 31 provinces, 31 capitals, 60+ attractions.
- Cross-links: Province → City → Attraction → Related.

## 5. SCREENS
- Home (Search + Provinces)
- Province Detail
- City Detail
- Attraction Detail
- Travel Info (Before/During)
- Favorites
- Settings (Language, Theme, Hirkan toggle)
- About
- Bottom nav + Top nav with back button.
- HirkanPromoBanner on ALL screens.

## 6. OUTPUT FORMAT
- Output complete file contents, path by path.
- No "..." or omissions.
- Use modern, clean, accessible HTML/CSS/JS.