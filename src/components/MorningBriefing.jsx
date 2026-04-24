function MorningBriefing() {
  return (
    <section className="h-section h-section--no-top">
      <div className="h-wrap">
        <div className="h-mojoops">
          <div>
            <div className="h-mojoops__kicker">/ morning briefing · youtube</div>
            <h2 className="h-mojoops__title">
              Real news, <em>tech,</em> cyber, education, gaming.
            </h2>
            <p className="h-mojoops__body">
              One channel, five lanes. News I'm actually following, tech I'm actually
              using, cyber stories worth understanding, education from the K-12 trenches,
              and the occasional gaming video because life is not all spreadsheets.
            </p>
            <a
              href="https://www.youtube.com/@StevenMojica"
              target="_blank"
              rel="noopener noreferrer"
              className="h-mojoops__cta"
            >
              Watch on YouTube <span className="h-arr">↗</span>
            </a>
          </div>
          <pre className="h-mojoops__ascii" aria-hidden="true">
{`┌─ morning briefing ──────────────┐
│  ▶  real news · daily-ish       │
│  ▶  tech deep-dives             │
│  ▶  cyber security              │
│  ▶  education · K-12 IT         │
│  ▶  gaming · the fun stuff      │
│                                 │
│  @StevenMojica on YouTube       │
└─────────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </section>
  )
}

export default MorningBriefing
