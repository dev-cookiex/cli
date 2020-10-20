import Emitter from '@cookiex/emitter'

import fs from 'fs'
import { camelizeKeys } from 'humps'
import path from 'path'

import clone from '../tools/clone'
import command from '../tools/command'
import log from '../tools/log'

class Template extends Emitter<Template.Events> {
  protected path: string
  protected placeholders: { [key: string]: string } = {}
  protected replacers: { [key: string]: string } = {}
  protected data: any
  protected root: string
  protected running: Promise<void>
  protected raising!: Promise<void>
  protected output!: string

  public static dependenciesFields = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
    'bundleDependencies' 
  ]

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

  public getCommitMessage = () => {
    return this.data.commitMessage || 'init project'
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

  public updatePackageJson = () => {
    if ( !this.raising ) throw new Error( '' )
    return this.raising
      .then( () => {
        if ( !this.data.updates ) return void 0
        log.debug( '------TEMPLATE PACKAGE JSON UPDATE DEPENDENCIES VERSIONS------' )
        const pkg = require( path.join( this.output, 'package.json' ) )
        const keys = Object.keys( this.data.updates )
        const regexps = keys.map( key => RegExp( key ) )
        const find = ( name: string ) => {
          const index = regexps.findIndex( key => key.test( name ) )
          if ( index < 0 ) return null
          return this.data.updates[keys[index]]
        }
        const promises = Template.dependenciesFields.map( field => new Promise( ( resolve, reject ) => {
          if ( !pkg[field] ) return resolve()
          const entriesPromises = Object.entries( pkg[field] ).map(
            ( [ name, version ] ) => new Promise<[string, any]>( ( resolve, reject ) => {
              const tag = find( name )
              if ( tag ) {
                command( [ 'npm', 'view', name, 'dist-tags' ], { json: true } )
                  .then( stdout => JSON.parse( stdout ) )
                  .then( info => camelizeKeys( info ) as any )
                  .then( info => {
                    if ( !info.distTags[tag] ) {
                      log.error(
                        `not find tag ${tag} in ${name} info, please notification template maintainers`,
                        `possibles tags ( ${Object.keys( info.distTags ).join( ' | ' )} )`
                      )
                      return [ name, version ]
                    }
                    log.debug( `update: ${name} ${version} -> ^${info.distTags[tag]}` )
                    return [ name, `^${info.distTags[tag]}` ]
                  } )
                  .catch( reject )
              }
              else resolve( [ name, version ] )
            } )
          )
          return Promise.all( entriesPromises )
            .then( entries => {
              if ( pkg[field] )
                pkg[field] = Object.fromEntries( entries )
              return Object.fromEntries( entries )
            } )
            .then( resolve )
            .catch( reject )
        } ) )
        return Promise.all( promises )
          .then( () => {
            log.debug( '------TEMPLATE PACKAGE JSON UPDATE DEPENDENCIES VERSIONS------' )
          } )
      } )
  }

  public raise = ( output: string ) => {
    this.output = output
    return this.raising = this.raising ?? this.running
      .then( () => {
        const placeholder = this.parsePlaceholder()
        const keys = Object.keys( placeholder )
        const cloner = clone( this.root, output )
        const exclude: string[] = []
        const excludeRegExp = ( this.data.exclude ?? [] )
          .map( ( key: string ) => RegExp( key ) ) as RegExp[]

        const excludeTest = ( ...args: string[] ) =>
          excludeRegExp.some(
            regexp => args.some(
              string => regexp.test( string )
            )
          )

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

          if ( excludeTest( file.filename, filename ) )

            exclude.push( target )

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
          .then( () => exclude.map( path => fs.promises.unlink( path ) ) )
          .then( promises => Promise.all( promises ) )
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
