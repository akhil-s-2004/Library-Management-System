import React from 'react'

type FineListCardProps = {
    image: string
    title: string
    author: string
    overdueDays: number
    fineAmount: number
}

const FineListCard = (props: FineListCardProps) => {
    return (
        <div className='flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm'>
            {/* Book Image */}
            <div className='w-14 h-20 flex-shrink-0'>
                <img
                    src={props.image}
                    alt={props.title}
                    className='w-full h-full object-cover rounded-md'
                />
            </div>

            {/* Title & Author */}
            <div className='w-44 flex-shrink-0'>
                <p className='font-bold text-gray-900 text-sm leading-tight'>{props.title}</p>
                <p className='text-gray-500 text-sm mt-0.5'>{props.author}</p>
            </div>

            {/* Overdue */}
            <div className='flex-1'>
                <p className='text-red-500 text-sm font-medium'>
                    Overdue : {props.overdueDays} Days
                </p>
            </div>

            {/* Fine Amount */}
            <div className='flex-shrink-0'>
                <p className='text-red-500 text-sm font-semibold'>
                    Fine &nbsp;: Rs {props.fineAmount}
                </p>
            </div>
        </div>
    )
}

export default FineListCard
