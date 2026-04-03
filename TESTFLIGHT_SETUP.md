# Jonno — TestFlight Setup Guide

## Prerequisites
- Apple Developer Account ($149 AUD/year) — enroll at developer.apple.com
- EAS CLI: `npm install -g eas-cli`
- Expo account: create at expo.dev

## First Time Setup

```bash
cd mobile
eas login
eas build:configure
```

This will link your Expo project and set the `projectId` in app.json.

## Environment Variables

Copy the template and fill in your values:
```bash
cp .env.example .env
```

Required keys:
- `EXPO_PUBLIC_SUPABASE_URL` — from Supabase dashboard
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard
- `EXPO_PUBLIC_RAPIDAPI_KEY` — from rapidapi.com (optional, for live supermarket prices)
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` — from Google Cloud Console (optional, for store finder)

## Build for TestFlight

```bash
cd mobile
eas build --platform ios --profile production
```

Build takes 15-30 minutes in Expo's cloud.
Monitor at: https://expo.dev/accounts/[your-account]/builds

## Submit to App Store Connect

```bash
eas submit --platform ios
```

You'll be prompted for your Apple ID and app-specific password.

## After Submitting

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. My Apps → Jonno → TestFlight
3. Wait for Apple to process the build (~10-30 minutes)
4. Internal Testing → Add Testers (by Apple ID email)
5. Or External Testing → Create Public Link (requires brief review)

## Pushing Updates

Same build + submit commands. All existing testers are notified automatically.

```bash
cd mobile
eas build --platform ios --profile production
eas submit --platform ios
```

## Common Build Errors

| Error | Fix |
|-------|-----|
| "Bundle identifier already exists" | Change `bundleIdentifier` in app.json or claim it in App Store Connect |
| "Missing provisioning profile" | Run `eas credentials` to set up signing |
| "Icon must not have transparency" | Ensure `assets/images/icon.png` is opaque (no alpha channel) |
| "No matching profile" | Run `eas credentials --platform ios` and regenerate |
| "EAS project not found" | Run `eas build:configure` to link project |

## Build Profiles

| Profile | Use Case | Command |
|---------|----------|---------|
| `development` | Dev client for testing | `eas build --profile development` |
| `preview` | Internal testing (ad-hoc) | `eas build --profile preview` |
| `production` | TestFlight / App Store | `eas build --profile production` |
