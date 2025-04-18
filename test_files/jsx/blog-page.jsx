// blog-page.jsx
import React from 'react';

// Missing Partial Prerendering configuration
export default function BlogPage() {
  return (
    <div className="blog-page">
      <BlogHeader />
      <FeaturedPosts />
      <RecentPosts />
      <PopularTags />
      <Newsletter />
    </div>
  );
}

// Static content that could be part of the static shell
function BlogHeader() {
  return (
    <header className="blog-header">
      <h1>Our Blog</h1>
      <p>Insights, updates, and stories from our team</p>
    </header>
  );
}

// Dynamic content that could be loaded later
function FeaturedPosts() {
  const [posts, setPosts] = React.useState([]);
  
  React.useEffect(() => {
    fetch('/api/posts/featured')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);
  
  return (
    <section className="featured-posts">
      <h2>Featured Posts</h2>
      <div className="post-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card featured">
            <img src={post.image || "/placeholder.svg"} alt={post.title} />
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <a href={`/blog/${post.slug}`}>Read more</a>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentPosts() {
  const [posts, setPosts] = React.useState([]);
  
  React.useEffect(() => {
    fetch('/api/posts/recent')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);
  
  return (
    <section className="recent-posts">
      <h2>Recent Posts</h2>
      <div className="post-list">
        {posts.map(post => (
          <div key={post.id} className="post-item">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="post-meta">
              <span>{post.date}</span>
              <span>{post.author}</span>
            </div>
            <a href={`/blog/${post.slug}`}>Read more</a>
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularTags() {
  const [tags, setTags] = React.useState([]);
  
  React.useEffect(() => {
    fetch('/api/tags/popular')
      .then(res => res.json())
      .then(data => setTags(data));
  }, []);
  
  return (
    <section className="popular-tags">
      <h2>Popular Tags</h2>
      <div className="tag-cloud">
        {tags.map(tag => (
          <a key={tag.id} href={`/blog/tag/${tag.slug}`} className="tag">
            {tag.name} ({tag.count})
          </a>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = React.useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };
  
  return (
    <section className="newsletter">
      <h2>Subscribe to our Newsletter</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Enter your email" 
          required 
        />
        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
}