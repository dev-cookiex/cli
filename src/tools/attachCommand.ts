import { Command, Config } from '@cookiex/cli-types'
import commander from 'commander'

import assertRequiredOptions from './assertRequiredOptions'
import handlerError from './handlerError'
import isDetachedCommand from './isDetachedCommand'
import printHelpInformation from './printHelpInformation'

const attachCommand = <IsDetached extends boolean>(
  command: Command<IsDetached>,
  ...rest: IsDetached extends false ? [Config] : []
) => {
  const options = command.options || []
  const cmd = commander.command( command.name )
    .action( async function( this: commander.Command, ...args: string[] ) {
      const passedOptions = this.opts()
      const argv = Array.from( args ).slice( 0, -1 )

      try {

        assertRequiredOptions( options, passedOptions )
        if ( isDetachedCommand( command ) ) await command.func( argv, passedOptions )
        else await command.func( argv, rest[0] as Config, passedOptions )

      } catch( error ) { handlerError( error ) }
    } )

  if ( command.alias ) cmd.alias( command.alias )
  if ( command.description ) cmd.description( command.description )

  cmd.helpInformation = printHelpInformation.bind( undefined, cmd, command.examples, command.pkg )

  if ( !isDetachedCommand( command ) && command.customize ) command.customize( cmd, rest[0] as Config )

  for ( const opt of command.options || [] ) {
    const args = [ opt.name, opt.description ] as Parameters<typeof cmd.option>
    if ( opt.parse ) args.push( opt.parse )
    args.push( typeof opt['default'] === 'function' ? opt['default']( rest[0] as Config ) : opt['default'] )
    cmd.option( ...args )
  }
}

export default attachCommand
