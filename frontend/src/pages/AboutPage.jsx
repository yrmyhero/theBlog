import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spin, Result, Divider } from 'antd'
import { GithubOutlined, LinkOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { usersApi } from '../api/users'
import { useAuth } from '../contexts/AuthContext'

export default function AboutPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // 用公开接口获取资料（无需 token）
      usersApi.getByUsername(user.username)
        .then((res) => setProfile(res.data))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!profile) return <Result status="info" title="暂无信息" subTitle="请先登录" />

  const isOwner = user && user.username === profile.username

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
          background: profile.avatar ? `url(${profile.avatar}) center/cover` : 'var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, overflow: 'hidden',
        }}>
          {!profile.avatar && '◈'}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          {profile.nickname || profile.username}
        </h1>
        {profile.bio && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* 链接区 */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 36, flexWrap: 'wrap',
      }}>
        {profile.email && (
          <a href={`mailto:${profile.email}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px',
            borderRadius: 24, color: 'var(--text-secondary)', fontSize: 13,
            border: '1px solid var(--border-glass)', textDecoration: 'none',
            transition: 'all 0.2s',
          }}>
            <MailOutlined /> {profile.email}
          </a>
        )}
        {profile.github && (
          <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px',
              borderRadius: 24, color: 'var(--text-secondary)', fontSize: 13,
              border: '1px solid var(--border-glass)', textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
            <GithubOutlined /> GitHub
          </a>
        )}
        {profile.website && (
          <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px',
              borderRadius: 24, color: 'var(--text-secondary)', fontSize: 13,
              border: '1px solid var(--border-glass)', textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
            <LinkOutlined /> 个人网站
          </a>
        )}
      </div>

      <Divider style={{ borderColor: 'var(--border-glass)' }} />

      {/* 统计 */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <ClockCircleOutlined /> 加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
      </div>

      {/* 编辑入口 */}
      {isOwner && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/profile" style={{
            padding: '6px 24px', borderRadius: 20, fontSize: 13, color: 'var(--accent)',
            border: '1px solid var(--accent-glow)',
          }}>编辑个人资料</Link>
        </div>
      )}
    </div>
  )
}
