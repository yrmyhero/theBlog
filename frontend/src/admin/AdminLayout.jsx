import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { EditOutlined, AppstoreOutlined, ArrowLeftOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Sider, Content, Header } = Layout

// 没有登录 → 重定向到登录页
export default function AdminLayout() {
  const { user, loading, logout } = useAuth()
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
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider
        collapsible collapsed={collapsed} trigger={null}
        theme="light" style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <span style={{ flex: 1, fontWeight: 500 }}>管理后台</span>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回前台
          </Button>
          <Button onClick={() => { logout(); navigate('/') }}>退出</Button>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
