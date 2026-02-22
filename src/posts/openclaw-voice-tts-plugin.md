---
slug: 'openclaw-voice-tts-plugin'
category: 'ai'
label: 'OpenClaw'
date: 'Feb 2026'
readTime: '14 min read'
title: 'Giving Your AI Agent a Voice: Building an On-Demand TTS Plugin for OpenClaw'
excerpt: 'We reverse-engineered the OpenClaw plugin API, discovered a critical gap in the event system, and built a working on-demand TTS plugin that sends Microsoft neural voice notes directly to Telegram and Slack using edge-tts — no API key, no model download, completely free.'
---

# Giving Your AI Agent a Voice: Building an On-Demand TTS Plugin for OpenClaw

Ever wanted your AI agent to actually *talk back* to you? Not just dump walls of text into a chat window, but send you a proper voice note you can listen to hands-free? That's exactly what we set out to build — and what we found along the way was a surprisingly deep rabbit hole into OpenClaw's plugin internals.

This post documents the full research process, the architectural discoveries, the gotchas we hit, and the working implementation we shipped.

---

## The Goal

[OpenClaw](https://openclaw.ai) is an AI agent framework that connects to messaging channels (Telegram, Slack, etc.) and runs agentic workflows. The idea was simple on the surface:

> When a user sends a voice message or asks for an audio reply, synthesize the agent's response as speech and send it back as a voice note.

Simple idea. Turns out the implementation required digging into undocumented plugin internals, discovering a fundamental gap in the event API, and wiring together Node.js, Python, and the Telegram Bot API.

---

## Step 1: Choosing a Free TTS Engine

Before touching OpenClaw, we needed to pick the right TTS engine. The requirements: free, natural-sounding, and practical on Windows.

We evaluated four options:

| Engine | Quality | Offline | Setup | Verdict |
|--------|---------|---------|-------|---------|
| **edge-tts** | Excellent (Microsoft neural) | No (cloud) | `pip install edge-tts` | ✅ Winner |
| **Kokoro TTS** | Excellent (82M param local model) | Yes | ~500MB model download + venv | Good, complex |
| **Piper TTS** | Good (slightly robotic) | Yes | Pre-built ONNX binaries | Decent fallback |
| **gTTS** | Mediocre (Google Translate) | No | Already installed | ❌ Skip |

We went with **edge-tts**. Here's the reasoning:

- It uses the same Microsoft neural voices as Windows 11 (e.g., `en-US-AriaNeural`) — genuinely natural-sounding
- No API key, no account, completely free
- `pip install edge-tts` and you're done — no model downloads
- The agent itself already requires internet, so the cloud dependency isn't a new constraint
- Latency is acceptable for on-demand use (1–2 seconds for a typical response)

**Key voice:** `en-US-AriaNeural` — natural, clear, and works well for AI agent responses.

---

## Step 2: Reverse-Engineering the OpenClaw Plugin Architecture

OpenClaw plugins are Node.js ES modules that export a single default function receiving an `api` object. We used the **claude-mem** plugin (the persistent memory plugin bundled with OpenClaw) as our reference implementation since it's a working example of the full plugin lifecycle.

### Plugin Directory Structure

```
~/.openclaw/extensions/{plugin-id}/
├── package.json           # Must have "type": "module"
├── openclaw.plugin.json   # Manifest (MUST include configSchema — more on this)
└── dist/
    └── index.js           # ES module, exports default function(api)
```

### The Plugin API Surface

The `api` object exposes:

```javascript
export default function myPlugin(api) {
  // Lifecycle events
  api.on("gateway_start",      (event, ctx) => { ... });
  api.on("session_start",      (event, ctx) => { ... });
  api.on("message_received",   (event, ctx) => { ... }); // ← MessageContext
  api.on("before_agent_start", (event, ctx) => { ... });
  api.on("agent_end",          (event, ctx) => { ... }); // ← EventContext (different!)
  api.on("tool_result_persist",(event, ctx) => { ... });
  api.on("after_compaction",   (event, ctx) => { ... });
  api.on("session_end",        (event, ctx) => { ... });

  // Register background services
  api.registerService({ id, start, stop });

  // Register CLI commands
  api.registerCommand({ name, description, handler });

  // Channel send functions
  api.runtime.channel.telegram.sendMessageTelegram(to, text, opts);
  api.runtime.channel.slack.sendMessageSlack(to, text, opts);

  // Logging
  api.logger.info("...");
  api.logger.warn("...");
}
```

### The Critical Discovery: Two Different Context Types

This is where it gets interesting. OpenClaw has **two distinct event context types**, and they do NOT contain the same information:

**`MessageContext`** — provided to `message_received`:
```typescript
{
  channelId: string;        // "telegram" | "slack" | "discord" | ...
  accountId?: string;       // Which bot account received the message
  conversationId?: string;  // THE CHAT ID — this is what you need to reply
}
```

**`EventContext`** — provided to `agent_end`:
```typescript
{
  sessionKey?: string;
  workspaceDir?: string;
  agentId?: string;
  // ⚠️ NO channelId, NO conversationId, NO routing info
}
```

**Translation:** When the agent finishes its response, you have no idea where to send it.

This is the fundamental architectural gap. To route a voice reply back to the correct Telegram chat, you must:

1. Capture the `conversationId` from `message_received` and store it in memory
2. Read that stored value when `agent_end` fires

```javascript
let lastMessageCtx = null;

api.on("message_received", (event, ctx) => {
  if (ctx.channelId && ctx.conversationId) {
    lastMessageCtx = {
      channelId: ctx.channelId,
      conversationId: ctx.conversationId,
      accountId: ctx.accountId
    };
  }
});

api.on("agent_end", async (event, _ctx) => {
  // Now use lastMessageCtx to know where to send the reply
});
```

### Telegram Voice Messages vs. Slack Audio

The channel send APIs are asymmetric:

**Telegram** has native voice message support:
```typescript
api.runtime.channel.telegram.sendMessageTelegram(to, text, {
  accountId: string,
  mediaUrl: string,          // Local file path or HTTP URL
  mediaLocalRoots: string[], // Allowed local roots (security sandboxing)
  asVoice: boolean,          // true = voice bubble, false = audio file
});
```

**Slack** sends audio as a generic file attachment (no native voice bubble):
```typescript
api.runtime.channel.slack.sendMessageSlack(to, text, {
  accountId: string,
  mediaUrl: string,
  mediaLocalRoots: string[],
  // No asVoice option — Slack treats it as a regular file upload
});
```

### The Manifest `configSchema` Requirement

This one cost us a restart cycle. OpenClaw's plugin validator **requires** a `configSchema` field in `openclaw.plugin.json`. Without it, the config validation fails silently during gateway startup and the plugin is never loaded:

```
plugins: plugin: plugin manifest requires configSchema
plugins.entries.voice-tts: plugin not found: voice-tts
```

Minimal working manifest:

```json
{
  "id": "voice-tts",
  "name": "Voice TTS",
  "description": "Speaks agent responses via edge-tts.",
  "kind": "voice",
  "version": "1.0.0",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "voice": { "type": "string", "default": "en-US-AriaNeural" },
      "maxWords": { "type": "number", "default": 500 }
    }
  }
}
```

### Detecting When to Trigger TTS

The `message_received` event's `metadata` object does **not** expose a voice/audio flag — even if the user sent a voice message on Telegram. The metadata contains fields like `provider`, `surface`, `senderId`, `threadId`, but no `isVoice` or `hasAudio`.

We handle this two ways:

1. **Surface detection** — check `event.metadata?.surface` for `"voice"` or `"audio"` (forward-compatible if OpenClaw adds this later)
2. **Keyword detection** — regex match the text content for explicit audio requests

```javascript
const TTS_TRIGGER = /\b(voice\s+(message|reply|note|response)|audio\s+(message|reply|response)|reply\s+(with|in)\s+(voice|audio)|respond\s+(with|in)\s+(voice|audio)|speak|say\s+(it\s+)?(out\s+loud|aloud)|send\s+(a\s+)?(voice|audio)|use\s+(voice|audio))\b/i;
```

---

## Step 3: The Implementation

### Architecture Overview

```
User sends message (Telegram/Slack)
        │
        ▼
[message_received] ──► store MessageContext, check TTS trigger
        │
        ▼
Agent processes request (LLM inference)
        │
        ▼
[agent_end] ──► if ttsRequested:
        │           1. Extract last assistant message
        │           2. Strip markdown formatting
        │           3. Truncate to 500 words
        │           4. Spawn Python → edge-tts → MP3 file
        │           5. Send to channel (voice note / audio file)
        │           6. Cleanup temp file after 60s
        ▼
User receives voice note in Telegram / audio file in Slack
```

### The Text Cleaning Pipeline

Raw LLM output contains markdown that sounds terrible when read aloud. We strip:

```javascript
function cleanForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")           // Remove code fences entirely
    .replace(/`[^`]*`/g, " ")                  // Remove inline code
    .replace(/^#{1,6}\s+/gm, "")              // Remove ATX headers (keep text)
    .replace(/^[-*_]{3,}\s*$/gm, "")          // Remove horizontal rules
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")  // Links → just the text
    .replace(/https?:\/\/\S+/g, "")           // Bare URLs → gone
    .replace(/(\*{1,3}|_{1,3})([^*_]+)\1/g, "$2") // Bold/italic → plain
    .replace(/^[\s]*[-*+]\s+/gm, "")          // Bullet markers
    .replace(/^[\s]*\d+\.\s+/gm, "")          // Numbered list markers
    .replace(/<[^>]+>/g, "")                   // HTML tags
    .replace(/\n{3,}/g, "\n\n")               // Collapse blank lines
    .trim();
}
```

### The Python TTS Script (`speak.py`)

```python
import asyncio, sys
import edge_tts

VOICE = "en-US-AriaNeural"
MAX_CHARS = 3000

async def synthesize(text: str, output_path: str) -> None:
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(output_path)

def main() -> None:
    text = sys.stdin.read().strip()
    if not text or len(sys.argv) < 2:
        sys.exit(1)

    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS].rsplit(" ", 1)[0] + " ..."

    output_path = sys.argv[1]  # JS plugin passes the temp file path
    asyncio.run(synthesize(text, output_path))

