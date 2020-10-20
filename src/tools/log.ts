import chalk from 'chalk'

const log = ( hex: string, text: string, ...texts: string[] ) => {
  process.stdout.clearLine( 0 )
  process.stdout.cursorTo( 0 )
  console.log( `${chalk.bold.hex( hex )( text )}`, ...texts )
}

log.info = log.bind( null, '#346beb', 'info:' )

const debug = log.bind( null, '#9eff03', 'debug:' )

log.stack = ( error: Error ) => {
  if ( !error.stack ) return void 0
  const [ msg, ...ats ] = error.stack.split( '\n' )
  log( '#c0c0c0', 'message:', msg )
  ats.forEach( at => {
    const string = at.replace( /^.*at /, '' )
    if ( string.startsWith( '/' ) ) {
      const match = string.match( /^(?<path>.*):(?<line>[0-9]*):(?<column>[0-9]*)$/ )
      if ( !match || !match.groups )
        log( '#c0c0c0', 'at:', string )
      else log( '#c0c0c0', 'at:', `${
        chalk.underline.cyan( match.groups.path )
      }:${
        chalk.underline.cyanBright( `${
          match.groups.line
        }:${
          match.groups.column
        }` )
      }` )
    }
    else log( '#c0c0c0', 'in:', at.replace( /^.*at /, '' ) )
  } )
}

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
