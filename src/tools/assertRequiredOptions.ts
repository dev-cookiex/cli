import { Command } from '@cookiex/cli-types'
import commander from 'commander'
import humps from 'humps'

type PassedOptions = {
  [key: string]: unknown
}

const assertRequiredOptions = (
  options: Command.Option<any>[],
  passedOptions: PassedOptions
) => {
  options.forEach( opt => {
    const option = new commander.Option( opt.name )

    if ( !option.required ) return

    const name = humps.camelize( option['long'] )

    if ( typeof passedOptions[name] === 'undefined' ) throw new Error( `Option "${option['long']}" is missing` )
  } )
}

export default assertRequiredOptions
