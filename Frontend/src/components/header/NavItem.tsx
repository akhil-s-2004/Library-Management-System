import Dropdown from "./DropDown"
import { useState, useRef, useEffect, type ReactNode } from "react"

type NavItemProps = {
  label: ReactNode
  items?: {
    label: string
    onClick?: () => void
  }[]
  align?: 'left' | 'right'
}

export default function NavItem({ label, items, align = 'left' }: NavItemProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative flex items-center">

      <button
        className="text-[#6b1b17] font-semibold hover:opacity-70"
        onClick={() => setOpen(prev => !prev)}
      >
        {label}
      </button>

      {open && items && <Dropdown items={items} align={align} />}

    </div>
  )
}