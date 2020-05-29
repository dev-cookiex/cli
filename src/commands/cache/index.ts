import { logger } from '@cookiex/cli-tools'
import { Command } from '@cookiex/cli-types'

import cacheManage from '../../tools/cacheManage'

const cache: Command<false> = {
  name: 'cache [command]',
  func: ( [ command ] ) => {
    switch ( command ) {
      case 'clear-local': {
        try {
          cacheManage.remove( process.cwd() )
          logger.sucess( 'local cache clear' )
        } catch ( e ) { logger.error( e ) }
        break
      }
      default: {
        logger.error( 'No command found' )
        process.exit( 1 )
      }
    }
  },
  description: 'Manage CookieX cache',
  options: []
}

export default cache
