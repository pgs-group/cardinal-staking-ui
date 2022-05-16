import cn from 'classnames'
import { FiSearch } from 'react-icons/fi'
export default function GridFilters({ filters, updateFilters }) {
  return (
    <div className="mb-12 flex">
      <div className="divide-slate- inline-flex divide-x divide-slate-800 pr-6">
        <button
          onClick={() => updateFilters({})}
          className={cn(
            'rounded-l-lg bg-slate-700 py-4 px-4 text-base font-semibold text-gray-200 hover:bg-slate-800',
            {
              'bg-slate-800': !filters.type,
            }
          )}
        >
          All
        </button>
        <button
          onClick={() => updateFilters({ type: 'refundable' })}
          className={cn(
            'rounded-r-lg bg-slate-700 py-4 px-4 text-base font-semibold text-gray-200 hover:bg-slate-800',
            {
              'bg-slate-800': filters.type === 'refundable',
            }
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
