function CTABlock() {
  return (
    <section className="h-section h-section--cta" id="contact">
      <div className="h-wrap">
        <div className="h-cta">
          <div>
            <h2 className="h-cta__title">
              Say <em>hi.</em>
            </h2>
            <p className="h-cta__body">
              K-12 AI, home lab questions, or just an interesting problem — email's
              the front door. I read everything, answer most things.
            </p>
            <div className="h-cta__options">
              <a
                href="mailto:steve@mojica.io?subject=Hi%20Steve"
                className="h-cta__opt"
              >
                → Just saying hi
              </a>
              <a
                href="mailto:steve@mojica.io?subject=K-12%20IT%20question"
                className="h-cta__opt"
              >
                → K-12 IT question
              </a>
              <a
                href="mailto:steve@mojica.io?subject=MojoOps%20question"
                className="h-cta__opt"
              >
                → MojoOps / home lab
              </a>
              <a href="mailto:steve@mojica.io" className="h-cta__opt">
                → Something else
              </a>
            </div>
          </div>
          <div className="h-cta__side">
            <div className="h-cta__row">
              <span>tz</span>
              <b>america/los_angeles</b>
            </div>
            <div className="h-cta__row">
              <span>replying</span>
              <b>
                <span className="h-cta__dot">●</span> within a few days
              </b>
            </div>
            <div className="h-cta__row">
              <span>also on</span>
              <b>youtube, linkedin</b>
            </div>
            <div className="h-cta__row h-cta__row--last">
              <span>reach</span>
              <b>steve@mojica.io</b>
            </div>
          </div>
        </div>

        <footer className="h-site-footer">
          <span>© 2026 Steven Mojica · Redlands, CA</span>
          <div className="h-site-footer__links">
            <a href="#about">/about</a>
            <a href="#now-snapshot">/now</a>
            <a
              href="https://github.com/stevemojica"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </footer>
      </div>
    </section>
  )
}

export default CTABlock
