import { useState, useEffect } from 'react'

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
    // Extract title from first h1 or h2
    if (!name && /^#{1,2}\s+/.test(line)) {
      name = line.replace(/^#{1,2}\s+/, '').trim()
      continue
    }

    // Look for description — first non-empty paragraph after title
    if (name && !description && line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) {
      // Skip lines that look like metadata
      if (/^\*\*/.test(line.trim()) || /^>/.test(line.trim())) continue
      description = line.trim()
      continue
    }

    // Collect features from Key Features or Features section
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

export default function ClaudePlugins() {
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        // Fetch repo contents to find plugin directories
        const res = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`
        )
        if (!res.ok) throw new Error('Failed to fetch plugin list')
        const contents = await res.json()

        // Filter to directories only (exclude dotfiles, LICENSE, README, etc.)
        const dirs = contents.filter(
          item => item.type === 'dir' && !item.name.startsWith('.')
        )

        // Fetch README for each plugin directory
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
    }

    fetchPlugins()
  }, [])

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
        <div className="section-subtitle" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Loading plugins from GitHub...
        </div>
      )}

      {error && (
        <div className="section-subtitle" style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--accent)' }}>
          {error}
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
