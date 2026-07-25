import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Tag, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { postsApi } from '../api/posts'

export default function PostListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 10 })
  const navigate = useNavigate()

  const fetchPosts = (page = 1, pageSize = 10) => {
    setLoading(true)
    // 管理端查全部文章（含未发布）
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
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>文章管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/posts/new')}>
          写文章
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={posts}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          onChange: (page, pageSize) => fetchPosts(page, pageSize),
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '标题', dataIndex: 'title', ellipsis: true,
            render: (text, record) => (
              <a onClick={() => navigate(`/admin/posts/${record.id}/edit`)}>{text}</a>
            ),
          },
          { title: '分类', dataIndex: ['category', 'name'], width: 100,
            render: (v) => v ? <Tag>{v}</Tag> : '-',
          },
          { title: '发布', dataIndex: 'is_published', width: 70,
            render: (v) => v ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>,
          },
          { title: '置顶', dataIndex: 'is_top', width: 70,
            render: (v) => v ? <Tag color="orange">是</Tag> : '-',
          },
          { title: '阅读', dataIndex: 'view_count', width: 70 },
          {
            title: '创建时间', dataIndex: 'created_at', width: 120,
            render: (v) => v ? new Date(v).toLocaleDateString() : '-',
          },
          {
            title: '操作', width: 120,
            render: (_, record) => (
              <Space>
                <Button size="small" icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/posts/${record.id}/edit`)} />
                <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </>
  )
}
