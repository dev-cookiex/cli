import { exec, ChildProcess, ExecOptions } from 'child_process'
import { decamelizeKeys } from 'humps'

import log from './log'

class ChildProcessPromise implements PromiseLike<string> {
  constructor( cmd: string, options: ExecOptions = {} ) {
    const promise = new Promise<string>( ( resolve, reject ) => {
      const child = exec( cmd, options, ( err, stdout, stderr ) => {
        if ( err ) return reject( Object.assign( err, { stdout, stderr } ) )
        return resolve( stdout )
      } )
      Object.assign( this, child )
    } )
    this.then = promise.then.bind( promise )
  }

  public then: Promise<string>['then']
}

interface ChildProcessPromise extends PromiseLike<string>, ChildProcess {}

type command = {
  ( cmd: string | string[] ): ChildProcessPromise
  ( cmd: string | string[], options: command.Options ): ChildProcessPromise
  ( cmd: string | string[], cwd: string ): ChildProcessPromise
  ( cmd: string | string[], cwd: string, options: command.Options ): ChildProcessPromise
  // ( cmd: string, execOptions: ExecOptions, options: { [key: string]: string | number | boolean } ): Promise<string>
}

const command: command = (
  cmd: string | string[],
  cwdOrOptions?: command.Options | string,
  optionalOptions?: command.Options
) => {
  const fullcmd = typeof cmd === 'string' ? cmd : cmd.join( ' ' )
  const cwd = typeof cwdOrOptions === 'string' ? cwdOrOptions : undefined
  const options = typeof optionalOptions === 'object'
    ? optionalOptions
    : typeof cwdOrOptions === 'object' && !( cwdOrOptions instanceof String )
      ? cwdOrOptions
      : {}
  const flags = Object.entries( decamelizeKeys( options, { separator: '-' } ) )
    .reduce( ( options, [ flag, value ] ) => {
      switch ( typeof value ) {
        case 'string':
        case 'number':
        case 'bigint':
          if ( flag.length === 1 )
            return options.concat( `-${flag} '${value}'` )

          return options.concat( `--${flag} '${value}'` )
        case 'boolean':
          if ( value )
            if ( flag.length === 1 )
              return options.concat( `-${flag}` )

            else return options.concat( `--${flag}` )

          return options
        case 'undefined':
          return options

        default: throw new Error( `not supported non primitive type in cli flags, fix ${flag} option` )
      }
    }, [] as string[] )

  const command = `${fullcmd} ${flags.join( ' ' )}`

  log.debug( `cmd: "${command}"` )

  return new ChildProcessPromise( command, { cwd } )
}

namespace command {
  export type Options = {
    [k: string]: string | number | boolean
  }
}

export = command
