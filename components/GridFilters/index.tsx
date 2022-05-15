import cn from 'classnames'
import { FiSearch } from 'react-icons/fi'
export default function GridFilters({ filters, updateFilter }) {
  return (
    <div className="mb-10 flex">
      <div className="divide-slate- inline-flex divide-x divide-slate-800 pr-3">
        <button
          onClick={() => updateFilter({})}
          className={cn(
            'font-semi-bold rounded-l-lg bg-slate-700 py-2 px-4 text-gray-200 hover:bg-slate-800',
            {
              'bg-slate-800': !filters.type,
            }
          )}
        >
          All
        </button>
        <button
          onClick={() => updateFilter({ type: 'refundable' })}
          className={cn(
            'font-semi-bold rounded-r-lg bg-slate-700 py-2 px-4 text-gray-200 hover:bg-slate-800',
            {
              'bg-slate-800': filters.type === 'refundable',
            }
          )}
        >
          Refundable
        </button>
      </div>
      {/* <div className="relative w-96 text-gray-600">
        <input
          type="search"
          name="search"
          placeholder="Search"
          className="h-12 w-full rounded-lg bg-slate-700 px-5 pl-10 text-sm text-white focus:bg-slate-800 focus:outline-none"
        />
        <button type="submit" className="absolute left-3 top-4 text-white">
          <FiSearch size="18" />
        </button>
      </div> */}
    </div>
  )
}
