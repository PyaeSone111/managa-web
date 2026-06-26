# Myangar React Native (CLI)

Mobile app with the same features as the `frontend` web app, built with **React Native CLI** (not Expo).

## Features

- Home, Browse, Rankings, Favorites
- Series detail, chapter reader
- Login / Register, Privacy Policy, Contact Us
- Same Laravel API and theme as web frontend

## Prerequisites

- Node.js 20.19.4+
- [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) (Android Studio for Android, Xcode for iOS on macOS)
- JDK 17+

## Setup

```bash
cd frontend-reactnative
npm install
```

Configure `.env`:

```
EXPO_PUBLIC_API_BASE_URL=https://manga-apis.fatelight.org/api/v1
EXPO_PUBLIC_CONTACT_EMAIL=info@fatelight.org
```

## Run

Start Metro:

```bash
npm start
```

Android (emulator or device):

```bash
npm run android
```

iOS (macOS only):

```bash
cd ios && pod install && cd ..
npm run ios
```

## Project structure

```
frontend-reactnative/
  android/          Native Android project
  ios/              Native iOS project
  src/              App source (screens, components, services)
  App.js            Root component
  index.js          Entry point
  metro.config.js
  babel.config.js
```

## Notes

- Uses `react-native-dotenv` for environment variables (`@env` imports in `src/utils/constants.js`).
- Auth token stored in AsyncStorage under `auth_token`.
- App registry name: `MyangarMobile` (see `app.json`).
