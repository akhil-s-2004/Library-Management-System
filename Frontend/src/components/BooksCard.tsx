import React from 'react'

type BooksCardProps = {
  image: string;
  title: string;
  author: string;
  description: string;
  onClick: () => void;
}
const BooksCard = (props: BooksCardProps) => {
  return (
    <div
      className='w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col flex-shrink-0 cursor-pointer'
      onClick={props.onClick}
    >
      <div className='relative bg-[#f4e7e5]' style={{ height: '200px' }}>
        <img
          src={props.image}
          alt={props.title}
          className='w-full h-full object-contain p-2'
        />
        <div className='absolute bottom-0 left-0 right-0 h-6 bg-white rounded-tl-[50%] rounded-tr-[50%]' />
      </div>

      <div className='flex flex-col px-3 pt-1 pb-3'>
        <h3 className='text-[#570000] font-semibold text-sm leading-tight line-clamp-1'>{props.title}</h3>
        <p className='text-xs text-gray-500 mt-0.5'>{props.author}</p>
        <p className='text-xs text-gray-400 mt-1 line-clamp-2'>{props.description}</p>
        <button
          onClick={(e) => { e.stopPropagation(); props.onClick() }}
          className='mt-2 text-[#570000] text-xs font-medium hover:underline text-left'
        >
          View Details →
        </button>
      </div>
    </div>
  )
}

export default BooksCard
