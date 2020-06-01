import fs from 'fs'
import https from 'https'
import npmunload from 'npm'
import path from 'path'
import semver from 'semver'

import copy from '../../../helpers/copy'
import util from '../utils'

const npmpromise = new Promise<typeof npmunload>( ( resolve, reject ) => {
  npmunload.load( ( err ) => err ? reject( err ) : resolve( npmunload ) )
} )

const getPackageInfo = ( packageName: string ) =>
  new Promise<any>( ( resolve, reject ) => {
    if ( getPackageInfo.cache[packageName] )
      return resolve( getPackageInfo.cache[packageName] )

    https.request( {
      method: 'GET',
      host: 'registry.npmjs.org',
      path: `/${packageName}`,
      headers: { 'Content-Type': 'application/json' },
      agent: false,
    }, res => {
      if ( res.statusCode !== 200 )
        return reject( new Error( `failed to get registry.npmjs.org/${packageName} version(s).` ).message )

      let data = ''
  
      res.setEncoding( 'utf8' )
      res.on( 'data', chunk => data += chunk )
      res.on( 'error', err => reject( err ) )
      res.on( 'close', () => { resolve( console.log( 'request closed' ) ) } )
      res.on( 'end', () => {
        const object = JSON.parse( data )
        resolve( object )
      } )
    } )
      .on( 'error', err => reject( err ) )
      .end()
  } )

getPackageInfo.cache = {} as { [key: string]: string }

const _getVersionPackage = ( packageName: string, packageVersion?: string ) =>
  new Promise<any>( ( resolve, reject ) => {
    if ( _getVersionPackage.cachePackage[`${packageName}@${packageVersion}`] )
      return resolve( _getVersionPackage.cachePackage[`${packageName}@${packageVersion}`] )

    getPackageInfo( packageName ).then( info => {
      let version: string
      if ( !packageVersion ) return resolve( info['dist-tags'].latest )
      else {
        version = Object.entries<string>( info['dist-tags'] )
          .find( ( [ versionName ] ) => versionName === packageVersion )?.[1]
        
        if ( version ) return resolve( version )

        else if ( Object.keys( info.versions ).includes( packageVersion ) )

          return resolve( packageVersion )

        else resolve( packageVersion )

        // reject( new Error( `version of package ${packageName} does exits` ) )
      }

    } ).catch( reject )
  } )

export const getVersionPackage = ( packageName: string, packageVersion: string = '@latest' ) =>
  new Promise<string>( ( resolve, reject ) => {
    npmpromise.then( npm => {
      npm.commands.view( [ packageName, 'versions', 'dist-tags', '--json' ], true, ( err, arg ) => {
        if ( err ) reject( err )
        const info: {
          'versions': string[]
          'dist-tags': { [ key: string ]: string }
        } = Object.values<any>( arg ).shift()

        let settedVersion = packageVersion
        if ( settedVersion === '*' ) settedVersion = '@latest'

        if ( settedVersion?.startsWith( '@' ) ) {
          const tag = settedVersion.replace( /^@/, '' )
          if ( info['dist-tags'][tag] ) settedVersion = info['dist-tags'][tag]
          else return reject( new Error( `dist tag( ${tag} ) not exists in ${packageName}` ) )
        }

        const range = semver.validRange( settedVersion )

        const version = info.versions.reverse().find( version => semver.satisfies( version, range ) )

        if ( version ) return resolve( version )
        return reject( new Error( `version not found for ${ packageName } using ${ settedVersion || '*' }` ) )
      } )
    } )
  } )

_getVersionPackage.cachePackage = {} as { [key: string]: string }

const getTemplateJson = ( templateFolder: string ) => {
  try {
    return require( path.join( templateFolder, 'template' ) )
  } catch { return {} }
}

const getTemplatePackageJson = ( templateFolder: string ) => {
  try {
    return require( path.join( templateFolder, 'template', 'package.json' ) )
  } catch {
    return null
  }
}

const createMapedObject = <O extends Object>( object: O, objectName: string, allToString = true ) =>

  Object.entries( object ).reduce( ( maped, [ key, value ] ) => {

    switch ( typeof value ) {

      case 'bigint':
      case 'boolean':
      case 'number':
      case 'string':
      case 'symbol':
      case 'function':

        if ( allToString ) maped[`${objectName}.${key}`] = value.toString()
        else maped[`${objectName}.${key}`] = value

        return maped

      case 'object':

        const anotherMap = createMapedObject( value, key, allToString )

        Object.entries( anotherMap )
          .forEach( ( [ subKey, value ] ) => { maped[`${objectName}.${subKey}`] = value } )

      default: return maped
    }
  }, {} as { [key: string]: string } )

const createProjectFromTemplate = (
  templateFolder: string,
  output: string,
  name: ReturnType<typeof util.createCaseNames>
) => new Promise( async ( resolve, reject ) => {
  try {
    const templateJson = getTemplateJson( templateFolder )

    const packageJson = getTemplatePackageJson( templateFolder )

    const intoPackageDependencie = (
      key: string
    ) =>
      Object.entries<string>( packageJson[key] || {} )
        .map( ( [ name, version ] ) => new Promise( async ( resolve, reject ) => {
          try {
            const rversion = await getVersionPackage( name, version )
            packageJson[key][name] = `^${rversion}`
            resolve()
          } catch ( e ) { reject( e ) }
        } ) )

    try {
      await Promise.all(
        [ // eslint-disable-line
          ...intoPackageDependencie( 'dependencies' ), // eslint-disable-line
          ...intoPackageDependencie( 'devDependencies' ), // eslint-disable-line
          ...intoPackageDependencie( 'optionalDependencies' ), // eslint-disable-line
          ...intoPackageDependencie( 'peerDependencies' ) // eslint-disable-line
        ] // eslint-disable-line
      )
    } catch ( e ) { console.log( e ) }

    fs.writeFileSync( 'package.json', JSON.stringify( packageJson, null, 2 ) )

    const root = templateJson.root ? path.join( templateFolder, templateJson.root ) : templateFolder

    const placeHolders: { [key: string]: string } = templateJson.placeHolders || {}

    const poly = createMapedObject( name, 'name' )
  
    copy.Recursive( root, output, { ignorePatterns: [ '^node_modules$', '^\\.git$', '^package\\.json$' ] }, {
      file: ( file ) => copy.Replace.file( file, placeHolders, poly ),
      dir: ( dir ) => copy.Replace.dir( dir, placeHolders, poly ),
    } )

    resolve()
  } catch ( e ) { reject( e ) }
} )

export default createProjectFromTemplate
