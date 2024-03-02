export function createId(arr: any[]) {
  if (arr && arr.length === 0) return 1
  const a = arr.map((item) => {
    return item.id
  })
  const b = Math.max(...a)
  return b + 1
}
