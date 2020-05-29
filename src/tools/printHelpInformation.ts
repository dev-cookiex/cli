import { Command } from '@cookiex/cli-types'
import chalk from 'chalk'
import commander from 'commander'

const printHelpInformation = (
  cmd: commander.Command,
  examples: Command['examples'],
  pkg: Command['pkg']
) => {
  const name: string = cmd._alias ? cmd._name : `${cmd._name}|${cmd._alias}`
  const argsList = printHelpInformation.createArgsList( cmd._args )
  const sourceInformation = printHelpInformation.createSourceInformation( pkg )
  const output = printHelpInformation.createOutput( name, argsList, sourceInformation, cmd, examples )
  return output.join( '\n' ).concat( '\n' )
}

printHelpInformation.createArgsList = ( args: ( { required: boolean; name: string } )[] ) =>
  args.map( arg => arg.required ? `<${arg.name}>` : `[${arg.name}]` ).join( ' ' )

printHelpInformation.createSourceInformation = ( pkg: Command['pkg'] ) =>
  pkg ? [ `${chalk.bold( 'Source:' )} ${pkg.name}@${pkg.version}`, '' ] : []

printHelpInformation.createOutput = ( name: string, argsList: string, sourceInformation: string[], cmd: commander.Command, examples: Command['examples'] ) => {
  const output = [
    chalk.bold( `cookie ${name} ${argsList}` ),
    cmd._description ? `\n${cmd._description}\n` : '',
    ...sourceInformation,
    `${chalk.bold( 'Options:' )}`,
    cmd.optionHelp().replace( /^/gm, '  ' ),
  ]

  if ( examples && examples.length > 0 )
    output.push( chalk.bold( '\nExample usage:' ), examples.map( example => `  ${example.desc}: \n  ${chalk.cyan( example.cmd )}` ).join( '\n\n' ) )
  return output
}

export default printHelpInformation
