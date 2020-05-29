import { Error } from '@cookiex/cli-tools'
import { Config } from '@cookiex/cli-types'
import fs from 'fs-extra'
import ora from 'ora'
import os from 'os'
import path from 'path'

import cacheManage from '../../../tools/cacheManage'
import packageManager from '../../../tools/packageManager'
import Init from '../types'
import util from '../utils'
import createProjectFromTemplate from './createProjectFromTemplate'
import getTemplateName from './getTemplateName'
import processTemplateName from './processTemplateName'
import setProjectDirectory from './setProjectDiretory'
import { installTemplatePackage } from './template'

const createOra = <T>( message: string, promise: Promise<T> ): Promise<T> => new Promise<T>( ( resolve, reject ) => {
  const current = ora()
  current.start( message )
  promise.then( result => {
    current.succeed()
    resolve( result )
  } )['catch']( reason => {
    current.fail()
    reject( reason )
  } )
} )

const createProject = (
  caseNames: ReturnType<typeof util.createCaseNames>,
  ctx: Config,
  outputFolder: string,
  options: Init.Options
) => new Promise<void>( async ( resolve, reject ) => { // eslint-disable-line

  const projectDirectory = await setProjectDirectory( outputFolder )
  const templateName = await getTemplateName( ctx, options )
  const templateSourceDir = fs.mkdtempSync( path.join( os.tmpdir(), 'cookie-tmp-' ) )
  const templateInstalledPatch = path.join( templateSourceDir, 'node_modules', templateName )

  if ( options.saveDefault ) cacheManage.set( 'template', templateName )

  try {
    await createOra( `Install ${templateName}`, new Promise( ( resolve, reject ) => {
      const processedTemplate = processTemplateName( templateName )
      installTemplatePackage( processedTemplate.uri, templateSourceDir ).then( resolve )['catch']( reject )
    } ) )

    await createProjectFromTemplate( templateInstalledPatch, projectDirectory, caseNames )

    if ( options.install )
      await createOra(
        'Install Project Dependencies',
        packageManager.installAll( { preferYarn: true, root: projectDirectory, silent: true } )
      )

    resolve()
  } catch ( e ) { reject( new Error( e.message, e ) ) }
} )

export default createProject
