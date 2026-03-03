import { useState, useEffect, useCallback } from 'react'

const REPO_OWNER = 'stevemojica'
const REPO_NAME = 'Claude-Plugins'
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main`

function parseReadme(raw) {
  const lines = raw.split('\n')
  let name = ''
  let description = ''
  let features = []
  let inFeatures = false

  for (const line of lines) {
    if (!name && /^#{1,2}\s+/.test(line)) {
      name = line.replace(/^#{1,2}\s+/, '').trim()
      continue
    }

    if (name && !description && line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) {
      if (/^\*\*/.test(line.trim()) || /^>/.test(line.trim())) continue
      description = line.trim()
      continue
    }

    if (/^#{2,3}\s+(Key )?Features/i.test(line)) {
      inFeatures = true
      continue
    }
    if (inFeatures && /^#{2,3}\s+/.test(line)) {
      inFeatures = false
      continue
    }
    if (inFeatures && /^[-*]\s+/.test(line)) {
      const feature = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim()
      if (feature) features.push(feature)
    }
  }

  return { name, description, features: features.slice(0, 6) }
}

function formatDirName(dirName) {
  return dirName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function PluginCard({ plugin }) {
  return (
    <a
      href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/main/${plugin.dir}`}
      target="_blank"
      rel="noopener noreferrer"
      className="plugin-card"
    >
      <div className="plugin-card-header">
        <span className="plugin-card-icon">&#129520;</span>
        <span className="plugin-card-badge">Claude Plugin</span>
      </div>
      <h3 className="plugin-card-name">{plugin.name}</h3>
      <p className="plugin-card-desc">{plugin.description || 'A custom Claude plugin.'}</p>
      {plugin.features.length > 0 && (
        <ul className="plugin-card-features">
          {plugin.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      <div className="plugin-card-footer">
        <span className="plugin-card-link">
          View on GitHub &rarr;
        </span>
      </div>
    </a>
  )
}

function SkeletonPluginCard() {
  return (
    <div className="plugin-card skeleton-card" aria-hidden="true">
      <div className="plugin-card-header">
        <span className="skeleton-line" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
        <span className="skeleton-line" style={{ width: '90px', height: '20px', borderRadius: '20px' }} />
      </div>
      <div className="skeleton-line" style={{ width: '60%', height: '1.1rem', marginBottom: '0.5rem', marginTop: '0.75rem' }} />
      <div className="skeleton-line" style={{ width: '100%', height: '0.85rem', marginBottom: '0.4rem' }} />
      <div className="skeleton-line" style={{ width: '90%', height: '0.85rem', marginBottom: '1rem' }} />
      <div className="skeleton-line" style={{ width: '40%', height: '0.8rem', marginBottom: '0.3rem' }} />
      <div className="skeleton-line" style={{ width: '55%', height: '0.8rem', marginBottom: '0.3rem' }} />
      <div className="skeleton-line" style={{ width: '45%', height: '0.8rem' }} />
    </div>
  )
}

export default function ClaudePlugins() {
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlugins = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`
      )
      if (!res.ok) throw new Error('Failed to fetch plugin list')
      const contents = await res.json()

      const dirs = contents.filter(
        item => item.type === 'dir' && !item.name.startsWith('.')
      )

      const pluginData = await Promise.all(
        dirs.map(async (dir) => {
          try {
            const readmeRes = await fetch(`${RAW_BASE}/${dir.name}/README.md`)
            if (!readmeRes.ok) {
              return { dir: dir.name, name: formatDirName(dir.name), description: '', features: [] }
            }
            const readmeText = await readmeRes.text()
            const parsed = parseReadme(readmeText)
            return {
              dir: dir.name,
              name: parsed.name || formatDirName(dir.name),
              description: parsed.description,
              features: parsed.features,
            }
          } catch {
            return { dir: dir.name, name: formatDirName(dir.name), description: '', features: [] }
          }
        })
      )

      setPlugins(pluginData)
    } catch (err) {
      console.error(err)
      setError('Could not load Claude Plugins at this time.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlugins()
  }, [fetchPlugins])

  return (
    <section className="section" id="plugins">
      <div className="section-header">
        <div className="section-label">Claude Plugins</div>
        <h2 className="section-title">Built for Claude</h2>
        <p className="section-subtitle">
          Custom plugins I've built for Claude — automatically pulled from my{' '}
          <a
            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            Claude-Plugins
          </a>{' '}
          repo.
        </p>
      </div>

      {loading && (
        <div className="plugins-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPluginCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchPlugins}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="plugins-grid">
          {plugins.map((plugin) => (
            <PluginCard key={plugin.dir} plugin={plugin} />
          ))}
        </div>
      )}
    </section>
  )
}
