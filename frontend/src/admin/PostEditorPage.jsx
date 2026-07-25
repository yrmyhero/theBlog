import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Switch, Button, message, Spin, Row, Col, Modal } from 'antd'
import { PictureOutlined, FileTextOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { postsApi } from '../api/posts'
import { categoriesApi } from '../api/categories'
import { tagsApi } from '../api/tags'
import { uploadApi } from '../api/upload'

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

  // 新建分类弹窗
  const [catOpen, setCatOpen] = useState(false)
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')

  // 新建标签弹窗
  const [tagOpen, setTagOpen] = useState(false)
  const [tagName, setTagName] = useState('')
  const [tagSlug, setTagSlug] = useState('')

  const imgRef = useRef(null)
  const mdRef = useRef(null)
  const coverRef = useRef(null)

  const refreshCategories = () => categoriesApi.list().then((r) => setCategories(r.data))
  const refreshTags = () => tagsApi.list().then((r) => setTags(r.data))

  useEffect(() => {
    refreshCategories()
    refreshTags()
    if (isEdit) {
      postsApi.getById(Number(postId))
        .then((res) => {
          const post = res.data
          form.setFieldsValue({
            title: post.title, summary: post.summary, cover_image: post.cover_image,
            is_published: post.is_published, is_top: post.is_top,
            category_id: post.category?.id,
            tag_ids: post.tags?.map((t) => t.id) || [],
          })
          setContent(post.content || '')
        })
        .catch(() => message.error('加载文章失败'))
        .finally(() => setFetching(false))
    }
  }, [postId])

  const [imgUploading, setImgUploading] = useState(false)
  const [mdUploading, setMdUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const showErr = (err, fallback) => {
    message.error(err?.response?.data?.detail || fallback)
  }

  // ── 上传文件（按钮和拖拽共用）──
  const uploadFile = async (file) => {
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(file.name)
    const isMd = /\.(md|markdown|txt)$/i.test(file.name)

    if (isImage) {
      setImgUploading(true)
      try {
        const res = await uploadApi.image(file)
        setContent((c) => c + `\n![${file.name}](${res.data.url})\n`)
        message.success('图片已插入')
      } catch (err) { showErr(err, '图片上传失败') }
      finally { setImgUploading(false) }
    } else if (isMd) {
      setMdUploading(true)
      try {
        const res = await uploadApi.markdown(file)
        setContent(res.data.content)
        message.success('文件已导入')
      } catch (err) { showErr(err, '文件导入失败') }
      finally { setMdUploading(false) }
    } else {
      message.warning('仅支持图片（png/jpg/gif/webp/svg）或 Markdown（.md）文件')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) uploadFile(file)
  }

  // ── 按钮上传 ──
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) { await uploadFile(file); e.target.value = '' }
  }

  const handleMdUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) { await uploadFile(file); e.target.value = '' }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadApi.image(file)
      form.setFieldValue('cover_image', res.data.url)
      message.success('封面上传成功')
    } catch (err) { showErr(err, '上传失败') }
    finally { e.target.value = '' }
  }

  // ── 快速创建分类 ──
  const createCategory = async () => {
    if (!catName || !catSlug) return message.warning('名称和 slug 都必填')
    try {
      const res = await categoriesApi.create({ name: catName, slug: catSlug })
      await refreshCategories()
      form.setFieldValue('category_id', res.data.id)
      setCatOpen(false)
      setCatName(''); setCatSlug('')
      message.success('分类已创建')
    } catch (err) { showErr(err, '创建分类失败') }
  }

  // ── 快速创建标签 ──
  const createTag = async () => {
    if (!tagName || !tagSlug) return message.warning('名称和 slug 都必填')
    try {
      const res = await tagsApi.create({ name: tagName, slug: tagSlug })
      await refreshTags()
      const current = form.getFieldValue('tag_ids') || []
      form.setFieldValue('tag_ids', [...current, res.data.id])
      setTagOpen(false)
      setTagName(''); setTagSlug('')
      message.success('标签已创建')
    } catch (err) { showErr(err, '创建标签失败') }
  }

  const onFinish = async (values) => {
    setLoading(true)
    const payload = { ...values, content }
    try {
      if (isEdit) { await postsApi.update(Number(postId), payload); message.success('更新成功') }
      else { await postsApi.create(payload); message.success('发布成功') }
      navigate('/admin/posts')
    } catch (err) { message.error(err.response?.data?.detail || '操作失败') }
    finally { setLoading(false) }
  }

  if (fetching) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>

  const glassInput = { background: 'var(--bg-glass)', borderColor: 'var(--border-glass)', borderRadius: 8 }

  return (
    <div>
      <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 24 }}>
        {isEdit ? '编辑文章' : '写文章'}
      </h2>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <div className="glass-card">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="title" label={<span style={{ color: 'var(--text-secondary)' }}>标题</span>} rules={[{ required: true }]}>
                <Input placeholder="文章标题" size="large" style={glassInput} />
              </Form.Item>
              <Form.Item name="summary" label={<span style={{ color: 'var(--text-secondary)' }}>摘要</span>}>
                <Input.TextArea rows={2} placeholder="不填则自动截取正文前段" style={glassInput} />
              </Form.Item>

              {/* 上传按钮 */}
              <div style={{ marginBottom: 4, display: 'flex', gap: 8 }}>
                <Button
                  icon={<PictureOutlined />}
                  loading={imgUploading}
                  onClick={() => imgRef.current?.click()}
                  style={{ borderRadius: 6, minWidth: 126 }}
                >插入图片</Button>
                <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                <Button
                  icon={<FileTextOutlined />}
                  loading={mdUploading}
                  onClick={() => mdRef.current?.click()}
                  style={{ borderRadius: 6, minWidth: 126 }}
                >导入文件</Button>
                <input ref={mdRef} type="file" accept=".md,.markdown,.txt" style={{ display: 'none' }} onChange={handleMdUpload} />
              </div>

              <Form.Item label={<span style={{ color: 'var(--text-secondary)' }}>正文（Markdown）</span>} required>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={(e) => {
                    // 只在真正离开容器时取消，避免子元素触发
                    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false)
                  }}
                  onDrop={handleDrop}
                  style={{ position: 'relative', borderRadius: 8 }}>
                  {/* 拖拽遮罩层 */}
                  {dragOver && (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false)
                      }}
                      onDrop={handleDrop}
                      style={{
                        position: 'absolute', inset: 0, zIndex: 10, borderRadius: 8,
                        border: '2px dashed var(--accent)',
                        background: 'var(--accent-glow)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 600, color: 'var(--accent)',
                      }}>
                      松开以上传文件（图片 / Markdown）
                    </div>
                  )}
                  <Input.TextArea rows={16} value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="支持 Markdown 语法... 可直接拖入图片或 .md 文件"
                    style={{ ...glassInput, fontFamily: 'monospace' }} />
                </div>
              </Form.Item>

              <Row gutter={16}>
                {/* 分类：下拉 + 新建 */}
                <Col span={12}>
                  <Form.Item name="category_id" label={<span style={{ color: 'var(--text-secondary)' }}>分类</span>}>
                    <Select allowClear placeholder="选择分类" style={{ borderRadius: 8 }}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <div style={{ borderTop: '1px solid var(--border-glass)', padding: '8px 12px' }}>
                            <Button type="link" size="small"
                              onClick={() => setCatOpen(true)}
                              style={{ padding: 0, fontSize: 12 }}>
                              + 新建分类
                            </Button>
                          </div>
                        </>
                      )}>
                      {categories.map((c) => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </Col>

                {/* 标签：多选 + 新建 */}
                <Col span={12}>
                  <Form.Item name="tag_ids" label={<span style={{ color: 'var(--text-secondary)' }}>标签</span>}>
                    <Select mode="multiple" allowClear placeholder="选择标签" style={{ borderRadius: 8 }}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <div style={{ borderTop: '1px solid var(--border-glass)', padding: '8px 12px' }}>
                            <Button type="link" size="small"
                              onClick={() => setTagOpen(true)}
                              style={{ padding: 0, fontSize: 12 }}>
                              + 新建标签
                            </Button>
                          </div>
                        </>
                      )}>
                      {tags.map((t) => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="is_published" label={<span style={{ color: 'var(--text-secondary)' }}>发布</span>} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="is_top" label={<span style={{ color: 'var(--text-secondary)' }}>置顶</span>} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={<span style={{ color: 'var(--text-secondary)' }}>封面图</span>}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Form.Item name="cover_image" noStyle>
                    <Input placeholder="粘贴 URL 或点击右侧上传" style={{ ...glassInput, flex: 1 }} />
                  </Form.Item>
                  <Button icon={<PictureOutlined />} onClick={() => coverRef.current?.click()}
                    style={{ borderRadius: 6, flexShrink: 0 }}>上传</Button>
                  <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={handleCoverUpload} />
                </div>
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} size="large"
                style={{ borderRadius: 8, background: 'var(--accent)', border: 'none', boxShadow: '0 0 20px var(--accent-glow)' }}>
                {isEdit ? '保存修改' : '发布文章'}
              </Button>
            </Form>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="glass-card" style={{ position: 'sticky', top: 80 }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>预览</h4>
            <div style={{ lineHeight: 1.8, maxHeight: '70vh', overflow: 'auto', color: 'var(--text-primary)' }}>
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>在左侧输入内容，这里实时预览...</p>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* 新建分类弹窗 */}
      <Modal title="新建分类" open={catOpen}
        onCancel={() => setCatOpen(false)} onOk={createCategory}
        okText="创建" cancelText="取消">
        <Input placeholder="分类名称" value={catName}
          onChange={(e) => { setCatName(e.target.value); setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')) }}
          style={{ marginBottom: 12, ...glassInput }} />
        <Input placeholder="slug（URL 别名）" value={catSlug}
          onChange={(e) => setCatSlug(e.target.value)} style={glassInput} />
      </Modal>

      {/* 新建标签弹窗 */}
      <Modal title="新建标签" open={tagOpen}
        onCancel={() => setTagOpen(false)} onOk={createTag}
        okText="创建" cancelText="取消">
        <Input placeholder="标签名称" value={tagName}
          onChange={(e) => { setTagName(e.target.value); setTagSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')) }}
          style={{ marginBottom: 12, ...glassInput }} />
        <Input placeholder="slug（URL 别名）" value={tagSlug}
          onChange={(e) => setTagSlug(e.target.value)} style={glassInput} />
      </Modal>
    </div>
  )
}
