// Modified from https://stackoverflow.com/a/8817473
export const deepValue = function(obj: object, searchPath: string, defaultIfNotSet: any = null) {
    const path = searchPath.split(".")
    for (let i = 0, len = path.length; i < len; i++) {
        if (obj[path[i]] === null) {
            return defaultIfNotSet
        }
        if (obj[path[i]] === undefined) {
            return defaultIfNotSet
        }
        obj = obj[path[i]]
    }
    return obj
}
