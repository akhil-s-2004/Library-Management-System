import React from 'react'
import { useNavigate } from 'react-router'
import BooksCard from './BooksCard'

type horizontalBookListProps = {
  title: string
  books: any[]
  onBookClick?: (id: number) => void
  browseLink?: string
}
const HorizontalBookList = (props: horizontalBookListProps) => {
  const navigate = useNavigate()
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-[#570000] text-2xl font-bold'>{props.title}</h2>
        {props.browseLink && (
          <button
            onClick={() => navigate(props.browseLink!)}
            className='text-[#570000] text-sm font-semibold hover:underline flex items-center gap-1'
          >
            Browse All →
          </button>
        )}
      </div>
      <div className='flex space-x-4 overflow-x-auto pb-2'>
        {props.books.map((book) => (
          <div key={book.id || book.bookId} className='w-[200px] flex-shrink-0'>
            <BooksCard
              image={book.image || book.coverImageUrl}
              title={book.title}
              author={book.author}
              description={book.description}
              onClick={() => props.onBookClick?.(book.id || book.bookId)}
            />
          </div>
        ))}
        {/* {props.browseLink && (
          <div
            className='w-[140px] flex-shrink-0 flex items-center justify-center bg-[#f4e7e5] rounded-2xl cursor-pointer hover:bg-[#ead4d4] transition-colors'
            onClick={() => navigate(props.browseLink!)}
          >
            <span className='text-[#570000] font-semibold text-sm text-center px-3'>View All →</span>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default HorizontalBookList
