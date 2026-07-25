import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Layout, Button } from 'antd'
import { EditOutlined, AppstoreOutlined, ArrowLeftOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const { Sider, Content, Header } = Layout

export default function AdminLayout() {
  const { user, loading, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  const menuItems = [
    { key: '/admin/posts', icon: <EditOutlined />, label: '文章管理' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: '分类管理' },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider
        collapsible collapsed={collapsed} trigger={null} width={200}
        className="glass" style={{
          borderRadius: 0, borderRight: '1px solid var(--border-glass)',
          background: 'var(--bg-glass)',
        }}
      >
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: '1px solid var(--border-glass)', fontWeight: 700,
          color: 'var(--accent)', fontSize: collapsed ? 14 : 16 }}>
          {collapsed ? '◈' : '◈ 管理后台'}
        </div>
        <div style={{ padding: '8px 0' }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.key
            return (
              <div key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  padding: collapsed ? '12px 0' : '12px 24px', margin: '2px 8px',
                  borderRadius: 10, transition: 'all 0.2s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  background: active ? 'var(--bg-glass-hover)' : 'transparent',
                  border: active ? '1px solid var(--accent-glow)' : '1px solid transparent',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            )
          })}
        </div>
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <Header className="glass-nav" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 56,
        }}>
          <Button type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: 'var(--text-secondary)' }}
          />
          <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>
            {menuItems.find((m) => m.key === location.pathname)?.label || ''}
          </span>
          <Button type="text" icon={dark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggle} style={{ color: 'var(--text-secondary)' }} />
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}
            style={{ color: 'var(--text-secondary)' }}>前台</Button>
          <Button type="text" onClick={() => { logout(); navigate('/') }}
            style={{ color: 'var(--text-secondary)' }}>退出</Button>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
