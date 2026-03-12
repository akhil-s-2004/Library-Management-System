import { useState, useEffect } from 'react'
import { BookOpen, Users, AlertCircle, Clock, TrendingUp, CheckCircle, XCircle, BookMarked, Loader2 } from 'lucide-react'
import * as adminService from '../services/adminService'

type Analytics = {
    total_books: number
    total_members: number
    active_issues: number
    total_reservations: number
    outstanding_fines: number
}

type PendingUser = {
    userId: string
    name: string
    email: string
    createdAt: string
}

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [ana, pending] = await Promise.all([
                    adminService.fetchAnalytics(),
                    adminService.fetchPendingUsers(),
                ])
                setAnalytics(ana)
                setPendingUsers(Array.isArray(pending) ? pending : [])
            } catch {
                // silently show placeholders
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleApprove = async (userId: string) => {
        setApproving(userId + ':approve')
        try {
            await adminService.approveUser(userId)
            setPendingUsers(prev => prev.filter(u => u.userId !== userId))
        } finally {
            setApproving(null)
        }
    }

    const handleReject = async (userId: string) => {
        setApproving(userId + ':reject')
        try {
            await adminService.rejectUser(userId)
            setPendingUsers(prev => prev.filter(u => u.userId !== userId))
        } finally {
            setApproving(null)
        }
    }

    const stats = [
        {
            icon: <BookOpen size={22} className='text-[#570000]' />,
            label: 'Total Books',
            value: loading ? '—' : String(analytics?.total_books ?? 0),
            change: 'in catalogue',
        },
        {
            icon: <BookMarked size={22} className='text-[#570000]' />,
            label: 'Books Issued',
            value: loading ? '—' : String(analytics?.active_issues ?? 0),
            change: 'currently borrowed',
        },
        {
            icon: <Clock size={22} className='text-[#570000]' />,
            label: 'Reservations',
            value: loading ? '—' : String(analytics?.total_reservations ?? 0),
            change: 'active reservations',
        },
        {
            icon: <AlertCircle size={22} className='text-[#570000]' />,
            label: 'Outstanding Fines',
            value: loading ? '—' : `₹${Math.round(Number(analytics?.outstanding_fines ?? 0))}`,
            change: 'unpaid fines',
        },
        {
            icon: <Users size={22} className='text-[#570000]' />,
            label: 'Total Members',
            value: loading ? '—' : String(analytics?.total_members ?? 0),
            change: `${pendingUsers.length} pending approval`,
        },
        {
            icon: <TrendingUp size={22} className='text-[#570000]' />,
            label: 'Pending Approvals',
            value: loading ? '—' : String(pendingUsers.length),
            change: 'awaiting review',
        },
    ]

    return (
        <div className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8'>
            <div>
                <h1 className='text-2xl font-bold text-[#570000]'>Admin Dashboard</h1>
                <p className='text-gray-500 text-sm mt-1'>Overview of all library activity</p>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {stats.map((s, i) => (
                    <div key={i} className='bg-white border border-[#e8d4d4] rounded-2xl px-5 py-5 flex items-center gap-4 shadow-sm'>
                        <div className='w-12 h-12 bg-[#f4e7e5] rounded-xl flex items-center justify-center flex-shrink-0'>
                            {s.icon}
                        </div>
                        <div>
                            {loading ? (
                                <Loader2 size={18} className='animate-spin text-[#570000] mb-1' />
                            ) : (
                                <p className='text-2xl font-bold text-[#570000]'>{s.value}</p>
                            )}
                            <p className='text-xs text-gray-500 font-medium'>{s.label}</p>
                            <p className='text-xs text-gray-400 mt-0.5'>{s.change}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom: Pending Approvals */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Info bar */}
                <div className='col-span-1 lg:col-span-2 bg-white border border-[#e8d4d4] rounded-2xl shadow-sm overflow-hidden'>
                    <div className='px-5 py-4 border-b border-[#f0dada]'>
                        <h2 className='font-bold text-[#570000]'>Quick Guide</h2>
                    </div>
                    <div className='px-5 py-5 flex flex-col gap-3'>
                        {[
                            { step: '1', title: 'Add Books by ISBN', desc: 'Go to Books → Add Book → Enter ISBN → Click Lookup. Google Books fills in the details automatically.' },
                            { step: '2', title: 'Generate Physical Copies', desc: 'After adding a book, expand the row to view and add physical copies, each with a unique QR code.' },
                            { step: '3', title: 'Approve Registrations', desc: 'New members register with "pending" status. Approve them here or in the Users tab to grant full access.' },
                            { step: '4', title: 'Manage Fines', desc: 'View and pay/waive outstanding fines from the Fines section.' },
                        ].map(item => (
                            <div key={item.step} className='flex gap-4 items-start'>
                                <div className='w-7 h-7 bg-[#570000] text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0'>{item.step}</div>
                                <div>
                                    <p className='text-sm font-semibold text-gray-800'>{item.title}</p>
                                    <p className='text-xs text-gray-500 mt-0.5'>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className='bg-white border border-[#e8d4d4] rounded-2xl shadow-sm overflow-hidden'>
                    <div className='px-5 py-4 border-b border-[#f0dada] flex items-center justify-between'>
                        <h2 className='font-bold text-[#570000]'>Pending Approvals</h2>
                        {pendingUsers.length > 0 && (
                            <span className='bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full'>
                                {pendingUsers.length}
                            </span>
                        )}
                    </div>
                    <div className='flex flex-col divide-y divide-[#f8eded]'>
                        {loading ? (
                            <div className='p-6 flex justify-center'>
                                <Loader2 className='animate-spin text-[#570000]' size={20} />
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className='p-6 text-center'>
                                <CheckCircle size={24} className='text-green-400 mx-auto mb-2' />
                                <p className='text-sm text-gray-400'>All caught up! No pending approvals.</p>
                            </div>
                        ) : pendingUsers.map((u) => {
                            const isBusy = approving?.startsWith(u.userId)
                            return (
                                <div key={u.userId} className='px-5 py-3 flex flex-col gap-2'>
                                    <div>
                                        <p className='text-sm font-semibold text-gray-800'>{u.name}</p>
                                        <p className='text-xs text-gray-400'>
                                            {u.email} · {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                                        </p>
                                    </div>
                                    <div className='flex gap-2'>
                                        {isBusy ? (
                                            <Loader2 size={16} className='animate-spin text-[#570000]' />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(u.userId)}
                                                    className='flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors'>
                                                    <CheckCircle size={12} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(u.userId)}
                                                    className='flex items-center gap-1 border border-red-400 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors'>
                                                    <XCircle size={12} /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