if __name__ == "__main__":
    main()
```

The JS plugin owns the temp file path, `await`s the Python process exit (file is ready), then sends it to the channel.

### The Full Plugin (`dist/index.js`)

```javascript
import { spawn } from "child_process";
import os from "os";
import path from "path";
import { unlinkSync } from "fs";

const PYTHON_EXE = "python"; // use absolute path on Windows if needed
const SPEAK_SCRIPT = new URL("../scripts/speak.py", import.meta.url).pathname
  .replace(/^\/([A-Z]:)/, "$1"); // Windows: strip leading / from /C:/...

const MAX_WORDS = 500;
const TEMP_DIR = os.tmpdir();

const TTS_TRIGGER = /\b(voice\s+(message|reply|note|response)|audio\s+(message|reply|response)|reply\s+(with|in)\s+(voice|audio)|respond\s+(with|in)\s+(voice|audio)|speak|say\s+(it\s+)?(out\s+loud|aloud)|send\s+(a\s+)?(voice|audio)|use\s+(voice|audio))\b/i;

function extractLastAssistantText(messages) {
  if (!Array.isArray(messages)) return "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role !== "assistant") continue;
    if (typeof msg.content === "string") return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content.filter(b => b.type === "text").map(b => b.text || "").join("\n");
    }
  }
  return "";
}

