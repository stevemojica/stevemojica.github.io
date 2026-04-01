---
slug: 'claude-pulse'
category: 'ai'
label: 'AI'
date: 'April 2026'
readTime: '5 min read'
title: 'I Built Claude Pulse — A Native macOS Agent Hub for Vibe Coders'
excerpt: 'When you have 5+ AI agents running at once, you need a command center. Claude Pulse is the native macOS floating dashboard that tracks every session, surfaces permission prompts, and monitors your usage — all without leaving your editor.'
---

# I Built Claude Pulse — A Native macOS Agent Hub for Vibe Coders

If you vibe code with Claude, you know the chaos. Five terminal tabs. Three agents deep in different features. One waiting for permission you forgot about. Another silently rate-limited twenty minutes ago. And you're alt-tabbing between all of them trying to figure out which session needs you right now.

I built **Claude Pulse** because I was tired of losing track of my own agents.

## The Problem Nobody Talks About

The Claude Code community has shipped some great usage monitoring tools — terminal statuslines, cost trackers, sparkline widgets. They're all solid. But they all share the same blind spot: they live *inside* a single terminal session. The moment you switch to your editor, browser, or Figma, you're flying blind.

And here's what changed everything: **multi-agent workflows**. Once you're running 3, 5, even 10 agent conversations in parallel, terminal-based monitoring completely falls apart. You can't watch 10 terminals at once. You need something that watches them *for* you.

## What Claude Pulse Actually Is

Claude Pulse is a native macOS floating command bar — think Spotlight meets mission control for your AI agents. It lives as a thin strip at the top of your screen and auto-expands when an agent needs your attention. Toggle it with **Cmd+Shift+P** from anywhere.

It has three states:

- **Strip** (28px) — a subtle bar showing active agent count and usage at a glance
- **Preview** (80px) — auto-pops when an agent needs permission or has a question, then auto-collapses after 5 seconds
- **Dashboard** (full) — every session, every usage bar, every prediction, all in one view

### Agent Session Tracking

This is the headline feature. Claude Pulse detects every Claude Code session running on your machine — via a real-time Unix socket when hooks are configured, or by watching log files as a fallback.

For each session you see:
- **Status** — working, idle, awaiting permission, completed, or errored
- **Working directory** — instantly know which project each agent is in
- **Current task** — what tool it's running right now
- **Terminal jump** — click a session card to activate the right terminal window

### Permission Relay

This one's a game-changer. When an agent hits a permission prompt, Claude Pulse surfaces it in the floating bar with **Allow** and **Deny** buttons. No more hunting through terminal tabs to find which session is blocked. The command bar pops up, you approve, and you're back in your editor in two seconds.

### Usage Intelligence

The usage monitoring goes way beyond a progress bar:

- **All five windows** — 5-hour session, 7-day aggregate, Sonnet, Opus, and extra credits
- **Burn rate prediction** — linear regression estimates when you'll hit limits
- **Agent-aware Pace Coach** — "3 agents running, at this burn rate you'll hit your 5h limit in 22 minutes"
- **Live countdown** — a ticking HH:MM:SS clock when you're near a reset
- **Budget alerts** — native macOS notifications at configurable thresholds that break through Focus mode
- **Sparkline trends** — 24-hour usage patterns and 7-day history charts

## How It Works Under the Hood

The architecture has three data sources feeding into one UI:

```
Floating Command Bar
        |
   +---------+---------+
   |         |         |
Socket    Log       Usage API
Server    Watcher   (OAuth)
   |         |         |
Claude    ~/.claude/  api.anthropic.com
Code      projects/
Hooks     *.jsonl
```

**Socket Server** — A Unix domain socket at `~/Library/Application Support/ClaudePulse/pulse.sock` receives real-time JSON events from Claude Code hooks. This is the primary path — bidirectional communication that enables permission relay.

**Log Watcher** — Monitors `~/.claude/projects/` for JSONL changes as a fallback. Read-only, but still detects sessions and their activity.

**Usage API** — Reads your OAuth token from macOS Keychain (the same one Claude Code stores) and polls Anthropic's usage endpoint. No API keys to configure — if Claude Code is logged in, Pulse just works.

All session data is ephemeral (in-memory only). Usage history is stored locally in SQLite with WAL mode and auto-prunes to 30 days.

## The Tech Stack

- **Swift + SwiftUI** — fully native macOS, no Electron, no web views
- **NSPanel** — non-activating floating window that never steals focus from your editor
- **POSIX sockets + DispatchSource** — raw Unix socket server with zero external dependencies
- **SQLite3 + WAL** — usage history with concurrent access safety
- **Sparkle** — auto-updates via signed GitHub Releases
- **Programmatic audio** — AVAudioEngine-synthesized sound effects, no shipped audio files

About 3,500 lines of Swift across a clean library/app/CLI separation. The core data layer is a reusable Swift package.

## Security

This matters because the app handles OAuth tokens and inter-process communication:

- **Tokens read from Keychain at runtime**, never stored or logged
- **Socket hardened** — 0600 permissions, peer UID validation via `getpeereid()`
- **Input validated** — strict JSON schema, 64KB max message size, shell metacharacter rejection
- **AppleScript sanitized** — TTY paths validated before interpolation
- **Auto-updates signed** — Sparkle Ed25519 signature verification

Full threat model documented in [SECURITY.md](https://github.com/stevemojica/claude-pulse/blob/main/SECURITY.md).

## Open Source and Free

Claude Pulse is MIT licensed. Clone it and build in under a minute:

```bash
git clone https://github.com/stevemojica/claude-pulse.git
cd claude-pulse
swift build -c release
```

The hook installer configures Claude Code automatically:

```bash
./Scripts/install-hooks.sh
```

**Check it out:** [github.com/stevemojica/claude-pulse](https://github.com/stevemojica/claude-pulse)

## What's Next

- **WidgetKit extension** — Notification Center widget for at-a-glance usage
- **More agent hooks** — Codex, Gemini CLI, and Cursor support
- **tmux/screen support** — jump to specific tmux panes
- **Configurable hotkey** — pick your own shortcut
- **CSV export** — usage history for your own analysis

If you're running multiple Claude Code sessions and losing track of which one needs you, give Claude Pulse a try. And if you want to contribute — PRs are very welcome.
