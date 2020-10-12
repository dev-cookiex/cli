/* eslint-disable prefer-arrow/prefer-arrow-functions */
import fs from 'fs'
import path from 'path'

class CacheSystem {
  public static cachedir = path.resolve( __dirname, '..', '..', '.cache' )

  private static directoryPromise = fs.promises.stat( CacheSystem.cachedir )
    .catch( () => fs.promises.mkdir( CacheSystem.cachedir, { recursive: true } ) )

  private static instances: Record<string, Promise<CacheSystem>> = {}

  protected get fullpath() {
    return path.join( CacheSystem.cachedir, this.name )
  }

  protected data!: any

  protected promise: Promise<this>

  public static load( name: string ) {
    return CacheSystem.instances[name] = CacheSystem.instances[name] ?? new this( name ).ready()
  }

  constructor( protected name: string ) {
    this.promise =
    CacheSystem.directoryPromise
      .then( () => fs.promises.stat( this.fullpath ) )
      .catch( () => fs.promises.writeFile( this.fullpath, JSON.stringify( {} ) ) )
      .then( () => fs.promises.readFile( this.fullpath ) )
      .then( content => content.toString() )
      .then( json => this.data = JSON.parse( json ) )
      .then( () => this )
  }

  public ready() { return this.promise }

  public get( name: string ): any
  public get<T>( name: string ): any
  public get<T>( name: string, def: T ): T
  public get( name: string, def?: any ): any {
    if ( !this.data ) throw new Error( '' )
    return this.data[name] ?? def
  }

  public del( name: string ) {
    if ( !this.data ) throw new Error( '' )
    delete this.data[name]
    return this
  }

  public set( name: string, value: any ) {
    if ( !this.data ) throw new Error( '' )
    this.data[name] = value
    return this
  }

  public save() {
    return fs.promises.writeFile( this.fullpath, JSON.stringify( this.data ) )
  }
}

namespace CacheSystem {}

export = CacheSystem
