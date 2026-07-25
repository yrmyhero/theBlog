import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { List, Tag, Spin, Empty } from 'antd'
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

  if (loading) return <Spin />
  if (!posts.length) return <Empty description={`分类 "${slug}" 下暂无文章`} />

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>分类：{slug}</h2>
      <List
        itemLayout="vertical"
        dataSource={posts}
        renderItem={(post) => (
          <List.Item
            key={post.id}
            extra={post.cover_image && <img width={150} src={post.cover_image} alt="" />}
          >
            <List.Item.Meta
              title={<Link to={`/post/${post.slug}`}>{post.is_top ? `📌 ` : ''}{post.title}</Link>}
              description={
                <span>
                  <ClockCircleOutlined /> {new Date(post.created_at).toLocaleDateString()}
                  <span style={{ marginLeft: 12 }}><EyeOutlined /> {post.view_count}</span>
                </span>
              }
            />
            <p style={{ color: '#666' }}>{post.summary}</p>
            {post.tags?.map((t) => (
              <Tag key={t.id} color="blue">{t.name}</Tag>
            ))}
          </List.Item>
        )}
      />
    </>
  )
}
