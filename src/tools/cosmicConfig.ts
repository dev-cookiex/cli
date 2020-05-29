import { execSync } from 'child_process'
import deep from 'deepmerge'
import fs from 'fs-extra'
import path from 'path'


const getNpmGlobalNodeModulesDir = () => {
  if ( getNpmGlobalNodeModulesDir.path ) return getNpmGlobalNodeModulesDir.path
  try {
    const npmGlobalDir = execSync( 'npm root -g' ).toString().trim()
    const existsNodeModulesGlobalNpm = fs.existsSync( path.resolve( npmGlobalDir ) )
    if ( existsNodeModulesGlobalNpm ) return getNpmGlobalNodeModulesDir.path = npmGlobalDir
  } catch {}
  return undefined
}; getNpmGlobalNodeModulesDir.path = ''

const getYarnGlobalNodeModulesDir = () => {
  if ( getYarnGlobalNodeModulesDir.path ) return getYarnGlobalNodeModulesDir.path
  try {
    const yarnGlobalDir = execSync( 'yarn global dir' ).toString().trim()
    const existsNodeModulesGlobalYarn = fs.existsSync( path.join( yarnGlobalDir, 'node_modules' ) )
    if ( existsNodeModulesGlobalYarn ) return getYarnGlobalNodeModulesDir.path = path.join( yarnGlobalDir, 'node_modules' )
  } catch {}
  return undefined
}; getYarnGlobalNodeModulesDir.path = ''

const getLocalNodeModulesDir = () => {
  if ( getLocalNodeModulesDir.path ) return getLocalNodeModulesDir.path
  if ( fs.existsSync( 'node_modules' ) ) return path.resolve( 'node_modules' )
  return undefined
}; getLocalNodeModulesDir.path = ''

const scan = ( ...paths: string[] ) => {
  const fullpath = path.join( ...paths )
  if ( fs.existsSync( fullpath ) ) return fs.readdirSync( fullpath )
  return []
}

const existsFile = ( ...filepath: string[] ) => fs.existsSync( path.join( ...filepath ) )

interface CosmicInfo {
  directories: string[]
  scannedDirectories: string[]
  scannedModulesNames: string[]
  matches: string[]
  deepedMatches: any
}
const cosmicInfo: { [filename: string]: CosmicInfo } = {}

interface Options {
  npm?: boolean
  yarn?: boolean
  local?: boolean
}

const safeCosmicInfoCreate = ( filename: string ) => {
  if ( !cosmicInfo[filename] )
    cosmicInfo[filename] = { deepedMatches: {}, directories: [], matches: [], scannedDirectories: [], scannedModulesNames: [] }
}

const addDirectory = ( filename: string, directory?: string ) => {
  if ( directory && !cosmicInfo[filename].directories.includes( directory ) )
    cosmicInfo[filename].directories.push( directory )
}

const searchFileIn = ( dir: string, moduleName: string, filename: string ) => {
  if ( cosmicInfo[filename].scannedModulesNames.includes( moduleName ) ) return false
  return existsFile( dir, moduleName, filename )
}

const scanAndSearch = ( dir: string, filename: string ) =>
  scan( dir ).map( moduleName => {
    if ( moduleName.startsWith( '@' ) )
      return scan( dir, moduleName ).map( subModuleName => {

        const realModuleName = `${moduleName}/${subModuleName}`

        if ( searchFileIn( dir, realModuleName, filename ) )
          return path.join( dir, realModuleName, filename )

        return false

      } )

    else if ( searchFileIn( dir, moduleName, filename ) )

      return path.join( dir, moduleName, filename )

    return false
  } ).flat<string | boolean>( 1 ).filter( Boolean ) as string[]

const searchToMatches = ( filename: string ) => {
  cosmicInfo[filename].matches = cosmicInfo[filename].directories.map( dir => scanAndSearch( dir, filename ) ).flat<string>( 1 )
}

const deepAllMatches = ( filename: string ) =>
  cosmicInfo[filename].deepedMatches = cosmicConfig.requireAllModulesDeep( ...cosmicInfo[filename].matches )

const defineDirectories = ( filename: string, options: Options )  => {
  if ( options.local ) addDirectory( filename, getLocalNodeModulesDir() )
  if ( options.yarn ) addDirectory( filename, getYarnGlobalNodeModulesDir() )
  if ( options.npm ) addDirectory( filename, getNpmGlobalNodeModulesDir() ) 
}
const cosmicConfig = <T>( filename: string, options: Options = {} ): T => {
  if ( cosmicInfo[filename] ) return cosmicInfo[filename].deepedMatches

  safeCosmicInfoCreate( filename )
  defineDirectories( filename, options )
  searchToMatches( filename )
  return deepAllMatches( filename )
}

cosmicConfig.searchModuleDir = ( moduleName: string, options: Options & { fileName?: string, noErrors?: boolean } = {} ) => {
  const dirs: ( string | undefined )[] = []
  if ( options.local ) dirs.push( getLocalNodeModulesDir() )
  if ( options.yarn ) dirs.push( getYarnGlobalNodeModulesDir() )
  if ( options.npm ) dirs.push( getNpmGlobalNodeModulesDir() )

  const filtredDirs = dirs.filter<string>( Boolean as any )

  if ( !filtredDirs.length )
    if ( !options.noErrors ) throw new Error( 'No Dir to Search' )
    else return null

  let fullPathModule: string | null = null

  for ( let dir of filtredDirs ) {
    const dirsInDir = fs.existsSync( dir ) ? fs.readdirSync( dir ) : []
    if ( dirsInDir.includes( moduleName ) ) {
      fullPathModule = path.join( dir, moduleName )
      break
    }
  }

  if ( !fullPathModule )
    if ( !options.noErrors ) throw new Error( `Not find ${moduleName}` )
    else return null

  if ( options.fileName )
    if ( fs.existsSync( path.join( fullPathModule, options.fileName ) ) ) return path.join( moduleName, options.fileName )
    else if ( !options.noErrors ) throw new Error( `No find ${options.fileName} in ${moduleName}` )
    else return null

  return fullPathModule
}

cosmicConfig.requireAllModulesDeep = <T>( ...modulesDirs: string[] ): T => modulesDirs.reduce( ( group, current ) => deep( group, require( current ) ), {} as T )

cosmicConfig.getInfo = ( filename: string ) => {
  safeCosmicInfoCreate( filename )
  return cosmicInfo[filename]
}

export default cosmicConfig
