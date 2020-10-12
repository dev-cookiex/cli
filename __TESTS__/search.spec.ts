import fs from 'fs'
import search from '../src/tools/search'

describe( 'unit test to search packages', () => {
  it( 'count number of package.json locates in node_module is same number folders ( without .bin )', async () => {
    const matches = await search.inModules( 'package.json' )

    expect( matches ).toMatchSnapshot( 'sought' )
  
    const notAllowedFile = [ '.bin', '.yarn-integrity' ]

    const modulesFolders = await fs.promises.readdir( 'node_modules' )
      .then( files => files.filter( file => !notAllowedFile.includes( file ) ) )
      .then( folders => folders.map<Promise<string | string[]>>( folder => {

        if ( folder.startsWith( '@' ) )
          return fs.promises.readdir( `node_modules/${folder}` )

        return Promise.resolve( folder )

      } ) )
      .then( promises => Promise.all( promises ) )
      .then( folders => folders.flat( 1 ) )

    expect( modulesFolders ).toMatchSnapshot( 'modules' )

    expect( matches.length ).toEqual( modulesFolders.length )
  } )
} )