import cn from 'classnames'
import { FiSearch } from 'react-icons/fi'
export default function GridFilters({ filters, updateFilters }) {
  return (
    <div className="mb-12 flex px-10 lg:px-5 xl:px-0">
      <div className="divide-slate- inline-flex divide-x divide-slate-800 pr-6">
        <button
          onClick={() => updateFilters({ ...filters, type: '' })}
          className={cn(
            !filters.type ? 'bg-slate-800' : 'bg-slate-700',
            'rounded-l-lg py-4 px-4 text-base font-semibold text-gray-200 hover:bg-slate-800'
          )}
        >
          All
        </button>
        <button
          onClick={() => updateFilters({ ...filters, type: 'refundable' })}
          className={cn(
            filters.type === 'refundable' ? 'bg-slate-800' : 'bg-slate-700',
            'rounded-r-lg py-4 px-4 text-base font-semibold text-gray-200 hover:bg-slate-800'
          )}
        >
          Refundable
        </button>
      </div>
      <div className="relative w-96 text-gray-600">
        <input
          type="search"
          name="search"
          placeholder="Search"
          className="h-16 w-full rounded-lg bg-slate-700 px-5 pl-12 text-base text-white focus:bg-slate-800 focus:outline-none"
          onChange={(event) =>
            updateFilters({ ...filters, search: event.target.value })
          }
        />
        <button className="absolute left-3 top-5 cursor-none text-white">
          <FiSearch size="22" />
        </button>
      </div>
    </div>
  )
}
