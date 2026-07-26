import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const PRESETS = {
  // 暗色系
  '深紫':   ['#141420', '#1e1e30', '#7c6ff7', '#00cec9'],
  '暗蓝':   ['#14141e', '#1e1e2e', '#4dabf7', '#ffa94d'],
  '墨绿':   ['#131a16', '#1c2820', '#2ed573', '#ff6b6b'],
  '深棕':   ['#1a1614', '#28201c', '#ffa502', '#2ed573'],
  '暗红':   ['#1a1418', '#281e22', '#ff6b6b', '#ffa502'],
  '深青':   ['#141a1a', '#1e2828', '#00cec9', '#7c6ff7'],
  // 亮色系
  '浅灰':   ['#f5f5f5', '#ffffff', '#6c5ce7', '#00b894'],
  '暖白':   ['#fefaf6', '#ffffff', '#e17055', '#6c5ce7'],
  '淡蓝':   ['#f0f5fc', '#ffffff', '#3867d6', '#20bf6b'],
  '薄荷':   ['#f2faf7', '#ffffff', '#20bf6b', '#3867d6'],
  '玫瑰':   ['#fdf2f5', '#ffffff', '#e84393', '#6c5ce7'],
  '奶油':   ['#fef9ef', '#ffffff', '#f39c12', '#27ae60'],
}

const ThemeContext = createContext(null)

function applyColor(name, value) {
  document.documentElement.style.setProperty(name, value)
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light')
  const [bgPrimary, setBgPrimary] = useState(() => localStorage.getItem('bgPrimary') || '#14141e')
  const [bgSecondary, setBgSecondary] = useState(() => localStorage.getItem('bgSecondary') || '#1a1a28')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#7c6ff7')
  const [mdColor, setMdColor] = useState(() => localStorage.getItem('mdColor') || '')

  // 暗色/亮色切换
  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    localStorage.setItem('bgPrimary', bgPrimary)
    applyColor('--bg-primary', bgPrimary)
  }, [bgPrimary])

  useEffect(() => {
    localStorage.setItem('bgSecondary', bgSecondary)
    applyColor('--bg-secondary', bgSecondary)
  }, [bgSecondary])

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor)
    applyColor('--accent', accentColor)
    applyColor('--accent-glow', accentColor + '33')
    if (!mdColor) {
      applyColor('--md-accent', accentColor)
      applyColor('--md-accent-glow', accentColor + '33')
    }
  }, [accentColor])

  useEffect(() => {
    localStorage.setItem('mdColor', mdColor)
    if (mdColor) {
      applyColor('--md-accent', mdColor)
      applyColor('--md-accent-glow', mdColor + '33')
    } else {
      applyColor('--md-accent', accentColor)
      applyColor('--md-accent-glow', accentColor + '33')
    }
  }, [mdColor])

  const toggle = useCallback(() => setDark((d) => !d), [])

  const setPreset = useCallback((name) => {
    const [bg1, bg2, acc, md] = PRESETS[name]
    setBgPrimary(bg1)
    setBgSecondary(bg2)
    setAccentColor(acc)
    setMdColor(md)
  }, [])

  const setBgLight = useCallback(() => {
    setBgPrimary('#f0f2f5')
    setBgSecondary('#ffffff')
  }, [])

  const setBgDark = useCallback(() => {
    setBgPrimary('#14141e')
    setBgSecondary('#1a1a28')
  }, [])

  return (
    <ThemeContext.Provider value={{
      dark, toggle,
      bgPrimary, setBgPrimary,
      bgSecondary, setBgSecondary,
      accentColor, setAccentColor,
      mdColor, setMdColor,
      presets: PRESETS, setPreset,
      setBgLight, setBgDark,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return ctx
}
