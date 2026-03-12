import { useNavigate } from 'react-router'
import BooksCard from '../components/BooksCard'
import HorizontalGenreList from '../components/HorizontalGenreList'
import { Search, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { fetchBooks } from '../services/bookService'

const PAGE_SIZE = 20

const BrowseBooks = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadBooks = (searchQuery: string, genre: string | null, page: number) => {
    setLoading(true)
    fetchBooks({ search: searchQuery || undefined, genre: genre || undefined, limit: PAGE_SIZE, page }).then(data => {
      setBooks(data.content || [])
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements || 0)
      setLoading(false)
    }).catch(err => {
      console.error("Error fetching books:", err)
      setLoading(false)
    })
  }

  // Initial load
  useEffect(() => {
    loadBooks('', null, 0)
  }, [])

  // Debounced search — fires 500 ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setCurrentPage(0)
      loadBooks(query, selectedGenre, 0)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleGenreClick = (genre: string | null) => {
    setSelectedGenre(genre)
    setCurrentPage(0)
    loadBooks(query, genre, 0)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadBooks(query, selectedGenre, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      pages.push(0)
      if (currentPage > 2) pages.push('...')
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 3) pages.push('...')
      pages.push(totalPages - 1)
    }
    return pages
  }

  return (
    <div className='px-4 sm:px-8 lg:px-10 py-6 flex flex-col gap-6'>
      <h1 className='text-xl sm:text-2xl font-bold text-[#570000]'>Browse Books</h1>

      {/* Search */}
      <div className='flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm w-full max-w-lg'>
        <Search size={18} className='text-gray-400' />
        <input
          type='text'
          placeholder='Search by title, author or ISBN...'
          className='flex-1 outline-none text-sm text-gray-700'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery('')} className='text-gray-400 hover:text-gray-600'>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Genre filter pills */}
      <HorizontalGenreList
        title='Genres'
        onGenreClick={handleGenreClick}
        selectedGenre={selectedGenre}
      />

      {/* Active filter indicator */}
      {(selectedGenre || query) && (
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-xs text-gray-500'>Filtering by:</span>
          {selectedGenre && (
            <span className='flex items-center gap-1 bg-[#f4e7e5] text-[#570000] text-xs font-semibold px-3 py-1 rounded-full border border-[#e8c8c8]'>
              {selectedGenre}
              <button onClick={() => handleGenreClick(null)}><X size={11} /></button>
            </span>
          )}
          {query && (
            <span className='flex items-center gap-1 bg-[#f4e7e5] text-[#570000] text-xs font-semibold px-3 py-1 rounded-full border border-[#e8c8c8]'>
              "{query}"
              <button onClick={() => setQuery('')}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className='p-10 text-center text-[#570000] font-bold'>Loading books...</div>
      ) : (
        <>
          {totalElements > 0 && (
            <p className='text-sm text-gray-500'>
              Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} books
            </p>
          )}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
            {books.length > 0 ? (
              books.map((book) => (
                <BooksCard
                  key={book.bookId}
                  image={book.coverImageUrl}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  onClick={() => navigate(`/book/${book.bookId}`)}
                />
              ))
            ) : (
              <p className='text-gray-500 text-sm col-span-full'>No books found.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-1 pt-2 flex-wrap'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className='px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
              >
                ← Prev
              </button>

              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className='px-2 text-gray-400 text-sm'>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-medium border transition-colors ${
                      currentPage === p
                        ? 'bg-[#570000] text-white border-[#570000]'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {(p as number) + 1}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className='px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BrowseBooks

