const arrayFilterPromise = (
  (
    array: any[],
    filter: ( value: any, index: number, array: any[] ) => boolean | Promise<boolean>,
    thisArg?: any
  ) => Promise.all( array.map( filter, thisArg ) )
    .then( booleans => array.filter( ( n, i ) => booleans[i] ) )
) as {
  <T extends Array<any>>(
    array: T,
    predicate: ( value: T extends ( infer A )[] ? A : never, index: number, array: T[] ) => boolean | Promise<boolean>,
    thisArg?: any
  ): Promise<T>
}

export default arrayFilterPromise
