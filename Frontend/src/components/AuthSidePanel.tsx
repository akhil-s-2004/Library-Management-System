import React from 'react'
import { useNavigate } from 'react-router'

type AuthSidePanelProps = {
    variant: 'login' | 'signup';
}
const AuthSidePanel = ({ variant }: AuthSidePanelProps) => {
  const navigate = useNavigate();
  const isSignup = variant === 'signup';
  return (
    <div className='absolute right-[-70px] top-0 h-full w-[70px] 
                    bg-gradient-to-b from-[#f2d8d4] via-[#b54040] to-[#6b1010]
                    rounded-tr-3xl rounded-br-3xl flex items-center justify-center cursor-pointer'
         onClick={() => navigate(isSignup ? "/signin" : "/signup")}
    >
        <span className="rotate-90 whitespace-nowrap text-white text-sm font-semibold tracking-wider"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {isSignup ? "Already a user? Login" : "New user? Sign Up"}
        </span>
    </div>
  )
}

export default AuthSidePanel