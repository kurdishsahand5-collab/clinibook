'use client'
import { useState } from 'react'
import { useLang } from './LanguageContext'
import { languages } from './i18n'

export default function LangSwitcher({ dark = false }: { dark?: boolean }) {
    const { lang, setLang } = useLang()
    const [open, setOpen] = useState(false)
    const current = languages.find(l => l.code === lang) || languages[0]

    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                border: dark ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #e2e8f0',
                background: dark ? 'rgba(255,255,255,0.15)' : 'white',
                color: dark ? 'white' : '#475569', fontSize: '13px', fontWeight: '600',
                fontFamily: 'inherit', transition: 'all 0.2s', letterSpacing: '0.3px'
            }}>
                <span style={{ fontSize: '11px', fontWeight: '700', opacity: 0.7 }}>🌐</span>
                <span>{current.code.toUpperCase()}</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>▾</span>
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: '110%', right: 0, background: 'white',
                    borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #f1f5f9', overflow: 'hidden', zIndex: 999, minWidth: '150px'
                }}>
                    {languages.map(l => (
                        <button key={l.code} onClick={() => { setLang(l.code); setOpen(false) }} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', padding: '10px 16px', border: 'none',
                            background: lang === l.code ? '#f0f9ff' : 'white',
                            cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                            color: lang === l.code ? '#0ea5e9' : '#475569',
                            fontWeight: lang === l.code ? '600' : '400', transition: 'background 0.15s'
                        }}>
                            <span>{l.label}</span>
                            {lang === l.code && <span style={{ width: '6px', height: '6px', background: '#0ea5e9', borderRadius: '50%', display: 'inline-block' }} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}