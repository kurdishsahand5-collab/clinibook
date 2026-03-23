'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import ThemeToggle from '@/lib/ThemeToggle'
import { X, Calendar, Clock, Phone, Stethoscope, FileText, CheckCircle, XCircle, AlertCircle, Clock3, Mail } from 'lucide-react'
import config from '@/config'

const statusColors: Record<string, { bg: string, color: string, label: string }> = {
    pending: { bg: '#fef9c3', color: '#ca8a04', label: 'Pending' },
    confirmed: { bg: '#dcfce7', color: '#16a34a', label: 'Confirmed' },
    cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    noshow: { bg: '#f3e8ff', color: '#9333ea', label: 'No Show' },
}
const statusColorsDark: Record<string, { bg: string, color: string, label: string }> = {
    pending: { bg: 'rgba(202,138,4,0.15)', color: '#fbbf24', label: 'Pending' },
    confirmed: { bg: 'rgba(22,163,74,0.15)', color: '#4ade80', label: 'Confirmed' },
    cancelled: { bg: 'rgba(220,38,38,0.15)', color: '#f87171', label: 'Cancelled' },
    noshow: { bg: 'rgba(147,51,234,0.15)', color: '#c084fc', label: 'No Show' },
}

export default function AdminPage() {
    const { t, theme } = useTheme()
    const [authed, setAuthed] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<any | null>(null)
    const [cancelReason, setCancelReason] = useState('')
    const [showCancelBox, setShowCancelBox] = useState(false)
    const [saving, setSaving] = useState(false)

    const sc = theme === 'dark' ? statusColorsDark : statusColors

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError('')
        const { data } = await supabase.from('admins').select('*')
            .eq('username', username).eq('password', password).single()
        if (data) { setAuthed(true); fetchAppointments() }
        else setLoginError('Invalid username or password')
    }

    const fetchAppointments = async () => {
        setLoading(true)
        const { data } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true })
        setAppointments(data || [])
        setLoading(false)
    }

    const updateStatus = async (id: string, status: string, reason?: string) => {
        setSaving(true)
        const update: any = { status }
        if (status === 'cancelled' && reason) update.cancel_reason = reason
        if (status !== 'cancelled') update.cancel_reason = null
        await supabase.from('appointments').update(update).eq('id', id)

        // Send cancellation notification
        if (status === 'cancelled' && reason) {
            const appt = appointments.find(a => a.id === id)
            if (appt) {
                // Send email if patient has email
                if (appt.email) {
                    await fetch('/api/cancel-notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            method: 'email',
                            patientEmail: appt.email,
                            patientName: appt.patient_name,
                            reason,
                            service: appt.service,
                            date: appt.appointment_date,
                            time: appt.appointment_time,
                        })
                    })
                }
                // WhatsApp fallback
                const msg = encodeURIComponent(
                    `Dear ${appt.patient_name}, your ${appt.service} appointment on ${appt.appointment_date} at ${appt.appointment_time} has been cancelled.\n\nReason: ${reason}\n\nPlease contact us to reschedule.`
                )
                window.open(`https://wa.me/${appt.phone?.replace(/\D/g, '')}?text=${msg}`, '_blank')
            }
        }

        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, cancel_reason: update.cancel_reason } : a))
        if (selected?.id === id) setSelected((prev: any) => ({ ...prev, status, cancel_reason: update.cancel_reason }))
        setSaving(false)
        setShowCancelBox(false)
        setCancelReason('')
    }

    const handleStatusClick = (status: string) => {
        if (!selected) return
        if (status === 'cancelled') setShowCancelBox(true)
        else updateStatus(selected.id, status)
    }

    const exportCSV = () => {
        const headers = ['Patient', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Notes', 'Status', 'Cancel Reason']
        const rows = filtered.map(a => [
            a.patient_name, a.phone, (a.email || ''), a.service,
            a.appointment_date, a.appointment_time,
            (a.notes || '').replace(/,/g, ';'), a.status,
            (a.cancel_reason || '').replace(/,/g, ';')
        ])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`
        a.click(); URL.revokeObjectURL(url)
    }

    const filtered = appointments.filter(a => {
        const matchFilter = filter === 'all' || a.status === filter
        const matchSearch = a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
            a.phone?.includes(search) || a.service?.toLowerCase().includes(search.toLowerCase())
        return matchFilter && matchSearch
    })

    const counts = {
        all: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        noshow: appointments.filter(a => a.status === 'noshow').length,
    }

    const inputStyle = {
        padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${t.border}`,
        fontSize: '14px', fontFamily: "'Inter',sans-serif", outline: 'none',
        color: t.text, background: t.inputBg, transition: 'border-color 0.2s',
    }

    if (!authed) return (
        <div style={{ fontFamily: "'Inter',sans-serif", minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', transition: 'background 0.3s' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); input:focus{border-color:#0ea5e9 !important; box-shadow:0 0 0 3px rgba(14,165,233,0.12) !important;}`}</style>
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}><ThemeToggle /></div>
            <div style={{ background: t.surface, borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '380px', boxShadow: '0 4px 40px rgba(0,0,0,0.12)' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '24px' }}>🏥</div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: t.text, margin: '0 0 4px' }}>{config.clinicName}</h1>
                    <p style={{ color: t.textFaint, fontSize: '14px', margin: 0 }}>Admin Dashboard</p>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
                        <input required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' as const }} placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                        <input required type="password" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' as const }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    {loginError && <p style={{ color: '#dc2626', fontSize: '13px', background: theme === 'dark' ? 'rgba(220,38,38,0.1)' : '#fef2f2', padding: '10px 14px', borderRadius: '8px', margin: 0 }}>{loginError}</p>}
                    <button type="submit" style={{ padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Inter',sans-serif", marginTop: '4px' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    )

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", minHeight: '100vh', background: t.bg, transition: 'background 0.3s' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        input:focus, textarea:focus { border-color: #0ea5e9 !important; }
        .row-hover:hover { background: ${t.surfaceAlt} !important; cursor: pointer; }
        select:focus { outline: none; border-color: #0ea5e9 !important; }
        .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

            {/* Patient Detail Modal */}
            {selected && (
                <div onClick={() => { setSelected(null); setShowCancelBox(false); setCancelReason('') }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
                    <div onClick={e => e.stopPropagation()}
                        style={{ background: t.surface, borderRadius: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

                        {/* Modal Header */}
                        <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{selected.patient_name}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>{selected.phone}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ ...sc[selected.status] || sc.pending, padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                    {sc[selected.status]?.label || 'Pending'}
                                </span>
                                <button onClick={() => { setSelected(null); setShowCancelBox(false); setCancelReason('') }}
                                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <X size={18} color="white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px 28px' }}>
                            {/* Details Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                                {[
                                    { icon: Stethoscope, label: 'Service', value: selected.service },
                                    { icon: Calendar, label: 'Date', value: selected.appointment_date },
                                    { icon: Clock, label: 'Time', value: selected.appointment_time },
                                    { icon: Phone, label: 'Phone', value: selected.phone },
                                    ...(selected.email ? [{ icon: Mail, label: 'Email', value: selected.email }] : []),
                                ].map(item => (
                                    <div key={item.label} style={{ background: t.surfaceAlt, borderRadius: '12px', padding: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <item.icon size={13} color="#0ea5e9" />
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: t.text }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            {selected.notes && (
                                <div style={{ background: t.surfaceAlt, borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                        <FileText size={13} color="#0ea5e9" />
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Notes</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: t.text, lineHeight: 1.6, margin: 0 }}>{selected.notes}</p>
                                </div>
                            )}

                            {/* Cancel Reason display */}
                            {selected.status === 'cancelled' && selected.cancel_reason && (
                                <div style={{ background: theme === 'dark' ? 'rgba(220,38,38,0.1)' : '#fef2f2', border: `1px solid ${theme === 'dark' ? 'rgba(220,38,38,0.2)' : '#fecaca'}`, borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                        <XCircle size={13} color="#dc2626" />
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cancellation Reason</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: theme === 'dark' ? '#f87171' : '#dc2626', lineHeight: 1.6, margin: 0 }}>{selected.cancel_reason}</p>
                                </div>
                            )}

                            {/* Cancel reason input */}
                            {showCancelBox && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Reason for Cancellation
                                    </label>
                                    <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                                        placeholder="e.g. Doctor unavailable on this date, please rebook..."
                                        style={{ ...inputStyle, width: '100%', resize: 'none', height: '90px', boxSizing: 'border-box' as const }} />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                        <button onClick={() => { setShowCancelBox(false); setCancelReason('') }}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1.5px solid ${t.border}`, background: t.surface, color: t.textMuted, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                                            Back
                                        </button>
                                        <button onClick={() => updateStatus(selected.id, 'cancelled', cancelReason)}
                                            disabled={!cancelReason.trim() || saving}
                                            style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: cancelReason.trim() ? '#dc2626' : t.border, color: cancelReason.trim() ? 'white' : t.textFaint, fontSize: '13px', fontWeight: '600', cursor: cancelReason.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Inter',sans-serif" }}>
                                            {saving ? 'Saving...' : 'Confirm Cancellation'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {!showCancelBox && (
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Update Status</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                                        {[
                                            { status: 'confirmed', label: 'Confirm', icon: CheckCircle, color: '#16a34a', bg: theme === 'dark' ? 'rgba(22,163,74,0.15)' : '#dcfce7' },
                                            { status: 'pending', label: 'Pending', icon: Clock3, color: '#ca8a04', bg: theme === 'dark' ? 'rgba(202,138,4,0.15)' : '#fef9c3' },
                                            { status: 'noshow', label: 'No Show', icon: AlertCircle, color: '#9333ea', bg: theme === 'dark' ? 'rgba(147,51,234,0.15)' : '#f3e8ff' },
                                            { status: 'cancelled', label: 'Cancel', icon: XCircle, color: '#dc2626', bg: theme === 'dark' ? 'rgba(220,38,38,0.15)' : '#fee2e2' },
                                        ].map(btn => (
                                            <button key={btn.status} className="action-btn"
                                                onClick={() => handleStatusClick(btn.status)}
                                                disabled={selected.status === btn.status || saving}
                                                style={{
                                                    padding: '10px 6px', borderRadius: '10px',
                                                    border: `1.5px solid ${selected.status === btn.status ? btn.color : t.border}`,
                                                    background: selected.status === btn.status ? btn.bg : t.surface,
                                                    color: btn.color, fontSize: '12px', fontWeight: '600',
                                                    cursor: selected.status === btn.status ? 'default' : 'pointer',
                                                    fontFamily: "'Inter',sans-serif", transition: 'all 0.2s',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                    opacity: selected.status === btn.status ? 1 : 0.7,
                                                }}>
                                                <btn.icon size={16} />
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏥</div>
                    <div>
                        <div style={{ fontWeight: '700', color: t.text, fontSize: '15px' }}>{config.clinicName}</div>
                        <div style={{ fontSize: '11px', color: t.textFaint }}>Admin Dashboard</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={exportCSV} style={{ padding: '8px 16px', borderRadius: '8px', border: `1.5px solid ${t.border}`, background: t.surface, color: '#16a34a', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>⬇ Export CSV</button>
                    <button onClick={fetchAppointments} style={{ padding: '8px 16px', borderRadius: '8px', border: `1.5px solid ${t.border}`, background: t.surface, color: t.textMuted, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>↻ Refresh</button>
                    <ThemeToggle />
                    <button onClick={() => setAuthed(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: theme === 'dark' ? 'rgba(220,38,38,0.1)' : '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Sign Out</button>
                </div>
            </div>

            <div style={{ padding: '28px 32px' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total', value: counts.all, color: '#0ea5e9' },
                        { label: 'Pending', value: counts.pending, color: theme === 'dark' ? '#fbbf24' : '#ca8a04' },
                        { label: 'Confirmed', value: counts.confirmed, color: theme === 'dark' ? '#4ade80' : '#16a34a' },
                        { label: 'Cancelled', value: counts.cancelled, color: theme === 'dark' ? '#f87171' : '#dc2626' },
                        { label: 'No Show', value: counts.noshow, color: theme === 'dark' ? '#c084fc' : '#9333ea' },
                    ].map(s => (
                        <div key={s.label} style={{ background: t.surface, borderRadius: '14px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${s.color}`, transition: 'background 0.3s' }}>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '13px', color: t.textFaint, fontWeight: '500', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters + Search */}
                <div style={{ background: t.surface, borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', transition: 'background 0.3s' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' },
                            { key: 'confirmed', label: 'Confirmed' }, { key: 'cancelled', label: 'Cancelled' },
                            { key: 'noshow', label: 'No Show' },
                        ].map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)}
                                style={{
                                    padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: '500',
                                    background: filter === f.key ? 'linear-gradient(135deg,#38bdf8,#0ea5e9)' : t.surfaceAlt,
                                    color: filter === f.key ? 'white' : t.textMuted
                                }}>
                                {f.label} ({counts[f.key as keyof typeof counts]})
                            </button>
                        ))}
                    </div>
                    <input style={{ ...inputStyle, width: '220px' }} placeholder="Search name, phone, service..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Table */}
                <div style={{ background: t.surface, borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'background 0.3s' }}>
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: t.textFaint }}>Loading appointments...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: t.textFaint }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                            <div style={{ fontWeight: '600', color: t.textMuted }}>No appointments found</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${t.border}`, background: t.surfaceAlt }}>
                                    {['Patient', 'Phone', 'Service', 'Date', 'Time', 'Notes', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((a, i) => (
                                    <tr key={a.id} className="row-hover"
                                        onClick={() => { setSelected(a); setShowCancelBox(false); setCancelReason('') }}
                                        style={{ borderBottom: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.surfaceAlt, transition: 'background 0.15s' }}>
                                        <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                                            <div style={{ fontWeight: '600', color: t.text }}>{a.patient_name}</div>
                                            {a.status === 'cancelled' && a.cancel_reason && (
                                                <div style={{ fontSize: '11px', color: theme === 'dark' ? '#f87171' : '#dc2626', marginTop: '2px' }}>⚠ Reason on file</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: t.textMuted, fontSize: '14px' }}>{a.phone}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                                            <span style={{ background: theme === 'dark' ? 'rgba(14,165,233,0.1)' : '#f0f9ff', color: '#0ea5e9', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{a.service}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: t.textMuted, fontSize: '14px' }}>{a.appointment_date}</td>
                                        <td style={{ padding: '14px 16px', color: t.textMuted, fontSize: '14px' }}>{a.appointment_time}</td>
                                        <td style={{ padding: '14px 16px', color: t.textMuted, fontSize: '14px', maxWidth: '160px' }}>
                                            <span title={a.notes || ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {a.notes || <span style={{ color: t.textFaint }}>—</span>}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ ...sc[a.status] || sc.pending, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                                {sc[a.status]?.label || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {filtered.length > 0 && (
                    <div style={{ marginTop: '12px', color: t.textFaint, fontSize: '13px', textAlign: 'right' }}>
                        Showing {filtered.length} of {appointments.length} appointments · Click any row to view details
                    </div>
                )}
            </div>
        </div>
    )
}
