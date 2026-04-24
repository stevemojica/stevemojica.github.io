const TICKER_ITEMS = [
  '▶ MORNING BRIEFING · YOUTUBE',
  '★ 18+ YEARS IN K-12 IT',
  '3 CAMPUSES · REDLANDS, CA',
  'SATURN · MEDIA + GAME HOSTING',
  'LOCAL LLMS ON THE RTX RIG',
  'NEWS · TECH · CYBER · EDU · GAMING',
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="h-ticker" role="marquee" aria-label="Site highlights">
      <div className="h-ticker__track">
        {items.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  )
}

export default Ticker
