import React, { useEffect, useState } from 'react'
import FineListCard from '../components/FineListCard'
import PaymentHistoryCard from '../components/PaymentHistoryCard'
import FinesSummaryCard from '../components/FinesSummaryCard'
import { fetchFines } from '../services/memberService'

const PaymentHistory = () => {
    const [fines, setFines] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFines().then(data => {
            setFines(data)
            setLoading(false)
        }).catch(err => {
            console.error("Error fetching fines:", err)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading payment history...</div>

    const outstandingFines = fines.filter(f => f.paidStatus === 'unpaid')
    const paidFines = fines.filter(f => f.paidStatus === 'paid')
    const waivedFines = fines.filter(f => f.paidStatus === 'waived')

    const outstandingTotal = outstandingFines.reduce((sum, f) => sum + (f.amount || 0), 0)
    const paidTotal = paidFines.reduce((sum, p) => sum + (p.amount || 0), 0)

    return (
        <div className='px-4 sm:px-8 lg:px-16 py-6 flex flex-col gap-8'>
            {/* Summary Card */}
            <div className='flex justify-end'>
                <FinesSummaryCard outstandingFine={outstandingTotal} totalFinePaid={paidTotal} />
            </div>

            {/* Outstanding Fines */}
            <section>
                <h1 className='text-2xl font-bold text-[#570000] mb-4'>Outstanding Fines</h1>
                <div className='flex flex-col gap-4'>
                    {outstandingFines.length === 0 ? (
                        <p className='text-gray-500'>You have no outstanding fines.</p>
                    ) : (
                        outstandingFines.map((item, i) => (
                            <FineListCard
                                key={item.fineId ?? `pending-${i}`}
                                image={item.book?.coverImageUrl}
                                title={item.book?.title}
                                author={item.book?.author}
                                overdueDays={item.overdueDays ?? 0}
                                fineAmount={item.amount}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* Waived Fines */}
            {waivedFines.length > 0 && (
                <section>
                    <h2 className='text-2xl font-bold text-[#570000] mb-4'>Waived Fines</h2>
                    <div className='flex flex-col gap-4'>
                        {waivedFines.map((item, i) => (
                            <div
                                key={item.fineId ?? `waived-${i}`}
                                className='flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm opacity-70'
                            >
                                {item.book?.coverImageUrl && (
                                    <div className='w-14 h-20 flex-shrink-0'>
                                        <img src={item.book.coverImageUrl} alt={item.book.title} className='w-full h-full object-cover rounded-md' />
                                    </div>
                                )}
                                <div className='flex-1'>
                                    <p className='font-bold text-gray-900 text-sm'>{item.book?.title ?? '—'}</p>
                                    <p className='text-gray-500 text-sm'>{item.book?.author ?? '—'}</p>
                                    <p className='text-green-600 text-xs font-semibold mt-1'>Fine waived by admin</p>
                                </div>
                                <p className='text-gray-400 text-sm font-medium line-through'>₹{item.overdueDays ? item.overdueDays * 10 : 0}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Payment History */}
            <section>
                <h2 className='text-2xl font-bold text-[#570000] mb-4'>Payment History</h2>
                <div className='flex flex-col gap-4'>
                    {paidFines.length === 0 ? (
                        <p className='text-gray-500'>No payment history found.</p>
                    ) : (
                        paidFines.map((item) => (
                            <PaymentHistoryCard
                                key={item.fineId}
                                image={item.book?.coverImageUrl}
                                title={item.book?.title}
                                author={item.book?.author}
                                fineAmount={item.amount}
                                paidOn={item.paidDate}
                            />
                        ))
                    )}
                </div>
            </section>
        </div>
    )
}

export default PaymentHistory

