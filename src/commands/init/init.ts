import Tools from '@cookiex/cli-tools'

import createProject from './tools/createProject'
import Init from './types'
import util from './utils'

const init: Init = ( [ projectName, projectDir ], ctx, options ) => {
  const caseNames = util.createCaseNames( projectName )
  const outputFolder = projectDir || caseNames[options['case']]
  Tools.logger.info( `Configuring new application in ${outputFolder}` )
  return createProject( caseNames, ctx, outputFolder, options )
}

export default init
