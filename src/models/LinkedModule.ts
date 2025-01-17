/* eslint-disable @typescript-eslint/no-unused-vars */
import SleepingPromise from '@cookiex/sleeping-promise'

import path from 'path'

import exists from '../tools/exists'
import log from '../tools/log'
import CookiexModule from './Module'

class LinkedModule extends SleepingPromise<LinkedModule.Module> {
  private _ok = true

  public path: path.ParsedPath
  public folderName: string
  public packageJson: any

  protected packageJsonPath: string

  protected promise: Promise<void>

  public static from = ( ...paths: string[] ) => paths.map( path => new LinkedModule( path ) )
  public fullpath: string
  constructor( fullpath: string ) {
    super( resolve => {
      resolve( new LinkedModule.Module( require( this.fullpath ), require( this.packageJsonPath ) ) )
    } )
    this.fullpath = path.resolve( fullpath )
    this.path = path.parse( this.fullpath )
    if ( this.path.name !== 'cookiex' ) throw new Error( 'Incorrect module name' )
    this.folderName = path.parse( this.path.dir ).name
    this.packageJsonPath = path.join( this.path.dir, 'package.json' )
    this.promise = new Promise( async ( resolve, reject ) => {
      if ( !await exists( this.fullpath ) ) return reject( new Error( 'Cannot find cookiex module' ) )
      if ( !await exists( this.packageJsonPath ) ) return reject( new Error( 'Cannot find module' ) )
      this.packageJson = require( this.packageJsonPath )
      log.debug( 'Link cookiex module', this.packageJson.name )
      resolve()
    } )
    this.promise.catch( reason => {
      log.debug( reason )
      this._ok = false
    } )
  }

  public get module() { return this.then( module => module ) }

  public get ready() { return this.promise }

  public get ok() {
    return this.promise.then( () => true, () => false )
  }

  public get name() { return this.packageJson.name }

  public get version() { return this.packageJson.version }

  public get info() {
    return Promise.all( [
      this.name,
      this.version,
      this.fullpath
    ] ).then( ( [ name, version, fullpath ] ) => ( { name, version, fullpath } ) )
  }
}

namespace LinkedModule {
  export import Module = CookiexModule
}

export = LinkedModule
