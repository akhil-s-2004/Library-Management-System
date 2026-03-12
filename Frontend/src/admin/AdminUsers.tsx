import { useState, useEffect, useCallback } from 'react'
import { Search, CheckCircle, XCircle, UserX, Plus, X, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import * as adminService from '../services/adminService'

type UserStatus = 'pending' | 'active' | 'suspended' | 'rejected'

type User = {
    userId: string
    name: string
    email: string
    phone: string
    role: string
    status: UserStatus
    membershipNumber: string
    createdAt: string
}

const statusStyle: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-amber-100 text-amber-700',
}

const STATUS_LABELS: Record<string, string> = {
    active: 'Active', pending: 'Pending', rejected: 'Rejected', suspended: 'Suspended',
}

const tabs = ['All', 'Active', 'Pending', 'Suspended'] as const
type FilterTab = typeof tabs[number]

const emptyForm = { name: '', email: '', phone: '', role: 'member', password: '' }

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null) // userId of action being processed
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState<FilterTab>('All')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [addError, setAddError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(0)
    const PAGE_SIZE = 20
    const [confirm, setConfirm] = useState<{ action: string; userId: string; userName: string } | null>(null)

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await adminService.fetchUsers()
            setUsers(Array.isArray(data) ? data : [])
        } catch {
            setError('Failed to load users. Is the backend running?')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadUsers() }, [loadUsers])

    const handleApprove = async (userId: string) => {
        setSaving(userId + ':approve')
        try {
            await adminService.approveUser(userId)
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'active' } : u))
        } catch {
            alert('Failed to approve user.')
        } finally {
            setSaving(null)
        }
    }

    const handleReject = async (userId: string) => {
        setSaving(userId + ':reject')
        try {
            await adminService.rejectUser(userId)
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'suspended' } : u))
        } catch {
            alert('Failed to reject user.')
        } finally {
            setSaving(null)
        }
    }

    const handleSuspend = async (userId: string) => {
        setSaving(userId + ':suspend')
        try {
            await adminService.updateUser(userId, { status: 'suspended' })
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'suspended' } : u))
        } catch {
            alert('Failed to suspend user.')
        } finally {
            setSaving(null)
        }
    }

    const handleReactivate = async (userId: string) => {
        setSaving(userId + ':reactivate')
        try {
            await adminService.approveUser(userId)
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'active' } : u))
        } catch {
            alert('Failed to reactivate user.')
        } finally {
            setSaving(null)
        }
    }

    const handleConfirm = async () => {
        if (!confirm) return
        const { action, userId } = confirm
        setConfirm(null)
        if (action === 'approve') await handleApprove(userId)
        else if (action === 'reject') await handleReject(userId)
        else if (action === 'suspend') await handleSuspend(userId)
        else if (action === 'reactivate') await handleReactivate(userId)
    }

    const handleAddUser = async () => {
        if (!form.name || !form.email || !form.password) return
        setAddError(null)
        setSaving('new')
        try {
            await adminService.createAdminUser({
                name: form.name, email: form.email,
                phone: form.phone, role: form.role, password: form.password,
            })
            setForm(emptyForm)
            setShowModal(false)
            loadUsers()
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } }; message?: string }
            setAddError(axiosErr?.response?.data?.error || axiosErr?.message || 'Failed to create user.')

        } finally {
            setSaving(null)
        }
    }

    const tabCount = (tab: string) =>
        users.filter(u => u.status?.toLowerCase() === tab.toLowerCase()).length

    const filtered = users.filter(u => {
        const matchesTab = activeTab === 'All' || u.status?.toLowerCase() === activeTab.toLowerCase()
        const matchesQuery =
            u.name?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase()) ||
            u.membershipNumber?.toLowerCase().includes(query.toLowerCase())
        return matchesTab && matchesQuery
    })

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

    const handleTabChange = (tab: FilterTab) => { setActiveTab(tab); setCurrentPage(0) }
    const handleQueryChange = (q: string) => { setQuery(q); setCurrentPage(0) }

    return (
        <div className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-[#570000]'>Users</h1>
                    <p className='text-gray-500 text-sm mt-1'>{users.length} registered users</p>
                </div>
                <div className='flex items-center gap-2'>
                    <button onClick={loadUsers} className='w-9 h-9 flex items-center justify-center border border-[#e8d4d4] rounded-full hover:bg-[#fdf5f5] transition-colors'>
                        <RefreshCw size={15} className='text-[#570000]' />
                    </button>
                    <button
                        onClick={() => { setShowModal(true); setAddError(null) }}
                        className='flex items-center gap-2 bg-[#570000] hover:bg-[#7a1c18] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-md transition-all'
                    >
                        <Plus size={16} /> Add User
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Search */}
            <div className='flex items-center gap-3 bg-white border border-[#e8d4d4] rounded-full px-4 py-2.5 shadow-sm max-w-md'>
                <Search size={16} className='text-gray-400' />
                <input type='text' placeholder='Search by name, email, or membership no...'
                    className='flex-1 outline-none text-sm text-gray-700'
                    value={query} onChange={(e) => handleQueryChange(e.target.value)} />
            </div>

            {/* Filter Tabs */}
            <div className='flex gap-1 bg-[#f4e7e5] p-1 rounded-2xl w-fit flex-wrap'>
                {tabs.map((tab) => (
                    <button key={tab} onClick={() => handleTabChange(tab)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-[#570000] text-white shadow' : 'text-[#570000] hover:bg-[#ead4d4]'}`}>
                        {tab}
                        {tab !== 'All' && (
                            <span className='ml-1 text-xs opacity-70'>({tabCount(tab)})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className='bg-white border border-[#e8d4d4] rounded-2xl shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-[#fdf5f5]'>
                                {['Member', 'Membership No.', 'Contact', 'Joined', 'Role', 'Status', 'Actions'].map(h => (
                                    <th key={h} className='px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide'>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[#f8eded]'>
                            {loading ? (
                                <tr><td colSpan={7} className='p-8 text-center'><Loader2 className='animate-spin mx-auto text-[#570000]' size={24} /></td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={7} className='p-8 text-center text-gray-400 text-sm'>No users found.</td></tr>
                            ) : paginated.map((user) => {
                                const status = user.status?.toLowerCase() as UserStatus
                                const isBusy = saving?.startsWith(user.userId)
                                return (
                                    <tr key={user.userId} className='hover:bg-[#fdf9f9] transition-colors'>
                                        <td className='px-4 py-3'>
                                            <p className='text-sm font-semibold text-gray-800'>{user.name}</p>
                                            <p className='text-xs text-gray-400'>{user.email}</p>
                                        </td>
                                        <td className='px-4 py-3 text-xs font-mono text-gray-500'>{user.membershipNumber ?? '—'}</td>
                                        <td className='px-4 py-3'>
                                            <p className='text-sm text-gray-600'>{user.email}</p>
                                            <p className='text-xs text-gray-400'>{user.phone ?? '—'}</p>
                                        </td>
                                        <td className='px-4 py-3 text-sm text-gray-500'>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td className='px-4 py-3'>
                                            <span className='text-xs font-semibold capitalize bg-[#f4e7e5] text-[#570000] px-2 py-1 rounded-full'>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle[status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABELS[status] ?? status}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex items-center gap-1 flex-wrap'>
                                                {isBusy ? (
                                                    <Loader2 size={16} className='animate-spin text-[#570000]' />
                                                ) : (
                                                    <>
                                                        {status === 'pending' && (
                                                            <>
                                                                <button onClick={() => setConfirm({ action: 'approve', userId: user.userId, userName: user.name })}
                                                                    className='flex items-center gap-1 text-[10px] font-semibold bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-full transition-colors'>
                                                                    <CheckCircle size={10} /> Approve
                                                                </button>
                                                                <button onClick={() => setConfirm({ action: 'reject', userId: user.userId, userName: user.name })}
                                                                    className='flex items-center gap-1 text-[10px] font-semibold border border-red-400 text-red-500 px-2 py-1 rounded-full hover:bg-red-50 transition-colors'>
                                                                    <XCircle size={10} /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {status === 'active' && (
                                                            <button onClick={() => setConfirm({ action: 'suspend', userId: user.userId, userName: user.name })}
                                                                className='flex items-center gap-1 text-[10px] font-semibold border border-amber-400 text-amber-600 px-2 py-1 rounded-full hover:bg-amber-50 transition-colors'>
                                                                <UserX size={10} /> Suspend
                                                            </button>
                                                        )}
                                                        {(status === 'suspended' || status === 'rejected') && (
                                                            <button onClick={() => setConfirm({ action: 'reactivate', userId: user.userId, userName: user.name })}
                                                                className='flex items-center gap-1 text-[10px] font-semibold border border-green-400 text-green-600 px-2 py-1 rounded-full hover:bg-green-50 transition-colors'>
                                                                <CheckCircle size={10} /> Reactivate
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-gray-500'>
                        Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} users
                    </p>
                    <div className='flex items-center gap-1'>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className='px-3 py-1.5 text-sm font-semibold rounded-xl border border-[#e8d4d4] text-[#570000] hover:bg-[#fdf5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                        >← Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i).filter(i =>
                            i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1
                        ).reduce<(number | '...')[]>((acc, i, idx, arr) => {
                            if (idx > 0 && (i as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                            acc.push(i)
                            return acc
                        }, []).map((item, idx) =>
                            item === '...' ? (
                                <span key={`e${idx}`} className='px-2 text-gray-400'>…</span>
                            ) : (
                                <button key={item} onClick={() => setCurrentPage(item as number)}
                                    className={`w-8 h-8 text-sm font-semibold rounded-xl transition-colors ${currentPage === item ? 'bg-[#570000] text-white' : 'border border-[#e8d4d4] text-[#570000] hover:bg-[#fdf5f5]'}`}>
                                    {(item as number) + 1}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage === totalPages - 1}
                            className='px-3 py-1.5 text-sm font-semibold rounded-xl border border-[#e8d4d4] text-[#570000] hover:bg-[#fdf5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                        >Next →</button>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showModal && (
                <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-md'>
                        <div className='flex items-center justify-between px-6 py-5 border-b border-[#f0dada]'>
                            <h2 className='font-bold text-[#570000] text-xl'>Add New User</h2>
                            <button onClick={() => setShowModal(false)}
                                className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4e7e5] transition-colors'>
                                <X size={16} className='text-[#570000]' />
                            </button>
                        </div>
                        <div className='px-6 py-5 flex flex-col gap-4'>
                            <div className='bg-green-50 border border-green-200 rounded-xl px-4 py-3'>
                                <p className='text-xs text-green-700 font-medium'>
                                    💡 <b>Members</b> added here are active immediately. <b>Admins</b> will require approval before they can log in.
                                </p>
                            </div>
                            {addError && (
                                <div className='bg-red-50 border border-red-200 rounded-xl px-4 py-3'>
                                    <p className='text-xs text-red-700'>{addError}</p>
                                </div>
                            )}
                            {[
                                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. Akhil S Nair' },
                                { label: 'Email *', key: 'email', type: 'email', placeholder: 'user@example.com' },
                                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '10-digit mobile number' },
                                { label: 'Password *', key: 'password', type: 'password', placeholder: 'Temporary password' },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key} className='flex flex-col gap-1'>
                                    <label className='text-xs font-semibold text-gray-500'>{label}</label>
                                    <div className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 focus-within:border-[#570000] transition-colors'>
                                        <input type={type} placeholder={placeholder}
                                            value={(form as Record<string, string>)[key]}
                                            onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400' />
                                    </div>
                                </div>
                            ))}
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-gray-500'>Role</label>
                                <div className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 focus-within:border-[#570000] transition-colors'>
                                    <select value={form.role}
                                        onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                                        className='w-full bg-transparent outline-none text-sm text-gray-800 cursor-pointer'>
                                        <option value='member'>Member</option>
                                        <option value='admin'>Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='px-6 py-4 border-t border-[#f0dada] flex justify-end gap-3'>
                            <button onClick={() => setShowModal(false)}
                                className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'>
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={!form.name || !form.email || !form.password || saving === 'new'}
                                className='flex items-center gap-2 bg-[#570000] hover:bg-[#7a1c18] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all'>
                                {saving === 'new' ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
                                Add Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirm Action Modal */}
            {confirm && (
                <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm'>
                        <div className='px-6 py-5 border-b border-[#f0dada]'>
                            <h2 className='font-bold text-[#570000] text-lg capitalize'>
                                {confirm.action === 'approve' && 'Approve User?'}
                                {confirm.action === 'reject' && 'Reject User?'}
                                {confirm.action === 'suspend' && 'Suspend User?'}
                                {confirm.action === 'reactivate' && 'Reactivate User?'}
                            </h2>
                        </div>
                        <div className='px-6 py-5'>
                            <p className='text-sm text-gray-600'>
                                {confirm.action === 'approve' && <>Approve <span className='font-semibold text-gray-800'>{confirm.userName}</span> and grant them access to the library?</>}
                                {confirm.action === 'reject' && <>Reject and suspend <span className='font-semibold text-gray-800'>{confirm.userName}</span>? They will not be able to log in.</>}
                                {confirm.action === 'suspend' && <>Suspend <span className='font-semibold text-gray-800'>{confirm.userName}</span>? Their account will be deactivated.</>}
                                {confirm.action === 'reactivate' && <>Reactivate <span className='font-semibold text-gray-800'>{confirm.userName}</span> and restore their access?</>}
                            </p>
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
                                    confirm.action === 'approve' || confirm.action === 'reactivate'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : confirm.action === 'suspend'
                                            ? 'bg-amber-500 hover:bg-amber-600'
                                            : 'bg-[#570000] hover:bg-[#7a1c18]'
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminUsers
