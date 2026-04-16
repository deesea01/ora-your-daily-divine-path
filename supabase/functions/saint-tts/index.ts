import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ElevenLabs default-library voice IDs mapped per saint persona
type VoiceProfile = {
  voice_id: string;
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
};

const VOICE_MAP: Record<string, VoiceProfile> = {
  monk:              { voice_id: "JBFqnCBsd6RMkjVDRZzb", stability: 0.75, similarity_boost: 0.85, style: 0.20, use_speaker_boost: true },  // George
  st_francis:        { voice_id: "TX3LPaxmHKxFdv7VOQHJ", stability: 0.60, similarity_boost: 0.90, style: 0.30, use_speaker_boost: true },  // Liam
  st_thomas_aquinas: { voice_id: "onwK4e9ZLuTAKqWW03F9", stability: 0.85, similarity_boost: 0.80, style: 0.10, use_speaker_boost: true },  // Daniel
  st_augustine:      { voice_id: "nPczCjzI2devNBz1zQrb", stability: 0.65, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true },  // Brian
  st_joan_of_arc:    { voice_id: "Xb7hH8MSUJpSbSDYk0k2", stability: 0.70, similarity_boost: 0.90, style: 0.35, use_speaker_boost: true },  // Alice
  st_teresa:         { voice_id: "EXAVITQu4vr4xnSDxMaL", stability: 0.60, similarity_boost: 0.85, style: 0.30, use_speaker_boost: true },  // Sarah
  st_padre_pio:      { voice_id: "pqHfZKP75CvOlQylNhV4", stability: 0.80, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },  // Bill
  st_michael:        { voice_id: "bIHbv24MWmeRgasZH58o", stability: 0.90, similarity_boost: 0.80, style: 0.50, use_speaker_boost: true },  // Will
};

// Slight mood adjustments — confession = softer/slower; prayer = more reverent; reflection = neutral
function adjustForMood(p: VoiceProfile, mood?: string): VoiceProfile {
  if (!mood || mood === "casual") return p;
  if (mood === "prayer") return { ...p, stability: Math.min(1, p.stability + 0.05), style: Math.max(0, p.style - 0.05) };
  if (mood === "confession") return { ...p, stability: Math.min(1, p.stability + 0.10), style: Math.max(0, p.style - 0.10) };
  if (mood === "reflection") return { ...p, stability: Math.min(1, p.stability + 0.03) };
  return p;
}

const MAX_TEXT = 1200;
const BUCKET = "saint-audio";

// Stable hash for cache key (FNV-1a 32-bit, hex)
function hashText(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const text = String(body?.text || "").trim().slice(0, MAX_TEXT);
    const guide = String(body?.guide || "monk");
    const mood = body?.mood ? String(body.mood) : "casual";
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profile = adjustForMood(VOICE_MAP[guide] || VOICE_MAP.monk, mood);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Cache key: guide/mood/voiceId-hash.mp3
    const objectPath = `${guide}/${mood}/${profile.voice_id}-${hashText(text)}.mp3`;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;

    // Check if already cached in storage
    const head = await fetch(publicUrl, { method: "HEAD" });
    if (head.ok) {
      return new Response(JSON.stringify({ url: publicUrl, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const elResp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${profile.voice_id}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: profile.stability,
            similarity_boost: profile.similarity_boost,
            style: profile.style,
            use_speaker_boost: profile.use_speaker_boost,
          },
        }),
      }
    );

    if (!elResp.ok) {
      const errText = await elResp.text().catch(() => "");
      console.error("ElevenLabs error", elResp.status, errText);
      return new Response(JSON.stringify({ error: "TTS failed", status: elResp.status, detail: errText.slice(0, 500) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await elResp.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    // Upload to storage (best-effort, don't fail the request if upload fails)
    const { error: upErr } = await adminClient.storage
      .from(BUCKET)
      .upload(objectPath, audioBytes, { contentType: "audio/mpeg", upsert: true });
    if (upErr) console.error("Storage upload error:", upErr.message);

    // Also return inline base64 so first-play is instant
    const audioBase64 = base64Encode(audioBytes);
    return new Response(JSON.stringify({
      url: upErr ? null : publicUrl,
      audio: audioBase64,
      mime: "audio/mpeg",
      cached: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("saint-tts error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
});
