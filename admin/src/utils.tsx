// Modified from https://stackoverflow.com/a/8817473
export const deepValue = function(obj: object, searchPath: string) {
    const path = searchPath.split(".")
    for (let i = 0, len = path.length; i < len; i++) {
        if (obj[path[i]] === null) {
            return null
        }
        if (obj[path[i]] === undefined) {
            return undefined
        }
        obj = obj[path[i]]
    }
    return obj
}
