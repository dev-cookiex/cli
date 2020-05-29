import { Config } from '@cookiex/cli-types'

import cacheManage from '../../../tools/cacheManage'
import choiceTemplate from '../messages/templateChoices'
import Init from '../types'

const getTemplateName = async ( ctx: Config, options: Init.Options ): Promise<string> => {
  if ( options.template ) return options.template
  const templateInCache = cacheManage.get<string>( 'template' )
  if ( templateInCache ) return templateInCache
  return await choiceTemplate( ctx )
}

export default getTemplateName
