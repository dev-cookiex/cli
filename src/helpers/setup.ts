import commander from 'commander'

import CacheSystem from '../models/CacheSystem'
import LinkedModule from '../models/LinkedModule'
import arrayFilterPromise from '../tools/arrayFilterPromise'
import exists from '../tools/exists'
import search from '../tools/search'

const setup = ( program: commander.CommanderStatic ) =>
  setup.packages()
    .then( linkedModules => arrayFilterPromise( linkedModules, linkedModule => linkedModule.ok ) )
    .then( linkedModules => Promise.all( linkedModules ) )
    .then( modules => {
      modules.forEach( module => {
        module.commands.forEach( command => program.addCommand( command ) )
      } )
    } )

setup.packages = () =>
  Promise.all( [
    linkedPackages(),
    pwdPackages(),
    localPackage(),
  ] )
    .then( ( modules ) => modules.flat( 1 ) )

const linkedPackages = () =>
  CacheSystem.load( 'linked-packages' )
    .then( system => system.get<string[]>( 'packages', [] ) )
    .then( paths => LinkedModule.from( ...paths ) )
    .then( linkedModules => arrayFilterPromise( linkedModules, linkedModule => linkedModule.ok ) )
    .then( linkedModules => {
      CacheSystem.load( 'linked-packages' )
        .then( system => {
          Promise.all( linkedModules.map( linkedModule => linkedModule.info ) )
            .then( infos => system.set( 'packages', infos ).save() )
        } )

      return linkedModules
    } )

const pwdPackages = () =>
  search.inModules( /cookiex?\.js(on)?$/ )
    .then( modules => LinkedModule.from( ...modules ) )

const localPackage = () =>
  exists( 'cookiex.js' )
    .then( exists => exists ? [ new LinkedModule( 'cookiex.js' ) ] : [] )

export = setup
