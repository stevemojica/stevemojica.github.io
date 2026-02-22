---
slug: 'openclaw-skills-journey'
category: 'ai'
label: 'OpenClaw'
date: 'Feb 2026'
readTime: '10 min read'
title: 'Every Skill We Added to OpenClaw — and Every Wall We Hit Along the Way'
excerpt: 'A full breakdown of the skills and capabilities we built into our OpenClaw setup — local model routing, gateway hardening, model fallback chains, cron management, and more — plus every issue we ran into and how we fixed them.'
---

# Every Skill We Added to OpenClaw — and Every Wall We Hit Along the Way

> **TL;DR:** Over the past several weeks we've turned a stock OpenClaw install into a fully local, self-healing agentic setup running on a single machine with no cloud dependency. This post documents every skill we added, why we added it, and the issues that forced us to learn things the hard way.

---

## Why We Went Deep on OpenClaw

OpenClaw out of the box is functional but opinionated — it defaults to Anthropic's API, assumes you want cloud inference, and gives you just enough config to get started. For our use case (local-first, privacy-focused, GPU-accelerated), that wasn't enough. We needed to build out a stack of skills and integrations that let OpenClaw run entirely on local hardware with real resilience.

Here's everything we added and the reasoning behind each one.

---

## Skill 1: Local Ollama Integration (No API Key Required)

### What We Added

Full local model routing through Ollama. OpenClaw talks directly to `http://127.0.0.1:11434` — zero cloud calls, zero API keys.

### Why

Paying for a cloud LLM API to power agentic tooling when you already have a GPU sitting idle doesn't make sense. Local inference means no data leaves the network, no usage caps, and no surprise bills.

### How It Works

- Created an `ollama:manual` auth profile with a dummy token (`x`) and a `baseURL` pointing to the local Ollama instance
- Set models with the `ollama/` prefix so OpenClaw routes correctly
- Configured `auth-profiles.json` manually since the CLI doesn't expose the `baseURL` field

```json
{
  "profiles": {
    "ollama:manual": {
      "type": "token",
      "provider": "ollama",
      "token": "x",
      "baseURL": "http://127.0.0.1:11434"
    }
  }
}
```

### Issue: Missing `baseURL`

The `openclaw models auth add` command creates a profile but **doesn't include the endpoint URL**. Without `baseURL`, OpenClaw has no idea where to send requests. There's no `--endpoint` flag either — you have to hand-edit `auth-profiles.json`. This is the single most common gotcha for anyone setting up local models.

### Issue: Silent `anthropic/` Prefix

Running `openclaw models set qwen3:8b` without the `ollama/` prefix causes OpenClaw to silently route it as `anthropic/qwen3:8b`. No error, no warning — just fails at runtime. Always use the full `ollama/modelname` syntax.

---

## Skill 2: Multi-Model Routing and Fallback Chains

### What We Added

A tiered model configuration with a primary model, ordered fallbacks, and a specialist model available for routing.

```json
"model": {
  "primary": "ollama/gpt-oss:20b",
  "fallbacks": ["ollama/qwen3:14b", "ollama/qwen3:8b"]
},
"models": {
  "ollama/gpt-oss:20b": {},
  "ollama/qwen3:14b": {},
  "ollama/qwen3:8b": {},
  "ollama/qwen2.5-coder:14b": {}
}
```

### Why

Not every task needs a 20B parameter model, and not every model handles every task. Having a fallback chain means if the primary model is busy loading or hits an issue, OpenClaw automatically drops to the next capable model instead of failing outright. `qwen2.5-coder:14b` is kept available for code-heavy routing — it's measurably better on structured coding tasks than general-purpose models.

### The Model Audit

We tested every installed model for tool-calling support, which is non-negotiable for OpenClaw:

| Model | Size | Tools | Thinking | Context | Verdict |
|---|---|---|---|---|---|
| `gpt-oss:20b` | 13 GB | Yes | Yes | 131K | **Primary — best all-around** |
| `qwen3:14b` | 9.3 GB | Yes | Yes | — | First fallback |
| `qwen3:8b` | 5.2 GB | Yes | Yes | 41K | Second fallback |
| `qwen2.5-coder:14b` | 9.0 GB | Yes | No | 32K | Code specialist |
| `deepseek-r1:14b` | 9.0 GB | **No** | Yes | 131K | **Removed** |
| `llama3.2:latest` | 2.0 GB | ? | No | — | Too small |

