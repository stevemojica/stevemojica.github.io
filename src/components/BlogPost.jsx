import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

function BlogPost() {
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the raw markdown file from the public/posts directory
        fetch(`/posts/${id}.md`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Post not found');
                }
                return res.text();
            })
            .then((text) => {
                setContent(text);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load the blog post. It may have been moved or deleted.');
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="blog-post-page">
                <div className="blog-post-container loading-state">
                    Loading article...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-post-page">
                <div className="blog-post-container error-state">
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <Link to="/" className="hero-link hero-link--secondary">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-post-page">
            <nav className="blog-nav">
                <Link to="/" className="back-link">
                    &larr; Back
                </Link>
            </nav>
            <article className="blog-post-container">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    className="markdown-body"
                >
                    {content}
                </ReactMarkdown>
            </article>
        </div>
    );
}

export default BlogPost;
