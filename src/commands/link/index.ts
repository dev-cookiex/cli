import { logger } from '@cookiex/cli-tools'
import { Command } from '@cookiex/cli-types'

import cacheManage from '../../tools/cacheManage'
import cosmicConfig from '../../tools/cosmicConfig'

const link: Command<false> = {
  name: 'link <module>',
  func: async ( [ moduleName ], _ctx, _options ) => {
    const moduleDirConfig = cosmicConfig
      .searchModuleDir( moduleName, { npm: true, yarn: true, noErrors: true, fileName: 'cookie.config.js' } )
    if ( !moduleDirConfig ) throw new Error( `No find ${moduleName} in globals` )
    cacheManage.set<string[]>( 'links', ( links = [] ) => links.concat( moduleDirConfig ) )
    logger.sucess( `Linked module ${moduleName} sucess` )
  },
  description: 'Cookie link cli extension'
}

export default link
