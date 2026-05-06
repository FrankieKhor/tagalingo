# Tagalingo

A playful React + Vite app for learning everyday Tagalog.

## Development

```bash
npm install
npm run dev
```

## Mobile app builds

This project uses Capacitor to package the Vite React app as a native Android app.

```bash
yarn build
yarn cap:sync
yarn android:open
```

Useful scripts:

- `yarn cap:sync` builds the web app and copies it into the native Android project.
- `yarn android` builds and runs the app on a connected Android device or emulator.
- `yarn android:open` opens the native project in Android Studio.

Local Android build requirements:

- Node 22.13+ LTS or Node 24+ is recommended. Node 23 may require `--ignore-engines` for some package operations.
- JDK 17+ is required by the Android Gradle plugin.
- Android Studio or the Android SDK command-line tools are required for emulator/device builds and publishable APK/AAB output.

For a Play Store release, create a signed release build from Android Studio after running `yarn cap:sync`.

## ElevenLabs Voice Playback

The app can use ElevenLabs for lesson audio playback and falls back to the browser's built-in speech voice when ElevenLabs is not configured or the request fails.

1. Copy `.env.example` to `.env`.
2. Add your ElevenLabs API key.
3. Optionally replace the default voice ID with a voice you prefer.
4. Restart the dev server after changing env vars.

```bash
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
VITE_ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

Notes:

- `VITE_` env vars are exposed to the browser. This setup is fine for local experimentation, but for production you should proxy ElevenLabs through a backend or serverless function so the API key stays private.
- The default model is `eleven_multilingual_v2`, which is a better fit for Tagalog than English-only voices.
