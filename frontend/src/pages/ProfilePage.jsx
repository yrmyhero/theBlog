import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Spin } from 'antd'
import { CameraOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { usersApi } from '../api/users'
import { uploadApi } from '../api/upload'
import { useAuth } from '../contexts/AuthContext'

function ProfileForm({ profile, onSave }) {
  const [form] = Form.useForm()
  const [avatar, setAvatar] = useState(profile.avatar || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadApi.image(file)
      setAvatar(res.data.url)
      message.success('头像上传成功')
    } catch { message.error('上传失败') }
    finally { setUploading(false); e.target.value = '' }
  }

  const onFinish = async (values) => {
    setSaving(true)
    try {
      await usersApi.updateMe({ ...values, avatar })
      message.success('资料已更新')
      onSave()
    } catch (err) { message.error(err.response?.data?.detail || '保存失败') }
    finally { setSaving(false) }
  }

  const glassInput = { background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: 10 }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32, padding: 28, borderRadius: 14, border: '1px solid var(--border-glass)' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px', position: 'relative',
          background: avatar ? `url(${avatar}) center/cover` : 'var(--accent-glow)', overflow: 'hidden' }}>
          {!avatar && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'var(--text-muted)' }}>◈</span>}
          <label style={{ position: 'absolute', inset: 0, cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.4))', opacity: 0, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
            <CameraOutlined style={{ color: '#fff', fontSize: 18 }} />
            <input type="file" accept="image/*" hidden onChange={handleUpload} />
          </label>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{uploading ? '上传中...' : '点击头像更换图片'}</p>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}
        initialValues={{ nickname: profile.nickname, bio: profile.bio, github: profile.github, website: profile.website }}>
        <Form.Item name="nickname" label={<span style={{ color: 'var(--text-secondary)' }}>昵称</span>}>
          <Input placeholder="给自己起个名字" size="large" style={glassInput} />
        </Form.Item>
        <Form.Item name="bio" label={<span style={{ color: 'var(--text-secondary)' }}>个人简介</span>}>
          <Input.TextArea rows={4} placeholder="简单介绍一下自己..." style={glassInput} />
        </Form.Item>
        <Form.Item name="github" label={<span style={{ color: 'var(--text-secondary)' }}>GitHub</span>}>
          <Input placeholder="用户名或完整链接" size="large" style={glassInput} />
        </Form.Item>
        <Form.Item name="website" label={<span style={{ color: 'var(--text-secondary)' }}>个人网站</span>}>
          <Input placeholder="https://..." size="large" style={glassInput} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving} block size="large"
          style={{ borderRadius: 10, background: 'var(--accent)', border: 'none', boxShadow: '0 0 20px var(--accent-glow)' }}>
          保存
        </Button>
      </Form>
    </div>
  )
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    usersApi.getMe()
      .then((res) => setProfile(res.data))
      .catch(() => {
        message.error('加载资料失败')
        setProfile({ nickname: '', bio: '', github: '', website: '', avatar: '' })
      })
      .finally(() => setLoading(false))
  }, [authLoading])

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
  if (!profile) return null

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}
          style={{ color: 'var(--text-secondary)' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>编辑资料</h2>
      </div>
      <ProfileForm profile={profile} onSave={() => navigate('/')} />
    </div>
  )
}
