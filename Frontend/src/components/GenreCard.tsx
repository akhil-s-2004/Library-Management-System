import React from 'react'
import { useNavigate } from 'react-router'

type GenreCardProps = {
    genre: string
    onClick?: () => void
}
const GenreCard = (props: GenreCardProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    props.onClick?.()
    navigate(`/genres?genre=${encodeURIComponent(props.genre)}`)
  }

  return (
    <div
      className='flex-shrink-0 border-2 border-[#7a1c18] bg-white rounded-4xl py-2 px-5 flex items-center justify-center cursor-pointer hover:bg-[#f3e6e6] transition-colors'
      onClick={handleClick}
    >
      <span className='text-[#570000] text-md font-medium whitespace-nowrap'>{props.genre}</span>
    </div>
  )
}

export default GenreCard