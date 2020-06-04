import fs from 'fs'
import path from 'path'

import Recursive from '.'
import createInfo from './createInfo'

const BINARY_EXTENSIONS =
  [ '.png', '.jar', '.keystore', '.jpg', '.zip', '.gif', 'jpeg', '.bin', '.lock', '.apk', '.aab', '.aar' ]

const createEntries = (
  toDirScan: string,
  { ignorePatterns = [], ignorePatternsInMap = [] }: Recursive.Options,
  map?: Recursive.Map
): Recursive.Entries => {
  const entries = fs.readdirSync( toDirScan ).map<Recursive.Entry>( name => {
    if ( ignorePatterns.some( pattern => RegExp( pattern ).test( name ) ) ) return createInfo.nonCopy()

    const fullpath = path.join( toDirScan, name )
    const info = fs.statSync( fullpath )

    if ( info.isDirectory() ) {
      if ( typeof map === 'object' && map.dir )
        return createInfo.dir( name, createEntries( fullpath, { ignorePatterns, ignorePatternsInMap }, map ), map.dir )
    }

    const parsed = path.parse( fullpath )

    if ( BINARY_EXTENSIONS.includes( parsed.ext ) )
      if ( typeof map === 'object' ) return createInfo.buffer( parsed, map.buffer )
      else return createInfo.buffer( parsed )

    if ( ignorePatternsInMap.some( pattern => RegExp( pattern ).test( name ) ) ) return createInfo.file( parsed )

    if ( typeof map === 'function' ) return createInfo.file( parsed, map )
    else if ( map?.file ) return createInfo.file( parsed, map.file )

    return createInfo.file( parsed )
  } )
  return entries
}

export default createEntries
