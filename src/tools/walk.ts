import fs from 'fs'
import path from 'path'

const walk = ( current: string ): string[] => {
  if ( !fs.lstatSync( current ).isDirectory() ) return [ current ]

  const files = fs
    .readdirSync( current )
    .map( child => walk( path.join( current, child ) ) )
  return [ current ].concat( files as any )
}

export default walk
