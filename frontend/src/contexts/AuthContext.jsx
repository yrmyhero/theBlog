import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 页面刷新时从 localStorage 恢复 token
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      // 简单解码 JWT payload 获取用户名（不查后端，token 内就有）
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: Number(payload.sub), username: payload.username })
      } catch {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [token])

  const login = useCallback(async (username, password) => {
    const res = await authApi.login({ username, password })
    const { access_token } = res.data
    localStorage.setItem('token', access_token)

    // 解码 token 获取用户信息
    const payload = JSON.parse(atob(access_token.split('.')[1]))
    const u = { id: Number(payload.sub), username: payload.username }
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
