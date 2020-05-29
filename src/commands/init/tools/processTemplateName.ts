import fs from 'fs-extra'
import path from 'path'

const FILE_PROTOCOL = '/^file:/'
const TARBAL = /\.tgz$/
const VERSION_POSTFIX = /(.*)(-\d+\.\d+\.\d+)/
const VERSIONED_PACKAGE = /(@?.+)(@)(.+)/

const processTemplateTarbal = ( filePath: string ) => {
  if ( !fs.existsSync( filePath ) )
    throw new Error( `Failed to retrieve tarball name. The specified tarball path "${filePath}" does not exist or is invalid.` )

  const nameWithVersion = path.parse( path.basename( filePath ) ).name
  const tarballVersionMatch = nameWithVersion.match( VERSION_POSTFIX )

  if ( !tarballVersionMatch )
    throw new Error( `Failed to retrieve tarball name. We expect the tarball to include package name and version, e.g.: "template-name-1.2.3-rc.0.tgz", but received: "${nameWithVersion}".` )

  return { uri: filePath, name: tarballVersionMatch[1] }
}

const processTemplatePackageVersioned = ( versionedPackage: string ) => {
  const versionedPackageMatch = versionedPackage.match( VERSIONED_PACKAGE )
  if ( !versionedPackageMatch ) {
    throw new Error( `Failed to retrieve package name. We expect the package to include name and version, e.g.: "template-name@1.2.3-rc.0", but received: "${versionedPackage}".`, )
  }
  return { uri: versionedPackage, name: versionedPackageMatch[1] }
}

const processTemplateFile = ( filePath: string ) => {
  let uri = new URL( filePath ).pathname
  if ( process.platform === 'win32' )
    uri = uri.substring( 1 )
  if ( !fs.existsSync( uri ) ) {
    throw new Error( `Failed to retrieve template name. The specified template directory path "${uri}" does not exist or is invalid.` )
  }
  const packageJsonPath = path.join( uri, 'package.json' )
  let packageJson
  try {
    packageJson = JSON.parse( fs.readFileSync( packageJsonPath, { encoding: 'utf8' } ) )
  } catch {
    throw new Error( 'Failed to retrieve template name. We expect the template directory to include "package.json" file, but it was not found.' )
  }

  if ( !packageJson || !packageJson.name )
    throw new Error( `Failed to retrieve template name. We expect the "package.json" of the template to include the "name" property, but we found "${packageJson ? packageJson.name : 'undefined'}" which is invalid.` )

  return { uri, name: packageJson.name }
}

const processTemplateName = ( templateName: string ) => {
  if ( templateName.match( TARBAL ) ) return processTemplateTarbal( templateName )
  if ( templateName.match( FILE_PROTOCOL ) ) { return processTemplateFile( templateName ) }
  if ( templateName.match( VERSIONED_PACKAGE ) ) { return processTemplatePackageVersioned( templateName ) }
  return { uri: templateName, name: templateName }
}

export default processTemplateName
