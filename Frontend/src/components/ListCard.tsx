type ListCardProps = {
  image: string
  title: string
  author: string
  borrowedDate: string
  returnedDate: string
  date1Label?: string
  date2Label?: string
  buttonText?: string
  onButtonClick?: () => void
}

const ListCard = (props: ListCardProps) => {
  const { date1Label = 'Borrowed', date2Label = 'Returned Date' } = props
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm'>
      {/* Book Image */}
      <div className='w-12 h-16 sm:w-14 sm:h-20 flex-shrink-0'>
        <img src={props.image} alt={props.title} className='w-full h-full object-cover rounded-md' />
      </div>

      {/* Title & Author */}
      <div className='flex-1 sm:w-44 sm:flex-shrink-0'>
        <p className='font-bold text-gray-900 text-sm leading-tight'>{props.title}</p>
        <p className='text-gray-500 text-xs sm:text-sm mt-0.5'>{props.author}</p>
      </div>

      {/* Dates */}
      <div className='flex-1 flex flex-col gap-1'>
        <p className='text-green-600 text-xs sm:text-sm font-medium'>
          {date1Label}: {props.borrowedDate}
        </p>
        <p className='text-red-500 text-xs sm:text-sm font-medium'>
          {date2Label}: {props.returnedDate}
        </p>
      </div>

      {/* Button */}
      {props.buttonText && (
        <button
          className='flex-shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm font-semibold py-2 px-4 sm:px-5 rounded-full transition-colors w-full sm:w-auto text-center'
          onClick={props.onButtonClick}
        >
          {props.buttonText}
        </button>
      )}
    </div>
  )
}

export default ListCard