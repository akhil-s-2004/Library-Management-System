import { X, Bell } from 'lucide-react'

type Notification = {
    id: number
    title: string
    body: string
    time: string
    read: boolean
    type: 'info' | 'warning' | 'success'
}

const typeStyles: Record<string, { dot: string; bg: string }> = {
    warning: { dot: 'bg-amber-400', bg: 'bg-amber-50' },
    success: { dot: 'bg-green-500', bg: 'bg-green-50' },
    info: { dot: 'bg-blue-500', bg: 'bg-blue-50' },
}

type NotificationPanelProps = {
    items: Notification[]
    onMarkAllRead: () => void
    onDismiss: (id: number) => void
    onClose: () => void
}

const NotificationPanel = ({ items, onMarkAllRead, onDismiss, onClose }: NotificationPanelProps) => {
    const unreadCount = items.filter((n) => !n.read).length

    return (
        <>
            {/* Backdrop */}
            <div
                className='fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]'
                onClick={onClose}
            />

            {/* Panel */}
            <div className='fixed top-0 right-0 z-50 h-full w-[380px] bg-[#FFF3F3] shadow-2xl flex flex-col border-l border-[#d8bcbc]'>
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4 border-b border-[#e8d4d4] bg-white'>
                    <div className='flex items-center gap-2'>
                        <Bell size={18} className='text-[#570000]' />
                        <h2 className='font-bold text-[#570000] text-base'>Notifications</h2>
                        {unreadCount > 0 && (
                            <span className='bg-[#570000] text-white text-xs font-bold px-2 py-0.5 rounded-full'>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4e7e5] transition-colors'
                    >
                        <X size={16} className='text-[#570000]' />
                    </button>
                </div>

                {/* Mark all read */}
                {items.length > 0 && (
                    <div className='px-5 py-2 border-b border-[#f0dada] bg-white flex justify-end'>
                        <button onClick={onMarkAllRead} className='text-xs text-[#570000] hover:underline font-semibold'>
                            Mark all as read
                        </button>
                    </div>
                )}

                {/* Notification List */}
                <div className='flex-1 overflow-y-auto flex flex-col gap-0'>
                    {items.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-full gap-3 text-gray-400'>
                            <Bell size={32} className='opacity-30' />
                            <p className='text-sm font-semibold'>No notifications</p>
                            <p className='text-xs'>You're all caught up!</p>
                        </div>
                    ) : items.map((n) => {
                        const style = typeStyles[n.type]
                        return (
                            <div
                                key={n.id}
                                className={`flex gap-3 px-5 py-4 border-b border-[#f0dada] cursor-pointer hover:bg-[#f4e7e5] transition-colors ${n.read ? 'opacity-60' : ''}`}
                            >
                                {/* Dot */}
                                <div className='flex flex-col items-center pt-1 flex-shrink-0'>
                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-300' : style.dot}`} />
                                </div>

                                {/* Content */}
                                <div className='flex flex-col gap-0.5 flex-1'>
                                    <div className='flex items-start justify-between gap-2'>
                                        <p className={`text-sm font-semibold leading-snug ${n.read ? 'text-gray-500' : 'text-gray-900'}`}>
                                            {n.title}
                                        </p>
                                        <button
                                            onClick={() => onDismiss(n.id)}
                                            className='flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#ead4d4] transition-colors'
                                        >
                                            <X size={10} className='text-gray-400' />
                                        </button>
                                    </div>
                                    <p className='text-xs text-gray-500 leading-relaxed'>{n.body}</p>
                                    <p className='text-xs text-gray-400 mt-1'>{n.time}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className='px-5 py-4 border-t border-[#e8d4d4] bg-white'>
                    <button className='w-full text-center text-sm text-[#570000] font-semibold hover:underline'>
                        View All Notifications
                    </button>
                </div>
            </div>
        </>
    )
}

export default NotificationPanel
