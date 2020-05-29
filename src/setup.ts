import { logger } from '@cookiex/cli-tools'
import { Config, Command } from '@cookiex/cli-types'
import commander from 'commander'
import deep from 'deepmerge'
import realfs from 'fs'
import gracefulFs from 'graceful-fs'

import { commands } from './commands'
import attachCommand from './tools/attachCommand'
import cacheManage from './tools/cacheManage'
import cosmicConfig from './tools/cosmicConfig'
import executeSetupShell from './tools/executeSetupShell'
import printUnknownCommand from './tools/printUnknownCommand'

const pkg = require( '../package.json' )

const createDetachedCommand = ( cmd: Command<boolean> ) => ( { ...cmd, detached: true } ) as Command<true>

const setup = () => {
  if ( setup.ready ) return commander

  commander
    .option( '--version', 'Print CLI version' )
    .option( '--verbose', 'Increase logging verbosity' )

  commander.version( pkg.version )

  commander.arguments( '<command>' ).action( cmd => printUnknownCommand( cmd, true ) )
  setup.ready = true
  gracefulFs.gracefulify( realfs )

  const globalLinks = cosmicConfig.requireAllModulesDeep<Config>( ...cacheManage.get<string[]>( 'links', [] ) )

  let config: Config

  let inCache = cacheManage.get<string[]>( process.cwd() )

  if ( inCache && Array.isArray( inCache ) )
    config = deep<Config>( cosmicConfig.requireAllModulesDeep( ...inCache ), globalLinks )

  else {
    config = deep( cosmicConfig<Config>( 'cookiex.config.js', { local: true } ), globalLinks )
    if ( cosmicConfig.getInfo( 'cookiex.config.js' ).matches.length )
      cacheManage.set( process.cwd(), cosmicConfig.getInfo( 'cookiex.config.js' ).matches )
  }

  if ( process.argv.includes( '--verbose' ) ) logger.config.enableVerbose()
  if ( process.platform !== 'win32' ) executeSetupShell()

  for ( let cmd of commands ) attachCommand( cmd, config )
  for ( let cmd of config?.commands || [] ) attachCommand<true>( createDetachedCommand( cmd ) )

  setup.ready = true
  return commander
}

setup.ready = false

export default setup
