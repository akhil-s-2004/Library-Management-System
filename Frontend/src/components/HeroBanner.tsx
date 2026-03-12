type HeroBannerProps = {
    image: string
    title: string
    description: string
    actionText?: string
    onActionClick?: () => void
}

const HeroBanner = (props: HeroBannerProps) => {
    return (
        <div className='w-full h-full bg-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 py-6 sm:py-0 gap-4 sm:gap-0 overflow-hidden'>
            <div className='max-w-full sm:max-w-[60%] text-center sm:text-left'>
                <h2 className='text-[#570000] text-2xl sm:text-3xl lg:text-4xl font-bold mb-2'>{props.title}</h2>
                <p className='text-gray-600 text-sm sm:text-base'>{props.description}</p>
                {props.actionText && props.onActionClick && (
                    <button
                        className='mt-4 bg-[#570000] text-white py-2 px-5 rounded-full font-semibold hover:bg-[#7a1c18] transition-colors shadow-md text-sm sm:text-base'
                        onClick={props.onActionClick}
                    >
                        {props.actionText}
                    </button>
                )}
            </div>
            <div className='h-32 sm:h-full flex items-center justify-center p-2 sm:p-4'>
                <img src={props.image} alt={props.title} className='h-full object-contain rounded-lg' />
            </div>
        </div>
    )
}

export default HeroBanner