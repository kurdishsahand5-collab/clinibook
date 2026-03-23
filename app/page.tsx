'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/LanguageContext'
import { useTheme } from '@/lib/ThemeContext'
import ThemeToggle from '@/lib/ThemeToggle'
import LangSwitcher from '@/lib/LangSwitcher'
import { Calendar, Stethoscope, Shield, Clock, MapPin, Phone, Star, ChevronRight, Plus, CheckCircle, Users, Award, Heart } from 'lucide-react'
import config from '@/config'

const services = config.services || ['General Checkup', 'Dental Cleaning', 'Eye Examination', 'Blood Test', 'X-Ray', 'Consultation']
const serviceIcons = [Stethoscope, Heart, Star, Shield, Award, Users]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { tr } = useLang()
  const { t, theme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [count, setCount] = useState({ a: 0, b: 0, c: 0, d: 0 })
  const statsRef = useRef<HTMLDivElement>(null)
  const statsStarted = useRef(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !statsStarted.current) {
        statsStarted.current = true
        const targets = [12, 8400, 15, 98]
        targets.forEach((target, i) => {
          const key = ['a', 'b', 'c', 'd'][i] as 'a' | 'b' | 'c' | 'd'
          let start = 0
          const step = Math.ceil(target / 60)
          const timer = setInterval(() => {
            start = Math.min(start + step, target)
            setCount(prev => ({ ...prev, [key]: start }))
            if (start >= target) clearInterval(timer)
          }, 24)
        })
      }
    }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const whyUs = [
    { icon: Award, title: tr('why1_title'), desc: tr('why1_desc') },
    { icon: Clock, title: tr('why2_title'), desc: tr('why2_desc') },
    { icon: Shield, title: tr('why3_title'), desc: tr('why3_desc') },
    { icon: Heart, title: tr('why4_title'), desc: tr('why4_desc') },
  ]

  const testimonials = [
    { name: 'Sarah K.', role: tr('test1_role'), text: tr('test1_text') },
    { name: 'Ahmed M.', role: tr('test2_role'), text: tr('test2_text') },
    { name: 'Lana R.', role: tr('test3_role'), text: tr('test3_text') },
  ]

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: t.bg, color: t.text, overflowX: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${t.bg}; } ::-webkit-scrollbar-thumb { background: #0ea5e9; border-radius: 3px; }
        .nav-link { color: ${t.textMuted}; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; cursor: pointer; }
        .nav-link:hover { color: #0ea5e9; }
        .btn-primary { background: linear-gradient(135deg,#0ea5e9,#0284c7); color: white; border: none; border-radius: 12px; padding: 16px 36px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.25s; box-shadow: 0 4px 20px rgba(14,165,233,0.35); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(14,165,233,0.45); }
        .btn-outline { background: transparent; color: #0ea5e9; border: 2px solid #0ea5e9; border-radius: 12px; padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.25s; }
        .btn-outline:hover { background: #0ea5e9; color: white; }
        .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(14,165,233,0.15) !important; border-color: #0ea5e9 !important; }
        .why-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
        .testimonial-card:hover { transform: translateY(-4px); }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.15);opacity:0.15} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? t.navBg : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? `1px solid ${t.navBorder}` : 'none', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.3s ease', padding: '0 48px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#38bdf8,#0284c7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={20} color="white" />
          </div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: '22px', color: t.text }}>{config.clinicName}</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {[['nav_services', 'services'], ['nav_about', 'about'], ['nav_whyus', 'why-us'], ['nav_testimonials', 'testimonials'], ['nav_contact', 'contact']].map(([key, id]) => (
            <a key={key} href={`#${id}`} className="nav-link">{tr(key)}</a>
          ))}
          <LangSwitcher />
          <ThemeToggle />
          <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '10px' }} onClick={() => router.push('/booking')}>{tr('nav_book')}</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', background: t.heroBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 48px 80px', position: 'relative', overflow: 'hidden', transition: 'background 0.3s' }}>
        <div style={{ position: 'absolute', top: '10%', right: '8%', width: '420px', height: '420px', background: 'radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)', borderRadius: '50%', animation: 'pulse-ring 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: '280px', height: '280px', background: 'radial-gradient(circle,rgba(56,189,248,0.1) 0%,transparent 70%)', borderRadius: '50%', animation: 'pulse-ring 5s ease-in-out infinite 1s' }} />
        <div style={{ position: 'absolute', top: '20%', left: '12%', animation: 'float 6s ease-in-out infinite', opacity: 0.1 }}><Plus size={64} color="#0ea5e9" /></div>
        <div style={{ position: 'absolute', bottom: '25%', right: '15%', animation: 'float 5s ease-in-out infinite 2s', opacity: 0.07 }}><Plus size={48} color="#0ea5e9" /></div>

        <div style={{ maxWidth: '760px', textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeSlideDown 0.9s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: t.surface, border: `1px solid ${theme === 'dark' ? '#334155' : '#bae6fd'}`, borderRadius: '40px', padding: '8px 20px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(14,165,233,0.12)' }}>
            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
            <span style={{ fontSize: '13px', color: theme === 'dark' ? '#38bdf8' : '#0369a1', fontWeight: '500' }}>{tr('hero_badge')}</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(42px,6vw,72px)', lineHeight: 1.1, color: t.text, marginBottom: '24px', fontWeight: '400' }}>
            {tr('hero_title1')}<br /><em style={{ color: '#0ea5e9' }}>{tr('hero_title2')}</em>
          </h1>
          <p style={{ fontSize: '18px', color: t.textMuted, lineHeight: 1.8, maxWidth: '560px', margin: '0 auto 40px' }}>{tr('hero_desc')}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => router.push('/booking')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} />{tr('hero_btn1')}</span>
            </button>
            <button className="btn-outline" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>{tr('hero_btn2')}</button>
          </div>
          <div style={{ marginTop: '48px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: <Star size={14} />, val: '4.9/5', label: tr('hero_rating_label') },
              { icon: <Clock size={14} />, val: 'Same Day', label: tr('hero_sameday_label') },
              { icon: <Users size={14} />, val: 'All Ages', label: tr('hero_ages_label') },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: t.text, display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>{item.icon}{item.val}</div>
                <div style={{ fontSize: '12px', color: t.textFaint, marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', padding: '60px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px', textAlign: 'center' }}>
          {[
            { val: count.a + '+', label: tr('stat_years') },
            { val: count.b.toLocaleString() + '+', label: tr('stat_patients') },
            { val: count.c + '+', label: tr('stat_specialists') },
            { val: count.d + '%', label: tr('stat_satisfaction') },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '48px', color: 'white', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginTop: '6px', fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: '100px 48px', background: t.bg, transition: 'background 0.3s' }}>
        <FadeIn><div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ color: '#0ea5e9', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>{tr('section_services_tag')}</p>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '42px', fontWeight: '400', color: t.text }}>{tr('section_services_title')}</h2>
          <p style={{ color: t.textMuted, fontSize: '16px', marginTop: '12px', maxWidth: '500px', margin: '12px auto 0' }}>{tr('section_services_desc')}</p>
        </div></FadeIn>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {services.map((s: string, i: number) => {
            const Icon = serviceIcons[i] || Stethoscope
            return (
              <FadeIn key={s} delay={i * 0.08}>
                <div className="service-card" onClick={() => router.push('/booking')} style={{ background: t.cardBg, borderRadius: '16px', padding: '32px 24px', textAlign: 'center', border: `1.5px solid ${t.border}`, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '52px', height: '52px', background: theme === 'dark' ? 'rgba(14,165,233,0.15)' : 'linear-gradient(135deg,#e0f2fe,#bae6fd)', borderRadius: '14px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} color="#0ea5e9" />
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: t.text }}>{s}</div>
                  <div style={{ fontSize: '13px', color: t.textFaint, marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>{tr('book_now')} <ChevronRight size={12} /></div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: '100px 48px', background: t.surface, transition: 'background 0.3s' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <FadeIn>
            <div style={{ background: theme === 'dark' ? 'rgba(14,165,233,0.08)' : 'linear-gradient(135deg,#e0f2fe,#f0f9ff)', borderRadius: '24px', padding: '48px', textAlign: 'center' }}>
              <div style={{ animation: 'float 5s ease-in-out infinite', display: 'inline-block' }}>
                <Stethoscope size={96} color="#0ea5e9" strokeWidth={1} />
              </div>
              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['about_f1', 'about_f2', 'about_f3', 'about_f4'].map(k => (
                  <div key={k} style={{ background: t.cardBg, borderRadius: '10px', padding: '10px', fontSize: '12px', fontWeight: '600', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <CheckCircle size={13} color="#0ea5e9" />{tr(k).replace('✓ ', '')}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div>
              <p style={{ color: '#0ea5e9', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>{tr('section_about_tag')}</p>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '38px', fontWeight: '400', color: t.text, lineHeight: 1.2, marginBottom: '20px' }}>
                {tr('section_about_title1')}<br /><em>{tr('section_about_title2')}</em>
              </h2>
              <p style={{ color: t.textMuted, fontSize: '16px', lineHeight: 1.8, marginBottom: '16px' }}>{tr('about_desc1')}</p>
              <p style={{ color: t.textMuted, fontSize: '16px', lineHeight: 1.8, marginBottom: '32px' }}>{tr('about_desc2')}</p>
              <button className="btn-primary" onClick={() => router.push('/booking')}>{tr('about_btn')}</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Us */}
      <section id="why-us" style={{ padding: '100px 48px', background: t.sectionAlt, transition: 'background 0.3s' }}>
        <FadeIn><div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ color: '#0ea5e9', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>{tr('section_why_tag')}</p>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '42px', fontWeight: '400', color: t.text }}>{tr('section_why_title')}</h2>
        </div></FadeIn>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '24px' }}>
          {whyUs.map((w, i) => (
            <FadeIn key={w.title} delay={i * 0.1}>
              <div className="why-card" style={{ background: t.cardBg, borderRadius: '16px', padding: '32px', transition: 'all 0.3s', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '48px', height: '48px', background: theme === 'dark' ? 'rgba(14,165,233,0.15)' : 'linear-gradient(135deg,#e0f2fe,#bae6fd)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <w.icon size={24} color="#0ea5e9" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: t.text, marginBottom: '10px' }}>{w.title}</h3>
                <p style={{ color: t.textMuted, fontSize: '15px', lineHeight: 1.7 }}>{w.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '100px 48px', background: t.surface, transition: 'background 0.3s' }}>
        <FadeIn><div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ color: '#0ea5e9', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>{tr('section_test_tag')}</p>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '42px', fontWeight: '400', color: t.text }}>{tr('section_test_title')}</h2>
        </div></FadeIn>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
          {testimonials.map((t2, i) => (
            <FadeIn key={t2.name} delay={i * 0.1}>
              <div className="testimonial-card" style={{ background: t.surfaceAlt, borderRadius: '16px', padding: '32px', border: `1.5px solid ${t.border}`, transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ color: t.textMuted, fontSize: '15px', lineHeight: 1.75, marginBottom: '24px', fontStyle: 'italic' }}>"{t2.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>{t2.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: t.text }}>{t2.name}</div>
                    <div style={{ fontSize: '12px', color: t.textFaint }}>{t2.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 48px', background: 'linear-gradient(135deg,#0284c7,#0ea5e9,#38bdf8)' }}>
        <FadeIn><div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '48px', color: 'white', fontWeight: '400', marginBottom: '16px' }}>{tr('cta_title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', marginBottom: '36px', lineHeight: 1.7 }}>{tr('cta_desc')}</p>
          <button onClick={() => router.push('/booking')} style={{ background: 'white', color: '#0284c7', border: 'none', borderRadius: '14px', padding: '18px 44px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', transition: 'all 0.25s', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            <Calendar size={20} color="#0284c7" />{tr('cta_btn')}
          </button>
        </div></FadeIn>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: '80px 48px', background: t.footerBg, transition: 'background 0.3s' }}>
        <FadeIn><div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', textAlign: 'center' }}>
          {[
            { icon: MapPin, label: tr('contact_location'), value: config.address || config.city || 'Sulaymaniyah, Iraq' },
            { icon: Phone, label: tr('contact_phone'), value: config.phone || '+964 750 000 0000' },
            { icon: Clock, label: tr('contact_hours'), value: tr('hours_value') },
          ].map(c => (
            <div key={c.label}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={22} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '8px' }}>{c.label}</div>
              <div style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '500' }}>{c.value}</div>
            </div>
          ))}
        </div></FadeIn>
        <div style={{ textAlign: 'center', marginTop: '48px', color: '#475569', fontSize: '13px' }}>
          © 2026 {config.clinicName}. · <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => router.push('/admin')}>Admin</span>
        </div>
      </section>
    </div>
  )
}