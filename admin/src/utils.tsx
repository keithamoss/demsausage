// Modified from https://stackoverflow.com/a/8817473
export const deepValue = (obj: object, searchPath: string, defaultIfNotSet: any = null) => {
  const path = searchPath.split('.')
  for (let i = 0, len = path.length; i < len; i += 1) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    if (obj[path[i]] === null) {
      return defaultIfNotSet
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    if (obj[path[i]] === undefined) {
      return defaultIfNotSet
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    // eslint-disable-next-line no-param-reassign
    obj = obj[path[i]]
  }
  return obj
}
