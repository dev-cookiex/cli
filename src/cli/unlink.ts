import commander from 'commander'

import CacheSystem from '../models/CacheSystem'

const unlink = new commander.Command( 'unlink' )

unlink.arguments( '<package>' )

unlink.action( async ( pkg: string ) => {
  const cache = await CacheSystem.load( 'linked-packages' )
  const packages = cache.get<string[]>( 'packages', [] )
  cache.set( 'packages', packages.filter( spkg => spkg !== pkg ) )
  await cache.save()
} )

export = unlink
