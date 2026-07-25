import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Pagination, Spin, Empty, Carousel } from 'antd'
import { EyeOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { postsApi } from '../api/posts'
import { categoriesApi } from '../api/categories'
import { usersApi } from '../api/users'

const carouselRef = { current: null }

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const pageSize = 6

  useEffect(() => {
    postsApi.list({ page, page_size: pageSize })
      .then((res) => { setPosts(res.data.items); setTotal(res.data.total) })
      .finally(() => setLoading(false))
    categoriesApi.list().then((res) => setCategories(res.data))
  }, [page])

  // 加载博主信息（取第一个用户的 profile，如果没有 token 也可以用缓存）
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      usersApi.getMe().then((res) => setProfile(res.data)).catch(() => {})
    }
  }, [])

  // 轮播：置顶在前，按阅读量补满 10 篇
  const carouselPosts = [
    ...posts.filter((p) => p.is_top),
    ...posts.filter((p) => !p.is_top).sort((a, b) => b.view_count - a.view_count),
  ].slice(0, 10)

  const prev = useCallback(() => carouselRef.current?.prev(), [])
  const next = useCallback(() => carouselRef.current?.next(), [])

  return (
    <div>
      {/* ====== 轮播区 ====== */}
      {carouselPosts.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 40 }}>
          <Carousel autoplay autoplaySpeed={4000} effect="fade" ref={(ref) => { carouselRef.current = ref }}>
            {carouselPosts.map((post) => (
              <div key={post.id}>
                <Link to={`/post/${post.slug}`}>
                  <div style={{
                    position: 'relative', height: 340, borderRadius: 16, overflow: 'hidden',
                    background: post.cover_image
                      ? `url(${post.cover_image}) center/cover`
                      : 'var(--bg-secondary)',
                  }}>
                    {/* 渐变遮罩 */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 100%)',
                    }} />
                    {/* 文字 */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 36px 28px',
                    }}>
                      {post.category && (
                        <span style={{
                          display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#fff',
                          letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10,
                          padding: '3px 12px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                        }}>
                          {post.category.name}
                        </span>
                      )}
                      <h2 style={{
                        fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, color: '#fff',
                        lineHeight: 1.25, marginBottom: 8, textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                      }}>
                        {post.is_top && '📌 '}{post.title}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: 0 }}>
                        {(post.summary || '').slice(0, 100)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Carousel>

          {/* 轮播控制按钮 */}
          {carouselPosts.length > 1 && (
            <>
              <button onClick={prev} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, background: 'rgba(255,255,255,0.12)', border: 'none',
                backdropFilter: 'blur(10px)', color: '#fff', width: 40, height: 40,
                borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}><LeftOutlined /></button>
              <button onClick={next} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, background: 'rgba(255,255,255,0.12)', border: 'none',
                backdropFilter: 'blur(10px)', color: '#fff', width: 40, height: 40,
                borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}><RightOutlined /></button>
            </>
          )}
        </div>
      )}

      {/* ====== 内容区：左（资料卡+分类）+ 右（文章列表）====== */}
      <Row gutter={36}>
        {/* 左侧栏 */}
        <Col xs={24} lg={8}>
          {/* 博主资料卡 */}
          <div style={{
            padding: 28, borderRadius: 14, border: '1px solid var(--border-glass)',
            marginBottom: 24, textAlign: 'center',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 14px',
              background: profile?.avatar
                ? `url(${profile.avatar}) center/cover`
                : 'var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, overflow: 'hidden',
            }}>
              {!profile?.avatar && '◈'}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {profile?.nickname || profile?.username || '博主'}
            </h3>
            <p style={{
              fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16,
              minHeight: 20, whiteSpace: 'pre-wrap',
            }}>
              {profile?.bio || '还没有个人简介，去个人设置里写一段吧 ✨'}
            </p>
            {profile && (
              <Link to="/profile" style={{
                fontSize: 12, color: 'var(--accent)', padding: '5px 16px',
                borderRadius: 20, border: '1px solid var(--accent-glow)',
              }}>编辑资料</Link>
            )}
          </div>

          {/* 分类 */}
          <div style={{
            padding: 20, borderRadius: 14, border: '1px solid var(--border-glass)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              分类
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {categories.map((c) => (
                <Link key={c.id} to={`/category/${c.slug}`} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  color: 'var(--text-secondary)', fontSize: 13,
                  borderBottom: '1px solid var(--border-glass)',
                }}>
                  <span>{c.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.post_count}</span>
                </Link>
              ))}
            </div>
          </div>
        </Col>

        {/* 右侧文章列表 */}
        <Col xs={24} lg={16}>
          <Spin spinning={loading}>
            {!loading && posts.length === 0 ? (
              <Empty description="还没有文章" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {posts.map((post) => (
                  <article key={post.id} style={{
                    display: 'flex', gap: 20, paddingBottom: 24,
                    borderBottom: '1px solid var(--border-glass)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: 6, display: 'flex', gap: 8 }}>
                        {post.category && (
                          <Link to={`/category/${post.category.slug}`} style={{
                            fontSize: 11, color: 'var(--accent)', fontWeight: 600,
                            letterSpacing: 1, textTransform: 'uppercase',
                          }}>{post.category.name}</Link>
                        )}
                        {post.is_top && <span style={{ fontSize: 11, color: '#ffa502' }}>📌</span>}
                      </div>
                      <Link to={`/post/${post.slug}`} style={{ color: 'inherit' }}>
                        <h2 style={{
                          fontSize: 18, fontWeight: 700, lineHeight: 1.35, marginBottom: 6,
                          color: 'var(--text-primary)',
                        }}>{post.title}</h2>
                      </Link>
                      <p style={{
                        color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7,
                        marginBottom: 12, overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {post.summary || (post.content || '').replace(/[#*>`\n]/g, '').slice(0, 150) + '...'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text-muted)', fontSize: 12 }}>
                        <span><ClockCircleOutlined /> {new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span><EyeOutlined /> {post.view_count} 阅读</span>
                        <span style={{ marginLeft: 'auto' }}>
                          <Link to={`/post/${post.slug}`} style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
                            阅读 →
                          </Link>
                        </span>
                      </div>
                    </div>
                    {post.cover_image && (
                      <Link to={`/post/${post.slug}`}>
                        <img src={post.cover_image} alt="" style={{
                          width: 180, height: 120, objectFit: 'cover', borderRadius: 10, flexShrink: 0,
                        }} />
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Spin>
          {total > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination current={page} total={total} pageSize={pageSize}
                onChange={setPage} showSizeChanger={false} />
            </div>
          )}
        </Col>
      </Row>
    </div>
  )
}
