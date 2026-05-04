import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"
const DEFAULT_ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"
const DEFAULT_ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
const MAX_SPEECH_TEXT_LENGTH = 500
const CORS_HEADERS = {
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
}

const http = httpRouter()

http.route({
  path: "/speech",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: CORS_HEADERS })),
})

http.route({
  path: "/speech",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim()

    if (!apiKey) {
      return new Response("Missing ELEVENLABS_API_KEY.", {
        headers: CORS_HEADERS,
        status: 500,
      })
    }

    const body = (await request.json().catch(() => null)) as { text?: unknown } | null
    const text = typeof body?.text === "string" ? body.text.trim() : ""

    if (!text) {
      return new Response("Speech text is required.", {
        headers: CORS_HEADERS,
        status: 400,
      })
    }

    if (text.length > MAX_SPEECH_TEXT_LENGTH) {
      return new Response(`Speech text must be ${MAX_SPEECH_TEXT_LENGTH} characters or fewer.`, {
        headers: CORS_HEADERS,
        status: 400,
      })
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_ELEVENLABS_VOICE_ID
    const modelId =
      process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_ELEVENLABS_MODEL_ID

    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          similarity_boost: 0.8,
          stability: 0.45,
        },
      }),
    })

    if (!response.ok) {
      return new Response(await response.text(), {
        headers: CORS_HEADERS,
        status: response.status,
      })
    }

    return new Response(response.body, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  }),
})

export default http
