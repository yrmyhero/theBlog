import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spin, Divider, Result } from 'antd'
import { ClockCircleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { postsApi } from '../api/posts'
import { slug as slugify } from 'github-slugger'

// 外链渲染器：新窗口打开
function LinkRenderer({ href, children, ...props }) {
  if (!href) return <a {...props}>{children}</a>
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  }
  return <a href={href} {...props}>{children}</a>
}

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const articleRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    postsApi.getBySlug(slug)
      .then((res) => setPost(res.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  // 渲染完成后，DOM 操作：给标题加 id + 给锚点链接绑点击滚动
  useEffect(() => {
    if (!post || !articleRef.current) return
    const article = articleRef.current

    // 1. 每个标题用 textContent 生成 github-slugger 格式 id
    article.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      if (!h.id) h.id = slugify(h.textContent || '')
    })

    // 2. 每个 #锚点链接绑点击 → scrollIntoView
    const links = article.querySelectorAll('a[href^="#"]')
    const scrollTo = (e) => {
      const id = e.currentTarget.getAttribute('href').slice(1)
      const el = document.getElementById(id)
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    links.forEach(a => a.addEventListener('click', scrollTo))
    return () => links.forEach(a => a.removeEventListener('click', scrollTo))
  }, [post])

  if (loading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div>
  if (!post) return <Result status="404" title="文章不存在" />

  return (
    <article ref={articleRef} style={{ maxWidth: 860, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        {post.category && (
          <Link to={`/category/${post.category.slug}`} style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--accent)',
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16,
          }}>
            {post.category.name}
          </Link>
        )}
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, lineHeight: 1.25,
          color: 'var(--text-primary)', marginBottom: 20, letterSpacing: -0.5,
        }}>
          {post.title}
        </h1>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap',
          color: 'var(--text-muted)', fontSize: 13,
        }}>
          <span><UserOutlined /> {post.author?.username}</span>
          <span><ClockCircleOutlined /> {new Date(post.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}</span>
          <span><EyeOutlined /> {post.view_count} 次阅读</span>
        </div>
      </header>

      {post.cover_image && (
        <img src={post.cover_image} alt="" style={{
          width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 14, marginBottom: 40,
        }} />
      )}

      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
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

      <div style={{
        fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: 1.95,
        color: 'var(--text-primary)', wordBreak: 'break-word',
      }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{ a: LinkRenderer }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

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
