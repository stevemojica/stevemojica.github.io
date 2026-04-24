import { useEffect, useRef, useState } from 'react'

function useCountUp(target, durationMs = 1400) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const start = () => {
      if (startedRef.current) return
      startedRef.current = true
      const startTs = performance.now()
      const step = (now) => {
        const p = Math.min(1, (now - startTs) / durationMs)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(Math.round(eased * target))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    if (typeof IntersectionObserver === 'undefined') {
      start()
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            start()
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, durationMs])

  return [value, ref]
}

function Stat({ label, target, unit, delta }) {
  const [value, ref] = useCountUp(target)
  return (
    <div className="h-stat" ref={ref}>
      <div className="h-stat__label">{label}</div>
      <div className="h-stat__value">
        {value}
        {unit ? <span className="h-stat__unit">{unit}</span> : null}
      </div>
      <div className="h-stat__delta">● {delta}</div>
    </div>
  )
}

function HomeStats() {
  return (
    <section className="h-section" id="receipts">
      <div className="h-wrap">
        <div className="h-s-head h-s-head--split">
          <div>
            <div className="h-s-kicker">
              <span className="h-s-kicker__num">02</span>
              <span>/receipts</span>
            </div>
            <h2 className="h-s-title">
              A few <em>real numbers.</em>
            </h2>
          </div>
          <p className="h-s-subtitle">I prefer showing over telling.</p>
        </div>
        <div className="h-stats">
          <Stat label="Years in IT" target={18} unit="+" delta="across multiple roles" />
          <Stat label="K-12 campuses" target={3} delta="currently supporting" />
          <Stat
            label="YouTube topics"
            target={5}
            delta="news · tech · cyber · edu · gaming"
          />
        </div>
      </div>
    </section>
  )
}

export default HomeStats
