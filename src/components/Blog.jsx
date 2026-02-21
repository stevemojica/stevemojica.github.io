import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import matter from 'gray-matter';

function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Dynamically load all .md files in the src/posts directory as raw text strings
    const markdownFiles = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default' });

    const fetchPosts = async () => {
      const postsArray = [];

      for (const path in markdownFiles) {
        // Execute the loader function to get the raw module text
        const rawContent = await markdownFiles[path]();

        // Parse the YAML frontmatter
        const { data } = matter(rawContent);

        // We ensure a 'slug' exists. If it isn't in frontmatter, we extract it from the filename
        const filenameSlug = path.split('/').pop().replace('.md', '');
        const slug = data.slug || filenameSlug;

        // Push valid posts
        if (data.title) {
          postsArray.push({
            slug,
            category: data.category || 'coding',
            label: data.label || 'Note',
            date: data.date || '',
            readTime: data.readTime || '',
            title: data.title,
            excerpt: data.excerpt || '',
          });
        }
      }

      // Sort by date or whatever criteria you'd like (here we just reverse so newest is likely first based on reads)
      setPosts(postsArray.reverse());
    };

    fetchPosts();
  }, []);
  return (
    <section className="section" id="blog">
      <div className="section-header">
        <div className="section-label">The Blog</div>
        <h2 className="section-title">Documenting the Journey</h2>
        <p className="section-subtitle">
          Thoughts on coding, open-source work, AI, and professional IT life.
        </p>
      </div>

      <div className="blog-grid">
        {posts.map((post) => (
          <Link to={`/post/${post.slug}`} key={post.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article className="blog-card">
              <div className="blog-card-meta">
                <span className={`blog-category blog-category--${post.category}`}>
                  {post.label}
                </span>
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <span className="blog-read-more">
                Read more &rarr;
              </span>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Blog
