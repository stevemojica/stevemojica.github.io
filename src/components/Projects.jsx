import { useState, useEffect, useCallback } from 'react'
import ContribGraph from './ContribGraph'

function SkeletonCard() {
  return (
    <div className="project-card skeleton-card" aria-hidden="true">
      <div className="project-card-header">
        <span className="skeleton-line" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
        <span className="skeleton-line" style={{ width: '60px', height: '20px', borderRadius: '20px' }} />
      </div>
      <div className="skeleton-line" style={{ width: '70%', height: '1.1rem', marginBottom: '0.75rem' }} />
      <div className="skeleton-line" style={{ width: '100%', height: '0.85rem', marginBottom: '0.4rem' }} />
      <div className="skeleton-line" style={{ width: '85%', height: '0.85rem', marginBottom: '1.5rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span className="skeleton-line" style={{ width: '50px', height: '20px', borderRadius: '20px' }} />
        <span className="skeleton-line" style={{ width: '60px', height: '16px' }} />
      </div>
    </div>
  )
}

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRepos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        'https://api.github.com/users/stevemojica/repos?sort=updated&per_page=6'
      )
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      console.error(err)
      setError('Could not load GitHub projects at this time.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepos()
  }, [fetchRepos])

  return (
    <section className="section" id="projects">
      <div className="section-header">
        <div className="section-label">Open Source</div>
        <h2 className="section-title">GitHub Portfolio</h2>
        <p className="section-subtitle">
          A showcase of my open-source tools, contributions, and personal projects.
        </p>
      </div>

      {loading && (
        <div className="projects-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchRepos}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="projects-grid">
          {projects.map((repo) => (
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card"
              key={repo.id}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
            >
              <div className="project-card-header">
                <span className="project-icon">&#128206;</span>
                <span className={`project-badge project-badge--${repo.stargazers_count > 5 ? 'featured' : 'public'}`}>
                  {repo.stargazers_count > 5 ? 'Featured' : 'Public'}
                </span>
              </div>
              <div className="project-name" style={{ overflowWrap: 'break-word' }}>{repo.name}</div>
              <div className="project-desc" style={{ flexGrow: 1 }}>
                {repo.description || 'No description provided on GitHub.'}
              </div>
              <div className="project-footer">
                <div className="project-tech">
                  {repo.language && (
                    <span className="tech-tag">
                      {repo.language}
                    </span>
                  )}
                </div>
                <div className="project-stats">
                  <span className="project-stat">&#9734; {repo.stargazers_count}</span>
                  <span className="project-stat">&#9906; {repo.forks_count}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <ContribGraph />
    </section>
  )
}

export default Projects
