import commander from 'commander'
import path from 'path'

import CacheSystem from '../models/CacheSystem'
import command from '../tools/command'
import exists from '../tools/exists'

const link = new commander.Command( 'link' )

link.arguments( '<package>' )

link.action( async ( pkg: string ) => {
  const cache = await CacheSystem.load( 'linked-packages' )
  const packages = cache.get<string[]>( 'packages', [] )

  let directory: string

  if ( !await exists( path.resolve( pkg, 'cookiex.js' ) ) ) {
    const yarnGlobalDir = await command( [ 'yarn', 'global', 'dir' ] )
    const dir = path.join( yarnGlobalDir, 'node_modules', pkg, 'cookiex.js' )

    if ( await exists( dir ) ) directory = dir

    else throw new Error( `module ${pkg} not exists` )
    
  } else directory = path.resolve( pkg, 'cookiex.js' )

  await cache.set( 'packages', packages.concat( directory ) ).save()
} )

export = link
