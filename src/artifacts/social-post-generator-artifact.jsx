// ─────────────────────────────────────────────────────────────────────────────
// Social Post Generator — Claude Artifact Version
// Paste this into Claude.ai as a React artifact.
// The form builds a structured prompt → user sends it → Claude generates posts.
// ─────────────────────────────────────────────────────────────────────────────

const TOPICS = ["Technology", "Leadership", "IT/Infrastructure", "AI & Automation", "Career", "Business", "Education", "Custom"];
const TONES = ["Professional", "Casual & Witty", "Bold & Opinionated", "Educational", "Storytelling"];
const HOOK_TYPES = ["Bold Statement", "Surprising Stat", "Punchy Question", "Emoji Anchor", "Visual Pause (— or :)"];

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? "#166534" : "#1e293b",
        color: copied ? "#4ade80" : "#94a3b8",
        border: `1px solid ${copied ? "#166534" : "#334155"}`,
        borderRadius: 6, padding: "6px 14px", fontSize: 12,
        cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CharCounter({ text, limit }) {
  const count = text.length;
  const pct = Math.min(count / limit, 1);
  const color = count > limit ? "#ef4444" : count > limit * 0.85 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8" }}>
      <span>Characters</span>
      <div style={{ flex: 1, height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      <span style={{ color, fontWeight: 600, minWidth: 60 }}>{count}/{limit}</span>
    </div>
  );
}

function PostCard({ label, content, charLimit, icon }) {
  if (!content) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>{label}</span>
        </div>
        <CopyButton text={content} />
      </div>
      <div style={{
        background: "#020617", borderRadius: 8, padding: 16,
        color: "#cbd5e1", fontSize: 15, lineHeight: 1.75,
        whiteSpace: "pre-wrap", fontFamily: "Georgia, serif",
        userSelect: "text", cursor: "text",
      }}>
        {content}
      </div>
      <CharCounter text={content} limit={charLimit} />
    </div>
  );
}

function parseOutput(raw) {
  const result = { twitter: "", threads: "", hashtags: "", source: "", hook: "" };
  const tw = raw.match(/\*\*TWITTER\/X\*\*[^\n]*\n([\s\S]*?)(?=\*\*THREADS\*\*|\*\*HASHTAGS|\*\*SOURCE|\*\*HOOK|$)/i);
  const th = raw.match(/\*\*THREADS\*\*[^\n]*\n([\s\S]*?)(?=\*\*HASHTAGS|\*\*SOURCE|\*\*HOOK|\*\*TWITTER|$)/i);
  const ht = raw.match(/\*\*HASHTAGS USED:\*\*\s*(.+)/i);
  const sr = raw.match(/\*\*SOURCE:\*\*\s*(.+)/i);
  const hk = raw.match(/\*\*HOOK TECHNIQUE:\*\*\s*(.+)/i);
  if (tw) result.twitter = tw[1].trim();
  if (th) result.threads = th[1].trim();
  if (ht) result.hashtags = ht[1].trim();
  if (sr) result.source = sr[1].trim();
  if (hk) result.hook = hk[1].trim();
  return result;
}

