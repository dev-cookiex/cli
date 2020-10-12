import { URL } from 'url'

const isURL = ( string: string ) => {
  try {
    new URL( string )
    return true
  } catch { return false }
}

export = isURL
