import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, Edit3, QrCode, ChevronDown, ChevronUp, X, Check, BookOpen, Loader2, AlertCircle } from 'lucide-react'
import * as adminService from '../services/adminService'
import type { GoogleBookInfo } from '../services/adminService'

type CopyStatus = 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'DAMAGED' | 'LOST'

type Copy = {
    copyId: number
    status: CopyStatus
    shelfLocation: string | null
}

type Book = {
    bookId: number
    title: string
    isbn: string
    publisher: string
    publishedYear: number | null
    edition: string
    language: string
    description: string
    coverImageUrl: string | null
}

type BookWithMeta = Book & {
    authors?: string[]
    genres?: string[]
    copies?: number
}

const emptyForm = {
    title: '', isbn: '', publisher: '', year: '',
    edition: '', language: 'English', description: '',
    authors: '', genres: '', copies: '1', coverImageUrl: '',
}

const copyStatusColor: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    ISSUED: 'bg-amber-100 text-amber-700',
    RESERVED: 'bg-blue-100 text-blue-700',
    DAMAGED: 'bg-red-100 text-red-600',
    LOST: 'bg-gray-100 text-gray-600',
}

const AdminBooks = () => {
    const [bookList, setBookList] = useState<BookWithMeta[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')

    // Per-book copies panel
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [copiesMap, setCopiesMap] = useState<Record<number, Copy[]>>({})
    const [copiesLoading, setCopiesLoading] = useState<Record<number, boolean>>({})
    const [addCopiesCount, setAddCopiesCount] = useState<Record<number, string>>({})

    // Modal
    const [showModal, setShowModal] = useState(false)
    const [editBook, setEditBook] = useState<BookWithMeta | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [showQR, setShowQR] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(0)
    const PAGE_SIZE = 20

    // ISBN lookup
    const [isbnLookupLoading, setIsbnLookupLoading] = useState(false)
    const [isbnLookupResult, setIsbnLookupResult] = useState<GoogleBookInfo | null>(null)
    const [isbnError, setIsbnError] = useState<string | null>(null)

    // Saving
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [copyErrors, setCopyErrors] = useState<Record<number, string>>({})

    const loadBooks = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await adminService.fetchBooks(0, 100, query)
            // data is a Page object from Spring: { content: Book[], totalElements, ... }
            setBookList(Array.isArray(data) ? data : (data.content ?? []))
            setCurrentPage(0)
        } catch {
            setError('Failed to load books. Is the backend running?')
        } finally {
            setLoading(false)
        }
    }, [query])

    useEffect(() => {
        const t = setTimeout(loadBooks, 400)
        return () => clearTimeout(t)
    }, [loadBooks])

    const loadCopies = async (bookId: number) => {
        if (copiesMap[bookId]) return
        setCopiesLoading(p => ({ ...p, [bookId]: true }))
        try {
            const copies = await adminService.fetchCopies(bookId)
            setCopiesMap(p => ({ ...p, [bookId]: copies }))
        } catch {
            // silently fail
        } finally {
            setCopiesLoading(p => ({ ...p, [bookId]: false }))
        }
    }

    const toggleExpand = (bookId: number) => {
        if (expandedId === bookId) {
            setExpandedId(null)
        } else {
            setExpandedId(bookId)
            loadCopies(bookId)
        }
    }

    const handleISBNLookup = async () => {
        const isbn = form.isbn.replace(/[-\s]/g, '')
        if (!isbn) return
        setIsbnLookupLoading(true)
        setIsbnError(null)
        try {
            const result = await adminService.lookupISBN(isbn)
            if (!result) {
                setIsbnError('No book found for this ISBN. Please fill in manually.')
                return
            }
            setIsbnLookupResult(result)
            setForm(f => ({
                ...f,
                title: result.title,
                publisher: result.publisher,
                year: result.publishedYear ? String(result.publishedYear) : '',
                language: result.language ?? 'English',
                description: result.description,
                authors: result.authors.join(', '),
                genres: result.genres.join(', '),
                coverImageUrl: result.coverImageUrl,
            }))
        } catch {
            setIsbnError('Lookup failed. Check your API key or network.')
        } finally {
            setIsbnLookupLoading(false)
        }
    }

    const openAdd = () => {
        setEditBook(null)
        setForm(emptyForm)
        setIsbnLookupResult(null)
        setIsbnError(null)
        setSaveError(null)
        setShowModal(true)
    }

    const openEdit = async (b: BookWithMeta) => {
        setEditBook(b)
        setSaveError(null)
        // Fetch full detail to get authors/genres
        try {
            const detail = await adminService.fetchBookById(b.bookId)
            setForm({
                title: b.title,
                isbn: b.isbn,
                publisher: b.publisher ?? '',
                year: b.publishedYear ? String(b.publishedYear) : '',
                edition: b.edition ?? '',
                language: b.language ?? 'English',
                description: b.description ?? '',
                coverImageUrl: b.coverImageUrl ?? '',
                authors: (detail.authors ?? []).map((a: { authorName: string }) => a.authorName).join(', '),
                genres: (detail.genres ?? []).map((g: { genreName: string }) => g.genreName).join(', '),
                copies: '1',
            })
        } catch {
            setForm({
                title: b.title, isbn: b.isbn, publisher: b.publisher ?? '',
                year: b.publishedYear ? String(b.publishedYear) : '',
                edition: b.edition ?? '', language: b.language ?? 'English',
                description: b.description ?? '', coverImageUrl: b.coverImageUrl ?? '',
                authors: '', genres: '', copies: '1',
            })
        }
        setIsbnLookupResult(null)
        setIsbnError(null)
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.title || !form.isbn) return
        setSaving(true)
        setSaveError(null)
        try {
            const payload = {
                title: form.title, isbn: form.isbn, publisher: form.publisher,
                publishedYear: form.year ? parseInt(form.year) : null,
                edition: form.edition, language: form.language,
                description: form.description, coverImageUrl: form.coverImageUrl,
                authors: form.authors.split(',').map(s => s.trim()).filter(Boolean),
                genres: form.genres.split(',').map(s => s.trim()).filter(Boolean),
                copies: parseInt(form.copies) || 1,
            }
            if (editBook) {
                await adminService.updateBook(editBook.bookId, payload)
            } else {
                await adminService.createBook(payload)
            }
            setShowModal(false)
            setCopiesMap({}) // reset copies cache
            loadBooks()
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } }; message?: string }
            const backendMsg = axiosErr?.response?.data?.error
            setSaveError(backendMsg || axiosErr?.message || 'Failed to save book')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = (id: number) => {
        setDeleteError(null)
        setConfirmDelete(id)
    }

    const doDelete = async () => {
        if (confirmDelete == null) return
        const id = confirmDelete
        setConfirmDelete(null)
        try {
            await adminService.deleteBook(id)
            loadBooks()
            setCopiesMap(p => { const n = { ...p }; delete n[id]; return n })
        } catch {
            setDeleteError('Failed to delete book.')
        }
    }

    const handleAddCopy = async (bookId: number) => {
        const count = Math.max(1, parseInt(addCopiesCount[bookId] || '1'))
        setCopyErrors(p => { const n = { ...p }; delete n[bookId]; return n })
        try {
            for (let i = 0; i < count; i++) {
                await adminService.addCopy(bookId)
            }
            // Reload copies for this book
            setCopiesMap(p => { const n = { ...p }; delete n[bookId]; return n })
            loadCopies(bookId)
            setAddCopiesCount(p => ({ ...p, [bookId]: '' }))
        } catch {
            setCopyErrors(p => ({ ...p, [bookId]: 'Failed to add copy.' }))
        }
    }

    return (
        <div className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6'>
            {/* Header Row */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-[#570000]'>Books</h1>
                    <p className='text-gray-500 text-sm mt-1'>{bookList.length} books in catalogue</p>
                </div>
                <button
                    onClick={openAdd}
                    className='flex items-center gap-2 bg-[#570000] hover:bg-[#7a1c18] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-md transition-all'
                >
                    <Plus size={16} /> Add Book
                </button>
            </div>

            {/* Search */}
            <div className='flex items-center gap-3 bg-white border border-[#e8d4d4] rounded-full px-4 py-2.5 shadow-sm max-w-md'>
                <Search size={16} className='text-gray-400' />
                <input
                    type='text' placeholder='Search by title, ISBN...'
                    className='flex-1 outline-none text-sm text-gray-700'
                    value={query} onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Error */}
            {error && (
                <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Delete Error */}
            {deleteError && (
                <div className='flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                    <div className='flex items-center gap-2'><AlertCircle size={16} /> {deleteError}</div>
                    <button onClick={() => setDeleteError(null)} className='ml-4 hover:opacity-70'><X size={14} /></button>
                </div>
            )}

            {/* Table */}
            <div className='bg-white border border-[#e8d4d4] rounded-2xl shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-[#fdf5f5]'>
                                {['Cover', 'Title', 'ISBN', 'Publisher', 'Copies', 'Actions'].map(h => (
                                    <th key={h} className='px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide'>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[#f8eded]'>
                            {loading ? (
                                <tr><td colSpan={6} className='p-8 text-center'><Loader2 className='animate-spin mx-auto text-[#570000]' size={24} /></td></tr>
                            ) : bookList.length === 0 ? (
                                <tr><td colSpan={6} className='p-8 text-center text-gray-400 text-sm'>No books found. Add your first book!</td></tr>
                            ) : bookList.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map((book) => (
                                <>
                                    <tr key={book.bookId} className='hover:bg-[#fdf9f9] transition-colors'>
                                        {/* Cover */}
                                        <td className='px-4 py-3'>
                                            {book.coverImageUrl ? (
                                                <img src={book.coverImageUrl} alt={book.title} className='w-9 h-12 object-cover rounded shadow-sm' />
                                            ) : (
                                                <div className='w-9 h-12 bg-[#f4e7e5] rounded flex items-center justify-center'>
                                                    <BookOpen size={14} className='text-[#570000] opacity-50' />
                                                </div>
                                            )}
                                        </td>
                                        {/* Title */}
                                        <td className='px-4 py-3 max-w-[200px]'>
                                            <button
                                                className='flex items-center gap-1 text-sm font-semibold text-[#570000] hover:underline text-left'
                                                onClick={() => toggleExpand(book.bookId)}
                                            >
                                                <span className='truncate'>{book.title}</span>
                                                {expandedId === book.bookId ? <ChevronUp size={14} className='flex-shrink-0' /> : <ChevronDown size={14} className='flex-shrink-0' />}
                                            </button>
                                        </td>
                                        <td className='px-4 py-3 text-sm text-gray-500 font-mono'>{book.isbn}</td>
                                        <td className='px-4 py-3 text-sm text-gray-500'>{book.publisher ?? '—'}</td>
                                        <td className='px-4 py-3'>
                                            <span className='bg-[#f4e7e5] text-[#570000] text-xs font-semibold px-2 py-1 rounded-full'>
                                                {book.copies ?? '—'} copies
                                            </span>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex items-center gap-2'>
                                                <button onClick={() => openEdit(book)} className='w-7 h-7 flex items-center justify-center rounded-lg bg-[#f4e7e5] hover:bg-[#e8d4d4] transition-colors'>
                                                    <Edit3 size={13} className='text-[#570000]' />
                                                </button>
                                                <button onClick={() => handleDelete(book.bookId)} className='w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors'>
                                                    <Trash2 size={13} className='text-red-500' />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Copies */}
                                    {expandedId === book.bookId && (
                                        <tr key={`exp-${book.bookId}`}>
                                            <td colSpan={6} className='px-6 py-4 bg-[#fdf9f9]'>
                                                <p className='text-xs font-bold text-gray-500 uppercase mb-3'>Physical Copies & QR Codes</p>
                                                <div className='flex items-center gap-2 mb-4'>
                                                    <span className='text-xs text-gray-500'>Add copies:</span>
                                                    <input
                                                        type='number' min={1} max={50} placeholder='1'
                                                        value={addCopiesCount[book.bookId] ?? ''}
                                                        onChange={(e) => setAddCopiesCount(p => ({ ...p, [book.bookId]: e.target.value }))}
                                                        className='w-16 border border-[#e8c8c8] bg-white rounded-lg px-2 py-1 text-sm outline-none text-center'
                                                    />
                                                    <button
                                                        onClick={() => handleAddCopy(book.bookId)}
                                                        className='flex items-center gap-1 bg-[#570000] hover:bg-[#7a1c18] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm'
                                                    >
                                                        <Plus size={11} /> Add Copies
                                                    </button>
                                                </div>
                                                {copyErrors[book.bookId] && (
                                                    <div className='flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl mb-3'>
                                                        <span>{copyErrors[book.bookId]}</span>
                                                        <button onClick={() => setCopyErrors(p => { const n = { ...p }; delete n[book.bookId]; return n })} className='ml-2 hover:opacity-70'><X size={12} /></button>
                                                    </div>
                                                )}
                                                {copiesLoading[book.bookId] ? (
                                                    <Loader2 className='animate-spin text-[#570000]' size={18} />
                                                ) : (
                                                    <div className='flex flex-wrap gap-3'>
                                                        {(copiesMap[book.bookId] ?? []).map((copy) => (
                                                            <div key={copy.copyId} className='bg-white border border-[#e8d4d4] rounded-xl p-3 flex flex-col items-center gap-2 w-[150px] shadow-sm'>
                                                                {showQR === copy.copyId ? (
                                                                    <img
                                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${copy.copyId}&color=570000`}
                                                                        alt={String(copy.copyId)}
                                                                        className='w-[110px] h-[110px] rounded'
                                                                    />
                                                                ) : (
                                                                    <div className='w-[110px] h-[110px] bg-[#f4e7e5] rounded flex items-center justify-center'>
                                                                        <QrCode size={40} className='text-[#570000] opacity-40' />
                                                                    </div>
                                                                )}
                                                                <p className='text-[10px] font-mono font-bold text-[#570000]'>COPY-{copy.copyId}</p>
                                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${copyStatusColor[copy.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                    {copy.status}
                                                                </span>
                                                                {copy.shelfLocation && (
                                                                    <p className='text-[9px] text-gray-400'>📍 {copy.shelfLocation}</p>
                                                                )}
                                                                <button
                                                                    onClick={() => setShowQR(showQR === copy.copyId ? null : copy.copyId)}
                                                                    className='w-full text-[10px] font-semibold bg-[#570000] text-white py-1 rounded-lg hover:bg-[#7a1c18] transition-colors'
                                                                >
                                                                    {showQR === copy.copyId ? 'Hide QR' : 'Show QR'}
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {(copiesMap[book.bookId] ?? []).length === 0 && (
                                                            <p className='text-sm text-gray-400'>No copies yet.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {Math.ceil(bookList.length / PAGE_SIZE) > 1 && (
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-gray-500'>
                        Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, bookList.length)} of {bookList.length} books
                    </p>
                    <div className='flex items-center gap-1'>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className='px-3 py-1.5 text-sm font-semibold rounded-xl border border-[#e8d4d4] text-[#570000] hover:bg-[#fdf5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                        >← Prev</button>
                        {Array.from({ length: Math.ceil(bookList.length / PAGE_SIZE) }, (_, i) => i).filter(i =>
                            i === 0 || i === Math.ceil(bookList.length / PAGE_SIZE) - 1 || Math.abs(i - currentPage) <= 1
                        ).reduce<(number | '...')[]>((acc, i, idx, arr) => {
                            if (idx > 0 && (i as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                            acc.push(i)
                            return acc
                        }, []).map((item, idx) =>
                            item === '...' ? (
                                <span key={`e${idx}`} className='px-2 text-gray-400'>…</span>
                            ) : (
                                <button key={item} onClick={() => setCurrentPage(item as number)}
                                    className={`w-8 h-8 text-sm font-semibold rounded-xl transition-colors ${currentPage === item ? 'bg-[#570000] text-white' : 'border border-[#e8d4d4] text-[#570000] hover:bg-[#fdf5f5]'}`}>
                                    {(item as number) + 1}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(bookList.length / PAGE_SIZE) - 1, p + 1))}
                            disabled={currentPage === Math.ceil(bookList.length / PAGE_SIZE) - 1}
                            className='px-3 py-1.5 text-sm font-semibold rounded-xl border border-[#e8d4d4] text-[#570000] hover:bg-[#fdf5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                        >Next →</button>
                    </div>
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between px-6 py-5 border-b border-[#f0dada]'>
                            <h2 className='font-bold text-[#570000] text-xl'>{editBook ? 'Edit Book' : 'Add Book by ISBN'}</h2>
                            <button onClick={() => setShowModal(false)} className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4e7e5] transition-colors'>
                                <X size={16} className='text-[#570000]' />
                            </button>
                        </div>
                        <div className='px-6 py-5 flex flex-col gap-4'>
                            {/* ISBN Lookup (only for add) */}
                            {!editBook && (
                                <div className='flex flex-col gap-2'>
                                    <label className='text-xs font-semibold text-gray-500'>ISBN *</label>
                                    <div className='flex gap-2'>
                                        <div className='flex-1 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 focus-within:border-[#570000] transition-colors'>
                                            <input
                                                type='text' placeholder='e.g. 9780062316097'
                                                value={form.isbn}
                                                onChange={(e) => { setForm(f => ({ ...f, isbn: e.target.value })); setIsbnLookupResult(null) }}
                                                className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                                            />
                                        </div>
                                        <button
                                            onClick={handleISBNLookup}
                                            disabled={!form.isbn || isbnLookupLoading}
                                            className='flex items-center gap-1.5 bg-[#570000] hover:bg-[#7a1c18] disabled:opacity-50 text-white text-sm font-semibold px-4 rounded-xl transition-colors'
                                        >
                                            {isbnLookupLoading ? <Loader2 size={14} className='animate-spin' /> : <Search size={14} />}
                                            Lookup
                                        </button>
                                    </div>
                                    {isbnError && (
                                        <p className='text-xs text-amber-600'>{isbnError}</p>
                                    )}
                                    {isbnLookupResult && (
                                        <div className='flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3'>
                                            {isbnLookupResult.coverImageUrl && (
                                                <img src={isbnLookupResult.coverImageUrl} alt={isbnLookupResult.title} className='w-10 h-14 object-cover rounded shadow' />
                                            )}
                                            <div>
                                                <p className='text-sm font-semibold text-green-800'>{isbnLookupResult.title}</p>
                                                <p className='text-xs text-green-600'>{isbnLookupResult.authors.join(', ')}</p>
                                                <p className='text-xs text-green-500'>{isbnLookupResult.publisher} · {isbnLookupResult.publishedYear}</p>
                                            </div>
                                            <Check size={16} className='text-green-500 ml-auto flex-shrink-0' />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Form Fields */}
                            {[
                                { label: 'Title *', key: 'title', type: 'text', placeholder: 'Book title' },
                                ...(!editBook ? [] : [{ label: 'ISBN', key: 'isbn', type: 'text', placeholder: '978-x-xx-xxxxxx-x' }]),
                                { label: 'Authors (comma-separated)', key: 'authors', type: 'text', placeholder: 'e.g. Paulo Coelho, J.K. Rowling' },
                                { label: 'Publisher', key: 'publisher', type: 'text', placeholder: 'Publisher name' },
                                { label: 'Published Year', key: 'year', type: 'number', placeholder: '2024' },
                                { label: 'Edition', key: 'edition', type: 'text', placeholder: '1st, 2nd…' },
                                { label: 'Language', key: 'language', type: 'text', placeholder: 'English' },
                                { label: 'Genres (comma-separated)', key: 'genres', type: 'text', placeholder: 'Fiction, Philosophy' },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key} className='flex flex-col gap-1'>
                                    <label className='text-xs font-semibold text-gray-500'>{label}</label>
                                    <div className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 focus-within:border-[#570000] transition-colors'>
                                        <input
                                            type={type} placeholder={placeholder}
                                            value={(form as Record<string, string>)[key]}
                                            onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Description */}
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-gray-500'>Description</label>
                                <div className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 focus-within:border-[#570000] transition-colors'>
                                    <textarea rows={3} placeholder='Book description...'
                                        value={form.description}
                                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                        className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 resize-none'
                                    />
                                </div>
                            </div>

                            {/* Copies (add only) */}
                            {!editBook && (
                                <div className='flex flex-col gap-1'>
                                    <label className='text-xs font-semibold text-gray-500'>Number of Copies *</label>
                                    <div className='bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-2.5 focus-within:border-[#570000] transition-colors'>
                                        <input type='number' min={1} max={100} placeholder='e.g. 3'
                                            value={form.copies}
                                            onChange={(e) => setForm(f => ({ ...f, copies: e.target.value }))}
                                            className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                                        />
                                    </div>
                                    <p className='text-xs text-gray-400'>A QR-coded copy ID will be generated for each copy.</p>
                                </div>
                            )}
                        </div>
                        <div className='px-6 py-4 border-t border-[#f0dada] flex flex-col gap-3'>
                            {saveError && (
                                <div className='flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
                                    <div className='flex items-center gap-2'><AlertCircle size={16} /> {saveError}</div>
                                    <button onClick={() => setSaveError(null)} className='ml-3 hover:opacity-70'><X size={14} /></button>
                                </div>
                            )}
                            <div className='flex justify-end gap-3'>
                                <button onClick={() => setShowModal(false)} className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!form.title || !form.isbn || saving}
                                    className='flex items-center gap-2 bg-[#570000] hover:bg-[#7a1c18] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all'
                                >
                                    {saving ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
                                    {editBook ? 'Save Changes' : 'Add Book & Generate QRs'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {confirmDelete != null && (
                <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm'>
                        <div className='px-6 py-5 border-b border-[#f0dada]'>
                            <h2 className='font-bold text-[#570000] text-lg'>Delete Book?</h2>
                        </div>
                        <div className='px-6 py-5'>
                            <p className='text-sm text-gray-600'>This will permanently delete the book and all its copies. This action cannot be undone.</p>
                        </div>
                        <div className='px-6 py-4 border-t border-[#f0dada] flex justify-end gap-3'>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className='border border-gray-300 text-gray-600 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={doDelete}
                                className='bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all'
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminBooks
