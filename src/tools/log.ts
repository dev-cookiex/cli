import chalk from 'chalk'

const log = ( hex: string, text: string, ...texts: string[] ) => {
  console.log( `${chalk.bold.hex( hex )( text )}`, ...texts )
}

log.info = log.bind( null, '#346beb', 'info:' )

const debug = log.bind( null, '#9eff03', 'debug:' )

log.debug = Object.assign(
  ( ...tests: string[] ) => {
    if ( log.debug.enable ) debug( ...tests )
  },
  { enable: false }
)

log.warning = log.bind( null, '#f1f50f', 'warning:' )

log.danger = log.bind( null, '#f5540f', 'danger:' )

log.error = log.bind( null, '#ff030b', 'error:' )

export = log
