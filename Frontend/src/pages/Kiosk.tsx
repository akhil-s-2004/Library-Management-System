import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import logoIcon from '../assets/logo.png'
import logoText from '../assets/logo_word.png'
import axios from 'axios'
import api from '../services/api' // using api for baseURL purposes but kiosk doesn't need auth header

// ─── Types ───────────────────────────────────────────────────────────────────
type KioskStep =
    | 'home'
    | 'borrow-auth'
    | 'borrow-scan'
    | 'borrow-confirm'
    | 'borrow-success'
    | 'return-scan'
    | 'return-confirm'
    | 'return-success'
    | 'return-error'

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Shared header shown on every kiosk screen */
const KioskHeader = ({ onBack, showBack }: { onBack?: () => void; showBack?: boolean }) => (
    <div className='w-full flex items-center justify-between px-4 sm:px-8 py-4 border-b border-[#e8d4d4] bg-white/60 backdrop-blur-sm'>
        {showBack ? (
            <button
                onClick={onBack}
                className='flex items-center gap-1.5 text-[#570000] text-sm font-semibold hover:opacity-70 transition-opacity'
            >
                <ArrowLeft size={16} /> Back
            </button>
        ) : (
            <div className='w-16' />
        )}
        <div className='flex items-center gap-2'>
            <img src={logoIcon} alt='BookZone' className='h-8' />
            <img src={logoText} alt='BookZone' className='h-5' />
        </div>
        <div className='w-16 text-right'>
            <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-widest'>Kiosk</span>
        </div>
    </div>
)

/** Real camera QR scanner using html5-qrcode */
const QRScanArea = ({ onScan }: { onScan: (id: string) => void }) => {
    const [manualId, setManualId] = useState('')
    const [cameraError, setCameraError] = useState('')
    const [scanning, setScanning] = useState(true)
    const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
    const scannedRef = useRef(false)

    useEffect(() => {
        let html5Qrcode: import('html5-qrcode').Html5Qrcode | null = null

        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode')
                html5Qrcode = new Html5Qrcode('qr-reader')
                scannerRef.current = html5Qrcode

                await html5Qrcode.start(
                    { facingMode: 'environment' }, // rear camera on phones, webcam on kiosk
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    (decodedText) => {
                        if (scannedRef.current) return
                        scannedRef.current = true
                        onScan(decodedText)
                    },
                    () => { /* ignore non-fatal scan errors */ }
                )
            } catch (err) {
                setCameraError('Camera access was denied or not available. Please type the Copy ID manually.')
                setScanning(false)
            }
        }

        startScanner()

        return () => {
            if (html5Qrcode && html5Qrcode.isScanning) {
                html5Qrcode.stop().catch(() => { })
            }
        }
    }, [onScan])

    const handleManual = (e: React.FormEvent) => {
        e.preventDefault()
        if (manualId.trim()) onScan(manualId.trim())
    }

    return (
        <div className='flex flex-col items-center gap-5 w-full max-w-xs mx-auto'>
            {/* Camera viewfinder */}
            {scanning && !cameraError && (
                <div className='relative w-full'>
                    {/* html5-qrcode mounts the <video> inside this div */}
                    <div
                        id='qr-reader'
                        className='w-full rounded-2xl overflow-hidden border-2 border-[#570000] shadow-lg'
                        style={{ minHeight: '260px' }}
                    />
                    {/* Brand overlay corners */}
                    <span className='absolute top-2 left-2  w-7 h-7 border-t-4 border-l-4 border-[#570000] rounded-tl-sm pointer-events-none' />
                    <span className='absolute top-2 right-2 w-7 h-7 border-t-4 border-r-4 border-[#570000] rounded-tr-sm pointer-events-none' />
                    <span className='absolute bottom-2 left-2  w-7 h-7 border-b-4 border-l-4 border-[#570000] rounded-bl-sm pointer-events-none' />
                    <span className='absolute bottom-2 right-2 w-7 h-7 border-b-4 border-r-4 border-[#570000] rounded-br-sm pointer-events-none' />
                </div>
            )}

            {cameraError && (
                <div className='w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium'>
                    ⚠️ {cameraError}
                </div>
            )}

            <p className='text-gray-500 text-xs text-center'>
                {scanning && !cameraError
                    ? 'Hold the QR code in front of the camera'
                    : 'Type the copy ID printed on the book'}
            </p>

            {/* Manual / wedge-scanner fallback */}
            <form onSubmit={handleManual} className='flex gap-2 w-full'>
                <input
                    type='text'
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder='Copy ID (e.g. 1)'
                    className='flex-1 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#570000] transition-colors'
                />
                <button
                    type='submit'
                    className='bg-[#570000] hover:bg-[#7a1c18] text-white text-sm font-semibold px-4 rounded-xl transition-colors shadow-md'
                >
                    Enter
                </button>
            </form>
        </div>
    )
}

