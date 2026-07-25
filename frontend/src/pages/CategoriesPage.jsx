import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Spin, Empty } from 'antd'
import { FolderOutlined, FileTextOutlined } from '@ant-design/icons'
import { categoriesApi } from '../api/categories'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!categories.length) return <Empty description="暂无分类" />

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>
        <FolderOutlined /> 全部分类
      </h2>
      <Row gutter={[20, 20]}>
        {categories.map((c) => (
          <Col xs={24} sm={12} md={8} key={c.id}>
            <Link to={`/category/${c.slug}`}>
              <div style={{
                padding: 28, borderRadius: 14, border: '1px solid var(--border-glass)',
                transition: 'all 0.25s', cursor: 'pointer',
                background: 'var(--bg-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.transform = '';
              }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, minHeight: 20 }}>
                  {c.description || '暂无描述'}
                </p>
                <span style={{
                  fontSize: 12, color: 'var(--text-muted)',
                  padding: '4px 12px', borderRadius: 20,
                  background: 'var(--bg-glass-hover)',
                }}>
                  <FileTextOutlined /> {c.post_count} 篇文章
                </span>
              </div>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  )
}
