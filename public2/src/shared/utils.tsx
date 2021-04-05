export const isDev = (): boolean => process.env.NODE_ENV === 'development'

export const deduplicateArrayOfObjects = (array: Record<string, unknown>[], key: string): Record<string, unknown>[] =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  array.filter((item, index, self) => self.findIndex((t) => t[key] === item[key]) === index)
