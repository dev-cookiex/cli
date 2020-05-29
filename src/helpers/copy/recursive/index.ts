import { ParsedPath } from 'path'

import copyFromEntries from './copyFromEntries'
import createEntries from './createEntries'

namespace Recursive {
  type Patterns = string | RegExp
  export interface FileInfo extends ParsedPath { content: string }

  export interface DirInfo { dirname: string, entries: Entry[] }

  export interface BufferInfo { name: string, copy: ( output: string ) => void }

  export interface NonCopy { non: true }

  export type Entry = FileInfo | DirInfo | BufferInfo | NonCopy
  export type Entries = Entry[]

  export type Options = {
    ignorePatterns?: Patterns[]
    ignorePatternsInMap?: Patterns[]
  }

  export type MapFile = ( fileInfo: FileInfo ) => FileInfo
  export type MapDir = ( dirInfo: DirInfo ) => DirInfo
  export type MapBuffer = ( buffer: Buffer ) => Buffer

  export type Map = MapFile | { file?: MapFile, dir?: MapDir, buffer?: MapBuffer }
}

const isRecursiveOptions = ( option: any ): option is Recursive.Options => { // eslint-disable-line
  const checkIgnorePatterns =
    'ignorePatterns' in option
      &&
    (
      Array.isArray( option.ignorePatterns )
        ||
      option.ignorePatterns === undefined
    )

  const checkIgnorePatternsInMap =
    'ignorePatternsInMap' in option
      &&
    (
      Array.isArray( option.ignorePatternsInMap )
        ||
      option.ignorePatternsInMap === undefined
    )
  
  return [ checkIgnorePatterns, checkIgnorePatternsInMap ].every( Boolean )
}

const Recursive: {
  ( from: string, to: string ): void
  ( from: string, to: string, map?: Recursive.Map ): void
  ( from: string, to: string, options: Recursive.Options, map?: Recursive.Map ): void
} = (
  from: string,
  to: string,
  optionsOrMap?: Recursive.Map | Recursive.Options,
  map?: Recursive.Map
) => { // eslint-disable-line
  let entries: Recursive.Entries

  if ( map ) entries = createEntries( from, optionsOrMap as Recursive.Options, map )

  else entries = createEntries( from, {}, optionsOrMap as Recursive.Map )

  copyFromEntries( to, entries )
}

export default Recursive
