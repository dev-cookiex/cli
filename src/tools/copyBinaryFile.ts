import fs from 'fs-extra'

const copyBinaryFile = (
  srcPath: string,
  destPath: string
) => new Promise( ( resolve, reject ) => {
  const done = ( err?: Error ) => { err ? reject( err ) : resolve() }
  const srcPermissions = fs.statSync( srcPath ).mode
  const readStream = fs.createReadStream( srcPath )
  readStream.on( 'error', done )
  const writeStream = fs.createWriteStream( destPath, { mode: srcPermissions } )
  writeStream.on( 'error', done )
  writeStream.on( 'close', done )
  readStream.pipe( writeStream )
} )

export default copyBinaryFile
