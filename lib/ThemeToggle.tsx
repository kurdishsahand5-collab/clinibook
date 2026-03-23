'use client'
import { useTheme } from '@/lib/ThemeContext'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                background: theme === 'dark' ? '#0ea5e9' : '#e2e8f0',
                transition: 'background 0.3s',
                flexShrink: 0,
            }}
        >
            <span style={{
                position: 'absolute',
                left: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                opacity: theme === 'dark' ? 0 : 1,
                transition: 'opacity 0.2s',
            }}>☀️</span>
            <span style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                opacity: theme === 'dark' ? 1 : 0,
                transition: 'opacity 0.2s',
            }}>🌙</span>
            <span style={{
                position: 'absolute',
                top: '3px',
                left: theme === 'dark' ? '23px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                transition: 'left 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
        </button>
    )
}