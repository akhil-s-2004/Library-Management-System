import logoIcon from '../assets/logo.png'
import logoText from '../assets/logo_word.png'
import illustration from '../assets/illustration.png'
import AuthForm from '../components/AuthForm'

const SignIn = () => {
  return (
    <div className='w-screen h-screen flex overflow-hidden'>
      {/* Left – Branded Panel */}
      <div
        className='hidden lg:flex flex-col items-center justify-center gap-8 w-[45%] flex-shrink-0 relative overflow-hidden'
        style={{
          background: 'linear-gradient(160deg, #7a1c18 0%, #570000 45%, #3a0000 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className='absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10'
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className='absolute -bottom-32 -right-24 w-96 h-96 rounded-full opacity-10'
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className='flex flex-col items-center gap-3 z-10'>
          <img src={logoIcon} alt='BookZone Logo' className='w-20 drop-shadow-lg brightness-0 invert  ' />
          <img src={logoText} alt='BookZone' className='w-48 drop-shadow-md brightness-0 invert' />
        </div>

        {/* Illustration */}
        <img
          src={illustration}
          alt='Library Illustration'
          className='w-[360px] z-10 drop-shadow-2xl'
        />

        {/* Tagline */}
        <div className='z-10 flex flex-col items-center gap-1 px-10 text-center'>
          <p className='text-white text-xl font-semibold leading-snug'>
            Your personal library, anywhere.
          </p>
          <p className='text-[#f2c8c8] text-sm'>
            Discover, borrow and track your reads.
          </p>
        </div>
      </div>

      {/* Right – Form Panel */}
      <div className='flex-1 flex items-center justify-center bg-[#FFF3F3] px-8'>
        <div className='w-full max-w-[420px]'>
          {/* Mobile logo */}
          <div className='lg:hidden flex items-center gap-3 mb-8'>
            <img src={logoIcon} alt='BookZone' className='w-10' />
            <img src={logoText} alt='BookZone' className='w-32' />
          </div>
          <AuthForm variant='login' />
        </div>
      </div>
    </div>
  )
}

export default SignIn