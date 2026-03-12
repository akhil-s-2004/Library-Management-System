import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
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
      alert("Book reserved successfully!")
      loadData()
    } catch (err: any) {
      alert(err.response?.data || "Failed to reserve book")
    }
  }

  const handleCancelClick = async () => {
    if (!userReservation) return
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      try {
        await cancelReservation(userReservation.reservationId)
        alert("Reservation cancelled")
        loadData()
      } catch (err) {
        alert("Failed to cancel reservation")
      }
    }
  }

  const handleRenew = async () => {
    if (!userIssue) return
    if (window.confirm(`Renew this book? It can only be renewed once, extending the due date by 14 days.`)) {
      try {
        const msg = await renewIssue(userIssue.issueId)
        alert(msg)
        loadData()
      } catch (err: any) {
        alert(err.response?.data || err.message || 'Failed to renew book')
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
    </div>
  )
}

export default BookPage
