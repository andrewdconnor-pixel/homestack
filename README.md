# New App Suite

Starter monorepo for a new iPhone app and companion website.

## Stack

- `apps/mobile`: Expo + React Native iPhone app starter
- `apps/web`: Next.js marketing or product website starter
- `packages/shared`: shared copy and product metadata

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the website:

   ```bash
   npm run dev:web
   ```

3. Start the mobile app:

   ```bash
   npm run dev:mobile
   ```

## What to customize first

- Rename the product in `packages/shared/src/brand.ts`
- Replace placeholder headlines in the app and website
- Decide whether the website is marketing-only, account-based, or a full web app
- Add your backend choice next: Supabase, Firebase, Rails, Node, or another API

## Assumptions

This starter assumes:

- you want one shared JavaScript and TypeScript stack
- the iPhone app should be built with Expo for faster iteration
- the website should be built with Next.js for flexibility and deployment ease
