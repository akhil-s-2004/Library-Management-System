import { useState, useEffect } from 'react'
import { AlertCircle, BookMarked, Clock, BookOpen, Pencil, X } from 'lucide-react'
import BooksCard from '../components/BooksCard'
import { useNavigate } from 'react-router'
import { fetchProfile, fetchDashboard, setPin, updatePin, fetchIssues, updateProfile } from '../services/memberService'

const Profile = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [recentlyRead, setRecentlyRead] = useState<any[]>([])

    // PIN states
    const [pin, setNewPin] = useState('')
    const [currentPin, setCurrentPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [pinMessage, setPinMessage] = useState({ text: '', type: '' })

    // Edit profile modal states
    const [showEditModal, setShowEditModal] = useState(false)
    const [editName, setEditName] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [editCurrentPassword, setEditCurrentPassword] = useState('')
    const [editNewPassword, setEditNewPassword] = useState('')
    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' })
    const [savingProfile, setSavingProfile] = useState(false)

    useEffect(() => {
        fetchProfile().then(data => {
            setUser(data)
        }).catch(err => console.error("Error fetching profile:", err))

        fetchDashboard().then(data => {
            setStats(data)
        }).catch(err => console.error("Error fetching stats:", err))

        fetchIssues('returned').then(data => {
            setRecentlyRead(data.slice(0, 6))
        }).catch(err => console.error("Error fetching history:", err))
    }, [])

    const openEditModal = () => {
        setEditName(user?.name || '')
        setEditEmail(user?.email || '')
        setEditPhone(user?.phone || '')
        setEditCurrentPassword('')
        setEditNewPassword('')
        setProfileMessage({ text: '', type: '' })
        setShowEditModal(true)
    }

    const closeEditModal = () => {
        setShowEditModal(false)
    }

    const handlePinAction = async () => {
        if (!pin || pin.length < 4) {
            setPinMessage({ text: 'PIN must be at least 4 digits', type: 'error' })
            return
        }
        if (pin !== confirmPin) {
            setPinMessage({ text: 'PINs do not match', type: 'error' })
            return
        }

        try {
            if (user?.hasPin) {
                await updatePin(currentPin, pin)
                setPinMessage({ text: 'PIN updated successfully!', type: 'success' })
            } else {
                await setPin(pin)
                setPinMessage({ text: 'PIN set successfully!', type: 'success' })
                setUser({ ...user, hasPin: true })
            }
            setNewPin('')
            setCurrentPin('')
            setConfirmPin('')
        } catch (err: any) {
            setPinMessage({ text: err.response?.data || err.message || 'Action failed', type: 'error' })
        }
    }

    const handleProfileSave = async () => {
        setSavingProfile(true)
        setProfileMessage({ text: '', type: '' })
        try {
            const payload: any = {}
            if (editName.trim() && editName.trim() !== user.name) payload.name = editName.trim()
            if (editEmail.trim() && editEmail.trim() !== user.email) payload.email = editEmail.trim()
            if (editPhone.trim() !== (user.phone || '')) payload.phone = editPhone.trim()
            if (editNewPassword) {
                payload.currentPassword = editCurrentPassword
                payload.newPassword = editNewPassword
            }

            if (Object.keys(payload).length === 0) {
                setProfileMessage({ text: 'No changes to save.', type: 'error' })
                setSavingProfile(false)
                return
            }

            const updated = await updateProfile(payload)
            setUser(updated)
            setProfileMessage({ text: 'Profile updated successfully!', type: 'success' })
            setTimeout(() => setShowEditModal(false), 1000)
        } catch (err: any) {
            setProfileMessage({ text: err.response?.data || err.message || 'Failed to update profile', type: 'error' })
        } finally {
            setSavingProfile(false)
        }
    }

    if (!user) return <div className='p-10 text-center text-[#570000] font-bold'>Loading Profile...</div>

    const displayStats = [
        { icon: <BookOpen size={20} className='text-[#570000]' />, label: 'Borrowed', value: stats?.active_reads || 0 },
        { icon: <BookMarked size={20} className='text-[#570000]' />, label: 'Reserved', value: stats?.active_reservations || 0 },
        { icon: <Clock size={20} className='text-[#570000]' />, label: 'Completed', value: stats?.total_reads - stats?.active_reads || 0 },
        { icon: <AlertCircle size={20} className='text-[#570000]' />, label: 'Fine', value: stats?.unpaid_fines ? `₹${stats.unpaid_fines}` : '₹0' },
    ]

    return (
        <div className='px-4 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 max-w-5xl mx-auto'>
            <h1 className='text-xl sm:text-2xl font-bold text-[#570000]'>My Profile</h1>

            {/* Profile Card */}
            <div className='bg-white border border-[#e8d4d4] rounded-3xl shadow-sm overflow-hidden'>
                <div className='h-24 sm:h-28 w-full' style={{ background: 'linear-gradient(135deg, #7a1c18 0%, #570000 50%, #3a0000 100%)' }} />
                <div className='px-4 sm:px-8 pb-6 sm:pb-8'>
                    <div className='flex items-end justify-between -mt-10 sm:-mt-12 mb-4 sm:mb-6'>
                        <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#f4e7e5] border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0'>
                            <span className='text-[#570000] text-2xl sm:text-3xl font-bold'>
                                {user.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                        </div>
                        <button
                            onClick={openEditModal}
                            title='Edit profile'
                            className='flex items-center gap-1.5 text-[#570000] border border-[#e8c8c8] bg-[#fdf5f5] hover:bg-[#f4e7e5] rounded-full px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm'
                        >
                            <Pencil size={13} />
                            Edit
                        </button>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <h2 className='text-lg sm:text-xl font-bold text-gray-900'>{user.name}</h2>
                        <p className='text-gray-500 text-sm'>{user.email}</p>
                        {user.phone && <p className='text-gray-500 text-sm'>{user.phone}</p>}
                        <p className='text-gray-500 text-sm'>Member ID: {user.membership_number}</p>
                        <span className='mt-2 self-start bg-[#f4e7e5] text-[#570000] text-xs font-semibold px-3 py-1 rounded-full border border-[#e8c8c8] uppercase'>{user.status}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
                {displayStats.map((s, i) => (
                    <div key={i} className='bg-white border border-[#e8d4d4] rounded-2xl px-4 py-4 sm:px-5 sm:py-5 flex flex-col items-center gap-2 shadow-sm'>
                        <div className='w-9 h-9 sm:w-10 sm:h-10 bg-[#f4e7e5] rounded-xl flex items-center justify-center'>{s.icon}</div>
                        <span className='text-lg sm:text-xl font-bold text-[#570000]'>{s.value}</span>
                        <span className='text-xs text-gray-500 text-center'>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Recently Read */}
            {recentlyRead.length > 0 && (
                <div className='flex flex-col gap-4'>
                    <h2 className='text-base sm:text-lg font-bold text-[#570000]'>Recently Read</h2>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
                        {recentlyRead.map((issue) => (
                            <BooksCard
                                key={issue.issueId}
                                image={issue.book?.coverImageUrl}
                                title={issue.book?.title}
                                author={issue.book?.author}
                                description={issue.book?.description || ''}
                                onClick={() => navigate(`/book/${issue.book?.bookId}`)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Kiosk PIN Management */}
            {/* <div className='bg-white border border-[#e8d4d4] rounded-2xl px-4 sm:px-6 py-5 sm:py-6 shadow-sm flex flex-col gap-4'>
                <h2 className='font-bold text-[#570000] text-sm sm:text-base'>Kiosk Security PIN</h2>
                <p className='text-xs text-gray-500 -mt-2'>Set a 4-digit PIN to borrow books from the self-service kiosk.</p>

                <div className='flex flex-col gap-3 max-w-sm'>
                    {user?.hasPin && (
                        <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                            <input
                                type='password'
                                placeholder='Current PIN'
                                value={currentPin}
                                onChange={(e) => setCurrentPin(e.target.value)}
                                className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                                maxLength={4}
                            />
                        </div>
                    )}
                    <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                        <input
                            type='password'
                            placeholder={user?.hasPin ? 'New PIN' : 'Set 4-digit PIN'}
                            value={pin}
                            onChange={(e) => setNewPin(e.target.value)}
                            className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                            maxLength={4}
                        />
                    </div>
                    <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                        <input
                            type='password'
                            placeholder='Confirm PIN'
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                            maxLength={4}
                        />
                    </div>

                    {pinMessage.text && (
                        <p className={`text-xs font-semibold ${pinMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {pinMessage.text}
                        </p>
                    )}

                    <button
                        onClick={handlePinAction}
                        className='self-start bg-[#570000] hover:bg-[#7a1c18] text-white text-sm font-semibold py-2 px-5 rounded-full transition-all shadow-md mt-2'
                    >
                        {user?.hasPin ? 'Update PIN' : 'Set PIN'}
                    </button>
                </div>
            </div> */}

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'
                    onClick={(e) => { if (e.target === e.currentTarget) closeEditModal() }}
                >
                    <div className='bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
                        {/* Modal header */}
                        <div className='flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e8d4d4]'>
                            <h2 className='font-bold text-[#570000] text-base'>Edit Profile</h2>
                            <button
                                onClick={closeEditModal}
                                className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className='px-6 py-5 flex flex-col gap-4'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-gray-600'>Full Name</label>
                                <input
                                    type='text'
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#570000] transition-colors'
                                />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-gray-600'>Email</label>
                                <input
                                    type='email'
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#570000] transition-colors'
                                />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-gray-600'>Phone</label>
                                <input
                                    type='tel'
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    placeholder='10-digit number'
                                    className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#570000] transition-colors'
                                />
                            </div>

                            <div className='h-px bg-[#e8d4d4]' />

                            <p className='text-xs font-semibold text-gray-600'>
                                Change Password
                                <span className='font-normal text-gray-400 ml-1'>(leave blank to keep current)</span>
                            </p>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-gray-600'>Current Password</label>
                                <input
                                    type='password'
                                    value={editCurrentPassword}
                                    onChange={(e) => setEditCurrentPassword(e.target.value)}
                                    className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#570000] transition-colors'
                                />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-gray-600'>New Password</label>
                                <input
                                    type='password'
                                    value={editNewPassword}
                                    onChange={(e) => setEditNewPassword(e.target.value)}
                                    className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#570000] transition-colors'
                                />
                            </div>

                            {profileMessage.text && (
                                <p className={`text-xs font-semibold ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {profileMessage.text}
                                </p>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className='flex items-center justify-end gap-2 px-6 pb-6'>
                            <button
                                onClick={closeEditModal}
                                className='px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProfileSave}
                                disabled={savingProfile}
                                className='bg-[#570000] hover:bg-[#7a1c18] text-white text-sm font-semibold py-2 px-5 rounded-full transition-all shadow-md disabled:opacity-60'
                            >
                                {savingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
