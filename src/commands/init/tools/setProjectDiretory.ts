import { Error } from '@cookiex/cli-tools'
import fs from 'fs-extra'
import mkdirp from 'mkdirp'

import alreadyExistProjectDirectory from '../messages/alreadyExistProjectDiretory'

const setProjectDirectory = async ( directory: string ) => {
  const directoryExists = fs.existsSync( directory )
  if ( directoryExists ) {
    const replace = await alreadyExistProjectDirectory( directory )

    if ( !replace ) throw new Error( directory )

    fs.emptyDirSync( directory )
  }

  try {
    await mkdirp( directory )
    process.chdir( directory )
  } catch ( error ) {
    throw new Error( `Error occurred while trying to ${directoryExists ? 'replace' : 'create'} project directory.`, error )
  }

  return process.cwd()
}

export default setProjectDirectory
