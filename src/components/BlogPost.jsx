import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import PostAudioPlayer from './PostAudioPlayer'
import SideRail from './SideRail'
import CursorGlow from './CursorGlow'

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

function BlogPost() {
    const { id } = useParams()
    const [content, setContent] = useState('')
    const [meta, setMeta] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadPost = async () => {
            try {
                const markdownFiles = import.meta.glob('../posts/*.md', {
                    query: '?raw',
                    import: 'default',
                })

                for (const path in markdownFiles) {
                    try {
                        const rawContent = await markdownFiles[path]()
                        const { data, content } = parseFrontmatter(rawContent)
                        const filenameSlug = path.split('/').pop().replace('.md', '')
                        const slug = data.slug || filenameSlug
                        if (slug === id || slug === decodeURIComponent(id)) {
                            setContent(content)
                            setMeta(data)
                            setLoading(false)
                            return
                        }
                    } catch (innerErr) {
                        console.warn(`Skipping malformed post at ${path}:`, innerErr)
                    }
                }
                throw new Error('Post not found')
            } catch (err) {
                console.error(err)
                setError('Could not load the blog post. It may have been moved or deleted.')
                setLoading(false)
            }
        }

        loadPost()
    }, [id])

    if (loading) {
        return (
            <div className="h-post">
                <CursorGlow />
                <SideRail />
                <main>
                    <div className="h-wrap h-post-wrap">
                        <div className="h-post-loading">Loading article…</div>
                    </div>
                </main>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-post">
                <CursorGlow />
                <SideRail />
                <main>
                    <div className="h-wrap h-post-wrap">
                        <div className="h-post-error">
                            <h1>Oops!</h1>
                            <p>{error}</p>
                            <Link to="/" className="h-btn h-btn--ghost">
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="h-post">
            <CursorGlow />
            <SideRail />
            <main>
                <div className="h-wrap h-post-wrap">
                    <nav className="h-post-nav">
                        <Link to="/#blog" className="h-post-back">
                            ← Back to writing
                        </Link>
                    </nav>

                    <article className="h-post-article">
                        {meta.title && (
                            <header className="h-post-header">
                                <div className="h-post-meta">
                                    {meta.label && <span className="h-post-meta__tag">● {meta.label}</span>}
                                    {meta.date && <span>{meta.date}</span>}
                                    {meta.readTime && <span>{meta.readTime}</span>}
                                </div>
                                <h1 className="h-post-title">{meta.title}</h1>
                                {meta.excerpt && (
                                    <p className="h-post-lede">{meta.excerpt}</p>
                                )}
                            </header>
                        )}

                        <PostAudioPlayer text={content} />

                        <div className="h-post-body">
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                            >
                                {String(content)}
                            </ReactMarkdown>
                        </div>
                    </article>

                    <footer className="h-site-footer">
                        <span>© 2026 Steven Mojica · Redlands, CA</span>
                        <div className="h-site-footer__links">
                            <Link to="/">/home</Link>
                            <Link to="/about">/about</Link>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    )
}

export default BlogPost
