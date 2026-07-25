import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { postsApi } from '../api/posts'

export default function PostListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 10 })
  const navigate = useNavigate()

  const fetchPosts = (page = 1, pageSize = 10) => {
    setLoading(true)
    postsApi.list({ page, page_size: pageSize })
      .then((res) => {
        setPosts(res.data.items)
        setPagination((p) => ({ ...p, current: page, total: res.data.total }))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

  const handleDelete = async (id) => {
    try {
      await postsApi.delete(id)
      message.success('已删除')
      fetchPosts(pagination.current, pagination.pageSize)
    } catch {
      message.error('删除失败')
    }
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>文章管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/posts/new')}
          style={{ borderRadius: 8, background: 'var(--accent)', border: 'none', boxShadow: '0 0 16px var(--accent-glow)' }}>
          写文章
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={posts}
        pagination={{
          ...pagination, showSizeChanger: false,
          onChange: (page, pageSize) => fetchPosts(page, pageSize),
        }}
        locale={{ emptyText: '暂无文章' }}
        columns={[
          { title: '标题', dataIndex: 'title', ellipsis: true,
            render: (text, record) => (
              <a onClick={() => navigate(`/admin/posts/${record.id}/edit`)}
                style={{ color: 'var(--accent)', cursor: 'pointer' }}>{text}</a>
            ),
          },
          { title: '分类', dataIndex: ['category', 'name'], width: 100,
            render: (v) => v ? <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, background: 'var(--accent-glow)', color: 'var(--accent)' }}>{v}</span> : '-',
          },
          { title: '发布', dataIndex: 'is_published', width: 70,
            render: (v) => <span style={{ color: v ? 'var(--success)' : 'var(--text-muted)', fontSize: 12 }}>{v ? '● 是' : '○ 草稿'}</span>,
          },
          { title: '置顶', dataIndex: 'is_top', width: 70,
            render: (v) => v ? <span style={{ color: '#ffa502', fontSize: 12 }}>📌</span> : '-',
          },
          { title: '阅读', dataIndex: 'view_count', width: 70 },
          { title: '创建时间', dataIndex: 'created_at', width: 110,
            render: (v) => v ? new Date(v).toLocaleDateString('zh-CN') : '-',
          },
          { title: '操作', width: 100,
            render: (_, record) => (
              <Space>
                <Button type="text" size="small" icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/posts/${record.id}/edit`)} />
                <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  )
}
