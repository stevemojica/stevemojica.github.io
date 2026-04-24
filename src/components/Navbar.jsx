import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { label: 'Now', href: '#now-snapshot' },
  { label: 'Writing', href: '#blog' },
  { label: 'Receipts', href: '#receipts' },
  { label: 'Tools', href: '/tools', isRoute: true },
  { label: 'Contact', href: '#contact' },
]

const SECTION_IDS = NAV_ITEMS.filter(i => !i.isRoute).map(i => i.href.slice(1))

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <span className="nav-logo-icon">&lt;/&gt;</span>
          Steve Mojica
        </a>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => {
            const isActive = !item.isRoute && activeSection === item.href.slice(1)
            return (
              <li key={item.href}>
                {item.isRoute ? (
                  <Link to={item.href} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={isActive ? 'active' : ''}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            )
          })}
        </ul>

        <div className="nav-actions">
          <ThemeToggle />
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? '\u2715' : '\u2630'}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
