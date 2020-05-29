import fs from 'fs-extra'
import path from 'path'

const rootCookieCliDir = path.join( __dirname, '..', '..' )
const cookieCliCacheFile = path.join( rootCookieCliDir, '.cookie' )

let cacheLoaded: { [ key: string ]: any }

const isSetFunction = <T>( value: any ): value is ( ( value?: T ) => T ) => typeof value === 'function'

interface Get {
  <T>( name: string ): T | undefined
  <T>( name: string, def: T ): T
}

interface Set {
  <T = any>( name: string, value: T | ( ( value?: T ) => T ) ): void
}

interface Remove {
  ( key: string ): void
}
interface CacheManage {
  get: Get
  set: Set
  remove: Remove
}

const cacheManage: CacheManage = {
  get: <T, D = undefined>( name: string, def?: D ): T | D => {

    if ( cacheLoaded ) return cacheLoaded[name] || def

    if ( !fs.existsSync( cookieCliCacheFile ) ) {
      fs.writeFileSync( cookieCliCacheFile, '{}' )
      cacheLoaded = {}
      return def as D
    }

    else {
      const cookieCliCacheContent = fs.readFileSync( cookieCliCacheFile ).toString()
      cacheLoaded = JSON.parse( cookieCliCacheContent )
      return cacheLoaded[name] || def
    }
  },
  set: <T = any>( name: string, value: T | ( ( value?: T ) => T ) ) => {

    if ( cacheLoaded )

      if ( isSetFunction<T>( value ) ) cacheLoaded[name] = value( cacheManage.get( name ) )

      else cacheLoaded[name] = value

    else {

      if ( !fs.existsSync( cookieCliCacheFile ) )

        if ( isSetFunction<T>( value ) ) cacheLoaded = { [name]: value( cacheManage.get( name ) ) }
        else cacheLoaded = { [name]: value }
  
      else {

        const cookieCliCacheContent = fs.readFileSync( cookieCliCacheFile ).toString()
        cacheLoaded = JSON.parse( cookieCliCacheContent )

        if ( isSetFunction<T>( value ) ) cacheLoaded[name] = value( cacheManage.get( name ) )
        else cacheLoaded[name] = value

      }
    }

    fs.writeFileSync( cookieCliCacheFile, JSON.stringify( cacheLoaded ) )

  },
  remove: ( key: string ) => cacheManage.set( key, undefined )
}

export default cacheManage
