import cmdExists from 'command-exists'

const commandExists = ( command: string ) =>
  cmdExists( command )
    .then( () => true, () => false )

export = commandExists
