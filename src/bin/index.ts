#!/usr/bin/env node
import commander from 'commander'

import info from '../cli/info'
import init from '../cli/init'
import link from '../cli/link'
import unlink from '../cli/unlink'
import setup from '../helpers/setup'
import LinkedModule from '../models/LinkedModule'
import log from '../tools/log'

const pkg = require( '../../package.json' )

commander.name( 'cookiex' )

commander.version( pkg.version )

commander.description( pkg.description )

commander.option( '--debug', 'set debug mode', false )

commander.option<LinkedModule[]>(
  '-l, --load <path>',
  'Load Module',
  ( value, previous ) => previous.concat( new LinkedModule( value ) ),
  []
)

commander.on( 'option:debug', () => log.debug.enable = commander.debug )

commander.addCommand( init )

commander.addCommand( link )

commander.addCommand( unlink )

commander.addCommand( info )

const args = commander.parseOptions( process.argv ).operands

setup( commander )
  .then( () => commander.parse( args ) )
  .catch( reason => {
    log.error( reason )
    log.stack( reason )
  } )
