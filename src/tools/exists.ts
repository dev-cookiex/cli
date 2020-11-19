import fs from 'fs'

const exists = ( path: fs.PathLike ) =>
  fs.promises.stat( path )
    .then( () => true )
    .catch( () => false )

exists.multiples = ( ...paths: fs.PathLike[] ) =>
  Promise.all( paths.map( path => exists( path ) ) )
    .then( exists => exists.every( Boolean ) )

export = exists
