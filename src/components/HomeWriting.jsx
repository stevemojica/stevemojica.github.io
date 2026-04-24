import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { data: {}, content: markdown }
  const yamlString = match[1]
  const data = {}
  yamlString.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1)
      }
      data[key] = value
    }
  })
  return { data, content: markdown.slice(match[0].length).trim() }
}

function HomeWriting() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const files = import.meta.glob('../posts/*.md', {
      query: '?raw',
      import: 'default',
    })

    const load = async () => {
      const collected = []
      for (const path in files) {
        try {
          const raw = await files[path]()
          const { data } = parseFrontmatter(raw)
          if (!data.title) continue
          const filenameSlug = path.split('/').pop().replace('.md', '')
          collected.push({
            slug: data.slug || filenameSlug,
            title: data.title,
            excerpt: data.excerpt || '',
            date: data.date || '',
            readTime: data.readTime || '',
            label: data.label || (data.category ? data.category.toLowerCase() : 'post'),
          })
        } catch (err) {
          console.warn(`Skipping malformed post at ${path}`, err)
        }
      }
      setPosts(collected.reverse())
    }

    load()
  }, [])

  const [featured, ...rest] = useMemo(() => posts, [posts])
  const preview = rest.slice(0, 5)

  if (posts.length === 0) return null

  return (
    <section className="h-section" id="blog">
      <div className="h-wrap">
        <div className="h-s-head h-s-head--split">
          <div>
            <div className="h-s-kicker">
              <span className="h-s-kicker__num">03</span>
              <span>/writing · essays &amp; field notes</span>
            </div>
            <h2 className="h-s-title">
              What I'm <em>thinking about.</em>
            </h2>
          </div>
          <p className="h-s-subtitle">
            Notes from the K-12 IT trenches, the home lab, and what local LLMs can
            actually do when a real Tuesday helpdesk queue shows up.
          </p>
        </div>

        {featured && (
          <Link to={`/post/${featured.slug}`} className="h-writing-feature">
            <div className="h-writing-feature__meta">
              <span className="h-writing-feature__tag">● {featured.label}</span>
              {featured.date && <span>{featured.date}</span>}
              {featured.readTime && <span>{featured.readTime}</span>}
            </div>
            <h3 className="h-writing-feature__title">{featured.title}</h3>
            {featured.excerpt && (
              <p className="h-writing-feature__excerpt">{featured.excerpt}</p>
            )}
            <span className="h-writing-feature__cta">
              Read essay <span className="h-arr">→</span>
            </span>
          </Link>
        )}

        {preview.length > 0 && (
          <ul className="h-writing-list">
            {preview.map((post) => (
              <li key={post.slug} className="h-writing-item">
                <Link to={`/post/${post.slug}`} className="h-writing-item__link">
                  <div className="h-writing-item__meta">
                    <span className="h-writing-item__tag">{post.label}</span>
                    {post.date && <span>{post.date}</span>}
                  </div>
                  <h4 className="h-writing-item__title">{post.title}</h4>
                  {post.excerpt && (
                    <p className="h-writing-item__excerpt">{post.excerpt}</p>
                  )}
                  <span className="h-writing-item__cta">Read →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default HomeWriting
