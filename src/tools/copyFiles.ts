import fs from 'fs'
import path from 'path'

import copyBinaryFile from './copyBinaryFile'
import walk from './walk'

type Options = { exclude?: Array<RegExp> }

const copyFiles = (
  srcPath: string,
  destPath: string,
  options: Options = {},
) => Promise.all(
  walk( srcPath ).map( async ( absoluteSrcFilePath: string ) => {
    const exclude = options.exclude
    if ( exclude && exclude.some( p => p.test( absoluteSrcFilePath ) ) ) return
    const relativeFilePath = path.relative( srcPath, absoluteSrcFilePath )
    await copyFile(
      absoluteSrcFilePath,
      path.resolve( destPath, relativeFilePath ),
    )
  } )
)

const copyFile = async ( srcPath: string, destPath: string ) => {
  if ( ( await fs.promises.lstat( srcPath ) ).isDirectory() )
    if ( !fs.existsSync( destPath ) ) return await fs.promises.mkdir( destPath )

  return copyBinaryFile( srcPath, destPath ) 
}

export default copyFiles
