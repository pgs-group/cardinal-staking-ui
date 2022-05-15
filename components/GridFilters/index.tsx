import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
export default function GridFilters() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-4">
      <div className="relative w-56 text-gray-600">
        <input
          type="search"
          name="serch"
          placeholder="Search"
          className="h-10 rounded-lg bg-gray-700 focus:bg-gray-800 px-5 pr-10 text-base text-white focus:outline-none w-full"
        />
        <button type="submit" className="absolute right-3 top-2 text-white">
          <FiSearch size="22" />
        </button>
      </div>
    </div>
  )
}
