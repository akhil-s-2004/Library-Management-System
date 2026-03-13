import { useEffect, useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import ListCard from '../components/ListCard'
import { fetchReservations, cancelReservation } from '../services/memberService'

const ReservedBooks = () => {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

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

  const handleCancelConfirm = async () => {
    if (confirmId == null) return
    const id = confirmId
    setConfirmId(null)
    try {
      await cancelReservation(id)
      loadReservations()
    } catch {
      setCancelError('Failed to cancel reservation.')
    }
  }

  if (loading) return <div className='p-10 text-center text-[#570000] font-bold'>Loading reservations...</div>

  return (
    <div className='px-16 py-6'>
      <h1 className='text-2xl font-bold text-[#570000] mb-6'>Reservations</h1>

      {/* Cancel Error */}
      {cancelError && (
        <div className='flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4'>
          <div className='flex items-center gap-2'><AlertCircle size={16} /> {cancelError}</div>
          <button onClick={() => setCancelError(null)} className='ml-4 hover:opacity-70'><X size={14} /></button>
        </div>
      )}

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
              onButtonClick={() => { setCancelError(null); setConfirmId(item.reservationId) }}
            />
          ))
        )}
      </div>

      {/* Cancel Confirm Modal */}
      {confirmId != null && (
        <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm'>
            <div className='px-6 py-5 border-b border-[#f0dada]'>
              <h2 className='font-bold text-[#570000] text-lg'>Cancel Reservation?</h2>
            </div>
            <div className='px-6 py-5'>
              <p className='text-sm text-gray-600'>Are you sure you want to cancel this reservation? This cannot be undone.</p>
            </div>
            <div className='px-6 py-4 border-t border-[#f0dada] flex justify-end gap-3'>
              <button
                onClick={() => setConfirmId(null)}
                className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'
              >
                Keep It
              </button>
              <button
                onClick={handleCancelConfirm}
                className='bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all'
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservedBooks
