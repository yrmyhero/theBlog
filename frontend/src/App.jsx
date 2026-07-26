import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, App as AntApp, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Layout from './components/Layout'

// 公开页面
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import LoginPage from './pages/LoginPage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'

// 管理后台
import AdminLayout from './admin/AdminLayout'
import PostListPage from './admin/PostListPage'
import PostEditorPage from './admin/PostEditorPage'
import CategoryManagePage from './admin/CategoryManagePage'

function AntdProvider({ children }) {
  const { dark, accentColor } = useTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: dark ? {
          colorPrimary: accentColor,
          colorBgContainer: 'rgba(255,255,255,0.05)',
          colorBgElevated: 'rgba(30,30,44,0.97)',
          colorBorder: 'rgba(255,255,255,0.10)',
          colorBorderSecondary: 'rgba(255,255,255,0.08)',
          colorText: '#e4e4ee',
          colorTextSecondary: '#9090a8',
          borderRadius: 12,
        } : {
          colorPrimary: accentColor,
          colorBgContainer: 'rgba(255,255,255,0.65)',
          colorBgElevated: 'rgba(255,255,255,0.95)',
          colorBorder: 'rgba(0,0,0,0.08)',
          colorBorderSecondary: 'rgba(0,0,0,0.05)',
          colorText: '#1a1a2e',
          colorTextSecondary: '#555570',
          borderRadius: 12,
        },
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AntdProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* 前台 */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/post/:slug" element={<PostPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              {/* 管理后台 */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="posts" element={<PostListPage />} />
                <Route path="posts/new" element={<PostEditorPage />} />
                <Route path="posts/:postId/edit" element={<PostEditorPage />} />
                <Route path="categories" element={<CategoryManagePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntdProvider>
    </ThemeProvider>
  )
}
