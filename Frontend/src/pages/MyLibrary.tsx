import { useState, useEffect } from 'react'
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

    const handleCancel = async (id: number) => {
        if (window.confirm("Cancel this reservation?")) {
            try {
                await cancelReservation(id)
                loadData()
            } catch (err) {
                alert("Failed to cancel reservation")
            }
        }
    }

    return (
        <div className='px-4 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col gap-6'>
            <h1 className='text-2xl font-bold text-[#570000]'>My Library</h1>

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
        </div>
    )
}

export default MyLibrary
