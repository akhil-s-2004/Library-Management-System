import { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import ListCard from '../components/ListCard'
import { fetchIssues, renewIssue } from '../services/memberService'

const BorrowedBooks = () => {
    const [borrowedBooks, setBorrowedBooks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [confirmRenew, setConfirmRenew] = useState<{ issueId: number; title: string } | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const loadBorrowed = () => {
        setLoading(true)
        fetchIssues('active').then(data => {
            setBorrowedBooks(data)
            setLoading(false)
        }).catch(err => {
            console.error("Error fetching borrowed books:", err)
            setLoading(false)
        })
    }

    useEffect(() => {
        loadBorrowed()
    }, [])

    const handleRenewConfirm = async () => {
        if (!confirmRenew) return
        const { issueId } = confirmRenew
        setConfirmRenew(null)
        try {
            const msg = await renewIssue(issueId)
            setToast({ type: 'success', message: msg || 'Book renewed successfully.' })
            loadBorrowed()
        } catch (err: any) {
            setToast({ type: 'error', message: err.response?.data || err.message || 'Failed to renew book' })
        }
    }

    if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading borrowed books...</div>

    return (
        <div className='px-16 py-6'>
            <h1 className='text-2xl font-bold mb-6 text-[#570000]'>Borrowed Books</h1>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center justify-between text-sm px-4 py-3 rounded-xl mb-4 border ${
                    toast.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    <div className='flex items-center gap-2'>
                        {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {toast.message}
                    </div>
                    <button onClick={() => setToast(null)} className='ml-4 hover:opacity-70'><X size={14} /></button>
                </div>
            )}

            <div className='flex flex-col gap-4'>
                {borrowedBooks.length === 0 ? (
                    <p className='text-gray-500'>You have no books currently borrowed.</p>
                ) : (
                    borrowedBooks.map((item) => (
                        <ListCard
                            key={item.issueId}
                            image={item.book?.coverImageUrl}
                            title={item.book?.title}
                            author={item.book?.author}
                            borrowedDate={item.borrowDate}
                            returnedDate={item.dueDate}
                            date1Label='Borrowed'
                            date2Label='Due Date'
                            buttonText={item.renewed ? undefined : 'Renew Book'}
                            onButtonClick={() => setConfirmRenew({ issueId: item.issueId, title: item.book?.title })}
                        />
                    ))
                )}
            </div>

            {/* Renew Confirm Modal */}
            {confirmRenew && (
                <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm'>
                        <div className='px-6 py-5 border-b border-[#f0dada]'>
                            <h2 className='font-bold text-[#570000] text-lg'>Renew Book?</h2>
                        </div>
                        <div className='px-6 py-5'>
                            <p className='text-sm text-gray-600'>
                                Renew <span className='font-semibold text-gray-800'>"{confirmRenew.title}"</span>?
                                Books can only be renewed once, extending the due date by 14 days.
                            </p>
                        </div>
                        <div className='px-6 py-4 border-t border-[#f0dada] flex justify-end gap-3'>
                            <button
                                onClick={() => setConfirmRenew(null)}
                                className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRenewConfirm}
                                className='bg-[#570000] hover:bg-[#7a1c18] text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all'
                            >
                                Renew
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BorrowedBooks
