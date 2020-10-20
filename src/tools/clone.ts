import Emitter from '@cookiex/emitter'
import control from '@cookiex/emitter/dist/controls/control'

import fs from 'fs'
import path from 'path'

const isFile = ( file: clone.Common ): file is clone.File =>
  file.stat.isFile() && !clone.unfollowFileExtension.includes( file.parsed.ext )

type ClonePromise = Promise<void> & Emitter<clone.Events>

const clone = ( from: string, to: string, remitter?: Emitter<clone.Events> ): ClonePromise => {
  const emitter = remitter ?? new Emitter<clone.Events>()
  const promise = fs.promises.mkdir( to, { recursive: true } )
    .then( () => fs.promises.readdir( from ) )
    .then( files => {
      return files.map( async filename => {
        const fullpath = path.join( from, filename )
        const target = path.join( to, filename )
        const targetParsed = path.parse( target )
        const parsed = path.parse( fullpath )
        const file = { fullpath, filename, parsed, target, targetParsed }
        return fs.promises.stat( fullpath )
          .then( stat => ( { stat, ...file } ) )
      } )
    } )
    .then( promises => Promise.all( promises ) as Promise<clone.Common[]> )
    .then( files => files.filter( file => {
      if ( file.stat.isDirectory() )
        return !clone.unfollowDirectories.includes( file.filename )
      return true
    } ) )
    .then( files => files.map( file => {
      if ( file.stat.isFile() && !clone.unfollowFileExtension.includes( file.parsed.ext ) )
        return fs.promises.readFile( file.fullpath )
          .then( content => content.toString() )
          .then( content => {
            const controller = control( emitter, 'file', Object.assign( file, { content } ) )

            return controller( emission => {
              if ( emission.result ) emission.next( emission.result )
              else emission.next( ...emission.args )
              return emission.result || emission.args[0]
            } ) as clone.File
          } )

      else if ( file.stat.isDirectory() ) {
        const controller = control( emitter, 'directory', file )

        controller.default( file )

        return controller( emission => {
          if ( emission.result === null ) return emission.exit()
          if ( emission.result ) emission.next( emission.result )
          else emission.next( ...emission.args )
          return emission.result || emission.args[0]
        } )
      }

      return file
    } ) )
    .then( files => Promise.all( files ) as Promise<( clone.File | clone.Directory )[]> )
    .then( files => files.map( file => {
      if ( file.stat.isDirectory() )
        return fs.promises.mkdir( file.target, { recursive: true } )
          .then( () => new Promise( ( resolve, reject ) => {
            clone( file.fullpath, file.target, emitter ).then( resolve, reject )
          } ) )

      else if ( isFile( file ) )
        return fs.promises.writeFile( file.target, file.content )

      else
        return fs.promises.copyFile( file.fullpath, file.target )
    } ) )
    .then( promises => Promise.all( promises ) )
    .then( () => emitter.emit( `${from}` ) )
    .catch( reason => {
      emitter.emit( 'error', reason )
      return Promise.reject( reason )
    } )

  if ( !remitter )
    promise.then( () => emitter.emit( 'done' ) )

  return Object.assign( promise, emitter )
}

clone.unfollowFileExtension = [ '.pdf', '.tar', '.zip', '.rar', '.apk', '.ipa' ]

clone.unfollowDirectories = [ 'node_modules', '.git' ]

namespace clone {
  export interface Common {
    stat: fs.Stats
    fullpath: string
    filename: string
    parsed: path.ParsedPath
    target: string
    targetParsed: path.ParsedPath
  }
  export interface File extends Common {
    content: string
  }
  export interface Directory extends Common {}
  export interface DeclarateEvents {
    file( file: File ): void | File
    directory( directory: Directory ): void | Directory
    unfollow( file: Common ): void | Common
    error( reason: any ): void
    done(): void
  }
  export type Events = DeclarateEvents & { [key: string]: () => void } & DeclarateEvents
}

export = clone
