import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import image from '../assets/Library-cuate.svg'
import HorizontalBookList from '../components/HorizontalBookList'
import StatsCard from '../components/StatsCard'
import HorizontalGenreList from '../components/HorizontalGenreList'
import HeroBanner from '../components/HeroBanner'
import { fetchDashboard, fetchProfile } from '../services/memberService'
import { fetchBooks } from '../services/bookService'
import { getCookie, setCookie } from '../services/cookieUtils'

const Dashboard = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [status, setStatus] = useState(getCookie('user_status') || '')
    const [stats, setStats] = useState({
        active_reads: 0,
        total_reads: 0,
        active_reservations: 0,
        unpaid_fines: 0
    })
    const [latestBooks, setLatestBooks] = useState<any[]>([])
    const [recommendedBooks, setRecommendedBooks] = useState<any[]>([])

    const isPending = status === 'pending'

    useEffect(() => {
        fetchProfile().then(data => {
            setName(data.name)
            setStatus(data.status)
            setCookie('user_status', data.status, 10 * 60 * 60)
        }).catch(err => console.error("Error fetching profile:", err))

        fetchDashboard().then(data => {
            setStats(data)
        }).catch(err => console.error("Error fetching dashboard stats:", err))

        // Fetch latest 15 books (newest first)
        fetchBooks({ limit: 15, sort: 'desc' }).then(data => {
            setLatestBooks(data.content || [])
        }).catch(err => console.error("Error fetching latest books:", err))

        // Fetch recommended books (oldest first as a contrast)
        fetchBooks({ limit: 15, sort: 'asc' }).then(data => {
            setRecommendedBooks(data.content || [])
        }).catch(err => console.error("Error fetching recommendations:", err))
    }, [])

    return (
        <div>
            {/* Pending Approval Banner */}
            {isPending && (
                <div className='mx-4 sm:mx-8 lg:mx-16 mt-4 flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-5 py-3 text-sm font-medium shadow-sm'>
                    <span className='text-lg'>⏳</span>
                    <div>
                        <span className='font-semibold'>Account Pending Approval — </span>
                        Your account is awaiting admin approval. You can browse the library, but
                        borrowing, reserving and returning books will be available once approved.
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className='flex flex-col lg:flex-row items-center gap-6 px-4 sm:px-8 lg:px-16 xl:px-20 py-6'>
                {/* Left: greeting + stats */}
                <div className='flex flex-col gap-4 w-full lg:w-auto lg:flex-shrink-0'>
                    <div>
                        <h1 className='text-[#570000] text-2xl sm:text-3xl lg:text-4xl font-bold'>
                            Hello {name || 'Member'}!! 👋
                        </h1>
                        <p className='text-[#570000] text-base sm:text-lg lg:text-xl font-semibold mt-1'>
                            Discover your next great read with our curated collection.
                        </p>
                    </div>
                    <div className='w-full lg:w-[420px] xl:w-[460px]'>
                        <StatsCard stats={[
                            { label: 'Borrowed Books', value: stats.active_reads },
                            { label: 'Reservations', value: stats.active_reservations },
                            { label: 'Unpaid Fines', value: stats.unpaid_fines > 0 ? `₹${Math.round(stats.unpaid_fines)}` : '0' },
                        ]} />
                    </div>
                </div>

                {/* Right: hero banner */}
                <div className='w-full flex-1 h-[220px] sm:h-[280px] lg:h-[360px]'>
                    <HeroBanner
                        title='Welcome to BookZone'
                        description='Borrow, reserve and track all your reads in one place.'
                        image={image}
                        actionText='Browse Books'
                        onActionClick={() => navigate('/browse')}
                    />
                </div>
            </div>

            {/* Book & Genre Lists */}
            <div className='px-4 sm:px-8 lg:px-10 py-4 pb-8 flex flex-col gap-6 md:gap-10'>
                <HorizontalBookList
                    title='Latest Additions'
                    books={latestBooks}
                    onBookClick={(id) => navigate(`/book/${id}`)}
                    browseLink='/latest'
                />
                <HorizontalGenreList title='Explore by Genre' />
                <HorizontalBookList
                    title='Recommended for you'
                    books={recommendedBooks}
                    onBookClick={(id) => navigate(`/book/${id}`)}
                    browseLink='/browse'
                />
            </div>
        </div>
    )
}

export default Dashboard
