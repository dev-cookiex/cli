import { exec } from 'child_process'

const yarn = ( command: string, cwd?: string ) =>
  new Promise<string>( ( resolve, reject ) => {
    exec( `yarn ${command}`, { cwd }, ( err, stdout ) => {
      if ( err ) return reject( err )
      resolve( stdout.endsWith( '\n' ) ? stdout.slice( 0, stdout.length - 1 ) : stdout )
    } )
  } )

export = yarn
