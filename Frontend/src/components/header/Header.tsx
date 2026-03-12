import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import logoIcon from '../../assets/logo.png'
import logoText from '../../assets/logo_word.png'
import { Search, User, Bell, Menu, X } from 'lucide-react'
import NavItem from './NavItem'
import NotificationPanel from '../NotificationPanel'
import { logout } from '../../services/authService'
import { fetchNotifications } from '../../services/memberService'

type NotifItem = {
  id: number
  title: string
  body: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success'
}

const Header = () => {
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifItems, setNotifItems] = useState<NotifItem[]>([])

  useEffect(() => {
    fetchNotifications().then((data: any[]) => {
      setNotifItems(data.map((n, i) => ({
        id: i,
        title: n.title,
        body: n.body,
        time: 'Now',
        read: false,
        type: (n.type === 'danger' ? 'warning' : n.type === 'success' ? 'success' : 'warning') as NotifItem['type'],
      })))
    }).catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  const unreadCount = notifItems.filter(n => !n.read).length

  const exploreItems = [
    { label: 'Browse all books', onClick: () => { navigate('/browse'); setMobileOpen(false) } },
    // { label: 'Genres', onClick: () => { navigate('/genres'); setMobileOpen(false) } },
    { label: 'Latest Additions', onClick: () => { navigate('/latest'); setMobileOpen(false) } },
    { label: 'Popular Books', onClick: () => { navigate('/popular-books'); setMobileOpen(false) } },
  ]
  const myLibraryItems = [
    { label: 'My Library', onClick: () => { navigate('/my-library'); setMobileOpen(false) } },
    { label: 'Borrowed Books', onClick: () => { navigate('/my-library'); setMobileOpen(false) } },
    { label: 'Reservations', onClick: () => { navigate('/my-library'); setMobileOpen(false) } },
    { label: 'Reading History', onClick: () => { navigate('/my-library'); setMobileOpen(false) } },
  ]
  const fineItems = [
    { label: 'Fine Status', onClick: () => { navigate('/fines'); setMobileOpen(false) } },
    { label: 'Fine Policies', onClick: () => { navigate('/fine-policies'); setMobileOpen(false) } },
  ]
  const helpItems = [
    { label: 'FAQ', onClick: () => { navigate('/help'); setMobileOpen(false) } },
    { label: 'Library Rules', onClick: () => { navigate('/help'); setMobileOpen(false) } },
    { label: 'Contact Admin', onClick: () => { navigate('/help'); setMobileOpen(false) } },
  ]
  const profileItems = [
    { label: 'View Profile', onClick: () => { navigate('/profile'); setMobileOpen(false) } },
    { label: 'Logout', onClick: handleLogout },
  ]

  return (
    <>
      <header className='sticky top-0 z-50 bg-[#FFF3F3] border-b border-[#d8bcbc]'>
        <div className='flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3'>
          {/* Logo */}
          <div className='flex gap-6'>
            <div className='flex items-center gap-2'>
              <img src={logoIcon} alt='Logo' className='h-7 sm:h-8' />
              <img src={logoText} alt='BookZone' className='h-5 sm:h-6' />
            </div>

          {/* Desktop Nav */}
            <nav className='hidden lg:flex items-center  gap-5 xl:gap-7 text-base font-bold text-[#570000]'>
              <button className='text-[#6b1b17] font-semibold hover:opacity-70 transition-opacity' onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <NavItem label='Explore' items={exploreItems} />
              <NavItem label='My Library' items={myLibraryItems} />
              <NavItem label='Fines' items={fineItems} />
              <NavItem label='Help' items={helpItems} />
            </nav>
          </div>

          {/* Desktop Icons */}
          <div className='hidden lg:flex items-center gap-5'>
            <button onClick={() => navigate('/browse')}><Search color='#570000' size={20} /></button>
            <button className='relative' onClick={() => setShowNotifications((p) => !p)}>
              <Bell color='#570000' size={20} />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 w-4 h-4 bg-[#570000] text-white text-[9px] font-bold rounded-full flex items-center justify-center'>{unreadCount}</span>
              )}
            </button>
            <NavItem label={<User color='#570000' size={20} />} items={profileItems} align='right' />
          </div>

          {/* Mobile: bell + hamburger */}
          <div className='flex lg:hidden items-center gap-3'>
            <button className='relative' onClick={() => setShowNotifications((p) => !p)}>
              <Bell color='#570000' size={20} />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 w-4 h-4 bg-[#570000] text-white text-[9px] font-bold rounded-full flex items-center justify-center'>{unreadCount}</span>
              )}
            </button>
            <button onClick={() => setMobileOpen((p) => !p)} className='p-1'>
              {mobileOpen ? <X color='#570000' size={22} /> : <Menu color='#570000' size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className='lg:hidden bg-[#FFF3F3] border-t border-[#e8d4d4] px-4 py-4 flex flex-col gap-2'>
            <button className='text-left py-2 px-3 text-[#570000] font-semibold text-sm hover:bg-[#f4e7e5] rounded-xl transition-colors' onClick={() => { navigate('/dashboard'); setMobileOpen(false) }}>Dashboard</button>
            {[
              { label: 'Browse Books', to: '/browse' },
              { label: 'Genres', to: '/genres' },
              { label: 'Latest Additions', to: '/latest' },
              { label: 'Popular Books', to: '/popular-books' },
              { label: 'My Library', to: '/my-library' },
              { label: 'Fine Status', to: '/fines' },
              { label: 'Fine Policies', to: '/fine-policies' },
              { label: 'Help', to: '/help' },
              { label: 'Profile', to: '/profile' },
            ].map((item) => (
              <button key={item.to} className='text-left py-2 px-3 text-[#570000] font-semibold text-sm hover:bg-[#f4e7e5] rounded-xl transition-colors' onClick={() => { navigate(item.to); setMobileOpen(false) }}>
                {item.label}
              </button>
            ))}
            <hr className='border-[#e8d4d4] my-1' />
            <button className='text-left py-2 px-3 text-gray-400 text-sm hover:bg-[#f4e7e5] rounded-xl transition-colors' onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      {showNotifications && (
        <NotificationPanel
          items={notifItems}
          onMarkAllRead={() => setNotifItems(items => items.map(n => ({ ...n, read: true })))}
          onDismiss={(id) => setNotifItems(items => items.filter(n => n.id !== id))}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </>
  )
}

export default Header