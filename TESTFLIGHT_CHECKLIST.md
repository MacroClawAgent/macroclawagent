# Pre-TestFlight Checklist — Jonno

## Code
- [x] All console.logs wrapped in `__DEV__` check (31 statements)
- [x] All API calls wrapped in try/catch
- [x] Error boundary in root layout (expo-router built-in)
- [x] No hardcoded API keys in source code
- [x] .env file exists with all required keys
- [x] .env is in .gitignore

## Config
- [x] app.json has correct bundleIdentifier (`com.jonnoai.app`)
- [x] app.json has all iOS permission strings (camera, photos, health, location, motion)
- [x] app.json `userInterfaceStyle` set to "dark"
- [x] app.json splash backgroundColor matches theme (#1C1612)
- [x] app.json `supportsTablet` set to false
- [x] eas.json has production build profile
- [x] Version set to "1.0.0"
- [x] Build number set to "1"

## Assets
- [x] icon.png exists at assets/images/icon.png
- [x] splash-icon.png exists at assets/images/splash-icon.png
- [ ] Verify icon.png is 1024x1024 with no transparency
- [ ] Verify splash looks correct on device

## App Behaviour
- [x] App launches without crashing
- [x] All tabs navigate correctly
- [x] Back navigation works everywhere
- [x] Empty states show (not blank screens)
- [ ] App works with no internet (graceful failure)
- [x] Sign in / sign up flow works
- [x] Onboarding steps complete without error

## TestFlight
- [ ] Apple Developer account active
- [ ] EAS project configured (`eas build:configure`)
- [ ] `eas.json` projectId filled in
- [ ] `eas submit` credentials configured
- [ ] First build submitted and processed

## Before Each Update
- [ ] Version or buildNumber incremented
- [ ] No new bare console.log statements
- [ ] .env keys up to date
- [ ] Test critical flows: sign in, meal generation, food scan, smart cart
