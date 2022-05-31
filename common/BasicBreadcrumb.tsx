export default function BasicBreadcrumb({ title }) {
  return (
    <div className="mb-8 pb-8 text-center">
      <h2 className="mb-5 text-5xl font-bold text-white">{title}</h2>
      <a
        href="https://ultimatemetaclub.com/"
        className="text-xl text-[#8393AF] hover:text-white"
      >
        Home{' '}
      </a>
      /
      <span className="text-xl text-white hover:text-gray-200">
        {' '}
        {' ' + title}
      </span>
    </div>
  )
}