function generateAudio(text, outputPath, logger) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_EXE, [SPEAK_SCRIPT, outputPath], {
      stdio: ["pipe", "ignore", "ignore"]
    });
    proc.stdin.write(text, "utf8");
    proc.stdin.end();
    proc.on("exit", resolve);
    proc.on("error", (err) => { logger.warn(`[voice-tts] ${err.message}`); reject(err); });
  });
}

export default function voiceTtsPlugin(api) {
  let ttsRequested = false;
  let lastMessageCtx = null;

  api.on("message_received", (event, ctx) => {
    if (ctx.channelId && ctx.conversationId) {
      lastMessageCtx = {
        channelId: ctx.channelId,
        conversationId: ctx.conversationId,
        accountId: ctx.accountId
      };
    }
    const isAudioSurface = ["voice", "audio"].includes(event.metadata?.surface);
    const isTextRequest  = TTS_TRIGGER.test(event.content || "");
    ttsRequested = isAudioSurface || isTextRequest;
    if (ttsRequested) {
      api.logger.info("[voice-tts] TTS triggered");
    }
  });

  api.on("agent_end", async (event, _ctx) => {
    if (!ttsRequested || !lastMessageCtx) return;
    ttsRequested = false;
    const msgCtx = lastMessageCtx;

    try {
      const rawText = extractLastAssistantText(event.messages);
      if (!rawText.trim()) return;

      const words = rawText.split(/\s+/);
      const truncated = words.length <= MAX_WORDS
        ? rawText
        : words.slice(0, MAX_WORDS).join(" ") + " ...";

      const outputPath = path.join(TEMP_DIR, `openclaw_tts_${Date.now()}.mp3`);
      await generateAudio(truncated, outputPath, api.logger);

      if (msgCtx.channelId === "telegram") {
        await api.runtime.channel.telegram.sendMessageTelegram(
          msgCtx.conversationId, "",
          { accountId: msgCtx.accountId, mediaUrl: outputPath, mediaLocalRoots: [TEMP_DIR], asVoice: true }
        );
        api.logger.info("[voice-tts] Voice note delivered to Telegram");
      } else if (msgCtx.channelId === "slack") {
        await api.runtime.channel.slack.sendMessageSlack(
          msgCtx.conversationId, "",
          { accountId: msgCtx.accountId, mediaUrl: outputPath, mediaLocalRoots: [TEMP_DIR] }
        );
        api.logger.info("[voice-tts] Audio file delivered to Slack");
      }

      setTimeout(() => { try { unlinkSync(outputPath); } catch {} }, 60000);
    } catch (err) {
      api.logger.warn(`[voice-tts] Error: ${err.message}`);
    }
  });

  api.logger.info("[voice-tts] Loaded — on-demand mode (Telegram voice / Slack audio)");
}
```

---

## Step 4: Deployment

### Prerequisites

```bash
pip install edge-tts
```

No npm install, no build step. The plugin is plain ESM — drop the files in and go.

### Directory Layout

```
~/.openclaw/extensions/voice-tts/
├── package.json
├── openclaw.plugin.json
├── dist/
│   └── index.js
└── scripts/
    └── speak.py
