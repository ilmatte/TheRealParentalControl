# Parent App - iOS Deployment Guide

## Quick Start

### For Development
```bash
npm run dev:ios
```

### For Production Builds

#### Step 1: Setup EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Initialize project (if not already done)
eas init
```

#### Step 2: Create iOS Build

```bash
# Build for simulator (testing)
npm run build:ios

# Build for device (archive for TestFlight/App Store)
eas build --platform ios --auto-submit
```

#### Step 3: Test on Device

**Option A: TestFlight**
```bash
# After build completes, EAS will automatically submit to TestFlight
# Check App Store Connect to invite testers
```

**Option B: Local Build with Xcode**
```bash
# Prebuild native iOS project
npx expo prebuild --platform ios

# Open in Xcode
open ios/ParentalControl.xcworkspace

# Select device and run
```

#### Step 4: Submit to App Store

```bash
# Configure App Store credentials
eas credentials

# Create release build if not auto-submitted
eas build --platform ios

# Submit to App Store
npm run submit:ios
```

## Configuration

### app.json
- Update `bundleIdentifier` to your unique identifier
- Set correct `buildNumber` for each release
- Configure push notifications if needed

### eas.json
- `preview`: For TestFlight builds
- `production`: For App Store submission
- Configure your App Store API key details

## Troubleshooting

### Build Fails
```bash
# Clear build cache
eas build --platform ios --clear-cache

# Verbose output
eas build --platform ios --verbose
```

### TestFlight Upload Issues
```bash
# Check App Store credentials
eas credentials --platform ios --clear

# Re-upload credentials
eas credentials --platform ios
```

## Important Notes

1. **Bundle Identifier**: Must be unique, typically `com.yourcompany.appname`
2. **Certificate Signing**: EAS handles certificates automatically
3. **Version Numbers**: Increment for each App Store submission
4. **Privacy Policy**: Required for App Store submission
5. **Screenshots & Description**: Prepare before submission

## Useful Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Submission to App Store](https://docs.expo.dev/submit/ios/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
