import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import BookLayout from '../components/BookLayout'
import HorizontalBookList from '../components/HorizontalBookList'
import { fetchBookById, fetchBooks } from '../services/bookService'
import { reserveBook, fetchReservations, cancelReservation, fetchIssues, renewIssue } from '../services/memberService'

const BookPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<any>(null)
  const [similarBooks, setSimilarBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userReservation, setUserReservation] = useState<any>(null)
  const [userIssue, setUserIssue] = useState<any>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'renew' | null>(null)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const bookData = await fetchBookById(Number(id))
      setBook(bookData)

      const similar = await fetchBooks({ limit: 10 })
      setSimilarBooks(similar.content?.filter((b: any) => b.bookId !== Number(id)) || [])

      // Check if user currently has this book borrowed (active issue)
      const issues = await fetchIssues('active')
      const borrowedIssue = issues.find((r: any) => r.book?.bookId === Number(id))
      setUserIssue(borrowedIssue || null)

      // Only check reservation if not currently borrowed
      if (!borrowedIssue) {
        const reservations = await fetchReservations()
        const existing = reservations.find((r: any) => r.book?.bookId === Number(id) && r.status === 'active')
        setUserReservation(existing)
      } else {
        setUserReservation(null)
      }
    } catch (err) {
      console.error("Error loading book data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleReserve = async () => {
    try {
      await reserveBook(Number(id))
      setToast({ type: 'success', message: 'Book reserved successfully!' })
      loadData()
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data || 'Failed to reserve book' })
    }
  }

  const handleCancelClick = () => {
    if (!userReservation) return
    setConfirmAction('cancel')
  }

  const handleRenew = () => {
    if (!userIssue) return
    setConfirmAction('renew')
  }

  const doConfirmedAction = async () => {
    const action = confirmAction
    setConfirmAction(null)
    if (action === 'cancel') {
      try {
        await cancelReservation(userReservation.reservationId)
        setToast({ type: 'success', message: 'Reservation cancelled.' })
        loadData()
      } catch {
        setToast({ type: 'error', message: 'Failed to cancel reservation.' })
      }
    } else if (action === 'renew') {
      try {
        const msg = await renewIssue(userIssue.issueId)
        setToast({ type: 'success', message: msg || 'Book renewed successfully.' })
        loadData()
      } catch (err: any) {
        setToast({ type: 'error', message: err.response?.data || err.message || 'Failed to renew book' })
      }
    }
  }

  if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading book details...</div>
  if (!book) return <div className='p-10 text-center'>Book not found.</div>

  // Determine status and action based on borrow/reservation state
  let statusText: string
  let statusColor: string
  let buttonText: string | undefined
  let onButtonClick: (() => void) | undefined

  if (userIssue) {
    statusText = `Borrowed - Due: ${userIssue.dueDate}`
    statusColor = 'text-blue-600 font-semibold'
    buttonText = userIssue.renewed ? undefined : 'Renew Book'
    onButtonClick = handleRenew
  } else if (userReservation) {
    statusText = `Reserved On: ${userReservation.reservationDate}`
    statusColor = 'text-blue-600 font-semibold'
    buttonText = 'Cancel Reservation'
    onButtonClick = handleCancelClick
  } else {
    statusText = book.availableCopies > 0 ? 'Available' : 'Out of Stock'
    statusColor = book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'
    buttonText = 'Reserve Book'
    onButtonClick = handleReserve
  }

  return (
    <div className='flex flex-col gap-10 px-10 py-8'>
      {/* Toast */}
      {toast && (
        <div className={`flex items-center justify-between text-sm px-4 py-3 rounded-xl border ${
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

      <BookLayout
        image={book.coverImageUrl}
        title={book.title}
        author={book.author}
        publisher={book.publisher}
        description={book.description}
        genres={book.genres || []}
        statusText={statusText}
        statusColor={statusColor}
        buttonText={buttonText}
        onButtonClick={onButtonClick}
      />
      <div className='h-px bg-[#e8d4d4] mx-0' />
      <div className='h-[300px]'>
        <HorizontalBookList title='Similar Books' books={similarBooks} onBookClick={(id) => navigate(`/book/${id}`)}/>
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm'>
            <div className='px-6 py-5 border-b border-[#f0dada]'>
              <h2 className='font-bold text-[#570000] text-lg'>
                {confirmAction === 'cancel' ? 'Cancel Reservation?' : 'Renew Book?'}
              </h2>
            </div>
            <div className='px-6 py-5'>
              <p className='text-sm text-gray-600'>
                {confirmAction === 'cancel'
                  ? 'Are you sure you want to cancel this reservation? This cannot be undone.'
                  : 'Renew this book? It can only be renewed once, extending the due date by 14 days.'}
              </p>
            </div>
            <div className='px-6 py-4 border-t border-[#f0dada] flex justify-end gap-3'>
              <button
                onClick={() => setConfirmAction(null)}
                className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={doConfirmedAction}
                className={`text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all ${
                  confirmAction === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#570000] hover:bg-[#7a1c18]'
                }`}
              >
                {confirmAction === 'cancel' ? 'Cancel Reservation' : 'Renew'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookPage
