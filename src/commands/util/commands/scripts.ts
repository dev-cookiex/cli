import { Command } from '@cookiex/cli-types'
import fs from 'fs'

type Args = [ Parameters<Command.Function<any>>[1], Parameters<Command.Function<any>>[2] ]
type Cmd = ( ...args: Args ) => Command.FunctionReturn

const defaultScripts = {
  build: 'tsc',
  test: 'jest'
}

const utilScripts: Cmd = async ( ctx, options ) => {
  const packageString = fs.readFileSync( 'package.json' ).toString()
  const pkg = JSON.parse( packageString )
  pkg.scripts = { ... defaultScripts, ... ctx.extraGlobal?.scripts || {}, ... pkg.scripts || {} }
  fs.writeFileSync( 'package.json', JSON.stringify( pkg, null, 2 ) )
}

export default utilScripts
