import fs from 'fs'

const exists = ( path: fs.PathLike ) =>
  fs.promises.stat( path )
    .then( () => true )
    .catch( () => false )

export = exists
