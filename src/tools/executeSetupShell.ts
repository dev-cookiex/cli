import { logger } from '@cookiex/cli-tools'
import chalk from 'chalk'
import childProcess from 'child_process'
import fs from 'fs'
import path from 'path'

const executeSetupShell = () => {
  const scriptName = 'setup_env.sh'
  const absolutePath = path.join( __dirname, '..', '..', scriptName )

  try {
    if ( fs.existsSync( absolutePath ) )
      childProcess.execFileSync( absolutePath, { stdio: 'pipe' } )
  } catch ( error ) {
    logger.warn( `Failed to run environment setup script "${scriptName}"\n\n${chalk.red( error )}`, )
  }
}

export default executeSetupShell