export default function SocialPostGenerator() {
  const [topic, setTopic] = React.useState("Technology");
  const [customTopic, setCustom] = React.useState("");
  const [tone, setTone] = React.useState("Professional");
  const [hookType, setHookType] = React.useState("Bold Statement");
  const [content, setContent] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [pasteText, setPasteText] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [view, setView] = React.useState("form"); // "form" | "prompt" | "result"

  const buildPrompt = () => {
    const topicLabel = topic === "Custom" ? customTopic : topic;
    return `You are a sharp, human-sounding social media writer. Create social media posts:

TOPIC CATEGORY: ${topicLabel}
DESIRED TONE: ${tone}
PREFERRED HOOK TYPE: ${hookType}
KEY MESSAGE / CONTENT:
${content}${url ? `\n\nSOURCE URL: ${url}` : ""}

RULES:
- Twitter/X: Max 280 characters (URLs = 23 chars)
- Threads: Max 500 characters
- Lead with a pattern-interrupt opener using the specified hook technique
- Do NOT start with "I", "We", "Our", or "Just"
- 2-4 relevant hashtags
- Include source URL if provided

OUTPUT FORMAT (use this EXACT format):

**TWITTER/X** ([char count] chars)
[post text]

**THREADS** ([char count] chars)
[post text]

**HASHTAGS USED:** #tag1 #tag2 #tag3
**SOURCE:** [URL or "none provided"]
**HOOK TECHNIQUE:** [technique name]`;
  };

  const handleGenerate = () => {
    if (!content.trim()) return;
    const p = buildPrompt();
    setPrompt(p);
    setView("prompt");
  };

  const handleParseResults = () => {
    if (!pasteText.trim()) return;
    setResult(parseOutput(pasteText));
    setView("result");
  };

  const inputStyle = {
    background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8,
    color: "#e2e8f0", padding: "12px 14px", fontSize: 16,
    fontFamily: "inherit", width: "100%", boxSizing: "border-box",
    outline: "none",
  };
  const labelStyle = {
    color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 6, display: "block",
  };
  const pill = (active) => ({
    padding: "7px 14px", borderRadius: 20, border: "1px solid",
    borderColor: active ? "#3b82f6" : "#1e293b",
    background: active ? "#1d3461" : "#0f172a",
    color: active ? "#93c5fd" : "#64748b",
    fontSize: 13, cursor: "pointer", fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "32px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
            SOCIAL POST GENERATOR
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.2, color: "#e2e8f0" }}>
            Posts That Sound Human
          </h1>
          <p style={{ color: "#475569", marginTop: 10, fontSize: 14 }}>Twitter/X &middot; Threads &middot; Built for character limits</p>
        </div>

        {/* View: Form */}
        {view === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22, background: "#0a1628", border: "1px solid #1e293b", borderRadius: 16, padding: "24px 20px" }}>
            <div>
              <label style={labelStyle}>Topic Category</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TOPICS.map(t => <button key={t} style={pill(topic === t)} onClick={() => setTopic(t)}>{t}</button>)}
              </div>
              {topic === "Custom" && (
                <input style={{ ...inputStyle, marginTop: 10 }} placeholder="Enter your custom topic..." value={customTopic} onChange={e => setCustom(e.target.value)} />
              )}
            </div>

            <div>
              <label style={labelStyle}>Tone</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TONES.map(t => <button key={t} style={pill(tone === t)} onClick={() => setTone(t)}>{t}</button>)}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Hook Technique</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {HOOK_TYPES.map(h => <button key={h} style={pill(hookType === h)} onClick={() => setHookType(h)}>{h}</button>)}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Your Key Message or Content</label>
              <textarea
                style={{ ...inputStyle, minHeight: 130, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Paste an article summary, idea, insight, announcement, or talking point."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Source URL <span style={{ color: "#475569", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input
                style={inputStyle}
                type="url"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!content.trim()}
              style={{
                background: !content.trim() ? "#1e293b" : "linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)",
                color: !content.trim() ? "#475569" : "#fff",
                border: "none", borderRadius: 10, padding: "16px 24px",
                fontSize: 16, fontWeight: 700, cursor: !content.trim() ? "not-allowed" : "pointer",
                letterSpacing: "0.02em", fontFamily: "inherit",
              }}
            >
              Generate Posts
            </button>
          </div>
        )}

        {/* View: Prompt (copy & send) */}
        {view === "prompt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14 }}>
                  Step 1: Copy this prompt and send it in a new message
                </div>
                <CopyButton text={prompt} />
              </div>
              <div style={{
                background: "#020617", borderRadius: 8, padding: 16,
                color: "#94a3b8", fontSize: 13, lineHeight: 1.7,
                whiteSpace: "pre-wrap", fontFamily: "monospace",
                maxHeight: 300, overflowY: "auto",
                userSelect: "text", cursor: "text",
              }}>
                {prompt}
              </div>
            </div>

            <div style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14 }}>
                Step 2: Paste Claude's response here
              </div>
              <textarea
                style={{ ...inputStyle, minHeight: 160, resize: "vertical", lineHeight: 1.6, fontSize: 14 }}
                placeholder="Paste the full response from Claude here..."
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setView("form"); setPasteText(""); setPrompt(""); }}
                  style={{
                    background: "#1e293b", color: "#94a3b8", border: "1px solid #334155",
                    borderRadius: 10, padding: "14px 20px", fontSize: 14, cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 600, flex: 1,
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleParseResults}
                  disabled={!pasteText.trim()}
                  style={{
                    background: !pasteText.trim() ? "#1e293b" : "linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)",
                    color: !pasteText.trim() ? "#475569" : "#fff",
                    border: "none", borderRadius: 10, padding: "14px 20px",
                    fontSize: 14, fontWeight: 700, cursor: !pasteText.trim() ? "not-allowed" : "pointer",
                    fontFamily: "inherit", flex: 2,
                  }}
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View: Formatted results */}
        {view === "result" && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ color: "#475569", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
              Generated Posts
            </div>

            <PostCard label="TWITTER / X" content={result.twitter} charLimit={280} icon="X" />
            <PostCard label="THREADS" content={result.threads} charLimit={500} icon="@" />

            {(result.hashtags || result.source || result.hook) && (
              <div style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {result.hashtags && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Hashtags: </span>
                    <span style={{ color: "#3b82f6" }}>{result.hashtags}</span>
                  </div>
                )}
                {result.source && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Source: </span>
                    <span style={{ color: "#cbd5e1" }}>{result.source}</span>
                  </div>
                )}
                {result.hook && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Hook Technique: </span>
                    <span style={{ color: "#a78bfa" }}>{result.hook}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => { setView("form"); setPasteText(""); setPrompt(""); setResult(null); }}
                style={{
                  background: "#1e293b", color: "#94a3b8", border: "1px solid #334155",
                  borderRadius: 10, padding: "14px 20px", fontSize: 14, cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 600, flex: 1,
                }}
              >
                Start Over
              </button>
              <button
                onClick={() => setView("prompt")}
                style={{
                  background: "#1e293b", color: "#94a3b8", border: "1px solid #334155",
                  borderRadius: 10, padding: "14px 20px", fontSize: 14, cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 600, flex: 1,
                }}
              >
                Edit &amp; Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
