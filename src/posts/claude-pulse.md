---
slug: 'claude-pulse'
category: 'ai'
label: 'AI'
date: 'March 2026'
readTime: '4 min read'
title: 'I Built Claude Pulse — A Native macOS Menubar App for Claude Usage Monitoring'
excerpt: 'Every Claude usage tool lives in the terminal. I built the first native macOS menubar app that lets you glance at your limits from anywhere on your Mac.'
---

# I Built Claude Pulse — A Native macOS Menubar App for Claude Usage Monitoring

If you use Claude Code heavily, you know the feeling. You're deep in a session, shipping features, and then — rate limited. No warning, no countdown, just a wall. You check your usage in Settings, do the mental math on when it resets, and wait.

I got tired of that workflow. So I built **Claude Pulse**.

## The Problem

Every existing Claude usage tool — ClaudeCodeStatusLine, ccusage, CCometixLine — lives inside the terminal. They're great projects, but they all share the same limitation: you have to be looking at your terminal to see your usage. The moment you switch to a browser, Figma, or Slack, you're flying blind.

There's no native macOS experience for monitoring Claude usage. No widget. No menubar icon. Nothing you can glance at from anywhere on your Mac.

## The Solution

Claude Pulse is a native macOS menubar app built in Swift and SwiftUI. It sits in your menubar as a tiny percentage indicator and, when clicked, opens a frosted glass dashboard showing all your usage windows in real time.

### What It Shows

- **5-Hour session** — your current session utilization with a live countdown when you're near the limit
- **7-Day weekly** — aggregate usage across all models
- **Per-model breakdown** — separate bars for Sonnet and Opus
- **Extra credits** — your monthly overage spend in real dollars
- **Sparkline trend** — a 24-hour usage graph so you can see your burn pattern

### What Makes It Smart

Claude Pulse doesn't just show you numbers. It thinks about them.

**Burn Rate Prediction** — Linear regression on your recent usage snapshots estimates when you'll hit a limit. If you're burning through your 5-hour window fast, the app shows "~47m until limit" right below the progress bar.

**Pace Coach** — Context-aware tips that only appear when they're actually useful. If your weekly usage is at 70% with 3 days left and you're on pace to exceed 100%, it'll suggest spreading usage out. If your Opus usage is 3x your Sonnet usage, it'll note that Sonnet handles many tasks well. No fear-mongering — just information.

**Live Countdown Clock** — When you're at 80%+ on any window, a ticking HH:MM:SS countdown appears showing exactly when the reset happens. No more mental math.

**Budget Alerts** — Native macOS notifications at configurable thresholds (50%, 75%, 90%, 95%). The 90%+ alerts use Time Sensitive interruption level so they break through Focus mode.

## How It Works

The data source is straightforward. Claude Code stores your OAuth token in the macOS Keychain. Claude Pulse reads it (read-only) and polls Anthropic's OAuth usage endpoint every 60 seconds. No API keys to configure — if Claude Code is logged in, Claude Pulse just works.

```
macOS Keychain → OAuth token → Usage API → Menubar dashboard
```

Usage snapshots are stored in a local SQLite database (with WAL mode for thread safety) for trend analysis and predictions. The database auto-prunes to 30 days.

## The Technical Stack

- **Swift + SwiftUI** — native macOS, no Electron
- **MenuBarExtra** — macOS 14+ menubar API with window-style popover
- **Swift Charts** — for the 7-day history view
- **SQLite3** — usage history with WAL mode and NSLock-based thread safety
- **Swift Actors** — cache and alert state are actor-isolated for concurrency safety
- **CryptoKit** — SHA256 for CLAUDE_CONFIG_DIR hash suffix handling

The whole thing is about 3,500 lines of Swift across a clean library/app separation. The core data layer is a reusable Swift package that the CLI tool also links against.

## Security

This was important to get right since the app handles OAuth tokens:

- Tokens are read from Keychain at runtime, never stored or logged
- Token expiry is checked before use, with automatic re-resolution on expiry
- SQLite uses WAL mode with locking for concurrent access safety
- The code review caught and fixed a dangling pointer in SQLite text binding, a data race in the alert system, and token prefix leaking to stdout

## Open Source

Claude Pulse is open source under the MIT license. You can build it right now:

```bash
git clone https://github.com/stevemojica/claude-pulse.git
cd claude-pulse
swift build -c release
```

GitHub Actions are set up for CI builds on every push and automated DMG releases when you tag a version.

**Check it out:** [github.com/stevemojica/claude-pulse](https://github.com/stevemojica/claude-pulse)

## What's Next

- **WidgetKit extension** — a Notification Center widget so you don't even need to click
- **Sparkle auto-updates** — so the app keeps itself current
- **Cross-session aggregation** — pull cost data from all your Claude Code sessions for a unified daily/weekly view

If you're a Claude power user burning through limits, give it a try. And if you want to contribute — PRs are welcome.