// ─── Small helper ─────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }: { label: string; value?: string }) => (
    <div className='flex justify-between items-start gap-4'>
        <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0'>{label}</span>
        <span className='text-sm font-semibold text-gray-800 text-right'>{value ?? '—'}</span>
    </div>
)

// ─── Main Kiosk component ─────────────────────────────────────────────────────
const Kiosk = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState<KioskStep>('home')

    // Borrow auth state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPwd, setShowPwd] = useState(false)

    // Borrow process state
    const [borrowCopyId, setBorrowCopyId] = useState<number | null>(null)
    const [borrowSuccessMsg, setBorrowSuccessMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // Return process state
    const [returnSuccessMsg, setReturnSuccessMsg] = useState('')
    const [returnCopyId, setReturnCopyId] = useState<number | null>(null)

    // Confirm detail state
    const [borrowConfirmDetails, setBorrowConfirmDetails] = useState<Record<string, string> | null>(null)
    const [returnConfirmDetails, setReturnConfirmDetails] = useState<Record<string, string> | null>(null)

    const reset = () => {
        setStep('home')
        setEmail('')
        setPassword('')
        setErrorMsg('')
        setBorrowCopyId(null)
        setReturnCopyId(null)
        setBorrowConfirmDetails(null)
        setReturnConfirmDetails(null)
    }

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            setErrorMsg('Email and password required.')
            return
        }
        setErrorMsg('')
        setStep('borrow-scan')
    }

    // After scan: fetch book details and show confirmation screen
    const handleBorrowScan = async (id: string) => {
        const copyIdNum = parseInt(id, 10)
        if (isNaN(copyIdNum)) {
            setErrorMsg('Invalid QR code format. Copy ID must be a number.')
            return
        }

        setErrorMsg('')
        setLoading(true)

        try {
            const res = await axios.get(`${api.defaults.baseURL}/kiosk/copy/${copyIdNum}`)
            setBorrowCopyId(copyIdNum)
            setBorrowConfirmDetails(res.data)
            setStep('borrow-confirm')
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || err.message || 'Failed to fetch book details')
        } finally {
            setLoading(false)
        }
    }

    // Confirm: actually borrow the book
    const handleBorrowConfirm = async () => {
        if (borrowCopyId === null) return
        setLoading(true)
        try {
            const res = await axios.post(`${api.defaults.baseURL}/kiosk/borrow`, {
                email,
                password,
                copyId: borrowCopyId
            })
            setBorrowSuccessMsg(res.data)
            setStep('borrow-success')
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || err.message || 'Failed to borrow book')
            setStep('borrow-scan')
        } finally {
            setLoading(false)
        }
    }

    // After scan: fetch issue details and show confirmation screen
    const handleReturnScan = async (id: string) => {
        const copyIdNum = parseInt(id, 10)
        if (isNaN(copyIdNum)) {
            setErrorMsg('Invalid QR code format. Copy ID must be a number.')
            setStep('return-error')
            return
        }

        setErrorMsg('')
        setLoading(true)

        try {
            const res = await axios.get(`${api.defaults.baseURL}/kiosk/issue/${copyIdNum}`)
            setReturnCopyId(copyIdNum)
            setReturnConfirmDetails(res.data)
            setStep('return-confirm')
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || err.message || 'Failed to fetch issue details')
            setStep('return-error')
        } finally {
            setLoading(false)
        }
    }

    // Confirm: actually return the book
    const handleReturnConfirm = async () => {
        if (returnCopyId === null) return
        setLoading(true)
        try {
            const res = await axios.post(`${api.defaults.baseURL}/kiosk/return`, {
                copyId: returnCopyId
            })
            setReturnSuccessMsg(res.data)
            setStep('return-success')
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || err.message || 'Failed to return book')
            setStep('return-error')
        } finally {
            setLoading(false)
        }
    }

    // ── Shared wrapper ───────────────────────────────────────────────────────
    const Wrapper = ({ children, showBack = true, onBack = () => setStep('home') }: {
        children: React.ReactNode
        showBack?: boolean
        onBack?: () => void
    }) => (
        <div className='min-h-screen flex flex-col bg-[#FFF3F3]'>
            <KioskHeader showBack={showBack} onBack={onBack} />
            <div className='flex-1 flex items-center justify-center px-4 py-8'>
                <div className='w-full max-w-md'>
                    {children}
                </div>
            </div>
            {/* Idle hint */}
            <p className='text-center text-[11px] text-gray-300 pb-4'>
                Tap the BookZone logo to go home
            </p>
        </div>
    )

    // ── HOME ─────────────────────────────────────────────────────────────────
    if (step === 'home') return (
        <div className='min-h-screen flex flex-col bg-[#FFF3F3]'>
            <KioskHeader showBack={false} />
            <div className='flex-1 flex flex-col items-center justify-center px-6 gap-10'>
                <div className='text-center'>
                    <h1 className='text-3xl sm:text-4xl font-bold text-[#570000]'>Library Self-Service</h1>
                    <p className='text-gray-500 mt-2 text-sm sm:text-base'>Select an option to get started</p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl'>
                    <button
                        onClick={() => setStep('borrow-auth')}
                        className='group flex flex-col items-center justify-center gap-4 bg-white border-2 border-[#e8d4d4] rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl hover:border-[#570000] hover:bg-[#fdf5f5] transition-all duration-200 active:scale-[0.97]'
                    >
                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-[#f4e7e5] group-hover:bg-[#570000] rounded-2xl flex items-center justify-center transition-colors duration-200'>
                            <BookOpen size={32} className='text-[#570000] group-hover:text-white transition-colors duration-200' />
                        </div>
                        <div className='text-center'>
                            <p className='text-xl sm:text-2xl font-bold text-[#570000]'>Borrow Book</p>
                            <p className='text-xs sm:text-sm text-gray-400 mt-1'>Login and scan QR to borrow</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setStep('return-scan')}
                        className='group flex flex-col items-center justify-center gap-4 bg-white border-2 border-[#e8d4d4] rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl hover:border-[#570000] hover:bg-[#fdf5f5] transition-all duration-200 active:scale-[0.97]'
                    >
                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-[#f4e7e5] group-hover:bg-[#570000] rounded-2xl flex items-center justify-center transition-colors duration-200'>
                            <ArrowLeft size={32} className='text-[#570000] group-hover:text-white transition-colors duration-200' />
                        </div>
                        <div className='text-center'>
                            <p className='text-xl sm:text-2xl font-bold text-[#570000]'>Return Book</p>
                            <p className='text-xs sm:text-sm text-gray-400 mt-1'>Scan QR code to return</p>
                        </div>
                    </button>
                </div>

                <button onClick={() => navigate('/dashboard')} className='text-xs text-gray-300 hover:text-gray-400 transition-colors'>
                    Staff: Go to Dashboard →
                </button>
            </div>
        </div>
    )

    // ── BORROW — AUTH ─────────────────────────────────────────────────────────
    if (step === 'borrow-auth') return (
        <Wrapper onBack={reset}>
            <div className='flex flex-col gap-6'>
                <div>
                    <h2 className='text-2xl font-bold text-[#570000]'>Borrow Book</h2>
                    <p className='text-gray-500 text-sm mt-1'>Enter your member credentials to continue</p>
                </div>

                <form onSubmit={handleAuth} className='flex flex-col gap-4'>
                    {/* Member Email */}
                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-semibold text-gray-500'>Email</label>
                        <div className='flex items-center gap-3 bg-white border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors shadow-sm'>
                            <input
                                type='email'
                                placeholder='alex@example.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-semibold text-gray-500'>Password</label>
                        <div className='flex items-center gap-3 bg-white border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors shadow-sm'>
                            <input
                                type={showPwd ? 'text' : 'password'}
                                placeholder='Your password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                            />
                            <button type='button' onClick={() => setShowPwd((p) => !p)} className='text-gray-400 hover:text-[#570000] transition-colors'>
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <p className='text-red-500 text-xs font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2'>
                            {errorMsg}
                        </p>
                    )}

                    <button
                        type='submit'
                        disabled={!email || !password || loading}
                        className='mt-2 w-full bg-[#570000] hover:bg-[#7a1c18] disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-md transition-all active:scale-[0.98]'
                    >
                        {loading ? 'Verifying...' : 'Continue'}
                    </button>
                    <p className='text-center text-xs text-gray-400'>Enter your standard BookZone email and password.</p>
                </form>
            </div>
        </Wrapper>
    )

    // ── BORROW — SCAN ────────────────────────────────────────────────────────
    if (step === 'borrow-scan') return (
        <Wrapper onBack={() => setStep('borrow-auth')}>
            <div className='flex flex-col items-center gap-6'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-[#570000]'>Borrow Book</h2>
                    <p className='text-gray-500 text-sm mt-1'>Scan the QR code on the physical book you wish to borrow</p>
                </div>
                {errorMsg && (
                    <div className='w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 font-medium text-center'>
                        ⚠️ {errorMsg}
                    </div>
                )}
                {loading ? (
                    <div className='py-8 text-center text-gray-400 animate-pulse'>Fetching book details...</div>
                ) : (
                    <QRScanArea onScan={handleBorrowScan} />
                )}
            </div>
        </Wrapper>
    )

    // ── BORROW — CONFIRM ─────────────────────────────────────────────────────
    if (step === 'borrow-confirm') return (
        <Wrapper onBack={() => { setStep('borrow-scan'); setBorrowConfirmDetails(null) }}>
            <div className='flex flex-col gap-6'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-[#570000]'>Confirm Borrow</h2>
                    <p className='text-gray-500 text-sm mt-1'>Review the book details before borrowing</p>
                </div>
                {borrowConfirmDetails && (
                    <div className='bg-white border border-[#e8d4d4] rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-3'>
                        <DetailRow label='Title' value={borrowConfirmDetails.title} />
                        <DetailRow label='Author' value={borrowConfirmDetails.author} />
                        {borrowConfirmDetails.publisher && (
                            <DetailRow label='Publisher' value={borrowConfirmDetails.publisher} />
                        )}
                        {borrowConfirmDetails.isbn && (
                            <DetailRow label='ISBN' value={borrowConfirmDetails.isbn} />
                        )}
                    </div>
                )}
                {errorMsg && (
                    <p className='text-red-500 text-xs font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center'>
                        {errorMsg}
                    </p>
                )}
                <div className='flex gap-3 mt-2'>
                    <button
                        onClick={() => { setStep('borrow-scan'); setBorrowConfirmDetails(null) }}
                        className='flex-1 border border-[#d8bcbc] text-[#570000] font-semibold py-3 rounded-xl hover:bg-[#f4e7e5] transition-colors'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBorrowConfirm}
                        disabled={loading}
                        className='flex-1 bg-[#570000] hover:bg-[#7a1c18] disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-md transition-all'
                    >
                        {loading ? 'Borrowing...' : 'Confirm Borrow'}
                    </button>
                </div>
            </div>
        </Wrapper>
    )

    // ── BORROW — SUCCESS ─────────────────────────────────────────────────────
    if (step === 'borrow-success') return (
        <Wrapper showBack={false}>
            <div className='flex flex-col items-center gap-6 text-center'>
                <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center'>
                    <CheckCircle size={44} className='text-green-500' />
                </div>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>Book Borrowed!</h2>
                    <p className='text-gray-500 text-sm mt-2 font-medium bg-green-50 px-4 py-2 rounded-xl text-green-800 border border-green-200'>{borrowSuccessMsg}</p>
                </div>
                <div className='w-full bg-white border border-[#e8d4d4] rounded-2xl px-6 py-4 shadow-sm text-left'>
                    <p className='text-xs text-gray-400 mb-1'>Reference ID</p>
                    <p className='font-bold text-[#570000] mb-2'>Copy #{borrowCopyId}</p>
                    <p className='text-xs text-gray-500 leading-relaxed italic border-t border-[#f4e7e5] pt-3'>You can view full issue details in your <br /> "My Library -&gt; Borrowed Books" page online.</p>
                </div>
                <button onClick={reset} className='w-full bg-[#570000] hover:bg-[#7a1c18] text-white font-semibold py-3 rounded-xl shadow-md transition-all'>
                    Done — Go to Home
                </button>
            </div>
        </Wrapper>
    )

    // ── RETURN — SCAN ────────────────────────────────────────────────────────
    if (step === 'return-scan') return (
        <Wrapper onBack={reset}>
            <div className='flex flex-col items-center gap-6'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-[#570000]'>Return Book</h2>
                    <p className='text-gray-500 text-sm mt-1'>Scan the QR code on the physical book you wish to return</p>
                </div>
                {loading ? (
                    <div className='py-8 text-center text-gray-400 animate-pulse'>Fetching book details...</div>
                ) : (
                    <QRScanArea onScan={handleReturnScan} />
                )}
            </div>
        </Wrapper>
    )

    // ── RETURN — CONFIRM ─────────────────────────────────────────────────────
    if (step === 'return-confirm') return (
        <Wrapper onBack={() => { setStep('return-scan'); setReturnConfirmDetails(null) }}>
            <div className='flex flex-col gap-6'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-[#570000]'>Confirm Return</h2>
                    <p className='text-gray-500 text-sm mt-1'>Review the issue details before returning</p>
                </div>
                {returnConfirmDetails && (
                    <div className='bg-white border border-[#e8d4d4] rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-3'>
                        <DetailRow label='Title' value={returnConfirmDetails.title} />
                        <DetailRow label='Author' value={returnConfirmDetails.author} />
                        <DetailRow label='Borrowed By' value={returnConfirmDetails.borrowedBy} />
                        <DetailRow label='Borrow Date' value={returnConfirmDetails.borrowedDate} />
                        <DetailRow label='Due Date' value={returnConfirmDetails.dueDate} />
                    </div>
                )}
                {errorMsg && (
                    <p className='text-red-500 text-xs font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center'>
                        {errorMsg}
                    </p>
                )}
                <div className='flex gap-3 mt-2'>
                    <button
                        onClick={() => { setStep('return-scan'); setReturnConfirmDetails(null) }}
                        className='flex-1 border border-[#d8bcbc] text-[#570000] font-semibold py-3 rounded-xl hover:bg-[#f4e7e5] transition-colors'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReturnConfirm}
                        disabled={loading}
                        className='flex-1 bg-[#570000] hover:bg-[#7a1c18] disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-md transition-all'
                    >
                        {loading ? 'Returning...' : 'Confirm Return'}
                    </button>
                </div>
            </div>
        </Wrapper>
    )

    // ── RETURN — SUCCESS ─────────────────────────────────────────────────────
    if (step === 'return-success') return (
        <Wrapper showBack={false}>
            <div className='flex flex-col items-center gap-6 text-center'>
                <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center'>
                    <CheckCircle size={44} className='text-green-500' />
                </div>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>Book Returned!</h2>
                    <p className='text-gray-500 text-sm mt-2 font-medium bg-green-50 px-4 py-2 rounded-xl text-green-800 border border-green-200'>{returnSuccessMsg}</p>
                </div>
                <button onClick={reset} className='w-full bg-[#570000] hover:bg-[#7a1c18] text-white font-semibold py-3 rounded-xl shadow-md transition-all'>
                    Done — Go to Home
                </button>
            </div>
        </Wrapper>
    )

    // ── RETURN — ERROR ───────────────────────────────────────────────────────
    if (step === 'return-error') return (
        <Wrapper onBack={() => {
            setErrorMsg('')
            setStep('return-scan')
        }}>
            <div className='flex flex-col items-center gap-6 text-center'>
                <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center'>
                    <XCircle size={44} className='text-red-500' />
                </div>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>Cannot Return</h2>
                    <p className='text-gray-500 text-sm mt-2'>
                        {errorMsg ? errorMsg : 'This book is not currently issued to any account.'}
                    </p>
                </div>
                <div className='w-full bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-left'>
                    <p className='text-xs text-red-600 font-semibold'>If you believe this is an error, please contact a librarian.</p>
                </div>
                <div className='flex gap-3 w-full'>
                    <button onClick={() => {
                        setErrorMsg('')
                        setStep('return-scan')
                    }} className='flex-1 border border-[#d8bcbc] text-[#570000] font-semibold py-3 rounded-xl hover:bg-[#f4e7e5] transition-colors'>
                        Try Again
                    </button>
                    <button onClick={reset} className='flex-1 bg-[#570000] hover:bg-[#7a1c18] text-white font-semibold py-3 rounded-xl shadow-md transition-all'>
                        Go to Home
                    </button>
                </div>
            </div>
        </Wrapper>
    )

    return null
}

export default Kiosk

