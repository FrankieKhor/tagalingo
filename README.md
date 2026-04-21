# Tagalingo

A playful React + Vite app for learning everyday Tagalog.

## Development

```bash
npm install
npm run dev
```

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
