import React, { useEffect, useState } from 'react'
import ListCard from '../components/ListCard'
import { fetchIssues, renewIssue } from '../services/memberService'

const BorrowedBooks = () => {
    const [borrowedBooks, setBorrowedBooks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const loadBorrowed = () => {
        setLoading(true)
        fetchIssues('active').then(data => {
            setBorrowedBooks(data)
            setLoading(false)
        }).catch(err => {
            console.error("Error fetching borrowed books:", err)
            setLoading(false)
        })
    }

    useEffect(() => {
        loadBorrowed()
    }, [])

    const handleRenew = async (issueId: number, title: string) => {
        if (window.confirm(`Renew "${title}"? Books can only be renewed once, extending the due date by 14 days.`)) {
            try {
                const msg = await renewIssue(issueId)
                alert(msg)
                loadBorrowed()
            } catch (err: any) {
                alert(err.response?.data || err.message || 'Failed to renew book')
            }
        }
    }

    if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading borrowed books...</div>

    return (
        <div className='px-16 py-6'>
            <h1 className='text-2xl font-bold mb-6 text-[#570000]'>Borrowed Books</h1>
            <div className='flex flex-col gap-4'>
                {borrowedBooks.length === 0 ? (
                    <p className='text-gray-500'>You have no books currently borrowed.</p>
                ) : (
                    borrowedBooks.map((item) => (
                        <ListCard
                            key={item.issueId}
                            image={item.book?.coverImageUrl}
                            title={item.book?.title}
                            author={item.book?.author}
                            borrowedDate={item.borrowDate}
                            returnedDate={item.dueDate}
                            date1Label='Borrowed'
                            date2Label='Due Date'
                            buttonText={item.renewed ? undefined : 'Renew Book'}
                            onButtonClick={() => handleRenew(item.issueId, item.book?.title)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default BorrowedBooks