### Issue: `deepseek-r1` Has No Tool Support

This one cost us time. `deepseek-r1:14b` is a reasoning/thinking model — great for chain-of-thought tasks, useless for OpenClaw. It has **no tool-calling capability**, which means it can't interact with any of OpenClaw's agent tools. We pulled it and replaced it with `qwen3:14b`.

---

## Skill 3: Gateway Self-Healing (Restart Loop)

### What We Added

A restart loop in `gateway.cmd` that auto-recovers the OpenClaw gateway from crashes instead of leaving it dead.

```batch
:loop
"C:\Program Files\nodejs\node.exe" ... gateway --port 18789
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% == 0 goto :eof
echo [%date% %time%] Gateway exited (code %EXIT_CODE%). Restarting in 5s...
timeout /t 5 /nobreak >nul
goto loop
```

### Why

The OpenClaw gateway on Windows does not self-recover after crashes. When it goes down, it stays down until you manually restart it. For a setup that's supposed to run as persistent infrastructure, that's unacceptable.

### Issue: The EBADF Crash Loop

This was the nastiest bug we hit. On Windows, when the gateway receives a restart signal (`SIGUSR1`), it spawns a new child `node.exe` process and exits the parent. The child inherits the parent's `stdout`/`stderr` file descriptors. When the parent exits and the shell closes, those handles become invalid. The child immediately crashes with:

```
Error: EBADF: bad file descriptor, write
```

The gateway was crashing, trying to restart, crashing again on the bad file descriptor, and staying dead. The restart loop in `gateway.cmd` breaks the cycle by catching non-zero exit codes and respawning cleanly from the shell level, not from inside the dying process.

> **Heads up:** OpenClaw updates can regenerate `gateway.cmd` and wipe this loop. Check it after every update.

---

## Skill 4: Cron Job Management and Security

### What We Added

Manual cron job auditing and the ability to disable rogue jobs directly in `~/.openclaw/cron/jobs.json`.

### Why

OpenClaw's agent can create cron jobs. That's powerful — and dangerous if you're not watching. A job that hangs or fails repeatedly can take down the entire gateway.

### Issue: Rogue Cron Job Crashing the Gateway

A cron job called `voicebox-setup` was running every 6 hours, trying to execute a `curl | bash` pipeline. The `exec` tool was blocked by OpenClaw's security policy (correctly), but instead of failing fast, the embedded agent just hung. After 60 seconds it timed out, which triggered `SIGUSR1`, which triggered the EBADF crash, which killed the gateway.

The cycle: **cron timeout -> restart signal -> EBADF crash -> gateway dead -> cron fires again.**

Fix: opened `jobs.json` directly (the gateway was too dead to use the CLI) and set `"enabled": false` on the offending job. Lesson learned — audit your cron jobs regularly.

---

## Skill 5: NVIDIA Cloud Model Testing and Migration

### What We Added

Systematic testing of NVIDIA's hosted API models for parallel tool-call support, and eventual migration away from cloud APIs entirely.

### Why

Before going full local, we tried NVIDIA's hosted models as a middle ground — better models than what fits on a single consumer GPU, accessible via API. It didn't last.

### Issue: NVIDIA Llama 3.3 70B Rejects Parallel Tool Calls

OpenClaw sends multiple tool calls in a single turn. Llama 3.3 70B on NVIDIA's API hard-rejects this with:

```
400 This model only supports single tool-calls at once!
```

We tried setting `"parallel_tool_calls": false` in the model config. NVIDIA's API rejected that parameter too. The only model that worked was `meta/llama-4-scout-17b-16e-instruct`, which genuinely supported parallel tool calls in testing.

But at that point, the inconsistency and unpredictability of NVIDIA's hosted models made the case for going fully local. With an RTX 5060 Ti and 16 GB VRAM, we had enough horsepower to run `gpt-oss:20b` at 13 GB with headroom to spare.

