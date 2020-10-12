import fs from 'fs'
import path from 'path'

import exists from './exists'

type Term = string | RegExp | ( string | RegExp )[]

type File = {
  filename: string
  fullpath: string
  stat: fs.Stats
}

type Continue = ( file: File, index: number ) => boolean

const searchWithContinueCheckerAndIndex = async (
  checker: ( filename: string ) => boolean,
  directory: string,
  callback: Continue,
  index: number
): Promise<string[]> =>
  exists( directory )
    .then( exists => exists ? fs.promises.readdir( directory ) : [] )
    .then( files => files.map( async filename => {
      const fullpath = path.join( directory, filename )
      return fs.promises.stat( fullpath )
        .then( stat => ( { filename, fullpath, stat } ) )
    } ) )
    .then( promises => Promise.all( promises ) )
    .then( files => files.map( async file => {

      if ( file.stat.isDirectory() && callback( file, index ) )

        return searchWithContinueCheckerAndIndex( checker, file.fullpath, callback, index + 1 )

      else if ( file.stat.isFile() && checker( file.filename ) )

        return file.fullpath

      else return null

    } ) )
    .then( promises => Promise.all( promises ) )
    .then( matches => matches.flat() )
    .then( matches => matches.filter( Boolean ) as string[] )

const search = async ( term: Term, directory: string, callback: Continue ) => {

  const checker: ( file: string ) => boolean =
    typeof term === 'string'
      ? ( file ) => term === file
      : Array.isArray( term )
        ? ( file ) => term.some( check => 
          typeof check === 'string'
            ? check === file
            : check.test( file )
        )
        : ( file ) => term.test( file )

  return searchWithContinueCheckerAndIndex( checker, directory, callback, 0 )
}

search.inModules = ( term: Term, path = 'node_modules' ) =>
  search( term, path, defaultNodeModulesContinueCallback )

const defaultNodeModulesContinueCallback = ( file: File, index: number ) => {
  if ( index < 1 ) return true
  const directory = path.parse( file.fullpath )
  const parent = path.parse( directory.dir )
  return parent.base.startsWith( '@' )
}

export = search
