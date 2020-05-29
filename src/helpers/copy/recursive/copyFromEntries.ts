import fs from 'fs'
import path from 'path'

import Recursive from '.'

const copyFromEntries = ( output: string, entries: Recursive.Entries ) => {
  for ( let entry of entries ) {
    if ( 'content' in entry ) fs.writeFileSync( path.join( output, entry.base ), entry.content )
    else if ( 'copy' in entry ) entry.copy( output )
    else if ( 'dirname' in entry ) {
      const fullpath = path.join( output, entry.dirname )
      fs.mkdirSync( fullpath )
      copyFromEntries( fullpath, entry.entries )
    }
  }
}

export default copyFromEntries
