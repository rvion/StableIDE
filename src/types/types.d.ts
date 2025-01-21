/** usefull to catch most *units* type errors */

declare type Tagged<O, Tag> = O & { __tag?: Tag }
declare type Branded<O, Brand extends { [key: string]: true }> = O & Brand
declare type Maybe<T> = T | null | undefined
declare type Timestamp = Tagged<number, 'Timestamp'>

/**
 * @deprecated
 * switch to use `FPath` class instead
 * */
declare type RelativePath = Branded<string, { RelativePath: true }>

/**
 * @deprecated
 * switch to use `FPath` class instead
 * */
declare type AbsolutePath = Branded<string, { AbsolutePath: true }>

// prettier-ignore
declare type ConvertibleImageFormat =
    | 'image/png'
    | 'image/jpeg'
    | 'image/webp'
    | 'raw'

declare type ImageSaveFormat = {
   format: ConvertibleImageFormat
   prefix?: string
   quality?: number
}

// --------------
// because `{}` is something else entirely
declare type EmptyObject = Record<string, never>

// because react types are more complex by default
// let's live in a simplified world
declare type SimpleFC<P> = (props: P) => React.JSX.Element
// declare type ProplessFC = () => React.JSX.Element | null
