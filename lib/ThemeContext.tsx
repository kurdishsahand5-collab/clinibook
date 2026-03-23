'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const themes = {
    light: {
        bg: '#f9fafb',
        surface: '#ffffff',
        surfaceAlt: '#f8faff',
        border: '#e2e8f0',
        text: '#0f172a',
        textMuted: '#64748b',
        textFaint: '#94a3b8',
        navBg: 'rgba(255,255,255,0.95)',
        navBorder: '#f1f5f9',
        cardBg: '#ffffff',
        inputBg: '#ffffff',
        heroBg: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 40%,#f8faff 100%)',
        sectionAlt: '#f0f9ff',
        footerBg: '#0c1a2e',
    },
    dark: {
        bg: '#0f172a',
        surface: '#1e293b',
        surfaceAlt: '#162032',
        border: '#334155',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
        textFaint: '#64748b',
        navBg: 'rgba(15,23,42,0.95)',
        navBorder: '#1e293b',
        cardBg: '#1e293b',
        inputBg: '#1e293b',
        heroBg: 'linear-gradient(135deg,#0f172a 0%,#162032 40%,#0f1f35 100%)',
        sectionAlt: '#162032',
        footerBg: '#020817',
    },
}

const ThemeContext = createContext<{
    theme: Theme
    t: typeof themes.light
    toggleTheme: () => void
}>({
    theme: 'light',
    t: themes.light,
    toggleTheme: () => { },
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        const saved = localStorage.getItem('clinibook-theme') as Theme
        if (saved === 'dark' || saved === 'light') setTheme(saved)
    }, [])

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light'
            localStorage.setItem('clinibook-theme', next)
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, t: themes[theme], toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)