import { useState } from 'react'
import { Drawer, Button, ColorPicker, Space, Tag } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeSettings() {
  const {
    bgPrimary, setBgPrimary,
    bgSecondary, setBgSecondary,
    accentColor, setAccentColor,
    mdColor, setMdColor,
    presets, setPreset,
  } = useTheme()
  const [open, setOpen] = useState(false)

  const colorLabel = (n) => ({ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 })

  return (
    <>
      <Button type="text" size="small" icon={<SettingOutlined />}
        onClick={() => setOpen(true)} style={{ color: 'var(--text-secondary)' }} />

      <Drawer title="主题设置" open={open} onClose={() => setOpen(false)}
        styles={{ body: { background: 'var(--bg-primary)' }, header: { background: 'var(--bg-primary)' } }}
        size={320}>

        {/* 预设主题 */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={colorLabel()}>预设主题</h4>
          <Space wrap>
            {Object.entries(presets).map(([name, [bg1, bg2, acc, md]]) => {
              const active = bg1 === bgPrimary
              return (
                <Tag key={name} style={{
                  cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: 12,
                  background: active ? `${acc}22` : 'var(--bg-glass)',
                  border: active ? `1px solid ${acc}` : '1px solid var(--border-glass)',
                  color: active ? acc : 'var(--text-secondary)',
                }} onClick={() => setPreset(name)}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: bg1, marginRight: 5, verticalAlign: 'middle' }} />
                  <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: bg2, marginRight: 5, verticalAlign: 'middle' }} />
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: acc, verticalAlign: 'middle' }} />
                  {' '}{name}
                </Tag>
              )
            })}
          </Space>
        </div>

        {/* 页面主色调（背景） */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={colorLabel()}>页面底色（主色调）</h4>
          <ColorPicker value={bgPrimary} onChange={(c) => setBgPrimary(c.toHexString())}
            presets={[{ label: '推荐', colors: ['#141420','#14141e','#131a16','#1a1614','#1a1418','#141a1a','#0d0d1a','#1a1a2e','#16213e','#222831'] }]} />
        </div>

        {/* 模块底色（副色调） */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={colorLabel()}>模块底色（副色调）</h4>
          <ColorPicker value={bgSecondary} onChange={(c) => setBgSecondary(c.toHexString())}
            presets={[{ label: '推荐', colors: ['#1e1e30','#1e1e2e','#1c2820','#28201c','#281e22','#1e2828','#1a1a30','#1e1e36','#1a1a2e','#222831'] }]} />
        </div>

        {/* 强调色 */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={colorLabel()}>强调色（按钮/链接/标签）</h4>
          <ColorPicker value={accentColor} onChange={(c) => setAccentColor(c.toHexString())}
            presets={[{ label: '推荐', colors: ['#7c6ff7','#4dabf7','#2ed573','#ffa502','#ff6b6b','#00cec9','#e64980','#20c997','#748ffc','#fcc419'] }]} />
        </div>

        {/* 文章强调色 */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={colorLabel()}>
            文章强调色 {!mdColor && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(跟随强调色)</span>}
          </h4>
          <ColorPicker
            value={mdColor || accentColor}
            onChange={(c) => setMdColor(c.toHexString())}
            allowClear onClear={() => setMdColor('')}
            presets={[{ label: '推荐', colors: ['#7c6ff7','#ff6b6b','#2ed573','#4dabf7','#ffa502','#00cec9','#20c997','#748ffc','#fcc419','#ff8787'] }]} />
        </div>
      </Drawer>
    </>
  )
}
