import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Spin, Upload } from 'antd'
import { CameraOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { usersApi } from '../api/users'
import { uploadApi } from '../api/upload'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    usersApi.getMe().then((res) => {
      const u = res.data
      form.setFieldsValue({ nickname: u.nickname, bio: u.bio })
      setAvatar(u.avatar)
    }).finally(() => setLoading(false))
  }, [])

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const res = await uploadApi.image(file)
      const url = res.data.url
      setAvatar(url)
      message.success('头像上传成功')
    } catch { message.error('上传失败') }
    finally { setUploading(false) }
    return false // 阻止 antd Upload 自动发请求
  }

  const onFinish = async (values) => {
    setSaving(true)
    try {
      await usersApi.updateMe({ ...values, avatar })
      message.success('资料已更新')
      navigate('/')
    } catch (err) {
      message.error(err.response?.data?.detail || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}
          style={{ color: 'var(--text-secondary)' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>编辑资料</h2>
      </div>

      {/* 头像区 */}
      <div style={{
        textAlign: 'center', marginBottom: 32, padding: 28, borderRadius: 14,
        border: '1px solid var(--border-glass)',
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px', position: 'relative',
          background: avatar ? `url(${avatar}) center/cover` : 'var(--accent-glow)',
          overflow: 'hidden',
        }}>
          {!avatar && <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 36, color: 'var(--text-muted)',
          }}>◈</span>}
          <label style={{
            position: 'absolute', inset: 0, cursor: 'pointer', display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6,
            background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.4))',
            opacity: 0, transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <CameraOutlined style={{ color: '#fff', fontSize: 18 }} />
            <input type="file" accept="image/*" hidden
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </label>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {uploading ? '上传中...' : '点击头像更换图片'}
        </p>
      </div>

      {/* 表单 */}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="nickname" label={<span style={{ color: 'var(--text-secondary)' }}>昵称</span>}>
          <Input placeholder="给自己起个名字" size="large"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: 10 }} />
        </Form.Item>
        <Form.Item name="bio" label={<span style={{ color: 'var(--text-secondary)' }}>个人简介</span>}>
          <Input.TextArea rows={4} placeholder="简单介绍一下自己..."
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: 10 }} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving} block size="large"
          style={{ borderRadius: 10, background: 'var(--accent)', border: 'none', boxShadow: '0 0 20px var(--accent-glow)' }}>
          保存
        </Button>
      </Form>
    </div>
  )
}
