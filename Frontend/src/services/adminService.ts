import api from './api'

// ─── Google Books ISBN Lookup ────────────────────────────────────────────────

export interface GoogleBookInfo {
    title: string
    authors: string[]
    publisher: string
    publishedYear: number | null
    description: string
    coverImageUrl: string
    language: string
    isbn: string
    genres: string[]
}

export const lookupISBN = async (isbn: string): Promise<GoogleBookInfo | null> => {
    const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${key ? `&key=${key}` : ''}`
    const res = await fetch(url)
    const data = await res.json()
    if (!data.items || data.items.length === 0) return null

    const info = data.items[0].volumeInfo
    const cover: string = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''

    return {
        title: info.title || '',
        authors: info.authors || [],
        publisher: info.publisher || '',
        publishedYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : null,
        description: info.description || '',
        coverImageUrl: cover.replace('http://', 'https://'),
        language: info.language || 'en',
        isbn,
        genres: info.categories || [],
    }
}

// ─── Books (Admin) ──────────────────────────────────────────────────────────

export const fetchBooks = (page = 0, limit = 20, search = '') =>
    api.get('/admin/books', { params: { page, limit, search } }).then(r => r.data)

export const fetchBookById = (id: number) =>
    api.get('/admin/books', { params: { id } }).then(r => r.data)

export const createBook = (data: {
    title: string
    isbn: string
    publisher: string
    publishedYear: number | null
    edition: string
    language: string
    description: string
    coverImageUrl: string
    authors: string[]
    genres: string[]
    copies: number
}) => api.post('/admin/books', data).then(r => r.data)

export const updateBook = (id: number, data: object) =>
    api.put(`/admin/books/${id}`, data).then(r => r.data)

export const deleteBook = (id: number) =>
    api.delete(`/admin/books/${id}`).then(r => r.data)

export const fetchCopies = (bookId: number) =>
    api.get(`/admin/books/${bookId}/copies`).then(r => r.data)

export const addCopy = (bookId: number, location?: string) =>
    api.post(`/admin/books/${bookId}/copies`, null, { params: { location } }).then(r => r.data)

// ─── Users (Admin) ─────────────────────────────────────────────────────────

export const fetchUsers = () =>
    api.get('/admin/users').then(r => r.data)

export const fetchPendingUsers = () =>
    api.get('/admin/users/pending').then(r => r.data)

export const approveUser = (userId: string) =>
    api.put(`/admin/users/${userId}/approve`).then(r => r.data)

export const rejectUser = (userId: string) =>
    api.put(`/admin/users/${userId}/reject`).then(r => r.data)

export const createAdminUser = (data: {
    name: string
    email: string
    phone: string
    role: string
    password: string
}) => api.post('/admin/users', data).then(r => r.data)

export const updateUser = (userId: string, data: object) =>
    api.put(`/admin/users/${userId}`, data).then(r => r.data)

// ─── Analytics ─────────────────────────────────────────────────────────────

export const fetchAnalytics = () =>
    api.get('/admin/analytics/overview').then(r => r.data)

// ─── Fines (Admin) ──────────────────────────────────────────────────────────

export const fetchFines = () =>
    api.get('/admin/fines').then(r => r.data)

export const markFinePaid = (fineId: number) =>
    api.put(`/admin/fines/${fineId}/pay`).then(r => r.data)

export const waiveFine = (fineId: number) =>
    api.put(`/admin/fines/${fineId}/waive`).then(r => r.data)

// For auto-accruing fines with no DB record — materializes then acts
export const markFineByIssuePaid = (issueId: number) =>
    api.put(`/admin/fines/by-issue/${issueId}/pay`).then(r => r.data)

export const waiveFineByIssue = (issueId: number) =>
    api.put(`/admin/fines/by-issue/${issueId}/waive`).then(r => r.data)

// ─── Admin Profile ───────────────────────────────────────────────────────────

export const fetchAdminProfile = () =>
    api.get('/admin/profile').then(r => r.data)

export const updateAdminProfile = (data: {
    name?: string
    email?: string
    phone?: string
    currentPassword?: string
    newPassword?: string
}) => api.put('/admin/profile', data).then(r => r.data)
