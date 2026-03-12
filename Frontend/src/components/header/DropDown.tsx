type DropdownItem = {
  label: string
  onClick?: () => void
}

type DropdownProps = {
  items: DropdownItem[]
  align?: 'left' | 'right'
}

export default function Dropdown({ items, align = 'left' }: DropdownProps) {
  return (
    <div className={`absolute top-full mt-2 w-[180px] bg-[#f3e6e6] border border-[#d8bcbc] rounded-md shadow-md ${align === 'right' ? 'right-0' : 'left-0'}`}>

      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className="w-full text-left px-4 py-1 hover:bg-[#ead4d4] text-[#6b1b17] font-light text-sm" 
        >
          {item.label}
        </button>
      ))}

    </div>
  )
}