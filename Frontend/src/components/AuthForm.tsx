import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useNavigate } from 'react-router'
import { login, signUp } from '../services/authService'

type AuthFormProps = {
    variant: 'login' | 'signup'
}

const AuthForm = ({ variant }: AuthFormProps) => {
    const isSignUp = variant === 'signup'
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const navigate = useNavigate()

    // Form field state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [role, setRole] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Client-side validation for signup
        if (isSignUp && password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (isSignUp && !role) {
            setError('Please select a role.')
            return
        }

        setLoading(true)
        try {
            if (isSignUp) {
                await signUp(name, email, phone, role, password)
                navigate('/signin')
            } else {
                const data = await login(email, password)
                // Role-based redirect
                if (data.role === 'admin') {
                    navigate('/admin')
                } else {
                    navigate('/dashboard')
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full flex flex-col gap-6'>
            {/* Header */}
            <div className='flex flex-col gap-1'>
                <h2 className='text-3xl font-bold text-[#570000] tracking-tight'>
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className='text-gray-500 text-sm'>
                    {isSignUp
                        ? 'Sign up to start exploring BookZone'
                        : 'Sign in to continue to your library'}
                </p>
            </div>

            {/* Form */}
            <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                {/* Full Name */}
                {isSignUp && (
                    <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                        <User size={16} className='text-[#9b5555] flex-shrink-0' />
                        <input
                            type='text'
                            placeholder='Full Name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                        />
                    </div>
                )}

                {/* Email */}
                <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                    <Mail size={16} className='text-[#9b5555] flex-shrink-0' />
                    <input
                        type='email'
                        placeholder='Email Address'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                    />
                </div>

                {/* Phone */}
                {isSignUp && (
                    <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                        <Phone size={16} className='text-[#9b5555] flex-shrink-0' />
                        <input
                            type='tel'
                            placeholder='Phone Number'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                        />
                    </div>
                )}

                {/* Role */}
                {isSignUp && (
                    <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                        <User size={16} className='text-[#9b5555] flex-shrink-0' />
                        <select
                            className='flex-1 bg-transparent outline-none text-sm text-gray-700 cursor-pointer'
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value=''>Select Role</option>
                            <option value='member'>Member</option>
                            <option value='admin'>Admin</option>
                        </select>
                    </div>
                )}

                {/* Password */}
                <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                    <Lock size={16} className='text-[#9b5555] flex-shrink-0' />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                    />
                    <button
                        type='button'
                        onClick={() => setShowPassword((p) => !p)}
                        className='text-gray-400 hover:text-[#570000] transition-colors'
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {/* Confirm Password */}
                {isSignUp && (
                    <div className='flex items-center gap-3 bg-[#fdf5f5] border border-[#e8c8c8] rounded-xl px-4 py-3 focus-within:border-[#570000] transition-colors'>
                        <Lock size={16} className='text-[#9b5555] flex-shrink-0' />
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder='Confirm Password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className='flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                        />
                        <button
                            type='button'
                            onClick={() => setShowConfirm((p) => !p)}
                            className='text-gray-400 hover:text-[#570000] transition-colors'
                        >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                )}

                {/* Forgot Password */}
                {!isSignUp && (
                    <div className='flex justify-end'>
                        <button type='button' className='text-xs text-[#570000] hover:underline'>
                            Forgot password?
                        </button>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2'>
                        {error}
                    </p>
                )}

                {/* Submit */}
                <button
                    type='submit'
                    disabled={loading}
                    className='mt-1 w-full bg-[#570000] hover:bg-[#7a1c18] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    {loading
                        ? isSignUp ? 'Creating Account...' : 'Signing In...'
                        : isSignUp ? 'Create Account' : 'Sign In'
                    }
                </button>
            </form>

            {/* Switch */}
            <p className='text-center text-sm text-gray-500'>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                    className='text-[#570000] font-semibold hover:underline'
                    onClick={() => navigate(isSignUp ? '/signin' : '/signup')}
                >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
            </p>
        </div>
    )
}

export default AuthForm