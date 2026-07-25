import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spin, Tag, Divider, Result } from 'antd'
import { ClockCircleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
  if (!post) return <Result status="404" title="文章不存在" subTitle="请检查链接是否正确" />

  return (
    <article style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>{post.title}</h1>

      <div style={{ color: '#999', marginBottom: 24 }}>
        <span><UserOutlined /> {post.author?.username}</span>
        <span style={{ marginLeft: 16 }}><ClockCircleOutlined /> {new Date(post.created_at).toLocaleString()}</span>
        <span style={{ marginLeft: 16 }}><EyeOutlined /> {post.view_count} 次阅读</span>
      </div>

      {post.category && (
        <Tag color="green" style={{ marginBottom: 12 }}>
          <Link to={`/category/${post.category.slug}`}>{post.category.name}</Link>
        </Tag>
      )}
      {post.tags?.map((t) => (
        <Tag key={t.id} color="blue" style={{ marginBottom: 12 }}>{t.name}</Tag>
      ))}

      <Divider />

      <div style={{ lineHeight: 1.8, fontSize: 16 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