---

## Skill 6: SOUL.md — Personality and Behavior Configuration

### What We Added

A `SOUL.md` file that establishes the agent's identity, behavior guidelines, and operational philosophy — personal assistant focused on being genuinely helpful, opinionated when appropriate, and trustworthy through competence.

### Why

Without explicit behavioral framing, local models default to generic assistant behavior. `SOUL.md` gives the agent context about who it's working for and how it should prioritize tasks — use local models for quick lookups and code tasks, escalate to heavier inference only when needed.

---

## Skill 7: Model-Task Routing Strategy

### What We Added

A usage strategy that maps task types to specific models:

| Task Type | Model | Reasoning |
|---|---|---|
| Quick lookups, drafting | `qwen3:8b` | Fast, low VRAM footprint |
| General agentic work | `gpt-oss:20b` | Best all-around with tools + thinking |
| Code generation and review | `qwen2.5-coder:14b` | Purpose-built for structured code |
| Complex reasoning | `qwen3:14b` | Strong thinking capability, larger context |

### Why

Running the 20B model for every task wastes VRAM load/unload cycles. Matching models to task complexity keeps the system responsive. OpenClaw's model routing respects this — the primary handles most work, but having the right specialist available for the right job makes the whole setup faster.

---

## Every Issue — Summary Table

| Issue | Cause | Fix |
|---|---|---|
| `No API key found for provider "anthropic"` | OpenClaw defaults to Anthropic cloud API | Created `ollama:manual` auth profile with `baseURL` |
| Model silently prefixed with `anthropic/` | Missing `ollama/` provider prefix in model set command | Always use `ollama/modelname` syntax |
| `baseURL` not created by CLI | `openclaw models auth add` doesn't set endpoint | Hand-edit `auth-profiles.json` |
| `--endpoint` flag doesn't exist | Undocumented limitation | Set `baseURL` directly in auth profile JSON |
| Config overwritten by `openclaw doctor` | Doctor command regenerates config sections | Rely on CLI `models set` and auth profile file |
| Gateway crashes and stays dead | No self-recovery on Windows | Added restart loop to `gateway.cmd` |
| EBADF crash on restart | Child process inherits invalid file descriptors on Windows | Restart loop catches non-zero exits at shell level |
| Rogue cron job hanging and crashing gateway | `voicebox-setup` job blocked by security, hangs until timeout | Disabled job in `jobs.json`, audit cron regularly |
| 400 error on NVIDIA Llama 3.3 70B | Model doesn't support parallel tool calls | Switched to `llama-4-scout` then migrated fully local |
| `parallel_tool_calls: false` rejected | NVIDIA API doesn't accept the parameter | No workaround — moved away from that model |
| `deepseek-r1` unusable as primary | No tool-calling support (reasoning-only model) | Replaced with `qwen3:14b` |
| Anthropic blocked OpenClaw tokens | Likely business/competitive decision after founder left for OpenAI | Reinforced the case for fully local — no vendor dependency |

---

## Where We Are Now

The setup is fully local. No cloud APIs, no vendor lock-in, no surprise policy changes pulling the rug out. The gateway self-heals. The model stack is audited and tested. Cron jobs are monitored.

**Hardware:** RTX 5060 Ti (16 GB VRAM) / 64 GB RAM / Intel Core Ultra 7 265F

**Stack:** OpenClaw 2026.2.15 + Ollama + `gpt-oss:20b` primary + `qwen3:14b` / `qwen3:8b` fallbacks + `qwen2.5-coder:14b` specialist

It took a lot of wall-hitting to get here. But the result is an agentic AI setup that runs entirely on one machine, handles its own failures, and doesn't depend on anyone's API staying online or anyone's business deal going through.

If you're building something similar, the biggest advice I can give: **test tool-call support before you commit to a model, hand-edit your auth profiles, and never trust the gateway to stay up on its own.**

---

*Tested on: OpenClaw 2026.2.15 | Ollama | Windows 11 | RTX 5060 Ti 16 GB | GPU-accelerated inference*
