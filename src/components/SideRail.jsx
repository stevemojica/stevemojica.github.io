import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../ThemeContext'

function useClock() {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      setLabel(`${hh}:${mm} PT`)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])
  return label
}

const SECTIONS = [
  {
    heading: 'site',
    links: [
      { label: 'Home', to: '/', icon: '~', dataPage: 'home' },
      {
        label: 'Now',
        to: '/#now-snapshot',
        icon: '●',
        meta: 'live',
        dataPage: 'now',
      },
    ],
  },
  {
    heading: 'about me',
    links: [
      { label: 'About', to: '/about', icon: 'i', dataPage: 'about' },
    ],
  },
  {
    heading: 'elsewhere',
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/stevemojica',
        icon: '↗',
      },
      {
        label: 'YouTube',
        href: 'https://www.youtube.com/@StevenMojica',
        icon: '↗',
      },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/stevenmojica/',
        icon: '↗',
      },
    ],
  },
]

function RailLink({ link, currentPage, onClick }) {
  const isInternal = !!link.to
  const className = `h-rail__link${currentPage && link.dataPage === currentPage ? ' h-rail__link--cur' : ''}`
  const inner = (
    <>
      <span className="h-rail__ic">{link.icon}</span>
      <span>{link.label}</span>
      {link.meta && <span className="h-rail__meta">{link.meta}</span>}
    </>
  )

  if (isInternal) {
    if (link.to.startsWith('/#') || link.to.includes('#')) {
      return (
        <a className={className} href={link.to} onClick={onClick}>
          {inner}
        </a>
      )
    }
    return (
      <Link className={className} to={link.to} onClick={onClick}>
        {inner}
      </Link>
    )
  }
  return (
    <a
      className={className}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {inner}
    </a>
  )
}

function ThemePill() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      className="h-rail__theme"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? '☀' : '☾'}
    </button>
  )
}

function SideRail({ currentPage }) {
  const clock = useClock()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // close the drawer after route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname, location.hash])

  return (
    <>
      {/* mobile top */}
      <div className="h-topnav">
        <Link to="/" className="h-topnav__brand">
          <span className="h-topnav__avatar" aria-hidden="true" />
          <span>Steve Mojica</span>
        </Link>
        <span className="h-topnav__spacer" />
        <ThemePill />
        <button
          type="button"
          className="h-topnav__menu"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* desktop rail */}
      <aside className="h-rail">
        <Link to="/" className="h-rail__brand">
          <span className="h-rail__avatar" aria-hidden="true" />
          <span>Steve Mojica</span>
        </Link>
        <div className="h-rail__tag">
          <span className="h-rail__livedot" aria-hidden="true" />
          director · IT · K-12
        </div>

        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <div className="h-rail__section">{section.heading}</div>
            {section.links.map((link) => (
              <RailLink key={link.label} link={link} currentPage={currentPage} />
            ))}
          </div>
        ))}

        <div className="h-rail__spacer" />

        <div className="h-rail__foot">
          <div className="h-rail__clock">
            <span>Redlands, CA</span>
            <span className="h-rail__clock-v">{clock || '—'}</span>
          </div>
          <div className="h-rail__foot-row">
            <span className="h-rail__copy">© 2026 SM</span>
            <ThemePill />
          </div>
        </div>
      </aside>

      {/* mobile drawer */}
      {drawerOpen && (
        <div
          className="h-drawer h-drawer--open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false)
          }}
        >
          <div className="h-drawer__panel">
            <div className="h-drawer__header">
              <div className="h-drawer__brand">
                <span className="h-topnav__avatar" aria-hidden="true" />
                <strong>Steve Mojica</strong>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="h-drawer__close"
              >
                ×
              </button>
            </div>
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <div className="h-rail__section">{section.heading}</div>
                {section.links.map((link) => (
                  <RailLink
                    key={link.label}
                    link={link}
                    currentPage={currentPage}
                    onClick={() => setDrawerOpen(false)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default SideRail
