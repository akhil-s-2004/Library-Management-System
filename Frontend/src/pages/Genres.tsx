import { useState, useEffect } from 'react'
import BooksCard from '../components/BooksCard'
import { useNavigate, useSearchParams } from 'react-router'
import { fetchBooks, fetchGenres } from '../services/bookService'

const genreStyles: Record<string, { emoji: string; bg: string; border: string }> = {
    'Fiction': { emoji: '📖', bg: '#fdf5f5', border: '#e8c8c8' },
    'Non-Fiction': { emoji: '📰', bg: '#f5f8fd', border: '#c8d8e8' },
    'Mystery': { emoji: '🔍', bg: '#fdf5ff', border: '#dcc8e8' },
    'Fantasy': { emoji: '🧙', bg: '#f5fdf5', border: '#c8e8d0' },
    'Science Fiction': { emoji: '🚀', bg: '#f5fbfd', border: '#c8e0e8' },
    'Romance': { emoji: '❤️', bg: '#fff5f7', border: '#e8c8d0' },
    'Thriller': { emoji: '⚡', bg: '#fdfdf5', border: '#e8e0c8' },
    'Historical': { emoji: '🏛️', bg: '#fdf9f5', border: '#e8d8c8' },
    'Biography': { emoji: '👤', bg: '#f5f5fd', border: '#c8c8e8' },
    'Self-Help': { emoji: '🌱', bg: '#f5fdf8', border: '#c8e8d8' },
    'Business & Finance': { emoji: '💼', bg: '#fdfbf5', border: '#e8e0c8' },
    'Science & Technology': { emoji: '🔬', bg: '#f5fdfd', border: '#c8e8e8' },
    'Travel': { emoji: '✈️', bg: '#f5f8fd', border: '#c8d0e8' },
    "Children's": { emoji: '🧸', bg: '#fffbf5', border: '#e8dcc8' },
    'Young Adult': { emoji: '🌟', bg: '#fdf5fb', border: '#e8c8e0' },
    'Poetry': { emoji: '🎭', bg: '#fdf5f5', border: '#e8c8c8' },
}

const Genres = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [selectedGenre, setSelectedGenre] = useState<string | null>(searchParams.get('genre'))
    const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
    const [books, setBooks] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchGenres().then(setGenres).catch(err => console.error("Error fetching genres:", err))
    }, [])

    useEffect(() => {
        if (selectedGenre) {
            setLoading(true)
            fetchBooks({ genre: selectedGenre, limit: 50 }).then(data => {
                setBooks(data.content || [])
                setLoading(false)
            }).catch(err => {
                console.error("Error fetching books by genre:", err)
                setLoading(false)
            })
        } else {
            setBooks([])
        }
    }, [selectedGenre])

    return (
        <div className='px-4 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8'>
            <h1 className='text-2xl font-bold text-[#570000]'>Genres</h1>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
                {genres.map((genre) => {
                    const style = genreStyles[genre.name] ?? { emoji: '📚', bg: '#fdf5f5', border: '#e8c8c8' }
                    const isSelected = selectedGenre === genre.name
                    return (
                        <button
                            key={genre.id}
                            onClick={() => setSelectedGenre(isSelected ? null : genre.name)}
                            className='flex items-center gap-3 rounded-2xl px-5 py-4 border-2 transition-all duration-200 text-left hover:shadow-md active:scale-[0.98]'
                            style={{ background: isSelected ? '#570000' : style.bg, borderColor: isSelected ? '#570000' : style.border }}
                        >
                            <span className='text-2xl'>{style.emoji}</span>
                            <span className='font-semibold text-sm' style={{ color: isSelected ? '#fff' : '#570000' }}>
                                {genre.name}
                            </span>
                        </button>
                    )
                })}
            </div>
            {selectedGenre && (
                <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-xl font-bold text-[#570000]'>Books in <span className='italic'>{selectedGenre}</span></h2>
                        <button onClick={() => setSelectedGenre(null)} className='text-sm text-[#570000] hover:underline'>Clear filter ×</button>
                    </div>
                    {loading ? (
                        <div className='p-10 text-center text-[#570000] font-bold'>Loading books...</div>
                    ) : (
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
                            {books.length > 0 ? books.map((book) => (
                                <BooksCard
                                    key={book.bookId}
                                    image={book.coverImageUrl}
                                    title={book.title}
                                    author={book.author}
                                    description={book.description}
                                    onClick={() => navigate(`/book/${book.bookId}`)}
                                />
                            )) : (
                                <p className='text-gray-400 text-sm col-span-6'>No books found for this genre yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Genres
