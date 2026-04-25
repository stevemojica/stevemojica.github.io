function HomeHero() {
  return (
    <section className="h-hero" id="hero">
      <div className="h-wrap">
        <div className="h-hero-grid">
          <div>
            <div className="h-hero-meta">
              <span>K-12 IT Director</span>
              <span className="h-hero-meta__dot">· Redlands, CA</span>
            </div>
            <h1 className="h-hero-h1">
              The future is being built in <em>small IT shops with good taste.</em>
            </h1>
            <p className="h-hero-lede">
              I'm <strong>Steve Mojica</strong>. <strong>Eighteen years</strong> in.
              I run infrastructure across three campuses by day, and after hours I run
              a home lab — media server, game hosting, a NAS named <strong>SATURN</strong>,
              and a pile of local LLMs I tinker with on the RTX rig. Morning Briefing —
              my YouTube channel — is where I publish the results: <em>real news, tech,
              cyber, education, gaming.</em>
            </p>
            <div className="h-hero-cta">
              <a
                href="https://www.youtube.com/@StevenMojica"
                target="_blank"
                rel="noopener noreferrer"
                className="h-btn h-btn--primary"
              >
                Watch Morning Briefing <span className="h-arr">↗</span>
              </a>
              <a href="/about" className="h-btn h-btn--ghost">
                More about me →
              </a>
            </div>
          </div>
          <div className="h-hero-portrait">
            <img src="/portrait.jpg" alt="Steven Mojica" />
            <div className="h-hero-portrait__badge">● live</div>
            <div className="h-hero-portrait__signature">— Steve</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeHero
