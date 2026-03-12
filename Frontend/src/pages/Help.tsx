import { useState } from 'react'
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, Clock, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { sendContact } from '../services/memberService'

const faqData = [
    {
        q: 'How many books can I borrow at once?',
        a: 'Members can borrow up to 2 books at a time.',
    },
    {
        q: 'What is the borrowing period?',
        a: 'Standard borrowing period is 14 days. You can renew a book once for another 14 days if no one else has reserved it.',
    },
    {
        q: 'How do fines work?',
        a: 'A fine of ₹10 per day is charged for each overdue book. Fines must be cleared before borrowing new books.',
    },
    {
        q: 'Can I reserve a book that is currently borrowed?',
        a: 'Yes! You can place a reservation on any book. You will be notified when it becomes available.',
    },
    {
        q: 'How do I renew a book?',
        a: 'Go to My Library → Borrowed Books and click the "Renew Book" button next to the book you wish to extend.',
    },
    {
        q: 'What happens if I lose a book?',
        a: 'You will be charged the replacement cost of the book plus a ₹100 processing fee. Contact admin for details.',
    },
]

const rules = [
    { icon: '📚', title: 'Borrowing Limit', desc: 'Maximum 2 books per member at any time.' },
    { icon: '📅', title: 'Loan Period', desc: '14 days per book. One renewal allowed per book if not reserved by others.' },
    { icon: '💰', title: 'Late Fines', desc: '₹10 per day per book overdue. Fines must be paid before further borrowing.' },
    { icon: '🔇', title: 'Library Conduct', desc: 'Maintain silence in reading areas. Mobile phones on silent mode.' },
    { icon: '🚭', title: 'No Food or Drinks', desc: 'Food and beverages are not permitted inside the library.' },
    { icon: '🔖', title: 'Reservations', desc: 'You may reserve up to 3 books at a time. Reservations expire after 24 hours.' },
    { icon: '📦', title: 'Book Condition', desc: 'Return books in the same condition. Damage charges apply for defaced or damaged books.' },
]

type Tab = 'faq' | 'rules' | 'contact'

const Help = () => {
    const [activeTab, setActiveTab] = useState<Tab>('faq')
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) return
        setSending(true)
        setSendStatus('idle')
        try {
            await sendContact(subject.trim(), message.trim())
            setSendStatus('success')
            setSubject('')
            setMessage('')
            setTimeout(() => setSendStatus('idle'), 5000)
        } catch {
            setSendStatus('error')
        } finally {
            setSending(false)
        }
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'faq', label: 'FAQ' },
        { id: 'rules', label: 'Library Rules' },
        { id: 'contact', label: 'Contact Admin' },
    ]

    return (
        <div className='px-4 sm:px-8 lg:px-10 py-6 sm:py-8 max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8'>
            <h1 className='text-2xl font-bold text-[#570000]'>Help Center</h1>

            {/* Tab Bar */}
            <div className='flex flex-wrap gap-1 bg-[#f4e7e5] p-1 rounded-2xl w-fit'>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                            ? 'bg-[#570000] text-white shadow-md'
                            : 'text-[#570000] hover:bg-[#ead4d4]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* FAQ */}
            {activeTab === 'faq' && (
                <div className='flex flex-col gap-3'>
                    {faqData.map((item, i) => (
                        <div
                            key={i}
                            className='bg-white border border-[#e8d4d4] rounded-2xl overflow-hidden shadow-sm'
                        >
                            <button
                                className='w-full flex items-center justify-between px-6 py-4 text-left'
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <span className='font-semibold text-gray-800 text-sm'>{item.q}</span>
                                {openIndex === i
                                    ? <ChevronUp size={18} className='text-[#570000] flex-shrink-0' />
                                    : <ChevronDown size={18} className='text-[#570000] flex-shrink-0' />
                                }
                            </button>
                            {openIndex === i && (
                                <div className='px-6 pb-4'>
                                    <p className='text-gray-600 text-sm leading-relaxed'>{item.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Rules */}
            {activeTab === 'rules' && (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {rules.map((rule, i) => (
                        <div key={i} className='bg-white border border-[#e8d4d4] rounded-2xl px-5 py-4 flex gap-4 items-start shadow-sm'>
                            <span className='text-2xl flex-shrink-0'>{rule.icon}</span>
                            <div>
                                <p className='font-semibold text-[#570000] text-sm'>{rule.title}</p>
                                <p className='text-gray-600 text-sm mt-1 leading-relaxed'>{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Contact */}
            {activeTab === 'contact' && (
                <div className='flex flex-col gap-6'>
                    {/* Info Cards */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {[
                            { icon: <Mail size={20} className='text-[#570000]' />, label: 'Email', value: 'akhilsnair2004@gmail.com' },
                            { icon: <Phone size={20} className='text-[#570000]' />, label: 'Phone', value: '+91 9953655382' },
                            { icon: <MapPin size={20} className='text-[#570000]' />, label: 'Address', value: 'Tarento Technologies, IBC Knowledge Park, Bangalore' },
                            { icon: <Clock size={20} className='text-[#570000]' />, label: 'Hours', value: 'Mon–Sat: 9 AM – 7 PM' },
                        ].map((item, i) => (
                            <div key={i} className='bg-white border border-[#e8d4d4] rounded-2xl px-5 py-4 flex gap-4 items-center shadow-sm'>
                                <div className='w-10 h-10 flex items-center justify-center bg-[#f4e7e5] rounded-xl flex-shrink-0'>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className='text-xs text-gray-400 font-medium'>{item.label}</p>
                                    <p className='text-sm text-gray-800 font-semibold'>{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Form */}
                    <div className='bg-white border border-[#e8d4d4] rounded-2xl px-6 py-6 shadow-sm flex flex-col gap-4'>
                        <h2 className='font-bold text-[#570000] text-base'>Send a Message</h2>
                        {sendStatus === 'success' && (
                            <div className='flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl'>
                                <CheckCircle size={16} /> Message sent! We'll get back to you soon.
                            </div>
                        )}
                        {sendStatus === 'error' && (
                            <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                                <AlertCircle size={16} /> Failed to send message. Please try again.
                            </div>
                        )}
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3'>
                                <input
                                    type='text'
                                    placeholder='Subject'
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                                />
                            </div>
                            <div className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3'>
                                <textarea
                                    rows={4}
                                    placeholder='Describe your issue or question...'
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 resize-none'
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={sending || !subject.trim() || !message.trim()}
                                className='self-start flex items-center gap-2 bg-[#570000] hover:bg-[#7a1c18] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg'
                            >
                                {sending && <Loader2 size={14} className='animate-spin' />}
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Help
