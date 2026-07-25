import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Space, theme } from 'antd'
import { HomeOutlined, AppstoreOutlined, LoginOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Header, Content, Footer } = AntLayout

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { token: themeToken } = theme.useToken()

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: themeToken.colorBgContainer, borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Menu
          mode="horizontal"
          selectable={false}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
            { key: 'categories', icon: <AppstoreOutlined />, label: <Link to="/categories">分类</Link> },
          ]}
          style={{ flex: 1, border: 'none' }}
        />
        <Space>
          {user ? (
            <>
              <span style={{ color: '#666' }}>{user.username}</span>
              <Button icon={<EditOutlined />} onClick={() => navigate('/admin/posts')}>
                管理
              </Button>
              <Button icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/') }}>
                退出
              </Button>
            </>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#999' }}>
        My Blog ©{new Date().getFullYear()} Powered by React + FastAPI
      </Footer>
    </AntLayout>
  )
}
