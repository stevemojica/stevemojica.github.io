import { useState, useEffect } from 'react'

const MOODS = ['building', 'shipping', 'in flow', 'debugging', 'reading', 'thinking']

function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function useMood() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MOODS.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])
  return MOODS[index]
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function NowSnapshot() {
  const time = useClock()
  const mood = useMood()

  const hh = pad(time.getHours())
  const mm = pad(time.getMinutes())
  const ss = pad(time.getSeconds())
  const dateLabel = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="h-section" id="now-snapshot">
      <div className="h-wrap">
        <div className="h-s-head h-s-head--split">
          <div>
            <div className="h-s-kicker">
              <span className="h-s-kicker__num">01</span>
              <span>/now · live snapshot</span>
            </div>
            <h2 className="h-s-title">
              Where I'm at, <em>right now.</em>
            </h2>
          </div>
          <p className="h-s-subtitle">A small public status page for one person.</p>
        </div>

        <div className="h-now-grid">
          <div className="h-card h-reveal">
            <div className="h-card-head">
              <span>/ status</span>
              <span className="h-card-head__live">live</span>
            </div>
            <div className="h-now-clock">
              {hh}
              <span className="h-now-clock__sep">:</span>
              {mm}
              <span className="h-now-clock__sep">:</span>
              {ss}
            </div>
            <div className="h-now-meta">{dateLabel} · pacific</div>
            <div className="h-now-line">
              <span className="h-now-line__k">location</span>
              <span className="h-now-line__v">Redlands, CA · PT</span>
            </div>
            <div className="h-now-line">
              <span className="h-now-line__k">role</span>
              <span className="h-now-line__v">K-12 IT Director</span>
            </div>
            <div className="h-now-line">
              <span className="h-now-line__k">after hours</span>
              <span className="h-now-line__v">home lab · YouTube</span>
            </div>
            <div className="h-now-line">
              <span className="h-now-line__k">mood</span>
              <span className="h-now-line__v h-now-line__v--a">{mood}</span>
            </div>
          </div>

          <div className="h-card h-reveal h-reveal--d1">
            <div className="h-card-head">
              <span>/ the home lab</span>
              <span>running now</span>
            </div>
            <div className="h-card-list">
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                <strong>SATURN</strong> — media server + NAS
              </div>
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                <strong>AMP</strong> — game server host
              </div>
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                <strong>RTX 5070 Ti</strong> — local LLM tinkering
              </div>
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                <strong>Dell micro</strong> — always-on
              </div>
            </div>
          </div>

          <div className="h-card h-reveal h-reveal--d2">
            <div className="h-card-head">
              <span>/ this month · at work</span>
              <span>RCS</span>
            </div>
            <div className="h-card-list">
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                <strong>full network discovery</strong> across campuses
              </div>
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                mapping what's actually out there
              </div>
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                planning the <strong>improvements</strong> that follow
              </div>
              <div>
                <span className="h-card-list__b">▸</span>{' '}
                Microsoft 365 · Google Workspace · Zendesk
              </div>
              <div className="h-card-list__aside">
                · "Tuesday mornings are the unit test."
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NowSnapshot
