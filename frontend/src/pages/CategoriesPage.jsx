import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Spin, Empty } from 'antd'
import { FolderOutlined } from '@ant-design/icons'
import { categoriesApi } from '../api/categories'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.list()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spin />
  if (!categories.length) return <Empty description="暂无分类" />

  return (
    <Row gutter={[16, 16]}>
      {categories.map((c) => (
        <Col xs={24} sm={12} md={8} key={c.id}>
          <Link to={`/category/${c.slug}`}>
            <Card hoverable>
              <h3><FolderOutlined /> {c.name}</h3>
              <p style={{ color: '#666' }}>{c.description || '暂无描述'}</p>
              <span style={{ color: '#999' }}>{c.post_count} 篇文章</span>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  )
}
