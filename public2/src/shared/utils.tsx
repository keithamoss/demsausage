export const isDev = () => process.env.NODE_ENV === 'development'

export const deduplicateArrayOfObjects = (array: object[], key: string) =>
  array.filter((item, index, self) => self.findIndex((t) => t[key] === item[key]) === index)
