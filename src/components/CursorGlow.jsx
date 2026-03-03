import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const onMove = (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      glow.style.opacity = '1'

      const target = e.target.closest('.nav-links a, .hero-link')
      if (target) {
        const rect = target.getBoundingClientRect()
        target.style.setProperty('--glow-x', `${e.clientX - rect.left}px`)
        target.style.setProperty('--glow-y', `${e.clientY - rect.top}px`)
      }
    }

    const onLeave = () => {
      glow.style.opacity = '0'
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
    />
  )
}