```

### Register the Plugin in `~/.openclaw/openclaw.json`

Add to `plugins.entries`:
```json
"voice-tts": { "enabled": true }
```

Add to `plugins.installs`:
```json
"voice-tts": {
  "source": "path",
  "sourcePath": "/path/to/.openclaw/extensions/voice-tts",
  "installPath": "/path/to/.openclaw/extensions/voice-tts",
  "version": "1.0.0",
  "installedAt": "2026-02-22T00:00:00.000Z"
}
```

### Restart the Gateway

```bash
openclaw gateway stop && openclaw gateway start
```

Confirm the plugin loaded — you should see this in the logs:
```
[voice-tts] Loaded — on-demand mode (Telegram voice / Slack audio)
```

> **Windows gotcha:** `openclaw gateway stop` stops the Task Scheduler job but may leave the `node.exe` process alive. If changes don't load, check what PID is listening on port 18789 and kill it manually before starting again.

---

## Step 5: How to Use It

Once deployed, the plugin is completely silent by default. Nothing fires on every message.

**To trigger a voice reply:**

1. **Send a voice message** to the bot on Telegram (auto-detected via `metadata.surface`)
2. **Ask for it explicitly** in text — any of these will work:
   - *"reply with audio"*
   - *"voice message please"*
   - *"speak that"*
   - *"say it aloud"*
   - *"send a voice note"*
   - *"respond with voice"*

The agent's text response is then synthesized and delivered:
- **Telegram** → native voice note (the waveform bubble, plays inline)
- **Slack** → audio file attachment

---

## What We Learned

### 1. The `agent_end` / `message_received` Context Gap is Real

The most important discovery: **you cannot route an outbound message from within `agent_end` without storing state from `message_received`**. This affects anyone building any plugin that needs to reply to a specific channel. It's not documented anywhere — we found it by diffing the TypeScript definition files for both event types.

### 2. `configSchema` is Non-Negotiable

If your `openclaw.plugin.json` doesn't include `configSchema`, the gateway silently fails to load your plugin with a cryptic error. No warning, no fallback — the plugin just doesn't appear. Always include it, even as an empty schema.

### 3. Windows Path Handling for `import.meta.url`

On Windows, `new URL("../scripts/speak.py", import.meta.url).pathname` returns `/C:/Users/...` with a leading slash. You must strip it before passing to `spawn()` or the path won't resolve:

```javascript
const SPEAK_SCRIPT = new URL("../scripts/speak.py", import.meta.url).pathname
  .replace(/^\/([A-Z]:)/, "$1");
