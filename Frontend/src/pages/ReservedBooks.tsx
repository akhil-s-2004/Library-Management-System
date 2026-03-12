import React, { useEffect, useState } from 'react'
import ListCard from '../components/ListCard'
import { fetchReservations, cancelReservation } from '../services/memberService'

const ReservedBooks = () => {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadReservations = () => {
    setLoading(true)
    fetchReservations().then(data => {
      setReservations(data)
      setLoading(false)
    }).catch(err => {
      console.error("Error fetching reservations:", err)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const handleCancel = async (id: number) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      try {
        await cancelReservation(id)
        loadReservations()
      } catch (err) {
        alert("Failed to cancel reservation")
      }
    }
  }

  if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading reservations...</div>

  return (
    <div className='px-16 py-6'>
      <h1 className='text-2xl font-bold text-[#570000] mb-6'>Reservations</h1>
      <div className='flex flex-col gap-4'>
        {reservations.length === 0 ? (
          <p className='text-gray-500'>You have no active reservations.</p>
        ) : (
          reservations.map((item) => (
            <ListCard
              key={item.reservationId}
              image={item.book?.coverImageUrl}
              title={item.book?.title}
              author={item.book?.author}
              borrowedDate={item.reservationDate}
              returnedDate={item.expiresAt || 'N/A'}
              date1Label='Reserved On'
              date2Label='Expires At'
              buttonText={item.status === 'active' ? 'Cancel Reservation' : undefined}
              onButtonClick={() => handleCancel(item.reservationId)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ReservedBooks

