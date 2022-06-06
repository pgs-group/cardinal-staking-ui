export const getStakedDaysAgo = (lastStakedAt: any) => {
  return Math.floor(
    (+new Date() - +new Date(lastStakedAt.toNumber() * 1000)) / 86400000
  )
}
