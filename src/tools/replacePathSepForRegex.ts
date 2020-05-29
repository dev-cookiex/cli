import path from 'path'

const regexp = /(\/|(.)?\\(?![[\]{}()*+?.^$|\\]))/g
const replace = ( _match: string, _: any, p2: any ) => p2 && p2 !== '\\' ? p2 + '\\\\' : '\\\\'

const replacePathSepForRegex = ( string: string ) =>
  path.sep === '\\' ? string.replace( regexp, replace ) : string

export default replacePathSepForRegex
