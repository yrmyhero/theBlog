import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spin, Divider, Result } from 'antd'
import { ClockCircleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { postsApi } from '../api/posts'

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    postsApi.getBySlug(slug)
      .then((res) => setPost(res.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div>
  if (!post) return <Result status="404" title="文章不存在" />

  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* 文章头部 */}
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        {/* 分类标签 */}
        {post.category && (
          <Link to={`/category/${post.category.slug}`} style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--accent)',
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16,
          }}>
            {post.category.name}
          </Link>
        )}

        {/* 标题 */}
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, lineHeight: 1.25,
          color: 'var(--text-primary)', marginBottom: 20, letterSpacing: -0.5,
        }}>
          {post.title}
        </h1>

        {/* 元信息 */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 20,
          color: 'var(--text-muted)', fontSize: 13,
        }}>
          <span><UserOutlined /> {post.author?.username}</span>
          <span><ClockCircleOutlined /> {new Date(post.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}</span>
          <span><EyeOutlined /> {post.view_count} 次阅读</span>
        </div>
      </header>

      {/* 封面图 */}
      {post.cover_image && (
        <img src={post.cover_image} alt="" style={{
          width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 14, marginBottom: 40,
        }} />
      )}

      {/* 标签 */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {post.tags.map((t) => (
            <span key={t.id} style={{
              padding: '4px 14px', borderRadius: 20, fontSize: 12,
              background: 'var(--bg-glass-hover)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-glass)',
            }}>{t.name}</span>
          ))}
        </div>
      )}

      <Divider style={{ borderColor: 'var(--border-glass)', marginBottom: 40 }} />

      {/* 正文 — 阅读优化 */}
      <div style={{
        fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: 1.95,
        color: 'var(--text-primary)', wordBreak: 'break-word',
      }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {/* 文章尾部 */}
      <Divider style={{ borderColor: 'var(--border-glass)', marginTop: 48 }} />
      <div style={{
        textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13,
      }}>
        <p>— EOF —</p>
        <p style={{ marginTop: 8 }}>
          发布于 {new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </article>
  )
}
