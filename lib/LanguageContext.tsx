'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { t, languages } from './i18n'

type LangContextType = {
    lang: string
    setLang: (l: string) => void
    tr: (key: string) => string
    dir: string
}

const LangContext = createContext<LangContextType>({
    lang: 'en', setLang: () => { }, tr: (k) => k, dir: 'ltr'
})

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState('en')

    useEffect(() => {
        const saved = localStorage.getItem('clinibook_lang')
        if (saved) setLangState(saved)
    }, [])

    const setLang = (l: string) => {
        setLangState(l)
        localStorage.setItem('clinibook_lang', l)
    }

    const dir = languages.find(l => l.code === lang)?.dir || 'ltr'


    // ADD THIS ↓
    useEffect(() => {
        document.documentElement.dir = dir
        document.documentElement.lang = lang
    }, [lang, dir])
    const tr = (key: string) => t[lang]?.[key] || t['en']?.[key] || key

    return (
        <LangContext.Provider value={{ lang, setLang, tr, dir }}>
            {children}
        </LangContext.Provider>
    )
}

export const useLang = () => useContext(LangContext)