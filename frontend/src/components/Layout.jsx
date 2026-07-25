import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Button, Space } from 'antd'
import { HomeOutlined, AppstoreOutlined, LoginOutlined, EditOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 极简导航 */}
      <header className="glass-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: 56, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Space size={0}>
          <Link to="/" style={{
            fontSize: 17, fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: -0.5, marginRight: 24,
          }}>
            {user?.username ? `${user.username}'s Blog` : 'MyBlog'}
          </Link>
          <Link to="/"><Button type="text" size="small" icon={<HomeOutlined />}
            style={{ color: 'var(--text-secondary)', borderRadius: 8 }}>首页</Button></Link>
          <Link to="/categories"><Button type="text" size="small" icon={<AppstoreOutlined />}
            style={{ color: 'var(--text-secondary)', borderRadius: 8 }}>分类</Button></Link>
        </Space>

        <Space>
          <Button type="text" size="small"
            icon={dark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggle} style={{ color: 'var(--text-secondary)' }} />
          {user ? (
            <>
              <Button type="text" size="small" icon={<EditOutlined />}
                onClick={() => navigate('/admin/posts')}
                style={{ color: 'var(--accent)', borderRadius: 8 }}>写文章</Button>
              <Button type="text" size="small" icon={<LogoutOutlined />}
                onClick={() => { logout(); navigate('/') }}
                style={{ color: 'var(--text-secondary)', borderRadius: 8 }}>退出</Button>
            </>
          ) : (
            <Button type="link" icon={<LoginOutlined />} onClick={() => navigate('/login')}
              style={{ color: 'var(--accent)' }}>登录</Button>
          )}
        </Space>
      </header>

      {/* 主内容区 */}
      <main style={{ flex: 1, padding: '40px 24px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      {/* 极简页脚 */}
      <footer style={{
        textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 12,
        borderTop: '1px solid var(--border-glass)',
      }}>
        © {new Date().getFullYear()} &nbsp;·&nbsp; Powered by React + FastAPI
      </footer>
    </div>
  )
}
