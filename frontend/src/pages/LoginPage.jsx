import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/admin/posts')
    } catch (err) {
      const detail = err.response?.data?.detail || '登录失败'
      message.error(typeof detail === 'string' ? detail : '用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="glass-card" style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>◈</div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>欢迎回来</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>登录以管理博客内容</p>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="用户名"
              style={{
                background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                borderRadius: 10, height: 46,
              }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="密码"
              style={{
                background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                borderRadius: 10, height: 46,
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" htmlType="submit" loading={loading} block
              icon={<ArrowRightOutlined />}
              style={{
                height: 46, borderRadius: 10, fontSize: 15, fontWeight: 500,
                background: 'var(--accent)', border: 'none',
                boxShadow: '0 4px 20px var(--accent-glow)',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
