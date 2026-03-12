import { useNavigate } from 'react-router'
import BooksCard from '../components/BooksCard'
import { useState, useEffect } from 'react'
import { fetchBooks } from '../services/bookService'

const PopularBooks = () => {
  const navigate = useNavigate()
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks({ limit: 30 }).then(data => {
      setBooks(data.content || [])
      setLoading(false)
    }).catch(err => {
      console.error("Error fetching popular books:", err)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading popular books...</div>

  return (
    <div className='px-4 sm:px-8 lg:px-10 py-6 flex flex-col gap-6'>
      <h1 className='text-xl sm:text-2xl font-bold text-[#570000]'>Popular Books</h1>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
        {books.map((book) => (
          <BooksCard
            key={book.bookId}
            image={book.coverImageUrl}
            title={book.title}
            author={book.author}
            description={book.description}
            onClick={() => navigate(`/book/${book.bookId}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default PopularBooks
