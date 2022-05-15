export default function BasicBreadcrumb({ title }) {
  return (
    <div className="mb-8 pb-8 text-center">
      <h3 className="font-semi-bold mb-3 text-3xl text-white">{title}</h3>
      <a
        href="https://honey.land/"
        className="text-base text-cyan-500 hover:text-white"
      >
        Home{' '}
      </a>
      /
      <span className="text-base text-white hover:text-gray-200">
        {' '}
        {' ' + title}
      </span>
    </div>
  )
}
