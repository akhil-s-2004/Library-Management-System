import React, { useState, useEffect } from 'react'
import GenreCard from './GenreCard'
import { fetchGenres } from '../services/bookService'

type HorizontalGenreListProps = {
    title: string
    onGenreClick?: (genre: string | null) => void
    selectedGenre?: string | null
}

const HorizontalGenreList = ({ title, onGenreClick, selectedGenre }: HorizontalGenreListProps) => {
    const [genres, setGenres] = useState<{ id: number; name: string }[]>([])

    useEffect(() => {
        fetchGenres()
            .then(data => setGenres(data))
            .catch(err => console.error('Error fetching genres:', err))
    }, [])

    // Filter mode: render clickable pill buttons
    if (onGenreClick) {
        return (
            <div className='w-full'>
                <div className='flex gap-2 flex-wrap'>
                    <button
                        onClick={() => onGenreClick(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                            !selectedGenre
                                ? 'bg-[#570000] text-white border-[#570000]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#570000] hover:text-[#570000]'
                        }`}
                    >
                        All
                    </button>
                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => onGenreClick(genre.name === selectedGenre ? null : genre.name)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                                selectedGenre === genre.name
                                    ? 'bg-[#570000] text-white border-[#570000]'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#570000] hover:text-[#570000]'
                            }`}
                        >
                            {genre.name}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    // Default display mode: GenreCard scroll row (used on Dashboard etc.)
    return (
        <div className='w-full'>
            <h2 className='text-[#570000] text-2xl font-bold mb-4'>{title}</h2>
            <div className='flex gap-3 overflow-x-auto pb-2'>
                {genres.map((genre) => (
                    <GenreCard key={genre.id} genre={genre.name} />
                ))}
            </div>
        </div>
    )
}

export default HorizontalGenreList
