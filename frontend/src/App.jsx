import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'

// 公开页面
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import LoginPage from './pages/LoginPage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'

// 管理后台
import AdminLayout from './admin/AdminLayout'
import PostListPage from './admin/PostListPage'
import PostEditorPage from './admin/PostEditorPage'
import CategoryManagePage from './admin/CategoryManagePage'

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { borderRadius: 6 } }}>
      <AntApp>
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
      </AntApp>
    </ConfigProvider>
  )
}
