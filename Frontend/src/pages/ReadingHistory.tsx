import React, { useEffect, useState } from 'react'
import ListCard from '../components/ListCard'
import { fetchIssues } from '../services/memberService'
import { useNavigate } from 'react-router'

const ReadingHistory = () => {
  const navigate = useNavigate()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues('returned').then(data => {
      setHistory(data)
      setLoading(false)
    }).catch(err => {
      console.error("Error fetching reading history:", err)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading reading history...</div>

  return (
    <div className='px-10 py-6'>
      <h1 className='text-2xl font-bold mb-6 text-[#570000]'>Reading History</h1>
      <div className='flex flex-col gap-4'>
        {history.length === 0 ? (
          <p className='text-gray-500'>You have no reading history yet.</p>
        ) : (
          history.map((item) => (
            <ListCard
              key={item.issueId}
              image={item.book?.coverImageUrl}
              title={item.book?.title}
              author={item.book?.author}
              borrowedDate={item.borrowedDate}
              returnedDate={item.returnDate || 'N/A'}
              date1Label='Borrowed'
              date2Label='Returned Date'
              buttonText='Read Again'
              onButtonClick={() => navigate(`/book/${item.book?.bookId}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ReadingHistory

