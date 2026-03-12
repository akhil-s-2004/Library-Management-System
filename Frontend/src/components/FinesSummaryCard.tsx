import React from 'react'

type FinesSummaryCardProps = {
    outstandingFine: number
    totalFinePaid: number
}

const FinesSummaryCard = (props: FinesSummaryCardProps) => {
    return (
        <div className='flex items-center border-2 border-[#7a1c18] rounded-2xl overflow-hidden bg-white shadow-sm'>
            <div className='flex flex-col items-center px-6 py-3 border-r border-[#d8bcbc]'>
                <span className='text-[#570000] font-bold text-xl'>Rs {props.outstandingFine}</span>
                <span className='text-gray-500 text-xs mt-0.5'>Outstanding Fine</span>
            </div>
            <div className='flex flex-col items-center px-6 py-3'>
                <span className='text-[#570000] font-bold text-xl'>Rs {props.totalFinePaid}</span>
                <span className='text-gray-500 text-xs mt-0.5'>Total Fine Paid</span>
            </div>
        </div>
    )
}

export default FinesSummaryCard
