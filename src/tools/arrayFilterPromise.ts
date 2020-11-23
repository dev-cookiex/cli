const arrayFilterPromise = async <T>(
  array: T[],
  filter: ( value: T, index: number, array: T[] ) => boolean | Promise<boolean>,
  thisArg?: any
) => Promise.all( array.map( filter, thisArg ) )
  .then( booleans => array.filter( ( n, i ) => booleans[i] ) )  

export default arrayFilterPromise
