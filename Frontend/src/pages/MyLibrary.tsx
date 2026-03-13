import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import ListCard from '../components/ListCard'
import { fetchIssues, fetchReservations, cancelReservation } from '../services/memberService'
import { useNavigate } from 'react-router'

type Tab = 'borrowed' | 'reservations' | 'history'

const MyLibrary = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<Tab>('borrowed')
    const [borrowedData, setBorrowedData] = useState<any[]>([])
    const [reservedData, setReservedData] = useState<any[]>([])
    const [historyData, setHistoryData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [confirmId, setConfirmId] = useState<number | null>(null)
    const [cancelError, setCancelError] = useState<string | null>(null)

    const tabs: { id: Tab; label: string }[] = [
        { id: 'borrowed', label: 'Borrowed Books' },
        { id: 'reservations', label: 'Reservations' },
        { id: 'history', label: 'Reading History' },
    ]

    const loadData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'borrowed') {
                const data = await fetchIssues('active')
                setBorrowedData(data)
            } else if (activeTab === 'reservations') {
                const data = await fetchReservations()
                setReservedData(data)
            } else if (activeTab === 'history') {
                const data = await fetchIssues('returned')
                setHistoryData(data)
            }
        } catch (err) {
            console.error(`Error loading ${activeTab} data:`, err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [activeTab])

    const handleCancel = (id: number) => {
        setCancelError(null)
        setConfirmId(id)
    }

    const handleCancelConfirm = async () => {
        if (confirmId == null) return
        const id = confirmId
        setConfirmId(null)
        try {
            await cancelReservation(id)
            loadData()
        } catch {
            setCancelError('Failed to cancel reservation.')
        }
    }

    return (
        <div className='px-4 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col gap-6'>
            <h1 className='text-2xl font-bold text-[#570000]'>My Library</h1>

            {/* Cancel Error */}
            {cancelError && (
                <div className='flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                    <div className='flex items-center gap-2'><AlertCircle size={16} /> {cancelError}</div>
                    <button onClick={() => setCancelError(null)} className='ml-4 hover:opacity-70'><X size={14} /></button>
                </div>
            )}

            {/* Tab Bar */}
            <div className='flex flex-wrap gap-1 bg-[#f4e7e5] p-1 rounded-2xl w-fit'>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                            ? 'bg-[#570000] text-white shadow-md'
                            : 'text-[#570000] hover:bg-[#ead4d4]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className='p-10 text-center text-[#570000] font-bold'>Loading...</div>
            ) : (
                <>
                    {/* Borrowed Books */}
                    {activeTab === 'borrowed' && (
                        <div className='flex flex-col gap-4'>
                            {borrowedData.length > 0 ? borrowedData.map((item) => (
                                <ListCard
                                    key={item.issueId}
                                    image={item.book?.coverImageUrl}
                                    title={item.book?.title}
                                    author={item.book?.author}
                                    borrowedDate={item.borrowDate}
                                    returnedDate={item.dueDate}
                                    date1Label='Borrowed'
                                    date2Label='Due Date'
                                    buttonText='View Details'
                                    onButtonClick={() => navigate(`/book/${item.book?.bookId}`)}
                                />
                            )) : <p className='text-gray-400'>No borrowed books.</p>}
                        </div>
                    )}

                    {/* Reservations */}
                    {activeTab === 'reservations' && (
                        <div className='flex flex-col gap-4'>
                            {reservedData.length > 0 ? reservedData.map((item) => (
                                <ListCard
                                    key={item.reservationId}
                                    image={item.book?.coverImageUrl}
                                    title={item.book?.title}
                                    author={item.book?.author}
                                    borrowedDate={item.reservationDate}
                                    returnedDate={item.expiresAt}
                                    date1Label='Reserved On'
                                    date2Label='Expiry Date'
                                    buttonText='Cancel'
                                    onButtonClick={() => handleCancel(item.reservationId)}
                                />
                            )) : <p className='text-gray-400'>No reservations.</p>}
                        </div>
                    )}

                    {/* Reading History */}
                    {activeTab === 'history' && (
                        <div className='flex flex-col gap-4'>
                            {historyData.length > 0 ? historyData.map((item) => (
                                <ListCard
                                    key={item.issueId}
                                    image={item.book?.coverImageUrl}
                                    title={item.book?.title}
                                    author={item.book?.author}
                                    borrowedDate={item.borrowDate}
                                    returnedDate={item.returnDate}
                                    date1Label='Borrowed'
                                    date2Label='Returned Date'
                                    buttonText='View Details'
                                    onButtonClick={() => navigate(`/book/${item.book?.bookId}`)}
                                />
                            )) : <p className='text-gray-400'>No history found.</p>}
                        </div>
                    )}
                </>
            )}

            {/* Cancel Confirm Modal */}
            {confirmId != null && (
                <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm'>
                        <div className='px-6 py-5 border-b border-[#f0dada]'>
                            <h2 className='font-bold text-[#570000] text-lg'>Cancel Reservation?</h2>
                        </div>
                        <div className='px-6 py-5'>
                            <p className='text-sm text-gray-600'>Are you sure you want to cancel this reservation?</p>
                        </div>
                        <div className='px-6 py-4 border-t border-[#f0dada] flex justify-end gap-3'>
                            <button
                                onClick={() => setConfirmId(null)}
                                className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'
                            >
                                Keep It
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                className='bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all'
                            >
                                Cancel Reservation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyLibrary
