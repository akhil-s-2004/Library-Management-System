type BookLayoutProps = {
    image: string
    title: string
    author: string
    publisher?: string
    description: string
    genres: string[]
    statusText?: string
    statusColor?: string
    buttonText?: string
    onButtonClick?: () => void
}

const BookLayout = (props: BookLayoutProps) => {
    return (
        <div className='flex flex-col md:flex-row gap-6 md:gap-10 items-start'>
            {/* Cover */}
            <div className='w-full max-w-[200px] md:w-[260px] mx-auto md:mx-0 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl'>
                <img src={props.image} alt={props.title} className='w-full object-cover' />
            </div>

            {/* Details */}
            <div className='flex flex-col gap-3 flex-1'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>{props.title}</h1>
                <p className='text-[#570000] font-semibold text-base sm:text-lg'>{props.author}</p>
                {props.publisher && (
                    <p className='text-gray-500 text-sm'>{props.publisher}</p>
                )}
                <p className='text-gray-600 text-sm leading-relaxed'>{props.description}</p>

                {/* Genre Tags */}
                <div className='flex flex-wrap gap-2'>
                    {props.genres.map((g) => (
                        <span key={g} className='bg-[#f4e7e5] border border-[#e8c8c8] text-[#570000] text-xs font-semibold px-3 py-1 rounded-full'>
                            {g}
                        </span>
                    ))}
                </div>

                {props.statusText && (
                    <p className={`text-sm ${props.statusColor ?? 'text-gray-600'}`}>{props.statusText}</p>
                )}

                {props.buttonText && (
                    <button
                        className='self-start bg-[#570000] hover:bg-[#7a1c18] text-white font-semibold py-2.5 px-7 rounded-full transition-all shadow-md hover:shadow-lg text-sm sm:text-base'
                        onClick={props.onButtonClick}
                    >
                        {props.buttonText}
                    </button>
                )}
            </div>
        </div>
    )
}

export default BookLayout