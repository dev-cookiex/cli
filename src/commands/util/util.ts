import { Command, Config } from '@cookiex/cli-types'

import utilScripts from './commands/scripts'

const searchAnotherUtil = ( cmd: string, ctx: Config, options: any ) => {
  if ( !ctx.extraGlobal?.fallCommandUtil && ctx.extraGlobal?.fallCommandUtil[cmd] ) throw new Error( 'util not found' )

  return ctx.extraGlobal?.fallCommandUtil[cmd]( options )
}

const switchUtilCommands = ( cmd: string, ctx: Config, options: any ) => {
  switch ( cmd ) {
    case 'scripts': return utilScripts( ctx, options )
    default: return searchAnotherUtil( cmd, ctx, options )
  }
}

const printAllUtilities = ( ctx: Config ) => {}

const util: Command.Function<any> = ( [ command ], ctx, options ) =>
  command ? switchUtilCommands( command, ctx, options ) : printAllUtilities( ctx )

export default util
