'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/LanguageContext'
import { useTheme } from '@/lib/ThemeContext'
import ThemeToggle from '@/lib/ThemeToggle'
import LangSwitcher from '@/lib/LangSwitcher'
import { Calendar, Clock, User, Phone, Stethoscope, CheckCircle, ArrowLeft, MapPin, Mail } from 'lucide-react'
import config from '@/config'

const services = config.services || ['General Checkup', 'Dental Cleaning', 'Eye Examination', 'Blood Test', 'X-Ray', 'Consultation']

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

export default function BookingPage() {
    const router = useRouter()
    const { tr } = useLang()
    const { t, theme } = useTheme()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [form, setForm] = useState({
        patient_name: '', phone: '', email: '', service: '',
        appointment_date: '', appointment_time: '', notes: '',
    })

    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

    const handleSubmit = async () => {
        setLoading(true)
        const { error } = await supabase.from('appointments').insert([{ ...form, status: 'pending' }])
        setLoading(false)
        if (!error) setDone(true)
    }

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const step1Valid = form.patient_name && form.phone && form.email && isValidEmail(form.email)

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '10px',
        border: `1.5px solid ${t.border}`, fontSize: '15px', fontFamily: 'inherit',
        outline: 'none', color: t.text, background: t.inputBg,
        transition: 'border-color 0.2s', boxSizing: 'border-box' as const,
    }

    const labelStyle = {
        fontSize: '12px', fontWeight: '600' as const, color: t.textMuted,
        display: 'block' as const, marginBottom: '6px',
        textTransform: 'uppercase' as const, letterSpacing: '0.5px',
    }

    if (done) return (
        <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: '100vh', background: t.heroBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', transition: 'background 0.3s' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
            <div style={{ background: t.surface, borderRadius: '24px', padding: '60px 48px', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
                <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={36} color="white" />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: t.text, marginBottom: '12px' }}>{tr('book_done_title')}</h2>
                <p style={{ color: t.textMuted, fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>{tr('book_done_sub')}</p>
                <div style={{ background: t.surfaceAlt, borderRadius: '14px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
                    {[
                        { label: tr('book_name'), value: form.patient_name },
                        { label: tr('book_service'), value: form.service },
                        { label: tr('book_date'), value: form.appointment_date },
                        { label: tr('book_time'), value: form.appointment_time },
                    ].map(r => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${t.border}`, fontSize: '14px' }}>
                            <span style={{ color: t.textFaint, fontWeight: '500' }}>{r.label}</span>
                            <span style={{ color: t.text, fontWeight: '600' }}>{r.value}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => router.push('/')} style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                    {tr('book_done_home')}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: '100vh', background: t.heroBg, transition: 'background 0.3s' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #0ea5e9 !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.12) !important; }
        .time-slot:hover { border-color: #0ea5e9 !important; background: ${theme === 'dark' ? 'rgba(14,165,233,0.1)' : '#f0f9ff'} !important; }
        .service-opt:hover { border-color: #0ea5e9 !important; background: ${theme === 'dark' ? 'rgba(14,165,233,0.1)' : '#f0f9ff'} !important; }
      `}</style>

            {/* Header */}
            <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => router.push('/')} style={{ background: t.surfaceAlt, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={18} color={t.textMuted} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#38bdf8,#0284c7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Stethoscope size={16} color="white" />
                        </div>
                        <span style={{ fontWeight: '700', color: t.text, fontSize: '15px' }}>{config.clinicName}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LangSwitcher />
                    <ThemeToggle />
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px 40px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

                {/* Main Form */}
                <div>
                    {/* Progress */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: '700', transition: 'all 0.3s',
                                    background: step >= s ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : t.border,
                                    color: step >= s ? 'white' : t.textFaint,
                                }}>{step > s ? <CheckCircle size={16} /> : s}</div>
                                {s < 3 && <div style={{ width: '48px', height: '2px', background: step > s ? '#0ea5e9' : t.border, transition: 'background 0.3s' }} />}
                            </div>
                        ))}
                        <span style={{ marginLeft: '8px', fontSize: '13px', color: t.textMuted, fontWeight: '500' }}>
                            {step === 1 ? tr('book_step1') : step === 2 ? tr('book_step2') : tr('book_step3')}
                        </span>
                    </div>

                    <div style={{ background: t.surface, borderRadius: '20px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>

                        {/* Step 1 */}
                        {step === 1 && (
                            <div>
                                <div style={{ marginBottom: '28px' }}>
                                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: t.text, marginBottom: '6px' }}>{tr('book_title1')}</h2>
                                    <p style={{ color: t.textFaint, fontSize: '14px' }}>{tr('book_sub1')}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    <div>
                                        <label style={labelStyle}><User size={11} style={{ display: 'inline', marginRight: '4px' }} />{tr('book_name')}</label>
                                        <input style={inputStyle} placeholder="e.g. Ahmad Hassan" value={form.patient_name} onChange={e => set('patient_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />{tr('book_phone')}</label>
                                        <input style={inputStyle} placeholder="+964 750..." value={form.phone} onChange={e => set('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><Mail size={11} style={{ display: 'inline', marginRight: '4px' }} />Email</label>
                                        <input
                                            type="email"
                                            style={{
                                                ...inputStyle,
                                                borderColor: form.email && !isValidEmail(form.email) ? '#dc2626' : t.border,
                                            }}
                                            placeholder="patient@email.com"
                                            value={form.email}
                                            onChange={e => set('email', e.target.value)}
                                        />
                                        {form.email && !isValidEmail(form.email) && (
                                            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>Please enter a valid email address</p>
                                        )}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{tr('book_notes')} <span style={{ color: t.textFaint, fontWeight: '400' }}>({tr('book_optional')})</span></label>
                                        <textarea style={{ ...inputStyle, resize: 'none', height: '90px' }} placeholder={tr('book_notes_ph')} value={form.notes} onChange={e => set('notes', e.target.value)} />
                                    </div>
                                </div>
                                <button disabled={!step1Valid} onClick={() => setStep(2)}
                                    style={{ marginTop: '28px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: step1Valid ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : t.border, color: step1Valid ? 'white' : t.textFaint, fontSize: '15px', fontWeight: '600', cursor: step1Valid ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                    {tr('book_continue')}
                                </button>
                            </div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <div>
                                <div style={{ marginBottom: '28px' }}>
                                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: t.text, marginBottom: '6px' }}>{tr('book_title2')}</h2>
                                    <p style={{ color: t.textFaint, fontSize: '14px' }}>{tr('book_sub2')}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {services.map((s: string) => (
                                        <div key={s} className="service-opt" onClick={() => set('service', s)}
                                            style={{ padding: '16px', borderRadius: '12px', border: `1.5px solid ${form.service === s ? '#0ea5e9' : t.border}`, background: form.service === s ? (theme === 'dark' ? 'rgba(14,165,233,0.1)' : '#f0f9ff') : t.surface, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: form.service === s ? '#0284c7' : t.text }}>{s}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1.5px solid ${t.border}`, background: t.surface, color: t.textMuted, fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{tr('book_back')}</button>
                                    <button disabled={!form.service} onClick={() => setStep(3)}
                                        style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: form.service ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : t.border, color: form.service ? 'white' : t.textFaint, fontSize: '15px', fontWeight: '600', cursor: form.service ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                                        {tr('book_continue')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div>
                                <div style={{ marginBottom: '28px' }}>
                                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: t.text, marginBottom: '6px' }}>{tr('book_title3')}</h2>
                                    <p style={{ color: t.textFaint, fontSize: '14px' }}>{tr('book_sub3')}</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}><Calendar size={11} style={{ display: 'inline', marginRight: '4px' }} />{tr('book_date')}</label>
                                    <input type="date" style={inputStyle} min={new Date().toISOString().split('T')[0]} value={form.appointment_date} onChange={e => set('appointment_date', e.target.value)} />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={labelStyle}><Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />{tr('book_time')}</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                                        {timeSlots.map(time => (
                                            <div key={time} className="time-slot" onClick={() => set('appointment_time', time)}
                                                style={{ padding: '10px 6px', borderRadius: '8px', border: `1.5px solid ${form.appointment_time === time ? '#0ea5e9' : t.border}`, background: form.appointment_time === time ? (theme === 'dark' ? 'rgba(14,165,233,0.1)' : '#f0f9ff') : t.surface, cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: form.appointment_time === time ? '#0284c7' : t.textMuted, transition: 'all 0.15s' }}>
                                                {time}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1.5px solid ${t.border}`, background: t.surface, color: t.textMuted, fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{tr('book_back')}</button>
                                    <button disabled={!form.appointment_date || !form.appointment_time || loading} onClick={handleSubmit}
                                        style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: form.appointment_date && form.appointment_time ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : t.border, color: form.appointment_date && form.appointment_time ? 'white' : t.textFaint, fontSize: '15px', fontWeight: '600', cursor: form.appointment_date && form.appointment_time ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                                        {loading ? tr('book_confirming') : tr('book_confirm_btn')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: t.surface, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.text, marginBottom: '16px' }}>{tr('book_clinic_info')}</h3>
                        {[
                            { icon: MapPin, label: tr('book_location'), value: (config as any).address || (config as any).city || 'Sulaymaniyah, Iraq' },
                            { icon: Phone, label: tr('book_phone_label'), value: config.phone || '+964 750 000 0000' },
                            { icon: Clock, label: tr('book_hours'), value: tr('hours_value') },
                            { icon: Stethoscope, label: tr('book_clinic_label'), value: config.clinicName },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <div style={{ width: '32px', height: '32px', background: theme === 'dark' ? 'rgba(14,165,233,0.1)' : '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <item.icon size={15} color="#0ea5e9" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: t.textFaint, fontWeight: '600', letterSpacing: '0.5px' }}>{item.label}</div>
                                    <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', marginTop: '2px' }}>{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚡</div>
                        <h4 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{tr('book_sameday_title')}</h4>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.6 }}>{tr('book_sameday_desc')}</p>
                    </div>

                    <div style={{ background: t.surface, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔒</div>
                        <h4 style={{ color: t.text, fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{tr('book_privacy_title')}</h4>
                        <p style={{ color: t.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{tr('book_privacy_desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}