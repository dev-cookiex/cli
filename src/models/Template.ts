import Emitter from '@cookiex/emitter'

import fs from 'fs'
import path from 'path'

import clone from '../tools/clone'
import log from '../tools/log'

class Template extends Emitter<Template.Events> {
  protected path: string
  protected placeholders: { [key: string]: string } = {}
  protected replacers: { [key: string]: string } = {}
  protected data: any
  protected root: string
  protected running: Promise<void>
  protected raising!: Promise<void>

  constructor( public directory: string ) {
    super()
    this.root = this.directory
    this.path = path.join( this.directory, 'template.json' )
    this.running = fs.promises.stat( this.path )
      .then( () => {
        this.data = require( this.path )

        if ( this.data.root )
          this.root = path.join( this.directory, this.data.root )

        if ( this.data.placeholders )
          this.placeholders = Object.assign( this.placeholders, this.data.placeholders )
      } )
      .then( () => this.emit( 'ready', this ) )
      .catch( reason => this.emit( 'error', reason ) )
  }

  public replacer = ( match: string, value: string ) => {
    this.replacers[match] = value
    return this
  }

  private parsePlaceholder = () => {
    const keys = Object.keys( this.replacers )

    const replaceReducer = ( string: string, key: string ) =>
      string.replace( RegExp( key, 'g' ), this.replacers[key] )

    return Object.fromEntries(
      Object.entries( this.placeholders )
        .map( ( [ match, replace ] ) => [ match, keys.reduce( replaceReducer, replace ) ] )
    )
  }

  public raise = ( output: string ) => {
    return this.raising = this.running
      .then( () => {
        const placeholder = this.parsePlaceholder()
        const keys = Object.keys( placeholder )
        const cloner = clone( this.root, output )
        log.debug( '-----------------TRANSFER TEMPLATE OPEN-----------------' )

        cloner.on( 'file', file => {
          const content = keys.reduce(
            ( string, key ) => string.replace( RegExp( key, 'g' ), placeholder[key] ),
            file.content
          )

          const filename = keys.reduce(
            ( string, key ) => string.replace( RegExp( key, 'g' ), placeholder[key] ),
            file.filename
          )

          const target = path.join( file.targetParsed.dir, filename )

          return { ...file, content, filename, target }
        } )

        cloner.on( 'directory', directory => {
          const filename = keys.reduce( ( string, key ) =>
            string.replace( RegExp( key, 'g' ), placeholder[key] ), directory.filename )

          const target = path.join( directory.targetParsed.dir, filename )

          return { ...directory, filename, target }
        } )

        cloner.on( 'file', file => {
          const from = path.relative( this.directory, file.fullpath )
          const to = path.relative( path.resolve(), file.target )
          log.debug( `cloning file ${from} to ${to}` )
        } )

        cloner.on( 'directory', directory => {
          const from = path.relative( this.directory, directory.fullpath )
          const to = path.relative( path.resolve(), directory.target )
          log.debug( `cloning directory ${from} to ${to}` )
        } )

        cloner.on( 'done', () => log.debug( 'cloning done' ) )

        cloner.on( 'done', () => {
          log.debug( '-----------------TRANSFER TEMPLATE CLOSE-----------------' )
        } )

        cloner.all( ( ( event: any, data: any ) => {
          if ( !data ) log.debug( `path: ${event} done` )
        } ) as any )

        return cloner
      } )
  }
}

namespace Template {
  export interface Events {
    ready( template: Template ): void
    error( error: Error ): void
  }
}

export = Template
