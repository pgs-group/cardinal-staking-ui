import cn from 'classnames'
import { FiSearch } from 'react-icons/fi'
export default function GridFilters({ filters, updateFilters }) {
  return (
    <div className="card-wrapper-filters">
      <div className="filters-switch-button">
        <button
          onClick={() => updateFilters({ ...filters, type: '' })}
          className={cn(!filters.type ? 'active' : '')}
        >
          ALL
        </button>
        <button
          onClick={() => updateFilters({ ...filters, type: 'refundable' })}
          className={cn(filters.type === 'refundable' ? 'active' : '')}
        >
          REFUNDABLES
        </button>
      </div>
      <div className="filters-text-search">
        <input
          type="search"
          name="search"
          placeholder="SEARCH..."
          onChange={(event) =>
            updateFilters({ ...filters, search: event.target.value })
          }
        />
        <button>
          <FiSearch size="22" />
        </button>
      </div>
    </div>
  )
}
