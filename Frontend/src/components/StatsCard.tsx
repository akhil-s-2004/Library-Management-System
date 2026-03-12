type Stat = { label: string; value: number | string }
type StatsCardProps = { stats: Stat[] }

const StatsCard = (props: StatsCardProps) => {
  return (
    <div className='w-full border-2 border-[#7a1c18] shadow-lg bg-white rounded-3xl py-4 px-4 sm:px-6 flex flex-wrap sm:flex-nowrap'>
      {props.stats.map((stat, index) => (
        <div
          key={index}
          className='flex flex-col items-center flex-1 min-w-[80px] border-r border-gray-300 last:border-none py-1'
        >
          <span className='text-[#570000] font-bold text-base sm:text-lg'>{stat.value}</span>
          <span className='text-xs sm:text-sm text-gray-600 text-center'>{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

export default StatsCard