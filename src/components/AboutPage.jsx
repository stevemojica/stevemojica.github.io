import SideRail from './SideRail'
import CursorGlow from './CursorGlow'

const SOCIALS = [
  {
    icon: 'in',
    name: 'LinkedIn',
    handle: '/in/stevenmojica',
    href: 'https://www.linkedin.com/in/stevenmojica/',
  },
  {
    icon: 'YT',
    name: 'YouTube',
    handle: '@StevenMojica',
    href: 'https://www.youtube.com/@StevenMojica',
  },
  {
    icon: 'X',
    name: 'X / Twitter',
    handle: '@SteveMojica',
    href: 'https://x.com/SteveMojica',
  },
  {
    icon: 'bs',
    name: 'Bluesky',
    handle: '@stevemojica.bsky.social',
    href: 'https://bsky.app/profile/stevemojica.bsky.social',
  },
  {
    icon: '@',
    name: 'Threads',
    handle: '@stevemojica',
    href: 'https://www.threads.com/@stevemojica',
  },
  {
    icon: 'gh',
    name: 'GitHub',
    handle: '@stevemojica',
    href: 'https://github.com/stevemojica',
  },
]

function AboutPage() {
  return (
    <div className="h-about">
      <CursorGlow />
      <SideRail currentPage="about" />
      <main>
        <div className="h-wrap">
          <section className="h-about-hero">
            <img src="/portrait.jpg" alt="Steven Mojica" />
            <div>
              <div className="h-about-hero__kicker">about</div>
              <h1 className="h-about-hero__h1">
                <em>Steven</em> Mojica.
              </h1>
              <p className="h-about-hero__lede">
                K-12 IT director, home lab operator, YouTuber, and stubborn
                believer that the people closest to the problem should be the
                ones building the tools.
              </p>
              <div className="h-about-hero__quick">
                <span>
                  <b>Redlands, CA</b> · pacific
                </span>
                <span>
                  <b>steve@mojica.io</b>
                </span>
              </div>
            </div>
          </section>

          <section className="h-bio">
            <p>
              By day, I run infrastructure across <strong>three campuses</strong>.
              By night, I run a home lab — a NAS named <strong>SATURN</strong>{' '}
              handling media, an AMP server for game hosting, and local LLMs I
              tinker with on the RTX rig.
            </p>
            <p>
              Eighteen years in, I spend most of my time at the intersection of
              what AI can really do and what it absolutely can't — plus the
              daily work of keeping three campuses running.
            </p>
            <p>
              Out of all of that, a YouTube channel: <em>Morning Briefing.</em>{' '}
              Real news, tech, cyber security, education, and gaming. One
              person, one mic, whatever I actually care about that week.
            </p>
            <p className="h-bio__closer">
              The future is being built in <em>small IT shops</em> with good
              taste.
              <br />
              I'm writing from one.
            </p>
          </section>

          <section className="h-arc">
            <div className="h-arc__head">
              <h2 className="h-arc__h2">The arc.</h2>
              <span className="h-arc__span">
                2004 → present · 22 years
              </span>
            </div>
            <div className="h-arc__track">
              <div className="h-arc__line" aria-hidden="true" />
              <div className="h-arc__stop">
                <span className="h-arc__yr">2004</span>
                <span className="h-arc__dot" aria-hidden="true" />
                <span className="h-arc__lbl">Higher ed IT</span>
              </div>
              <div className="h-arc__stop">
                <span className="h-arc__yr">mid-2000s</span>
                <span className="h-arc__dot" aria-hidden="true" />
                <span className="h-arc__lbl">K-12 / high school</span>
              </div>
              <div className="h-arc__stop">
                <span className="h-arc__yr">2010s</span>
                <span className="h-arc__dot" aria-hidden="true" />
                <span className="h-arc__lbl">Higher ed (again)</span>
              </div>
              <div className="h-arc__stop h-arc__stop--now">
                <span className="h-arc__yr">2022 — now</span>
                <span className="h-arc__dot" aria-hidden="true" />
                <span className="h-arc__lbl">IT Director</span>
              </div>
            </div>
          </section>

          <section className="h-elsewhere">
            <h2 className="h-elsewhere__h2">Elsewhere on the internet.</h2>
            <div className="h-elsewhere__grid">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-elsewhere__card"
                >
                  <span className="h-elsewhere__icon">{s.icon}</span>
                  <div>
                    <div className="h-elsewhere__name">{s.name}</div>
                    <div className="h-elsewhere__handle">{s.handle}</div>
                  </div>
                  <span className="h-elsewhere__arr">↗</span>
                </a>
              ))}
            </div>
          </section>

          <section className="h-about-cta">
            <div className="h-about-cta__block">
              <div>
                <h2 className="h-about-cta__h2">
                  Say <em>hi.</em>
                </h2>
                <p className="h-about-cta__body">
                  Email's best. I read everything, answer most things.
                </p>
                <a
                  href="mailto:steve@mojica.io"
                  className="h-about-cta__btn"
                >
                  steve@mojica.io →
                </a>
              </div>
              <div className="h-about-cta__side">
                <div className="h-about-cta__row">
                  <span>tz</span>
                  <b>america/los_angeles</b>
                </div>
                <div className="h-about-cta__row">
                  <span>also on</span>
                  <b>6 places ↓</b>
                </div>
                <div className="h-about-cta__row h-about-cta__row--last">
                  <span>reply</span>
                  <b>within a few days</b>
                </div>
              </div>
            </div>
          </section>

          <footer className="h-site-footer">
            <span>© 2026 Steven Mojica · Redlands, CA</span>
            <div className="h-site-footer__links">
              <a href="/">/home</a>
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
      </main>
    </div>
  )
}

export default AboutPage