```

### 4. `proc.unref()` vs. `await` — Choose Based on Your Use Case

For fire-and-forget local playback, `proc.unref()` is the right call. But when you need the output file to exist before calling a downstream API (like sending to Telegram), you **must `await` the process exit**. We hit a race condition here before switching patterns.

### 5. Slack Doesn't Have Native Voice Messages

Slack's `sendMessageSlack` in the OpenClaw plugin SDK has no `asVoice` option. Audio is delivered as a generic file upload. If voice-bubble UX is important to you, Telegram is the better channel for this integration.

### 6. Gateway Restart Can Leave Orphaned Processes

`openclaw gateway stop` stops the Windows Task Scheduler job but does not always kill the running `node.exe` process. If your changes aren't loading after a restart, check the PID on port 18789 and kill it manually before starting again.

---

## Gotchas Checklist

- [ ] `configSchema` missing in manifest → plugin silently fails to load
- [ ] `import.meta.url` path on Windows → strip leading `/` before passing to `spawn()`
- [ ] `agent_end` has no channel routing → must capture `conversationId` from `message_received`
- [ ] `proc.unref()` is fire-and-forget — file may not exist yet when you try to send it
- [ ] Gateway restart may leave orphaned process → verify PID on port 18789 is gone
- [ ] `mediaLocalRoots` must include the **directory**, not just the file path

---

## Possible Extensions

- **Voice selection per user** — store preferred voice in session state and pass it to edge-tts
- **Kokoro TTS fallback** — swap to local inference if internet is unavailable
- **OGG/Opus conversion** — use ffmpeg to convert MP3 → OGG before Telegram delivery for better compression
- **Auto-detect incoming voice messages** — if OpenClaw ever exposes `metadata.isVoice`, swap keyword detection for that
- **Per-channel config** — voice replies on Telegram, text-only on Slack
- **Word count as a config option** — expose `maxWords` through the plugin's `configSchema`

---

*Built during a live exploration session with Claude Code. The OpenClaw plugin API was reverse-engineered from TypeScript definition files and the claude-mem reference plugin — no official plugin development documentation was consulted.*
