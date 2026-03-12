import { useState, useEffect, useCallback } from 'react'
import { Search, CheckCircle, Minus, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import * as adminService from '../services/adminService'

type FineStatus = 'Pending' | 'Paid' | 'Waived'

type Fine = {
    id: number | null
    member: string
    email: string
    book: string
    copyId: string
    daysOverdue: number
    amount: number
    dueDate: string
    status: FineStatus
}

const mapStatus = (paidStatus: string): FineStatus => {
    if (paidStatus === 'paid') return 'Paid'
    if (paidStatus === 'waived') return 'Waived'
    return 'Pending'
}

const statusStyle: Record<FineStatus, string> = {
    Pending: 'bg-red-100 text-red-700',
    Paid: 'bg-green-100 text-green-700',
    Waived: 'bg-blue-100 text-blue-700',
}

const tabs = ['All', 'Pending', 'Paid', 'Waived'] as const
type FilterTab = typeof tabs[number]

const AdminFines = () => {
    const [fines, setFines] = useState<Fine[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState<number | null>(null)
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState<FilterTab>('All')
    const [confirm, setConfirm] = useState<{ action: 'paid' | 'waive'; fine: Fine } | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const loadFines = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await adminService.fetchFines()
            const mapped: Fine[] = (Array.isArray(data) ? data : []).map((f: any) => ({
                id: f.id ?? f.fineId,
                member: f.member ?? f.memberName ?? '—',
                email: f.email ?? f.memberEmail ?? '—',
                book: f.bookTitle ?? '—',
                copyId: f.copyId != null ? String(f.copyId) : '—',
                daysOverdue: f.daysOverdue ?? 0,
                amount: Number(f.amount ?? 0),
                dueDate: f.dueDate ?? '—',
                status: mapStatus(f.paidStatus),
            }))
            setFines(mapped)
        } catch {
            setError('Failed to load fines. Is the backend running?')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadFines() }, [loadFines])

    const handleMarkPaid = async (id: number) => {
        setSaving(id)
        setActionError(null)
        try {
            await adminService.markFinePaid(id)
            setFines(prev => prev.map(f => f.id === id ? { ...f, status: 'Paid' } : f))
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to mark fine as paid.'
            setActionError(msg)
        } finally {
            setSaving(null)
        }
    }

    const handleWaive = async (id: number) => {
        setSaving(id)
        setActionError(null)
        try {
            await adminService.waiveFine(id)
            setFines(prev => prev.map(f => f.id === id ? { ...f, status: 'Waived', amount: 0 } : f))
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to waive fine.'
            setActionError(msg)
        } finally {
            setSaving(null)
        }
    }

    const handleConfirm = async () => {
        if (!confirm || confirm.fine.id === null) return
        const { action, fine } = confirm
        setConfirm(null)
        if (action === 'paid') await handleMarkPaid(fine.id!)
        else await handleWaive(fine.id!)
    }

    const filtered = fines.filter((f) => {
        const matchTab = activeTab === 'All' || f.status === activeTab
        const matchQuery =
            f.member.toLowerCase().includes(query.toLowerCase()) ||
            f.book.toLowerCase().includes(query.toLowerCase())
        return matchTab && matchQuery
    })

    const totalOutstanding = fines.filter((f) => f.status === 'Pending').reduce((s, f) => s + f.amount, 0)
    const totalCollected = fines.filter((f) => f.status === 'Paid').reduce((s, f) => s + f.amount, 0)
    const totalWaived = fines.filter((f) => f.status === 'Waived').reduce((s, f) => s + f.amount, 0)

    return (
        <div className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-[#570000]'>Fines Management</h1>
                    <p className='text-gray-500 text-sm mt-1'>Accept payments or waive fines for members</p>
                </div>
                <button onClick={loadFines} className='w-9 h-9 flex items-center justify-center border border-[#e8d4d4] rounded-full hover:bg-[#fdf5f5] transition-colors'>
                    <RefreshCw size={15} className='text-[#570000]' />
                </button>
            </div>

            {/* Summary Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {[
                    { label: 'Outstanding', value: `₹${Math.round(totalOutstanding)}`, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                    { label: 'Collected', value: `₹${Math.round(totalCollected)}`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                    { label: 'Waived', value: `₹${Math.round(totalWaived)}`, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                ].map((card) => (
                    <div key={card.label} className='rounded-2xl px-6 py-5 border shadow-sm flex flex-col gap-1'
                        style={{ background: card.bg, borderColor: card.border }}>
                        <p className='text-xs font-bold text-gray-500 uppercase tracking-wide'>{card.label}</p>
                        <p className='text-3xl font-bold' style={{ color: card.color }}>{card.value}</p>
                    </div>
                ))}
            </div>

            {error && (
                <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {actionError && (
                <div className='flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                    <span className='flex items-center gap-2'><AlertCircle size={16} /> {actionError}</span>
                    <button onClick={() => setActionError(null)} className='text-red-400 hover:text-red-600 font-bold text-xs'>✕</button>
                </div>
            )}

            {/* Search */}
            <div className='flex items-center gap-3 bg-white border border-[#e8d4d4] rounded-full px-4 py-2.5 shadow-sm max-w-md'>
                <Search size={16} className='text-gray-400' />
                <input type='text' placeholder='Search by member or book...'
                    className='flex-1 outline-none text-sm text-gray-700'
                    value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            {/* Tabs */}
            <div className='flex gap-1 bg-[#f4e7e5] p-1 rounded-2xl w-fit'>
                {tabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-[#570000] text-white shadow' : 'text-[#570000] hover:bg-[#ead4d4]'}`}
                    >
                        {tab}
                        {tab !== 'All' && (
                            <span className='ml-1 text-xs opacity-70'>({fines.filter((f) => f.status === tab).length})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className='bg-white border border-[#e8d4d4] rounded-2xl shadow-sm overflow-hidden'><div className='overflow-x-auto'><table className='w-full'>
                <thead>
                    <tr className='bg-[#fdf5f5]'>
                        {['Member', 'Book', 'Copy ID', 'Due Date', 'Overdue', 'Amount', 'Status', 'Actions'].map((h) => (
                            <th key={h} className='px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide'>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className='divide-y divide-[#f8eded]'>
                    {loading ? (
                        <tr><td colSpan={8} className='p-8 text-center'><Loader2 className='animate-spin mx-auto text-[#570000]' size={24} /></td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={8} className='p-8 text-center text-gray-400 text-sm'>No fines found.</td></tr>
                    ) : filtered.map((fine, idx) => (
                        <tr key={fine.id ?? `pending-${idx}`} className='hover:bg-[#fdf9f9] transition-colors'>
                            <td className='px-4 py-3'>
                                <p className='text-sm font-semibold text-gray-800'>{fine.member}</p>
                                <p className='text-xs text-gray-400'>{fine.email}</p>
                            </td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{fine.book}</td>
                            <td className='px-4 py-3 text-xs font-mono text-gray-500'>{fine.copyId}</td>
                            <td className='px-4 py-3 text-sm text-gray-500'>{fine.dueDate}</td>
                            <td className='px-4 py-3 text-sm font-semibold text-red-600'>
                                {fine.daysOverdue > 0 ? `${fine.daysOverdue} days` : '—'}
                            </td>
                            <td className='px-4 py-3 text-sm font-bold text-[#570000]'>₹{fine.amount}</td>
                            <td className='px-4 py-3'>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle[fine.status]}`}>
                                    {fine.status}
                                </span>
                            </td>
                            <td className='px-4 py-3'>
                                {saving !== null && saving === fine.id ? (
                                    <Loader2 size={16} className='animate-spin text-[#570000]' />
                                ) : fine.status === 'Pending' && fine.id !== null ? (
                                    <div className='flex items-center gap-1'>
                                        <button
                                            onClick={() => setConfirm({ action: 'paid', fine })}
                                            className='flex items-center gap-1 text-[10px] font-semibold bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-full transition-colors'
                                        >
                                            <CheckCircle size={10} /> Mark Paid
                                        </button>
                                        <button
                                            onClick={() => setConfirm({ action: 'waive', fine })}
                                            className='flex items-center gap-1 text-[10px] font-semibold border border-blue-400 text-blue-600 px-2.5 py-1.5 rounded-full hover:bg-blue-50 transition-colors'
                                        >
                                            <Minus size={10} /> Waive
                                        </button>
                                    </div>
                                ) : fine.status === 'Pending' && fine.id === null ? (
                                    <span className='text-xs text-amber-500 italic'>Auto-accruing</span>
                                ) : (
                                    <span className='text-xs text-gray-400 italic'>No action</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table></div>
            </div>
            {/* Confirm Action Modal */}
            {confirm && (
                <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm'>
                        <div className='px-6 py-5 border-b border-[#f0dada]'>
                            <h2 className='font-bold text-[#570000] text-lg'>
                                {confirm.action === 'paid' ? 'Mark Fine as Paid?' : 'Waive Fine?'}
                            </h2>
                        </div>
                        <div className='px-6 py-5 flex flex-col gap-2'>
                            <p className='text-sm text-gray-600'>
                                {confirm.action === 'paid'
                                    ? <>Mark the ₹{confirm.fine.amount} fine for <span className='font-semibold text-gray-800'>{confirm.fine.member}</span> as paid?</>
                                    : <>Waive the ₹{confirm.fine.amount} fine for <span className='font-semibold text-gray-800'>{confirm.fine.member}</span>? This cannot be undone.</>
                                }
                            </p>
                            <p className='text-xs text-gray-400'>{confirm.fine.book}</p>
                        </div>
                        <div className='px-6 py-4 border-t border-[#f0dada] flex justify-end gap-3'>
                            <button
                                onClick={() => setConfirm(null)}
                                className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all ${
                                    confirm.action === 'paid' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {confirm.action === 'paid' ? 'Mark Paid' : 'Waive Fine'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminFines
