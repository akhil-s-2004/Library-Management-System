import React from 'react'

type FineItem = {
  id: number
  image: string
  title: string
  author: string
  dueDate: string
  returnedDate: string
  daysLate: number
  fineAmount: number
}

const fineData: FineItem[] = [
  {
    id: 1,
    image: '/books/alchemist.jpg',
    title: 'THE ALCHEMIST',
    author: 'Paulo Coelho',
    dueDate: '01 / 03 / 2026',
    returnedDate: '06 / 03 / 2026',
    daysLate: 5,
    fineAmount: 25,
  },
  {
    id: 2,
    image: '/books/atomic-habits.jpg',
    title: 'ATOMIC HABITS',
    author: 'James Clear',
    dueDate: '28 / 02 / 2026',
    returnedDate: '05 / 03 / 2026',
    daysLate: 5,
    fineAmount: 25,
  },
  {
    id: 3,
    image: '/books/1984.jpg',
    title: '1984',
    author: 'George Orwell',
    dueDate: '25 / 02 / 2026',
    returnedDate: '08 / 03 / 2026',
    daysLate: 11,
    fineAmount: 55,
  },
]

const totalFine = fineData.reduce((sum, f) => sum + f.fineAmount, 0)

const Fine = () => {
  return (
    <div className='px-10 py-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-[#570000]'>Fines</h1>
        <div className='bg-[#570000] text-white px-5 py-2 rounded-full text-sm font-semibold'>
          Total Due: ₹{totalFine}
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {fineData.map((item) => (
          <div
            key={item.id}
            className='flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm'
          >
            {/* Book Image */}
            <div className='w-14 h-20 flex-shrink-0'>
              <img
                src={item.image}
                alt={item.title}
                className='w-full h-full object-cover rounded-md'
              />
            </div>

            {/* Title & Author */}
            <div className='w-44 flex-shrink-0'>
              <p className='font-bold text-gray-900 text-sm leading-tight'>{item.title}</p>
              <p className='text-gray-500 text-sm mt-0.5'>{item.author}</p>
            </div>

            {/* Dates */}
            <div className='flex-1 flex flex-col gap-1'>
              <p className='text-green-600 text-sm font-medium'>
                Due Date: {item.dueDate}
              </p>
              <p className='text-red-500 text-sm font-medium'>
                Returned: {item.returnedDate}
              </p>
              <p className='text-gray-500 text-xs'>
                {item.daysLate} day{item.daysLate > 1 ? 's' : ''} late · ₹5/day
              </p>
            </div>

            {/* Fine Amount + Pay Button */}
            <div className='flex flex-col items-end gap-2 flex-shrink-0'>
              <p className='text-[#570000] font-bold text-base'>₹{item.fineAmount}</p>
              <button
                className='bg-[#570000] hover:bg-[#7a1c18] text-white text-sm font-semibold py-1.5 px-4 rounded-full transition-colors'
                onClick={() => console.log(`Pay fine for ${item.title}`)}
              >
                Pay Fine
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Fine
