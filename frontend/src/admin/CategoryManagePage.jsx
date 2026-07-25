import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { categoriesApi } from '../api/categories'

export default function CategoryManagePage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const fetch = () => {
    setLoading(true)
    categoriesApi.list()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false))
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
    } catch (err) {
      message.error(err.response?.data?.detail || '创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          新建分类
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={categories}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '名称', dataIndex: 'name' },
          { title: 'Slug', dataIndex: 'slug' },
          { title: '描述', dataIndex: 'description', ellipsis: true },
          { title: '文章数', dataIndex: 'post_count', width: 80 },
          {
            title: '创建时间', dataIndex: 'created_at', width: 120,
            render: (v) => v ? new Date(v).toLocaleDateString() : '-',
          },
        ]}
      />

      <Modal
        title="新建分类"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
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
    </>
  )
}
