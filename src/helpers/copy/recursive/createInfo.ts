import fs from 'fs'
import path from 'path'

import Recursive from '.'

const createFileInfo = ( pathParsed: path.ParsedPath, map?: Recursive.MapFile ): Recursive.FileInfo => {
  const content = fs.readFileSync( path.join( pathParsed.dir, pathParsed.base ) ).toString()
  if ( map ) return map( { ...pathParsed, content } )
  return { ...pathParsed, content }
}

const createDirInfo = ( dirname: string, entries: Recursive.Entries, mapDir?: Recursive.MapDir ): Recursive.DirInfo => {
  const dirInfo = { dirname, entries }
  if ( mapDir ) return mapDir( dirInfo )
  return dirInfo
}

const createBufferInfo = ( pathParsed: path.ParsedPath, mapBuffer?: Recursive.MapBuffer ): Recursive.BufferInfo => ( {
  name: pathParsed.base,
  copy: output => {

    const src = path.join( pathParsed.dir, pathParsed.base )
    const dest = path.join( output, pathParsed.base )

    if ( !mapBuffer ) fs.copyFileSync( src, dest )
    else { fs.writeFileSync( dest, mapBuffer( fs.readFileSync( src ) ) ) }
    
  }
} )

const createNonCopy = (): Recursive.NonCopy => ( { non: true } )

const createInfo = {
  file: createFileInfo,
  dir: createDirInfo,
  buffer: createBufferInfo,
  nonCopy: createNonCopy
}

export = createInfo
