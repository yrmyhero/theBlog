import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spin, Empty } from 'antd'
import { EyeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { postsApi } from '../api/posts'

export default function CategoryPage() {
  const { slug } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    postsApi.list({ category: slug, page_size: 50 })
      .then((res) => setPosts(res.data.items))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!posts.length) return <Empty description="该分类下暂无文章" />

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>
        📂 {slug}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {posts.map((post) => (
          <Link key={post.id} to={`/post/${post.slug}`} style={{ color: 'inherit' }}>
            <article style={{
              display: 'flex', gap: 20, padding: '20px 0',
              borderBottom: '1px solid var(--border-glass)',
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {post.is_top && '📌 '}{post.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                  {post.summary}
                </p>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span><ClockCircleOutlined /> {new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span><EyeOutlined /> {post.view_count} 阅读</span>
                </div>
              </div>
              {post.cover_image && (
                <img src={post.cover_image} alt="" className="post-cover-img" style={{
                  width: 160, height: 100, objectFit: 'cover', borderRadius: 10, flexShrink: 0,
                }} />
              )}
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
