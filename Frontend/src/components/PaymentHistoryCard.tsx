import React from 'react'

type PaymentHistoryCardProps = {
    image: string
    title: string
    author: string
    fineAmount: number
    paidOn: string
}

const PaymentHistoryCard = (props: PaymentHistoryCardProps) => {
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

            {/* Fine Amount */}
            <div className='flex-1'>
                <p className='text-red-500 text-sm font-medium'>
                    Fine Amount &nbsp;: Rs {props.fineAmount}
                </p>
            </div>

            {/* Paid On */}
            <div className='flex-shrink-0'>
                <p className='text-green-600 text-sm font-semibold'>
                    Paid On : {props.paidOn}
                </p>
            </div>
        </div>
    )
}

export default PaymentHistoryCard
