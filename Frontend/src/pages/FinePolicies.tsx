const FinePolicies = () => {
    const tiers = [
        { days: '1–3 days', rate: '₹5 / day', total: 'Up to ₹15', color: '#f5a623' },
        { days: '4–7 days', rate: '₹8 / day', total: 'Up to ₹56', color: '#e07820' },
        { days: '8–14 days', rate: '₹10 / day', total: 'Up to ₹140', color: '#d04020' },
        { days: '15+ days', rate: '₹15 / day', total: 'No cap', color: '#570000' },
    ]

    const policies = [
        {
            icon: '📅',
            title: 'Standard Loan Period',
            desc: 'Books must be returned within 14 days of borrowing. One free renewal of 14 days is allowed if the book is not reserved by another member.',
        },
        {
            icon: '💳',
            title: 'How Fines Are Charged',
            desc: 'Fines are calculated per day for each overdue book, starting the day after the due date. The fine rate increases with the number of overdue days (see table above).',
        },
        {
            icon: '🚫',
            title: 'Borrowing Block',
            desc: 'Members with any outstanding fine cannot borrow or reserve new books until the full fine is cleared.',
        },
        {
            icon: '💰',
            title: 'Payment',
            desc: 'Fines can be paid online through the BookZone portal (Fines → Fine Status) or in person at the library counter.',
        },
        {
            icon: '📦',
            title: 'Book Damage',
            desc: 'If a book is returned damaged, a damage charge equal to 50% of the book\'s replacement cost will be added in addition to any overdue fine.',
        },
        {
            icon: '🔖',
            title: 'Lost Books',
            desc: 'If a book is declared lost, the member is charged the full replacement cost plus a ₹100 processing fee. Contact the admin within 7 days of the due date.',
        },
        {
            icon: '⚠️',
            title: 'Dispute Resolution',
            desc: 'If you believe a fine has been charged in error, raise a dispute via Help → Contact Admin within 7 days of the charge date.',
        },
        {
            icon: '📋',
            title: 'Waiver Policy',
            desc: 'A first-time offence fine may be waived at the librarian\'s discretion. Waivers are not applicable for repeated overdue violations within the same academic year.',
        },
    ]

    return (
        <div className='px-4 sm:px-8 lg:px-10 py-6 sm:py-8 max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8'>
            <div>
                <h1 className='text-2xl font-bold text-[#570000]'>Fine Policies</h1>
                <p className='text-gray-500 text-sm mt-1'>
                    Understand how fines are calculated and what to do when you have an outstanding fine.
                </p>
            </div>

            {/* Fine Rate Table */}
            <div className='bg-white border border-[#e8d4d4] rounded-2xl shadow-sm overflow-hidden'>
                <div className='px-6 py-4 border-b border-[#f0dada]'>
                    <h2 className='font-bold text-[#570000]'>Overdue Fine Rates</h2>
                </div>
                <div className='divide-y divide-[#f0dada]'>
                    {/* Header */}
                    <div className='grid grid-cols-3 px-6 py-2 bg-[#fdf5f5]'>
                        <span className='text-xs font-bold text-gray-500 uppercase tracking-wide'>Overdue Period</span>
                        <span className='text-xs font-bold text-gray-500 uppercase tracking-wide'>Rate</span>
                        <span className='text-xs font-bold text-gray-500 uppercase tracking-wide'>Max Charge</span>
                    </div>
                    {tiers.map((tier) => (
                        <div key={tier.days} className='grid grid-cols-3 px-6 py-4 items-center'>
                            <div className='flex items-center gap-2'>
                                <span
                                    className='w-2 h-2 rounded-full flex-shrink-0'
                                    style={{ background: tier.color }}
                                />
                                <span className='text-sm font-semibold text-gray-800'>{tier.days}</span>
                            </div>
                            <span className='text-sm font-bold' style={{ color: tier.color }}>{tier.rate}</span>
                            <span className='text-sm text-gray-500'>{tier.total}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Policy Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {policies.map((p, i) => (
                    <div key={i} className='bg-white border border-[#e8d4d4] rounded-2xl px-5 py-4 flex gap-4 items-start shadow-sm'>
                        <span className='text-2xl flex-shrink-0'>{p.icon}</span>
                        <div>
                            <p className='font-semibold text-[#570000] text-sm'>{p.title}</p>
                            <p className='text-gray-600 text-sm mt-1 leading-relaxed'>{p.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div
                className='rounded-2xl px-6 py-5 flex items-center justify-between'
                style={{ background: 'linear-gradient(135deg, #7a1c18, #570000)' }}
            >
                <div>
                    <p className='text-white font-bold'>Have an outstanding fine?</p>
                    <p className='text-[#f2c8c8] text-sm mt-0.5'>Pay it now to continue borrowing books.</p>
                </div>
                <a
                    href='/fines'
                    className='bg-white text-[#570000] font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#f4e7e5] transition-colors shadow'
                >
                    View Fine Status →
                </a>
            </div>
        </div>
    )
}

export default FinePolicies
