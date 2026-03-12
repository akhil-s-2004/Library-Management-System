import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { LayoutDashboard, BookOpen, Users, AlertCircle, LogOut, ChevronRight, Menu, User } from 'lucide-react'
import logoIcon from '../assets/logo.png'
import logoText from '../assets/logo_word.png'
import { logout } from '../services/authService'

const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/admin' },
    { icon: <BookOpen size={18} />, label: 'Books', to: '/admin/books' },
    { icon: <Users size={18} />, label: 'Users', to: '/admin/users' },
    { icon: <AlertCircle size={18} />, label: 'Fines', to: '/admin/fines' },
    // { icon: <User size={18} />, label: 'Profile', to: '/admin/profile' },
]

const AdminLayout = () => {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className='flex items-center gap-2 px-5 py-5 border-b border-white/10'>
                <img src={logoIcon} alt='BookZone' className='h-8 brightness-0 invert' />
                <img src={logoText} alt='BookZone' className='h-5 brightness-0 invert' />
            </div>
            <div className='px-5 py-3'><span className='text-[10px] font-bold tracking-widest text-white/50 uppercase'>Admin Panel</span></div>

            <nav className='flex flex-col gap-1 px-3 flex-1'>
                {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/admin'}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
                        }
                    >
                        {item.icon} {item.label} <ChevronRight size={14} className='ml-auto opacity-50' />
                    </NavLink>
                ))}
            </nav>

            <div className='px-3 py-4 border-t border-white/10 flex flex-col gap-1'>
                {/* <button onClick={() => navigate('/dashboard')} className='flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors'>
                    <BookOpen size={16} /> User View
                </button> */}
                <button onClick={() => navigate('/admin/profile')} className='flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors'>
                    <User size={16} /> Profile
                </button>
                <button onClick={() => { logout(); navigate('/signin') }} className='flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors'>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </>
    )

    return (
        <div className='flex h-screen w-screen overflow-hidden bg-[#FFF3F3]'>
            {/* Desktop Sidebar */}
            <aside className='hidden lg:flex w-[220px] flex-shrink-0 flex-col' style={{ background: 'linear-gradient(180deg, #7a1c18 0%, #570000 60%, #3a0000 100%)' }}>
                {sidebarContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <>
                    <div className='fixed inset-0 z-40 bg-black/40' onClick={() => setSidebarOpen(false)} />
                    <aside className='fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col' style={{ background: 'linear-gradient(180deg, #7a1c18 0%, #570000 60%, #3a0000 100%)' }}>
                        {sidebarContent}
                    </aside>
                </>
            )}

            {/* Main */}
            <div className='flex-1 flex flex-col overflow-hidden'>
                {/* Mobile top bar */}
                <div className='lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#e8d4d4] bg-white'>
                    <button onClick={() => setSidebarOpen(true)} className='p-1.5 rounded-lg bg-[#f4e7e5]'>
                        <Menu size={18} className='text-[#570000]' />
                    </button>
                    <div className='flex items-center gap-2'>
                        <img src={logoIcon} alt='BookZone' className='h-6' />
                        <img src={logoText} alt='BookZone' className='h-4' />
                    </div>
                    <span className='ml-auto text-[10px] text-gray-400 font-bold uppercase tracking-widest'>Admin</span>
                </div>

                <main className='flex-1 overflow-y-auto bg-[#FFF3F3]'>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
