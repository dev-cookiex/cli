import command from '../tools/command'
import commandExists from '../tools/commandExists'

const hasGitFlow = () =>
  commandExists( 'git' )
    .then( git => {
      if ( git )
        return command( 'git flow' )
          .then( stdout => !stdout.includes( 'git: \'flow\' is not a git command. See \'git --help\'.' ) )
          .catch( reason => {
            if ( reason.stdout )
              return !reason.stdout.includes( 'git: \'flow\' is not a git command. See \'git --help\'.' )

            return false
          } )
      return false
    } )

export = hasGitFlow
