import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Pagination, Tag, Spin, Empty } from 'antd'
import { EyeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { postsApi } from '../api/posts'
import { categoriesApi } from '../api/categories'
import { tagsApi } from '../api/tags'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 6

  useEffect(() => {
    postsApi.list({ page, page_size: pageSize })
      .then((res) => { setPosts(res.data.items); setTotal(res.data.total) })
      .finally(() => setLoading(false))
    categoriesApi.list().then((res) => setCategories(res.data))
    tagsApi.list().then((res) => setTags(res.data))
  }, [page])

  return (
    <Row gutter={24}>
      {/* 文章列表 */}
      <Col xs={24} md={18}>
        <Spin spinning={loading}>
          {posts.length === 0 && !loading ? (
            <Empty description="暂无文章" />
          ) : (
            <Row gutter={[16, 16]}>
              {posts.map((post) => (
                <Col xs={24} sm={12} key={post.id}>
                  <Card
                    hoverable
                    title={post.is_top ? `📌 ${post.title}` : post.title}
                    extra={<Link to={`/post/${post.slug}`}>阅读</Link>}
                  >
                    <p style={{ color: '#666', minHeight: 44 }}>
                      {post.summary || post.content?.replace(/[#*>`]/g, '').slice(0, 100) + '...'}
                    </p>
                    {post.tags?.map((t) => (
                      <Tag key={t.id} color="blue">{t.name}</Tag>
                    ))}
                    <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
                      <span><ClockCircleOutlined /> {new Date(post.created_at).toLocaleDateString()}</span>
                      <span style={{ marginLeft: 12 }}><EyeOutlined /> {post.view_count}</span>
                      {post.category && (
                        <Tag style={{ float: 'right' }}>{post.category.name}</Tag>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        {total > pageSize && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </Col>

      {/* 侧边栏 */}
      <Col xs={24} md={6}>
        <Card title="分类" size="small" style={{ marginBottom: 16 }}>
          {categories.map((c) => (
            <Tag key={c.id} style={{ marginBottom: 8 }}>
              <Link to={`/category/${c.slug}`}>{c.name} ({c.post_count})</Link>
            </Tag>
          ))}
        </Card>
        <Card title="标签" size="small">
          {tags.map((t) => (
            <Tag key={t.id} color="blue" style={{ marginBottom: 8 }}>
              {t.name} ({t.post_count})
            </Tag>
          ))}
        </Card>
      </Col>
    </Row>
  )
}
