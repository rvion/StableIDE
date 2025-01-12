/** type safe alternative to Object.entries */
export const getEntries = <X extends Record<any, any>>(
   x: X,
): X extends Record<infer Key, infer Value> ? [Key, Value][] : never => Object.entries(x) as any

/** type safe alternative to Object.keys */
export const objectKeys = <X extends Record<any, any>>(x: X): (keyof X)[] => Object.keys(x) as any

/** tired of forgetting it's name x) */
export const objectEntries = <X extends object>(x: X): [keyof X, X[keyof X]][] => Object.entries(x) as any
