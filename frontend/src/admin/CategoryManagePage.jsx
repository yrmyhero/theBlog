import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, message, Space } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoriesApi } from '../api/categories'

export default function CategoryManagePage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const fetch = () => {
    setLoading(true)
    categoriesApi.list().then((res) => setCategories(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const handleCreate = async (values) => {
    setSubmitting(true)
    try {
      await categoriesApi.create(values)
      message.success('分类已创建')
      setOpen(false)
      form.resetFields()
      fetch()
    } catch (err) { message.error(err.response?.data?.detail || '创建失败') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await categoriesApi.delete(id)
      message.success('已删除')
      fetch()
    } catch { message.error('删除失败') }
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}
          style={{ borderRadius: 8, background: 'var(--accent)', border: 'none', boxShadow: '0 0 16px var(--accent-glow)' }}>
          新建分类
        </Button>
      </div>

      <Table rowKey="id" loading={loading} dataSource={categories} pagination={false}
        locale={{ emptyText: '暂无分类' }}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: 'Slug', dataIndex: 'slug' },
          { title: '描述', dataIndex: 'description', ellipsis: true },
          { title: '文章数', dataIndex: 'post_count', width: 80 },
          { title: '创建时间', dataIndex: 'created_at', width: 110,
            render: (v) => v ? new Date(v).toLocaleDateString('zh-CN') : '-',
          },
          { title: '操作', width: 80,
            render: (_, record) => (
              <Popconfirm title="确定删除？该分类下的文章不会被删除" onConfirm={() => handleDelete(record.id)}>
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]}
      />

      <Modal title="新建分类" open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} confirmLoading={submitting}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：Python" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input placeholder="如：python" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
