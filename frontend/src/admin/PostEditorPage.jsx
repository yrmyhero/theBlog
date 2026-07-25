import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Switch, Button, message, Spin, Card, Row, Col } from 'antd'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { postsApi } from '../api/posts'
import { categoriesApi } from '../api/categories'
import { tagsApi } from '../api/tags'

export default function PostEditorPage() {
  const { postId } = useParams()
  const isEdit = !!postId
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [content, setContent] = useState('')

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data))
    tagsApi.list().then((res) => setTags(res.data))

    if (isEdit) {
      postsApi.getById(Number(postId))
        .then((res) => {
          const post = res.data
          form.setFieldsValue({
            title: post.title,
            summary: post.summary,
            cover_image: post.cover_image,
            is_published: post.is_published,
            is_top: post.is_top,
            category_id: post.category?.id,
            tag_ids: post.tags?.map((t) => t.id) || [],
          })
          setContent(post.content || '')
        })
        .catch(() => message.error('加载文章失败'))
        .finally(() => setFetching(false))
    }
  }, [postId])

  const onFinish = async (values) => {
    setLoading(true)
    const payload = { ...values, content }
    try {
      if (isEdit) {
        await postsApi.update(Number(postId), payload)
        message.success('更新成功')
      } else {
        await postsApi.create(payload)
        message.success('发布成功')
      }
      navigate('/admin/posts')
    } catch (err) {
      message.error(err.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>

  return (
    <>
      <h2>{isEdit ? '编辑文章' : '写文章'}</h2>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}>
              <Input placeholder="文章标题" size="large" />
            </Form.Item>

            <Form.Item name="summary" label="摘要">
              <Input.TextArea rows={2} placeholder="不填则自动截取正文前段" />
            </Form.Item>

            <Form.Item label="正文（Markdown）" required>
              <Input.TextArea
                rows={16} value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="支持 Markdown 语法..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="category_id" label="分类">
                  <Select allowClear placeholder="选择分类">
                    {categories.map((c) => (
                      <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="tag_ids" label="标签">
                  <Select mode="multiple" allowClear placeholder="选择标签">
                    {tags.map((t) => (
                      <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="is_published" label="发布" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="is_top" label="置顶" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="cover_image" label="封面图 URL">
              <Input placeholder="https://..." />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} size="large">
              {isEdit ? '保存修改' : '发布文章'}
            </Button>
          </Form>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="预览" size="small" style={{ position: 'sticky', top: 80 }}>
            <div style={{ lineHeight: 1.7, maxHeight: '70vh', overflow: 'auto' }}>
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p style={{ color: '#999' }}>在左侧输入内容，这里会实时预览...</p>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}
