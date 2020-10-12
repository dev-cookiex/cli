import commander from 'commander'
import path from 'path'

import CacheSystem from '../models/CacheSystem'
import exists from '../tools/exists'
import log from '../tools/log'
import search from '../tools/search'

const setup = ( program: commander.CommanderStatic ) =>
  setup.packages()
    .then( modules => {
      modules.forEach( module => {
        if ( module.commands )
          module.commands.forEach( ( command: commander.Command ) => program.addCommand( command ) )

        if ( module.command )
          program.addCommand( module.command )

      } )
    } )

setup.packages = () =>
  Promise.all( [
    setup.linkedPackages(),
    setup.pwdPackages(),
    setup.localPackage(),
  ] )
    .then( ( modules ) => modules.flat( 1 ) )

setup.linkedPackages = () =>
  CacheSystem.load( 'linked-packages' )
    .then( system => system.get<string[]>( 'packages', [] ) )
    .then(
      packages => packages.map(
        pkg => import( pkg )
          .then( module => ( { module, __packagePath: pkg } ) )
          .catch( reason => {
            log.warning( `${pkg} not exists. remove from packages` )
            log.error( reason.message )
            log.debug( reason.message )
            return { __packagePath: pkg, module: null }
          } )
      )
    )
    .then( modules => Promise.all( modules ) )
    .then( modules => modules.filter( ( { module } ) => !!module ) )
    .then( modules =>
      CacheSystem.load( 'linked-packages' )
        .then( system => system.set( 'packages', modules.map( ( { __packagePath } ) => __packagePath ) ) )
        .then( system => system.save() )
        .then( () => modules ) )
    .then( modules => modules.map( ( { module } ) => module  ) )

setup.pwdPackages = () =>
  search.inModules( 'cookiex.js' )
    .then( modules => modules.map( module => import( module ) ) )
    .then( promises => Promise.all( promises ) )
    .then( modules => modules.map( module => module.default ?? module ) )

setup.localPackage = () =>
  exists( 'cookiex.js' )
    .then( exists => exists ? import( path.resolve( 'cookiex.js' ) ) : null )
    .then( module => module && ( module.default ?? module ) )
    .then( module => module ? [ module ] : [] )

export = setup
