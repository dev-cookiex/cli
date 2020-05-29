import fs from 'fs-extra'
import path from 'path'

import copyBinaryFile from './copyBinaryFile'

const binaryExtensions = [ '.png',
  '.jar',
  '.keystore',
  '.jpg',
  '.zip',
  '.gif',
  'jpeg' ]

type ContentChangedCallbackOption = 'identical' | 'changed' | 'new' | null
type ContentChangedCallback = ( path: string, option: ContentChangedCallbackOption ) => 'keep' | 'overwrite'

const useBuffer = async ( srcPath: string, destPath: string, contentChangedCallback?: ContentChangedCallback ) => {
  let shouldOverwrite = 'overwrite'
  if ( contentChangedCallback ) {
    const newContentBuffer = await fs.promises.readFile( srcPath )
    let contentChanged: ContentChangedCallbackOption = 'identical'
    try {
      const origContentBuffer = await fs.promises.readFile( destPath )
      if ( Buffer.compare( origContentBuffer, newContentBuffer ) !== 0 ) contentChanged = 'changed'
    } catch ( err ) {
      if ( err.code === 'ENOENT' ) contentChanged = 'new' 
      else throw err
    }
    shouldOverwrite = contentChangedCallback( destPath, contentChanged )
  }
  if ( shouldOverwrite === 'overwrite' ) await copyBinaryFile( srcPath, destPath )
}

const useText = async ( srcPath: string, destPath: string, replacements: Record<string, string>, contentChangedCallback?: ContentChangedCallback ) => {
  const srcPermissions = fs.statSync( srcPath ).mode
  let content = fs.readFileSync( srcPath, 'utf8' )
  Object.entries( replacements ).forEach( ( [regex, replace] ) => content.replace( new RegExp( regex, 'g' ), replace ) )

  let shouldOverwrite = 'overwrite'
  if ( contentChangedCallback ) {
    let contentChanged: ContentChangedCallbackOption = 'identical'
    try {
      const origContent = fs.readFileSync( destPath, 'utf8' )
      if ( content !== origContent ) contentChanged = 'changed'
    } catch ( err ) {
      if ( err.code === 'ENOENT' ) contentChanged = 'new'
      else throw err
    }
    shouldOverwrite = contentChangedCallback( destPath, contentChanged )
  }
  if ( shouldOverwrite === 'overwrite' ) {
    fs.writeFileSync( destPath, content, {
      encoding: 'utf8',
      mode: srcPermissions
    } )
  }
}

const copyAndReplace = async ( srcPath: string, destPath: string, replacements: Record<string, string>, contentChangedCallback?: ContentChangedCallback ) => {
  if ( ( await fs.promises.lstat( srcPath ) ).isDirectory() )
    if ( !fs.existsSync( destPath ) ) return await fs.promises.mkdir( destPath )

  const ext = path.extname( srcPath )
  if ( binaryExtensions.includes( ext ) ) await useBuffer( srcPath, destPath, contentChangedCallback )
  else await useText( srcPath, destPath, replacements, contentChangedCallback )

  return undefined
}

export default copyAndReplace
