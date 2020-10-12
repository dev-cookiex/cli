#!/usr/bin/env node
import commander from 'commander'

import info from '../cli/info'
import init from '../cli/init'
import link from '../cli/link'
import setup from '../helpers/setup'
import log from '../tools/log'

const pkg = require( '../../package.json' )

commander.name( 'cookiex' )

commander.version( pkg.version )

commander.version( pkg.description )

commander.option( '--debug', 'set debug mode', false )

commander.on( 'option:debug', () => log.debug.enable = commander.debug )

commander.addCommand( init )

commander.addCommand( link )

commander.addCommand( info )

setup( commander )
  .then( () => commander.parse( process.argv ) )
